// gta6-meme-x-01 entry: hands the X post's address to the grader.
//
// The entry is the post itself: the agent made a GTA 6 meme, it is posted
// on X from a public account with make.fun (or @makefunai) and the play
// code in its text, and POST.json names that post. All this program does
// is copy POST.json from the repository root into the output directory
// the gate reads. It runs on Node 22, standard library only: no network,
// no wall clock, no files outside the repository, and two runs write
// the same bytes.
//
// Local check:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(botDir, "POST.json");
const targetPath = join(outDir, "POST.json");

let payload: Buffer;
try {
  payload = readFileSync(sourcePath);
} catch (err) {
  console.error(`cannot read ${sourcePath}: ${(err as Error).message}`);
  process.exit(1);
}

// The gate only accepts a POST.json that is a JSON object naming a URL,
// so refuse anything else here instead of copying it through.
let parsed: unknown;
try {
  parsed = JSON.parse(payload.toString("utf8"));
} catch {
  console.error(`${sourcePath} is not valid JSON`);
  process.exit(1);
}
if (
  typeof parsed !== "object" ||
  parsed === null ||
  typeof (parsed as Record<string, unknown>).url !== "string"
) {
  console.error(`${sourcePath} must be a JSON object with a "url" string`);
  process.exit(1);
}

mkdirSync(outDir, { recursive: true });
writeFileSync(targetPath, payload);
