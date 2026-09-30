import { chromium } from "@playwright/test";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch();
try {
  const page = await browser.newPage({
    viewport: { width: 1200, height: 630 },
    deviceScaleFactor: 1,
  });
  await page.setContent(`<!doctype html><html lang="en"><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;background:#f8faf9;color:#152f33;font-family:Arial,sans-serif;padding:65px 75px;width:1200px;height:630px;border-top:18px solid #09b5c4}
    .brand{font-size:34px;font-weight:700;letter-spacing:-1px}.rule{height:2px;background:#346065;margin:28px 0 42px}
    h1{font-size:76px;line-height:1.06;letter-spacing:-3px;margin:0;max-width:1020px;font-weight:700}
    .byline{font-size:27px;color:#346065;margin-top:40px}.url{position:absolute;right:75px;bottom:52px;font-size:23px;color:#346065}
  </style><body><div class="brand">SurviveJS</div><div class="rule"></div><h1>Web development<br>research and practice.</h1><div class="byline">Juho Vepsäläinen</div><div class="url">survivejs.com</div></body></html>`);
  await page.evaluate(() => document.fonts.ready);
  await mkdir("assets/images", { recursive: true });
  await page.screenshot({ path: "assets/images/social.png" });
} finally {
  await browser.close();
}
