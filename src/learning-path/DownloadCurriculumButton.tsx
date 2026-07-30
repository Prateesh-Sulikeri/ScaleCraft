import { Download } from "lucide-react";

/** Plain `<a download>` — no JS. The file already exists at
 *  public/docs/The_Crafters_Guide_to_System_Design.pdf (decision D3), so
 *  there's no absent-file handling to build. Styled as the standard neutral
 *  button (DESIGN.md §5), same as every other icon+label control. */
export function DownloadCurriculumButton() {
  return (
    <a
      href="/docs/The_Crafters_Guide_to_System_Design.pdf"
      download
      className="flex items-center gap-1.5 rounded-md border border-border bg-panel px-3 py-1.5 text-sm font-medium text-foreground/70 hover:text-foreground"
    >
      <Download size={14} />
      Download Curriculum
    </a>
  );
}
