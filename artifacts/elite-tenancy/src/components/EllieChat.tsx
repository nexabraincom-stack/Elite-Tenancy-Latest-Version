import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Send, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "ellie";
  content: string;
}

const STARTERS = [
  "Find me a room in Manchester",
  "What are your fees for landlords?",
  "Do you accept Universal Credit tenants?",
  "How much can I rent my flat for?",
];

const GREETING =
  "Hi, I'm **Ellie** — your Elite Tenancy letting assistant 🏡 I can help you find a home, explain how we work, answer pricing questions, or guide landlords through listing a property. What can I help you with today?";

function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-1.5 h-1.5 rounded-full bg-primary/60"
          animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }}
          transition={{ duration: 0.9, repeat: Infinity, delay: i * 0.18 }}
        />
      ))}
    </div>
  );
}

/** Escape HTML, then apply safe bold/italic/link/newline substitutions. */
function renderContent(text: string): string {
  const escaped = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");

  return escaped
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    // Linkify internal paths like /listings, /valuation, /find-my-match
    .replace(
      /(^|[\s(])(\/[a-z][a-z0-9/-]*)/g,
      '$1<a href="$2" class="text-primary underline underline-offset-2 hover:opacity-80">$2</a>',
    )
    // Linkify phone number
    .replace(
      /\+44\s?7446\s?192577/g,
      '<a href="tel:+447446192577" class="text-primary underline underline-offset-2">+44 7446 192577</a>',
    )
    .replace(/\n/g, "<br/>");
}

// ── Spatial character (bounded-roaming gem) ──────────────────────────────────
// See EllieStage.tsx's original skeleton for the wander/wrap/resize model this
// is built on. Differences here: draws a real on-brand gem character instead
// of a placeholder dot, and reacts to chat state (settles when open, livelier
// bob while a reply is loading, bigger bob when there's an unread reply).

const STAGE_SIZE_CSS = "clamp(150px, 20vw, 230px)";
const WANDER_JITTER = 1.2;
const IDLE_SPEED = 0.05;
const CHAR_RADIUS_FRAC = 0.24;
const TARGET_FPS = 30;
const SETTLED_POS = { x: 0.78, y: 0.7 }; // where she eases to while the panel is open

// The character's body outline, expressed as ratios of her own radius, taken
// directly from the brand's diamond logo mark so she reads as "Elite Tenancy"
// at a glance rather than an unrelated mascot.
const GEM_POINTS: Array<[number, number]> = [
  [0, -0.986],
  [0.676, -0.704],
  [0.676, 0.197],
  [0, 1.0],
  [-0.662, 0.183],
  [-0.662, -0.704],
];

function drawGem(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  radius: number,
  tiltRad: number,
  squash: number,
  eyeOpen: number,
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tiltRad);
  ctx.scale(1 / Math.sqrt(squash), Math.sqrt(squash));

  ctx.beginPath();
  GEM_POINTS.forEach(([x, y], i) => {
    const px = x * radius;
    const py = y * radius;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  });
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, -radius, 0, radius);
  grad.addColorStop(0, "#F0D89A");
  grad.addColorStop(0.4, "#D4A24A");
  grad.addColorStop(0.75, "#B8862A");
  grad.addColorStop(1, "#8C6518");
  ctx.fillStyle = grad;
  ctx.shadowColor = "rgba(22, 58, 74, 0.35)";
  ctx.shadowBlur = radius * 0.25;
  ctx.shadowOffsetY = radius * 0.08;
  ctx.fill();
  ctx.shadowColor = "transparent";
  ctx.strokeStyle = "rgba(22, 58, 74, 0.25)";
  ctx.lineWidth = Math.max(1, radius * 0.03);
  ctx.stroke();

  // Face
  const eyeY = -radius * 0.12;
  const eyeSpacing = radius * 0.28;
  const eyeRadius = radius * 0.11;
  ctx.fillStyle = "#163A4A";
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(side * eyeSpacing, eyeY, eyeRadius, eyeRadius * Math.max(0.08, eyeOpen), 0, 0, Math.PI * 2);
    ctx.fill();
  });

  ctx.beginPath();
  ctx.strokeStyle = "#163A4A";
  ctx.lineWidth = Math.max(1.5, radius * 0.045);
  ctx.lineCap = "round";
  const smileY = eyeY + radius * 0.22;
  ctx.moveTo(-radius * 0.16, smileY);
  ctx.quadraticCurveTo(0, smileY + radius * 0.14, radius * 0.16, smileY);
  ctx.stroke();

  ctx.restore();
}

