import { Monitor, Shuffle, Server, Database, type LucideIcon } from "lucide-react";

/** Keyed by ComponentDefinition.icon — shared between ComponentNode and Palette so
 * both render the same glyph per component. */
export const iconMap: Record<string, LucideIcon> = {
  monitor: Monitor,
  shuffle: Shuffle,
  server: Server,
  database: Database,
};
