import { clerk, clerkSetup } from "@clerk/testing/playwright";
import { createClerkClient } from "@clerk/backend";
import { test as setup } from "@playwright/test";
import path from "path";

// Project-based setup (not defineConfig's globalSetup) so env vars from
// clerkSetup() propagate to test workers - see clerk-testing skill.
setup.describe.configure({ mode: "serial" });

const authFile = path.join(__dirname, ".auth/user.json");

setup("global setup", async () => {
  await clerkSetup();

  const email = process.env.E2E_CLERK_USER_EMAIL;
  const password = process.env.E2E_CLERK_USER_PASSWORD;
  if (!email || !password) {
    throw new Error(
      "Please provide E2E_CLERK_USER_EMAIL and E2E_CLERK_USER_PASSWORD environment variables.",
    );
  }

  const client = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY! });
  const { data: users } = await client.users.getUserList({ emailAddress: [email] });

  if (users.length === 0) {
    await client.users.createUser({
      emailAddress: [email],
      password,
      firstName: "E2E",
      lastName: "Test",
      skipPasswordChecks: true,
    });
  } else {
    await client.users.updateUser(users[0].id, { password, skipPasswordChecks: true });
  }
});

setup("authenticate", async ({ page }) => {
  // clerk.signIn() drives the Clerk JS SDK directly (not the rendered form),
  // so it doesn't trigger the app's own post-auth navigation - go to a
  // protected route afterward and confirm it doesn't bounce back to sign-in.
  await page.goto("/sign-in");
  await clerk.signIn({
    page,
    signInParams: {
      strategy: "password",
      identifier: process.env.E2E_CLERK_USER_EMAIL!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  });
  await page.goto("/");
  await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"));

  await page.context().storageState({ path: authFile });
});
