import { getComponent } from "@/content/components/registry";
import type { AnyNodeType, ComponentNodeType } from "./types";

/**
 * Resolves a display name per component node — used anywhere a list of
 * component nodes needs to be human-distinguishable (currently: the Start
 * marker's target picker). A custom instance name (see ComponentNodeData)
 * always wins; failing that, nodes sharing a componentId with more than one
 * instance on the canvas get an ordinal suffix ("App Server #2") so a
 * dropdown of five Clients isn't five identical "Client" rows. Order is
 * array order (creation order), not alphabetical — stable across renders
 * since `nodes` itself doesn't get reordered by unrelated edits.
 */
export function componentDisplayNames(nodes: AnyNodeType[]): Map<string, string> {
  const componentNodes = nodes.filter((n): n is ComponentNodeType => n.type === "component");

  const countByType = new Map<string, number>();
  for (const n of componentNodes) {
    countByType.set(n.data.componentId, (countByType.get(n.data.componentId) ?? 0) + 1);
  }

  const seenByType = new Map<string, number>();
  const result = new Map<string, string>();
  for (const n of componentNodes) {
    const definition = getComponent(n.data.componentId);
    const base = definition?.label ?? n.data.componentId;
    const customName = n.data.name?.trim();
    if (customName) {
      result.set(n.id, `${base} — ${customName}`);
      continue;
    }
    if ((countByType.get(n.data.componentId) ?? 0) > 1) {
      const ordinal = (seenByType.get(n.data.componentId) ?? 0) + 1;
      seenByType.set(n.data.componentId, ordinal);
      result.set(n.id, `${base} #${ordinal}`);
      continue;
    }
    result.set(n.id, base);
  }
  return result;
}
