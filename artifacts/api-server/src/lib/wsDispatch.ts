/**
 * wsDispatch — lightweight internal message bus for pushing WebSocket frames
 * from any route handler into the live WebSocket server without circular deps.
 *
 * Usage (in a route):
 *   import { dispatchToUser } from "../lib/wsDispatch";
 *   dispatchToUser(userId, { type: "interest_mutual", listingId: 42 });
 *
 * The WS server calls registerDispatcher() once at startup, giving this module
 * a reference to the `clients` map it maintains.
 */

import type WebSocket from "ws";

type SendFn = (userId: number, payload: unknown) => void;

let _send: SendFn | null = null;

/** Called once by ws/server.ts at startup. */
export function registerDispatcher(fn: SendFn): void {
  _send = fn;
}

/**
 * Push a JSON frame to a connected user.
 * Silently no-ops if the user is offline or the WS server is not yet registered.
 */
export function dispatchToUser(userId: number, payload: unknown): void {
  if (_send) {
    try {
      _send(userId, payload);
    } catch {
      /* user offline — ignore */
    }
  }
}
