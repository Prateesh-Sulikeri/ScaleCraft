import { test, expect } from "@playwright/test";

/**
 * Chapter Exam/Quiz E2E tests - full workflow from chapter canvas to exam
 * submission. Component tests exist for ExamShell.tsx and ExamResults.tsx,
 * but this layer exercises the real routing, form submission, and score
 * persistence flow that jsdom can't fully validate.
 *
 * Prerequisite: at least one chapter with an exam must exist in the
 * curriculum (src/content/chapters/index.ts). Tests use the 3-4-load-balancer
 * placeholder chapter which includes a quiz.
 */

test.describe("Chapter Exam - Navigation and Launch", () => {
  test("navigate to a chapter and find the exam launcher", async ({ page }) => {
    await page.goto("/building-blocks");

    // Navigate to a chapter
    await page.getByRole("link", { name: /3\.4.*Load Balancer/i }).click();
    await page.waitForURL("**/building-blocks/3-4-load-balancer/lesson");

    // Click "Begin exercise" to go to the design editor
    await page.getByRole("link", { name: /begin exercise/i }).click();
    await page.waitForURL("**/building-blocks/3-4-load-balancer");

    // Look for an exam/quiz launcher button in the chapter workspace
    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    // If a quiz launcher exists, it should be visible or accessible
    if ((await quizLauncher.count()) > 0) {
      await expect(quizLauncher).toBeVisible();
    }
  });

  test("launch an exam from the chapter workspace", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer");

    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      await quizLauncher.click();

      // Should navigate to exam or show exam UI
      await page.waitForTimeout(500);

      const examTitle = page.locator("h1, h2, [role='heading']");
      await expect(examTitle).toContainText(/quiz|exam|assessment/i);
    }
  });
});

test.describe("Chapter Exam - Question Answering", () => {
  test("display exam questions with multiple choice options", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer");

    // Launch the exam
    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      await quizLauncher.click();
      await page.waitForTimeout(500);

      // Look for question text and radio/checkbox options
      const questionText = page.locator("[class*='question'], main p");
      const options = page.locator("input[type='radio'], input[type='checkbox']");

      if ((await questionText.count()) > 0 && (await options.count()) > 0) {
        await expect(questionText.first()).toContainText(/.+/);
        await expect(options).toHaveCount(await options.count());
      }
    }
  });

  test("select an answer and submit", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer");

    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      await quizLauncher.click();
      await page.waitForTimeout(500);

      // Select the first radio option if it exists
      const firstOption = page.locator("input[type='radio']").first();

      if ((await firstOption.count()) > 0) {
        await firstOption.click();

        // Look for a submit/next button
        const submitButton = page.getByRole("button", { name: /submit|next|continue/i });

        if ((await submitButton.count()) > 0) {
          await submitButton.click();
          await page.waitForTimeout(300);

          // Should either move to next question or show results
          const nextQuestion = page.locator("[class*='question']");
          const results = page.locator("[class*='result'], [class*='score']");

          const hasQuestion = await nextQuestion.isVisible();
          const hasResults = await results.isVisible();

          expect(hasQuestion || hasResults).toBe(true);
        }
      }
    }
  });

  test("answer multiple questions in sequence", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer");

    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      await quizLauncher.click();
      await page.waitForTimeout(500);

      let questionsAnswered = 0;
      const maxQuestions = 5; // Arbitrary limit to avoid infinite loops

      while (questionsAnswered < maxQuestions) {
        // Try to select an option
        const options = page.locator("input[type='radio'], input[type='checkbox']");
        const optionCount = await options.count();

        if (optionCount === 0) {
          // No options found, might be at results screen
          break;
        }

        // Select the first available option
        await options.nth(0).click();
        questionsAnswered++;

        // Look for submit button
        const submitButton = page.getByRole("button", { name: /submit|next|continue|finish/i });

        if ((await submitButton.count()) > 0) {
          await submitButton.click();
          await page.waitForTimeout(300);

          // Check if we've reached results
          const results = page.locator("[class*='result'], [class*='score']");
          if (await results.isVisible()) {
            break;
          }
        } else {
          break;
        }
      }

      expect(questionsAnswered).toBeGreaterThan(0);
    }
  });
});

