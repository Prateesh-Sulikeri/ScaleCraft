import { getComponent } from "@/content/components/registry";
import type { ArchitectureGraph } from "@/lib/graph";

/** A lightweight textual shape summary, not a full canvas render — reusing
 * React Flow here would drag in a heavy dependency tree for what's always a
 * read-only aside (Debrief's reference graphs, quiz diagram questions).
 * Component labels for each edge, since raw componentIds aren't the
 * vocabulary a learner reads elsewhere in the app. Shared by Debrief.tsx and
 * chapters/quiz/DiagramQuestion.tsx — do not fork a second copy. */
export function ReadOnlyGraphSummary({ graph }: { graph: ArchitectureGraph }) {
  const labelFor = (nodeId: string) => {
    const node = graph.nodes.find((n) => n.id === nodeId);
    if (!node) return nodeId;
    return getComponent(node.componentId)?.label ?? node.componentId;
  };

  return (
    <div className="rounded-md bg-background/60 p-2 text-xs text-foreground/70">
      {graph.edges.length > 0 ? (
        <ul className="flex flex-col gap-0.5">
          {graph.edges.map((e) => (
            <li key={e.id}>
              {labelFor(e.source)} → {labelFor(e.target)}
            </li>
          ))}
        </ul>
      ) : (
        <p>{graph.nodes.map((n) => labelFor(n.id)).join(", ")}</p>
      )}
    </div>
  );
}
