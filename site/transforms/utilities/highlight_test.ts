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