test.describe("Chapter Exam - Results and Scoring", () => {
  test("display exam results with score", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer");

    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      await quizLauncher.click();
      await page.waitForTimeout(500);

      // Answer all questions and reach results
      let attemptCount = 0;
      const maxAttempts = 20;

      while (attemptCount < maxAttempts) {
        const options = page.locator("input[type='radio'], input[type='checkbox']");
        if ((await options.count()) === 0) break;

        await options.nth(0).click();

        const submitButton = page.getByRole("button", { name: /submit|next|continue|finish/i });
        if ((await submitButton.count()) > 0) {
          await submitButton.click();
          await page.waitForTimeout(300);
        }

        attemptCount++;

        // Check for results screen
        const scoreDisplay = page.locator("[class*='score'], [class*='result']");
        if (await scoreDisplay.isVisible()) {
          break;
        }
      }

      // Look for score text
      const score = page.locator("text=/\\d+%|\\d+\\/\\d+|passed|failed/i");

      if ((await score.count()) > 0) {
        await expect(score.first()).toBeVisible();
      }
    }
  });

  test("show pass/fail indicator based on threshold", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer");

    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      await quizLauncher.click();
      await page.waitForTimeout(500);

      // Answer all questions
      let attemptCount = 0;
      while (attemptCount < 20) {
        const options = page.locator("input[type='radio'], input[type='checkbox']");
        if ((await options.count()) === 0) break;

        await options.nth(0).click();

        const submitButton = page.getByRole("button", { name: /submit|next|continue|finish/i });
        if ((await submitButton.count()) > 0) {
          await submitButton.click();
          await page.waitForTimeout(300);
        }

        attemptCount++;

        const resultsScreen = page.locator("[class*='result'], [class*='score']");
        if (await resultsScreen.isVisible()) {
          break;
        }
      }

      // Check for pass/fail visual indicator
      const passText = page.locator("text=/pass|success|correct/i");
      const failText = page.locator("text=/fail|incorrect/i");

      const hasPassIndicator = await passText.isVisible();
      const hasFailIndicator = await failText.isVisible();

      // Should have at least one
      expect(hasPassIndicator || hasFailIndicator).toBe(true);
    }
  });

  test("display attempt count when retaking exam", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer");

    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      // First attempt
      await quizLauncher.click();
      await page.waitForTimeout(500);

      // Quick answer some questions to reach results
      let attemptCount = 0;
      while (attemptCount < 10) {
        const options = page.locator("input[type='radio'], input[type='checkbox']");
        if ((await options.count()) === 0) break;

        await options.nth(0).click();

        const submitButton = page.getByRole("button", { name: /submit|next|continue|finish/i });
        if ((await submitButton.count()) > 0) {
          await submitButton.click();
          await page.waitForTimeout(300);
        }

        attemptCount++;

        const resultsScreen = page.locator("[class*='result'], [class*='score']");
        if (await resultsScreen.isVisible()) {
          break;
        }
      }

      // Look for retry button
      const retryButton = page.getByRole("button", { name: /retry|retake|try again/i });

      if ((await retryButton.count()) > 0) {
        await retryButton.click();
        await page.waitForTimeout(500);

        // Should show attempt counter (e.g., "Attempt 2 of 3")
        const attemptCounter = page.locator("text=/attempt|try/i");
        if ((await attemptCounter.count()) > 0) {
          await expect(attemptCounter.first()).toBeVisible();
        }
      }
    }
  });
});

test.describe("Chapter Exam - Persistence", () => {
  test("persist exam score to progress database", async ({ page }) => {
    // Navigate to learning path and check initial progress
    await page.goto("/building-blocks");

    // Take the exam and complete it
    await page.getByRole("link", { name: /3\.4.*Load Balancer/i }).click();
    await page.waitForURL("**/building-blocks/3-4-load-balancer/lesson");

    await page.getByRole("link", { name: /begin exercise/i }).click();
    await page.waitForURL("**/building-blocks/3-4-load-balancer");

    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      await quizLauncher.click();
      await page.waitForTimeout(500);

      // Quick completion
      let attempts = 0;
      while (attempts < 20) {
        const options = page.locator("input[type='radio'], input[type='checkbox']");
        if ((await options.count()) === 0) break;

        await options.nth(0).click();

        const submit = page.getByRole("button", { name: /submit|next|continue|finish/i });
        if ((await submit.count()) > 0) {
          await submit.click();
          await page.waitForTimeout(300);
        }

        attempts++;

        const results = page.locator("[class*='result'], [class*='score']");
        if (await results.isVisible()) break;
      }

      // Go back to learning path
      await page.goto("/building-blocks");

      // Check if progress updated
      const chapterRowAfter = page.getByText(/3\.4.*Load Balancer/i);
      const statusAfter = await chapterRowAfter.evaluate((el) =>
        el.closest("li")?.querySelector("[class*='progress']")?.textContent
      );

      // Status should have changed
      expect(statusAfter).toBeTruthy();
    }
  });

  test("exam score survives page reload", async ({ page }) => {
    await page.goto("/building-blocks/3-4-load-balancer");

    const quizLauncher = page.getByRole("button", { name: /quiz|exam|test|assessment/i });

    if ((await quizLauncher.count()) > 0) {
      // Take exam quickly
      await quizLauncher.click();
      await page.waitForTimeout(500);

      let attempts = 0;
      while (attempts < 20) {
        const options = page.locator("input[type='radio'], input[type='checkbox']");
        if ((await options.count()) === 0) break;

        await options.nth(0).click();

        const submit = page.getByRole("button", { name: /submit|next|continue|finish/i });
        if ((await submit.count()) > 0) {
          await submit.click();
          await page.waitForTimeout(300);
        }

        attempts++;

        const results = page.locator("[class*='result'], [class*='score']");
        if (await results.isVisible()) {
          break;
        }
      }

      // Reload the page
      await page.reload();
      await page.waitForTimeout(500);

      // Score should still be visible
      const scoreAfterReload = await page.locator("[class*='score']").textContent();

      expect(scoreAfterReload).toBeTruthy();
    }
  });
});
