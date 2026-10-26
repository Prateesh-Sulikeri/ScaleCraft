// Runs before hydration. Dev-only: `crypto.randomUUID` is missing on
// non-secure origins (a tablet hitting the dev server at http://<LAN IP>),
// which breaks every canvas edit. Rebuild it from `getRandomValues`, which
// insecure origins do have. Production is always HTTPS and never patched.
if (process.env.NODE_ENV === "development" && typeof crypto !== "undefined" && !crypto.randomUUID) {
  crypto.randomUUID = () => {
    const b = crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; // version 4
    b[8] = (b[8] & 0x3f) | 0x80; // RFC 4122 variant
    const h = Array.from(b, (x) => x.toString(16).padStart(2, "0")).join("");
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}` as `${string}-${string}-${string}-${string}-${string}`;
  };
}
