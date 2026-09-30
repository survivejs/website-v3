import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import { imageSource } from "./imageSource.ts";

test("legacy images use the configured image host", () => {
  assert.equal(
    imageSource(
      "/assets/img/testimonials/clement.jpg",
      "https://images.example.com/"
    ),
    "https://images.example.com/assets/img/testimonials/clement.jpg"
  );
  assert.equal(
    imageSource("/assets/img/covers/webpack-cover.svg"),
    "/assets/img/covers/webpack-cover.svg"
  );
});

test("bundled images and external images keep their own URLs", () => {
  for (const src of [
    "/images/interviews/gajus-kuizinas.jpg",
    "/images/webpack/logo.png",
    "https://example.com/avatar.jpg",
    "data:image/png;base64,abc",
  ]) {
    assert.equal(imageSource(src, "https://images.example.com"), src);
  }
});

test("Pages invokes the image handler for legacy image URLs but keeps bundled assets static", () => {
  const routes = JSON.parse(
    readFileSync(new URL("../../assets/_routes.json", import.meta.url), "utf8")
  );
  const matches = (pattern: string, url: string) =>
    pattern.endsWith("*")
      ? url.startsWith(pattern.slice(0, -1))
      : pattern === url;
  const invokesFunction = (url: string) =>
    routes.include.some((pattern: string) => matches(pattern, url)) &&
    !routes.exclude.some((pattern: string) => matches(pattern, url));
  for (const url of [
    "/assets/img/testimonials/clement.jpg",
    "/assets/img/covers/webpack-cover.svg",
    "/assets/img/interviews/dan.jpg",
    "/mcp",
    "/ping",
  ]) {
    assert.equal(invokesFunction(url), true, url);
  }
  for (const url of [
    "/books/webpack/",
    "/images/webpack/logo.png",
    "/images/interviews/gajus-kuizinas.jpg",
  ]) {
    assert.equal(invokesFunction(url), false, url);
  }
});
