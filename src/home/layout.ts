/**
 * The shared measure for Home's header, main content, and footer - they have
 * to agree, or the nav and the footer visibly fail to line up with the cards
 * between them.
 *
 * The cap steps up only on genuinely large displays, not merely wide ones: at
 * 2560px a fixed 1400px column reads as a small panel floating in the middle
 * of the screen, but at 1920px that same 1400px measure is right and a wider
 * one leaves the content nearly edge to edge. So the first step-up sits well
 * past 1080p rather than at Tailwind's 2xl (1536px), which a 1920px window
 * would have crossed. Same call the Chapter Reader already made for its prose
 * column in 6.1.1-alpha; 1080p and below are unchanged.
 */
export const HOME_CONTAINER =
  "mx-auto w-full max-w-[1400px] min-[2200px]:max-w-[1600px] min-[2560px]:max-w-[1760px] px-6";