export default function EllieChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "ellie", content: GREETING },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sessionId] = useState<string>(
    () => `${Date.now()}-${Math.random().toString(36).slice(2)}`,
  );
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRegionRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const modeRef = useRef<"wander" | "settled" | "talking">("wander");
  const unreadRef = useRef(0);

  useEffect(() => {
    modeRef.current = open ? "settled" : loading ? "talking" : "wander";
  }, [open, loading]);

  useEffect(() => {
    unreadRef.current = unread;
  }, [unread]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // ── Spatial animation engine ────────────────────────────────────────────
  useEffect(() => {
    const stage = stageRef.current;
    const canvas = canvasRef.current;
    if (!stage || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let stageWidth = 0;
    let stageHeight = 0;

    function resize() {
      const rect = stage!.getBoundingClientRect();
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
    ro.observe(stage);
    resize();

    function placeOverlays(cx: number, cy: number, r: number) {
      if (hitRegionRef.current) {
        hitRegionRef.current.style.left = `${cx - r}px`;
        hitRegionRef.current.style.top = `${cy - r}px`;
        hitRegionRef.current.style.width = `${r * 2}px`;
        hitRegionRef.current.style.height = `${r * 2}px`;
      }
      if (badgeRef.current) {
        badgeRef.current.style.left = `${cx + r * 0.55}px`;
        badgeRef.current.style.top = `${cy - r * 0.95}px`;
      }
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const r = Math.min(stageWidth, stageHeight) * CHAR_RADIUS_FRAC;
      const cx = 0.5 * stageWidth;
      const cy = 0.55 * stageHeight;
      ctx.clearRect(0, 0, stageWidth, stageHeight);
      drawGem(ctx, cx, cy, r, 0, 1, 1);
      placeOverlays(cx, cy, r);
      return () => ro.disconnect();
    }

    const pos = { x: 0.5, y: 0.55 };
    let heading = Math.random() * Math.PI * 2;
    let bobPhase = 0;
    let blinkTimer = 2 + Math.random() * 3;
    let blinkPhase = 0;

    function draw() {
      const r = Math.min(stageWidth, stageHeight) * CHAR_RADIUS_FRAC;
      ctx!.clearRect(0, 0, stageWidth, stageHeight);

      const mode = modeRef.current;
      const eyeOpen = blinkPhase > 0 ? Math.max(0, Math.cos(Math.min(blinkPhase, 1) * Math.PI)) : 1;
      const bobAmp = mode === "talking" ? 0.06 : mode === "wander" && unreadRef.current > 0 ? 0.055 : 0.035;
      const bobY = Math.sin(bobPhase) * bobAmp;
      const squash = 1 + Math.sin(bobPhase) * 0.05;
      const tilt = mode === "wander" ? Math.sin(heading) * 0.14 : 0;

      const at = (x: number, y: number) => drawGem(ctx!, x * stageWidth, (y + bobY) * stageHeight, r, tilt, squash, eyeOpen);

      at(pos.x, pos.y);
      if (mode === "wander") {
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

      placeOverlays(pos.x * stageWidth, (pos.y + bobY) * stageHeight, r);
    }

    let rafId = 0;
    let lastFrameTime = 0;
    let lastStepTime = performance.now();
    const frameInterval = 1000 / TARGET_FPS;
    let visible = document.visibilityState === "visible";

    function loop(now: number) {
      if (!visible) return;
      rafId = requestAnimationFrame(loop);
      if (now - lastFrameTime < frameInterval) return;
      const dt = Math.min((now - lastStepTime) / 1000, 0.1);
      lastStepTime = now;
      lastFrameTime = now;

      const mode = modeRef.current;
      bobPhase += dt * (mode === "talking" ? 5.5 : 2.4);

      blinkTimer -= dt;
      if (blinkTimer <= 0 && blinkPhase === 0) blinkPhase = 0.0001;
      if (blinkPhase > 0) {
        blinkPhase += dt / 0.12;
        if (blinkPhase >= 1) {
          blinkPhase = 0;
          blinkTimer = 2.5 + Math.random() * 3.5;
        }
      }

      if (mode === "wander") {
        heading += (Math.random() - 0.5) * WANDER_JITTER * dt;
        pos.x += Math.cos(heading) * IDLE_SPEED * dt;
        pos.y += Math.sin(heading) * IDLE_SPEED * dt;
        pos.x = ((pos.x % 1) + 1) % 1;
        pos.y = ((pos.y % 1) + 1) % 1;
      } else {
        // "settled" (panel open) and "talking" (reply in flight) both ease
        // back to a resting spot near her own corner instead of wandering.
        pos.x += (SETTLED_POS.x - pos.x) * Math.min(1, dt * 3);
        pos.y += (SETTLED_POS.y - pos.y) * Math.min(1, dt * 3);
      }

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

  async function send(text?: string) {
    const msg = (text ?? input).trim();
    if (!msg || loading) return;
    setInput("");
    const newMessages: Message[] = [...messages, { role: "user", content: msg }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.BASE_URL}api/ellie/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: msg, sessionId }),
      });
      const data = await res.json();
      const reply =
        data.reply ?? "Sorry, I couldn't get a response. Please try again.";
      setMessages([...newMessages, { role: "ellie", content: reply }]);
      if (!open) setUnread((n) => n + 1);
    } catch {
      setMessages([
        ...newMessages,
        {
          role: "ellie",
          content:
            "Sorry, something went wrong. Please try again in a moment, or call us on **+44 7446 192577** 🏡",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function resetConversation() {
    setMessages([{ role: "ellie", content: GREETING }]);
    setInput("");
  }

  return (
    <>
      {/* Roaming character stage */}
      <div
        ref={stageRef}
        className="fixed z-50"
        style={{
          right: "24px",
          bottom: "24px",
          width: STAGE_SIZE_CSS,
          height: STAGE_SIZE_CSS,
          pointerEvents: "none",
        }}
      >
        <canvas style={{ display: "block", width: "100%", height: "100%" }} ref={canvasRef} />

        <AnimatePresence>
          {!open && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              className="absolute top-0 right-0 bg-card border border-primary/30 rounded-xl px-3 py-2 shadow-lg text-xs text-muted-foreground flex items-center gap-2 whitespace-nowrap"
              style={{ pointerEvents: "none" }}
            >
              <Home size={11} className="text-primary" />
              Chat with Ellie
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          ref={hitRegionRef}
          onClick={() => setOpen(!open)}
          aria-label={open ? "Close chat" : "Open chat with Ellie"}
          className="absolute rounded-full"
          style={{ pointerEvents: "auto", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        />

        {unread > 0 && !open && (
          <span
            ref={badgeRef}
            className="absolute w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold"
            style={{ pointerEvents: "none" }}
          >
            {unread}
          </span>
        )}
      </div>

      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.95 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
            style={{ maxHeight: "520px", bottom: `calc(${STAGE_SIZE_CSS} + 16px)` }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 bg-gradient-to-r from-card to-card/80 shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                <Home size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-foreground text-sm">Ellie</p>
                <p className="text-xs text-muted-foreground">
                  Elite Tenancy Letting Assistant
                </p>
              </div>
              <button
                onClick={resetConversation}
                className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw size={13} />
              </button>
              <div className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">Online</span>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "ellie" && (
                    <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                      <Home size={11} className="text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[82%] px-3 py-2 rounded-xl text-xs leading-relaxed ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted/60 text-foreground rounded-bl-sm"
                    }`}
                    dangerouslySetInnerHTML={{ __html: renderContent(msg.content) }}
                  />
                </motion.div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 mr-2">
                    <Home size={11} className="text-primary" />
                  </div>
                  <div className="bg-muted/60 rounded-xl rounded-bl-sm px-3 py-2">
                    <TypingDots />
                  </div>
                </div>
              )}

              {/* Starter prompts */}
              {messages.length === 1 && !loading && (
                <div className="grid grid-cols-2 gap-1.5 mt-2">
                  {STARTERS.map((s) => (
                    <button
                      key={s}
                      onClick={() => send(s)}
                      className="text-left text-xs px-2.5 py-2 rounded-lg bg-muted/40 hover:bg-muted/70 text-muted-foreground hover:text-foreground transition-colors leading-snug border border-border/30"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-border/50 shrink-0">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  send();
                }}
                className="flex items-center gap-2"
              >
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask Ellie anything…"
                  className="flex-1 bg-background text-foreground text-xs rounded-lg px-3 py-2.5 border border-border/40 outline-none focus:border-primary/50 placeholder:text-muted-foreground/60 transition-colors"
                  disabled={loading}
                />
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  aria-label="Send message"
                  className="w-9 h-9 rounded-lg bg-primary text-primary-foreground flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Send size={14} />
                </button>
              </form>
              <p className="text-center text-[10px] text-muted-foreground/50 mt-1.5">
                Ellie · Elite Tenancy AI Assistant
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
