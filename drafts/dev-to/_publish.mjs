// Create dev.to DRAFTS (published:false) from the local markdown files.
// Reads DEVTO_API_KEY from .env.local (never printed). Run once:
//   node drafts/dev-to/_publish.mjs
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const root = join(here, "..", "..");

function readEnvKey() {
  const env = readFileSync(join(root, ".env.local"), "utf8");
  const m = env.match(/^DEVTO_API_KEY=(.+)$/m);
  if (!m) throw new Error("DEVTO_API_KEY missing from .env.local");
  return m[1].trim();
}

function parse(file) {
  const raw = readFileSync(file, "utf8");
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!m) throw new Error(`No frontmatter in ${file}`);
  const fm = m[1];
  const body = m[2];
  const get = (k) => {
    const mm = fm.match(new RegExp(`^${k}:\\s*(.*)$`, "m"));
    return mm ? mm[1].trim().replace(/^"(.*)"$/, "$1") : undefined;
  };
  const tags = (get("tags") || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 4);
  return {
    title: get("title"),
    description: get("description"),
    cover: get("cover_image"),
    tags,
    body,
  };
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const key = readEnvKey();
const files = readdirSync(here)
  .filter((f) => f.endsWith(".md"))
  .sort();

console.log(`Publishing ${files.length} drafts to dev.to…\n`);

for (const f of files) {
  const { title, description, cover, tags, body } = parse(join(here, f));
  const payload = {
    article: {
      title,
      body_markdown: body,
      published: false,
      tags,
      description,
      ...(cover ? { main_image: cover } : {}),
    },
  };
  try {
    const res = await fetch("https://dev.to/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/vnd.forem.api-v1+json",
        "api-key": key,
      },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let json;
    try {
      json = JSON.parse(text);
    } catch {
      json = null;
    }
    if (res.ok && json) {
      console.log(`OK   ${res.status}  "${title}"`);
      console.log(`     id=${json.id}  edit=https://dev.to/dashboard  url=${json.url}\n`);
    } else {
      console.log(`FAIL ${res.status}  "${title}"`);
      console.log(`     ${text.slice(0, 300)}\n`);
    }
  } catch (err) {
    console.log(`ERROR  "${title}"  ${err.message}\n`);
  }
  await sleep(2500); // be gentle with the create-article rate limit
}

console.log("Done. Drafts live under your dev.to dashboard → Drafts.");
