import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { createGitHistoryReader } from "./gitHistory.ts";

test("uses path-specific commits, follows renames, and refreshes between builds", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "book-history-"));
  const git = (...args: string[]) =>
    execFileSync("git", ["-C", root, ...args], { encoding: "utf8" }).trim();
  const commit = (date: string) =>
    execFileSync(
      "git",
      [
        "-C",
        root,
        "-c",
        "user.name=Test",
        "-c",
        "user.email=test@example.com",
        "-c",
        "commit.gpgsign=false",
        "-c",
        "core.hooksPath=/dev/null",
        "commit",
        "-m",
        "Edit source",
      ],
      {
        env: {
          ...process.env,
          GIT_AUTHOR_DATE: date,
          GIT_COMMITTER_DATE: date,
        },
      }
    );
  try {
    git("init", "--quiet");
    await mkdir(path.join(root, "manuscript"));
    await writeFile(path.join(root, "manuscript", "chapter.md"), "# Chapter\n");
    git("add", ".");
    commit("2020-02-03T23:00:00-05:00");
    const original = git("rev-parse", "HEAD");
    await writeFile(path.join(root, "README.md"), "Repository documentation\n");
    git("add", ".");
    commit("2024-01-01T12:00:00Z");

    const read = createGitHistoryReader();
    const chapter = await read(root, "manuscript/chapter.md", true);
    assert.equal(chapter?.commit, original);
    assert.equal(chapter?.date, "2020-02-03");
    assert.equal(chapter?.label, "3 Feb 2020");
    assert.deepEqual(await read(root, "manuscript"), chapter);
    assert.equal(await read(root, "manuscript/untracked.md", true), null);

    git("mv", "manuscript/chapter.md", "manuscript/renamed.md");
    commit("2025-04-05T12:00:00Z");
    const refreshed = createGitHistoryReader();
    assert.equal(
      (await refreshed(root, "manuscript/renamed.md", true))?.date,
      "2025-04-05"
    );
    assert.equal((await refreshed(root, "manuscript"))?.date, "2025-04-05");
    assert.equal((await read(root, "manuscript"))?.date, "2020-02-03");

    // A copied manuscript inside another checkout has no book repository history.
    assert.equal(
      await refreshed(path.join(root, "manuscript"), "renamed.md", true),
      null
    );

    const shallow = path.join(root, "shallow-copy");
    git("clone", "--quiet", "--depth=1", `file://${root}`, shallow);
    assert.equal(await createGitHistoryReader()(shallow, "manuscript"), null);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test("missing repositories do not fall back to filesystem or build dates", async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), "book-no-history-"));
  try {
    await writeFile(path.join(root, "chapter.md"), "# No history\n");
    assert.equal(
      await createGitHistoryReader()(root, "chapter.md", true),
      null
    );
    assert.equal(
      await createGitHistoryReader()(path.join(root, "missing"), "manuscript"),
      null
    );
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
