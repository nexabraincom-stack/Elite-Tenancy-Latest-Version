/**
 * Vercel serverless entry point.
 *
 * Imports the pre-compiled Express app bundle (built by build-vercel.mjs
 * via esbuild). Vercel picks this up as the default request handler.
 *
 * No TypeScript compilation needed — esbuild handles everything.
 */
export { default } from "../dist/vercel.mjs";
