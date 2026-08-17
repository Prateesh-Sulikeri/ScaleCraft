"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { BrandMark } from "@/app/BrandMark";
import { AboutModal } from "@/app/AboutModal";
import { FeedbackSurveyModal } from "./FeedbackSurveyModal";
import { HOME_CONTAINER } from "./layout";

type Dialog = "about" | "feedback" | null;

const FOOTER_LINK_CLASS =
  "text-xs text-foreground/55 transition-colors duration-150 ease-out hover:text-foreground";

/**
 * Understated by design - Home is a product surface, so the footer carries
 * ownership and two dialogs, not a sitemap. ScaleDocs is declared upcoming
 * here the same way it is in the header (see links.ts) rather than linking
 * somewhere that does not exist.
 */
export function HomeFooter() {
  const [dialog, setDialog] = useState<Dialog>(null);
  const year = 2026;

  return (
    <footer className="border-t border-border">
      <div className={`${HOME_CONTAINER} flex flex-wrap items-center justify-between gap-x-8 gap-y-4 py-4`}>
        <div className="flex items-center gap-2.5">
          <BrandMark size={18} className="opacity-60" />
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-foreground/80">ScaleCraft</span>
            <span className="text-[11px] text-foreground/40">© {year} ScaleCraft. All rights reserved.</span>
          </div>
        </div>

        <nav aria-label="Footer" className="flex items-center gap-5">
          <button type="button" onClick={() => setDialog("about")} className={FOOTER_LINK_CLASS}>
            About
          </button>
          <span aria-disabled="true" className="flex cursor-default items-center gap-1.5 text-xs text-foreground/30">
            ScaleDocs
            <span className="rounded-sm border border-border px-1 py-px text-[9px] font-semibold uppercase tracking-wide text-foreground/40">
              Soon
            </span>
          </span>
          <button type="button" onClick={() => setDialog("feedback")} className={FOOTER_LINK_CLASS}>
            Feedback
          </button>
        </nav>

        <p className="flex items-center gap-1.5 text-xs text-foreground/45">
          Made with
          {/* Accent blue heart - same blue as the hero section. */}
          <Heart size={12} fill="currentColor" role="img" aria-label="love" className="text-hero-accent" />
          by Prateesh
        </p>
      </div>

      {dialog === "about" && <AboutModal onClose={() => setDialog(null)} />}
      {dialog === "feedback" && <FeedbackSurveyModal onClose={() => setDialog(null)} />}
    </footer>
  );
}
