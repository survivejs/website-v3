import { access, writeFile } from "node:fs/promises";

try {
  await access(".images.json");
} catch {
  await writeFile(".images.json", "{}\n", "utf8");
}
