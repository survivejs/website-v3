import { test, expect } from "@playwright/test";

test("mobile menu supports keyboard activation, Escape and responsive changes", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  const toggle = page.getByRole("button", { name: "Toggle navigation" });
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  await expect(navigation).toBeHidden();
  await toggle.focus();
  await page.keyboard.press("Enter");
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(navigation).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(navigation.getByRole("link").first()).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(navigation).toBeHidden();
  await expect(toggle).toBeFocused();
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(navigation).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(navigation).toBeHidden();
});

for (const width of [390, 1440]) {
  test(`search supports keyboard activation and focus return at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto("/");
    const button = page.getByRole("button", { name: "Search", exact: true });
    await button.focus();
    await page.keyboard.press("Space");
    await expect(button).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("#site-search")).toBeVisible();
    await expect(page.locator("#site-search input")).toBeFocused();
    await page.keyboard.press("Escape");
    await expect(page.locator("#site-search")).toBeHidden();
    await expect(button).toHaveAttribute("aria-expanded", "false");
    await expect(button).toBeFocused();
  });
}
