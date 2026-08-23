import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { GET, POST } from "./route";
import { FEEDBACK_QUESTIONS, FEEDBACK_WRITTEN_FIELDS, MAX_IMAGE_BYTES_TOTAL } from "@/home/feedback";

const payload = {
  answers: { [FEEDBACK_QUESTIONS[0].id]: FEEDBACK_QUESTIONS[0].options[0] },
  written: { [FEEDBACK_WRITTEN_FIELDS[0].id]: "The canvas felt great." },
  replyTo: "",
  context: { version: "7.1.0-alpha", page: "/", viewport: "1512x950", browser: "TestBrowser/1.0" },
};

/** Each test gets its own IP so the module-level rate-limit window, which is
 *  deliberately shared across requests, does not leak between them. */
let nextIp = 0;

/**
 * The route only ever reads `formData()` and one header, so it is handed those
 * directly rather than a serialized multipart body. That is deliberate: under
 * jsdom the global `File` is jsdom's and `Request` is undici's, so a real
 * round trip drops filenames and sizes - it would be testing the mismatch, not
 * the route. "parses a real multipart request" below covers the genuine path.
 */
function request(body: FormData, ip = `10.0.0.${++nextIp}`): Request {
  return {
    headers: new Headers({ "x-forwarded-for": ip }),
    formData: async () => body,
  } as unknown as Request;
}

function form(overrides: { payload?: unknown; images?: File[] } = {}): FormData {
  const data = new FormData();
  data.append("payload", JSON.stringify(overrides.payload ?? payload));
  for (const image of overrides.images ?? []) data.append("image", image, image.name);
  return data;
}

function image(name: string, type = "image/png"): File {
  return new File(["x"], name, { type });
}

function configure() {
  vi.stubEnv("BREVO_API_KEY", "xkeysib-test");
  vi.stubEnv("BREVO_SENDER_EMAIL", "noreply@scalecraft.test");
  vi.stubEnv("BREVO_SENDER_NAME", "ScaleCraft Feedback");
  vi.stubEnv("FEEDBACK_RECIPIENT_EMAIL", "author@scalecraft.test");
}

beforeEach(() => {
  vi.stubEnv("BREVO_API_KEY", "");
  vi.stubEnv("BREVO_SENDER_EMAIL", "");
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
});

describe("GET", () => {
  it("reports whether Brevo credentials are present", async () => {
    await expect((await GET()).json()).resolves.toEqual({ configured: false });
    configure();
    await expect((await GET()).json()).resolves.toEqual({ configured: true });
  });

  it("treats a key without a verified sender as unconfigured", async () => {
    vi.stubEnv("BREVO_API_KEY", "xkeysib-test");
    await expect((await GET()).json()).resolves.toEqual({ configured: false });
  });
});

describe("POST", () => {
  it("answers 501 without credentials, so the client can use the mail fallback", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const res = await POST(request(form()));
    expect(res.status).toBe(501);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("sends the survey to Brevo with the configured sender and recipient", async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 201 }));

    const res = await POST(request(form({ payload: { ...payload, replyTo: "visitor@example.com" } })));
    expect(res.status).toBe(200);

    const [url, init] = fetchSpy.mock.calls[0];
    expect(String(url)).toBe("https://api.brevo.com/v3/smtp/email");
    expect((init?.headers as Record<string, string>)["api-key"]).toBe("xkeysib-test");

    const sent = JSON.parse(String(init?.body));
    expect(sent.sender).toEqual({ name: "ScaleCraft Feedback", email: "noreply@scalecraft.test" });
    expect(sent.to).toEqual([{ email: "author@scalecraft.test" }]);
    expect(sent.replyTo).toEqual({ email: "visitor@example.com" });
    expect(sent.subject).toContain("7.1.0-alpha");
    expect(sent.textContent).toContain("The canvas felt great.");
    // Absent, not empty: Brevo answers 400 "attachment is missing" to an
    // empty array rather than reading it as "no attachments".
    expect("attachment" in sent).toBe(false);
  });

  it("omits replyTo when the address is blank or malformed, rather than failing the send", async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 201 }));

    await POST(request(form()));
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body)).replyTo).toBeUndefined();

    await POST(request(form({ payload: { ...payload, replyTo: "not an address" } })));
    expect(JSON.parse(String(fetchSpy.mock.calls[1][1]?.body)).replyTo).toBeUndefined();
  });

  it("base64-encodes screenshots as Brevo attachments", async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 201 }));

    await POST(request(form({ images: [new File(["hello"], "shot.png", { type: "image/png" })] })));

    const sent = JSON.parse(String(fetchSpy.mock.calls[0][1]?.body));
    expect(sent.attachment).toEqual([{ name: "shot.png", content: Buffer.from("hello").toString("base64") }]);
    expect(sent.textContent).toContain("Screenshots: 1");
  });

  it("rejects a malformed payload before calling Brevo", async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, "fetch");

    expect((await POST(request(form({ payload: { answers: {} } })))).status).toBe(400);
    expect((await POST(request(form({ payload: "not an object" })))).status).toBe(400);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("enforces the attachment limits itself, not just in the browser", async () => {
    configure();
    // Rejects rather than resolves: a limit that leaks through should fail the
    // test loudly instead of reaching the real Brevo endpoint.
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockRejectedValue(new Error("Brevo must not be called"));

    const tooMany = [image("a.png"), image("b.png"), image("c.png"), image("d.png")];
    expect((await POST(request(form({ images: tooMany })))).status).toBe(400);

    // A real oversized buffer, not a faked `size` - appending to FormData
    // re-wraps the file and would drop the fake.
    const huge = new File([new Uint8Array(MAX_IMAGE_BYTES_TOTAL + 1)], "huge.png", { type: "image/png" });
    expect((await POST(request(form({ images: [huge] })))).status).toBe(400);

    const notAnImage = new File(["x"], "notes.txt", { type: "text/plain" });
    expect((await POST(request(form({ images: [notAnImage] })))).status).toBe(400);

    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("rate-limits a single client without blocking everyone else", async () => {
    configure();
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 201 }));
    const noisy = "203.0.113.9";

    for (let i = 0; i < 3; i++) {
      expect((await POST(request(form(), noisy))).status).toBe(200);
    }
    expect((await POST(request(form(), noisy))).status).toBe(429);
    expect((await POST(request(form(), "203.0.113.10"))).status).toBe(200);
  });

  it("parses a real multipart request, and rejects a body that is not one", async () => {
    configure();
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 201 }));

    const real = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "x-forwarded-for": "198.51.100.4" },
      body: form(),
    });
    expect((await POST(real)).status).toBe(200);
    expect(JSON.parse(String(fetchSpy.mock.calls[0][1]?.body)).textContent).toContain("The canvas felt great.");

    const notMultipart = new Request("http://localhost/api/feedback", {
      method: "POST",
      headers: { "x-forwarded-for": "198.51.100.5", "content-type": "application/json" },
      body: "{}",
    });
    expect((await POST(notMultipart)).status).toBe(400);
  });

  it("returns a flat 502 on a Brevo failure without leaking its reason", async () => {
    configure();
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      new Response(JSON.stringify({ message: "sender not verified" }), { status: 400 }),
    );

    const res = await POST(request(form()));
    expect(res.status).toBe(502);
    await expect(res.json()).resolves.toEqual({ error: "Could not send feedback" });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("sender not verified"));
  });
});
