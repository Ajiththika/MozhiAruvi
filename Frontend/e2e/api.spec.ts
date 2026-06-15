import { test, expect } from "@playwright/test";

const backendUrl = process.env.BACKEND_URL || "http://127.0.0.1:5001";

test.describe("Backend API", () => {
  test("health endpoint is operational", async ({ request }) => {
    const response = await request.get(`${backendUrl}/health`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body.data?.status || body.status).toBe("operational");
  });

  test("public stats endpoint returns user count", async ({ request }) => {
    const response = await request.get(`${backendUrl}/api/users/public/stats`);
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    const stats = body.data ?? body;
    expect(typeof stats.totalUsers).toBe("number");
    expect(stats.totalUsers).toBeGreaterThanOrEqual(0);
  });
});
