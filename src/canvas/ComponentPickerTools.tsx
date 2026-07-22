"use client";

export type ToolAction = {
  id: string;
  label: string;
  description: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
};

/**
 * The picker's trailing "Decoration" group — replaces the old palette
 * toolbar's four buttons (Add zone / Add comment / Add flag / New
 * component) with keyboard-reachable grid tiles, styled to match the rest
 * of the picker's grid. Extracted from ComponentPicker.tsx to keep that
 * file's responsibility to search/keyboard-nav orchestration; the action
 * definitions themselves (which close over store setters) stay in
 * ComponentPicker.tsx and are passed down as plain data.
 */
export function ComponentPickerTools({
  tools,
  activeIndex,
  baseIndex,
  onActivate,
  onSelectTool,
  registerRef,
}: {
  tools: ToolAction[];
  activeIndex: number;
  /** flatComponentItems.length — tools occupy the index range starting here
   * in the picker's single flat keyboard-nav array. */
  baseIndex: number;
  onActivate: (index: number) => void;
  onSelectTool: (id: string) => void;
  registerRef: (id: string, el: HTMLDivElement | null) => void;
}) {
  if (tools.length === 0) return null;

  return (
    <div>
      <h3 className="px-0.5 text-[11px] font-semibold uppercase tracking-wide text-foreground/70">Decoration</h3>
      <div className="mt-2 grid grid-cols-[repeat(auto-fill,minmax(64px,1fr))] gap-3">
        {tools.map((tool, i) => {
          const Icon = tool.icon;
          const index = baseIndex + i;
          const active = index === activeIndex;
          return (
            <div
              key={tool.id}
              id={`picker-item-${tool.id}`}
              ref={(el) => registerRef(tool.id, el)}
              role="option"
              aria-selected={active}
              aria-label={`${tool.label}: ${tool.description}`}
              onMouseEnter={() => onActivate(index)}
              onClick={() => onSelectTool(tool.id)}
              className="flex cursor-pointer flex-col items-center gap-1 rounded-md p-1.5"
            >
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-lg border-2 border-border text-foreground/70 ${
                  active ? "ring-2 ring-foreground/40" : ""
                }`}
              >
                <Icon size={20} />
              </div>
              <span className="w-16 text-center text-[11px] leading-tight text-foreground/70">{tool.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
