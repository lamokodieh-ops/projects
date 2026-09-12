import { chromium } from "playwright";
import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const dir = join(dirname(fileURLToPath(import.meta.url)), "docs", "previews");
mkdirSync(dir, { recursive: true });

const shots = [
  ["mindcare", "https://lamokodieh-ops.github.io/projects/mindcare/"],
  ["fortis", "https://lamokodieh-ops.github.io/projects/fortis/"],
  ["inlumine", "https://lamokodieh-ops.github.io/projects/inlumine/"],
  ["cortex", "http://127.0.0.1:3002/projects/cortex/"],
  ["quirkly", "https://lamokodieh-ops.github.io/projects/quirkly/"],
  ["kairos", "https://lamokodieh-ops.github.io/projects/event_manager/"],
  ["merit", "https://lamokodieh-ops.github.io/projects/merit/"],
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

for (const [name, url] of shots) {
  try {
    await page.goto(url, { waitUntil: "networkidle", timeout: 45000 });
    await page.waitForTimeout(900);
    await page.screenshot({ path: join(dir, `${name}.png`), type: "png" });
    console.log("ok", name);
  } catch (err) {
    console.error("fail", name, err.message);
  }
}

await browser.close();
