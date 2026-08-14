import assert from "node:assert/strict";
import test from "node:test";
import type { DataSourcesApi } from "gustwind";
import getMarkdown from "./markdown.ts";

function createMarkdown() {
  return getMarkdown({
    load: {
      textFileSync: () => "const answer = 42;\n",
    },
    renderSync: ({ htmlInput }: { htmlInput: string }) => htmlInput,
  } as unknown as DataSourcesApi);
}

test("renders headings, anchors, a table of contents, and smart punctuation", () => {
  const result = createMarkdown()({ input: '## A -- "heading"...' });

  assert.deepEqual(result.tableOfContents, [
    {
      level: 2,
      raw: "A – “heading”…",
      slug: "a-heading-",
      text: "A – “heading”…",
    },
  ]);
  assert.match(
    result.content,
    /<h2 id="a-heading-" class="scroll-mt-16">A – “heading”…/
  );
  assert.match(result.content, /href="#a-heading-">#<\/a><\/h2>/);
});

test("escapes table of contents text", () => {
  const result = createMarkdown()({
    input: "### No `<Route />` components",
  });

  assert.equal(result.tableOfContents[0]?.raw, "No &lt;Route /&gt; components");
});

test("renders custom notices and removes pagebreak markers", () => {
  const result = createMarkdown()({
    input: "T> A tip\n\nW> A warning\n\n{pagebreak}",
  });

  assert.match(result.content, /bg-muted[^>]*>!<\/div> A tip/);
  assert.match(result.content, /bg-warning[^>]*>\?<\/div> A warning/);
  assert.doesNotMatch(result.content, /pagebreak/);
});

test("preserves image metadata and rewrites local blog image paths", () => {
  const result = createMarkdown()({
    input: '![Author|100|200|author](assets/author.png "Profile")',
  });

  assert.match(result.content, /<figure[^>]*author/);
  assert.match(result.content, /src="[^"]*\/assets\/author.png"/);
  assert.match(result.content, /title="Profile" width="100" height="200"/);
  assert.doesNotMatch(result.content, /figcaption/);
});

test("keeps chapter references and formatted links inline", () => {
  const result = createMarkdown()({
    input: "See *Automation* and [`code`](https://example.com).",
    chapters: { Automation: "../infrastructure/automation/" },
  });

  assert.match(
    result.content,
    /See <SiteLink href="\.\.\/infrastructure\/automation\/">Automation<\/SiteLink>/
  );
  assert.match(
    result.content,
    /<SiteLink href="https:\/\/example\.com" title=""><code>code<\/code><\/SiteLink>/
  );
  assert.doesNotMatch(result.content, /<p><SiteLink[^>]*>Automation/);
});

test("merges task-list and list styling classes", () => {
  const result = createMarkdown()({ input: "- [x] Complete" });

  assert.match(
    result.content,
    /<ul class="contains-task-list list-disc list-inside">/
  );
  assert.doesNotMatch(result.content, /<ul[^>]*class="[^"]*"[^>]*class=/);
});

test("highlights fenced code", () => {
  const result = createMarkdown()({
    input: "```javascript\nconst answer = 42;\n```",
  });

  assert.match(result.content, /<pre><code class="javascript">/);
  assert.match(result.content, /hljs-keyword">const<\/span>/);
});
