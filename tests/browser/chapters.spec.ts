import { test, expect } from "@playwright/test";

for (const width of [320, 390]) {
  test(`chapter links fit at ${width}px without covering the article`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.goto("/books/webpack/introduction/");
    const navigation = page.getByRole("navigation", { name: "Adjacent pages" });
    await expect(navigation).toHaveCount(1);
    await navigation.scrollIntoViewIfNeeded();
    const links = navigation.getByRole("link");
    expect(await links.count()).toBeGreaterThan(0);
    for (const link of await links.all()) {
      const box = await link.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
      expect(box!.height).toBeGreaterThanOrEqual(44);
      const href = await link.getAttribute("href");
      expect((await page.request.get(href!)).ok()).toBeTruthy();
    }
    const articleBox = await page.locator("article").boundingBox();
    const navigationBox = await navigation.boundingBox();
    expect(navigationBox!.y).toBeGreaterThanOrEqual(
      articleBox!.y + articleBox!.height
    );
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth)
    ).toBeLessThanOrEqual(width);
    await page.screenshot({ path: `/tmp/survivejs-chapter-${width}.png` });
  });
}
