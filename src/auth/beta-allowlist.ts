/**
 * Closed-beta gating: sign-in should only succeed for explicitly invited
 * emails. Not yet wired to a real Clerk webhook/middleware — see README.md
 * in this folder. Kept as a stub table so the intended shape is explicit.
 */
export const BETA_ALLOWLIST: string[] = [
  // "you@example.com",
];

export function isAllowedForBeta(email: string): boolean {
  return BETA_ALLOWLIST.includes(email.toLowerCase());
}
