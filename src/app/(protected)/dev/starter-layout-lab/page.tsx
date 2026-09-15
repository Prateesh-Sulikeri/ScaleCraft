import { CanvasStoreProvider } from "@/canvas/store";
import { StarterLayoutLabContent } from "./StarterLayoutLabContent";

/**
 * Dev-only scratch harness - not linked from any nav, reached by typing the
 * URL directly. Loads a chapter's authored `starterGraph` straight onto a real
 * editable Canvas.
 *
 * Why this exists rather than opening the chapter: a learner's *save* shadows
 * `starterGraph`, and clearing local IndexedDB doesn't help because cloud sync
 * re-pulls it. So the real chapter route keeps rendering the old layout after
 * the content changes, which makes it useless for verifying a re-layout.
 * `?chapter=<id>` picks the chapter.
 */
export default function StarterLayoutLabPage() {
  return (
    <CanvasStoreProvider>
      <StarterLayoutLabContent />
    </CanvasStoreProvider>
  );
}
