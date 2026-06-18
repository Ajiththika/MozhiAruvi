import { test, expect } from "@playwright/test";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5001";

test.describe("Product website E2E", () => {
  test("landing page key sections render", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Ready to Begin Your Tamil Journey?")).toBeVisible();
    await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /create free account/i }).first()).toBeVisible();
  });

  test("auth pages are reachable", async ({ page }) => {
    await page.goto("/auth/signin");
    await expect(page.getByPlaceholder("your@email.com")).toBeVisible();

    await page.goto("/auth/signup");
    await expect(page.locator("body")).toBeVisible();
  });

  test("student routes redirect unauthenticated users to sign-in", async ({ page }) => {
    await page.goto("/student/speaking-lab");
    await expect(page).toHaveURL(/\/auth\/signin/);

    await page.goto("/student/lessons");
    await expect(page).toHaveURL(/\/auth\/signin/);
  });

  test("backend health and public API respond", async ({ request }) => {
    const health = await request.get(`${backendUrl}/health`);
    expect(health.ok()).toBeTruthy();

    const stats = await request.get(`${backendUrl}/api/users/public/stats`);
    expect(stats.ok()).toBeTruthy();
  });
});
