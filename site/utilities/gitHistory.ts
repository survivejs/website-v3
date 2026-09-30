import { execFile } from "node:child_process";
import { realpath } from "node:fs/promises";
import path from "node:path";
import { promisify } from "node:util";

const exec = promisify(execFile);

type GitUpdate = { commit: string; date: string; label: string };

// Scope caches to a build, so a subsequent build can pick up new commits.
export function createGitHistoryReader() {
  const repositories = new Map<string, Promise<boolean>>();
  const updates = new Map<string, Promise<GitUpdate | null>>();

  async function git(repository: string, args: string[]) {
    const { stdout } = await exec("git", ["-C", repository, ...args], {
      encoding: "utf8",
      timeout: 10000,
    });
    return stdout.trim();
  }

  async function hasCompleteHistory(repository: string) {
    try {
      // A source archive inside the site checkout must not use the site's Git history.
      const root = await git(repository, ["rev-parse", "--show-toplevel"]);
      return (
        (await realpath(root)) === (await realpath(repository)) &&
        (await git(repository, ["rev-parse", "--is-shallow-repository"])) ===
          "false"
      );
    } catch {
      return false;
    }
  }

  return function readGitUpdate(
    repository: string,
    source: string,
    follow = false
  ) {
    repository = path.resolve(repository);
    const key = JSON.stringify([repository, source, follow]);
    if (!updates.has(key)) {
      updates.set(
        key,
        (async () => {
          if (!repositories.has(repository)) {
            repositories.set(repository, hasCompleteHistory(repository));
          }
          if (!(await repositories.get(repository))) return null;
          try {
            const result = await git(repository, [
              "log",
              "-1",
              "--format=%H%x09%cs",
              ...(follow ? ["--follow"] : []),
              "HEAD",
              "--",
              source,
            ]);
            const [commit, date] = result.split("\t");
            if (
              !/^[a-f0-9]{40,64}$/.test(commit) ||
              !/^\d{4}-\d{2}-\d{2}$/.test(date)
            )
              return null;
            return {
              commit,
              date,
              label: new Intl.DateTimeFormat("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
                timeZone: "UTC",
              }).format(new Date(`${date}T00:00:00Z`)),
            };
          } catch {
            // Missing Git/history is not evidence that the content was updated today.
            return null;
          }
        })()
      );
    }
    return updates.get(key)!;
  };
}
