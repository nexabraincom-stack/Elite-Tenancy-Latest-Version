/**
 * Vercel serverless entry point.
 *
 * Exports the Express app as the default export so Vercel's @vercel/node
 * runtime can serve it as a serverless function.
 *
 * Note: WebSocket support is not available in this mode.
 * DB migrations must be run separately via Neon SQL editor.
 */
import app from "../src/app.js";

export default app;
