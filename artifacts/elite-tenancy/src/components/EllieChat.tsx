import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Send, RotateCcw, Mic, MicOff, Globe } from "lucide-react";

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
// Web Speech API BCP-47 tags. Wake phrase stays "hey ellie" globally so users
// don't need to memorise per-language triggers — brand name works across all.
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

function pickInitialLang(): string {
  if (typeof navigator === "undefined") return "en-GB";
  const nav = navigator.language;
  // Exact match first, then match by primary subtag.
  if (LANGUAGES.some((l) => l.code === nav)) return nav;
  const primary = nav.split("-")[0];
  const found = LANGUAGES.find((l) => l.code.startsWith(primary + "-"));
  return found?.code ?? "en-GB";
}

// Minimal shape we actually use from the SpeechRecognition API — enough to
// avoid the DOM-lib type gap without shipping any experimental d.ts.
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

/** Strip markdown/HTML/emoji-ish characters before speaking — TTS sounds terrible reading raw markdown. */
function textForSpeech(input: string): string {
  return input
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*(.*?)\*/g, "$1")
    .replace(/<[^>]+>/g, "")
    .replace(/\/[a-z][a-z0-9/-]*/gi, " ")
    .replace(/[🏡🏠✅❌🔑💷📞😊]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Play a short 2-tone welcome chime via Web Audio API — no external asset. */
function playChime() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    [
      { freq: 660, start: 0, dur: 0.14 },
      { freq: 880, start: 0.11, dur: 0.18 },
    ].forEach(({ freq, start, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0, ctx.currentTime + start);
      gain.gain.linearRampToValueAtTime(0.18, ctx.currentTime + start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + start + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(ctx.currentTime + start);
      osc.stop(ctx.currentTime + start + dur + 0.05);
    });
    setTimeout(() => ctx.close(), 700);
  } catch {
    /* ignore audio failures */
  }
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

// ── Character drawing ────────────────────────────────────────────────────────
// Ellie is an original cartoon bird — chubby round body, big head, big shiny
// eyes with highlights, small wings, tuft on top, tiny feet. Pseudo-3D via
// radial-gradient shading, highlight dots, and a cast shadow — real Three.js
// would be overkill at this size (and hurt mobile battery for no visual gain).

type Pose = "idle" | "thinking" | "listening";

function drawShadow(ctx: CanvasRenderingContext2D, cx: number, cy: number, w: number) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, w, w * 0.16, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(22, 58, 74, 0.22)";
  ctx.filter = "blur(3px)";
  ctx.fill();
  ctx.filter = "none";
}

function drawBlob(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  lightStops: [string, string, string, string],
) {
  ctx.beginPath();
  ctx.ellipse(cx, cy, w, h, 0, 0, Math.PI * 2);
  const grad = ctx.createRadialGradient(cx - w * 0.35, cy - h * 0.5, 0, cx, cy, Math.max(w, h) * 1.25);
  grad.addColorStop(0, lightStops[0]);
  grad.addColorStop(0.35, lightStops[1]);
  grad.addColorStop(0.75, lightStops[2]);
  grad.addColorStop(1, lightStops[3]);
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(22, 58, 74, 0.28)";
  ctx.lineWidth = 1.2;
  ctx.stroke();
}

