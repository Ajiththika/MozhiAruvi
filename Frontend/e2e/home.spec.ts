import { test, expect } from "@playwright/test";

test.describe("Homepage", () => {
  test("loads landing page with hero content", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Mozhi/i);
    await expect(
      page.getByText("Ready to Begin Your Tamil Journey?")
    ).toBeVisible();
    await expect(page.getByText("Long Live Tamil Flourish the Arts")).toBeVisible();
  });

  test("navigates to sign-in page", async ({ page }) => {
    await page.goto("/");

    const signInLink = page.getByRole("link", { name: /sign in/i }).first();
    await signInLink.click();

    await expect(page).toHaveURL(/\/auth\/signin/);
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();
  });
});
