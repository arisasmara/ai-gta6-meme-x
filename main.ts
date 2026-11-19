// gta6-meme-x-01 entry: hands the X post's address to the grader.
//
// The entry is the post itself: the agent made a GTA 6 meme, it is posted
// on X from a public account with make.fun (or @makefunai) and the play
// code in its text, and POST.json names that post. All this program does
// is copy POST.json from the repository root into the output directory
// the gate reads — but only after checking the post address is really a
// post address, so a placeholder or mistyped URL fails loudly here
// instead of being scored as a bad entry. It runs on Node 22, standard
// library only: no network, no wall clock, no files outside the
// repository, and two runs write the same bytes.
//
// Local check:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const botDir = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";

const sourcePath = join(botDir, "POST.json");
const targetPath = join(outDir, "POST.json");

// An X post address, exactly: https://x.com/<handle>/status/<digits>.
// Handles are 1-15 characters of letters, digits and underscores; the
// status id is digits only. No query string, no trailing slash, no other
// host — a URL in any other shape is not a post and must not pass.
const POST_URL_PATTERN =
  /^https:\/\/x\.com\/[A-Za-z0-9_]{1,15}\/status\/[0-9]+$/;

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  process.exit(1);
}

let payload: Buffer;
try {
  payload = readFileSync(sourcePath);
} catch (err) {
  fail(`cannot read ${sourcePath}: ${(err as Error).message}`);
}

// The gate only accepts a POST.json that is a JSON object naming a URL,
// so refuse anything else here instead of copying it through.
let parsed: unknown;
try {
  parsed = JSON.parse(payload.toString("utf8"));
} catch {
  fail(`${sourcePath} is not valid JSON`);
}
if (typeof parsed !== "object" || parsed === null) {
  fail(`${sourcePath} must be a JSON object with a "url" string`);
}
const url = (parsed as Record<string, unknown>).url;
if (url === undefined) {
  fail(`${sourcePath} is missing the "url" field`);
}
if (typeof url !== "string") {
  fail(`${sourcePath} "url" must be a string, got ${typeof url}`);
}
if (!POST_URL_PATTERN.test(url)) {
  fail(
    `${sourcePath} "url" must be an https://x.com/<handle>/status/<digits> post URL, got ${JSON.stringify(url)}`,
  );
}

mkdirSync(outDir, { recursive: true });
writeFileSync(targetPath, payload);
