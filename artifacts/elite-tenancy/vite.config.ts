import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const rawPort = process.env.PORT;

// On Vercel (build-only), PORT is injected via the build command; use 3000 as fallback
const port = rawPort ? Number(rawPort) : 3000;

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss({ optimize: false }),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-runtime-error-modal").then(
            (m) => m.default(),
          ),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer({
              root: path.resolve(import.meta.dirname, ".."),
            }),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
      "@assets": path.resolve(import.meta.dirname, "..", "..", "attached_assets"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    chunkSizeWarningLimit: 600,
    rollupOptions: {
      output: {
        manualChunks: {
          // React core — loaded first, cached indefinitely
          "vendor-react": ["react", "react-dom"],
          // Clerk auth — large SDK, isolated so app pages don't block on it
          "vendor-clerk": ["@clerk/react"],
          // Tanstack Query
          "vendor-query": ["@tanstack/react-query"],
          // Routing + UI utilities
          "vendor-ui": ["wouter", "lucide-react", "class-variance-authority", "clsx", "tailwind-merge"],
          // Radix UI components (heavy but rarely change)
          "vendor-radix": [
            "@radix-ui/react-accordion", "@radix-ui/react-alert-dialog",
            "@radix-ui/react-avatar", "@radix-ui/react-checkbox",
            "@radix-ui/react-dialog", "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-label", "@radix-ui/react-popover",
            "@radix-ui/react-scroll-area", "@radix-ui/react-select",
            "@radix-ui/react-separator", "@radix-ui/react-slider",
            "@radix-ui/react-slot", "@radix-ui/react-switch",
            "@radix-ui/react-tabs", "@radix-ui/react-toast",
            "@radix-ui/react-tooltip",
          ],
        },
      },
    },
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
    // Mirrors the /api rewrite in vercel.json so local dev hits the real
    // live backend (real DB, real AI Gateway) instead of 404ing against
    // the Vite dev server itself — no local backend/env setup needed.
    proxy: {
      "/api": {
        target: "https://elite-tenancy-latest-version-api-se-rho.vercel.app",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
