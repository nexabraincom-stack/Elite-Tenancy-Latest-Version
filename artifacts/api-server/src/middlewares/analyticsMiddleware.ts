import type { Request, Response, NextFunction } from "express";
import { track } from "@vercel/analytics/server";
import { logger } from "../lib/logger";

/**
 * Vercel Analytics middleware for tracking API requests.
 * Tracks successful API requests with method, path, and status code.
 */
export function analyticsMiddleware() {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Store the original res.json to intercept the response
    const originalJson = res.json.bind(res);

    res.json = function (body: unknown) {
      // Track the API request after response is sent
      const eventName = "API Request";
      const eventData = {
        method: req.method,
        path: req.path || req.url?.split("?")[0] || "unknown",
        statusCode: res.statusCode.toString(),
      };

      // Track asynchronously without blocking the response
      track(eventName, eventData).catch((err) => {
        // Silently fail if analytics tracking fails - don't impact API responses
        logger.debug({ err }, "Analytics tracking failed");
      });

      return originalJson(body);
    };

    next();
  };
}
