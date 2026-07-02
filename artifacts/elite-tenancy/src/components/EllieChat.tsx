import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Send, RotateCcw, Mic, MicOff, Globe, Volume2, VolumeX } from "lucide-react";

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

// ── Multi-language voice support ──────────────────────────────────────────────
const LANGUAGES: Array<{ code: string; label: string }> = [
  { code: "en-GB", label: "English (UK)" },
  { code: "en-US", label: "English (US)" },
  { code: "en-IN", label: "English (India)" },
  { code: "es-ES", label: "Español" },
  { code: "fr-FR", label: "Français" },
  { code: "de-DE", label: "Deutsch" },
  { code: "it-IT", label: "Italiano" },
  { code: "pt-PT", label: "Português" },
  { code: "nl-NL", label: "Nederlands" },
  { code: "pl-PL", label: "Polski" },
  { code: "hi-IN", label: "हिन्दी" },
  { code: "ur-PK", label: "اُردُو" },
  { code: "ar-SA", label: "العربية" },
  { code: "zh-CN", label: "中文" },
  { code: "ja-JP", label: "日本語" },
  { code: "ko-KR", label: "한국어" },
  { code: "ru-RU", label: "Русский" },
  { code: "tr-TR", label: "Türkçe" },
];
const WAKE_PHRASE = "hey ellie";
const VOICE_MODE_KEY = "et_ellie_voice_mode";
const VOICE_LANG_KEY = "et_ellie_voice_lang";
const SOUND_KEY = "et_ellie_sound";

function pickInitialLang(): string {
  if (typeof navigator === "undefined") return "en-GB";
  const nav = navigator.language;
  if (LANGUAGES.some((l) => l.code === nav)) return nav;
  const primary = nav.split("-")[0];
  const found = LANGUAGES.find((l) => l.code.startsWith(primary + "-"));
  return found?.code ?? "en-GB";
}

interface SR extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((this: SR, e: { results: ArrayLike<{ 0: { transcript: string }; isFinal: boolean; length: number }> & { length: number } }) => void) | null;
  onerror: ((this: SR, e: { error: string }) => void) | null;
  onend: ((this: SR) => void) | null;
}
type SRCtor = new () => SR;

function getSpeechRecognitionCtor(): SRCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor };
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

function textForSpeech(input: string): string {
  return input
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\/[a-z][a-z0-9/-]*/gi, " ")
    .replace(/[🏡🏠✅❌🔑💷📞😊👋]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

// ── Sound engine ──────────────────────────────────────────────────────────────
// All sounds are synthesized via Web Audio API — no external files. Two sounds:
// a bell "ding!" (Ellie IS a concierge bell — this is her signature) and tiny
// per-letter speech blips while her replies type out, PvZ-dialogue style.
let sharedAudioCtx: AudioContext | null = null;
function getAudioCtx(): AudioContext | null {
  try {
    if (!sharedAudioCtx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;
      sharedAudioCtx = new AudioCtx();
    }
    if (sharedAudioCtx.state === "suspended") void sharedAudioCtx.resume();
    return sharedAudioCtx;
  } catch {
    return null;
  }
}

/** Ellie's signature "ding!" — a bright bell strike with a soft harmonic. */
function playDing() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  [
    { freq: 1318.5, gain: 0.16, dur: 0.55 }, // E6 fundamental
    { freq: 1975.5, gain: 0.07, dur: 0.4 },  // B6 harmonic shimmer
  ].forEach(({ freq, gain, dur }) => {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = "sine";
    osc.frequency.value = freq;
    g.gain.setValueAtTime(0, ctx.currentTime);
    g.gain.linearRampToValueAtTime(gain, ctx.currentTime + 0.008);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
    osc.connect(g).connect(ctx.destination);
    osc.start(ctx.currentTime);
    osc.stop(ctx.currentTime + dur + 0.05);
  });
}

/** Tiny per-letter speech blip — random pitch so it never sounds robotic. */
function playBlip() {
  const ctx = getAudioCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = "triangle";
  osc.frequency.value = 330 * (0.88 + Math.random() * 0.28);
  g.gain.setValueAtTime(0, ctx.currentTime);
  g.gain.linearRampToValueAtTime(0.045, ctx.currentTime + 0.005);
  g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.055);
  osc.connect(g).connect(ctx.destination);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.08);
}

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

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

