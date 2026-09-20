/**
 * Builds, serves and tests — in that order, in one process.
 *
 * This exists because of a real false pass. A syntax error in a page component
 * failed the build; the browser suite was then run by hand against the `dist/`
 * from the previous build and reported 8/8. Every assertion was true. None of
 * them was about the code being tested.
 *
 * The invariant this enforces: browser-test success cannot be reported unless
 * the current source built successfully first. Not by remembering the order —
 * by making the order the only way to run it.
 *
 *   npm run test:browser
 *     → build:full   (fails here → nothing else runs)
 *     → serve dist   (the artefact that build just produced)
 *     → assert       (against that server, then shut it down)
 *
 * `npm run test:browser:only` still exists for iterating on a test without
 * rebuilding. It carries its own staleness check — see tests/browser-regression.mjs.
 */
import { spawn, spawnSync } from "child_process";
import { statSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const PORT = process.env.PORT ?? "3100";
const BASE = `http://localhost:${PORT}`;

function run(label, command, args) {
  process.stdout.write(`\n─── ${label} ${"─".repeat(Math.max(0, 56 - label.length))}\n`);
  const result = spawnSync(command, args, { cwd: ROOT, stdio: "inherit", shell: false });
  if (result.status !== 0) {
    console.error(`\n${label} FAILED — stopping. Nothing downstream of a failed build is meaningful.`);
    process.exit(result.status ?? 1);
  }
}

const before = stamp();
run("build", "npm", ["run", "build:full"]);
const after = stamp();

/**
 * A build that "succeeded" without rewriting the output is not a build.
 * Cheap, and it catches a buildCommand that silently skipped a step.
 */
if (after !== null && after === before) {
  console.error("\ndist/index.html was not rewritten by the build. Refusing to test a stale artefact.");
  process.exit(1);
}

function stamp() {
  try {
    return statSync(join(ROOT, "dist", "index.html")).mtimeMs;
  } catch {
    return null;
  }
}

process.stdout.write(`\n─── serve ${"─".repeat(52)}\n`);
const server = spawn("npx", ["tsx", "scripts/serve-dist.ts"], {
  cwd: ROOT,
  stdio: ["ignore", "inherit", "inherit"],
  env: { ...process.env, PORT },
});

let exiting = false;
const shutdown = (code) => {
  if (exiting) return;
  exiting = true;
  server.kill("SIGTERM");
  process.exit(code);
};
process.on("SIGINT", () => shutdown(130));
process.on("SIGTERM", () => shutdown(143));

server.on("exit", (code) => {
  if (!exiting) {
    console.error(`\nserve-dist exited early (${code}).`);
    process.exit(1);
  }
});

await waitForServer();

process.stdout.write(`\n─── assert ${"─".repeat(51)}\n`);
const tests = spawnSync("node", ["tests/browser-regression.mjs"], {
  cwd: ROOT,
  stdio: "inherit",
  env: { ...process.env, BASE_URL: BASE, SKIP_STALENESS_CHECK: "1" },
});

shutdown(tests.status ?? 1);

async function waitForServer() {
  for (let attempt = 0; attempt < 60; attempt++) {
    try {
      const res = await fetch(BASE + "/index.html");
      if (res.ok) return;
    } catch {
      /* not up yet */
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  console.error("serve-dist never became ready.");
  shutdown(1);
}
