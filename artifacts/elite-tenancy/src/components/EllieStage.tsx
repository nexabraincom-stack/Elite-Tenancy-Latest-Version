import { useEffect, useRef } from "react";

/**
 * Ellie Stage — bounded-roaming physics skeleton (step 1 of 5).
 *
 * NOT wired to the real chat or character art yet — this proves the wander +
 * toroidal-wrap + resize-safety model in isolation with a placeholder dot,
 * per the roadmap. Temporarily mounted bottom-LEFT (the real EllieChat
 * widget stays bottom-right, untouched) purely so the two are easy to
 * compare side by side during this test phase; they'll be merged into one
 * bottom-right presence once the real character is wired in (step 2+).
 *
 * Key design decisions:
 * - Position is stored as fractions of the stage's own size (0–1), never
 *   raw pixels — a resize can never invalidate it, and the wrap math
 *   (`% 1`) is trivial.
 * - Wrapping draws "ghost" copies of the dot near any edge it's close to,
 *   rather than conditionally picking a side — the canvas's own pixel
 *   bounds clip whatever falls outside it, so a dot sitting exactly halfway
 *   off two edges at once renders correctly for free (each ghost is
 *   independently clipped).
 * - Movement is heading-jitter "wander" steering, not a bouncing-ball
 *   loop, so it never falls into a visibly repeating cycle.
 */

const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";
const WANDER_JITTER = 1.4;     // radians/sec of random heading drift
const IDLE_SPEED = 0.045;      // stage-fractions per second
const CHAR_RADIUS_FRAC = 0.14; // placeholder radius as a fraction of min(stageWidth, stageHeight)
const TARGET_FPS = 30;
const GOLD = "rgba(212, 162, 74, 0.85)"; // Housebox accent — placeholder colour only

export default function EllieStage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stageWidth = 0;
    let stageHeight = 0;

    function resize() {
      const rect = container!.getBoundingClientRect();
      stageWidth = rect.width;
      stageHeight = rect.height;
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = stageWidth * dpr;
      canvas!.height = stageHeight * dpr;
      canvas!.style.width = `${stageWidth}px`;
      canvas!.style.height = `${stageHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const dotRadius = () => Math.min(stageWidth, stageHeight) * CHAR_RADIUS_FRAC;

    if (reducedMotion) {
      // Static, centred placeholder — no motion at all (WCAG 2.2 SC 2.2.2).
      ctx.clearRect(0, 0, stageWidth, stageHeight);
      ctx.beginPath();
      ctx.arc(stageWidth / 2, stageHeight / 2, dotRadius(), 0, Math.PI * 2);
      ctx.fillStyle = GOLD;
      ctx.fill();
      return () => ro.disconnect();
    }

    // Position as fractions of stage size — resize-safe by construction.
    const pos = { x: 0.5, y: 0.5 };
    let heading = Math.random() * Math.PI * 2;

    function draw() {
      const r = dotRadius();
      ctx!.clearRect(0, 0, stageWidth, stageHeight);

      const at = (x: number, y: number) => {
        ctx!.beginPath();
        ctx!.arc(x * stageWidth, y * stageHeight, r, 0, Math.PI * 2);
        ctx!.fillStyle = GOLD;
        ctx!.fill();
      };

      at(pos.x, pos.y);

      // Ghost copies near an edge — the canvas's own pixel bounds clip
      // these automatically, which is what makes a straddled-edge dot
      // (or a dot straddling a corner) render correctly with no special case.
      const nearLeft = pos.x < CHAR_RADIUS_FRAC;
      const nearRight = pos.x > 1 - CHAR_RADIUS_FRAC;
      const nearTop = pos.y < CHAR_RADIUS_FRAC;
      const nearBottom = pos.y > 1 - CHAR_RADIUS_FRAC;
      if (nearLeft) at(pos.x + 1, pos.y);
      if (nearRight) at(pos.x - 1, pos.y);
      if (nearTop) at(pos.x, pos.y + 1);
      if (nearBottom) at(pos.x, pos.y - 1);
      if (nearLeft && nearTop) at(pos.x + 1, pos.y + 1);
      if (nearLeft && nearBottom) at(pos.x + 1, pos.y - 1);
      if (nearRight && nearTop) at(pos.x - 1, pos.y + 1);
      if (nearRight && nearBottom) at(pos.x - 1, pos.y - 1);
    }

    let rafId = 0;
    let lastFrameTime = 0;
    let lastStepTime = performance.now();
    const frameInterval = 1000 / TARGET_FPS;
    let visible = document.visibilityState === "visible";

    function loop(now: number) {
      if (!visible) return; // resumed by the visibilitychange listener below
      rafId = requestAnimationFrame(loop);
      if (now - lastFrameTime < frameInterval) return; // cap redraw rate
      const dt = Math.min((now - lastStepTime) / 1000, 0.1); // clamp dt after a stall/tab-switch
      lastStepTime = now;
      lastFrameTime = now;

      heading += (Math.random() - 0.5) * WANDER_JITTER * dt;
      pos.x += Math.cos(heading) * IDLE_SPEED * dt;
      pos.y += Math.sin(heading) * IDLE_SPEED * dt;
      pos.x = ((pos.x % 1) + 1) % 1;
      pos.y = ((pos.y % 1) + 1) % 1;

      draw();
    }

    function onVisibilityChange() {
      visible = document.visibilityState === "visible";
      if (visible) {
        lastStepTime = performance.now();
        rafId = requestAnimationFrame(loop);
      }
    }
    document.addEventListener("visibilitychange", onVisibilityChange);

    rafId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      data-testid="ellie-stage-skeleton"
      style={{
        position: "fixed",
        left: "24px",
        bottom: "24px",
        width: "clamp(240px, 32vw, 420px)",
        height: "clamp(240px, 32vh, 420px)",
        pointerEvents: "none",
        overflow: "hidden",
        zIndex: 40,
      }}
    >
      <canvas ref={canvasRef} style={{ display: "block" }} />
    </div>
  );
}
