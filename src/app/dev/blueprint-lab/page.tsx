import { CanvasStoreProvider } from "@/canvas/store";
import { BlueprintLabContent } from "./BlueprintLabContent";

/**
 * Dev-only scratch harness — not linked from any nav, reached by typing the
 * URL directly. Lets you draw an arbitrary graph on a real Canvas and test a
 * hand-authored Blueprint's `require`/`forbid` GraphPattern JSON against it
 * live, with live rule-registry violations alongside — so blueprint/pattern
 * authoring can be iterated on before a chapter (and its curriculum
 * content) exists to hang it off of. See src/content/chapters/types.ts's
 * Blueprint type and src/validation-engine/pattern.ts's GraphPattern DSL.
 */
export default function BlueprintLabPage() {
  return (
    <CanvasStoreProvider>
      <BlueprintLabContent />
    </CanvasStoreProvider>
  );
}
