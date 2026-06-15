import { test, expect } from "@playwright/test";

test.describe("Public pages", () => {
  test("blogs page loads", async ({ page }) => {
    await page.goto("/blogs");
    await expect(page).toHaveURL(/\/blogs/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("events page loads", async ({ page }) => {
    await page.goto("/events");
    await expect(page).toHaveURL(/\/events/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("tutors page loads", async ({ page }) => {
    await page.goto("/tutors");
    await expect(page).toHaveURL(/\/tutors/);
    await expect(page.locator("body")).toBeVisible();
  });

  test("sign-up page loads", async ({ page }) => {
    await page.goto("/auth/signup");
    await expect(page).toHaveURL(/\/auth\/signup/);
    await expect(page.locator("body")).toBeVisible();
  });
});