function drawEye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, open: number, lookX = 0, lookY = 0) {
  // Eye white — vertical squash represents blink
  ctx.beginPath();
  ctx.ellipse(x, y, r * 1.15, r * 1.15 * Math.max(0.06, open), 0, 0, Math.PI * 2);
  ctx.fillStyle = "#FFFDF5";
  ctx.fill();
  ctx.strokeStyle = "rgba(22, 58, 74, 0.35)";
  ctx.lineWidth = 0.8;
  ctx.stroke();

  if (open > 0.25) {
    const pupilX = x + lookX * r * 0.3;
    const pupilY = y + r * 0.05 + lookY * r * 0.3;
    ctx.beginPath();
    ctx.ellipse(pupilX, pupilY, r * 0.62, r * 0.62 * open, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#0E2530";
    ctx.fill();

    // "Wet" highlights — cheap but effective pseudo-3D cue
    ctx.beginPath();
    ctx.arc(pupilX - r * 0.24, pupilY - r * 0.15, r * 0.22 * open, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(pupilX + r * 0.16, pupilY + r * 0.22, r * 0.08 * open, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.fill();
  }
}

function drawBeak(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, open: number) {
  const halfOpen = open * r * 0.15;
  // Upper mandible
  ctx.beginPath();
  ctx.moveTo(cx - r * 0.18, cy);
  ctx.quadraticCurveTo(cx, cy + r * 0.4 - halfOpen, cx + r * 0.18, cy);
  ctx.quadraticCurveTo(cx, cy - halfOpen, cx - r * 0.18, cy);
  const grad = ctx.createLinearGradient(cx, cy - r * 0.2, cx, cy + r * 0.3);
  grad.addColorStop(0, "#F0BC5A");
  grad.addColorStop(1, "#B87A20");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(22, 58, 74, 0.45)";
  ctx.lineWidth = 1;
  ctx.stroke();

  if (open > 0.15) {
    // Lower mandible (opens down)
    ctx.beginPath();
    ctx.moveTo(cx - r * 0.16, cy);
    ctx.quadraticCurveTo(cx, cy + r * 0.55 + halfOpen, cx + r * 0.16, cy);
    ctx.quadraticCurveTo(cx, cy + halfOpen, cx - r * 0.16, cy);
    ctx.fillStyle = "#7C5015";
    ctx.fill();
  }
}

function drawWing(
  ctx: CanvasRenderingContext2D,
  ax: number,
  ay: number,
  size: number,
  rotation: number,
  mirror: boolean,
) {
  ctx.save();
  ctx.translate(ax, ay);
  ctx.rotate(rotation);
  if (mirror) ctx.scale(-1, 1);

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(size * 0.55, -size * 0.35, size * 1.05, -size * 0.05);
  ctx.quadraticCurveTo(size * 0.85, size * 0.5, 0, size * 0.35);
  ctx.closePath();

  const grad = ctx.createLinearGradient(0, -size * 0.3, size, size * 0.4);
  grad.addColorStop(0, "#E2B968");
  grad.addColorStop(0.55, "#B8862A");
  grad.addColorStop(1, "#6E4E15");
  ctx.fillStyle = grad;
  ctx.fill();
  ctx.strokeStyle = "rgba(22, 58, 74, 0.4)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Feather lines (3 arcs)
  ctx.strokeStyle = "rgba(22, 58, 74, 0.25)";
  ctx.lineWidth = 0.8;
  for (let i = 0; i < 3; i++) {
    const t = (i + 1) / 4;
    ctx.beginPath();
    ctx.moveTo(size * 0.15, size * 0.05 * (1 - t));
    ctx.quadraticCurveTo(size * 0.6 * t + size * 0.3, size * 0.1 * t, size * 1.0 * t + size * 0.05, size * 0.2 * t);
    ctx.stroke();
  }

  ctx.restore();
}

function drawTuft(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number, phase: number) {
  const feathers = [-0.22, 0, 0.22];
  const sway = Math.sin(phase * 1.5) * 0.15;
  feathers.forEach((fx, i) => {
    ctx.save();
    ctx.translate(cx + fx * r, cy);
    ctx.rotate((fx * 2 + sway) * 0.4 + (i - 1) * 0.1);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(r * 0.08, -r * 0.2, 0, -r * 0.42);
    ctx.quadraticCurveTo(-r * 0.08, -r * 0.2, 0, 0);
    const g = ctx.createLinearGradient(0, 0, 0, -r * 0.42);
    g.addColorStop(0, "#B8862A");
    g.addColorStop(1, "#F0D89A");
    ctx.fillStyle = g;
    ctx.fill();
    ctx.strokeStyle = "rgba(22, 58, 74, 0.35)";
    ctx.lineWidth = 0.7;
    ctx.stroke();
    ctx.restore();
  });
}

function drawFeet(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  [-1, 1].forEach((side) => {
    ctx.beginPath();
    ctx.ellipse(cx + side * r * 0.22, cy, r * 0.14, r * 0.09, 0, 0, Math.PI * 2);
    ctx.fillStyle = "#B87A20";
    ctx.fill();
    ctx.strokeStyle = "rgba(22, 58, 74, 0.35)";
    ctx.lineWidth = 0.8;
    ctx.stroke();
  });
}

function drawThoughtCloud(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number, phase: number) {
  const puffs: Array<[number, number, number]> = [
    [0, 0, 0.55],
    [-0.55, 0.05, 0.42],
    [0.55, 0.05, 0.42],
    [-0.25, -0.35, 0.38],
    [0.35, -0.3, 0.42],
    [0, -0.55, 0.35],
  ];

  ctx.fillStyle = "rgba(255, 253, 245, 0.96)";
  ctx.strokeStyle = "rgba(22, 58, 74, 0.22)";
  ctx.lineWidth = 1;

  puffs.forEach(([px, py, pr]) => {
    ctx.beginPath();
    ctx.arc(cx + px * size, cy + py * size, pr * size, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
  });

  // 3-dot trail below cloud, pulsing
  for (let i = 0; i < 3; i++) {
    const alpha = Math.max(0.25, (Math.sin(phase * 2 + i * 0.9) + 1) * 0.4);
    ctx.beginPath();
    ctx.arc(cx + (i - 1) * size * 0.28, cy + size * 0.85 + i * size * 0.14, size * 0.11 - i * size * 0.02, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 253, 245, ${alpha})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(22, 58, 74, ${alpha * 0.3})`;
    ctx.stroke();
  }

  // Little sparkle inside cloud
  const sparkle = (Math.sin(phase * 3) + 1) * 0.5;
  ctx.fillStyle = `rgba(212, 162, 74, ${0.5 + sparkle * 0.4})`;
  ctx.beginPath();
  ctx.arc(cx - size * 0.05, cy - size * 0.1, size * 0.09 * (0.6 + sparkle * 0.4), 0, Math.PI * 2);
  ctx.fill();
}

function drawEllie(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  pose: Pose,
  phase: number,
  eyeOpen: number,
  tilt: number,
) {
  const beakOpen = pose === "listening" ? 0 : Math.max(0, Math.sin(phase * 4.5)) * 0.4;
  const wingFlap = Math.sin(phase * 2.5) * 0.35;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(tilt);

  // Cast shadow anchored below feet
  drawShadow(ctx, 0, r * 1.15, r * 0.7);

  // Back wings for idle/listening — spread and flapping. Skipped for thinking
  // (the wings come up over the face instead).
  if (pose !== "thinking") {
    drawWing(ctx, -r * 0.55, r * 0.15, r * 0.55, -0.35 - wingFlap * 0.45, false);
    drawWing(ctx, r * 0.55, r * 0.15, r * 0.55, 0.35 + wingFlap * 0.45, true);
  }

  // Feet
  drawFeet(ctx, 0, r * 1.05, r);

  // Body
  drawBlob(ctx, 0, r * 0.5, r * 0.7, r * 0.65, ["#FFF5D0", "#F0D89A", "#D4A24A", "#A87F30"]);

  // Head (bigger than body — kawaii proportions)
  const headY = -r * 0.35;
  drawBlob(ctx, 0, headY, r * 0.8, r * 0.72, ["#FFF8DE", "#F5E0A5", "#D9AB55", "#9E7530"]);

  // Rosy cheeks
  ctx.beginPath();
  ctx.ellipse(-r * 0.45, headY + r * 0.05, r * 0.14, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(232, 130, 100, 0.4)";
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(r * 0.45, headY + r * 0.05, r * 0.14, r * 0.09, 0, 0, Math.PI * 2);
  ctx.fill();

  // Face (skipped when wings cover)
  if (pose !== "thinking") {
    const lookX = pose === "listening" ? Math.sin(phase * 0.7) * 0.6 : Math.sin(phase * 0.4) * 0.2;
    const lookY = pose === "listening" ? -0.2 : 0;
    const eyeR = r * 0.13;
    drawEye(ctx, -r * 0.22, headY - r * 0.05, eyeR, eyeOpen, lookX, lookY);
    drawEye(ctx, r * 0.22, headY - r * 0.05, eyeR, eyeOpen, lookX, lookY);
    drawBeak(ctx, 0, headY + r * 0.18, r * 0.9, beakOpen);
  }

  // Tuft
  drawTuft(ctx, 0, headY - r * 0.55, r * 0.9, phase + (pose === "listening" ? 3 : 0));

  // Wings-on-face for thinking
  if (pose === "thinking") {
    const cover = 0.9 + Math.sin(phase * 2) * 0.06;
    drawWing(ctx, -r * 0.5, headY - r * 0.1, r * 0.6, -0.4 * cover, false);
    drawWing(ctx, r * 0.5, headY - r * 0.1, r * 0.6, 0.4 * cover, true);
  }

  ctx.restore();

  // Thought cloud floats above her head (drawn outside the character
  // transform so its position stays stable regardless of body tilt).
  if (pose === "thinking") {
    drawThoughtCloud(ctx, cx + r * 0.5, cy - r * 1.35, r * 0.45, phase);
  }
}

const STAGE_SIZE_CSS = "clamp(160px, 22vw, 250px)";
const WANDER_JITTER = 1.2;
const IDLE_SPEED = 0.05;
const CHAR_RADIUS_FRAC = 0.24;
const TARGET_FPS = 30;
const SETTLED_POS = { x: 0.72, y: 0.65 };

export default function EllieChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ role: "ellie", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const [sessionId] = useState<string>(() => `${Date.now()}-${Math.random().toString(36).slice(2)}`);

  // Voice mode state ─────────────────────────────────────────────────────────
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
  const modeRef = useRef<"wander" | "settled" | "thinking">("wander");
  const unreadRef = useRef(0);

  useEffect(() => {
    setVoiceSupported(getSpeechRecognitionCtor() !== null);
    const savedMode = localStorage.getItem(VOICE_MODE_KEY);
    if (savedMode === "1") setVoiceOn(true);
    const savedLang = localStorage.getItem(VOICE_LANG_KEY);
    if (savedLang && LANGUAGES.some((l) => l.code === savedLang)) setLangCode(savedLang);
  }, []);

  useEffect(() => {
    localStorage.setItem(VOICE_MODE_KEY, voiceOn ? "1" : "0");
  }, [voiceOn]);

  useEffect(() => {
    localStorage.setItem(VOICE_LANG_KEY, langCode);
  }, [langCode]);

  useEffect(() => {
    modeRef.current = open ? "settled" : loading ? "thinking" : "wander";
    poseRef.current = loading ? "thinking" : voiceListening ? "listening" : "idle";
  }, [open, loading, voiceListening]);

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

  // ── send message helper (used by text form + voice) ───────────────────────
  const send = useCallback(
    async (text?: string) => {
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
        const reply = data.reply ?? "Sorry, I couldn't get a response. Please try again.";
        setMessages([...newMessages, { role: "ellie", content: reply }]);
        if (!open) setUnread((n) => n + 1);

        // If voice mode is on, speak the reply in the selected language.
        if (wantsVoiceRef.current && typeof window !== "undefined" && "speechSynthesis" in window) {
          try {
            const utter = new SpeechSynthesisUtterance(textForSpeech(reply));
            utter.lang = langCode;
            const voices = window.speechSynthesis.getVoices();
            const match = voices.find((v) => v.lang === langCode) ?? voices.find((v) => v.lang.startsWith(langCode.split("-")[0]));
            if (match) utter.voice = match;
            window.speechSynthesis.cancel();
            window.speechSynthesis.speak(utter);
          } catch {
            /* TTS unavailable — silent fallback */
          }
        }
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
    },
    [input, loading, messages, open, sessionId, langCode],
  );

  // ── Voice mode wake-word listener ─────────────────────────────────────────
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
      for (let i = 0; i < e.results.length; i++) {
        combined += e.results[i][0].transcript + " ";
      }
      const lower = combined.toLowerCase();

      if (!capturingQueryRef.current) {
        // Wake-word listening state
        const idx = lower.indexOf(WAKE_PHRASE);
        if (idx !== -1) {
          capturingQueryRef.current = true;
          queryBufferRef.current = lower.slice(idx + WAKE_PHRASE.length).trim();
          setVoiceListening(true);
          playChime();
          setOpen(true);
          // Give the user ~3.5s of quiet before treating what they said as the full query.
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
        // Query capture state — reset silence timer as the user keeps talking.
        // (Web Speech API keeps appending to the same results list, so just
        // take everything spoken since the wake word triggered.)
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
      } else if (e.error === "no-speech") {
        // Silence is fine — the onend restart below keeps us listening.
      } else {
        setVoiceHint(`Voice error: ${e.error}`);
      }
    };

    rec.onend = () => {
      // Auto-restart while voice mode stays enabled — SpeechRecognition
      // stops itself after silence in many browsers.
      if (!cancelled && wantsVoiceRef.current) {
        try {
          rec.start();
        } catch {
          /* start-while-starting is fine, ignore */
        }
      }
    };

    try {
      rec.start();
    } catch (err) {
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
      try {
        rec.abort();
      } catch { /* ignore */ }
    };
  }, [voiceOn, langCode, send]);

  // ── Spatial animation engine ──────────────────────────────────────────────
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
        hitRegionRef.current.style.left = `${cx - r * 1.1}px`;
        hitRegionRef.current.style.top = `${cy - r * 1.6}px`;
        hitRegionRef.current.style.width = `${r * 2.2}px`;
        hitRegionRef.current.style.height = `${r * 3}px`;
      }
      if (badgeRef.current) {
        badgeRef.current.style.left = `${cx + r * 0.75}px`;
        badgeRef.current.style.top = `${cy - r * 1.55}px`;
      }
    }

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const r = Math.min(stageWidth, stageHeight) * CHAR_RADIUS_FRAC;
      const cx = 0.55 * stageWidth;
      const cy = 0.5 * stageHeight;
      ctx.clearRect(0, 0, stageWidth, stageHeight);
      drawEllie(ctx, cx, cy, r, "idle", 0, 1, 0);
      placeOverlays(cx, cy, r);
      return () => ro.disconnect();
    }

    const pos = { x: 0.55, y: 0.5 };
    let heading = Math.random() * Math.PI * 2;
    let phase = 0;
    let blinkTimer = 2 + Math.random() * 3;
    let blinkPhase = 0;

    function draw() {
      const r = Math.min(stageWidth, stageHeight) * CHAR_RADIUS_FRAC;
      ctx!.clearRect(0, 0, stageWidth, stageHeight);

      const mode = modeRef.current;
      const pose = poseRef.current;
      const eyeOpen = blinkPhase > 0 ? Math.max(0, Math.cos(Math.min(blinkPhase, 1) * Math.PI)) : 1;
      const bobAmp = pose === "thinking" ? 0.05 : mode === "wander" && unreadRef.current > 0 ? 0.055 : 0.035;
      const bobY = Math.sin(phase) * bobAmp;
      const tilt = mode === "wander" ? Math.sin(heading) * 0.12 : 0;

      const at = (x: number, y: number) => drawEllie(ctx!, x * stageWidth, (y + bobY) * stageHeight, r, pose, phase, eyeOpen, tilt);

      at(pos.x, pos.y);
      if (mode === "wander") {
        const nearLeft = pos.x < CHAR_RADIUS_FRAC * 1.5;
        const nearRight = pos.x > 1 - CHAR_RADIUS_FRAC * 1.5;
        const nearTop = pos.y < CHAR_RADIUS_FRAC * 1.5;
        const nearBottom = pos.y > 1 - CHAR_RADIUS_FRAC * 1.5;
        if (nearLeft) at(pos.x + 1, pos.y);
        if (nearRight) at(pos.x - 1, pos.y);
        if (nearTop) at(pos.x, pos.y + 1);
        if (nearBottom) at(pos.x, pos.y - 1);
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
      const pose = poseRef.current;
      phase += dt * (pose === "thinking" ? 4.5 : pose === "listening" ? 3.5 : 2.2);

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
    setInput("");
  }

  return (
    <>
      {/* Roaming character stage */}
      <div
        ref={stageRef}
        className="fixed z-50"
        style={{
          right: "20px",
          bottom: "20px",
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

        {/* Voice-mode indicator dot on the stage — separate from the badge */}
        {voiceOn && !open && (
          <span
            className="absolute bottom-3 right-3 flex items-center justify-center rounded-full bg-primary text-primary-foreground w-7 h-7 shadow-lg"
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
            className="fixed right-6 z-50 w-[360px] max-w-[calc(100vw-24px)] bg-card border border-border/60 rounded-2xl shadow-2xl shadow-black/40 flex flex-col overflow-hidden"
            style={{ maxHeight: "540px", bottom: `calc(${STAGE_SIZE_CSS} + 12px)` }}
          >
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
                onClick={() => {
                  if (!voiceSupported) return;
                  setVoiceOn((v) => !v);
                }}
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
