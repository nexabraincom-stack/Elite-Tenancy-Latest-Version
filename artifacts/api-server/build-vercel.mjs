/**
 * Vercel build script — bundles src/app.ts (Express app only, no server listen)
 * into dist/vercel.mjs using esbuild.
 *
 * No pino plugin needed for serverless — pino logs directly to stdout in prod.
 */
import { createRequire } from "node:module";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build as esbuild } from "esbuild";

globalThis.require = createRequire(import.meta.url);

const artifactDir = path.dirname(fileURLToPath(import.meta.url));

const external = [
  // True native binaries — cannot be bundled by esbuild under any circumstances
  "*.node",
  "sharp", "better-sqlite3", "sqlite3", "canvas", "bcrypt", "argon2",
  "fsevents", "re2", "farmhash", "xxhash-addon", "bufferutil",
  "utf-8-validate", "ssh2", "cpu-features", "dtrace-provider", "isolated-vm",
  "lightningcss", "pg-native", "oracledb", "mongodb-client-encryption",
];

const banner = {
  js: `import { createRequire as __bannerCrReq } from 'node:module';
import __bannerPath from 'node:path';
import __bannerUrl from 'node:url';

globalThis.require = __bannerCrReq(import.meta.url);
globalThis.__filename = __bannerUrl.fileURLToPath(import.meta.url);
globalThis.__dirname = __bannerPath.dirname(globalThis.__filename);
  `,
};

await esbuild({
  entryPoints: [path.resolve(artifactDir, "src/app.ts")],
  platform: "node",
  bundle: true,
  format: "esm",
  outfile: path.resolve(artifactDir, "dist/vercel.mjs"),
  logLevel: "info",
  external,
  sourcemap: "linked",
  banner,
  // No pino plugin — serverless logs go directly to stdout
  // pino-pretty is a dev tool only
}).catch((err) => {
  console.error(err);
  process.exit(1);
});

console.log("✅ Vercel bundle built: dist/vercel.mjs");
