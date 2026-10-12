import { BookOpen, Boxes, XCircle, type LucideIcon } from "lucide-react";

type Step = { Icon: LucideIcon; title: string; body: string };

const STEPS: readonly Step[] = [
  {
    Icon: BookOpen,
    title: "Learn the concept",
    body: "A short lesson on one building block: what it does, when it fails, and what it costs.",
  },
  {
    Icon: Boxes,
    title: "Build it on the canvas",
    body: "Drag real components onto the board and wire the request path yourself.",
  },
  {
    Icon: XCircle,
    title: "Validate and read why",
    body: "Every failed check explains the architectural reason, so you fix the design, not a guess.",
  },
];

/** Shown to everyone, under the stats row. Numbered because it is a real
 *  sequence: the loop every chapter runs. */
export function HowItWorks() {
  return (
    <section className="rounded-lg border border-border bg-panel">
      <h2 className="border-b border-border px-5 py-3 text-sm font-semibold">How a chapter works</h2>
      <ol className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
        {STEPS.map(({ Icon, title, body }, i) => (
          <li key={title} className="flex flex-col gap-2.5 px-5 py-5">
            <div className="flex items-center gap-2.5">
              <span className="font-mono text-xs text-hero-accent">0{i + 1}</span>
              <Icon size={16} strokeWidth={1.75} className="text-foreground/50" aria-hidden="true" />
            </div>
            <h3 className="text-[15px] font-semibold tracking-tight">{title}</h3>
            <p className="max-w-[36ch] text-sm leading-relaxed text-foreground/65">{body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