/** Escape HTML, then apply safe bold/italic/link/newline substitutions. */
function renderContent(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(
      /(^|[\s(])(\/[a-z][a-z0-9/-]*)/g,
      '$1<a href="$2" class="text-primary underline underline-offset-2 hover:opacity-80">$2</a>',
    )
    .replace(
      /\+44\s?7446\s?192577/g,
      '<a href="tel:+447446192577" class="text-primary underline underline-offset-2">+44 7446 192577</a>',
    )
    .replace(/\n/g, "<br/>");
}

// ── Ellie the Concierge Bell ──────────────────────────────────────────────────
// Original character: a polished gold desk-bell with big navy eyes, eyebrows,
// blush, a name tag, stubby legs, and the press-button on top. The bell shape
// is the universal shorthand for premium at-your-service hospitality — exactly
// the brand promise — and it gives her a built-in signature sound (the ding).
// All shapes drawn with canvas paths + gradients; pseudo-3D via a light-source
// gradient on the dome, a highlight crescent, and a soft ground shadow.

const GOLD_LIGHT = "#F0CE83";
const GOLD = "#D4A24A";
const GOLD_DEEP = "#A67A2E";
const NAVY = "#163A4A";
const NAVY_DEEP = "#0D2530";
const CREAM = "#FAF8F4";
const BLUSH = "rgba(232, 167, 140, 0.45)";

type Pose = "idle" | "listening" | "thinking" | "speaking";

interface DrawState {
  pose: Pose;
  phase: number;    // global animation clock (radians-ish)
  eyeOpen: number;  // 1 open … 0 closed
  tilt: number;     // whole-body lean, radians
  ding: number;     // 1 just-dinged … 0 settled (drives squash + arcs)
  mouth: number;    // 0 closed smile … 1 fully open (speaking flap)
}

function drawEllie(ctx: CanvasRenderingContext2D, cx: number, groundY: number, H: number, s: DrawState) {
  const u = H / 100; // 1 unit = 1% of character height
  const squash = 1 - s.ding * 0.09;
  const spread = 1 + s.ding * 0.07;

  ctx.save();
  // Squash-and-stretch about the ground point (feet stay planted)
  ctx.translate(cx, groundY);
  ctx.rotate(s.tilt);
  ctx.scale(spread, squash);
  ctx.translate(-cx, -groundY);

  // Ground shadow
  ctx.beginPath();
  ctx.ellipse(cx, groundY - 1 * u, 30 * u * spread, 5 * u, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(13, 37, 48, 0.22)";
  ctx.fill();

  // Legs + shoe plates (navy)
  [-1, 1].forEach((side) => {
    const lx = cx + side * 9 * u;
    ctx.beginPath();
    ctx.roundRect(lx - 3 * u, groundY - 15 * u, 6 * u, 12 * u, 3 * u);
    ctx.fillStyle = NAVY;
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(lx + side * 1.5 * u, groundY - 2.5 * u, 7 * u, 3 * u, 0, 0, Math.PI * 2);
    ctx.fillStyle = NAVY_DEEP;
    ctx.fill();
  });

  const domeBaseY = groundY - 13 * u;
  const domeTopY = groundY - 62 * u;
  const domeHalfW = 31 * u;

  // Arms (gold stubs) — pose-dependent
  const armY = groundY - 34 * u;
  const drawArm = (side: number, raise: number, out: number) => {
    const sx = cx + side * (domeHalfW - 2 * u);
    const ex = sx + side * out * u;
    const ey = armY - raise * u;
    ctx.beginPath();
    ctx.moveTo(sx, armY);
    ctx.quadraticCurveTo(sx + side * 6 * u, (armY + ey) / 2, ex, ey);
    ctx.lineWidth = 5.5 * u;
    ctx.lineCap = "round";
    ctx.strokeStyle = GOLD_DEEP;
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(ex, ey, 3.6 * u, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    ctx.strokeStyle = "rgba(13,37,48,0.3)";
    ctx.lineWidth = 0.8 * u;
    ctx.stroke();
  };
  const wave = Math.sin(s.phase * 3) * 4;
  if (s.pose === "listening") {
    drawArm(-1, 4, 7);
    drawArm(1, 26 + wave * 0.5, 4); // hand up near "ear"
  } else if (s.pose === "thinking") {
    drawArm(-1, 2, 6);
    drawArm(1, 18, -2); // hand toward chin
  } else if (s.pose === "speaking") {
    drawArm(-1, 8 + wave, 9);
    drawArm(1, 8 - wave, 9); // gesturing while talking
  } else {
    drawArm(-1, 2, 7);
    drawArm(1, 2, 7);
  }

  // Dome body — gold hemisphere with flat bottom
  ctx.beginPath();
  ctx.moveTo(cx - domeHalfW, domeBaseY);
  ctx.bezierCurveTo(
    cx - domeHalfW, domeTopY + 8 * u,
    cx - 18 * u, domeTopY,
    cx, domeTopY,
  );
  ctx.bezierCurveTo(
    cx + 18 * u, domeTopY,
    cx + domeHalfW, domeTopY + 8 * u,
    cx + domeHalfW, domeBaseY,
  );
  ctx.closePath();
  const domeGrad = ctx.createRadialGradient(cx - 12 * u, domeTopY + 14 * u, 2 * u, cx, domeBaseY - 20 * u, 48 * u);
  domeGrad.addColorStop(0, GOLD_LIGHT);
  domeGrad.addColorStop(0.45, GOLD);
  domeGrad.addColorStop(1, GOLD_DEEP);
  ctx.fillStyle = domeGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(13, 37, 48, 0.35)";
  ctx.lineWidth = 1 * u;
  ctx.stroke();

  // Highlight crescent (upper-left polish sheen)
  ctx.beginPath();
  ctx.ellipse(cx - 13 * u, domeTopY + 13 * u, 9 * u, 4.5 * u, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 248, 228, 0.55)";
  ctx.fill();

  // Navy rim band across the base of the dome
  ctx.beginPath();
  ctx.roundRect(cx - domeHalfW - 1.5 * u, domeBaseY - 5 * u, (domeHalfW + 1.5 * u) * 2, 6.5 * u, 3 * u);
  const rimGrad = ctx.createLinearGradient(cx, domeBaseY - 5 * u, cx, domeBaseY + 1.5 * u);
  rimGrad.addColorStop(0, "#1F4A5E");
  rimGrad.addColorStop(1, NAVY_DEEP);
  ctx.fillStyle = rimGrad;
  ctx.fill();

  // Name tag (cream, hanging from a thin navy ribbon at the dome base)
  const tagY = domeBaseY - 9 * u;
  ctx.beginPath();
  ctx.moveTo(cx - 3 * u, tagY - 4 * u);
  ctx.lineTo(cx, tagY - 1 * u);
  ctx.lineTo(cx + 3 * u, tagY - 4 * u);
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 1 * u;
  ctx.stroke();
  ctx.beginPath();
  ctx.roundRect(cx - 7.5 * u, tagY - 1 * u, 15 * u, 7 * u, 1.5 * u);
  ctx.fillStyle = CREAM;
  ctx.fill();
  ctx.strokeStyle = "rgba(13,37,48,0.4)";
  ctx.lineWidth = 0.6 * u;
  ctx.stroke();
  // Suggest "ELITE" lettering with tiny strokes (legible text impossible at this size)
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 1.1 * u;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 4.5 * u, tagY + 2.5 * u);
  ctx.lineTo(cx + 4.5 * u, tagY + 2.5 * u);
  ctx.stroke();

  // ── Face ──
  const eyeY = domeTopY + 22 * u;
  const eyeDX = 10 * u;
  const eyeW = 5.6 * u;
  const eyeH = 7 * u;
  const look = s.pose === "thinking" ? { x: -1.6 * u, y: -1.8 * u } : s.pose === "listening" ? { x: Math.sin(s.phase * 0.8) * 1.2 * u, y: -0.6 * u } : { x: Math.sin(s.phase * 0.35) * 0.8 * u, y: 0 };

  // Eyebrows — the main mood carrier
  ctx.strokeStyle = NAVY;
  ctx.lineWidth = 1.5 * u;
  ctx.lineCap = "round";
  [-1, 1].forEach((side) => {
    const bx = cx + side * eyeDX;
    let by = eyeY - eyeH - 3 * u;
    let curl = 2.5 * u;
    if (s.pose === "listening") by -= 1.8 * u;          // raised, attentive
    if (s.pose === "thinking") { by -= side === -1 ? 2.2 * u : 0; curl = 1.8 * u; } // asymmetric, pondering
    ctx.beginPath();
    ctx.moveTo(bx - 3.5 * u, by + curl * 0.4);
    ctx.quadraticCurveTo(bx, by - curl * 0.6, bx + 3.5 * u, by + curl * 0.4);
    ctx.stroke();
  });

  // Eyes — big navy almonds with sparkle highlights
  [-1, 1].forEach((side) => {
    const ex = cx + side * eyeDX + look.x;
    const eh = eyeH * Math.max(0.07, s.eyeOpen);
    ctx.beginPath();
    ctx.ellipse(ex, eyeY + look.y, eyeW, eh, 0, 0, Math.PI * 2);
    ctx.fillStyle = NAVY;
    ctx.fill();
    if (s.eyeOpen > 0.3) {
      ctx.beginPath();
      ctx.arc(ex + 1.6 * u, eyeY + look.y - eh * 0.35, 1.7 * u * s.eyeOpen, 0, Math.PI * 2);
      ctx.fillStyle = CREAM;
      ctx.fill();
      ctx.beginPath();
      ctx.arc(ex - 1.4 * u, eyeY + look.y + eh * 0.3, 0.8 * u * s.eyeOpen, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(250,248,244,0.7)";
      ctx.fill();
    }
  });

  // Blush
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(cx + side * 17 * u, eyeY + 7 * u, 3.5 * u, 2 * u, 0, 0, Math.PI * 2);
    ctx.fillStyle = BLUSH;
    ctx.fill();
  });

  // Mouth
  const mouthY = eyeY + 11 * u;
  ctx.strokeStyle = NAVY;
  ctx.fillStyle = NAVY;
  ctx.lineWidth = 1.4 * u;
  ctx.lineCap = "round";
  if (s.mouth > 0.15) {
    // Open — rounded 'o' scaled by mouth amount
    ctx.beginPath();
    ctx.ellipse(cx, mouthY + 1 * u, 2.6 * u, (1.5 + s.mouth * 2.6) * u, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx, mouthY + 1.8 * u, 1.4 * u, s.mouth * 1.2 * u, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#E88264";
    ctx.fill();
  } else if (s.pose === "thinking") {
    ctx.beginPath();
    ctx.moveTo(cx - 2.5 * u, mouthY + 0.5 * u);
    ctx.lineTo(cx + 2.5 * u, mouthY);
    ctx.stroke();
  } else {
    const w = s.pose === "listening" ? 4.2 * u : 3.4 * u;
    ctx.beginPath();
    ctx.moveTo(cx - w, mouthY - 0.5 * u);
    ctx.quadraticCurveTo(cx, mouthY + 2.2 * u, cx + w, mouthY - 0.5 * u);
    ctx.stroke();
  }

  // Top press-button (dips when dinged)
  const btnDip = s.ding * 2.5 * u;
  ctx.beginPath();
  ctx.roundRect(cx - 6 * u, domeTopY - 5.5 * u + btnDip, 12 * u, 6.5 * u, 2.5 * u);
  const btnGrad = ctx.createLinearGradient(cx, domeTopY - 5.5 * u + btnDip, cx, domeTopY + 1 * u + btnDip);
  btnGrad.addColorStop(0, GOLD_LIGHT);
  btnGrad.addColorStop(1, GOLD_DEEP);
  ctx.fillStyle = btnGrad;
  ctx.fill();
  ctx.strokeStyle = "rgba(13,37,48,0.35)";
  ctx.lineWidth = 0.8 * u;
  ctx.stroke();

  ctx.restore();

  // ── Un-squashed overlays (drawn outside the body transform) ──

  // "Ding!" arcs radiating from the button
  if (s.ding > 0.05) {
    ctx.strokeStyle = `rgba(22, 58, 74, ${s.ding * 0.75})`;
    ctx.lineWidth = 1.6 * u;
    ctx.lineCap = "round";
    const spreadR = (1 - s.ding) * 6 * u;
    [-1, 1].forEach((side) => {
      ctx.beginPath();
      ctx.arc(cx + side * 10 * u, groundY - 66 * u, 5 * u + spreadR, side === -1 ? Math.PI * 1.05 : Math.PI * 1.55, side === -1 ? Math.PI * 1.45 : Math.PI * 1.95);
      ctx.stroke();
    });
  }

  // Thinking dots rising beside the button
  if (s.pose === "thinking") {
    for (let i = 0; i < 3; i++) {
      const a = Math.max(0.2, (Math.sin(s.phase * 2.2 + i * 0.9) + 1) * 0.45);
      const rr = (1.6 + i * 0.9) * u;
      ctx.beginPath();
      ctx.arc(cx + (12 + i * 6) * u, groundY - (68 + i * 7) * u, rr, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(250, 248, 244, ${a})`;
      ctx.fill();
      ctx.strokeStyle = `rgba(22, 58, 74, ${a * 0.5})`;
      ctx.lineWidth = 0.7 * u;
      ctx.stroke();
    }
  }

  // Listening halo — soft pulsing ring
  if (s.pose === "listening") {
    const pulse = (Math.sin(s.phase * 2.5) + 1) * 0.5;
    ctx.beginPath();
    ctx.arc(cx, groundY - 38 * u, (38 + pulse * 5) * u, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(212, 162, 74, ${0.35 - pulse * 0.2})`;
    ctx.lineWidth = 1.5 * u;
    ctx.stroke();
  }
}

const STAGE_SIZE_CSS = "clamp(160px, 22vw, 250px)";
const WANDER_JITTER = 1.2;
const IDLE_SPEED = 0.05;
const CHAR_H_FRAC = 0.62; // character height as fraction of stage min-dimension
const TARGET_FPS = 30;
const SETTLED_POS = { x: 0.6, y: 0.62 };

export default function EllieChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "ellie", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sessionId] = useState<string>(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Typewriter: index of the message currently being revealed + revealed char count
  const [typing, setTyping] = useState<{ index: number; count: number } | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const soundOnRef = useRef(true);

  // Voice mode state
  const [voiceOn, setVoiceOn] = useState(false);
  const [langCode, setLangCode] = useState<string>(pickInitialLang);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [voiceHint, setVoiceHint] = useState<string | null>(null);
  const [voiceListening, setVoiceListening] = useState(false);
  const recognitionRef = useRef<SR | null>(null);
  const wantsVoiceRef = useRef(false);
  const capturingQueryRef = useRef(false);
  const queryBufferRef = useRef("");
  const querySilenceTimerRef = useRef<number | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hitRegionRef = useRef<HTMLButtonElement>(null);
  const badgeRef = useRef<HTMLSpanElement>(null);
  const poseRef = useRef<Pose>("idle");
  const modeRef = useRef<"wander" | "settled">("wander");
  const unreadRef = useRef(0);
  const dingRef = useRef(0);

  useEffect(() => {
    setVoiceSupported(getSpeechRecognitionCtor() !== null);
    if (localStorage.getItem(VOICE_MODE_KEY) === "1") setVoiceOn(true);
    const savedLang = localStorage.getItem(VOICE_LANG_KEY);
    if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) setLangCode(savedLang);
    if (localStorage.getItem(SOUND_KEY) === "0") setSoundOn(false);
  }, []);

  useEffect(() => { localStorage.setItem(VOICE_MODE_KEY, voiceOn ? "1" : "0"); }, [voiceOn]);
  useEffect(() => { localStorage.setItem(VOICE_LANG_KEY, langCode); }, [langCode]);
  useEffect(() => { localStorage.setItem(SOUND_KEY, soundOn ? "1" : "0"); soundOnRef.current = soundOn; }, [soundOn]);

  useEffect(() => {
    modeRef.current = open ? "settled" : "wander";
    poseRef.current = loading ? "thinking" : voiceListening ? "listening" : typing ? "speaking" : "idle";
  }, [open, loading, voiceListening, typing]);

  useEffect(() => { unreadRef.current = unread; }, [unread]);

  useEffect(() => {
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, typing]);

  // ── Typewriter reveal for the latest Ellie reply (with PvZ-style blips) ────
  useEffect(() => {
    if (!typing) return;
    const msg = messages[typing.index];
    if (!msg || msg.role !== "ellie") { setTyping(null); return; }
    if (typing.count >= msg.content.length) { setTyping(null); return; }

    const t = window.setTimeout(() => {
      const next = Math.min(msg.content.length, typing.count + 2);
      // Blip roughly every 3rd tick, skipping whitespace; silent when TTS is speaking
      if (
        soundOnRef.current &&
        next % 6 < 2 &&
        msg.content[typing.count] !== " " &&
        !(typeof window !== "undefined" && "speechSynthesis" in window && window.speechSynthesis.speaking)
      ) {
        playBlip();
      }
      setTyping({ index: typing.index, count: next });
    }, 24);
    return () => window.clearTimeout(t);
  }, [typing, messages]);

  const triggerDing = useCallback(() => {
    dingRef.current = 1;
    if (soundOnRef.current) playDing();
  }, []);

  // ── send message (shared by text form + voice) ─────────────────────────────
  const send = useCallback(
    async (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg || loading) return;
      setInput("");
      setTyping(null); // finish any in-flight reveal instantly
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
        const reply = data.reply ?? "Sorry, I couldn't get a response. Please try again.";
        setMessages([...newMessages, { role: "ellie", content: reply }]);
        setTyping({ index: newMessages.length, count: 0 });
        if (!open) setUnread((n) => n + 1);

        if (wantsVoiceRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            const utter = new SpeechSynthesisUtterance(textForSpeech(reply));
            utter.lang = langCode;
            const voices = window.speechSynthesis.getVoices();
            const match = voices.find((v) => v.lang === langCode) ?? voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
            if (match) utter.voice = match;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          } catch { /* TTS unavailable */ }
        }
      } catch {
        const errMsg = "Sorry, something went wrong. Please try again in a moment, or call us on **+44 7446 192577** 🏡";
        setMessages([...newMessages, { role: "ellie", content: errMsg }]);
        setTyping({ index: newMessages.length, count: 0 });
      } finally {
        setLoading(false);
      }
    },
    [input, loading, messages, open, sessionId, langCode],
  );

  // ── Voice wake-word listener ───────────────────────────────────────────────
  useEffect(() => {
    wantsVoiceRef.current = voiceOn;
    if (!voiceOn) {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setVoiceListening(false);
      return;
    }

    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor) {
      setVoiceHint("Voice isn't supported in this browser — try Chrome or Edge.");
      setVoiceOn(false);
      return;
    }

    let cancelled = false;
    const rec = new Ctor();
    rec.lang = langCode;
    rec.continuous = true;
    rec.interimResults = true;
    recognitionRef.current = rec;
    setVoiceHint(null);

    rec.onresult = (e) => {
      if (cancelled) return;
      let combined = "";
      for (let i = 0; i < e.results.length; i++) combined += e.results[i][0].transcript + " ";
      const lower = combined.toLowerCase();

      if (!capturingQueryRef.current) {
        const idx = lower.indexOf(WAKE_PHRASE);
        if (idx !== -1) {
          capturingQueryRef.current = true;
          queryBufferRef.current = lower.slice(idx + WAKE_PHRASE.length).trim();
          setVoiceListening(true);
          triggerDing();
          setOpen(true);
          if (querySilenceTimerRef.current) window.clearTimeout(querySilenceTimerRef.current);
          querySilenceTimerRef.current = window.setTimeout(() => {
            const q = queryBufferRef.current.trim();
            capturingQueryRef.current = false;
            setVoiceListening(false);
            queryBufferRef.current = "";
            if (q) send(q);
          }, 3500);
        }
      } else {
        const wakeIdx = lower.lastIndexOf(WAKE_PHRASE);
        queryBufferRef.current = wakeIdx !== -1 ? lower.slice(wakeIdx + WAKE_PHRASE.length).trim() : lower.trim();
        if (querySilenceTimerRef.current) window.clearTimeout(querySilenceTimerRef.current);
        querySilenceTimerRef.current = window.setTimeout(() => {
          const q = queryBufferRef.current.trim();
          capturingQueryRef.current = false;
          setVoiceListening(false);
          queryBufferRef.current = "";
          if (q) send(q);
        }, 1600);
      }
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        setVoiceHint("Microphone permission denied. Voice mode turned off.");
        setVoiceOn(false);
      } else if (e.error !== "no-speech") {
        setVoiceHint(`Voice error: ${e.error}`);
      }
    };

    rec.onend = () => {
      if (!cancelled && wantsVoiceRef.current) {
        try { rec.start(); } catch { /* already starting */ }
      }
    };

    try {
      rec.start();
    } catch {
      setVoiceHint("Couldn't start the microphone.");
      setVoiceOn(false);
      return;
    }

    return () => {
      cancelled = true;
      capturingQueryRef.current = false;
      queryBufferRef.current = "";
      setVoiceListening(false);
      if (querySilenceTimerRef.current) window.clearTimeout(querySilenceTimerRef.current);
      try { rec.abort(); } catch { /* ignore */ }
    };
  }, [voiceOn, langCode, send, triggerDing]);

  // ── Spatial animation engine ───────────────────────────────────────────────
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

    function placeOverlays(cx: number, groundY: number, H: number) {
      if (hitRegionRef.current) {
        hitRegionRef.current.style.left = `${cx - H * 0.4}px`;
        hitRegionRef.current.style.top = `${groundY - H}px`;
        hitRegionRef.current.style.width = `${H * 0.8}px`;
        hitRegionRef.current.style.height = `${H}px`;
      }
      if (badgeRef.current) {
        badgeRef.current.style.left = `${cx + H * 0.28}px`;
        badgeRef.current.style.top = `${groundY - H * 0.95}px`;
      }
    }

    const baseState = (): DrawState => ({
      pose: poseRef.current, phase: 0, eyeOpen: 1, tilt: 0, ding: 0, mouth: 0,
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const H = Math.min(stageWidth, stageHeight) * CHAR_H_FRAC;
      const cx = 0.55 * stageWidth;
      const groundY = 0.6 * stageHeight + H / 2;
      ctx.clearRect(0, 0, stageWidth, stageHeight);
      drawEllie(ctx, cx, groundY, H, baseState());
      placeOverlays(cx, groundY, H);
      return () => ro.disconnect();
    }

    const pos = { x: 0.55, y: 0.55 };
    let heading = Math.random() * Math.PI * 2;
    let phase = 0;
    let blinkTimer = 2 + Math.random() * 3;
    let blinkPhase = 0;

    function draw() {
      const H = Math.min(stageWidth, stageHeight) * CHAR_H_FRAC;
      ctx!.clearRect(0, 0, stageWidth, stageHeight);

      const mode = modeRef.current;
      const pose = poseRef.current;
      const eyeOpen = blinkPhase > 0 ? Math.max(0, Math.cos(Math.min(blinkPhase, 1) * Math.PI)) : 1;
      const bobAmp = mode === "wander" && unreadRef.current > 0 ? 0.05 : 0.03;
      const bobY = Math.sin(phase) * bobAmp;
      const tilt = mode === "wander" ? Math.sin(heading) * 0.1 : Math.sin(phase * 0.6) * 0.015;
      const mouth = pose === "speaking" ? Math.max(0, Math.sin(phase * 6)) : 0;

      const state: DrawState = { pose, phase, eyeOpen, tilt, ding: dingRef.current, mouth };

      const cx = pos.x * stageWidth;
      const groundY = (pos.y + bobY) * stageHeight + H / 2;
      drawEllie(ctx!, cx, groundY, H, state);

      // Toroidal ghost copies while wandering
      if (mode === "wander") {
        const f = 0.4;
        if (pos.x < f) drawEllie(ctx!, (pos.x + 1) * stageWidth, groundY, H, state);
        if (pos.x > 1 - f) drawEllie(ctx!, (pos.x - 1) * stageWidth, groundY, H, state);
        if (pos.y < f) drawEllie(ctx!, cx, groundY + stageHeight, H, state);
        if (pos.y > 1 - f) drawEllie(ctx!, cx, groundY - stageHeight, H, state);
      }

      placeOverlays(cx, groundY, H);
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
      const pose = poseRef.current;
      phase += dt * (pose === "speaking" ? 3.2 : pose === "thinking" ? 2.6 : 2.0);

      // Ding decay
      if (dingRef.current > 0) dingRef.current = Math.max(0, dingRef.current - dt * 2.2);

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

  function resetConversation() {
    setMessages([{ role: "ellie", content: GREETING }]);
    setTyping(null);
    setInput("");
  }

  function handleCharacterClick() {
    if (!open) triggerDing();
    setOpen(!open);
  }

  /** Message body — typewriter shows escaped plain text mid-reveal, full markdown once done. */
  function messageHtml(msg: Message, i: number): string {
    if (typing && typing.index === i && msg.role === "ellie") {
      return escapeHtml(msg.content.slice(0, typing.count));
    }
    return renderContent(msg.content);
  }

  return (
    <>
      {/* PvZ-style dialogue layout: on desktop the panel sits BESIDE the
          character with a speech-bubble tail pointing at her; on mobile it
          stacks above her. */}
      <style>{`
        .ellie-dialog {
          position: fixed;
          z-index: 50;
          right: 16px;
          bottom: calc(${STAGE_SIZE_CSS} + 12px);
          width: 360px;
          max-width: calc(100vw - 24px);
          max-height: min(540px, calc(100dvh - ${STAGE_SIZE_CSS} - 24px)) !important;
        }
        @media (min-width: 768px) {
          .ellie-dialog {
            right: calc(${STAGE_SIZE_CSS} + 30px);
            bottom: 44px;
            width: 400px;
            max-height: min(540px, calc(100dvh - 88px)) !important;
          }
          .ellie-dialog-tail {
            display: block !important;
          }
        }
      `}</style>

      {/* Roaming character stage */}
      <div
        ref={stageRef}
        className="fixed z-50"
        style={{
          right: "16px",
          bottom: "16px",
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
              {voiceListening ? "I'm listening…" : voiceOn ? 'Say "Hey Ellie"' : "Chat with Ellie"}
            </motion.div>
          )}
        </AnimatePresence>

        <button
          type="button"
          ref={hitRegionRef}
          onClick={handleCharacterClick}
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

        {voiceOn && !open && (
          <span
            className="absolute bottom-2 right-2 flex items-center justify-center rounded-full bg-primary text-primary-foreground w-7 h-7 shadow-lg"
            style={{ pointerEvents: "none" }}
            aria-hidden="true"
          >
            <Mic size={13} className={voiceListening ? "animate-pulse text-accent" : ""} />
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
            className="ellie-dialog bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-visible"
            style={{ maxHeight: "540px" }}
          >
            {/* Speech-bubble tail pointing at Ellie (desktop only) */}
            <div
              className="ellie-dialog-tail absolute hidden"
              style={{
                right: "-9px",
                bottom: "56px",
                width: "18px",
                height: "18px",
                transform: "rotate(45deg)",
                background: "hsl(var(--card))",
                borderRight: "1px solid hsl(var(--border) / 0.6)",
                borderTop: "1px solid hsl(var(--border) / 0.6)",
              }}
              aria-hidden="true"
            />

            <div className="flex flex-col overflow-hidden rounded-2xl" style={{ maxHeight: "inherit" }}>
              {/* Header */}
              <div className="flex items-center gap-3 px-4 py-3.5 border-b border-border/50 bg-gradient-to-r from-card to-card/80 shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center">
                  <Home size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">Ellie</p>
                  <p className="text-xs text-muted-foreground">
                    {voiceListening ? "Listening…" : "Elite Tenancy Letting Assistant"}
                  </p>
                </div>
                <button
                  onClick={() => setSoundOn((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                  title={soundOn ? "Mute sounds" : "Unmute sounds"}
                  aria-label={soundOn ? "Mute sounds" : "Unmute sounds"}
                >
                  {soundOn ? <Volume2 size={13} /> : <VolumeX size={13} />}
                </button>
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

              {/* Voice mode controls */}
              <div className="px-4 py-2.5 border-b border-border/40 bg-muted/20 flex items-center gap-2 shrink-0">
                <button
                  onClick={() => { if (voiceSupported) setVoiceOn((v) => !v); }}
                  disabled={!voiceSupported}
                  className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-lg transition-colors ${
                    voiceOn ? "bg-primary text-primary-foreground" : "bg-card border border-border/60 text-foreground hover:bg-muted/50"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                  aria-label={voiceOn ? "Turn off voice mode" : "Turn on voice mode"}
                >
                  {voiceOn ? <Mic size={12} /> : <MicOff size={12} />}
                  {voiceOn ? 'Voice on — say "Hey Ellie"' : "Turn on voice"}
                </button>
                <div className="ml-auto flex items-center gap-1.5">
                  <Globe size={12} className="text-muted-foreground" />
                  <select
                    value={langCode}
                    onChange={(e) => setLangCode(e.target.value)}
                    className="text-xs bg-transparent border border-border/40 rounded px-1.5 py-1 text-foreground focus:outline-none focus:border-primary/50"
                    aria-label="Voice language"
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              {voiceHint && (
                <div className="px-4 py-1.5 text-[11px] text-destructive bg-destructive/5 border-b border-border/40 shrink-0">{voiceHint}</div>
              )}

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
                      onClick={() => {
                        // Click a mid-reveal message to skip to full text instantly
                        if (typing && typing.index === i) setTyping(null);
                      }}
                      dangerouslySetInnerHTML={{ __html: messageHtml(msg, i) }}
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
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
