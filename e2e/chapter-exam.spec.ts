import { test, expect, type Locator, type Page } from "@playwright/test";
import { resetExamAttempts, CHAPTER_SLUG, CHAPTER_QUIZ_QUESTIONS } from "./helpers";

/**
 * Chapter exam E2E - launching the quiz, answering, submitting, and reading
 * the score back. Component tests cover ExamShell/ExamResults in isolation;
 * this layer exercises the real launch path and the attempt persistence
 * behind it.
 *
 * Every test in the previous version of this file hung off
 * `getByRole("button", { name: /quiz|exam|test|assessment/i })` looked up on
 * the *workspace* route, guarded by `if (count > 0)`. The launcher lives on
 * the lesson page (ChapterReader renders YourTurnCard), so that locator never
 * matched and not one assertion in the file ever ran.
 */

/** Opens the exam from the lesson page and returns its dialog. */
async function openExam(page: Page): Promise<Locator> {
  await page.goto(`/building-blocks/${CHAPTER_SLUG}/lesson`);
  await page.getByRole("button", { name: /^(Take|Retake) the quiz$/ }).click();

  const exam = page.getByRole("dialog", { name: "Load Balancer exam" });
  await expect(exam).toBeVisible();
  return exam;
}

/** Answers every question by taking the first option, so the run reaches
 *  results deterministically. Score is whatever that earns - these tests
 *  assert the flow and the readout, not a particular mark. */
async function answerAllQuestions(exam: Locator) {
  for (let i = 0; i < CHAPTER_QUIZ_QUESTIONS; i++) {
    await expect(exam.getByText(`Question ${i + 1} of ${CHAPTER_QUIZ_QUESTIONS}`)).toBeVisible();
    await exam.getByRole("radio").first().check();
    if (i < CHAPTER_QUIZ_QUESTIONS - 1) {
      await exam.getByRole("button", { name: "Next" }).click();
    }
  }
}

test.describe("Chapter Exam - Navigation and Launch", () => {
  test("the lesson page offers the quiz and launches the exam", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    await expect(exam.getByText(`Question 1 of ${CHAPTER_QUIZ_QUESTIONS}`)).toBeVisible();
    await expect(exam.getByRole("radio").first()).toBeVisible();
  });

  test("the knowledge check states the question count and pass threshold", async ({ page }) => {
    await resetExamAttempts(page);
    await page.goto(`/building-blocks/${CHAPTER_SLUG}/lesson`);

    await expect(page.getByRole("heading", { name: "Knowledge check" })).toBeVisible();
    await expect(page.getByText(`${CHAPTER_QUIZ_QUESTIONS} questions · 80% to pass`)).toBeVisible();
  });

  test("exiting the exam returns to the lesson", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    await exam.getByRole("button", { name: "Exit exam" }).click();
    await expect(exam).toBeHidden();
    await expect(page.getByRole("heading", { name: "Knowledge check" })).toBeVisible();
  });
});

test.describe("Chapter Exam - Question Answering", () => {
  test("answering a question marks it answered in the question nav", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    // The nav dots are role="tab", and their accessible name is what carries
    // the answered state.
    await expect(exam.getByRole("tab", { name: "Question 1", exact: true })).toBeVisible();

    await exam.getByRole("radio").first().check();

    await expect(exam.getByRole("tab", { name: "Question 1, answered" })).toBeVisible();
  });

  test("moves between questions with Next and Back", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    // The forward button reads "Skip" until the current question is answered.
    await expect(exam.getByRole("button", { name: "Skip" })).toBeVisible();
    await exam.getByRole("radio").first().check();

    await exam.getByRole("button", { name: "Next" }).click();
    await expect(exam.getByText(`Question 2 of ${CHAPTER_QUIZ_QUESTIONS}`)).toBeVisible();

    await exam.getByRole("button", { name: "Back" }).click();
    await expect(exam.getByText(`Question 1 of ${CHAPTER_QUIZ_QUESTIONS}`)).toBeVisible();
  });

  test("Back is disabled on the first question", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    await expect(exam.getByRole("button", { name: "Back" })).toBeDisabled();
  });
});

test.describe("Chapter Exam - Results and Scoring", () => {
  test("submitting with unanswered questions asks for confirmation first", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    await exam.getByRole("button", { name: "Submit exam" }).click();

    // Still on the exam, with a confirm step in front of the submission.
    const confirm = page.getByRole("alertdialog", { name: "Confirm submit" });
    await expect(confirm).toBeVisible();
    await expect(confirm).toContainText(/unanswered/i);
  });

  test("completing the exam shows a score against the pass threshold", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    await answerAllQuestions(exam);
    await exam.getByRole("button", { name: "Submit exam" }).click();

    const results = page.getByRole("dialog", { name: "Load Balancer exam results" });
    await expect(results).toBeVisible();
    // A real percentage and an explicit verdict against the 80% line - the
    // old version matched /pass|success|correct/ anywhere on the page, which
    // any per-option explanation would satisfy on its own.
    await expect(results.getByText(/^\d+%$/)).toBeVisible();
    await expect(results).toContainText(/80% required/);
  });

  test("the attempt is recorded and shown back on the lesson", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    await answerAllQuestions(exam);
    await exam.getByRole("button", { name: "Submit exam" }).click();

    const results = page.getByRole("dialog", { name: "Load Balancer exam results" });
    await expect(results).toBeVisible();
    await results.getByRole("button", { name: "Return to lesson" }).click();

    // YourTurnCard reports either "Passed · N%" or "Attempt N · Best score N%"
    // once an attempt exists, and the launcher changes wording accordingly.
    await expect(page.getByText(/Passed · \d+%|Attempt \d+ · Best score \d+%/)).toBeVisible();
    await expect(page.getByRole("button", { name: /^(Retake the quiz|View your result)$/ })).toBeVisible();
  });

  test("a recorded attempt survives a page reload", async ({ page }) => {
    await resetExamAttempts(page);
    const exam = await openExam(page);

    await answerAllQuestions(exam);
    await exam.getByRole("button", { name: "Submit exam" }).click();
    await expect(page.getByRole("dialog", { name: "Load Balancer exam results" })).toBeVisible();

    await page.reload();

    // The old version read `[class*='score']` textContent and asserted it was
    // truthy, inside a guard that never opened.
    await expect(page.getByText(/Passed · \d+%|Attempt \d+ · Best score \d+%/)).toBeVisible();
  });
});
