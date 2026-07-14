import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next's own dev-mode route/bundler badge (bottom-left) — not a
  // ScaleCraft UI element, and it already disappears in production, but
  // it's confusable with a real app affordance during dev. Revisit once
  // there's an actual settings/user menu to put in that corner.
  devIndicators: false,
};

export default nextConfig;
