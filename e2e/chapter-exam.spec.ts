import { test, expect } from "@playwright/test";
import { resetExamAttempts, CHAPTER_SLUG, CHAPTER_QUIZ_QUESTIONS } from "./helpers";

/**
 * One full exam run: launch from the lesson, answer every question, submit,
 * read the score, and confirm the attempt is still there after a reload.
 *
 * Question navigation, the Skip/Next wording, the disabled Back, the confirm
 * dialog and the results layout all have component tests (ExamShell,
 * ExamQuestionBody, ExamConfirmSubmitDialog, ExamResults, exam-attempt). The
 * one thing they can't reach is the attempt surviving a real page load.
 */

test("an exam attempt is scored, recorded, and survives a reload", async ({ page }) => {
  await resetExamAttempts(page);

  await page.goto(`/building-blocks/${CHAPTER_SLUG}/lesson`);
  await page.getByRole("button", { name: /^(Take|Retake) the quiz$/ }).click();

  const exam = page.getByRole("dialog", { name: "Load Balancer exam" });
  await expect(exam).toBeVisible();

  // First option every time, so the run reaches results deterministically.
  // Score is whatever that earns - this asserts the flow and the readout, not
  // a particular mark.
  for (let i = 0; i < CHAPTER_QUIZ_QUESTIONS; i++) {
    await expect(exam.getByText(`Question ${i + 1} of ${CHAPTER_QUIZ_QUESTIONS}`)).toBeVisible();
    await exam.getByRole("radio").first().check();
    if (i < CHAPTER_QUIZ_QUESTIONS - 1) {
      await exam.getByRole("button", { name: "Next" }).click();
    }
  }

  await exam.getByRole("button", { name: "Submit exam" }).click();

  const results = page.getByRole("dialog", { name: "Load Balancer exam results" });
  await expect(results).toBeVisible();
  await expect(results.getByText(/^\d+%$/)).toBeVisible();
  await expect(results).toContainText(/80% required/);

  await results.getByRole("button", { name: "Return to lesson" }).click();

  // YourTurnCard reports either "Passed · N%" or "Attempt N · Best score N%"
  // once an attempt exists.
  const attemptReadout = page.getByText(/Passed · \d+%|Attempt \d+ · Best score \d+%/);
  await expect(attemptReadout).toBeVisible();

  await page.reload();
  await expect(attemptReadout).toBeVisible();
});
