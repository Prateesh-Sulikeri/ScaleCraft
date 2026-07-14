import Image from "next/image";

const NODE_WIDTH = 420;

/**
 * The ScaleCraft mark + "Choose a mode" heading, as an actual node in
 * HomeCanvas's node list — not an HTML overlay positioned independently of
 * it. Rendering it outside the canvas's own node layout put it and the mode
 * nodes at two unrelated coordinates (fitView only knows about node bounds),
 * which is what produced a heading stranded near the top with a dead gap
 * before the cards. As a node, it's part of the same bounding box fitView
 * centers, so heading and cards move and center together as one
 * composition — the same relationship Clapet's reference layout has between
 * its "Welcome to..." heading and the option cards below it.
 */
export function HomeTitleNode() {
  return (
    <div style={{ width: NODE_WIDTH }} className="flex flex-col items-center gap-3">
      <div className="flex items-center gap-3">
        <Image src="/logo-mark.png" alt="" width={44} height={44} className="rounded-lg" priority />
        <span className="text-5xl font-semibold tracking-tight">ScaleCraft</span>
      </div>
      <h2 className="text-md text-foreground/60">Choose a mode</h2>
    </div>
  );
}

export { NODE_WIDTH as HOME_TITLE_NODE_WIDTH };
