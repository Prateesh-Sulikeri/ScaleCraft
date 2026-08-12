import { clerkMiddleware } from "@clerk/nextjs/server";

// Establishes Clerk's auth context per request; route-level gating now
// lives in src/app/(protected)/layout.tsx (auth.protect() per Clerk's
// resource-based auth guidance, replacing the deprecated
// createRouteMatcher middleware pattern).
export default clerkMiddleware();

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
    "/__clerk/:path*",
  ],
};
