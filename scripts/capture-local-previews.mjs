import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { join } from "node:path";

const dir = process.env.PREVIEW_DIR;
if (!dir) throw new Error("PREVIEW_DIR is required");
mkdirSync(dir, { recursive: true });

const hideNextBadge = `
nextjs-portal, [data-next-badge-root], [data-next-mark-loading], #__next-build-watcher { display: none !important; }
`;

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

async function hideFlashes() {
  await page.evaluate(() => {
    document.querySelectorAll(".flash-messages, .flash").forEach((el) => el.remove());
  });
}

// Fortis — logged-in overview (GitHub Pages mock; any credentials work)
await page.goto("https://lamokodieh-ops.github.io/projects/fortis/", { waitUntil: "networkidle", timeout: 60000 });
if (await page.locator("#email").count()) {
  await page.fill("#email", "demo@fortis.app");
  await page.fill("#password", "Demo123!");
  await page.getByRole("button", { name: "Enter Fortis" }).click();
}
await page.getByRole("heading", { name: "Overview" }).waitFor({ timeout: 20000 });
await page.locator(".stat .label", { hasText: "Net worth" }).waitFor();
await page.mouse.move(0, 0);
await page.waitForTimeout(1200);
await page.screenshot({ path: join(dir, "fortis.png"), type: "png" });
console.log("ok fortis home");

// InLumine — logged-in dashboard
await page.goto("http://localhost:3000/login", { waitUntil: "networkidle", timeout: 60000 });
await page.locator('input[name="email"]').fill("kwabena@example.com");
await page.locator('input[name="password"]').fill("Alumni123!");
await page.locator("form button[type=submit]").click();
await page.waitForURL("**/dashboard", { timeout: 30000 });
await page.getByText("Welcome back").first().waitFor({ timeout: 15000 });
await page.addStyleTag({ content: hideNextBadge });
await page.waitForTimeout(700);
await page.screenshot({ path: join(dir, "inlumine.png"), type: "png" });
console.log("ok inlumine home");

// FeedMe — weekly meal plan
await page.goto("http://127.0.0.1:5000/login", { waitUntil: "networkidle", timeout: 30000 });
await page.fill("#username", "gallerydemo");
await page.fill("#password", "harvard1");
await page.click("button[type=submit]");
await page.waitForURL("**/dashboard", { timeout: 15000 });
await hideFlashes();
await page.getByRole("heading", { name: "Weekly Meal Plan" }).waitFor();
await page.waitForTimeout(400);
await page.screenshot({ path: join(dir, "feedme.png"), type: "png" });
console.log("ok feedme home");

await browser.close();
