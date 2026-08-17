/**
 * The shared measure for the Learning Path's header strip, header card, and
 * the curriculum/sidebar row below them - they have to agree or the back link
 * visibly fails to line up with the cards under it.
 *
 * Narrower than Home's 1400px (src/home/layout.ts): this page's main column is
 * a list of one-line chapter rows, and at 1400px a row's title and its trailing
 * arrow end up an inch apart with nothing between them.
 */
export const LEARNING_PATH_CONTAINER = "mx-auto w-full max-w-[1200px] min-[2200px]:max-w-[1360px] px-6";
