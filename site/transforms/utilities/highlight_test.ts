import { assertEquals } from "https://deno.land/std@0.142.0/testing/asserts.ts";
import { highlight } from "./highlight.ts";

Deno.test("highlights simple input", () => {
  assertEquals(highlight("foobar"), `foobar`);
});

Deno.test("highlights simple JavaScript", () => {
  assertEquals(
    highlight(
      `const test = 'foo';`,
      "javascript",
    ),
    `<span class="hljs-keyword">const</span> test = <span class="hljs-string">&#x27;foo&#x27;</span>;`,
  );
});

Deno.test("marks leanpub insertions", () => {
  assertEquals(
    highlight(
      `leanpub-start-insert
const test = 'foo';
leanpub-end-insert`,
      "javascript",
    ),
    `<div class="hljs-addition inline"><span class="hljs-keyword">const</span> test = <span class="hljs-string">&#x27;foo&#x27;</span>;</div>`,
  );
});

Deno.test("marks leanpub deletions", () => {
  assertEquals(
    highlight(
      `leanpub-start-delete
const test = 'foo';
leanpub-end-delete`,
      "javascript",
    ),
    `<div class="hljs-deletion inline"><span class="hljs-keyword">const</span> test = <span class="hljs-string">&#x27;foo&#x27;</span>;</div>`,
  );
});
