import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Send, RotateCcw, Mic, MicOff, Globe, Volume2, VolumeX, Anchor, Eye, EyeOff, MessageCircle } from "lucide-react";
import { useLocation } from "wouter";

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
// Extended brass ramp — polished metal reads through compressed tonal bands
// (hot glint → turned dark edge), not a smooth 3-stop ramp. One light source:
// upper-left, ~10 o'clock, shared by gradient, speculars, and sheen.
const GOLD_GLINT = "#FFF3D6"; // hottest band nearest the light
const GOLD_MID = "#E2B45E";   // between the light band and base gold
const GOLD_EDGE = "#6E4F1E";  // turned-edge rim where the dome curves away
const GOLD_LINE = "rgba(138, 100, 40, 0.65)"; // outer silhouette stroke
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
  walk: number;     // 0 standing; otherwise the step-cycle phase while strolling
  facing: 1 | -1;   // horizontal facing (mirrors the body toward travel direction)
  lookAt: { x: number; y: number }; // extra eye offset (cursor tracking), unit-scaled
}

function drawEllie(ctx: CanvasRenderingContext2D, cx: number, groundY: number, H: number, s: DrawState) {
  const u = H / 100; // 1 unit = 1% of character height
  // Walking adds a waddle: extra squash bounce + side-to-side lean per step
  const stepBounce = s.walk > 0 ? Math.abs(Math.sin(s.walk)) * 0.03 : 0;
  const waddle = s.walk > 0 ? Math.sin(s.walk) * 0.055 : 0;
  const squash = 1 - s.ding * 0.09 + stepBounce;
  const spread = 1 + s.ding * 0.07 - stepBounce * 0.5;

  ctx.save();
  // Squash-and-stretch about the ground point (feet stay planted);
  // facing mirrors the whole body toward her direction of travel.
  ctx.translate(cx, groundY);
  ctx.rotate(s.tilt + waddle);
  ctx.scale(spread * s.facing, squash);
  ctx.translate(-cx, -groundY);

  // Two-layer contact shadow. Layer 1: a soft ambient pool that fades to
  // nothing at its edge. Layer 2: a darker contact core under the planted
  // foot that shrinks and lightens mid-stride — free "weight" in the walk.
  // Near-black neutral works over both cream and navy backgrounds.
  const lift01 = s.walk > 0 ? Math.abs(Math.sin(s.walk)) : 0;
  const shadowY = groundY - 1 * u;
  ctx.save();
  ctx.translate(cx, shadowY);
  ctx.scale(spread, 5 / 30);
  const poolGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, 30 * u);
  poolGrad.addColorStop(0, "rgba(12, 22, 28, 0.22)");
  poolGrad.addColorStop(1, "rgba(12, 22, 28, 0)");
  ctx.beginPath();
  ctx.arc(0, 0, 30 * u, 0, Math.PI * 2);
  ctx.fillStyle = poolGrad;
  ctx.fill();
  ctx.restore();
  const plantedX = s.walk > 0 ? cx + (Math.sin(s.walk) > 0 ? 1 : -1) * 9 * u : cx;
  const coreScale = 1 - lift01 * 0.3;
  ctx.beginPath();
  ctx.ellipse(plantedX, shadowY, 15 * u * coreScale, 2.2 * u * coreScale, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(12, 22, 28, ${0.34 - lift01 * 0.14})`;
  ctx.fill();

  // Legs + shoe plates (navy) — alternate lift while walking
  [-1, 1].forEach((side) => {
    const step = s.walk > 0 ? Math.max(0, Math.sin(s.walk + (side === -1 ? 0 : Math.PI))) : 0;
    const lift = step * 4 * u;
    const lx = cx + side * 9 * u + (s.walk > 0 ? Math.sin(s.walk + (side === -1 ? 0 : Math.PI)) * 2.5 * u : 0);
    ctx.beginPath();
    ctx.roundRect(lx - 3 * u, groundY - 15 * u - lift * 0.4, 6 * u, 12 * u, 3 * u);
    ctx.fillStyle = NAVY;
    ctx.fill();
    ctx.save();
    ctx.shadowColor = "rgba(250, 248, 244, 0.35)";
    ctx.shadowBlur = 3 * u;
    ctx.beginPath();
    ctx.ellipse(lx + side * 1.5 * u, groundY - 2.5 * u - lift, 7 * u, 3 * u, 0, 0, Math.PI * 2);
    ctx.fillStyle = NAVY_DEEP;
    ctx.fill();
    ctx.restore();
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
  const traceDome = () => {
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
  };

  // Cream halo pre-pass: invisible on cream pages, reads as a soft rim glow
  // on navy heroes — dual-background separation with zero bg detection.
  ctx.save();
  ctx.shadowColor = "rgba(250, 248, 244, 0.4)";
  ctx.shadowBlur = 6 * u;
  traceDome();
  ctx.fillStyle = GOLD;
  ctx.fill();
  ctx.restore();

  // Banded multi-stop gradient — compressed bands off the upper-left light,
  // with a tight dark falloff at the rim that gives the dome a turned edge.
  const domeCY = (domeTopY + domeBaseY) / 2;
  const lightX = cx - 10.5 * u;
  const lightY = domeCY - 12 * u;
  traceDome();
  const domeGrad = ctx.createRadialGradient(lightX, lightY, 1.5 * u, lightX, lightY, 46 * u);
  domeGrad.addColorStop(0, GOLD_GLINT);
  domeGrad.addColorStop(0.15, GOLD_LIGHT);
  domeGrad.addColorStop(0.34, GOLD_MID);
  domeGrad.addColorStop(0.55, GOLD);
  domeGrad.addColorStop(0.78, GOLD_DEEP);
  domeGrad.addColorStop(1, GOLD_EDGE);
  ctx.fillStyle = domeGrad;
  ctx.fill();
  // Warm silhouette stroke — separates gold-on-cream without flattening
  // the gradients the way a dark internal outline would.
  ctx.strokeStyle = GOLD_LINE;
  ctx.lineWidth = 1.4 * u;
  ctx.stroke();

  // Polish sheen (demoted: the hard speculars below carry "mirror finish")
  ctx.beginPath();
  ctx.ellipse(cx - 13 * u, domeTopY + 13 * u, 9 * u, 4.5 * u, -0.6, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 248, 228, 0.18)";
  ctx.fill();

  // Hard double specular — mirror-finish metal has hard-edged highlights.
  // Primary: bright window-reflection ellipse high on the light side.
  ctx.save();
  ctx.shadowColor = "rgba(255, 254, 248, 0.95)";
  ctx.shadowBlur = 2 * u; // softens the edge one pixel, no more
  ctx.beginPath();
  ctx.ellipse(cx - 12 * u, domeTopY + 8 * u, 10 * u, 3.8 * u, -0.56, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 254, 248, 0.95)";
  ctx.fill();
  ctx.restore();
  // Secondary: small glint near the crown, up by the button
  ctx.beginPath();
  ctx.arc(cx - 4.5 * u, domeTopY + 5.5 * u, 1.8 * u, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255, 254, 248, 0.55)";
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
  // Base gaze per pose, plus damped cursor-tracking (lookAt is in screen
  // space, so compensate for the facing mirror to keep her eyes honest).
  const look = s.pose === "thinking" ? { x: -1.6 * u, y: -1.8 * u } : s.pose === "listening" ? { x: Math.sin(s.phase * 0.8) * 1.2 * u, y: -0.6 * u } : { x: Math.sin(s.phase * 0.35) * 0.8 * u, y: 0 };
  if (s.pose !== "thinking") {
    look.x += s.lookAt.x * s.facing * u;
    look.y += s.lookAt.y * u;
  }

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

// ── Page-type policy matrix ──────────────────────────────────────────────────
// Premium mascots adapt per page context. A concierge bell is composed and
// present — never performing over content the user is trying to read or buy.
type PagePolicy = "ROAM" | "PATROL" | "DOCKED" | "HIDDEN";

function getPagePolicy(pathname: string): PagePolicy {
  const p = pathname.toLowerCase();
  // Admin/landlord/tenant portals use their own layouts — EllieChat isn't
  // rendered there — but guard just in case:
  if (p.startsWith("/admin")) return "HIDDEN";

  // Legal / compliance — motionless, respectful
  if (p === "/privacy" || p === "/terms" || p === "/cookies") return "DOCKED";

  // Forms and tools — freeze during data entry
  if (
    p === "/renter-passport" || p === "/contact" || p === "/valuation" ||
    p === "/list-your-property" || p === "/verify-landlord" ||
    p === "/right-to-rent-check" || p === "/rra-2025-checker" ||
    p === "/sign-in" || p.startsWith("/sign-in/") ||
    p === "/sign-up" || p.startsWith("/sign-up/")
  ) return "DOCKED";

  // Listings — user scanning cards; motion destroys scan patterns
  if (p === "/listings" || p.startsWith("/listings/")) return "DOCKED";
  if (p === "/room-wanted" || p === "/rooms-to-let" || p.startsWith("/rooms-to-let/")) return "DOCKED";
  if (p === "/find-a-room") return "DOCKED";

  // Blog/articles — reading comprehension and motion are enemies
  if (p === "/blog" || p.startsWith("/blog/")) return "DOCKED";

  // Homepage — personality where it converts
  if (p === "/") return "PATROL";

  // Everything else (informational pages) — gentle patrol
  return "PATROL";
}

// ── User preference persistence ─────────────────────────────────────────────
const ELLIE_PREF_KEY = "et_ellie_pref";
type ElliePref = "auto" | "docked" | "hidden";

function loadElliePref(): ElliePref {
  const v = localStorage.getItem(ELLIE_PREF_KEY);
  if (v === "docked" || v === "hidden") return v;
  return "auto";
}

// Reserved corner area the chat panel positions itself around
const STAGE_SIZE_CSS = "clamp(160px, 22vw, 250px)";
const WANDER_JITTER = 1.2;
const TARGET_FPS = 30;

// Edge margin — she turns around this many px before the viewport edge
const EDGE_MARGIN = 0.06;

export default function EllieChat() {
  const [location] = useLocation();
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

  // User preference: auto / docked / hidden
  const [elliePref, setElliePref] = useState<ElliePref>(loadElliePref);
  const pagePolicyRef = useRef<PagePolicy>("PATROL");
  const effectiveModeRef = useRef<PagePolicy>("PATROL");
  const freezeRef = useRef(false);
  const freezeTimerRef = useRef<number | null>(null);

  // Pill menu (Chat · Dock · Hide) shown on hover/focus of the character
  const [menuOpen, setMenuOpen] = useState(false);
  const [hideToast, setHideToast] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuCloseTimer = useRef<number | null>(null);

  const openMenu = useCallback(() => {
    if (menuCloseTimer.current) { window.clearTimeout(menuCloseTimer.current); menuCloseTimer.current = null; }
    setMenuOpen(true);
  }, []);
  const closeMenuSoon = useCallback(() => {
    if (menuCloseTimer.current) window.clearTimeout(menuCloseTimer.current);
    menuCloseTimer.current = window.setTimeout(() => setMenuOpen(false), 350);
  }, []);

  const hideEllie = useCallback(() => {
    setElliePref("hidden");
    setMenuOpen(false);
    setHideToast(true);
    window.setTimeout(() => setHideToast(false), 4000);
  }, []);

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
  const tooltipRef = useRef<HTMLDivElement>(null);
  const micRef = useRef<HTMLSpanElement>(null);
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

  // Compute effective mode from page policy + user pref
  useEffect(() => {
    const policy = getPagePolicy(location);
    pagePolicyRef.current = policy;
    if (elliePref === "hidden") {
      effectiveModeRef.current = "HIDDEN";
    } else if (elliePref === "docked") {
      effectiveModeRef.current = "DOCKED";
    } else {
      effectiveModeRef.current = policy;
    }
  }, [location, elliePref]);

  useEffect(() => {
    localStorage.setItem(ELLIE_PREF_KEY, elliePref);
  }, [elliePref]);

  // Freeze triggers — form focus, scroll, text selection
  useEffect(() => {
    function startFreeze(resumeDelayMs: number) {
      freezeRef.current = true;
      if (freezeTimerRef.current) window.clearTimeout(freezeTimerRef.current);
      freezeTimerRef.current = window.setTimeout(() => {
        freezeRef.current = false;
        freezeTimerRef.current = null;
      }, resumeDelayMs);
    }
    function onFocusIn(e: FocusEvent) {
      const t = e.target as HTMLElement;
      if (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.tagName === "SELECT" || t.isContentEditable) {
        startFreeze(8000);
      }
    }
    function onFocusOut() {
      startFreeze(5000);
    }
    let scrollTimer: number | null = null;
    function onScroll() {
      freezeRef.current = true;
      if (scrollTimer) window.clearTimeout(scrollTimer);
      scrollTimer = window.setTimeout(() => { freezeRef.current = false; }, 4000);
    }
    function onSelectStart() { startFreeze(3000); }

    document.addEventListener("focusin", onFocusIn, { passive: true });
    document.addEventListener("focusout", onFocusOut, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("selectstart", onSelectStart, { passive: true });
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("selectstart", onSelectStart);
      if (scrollTimer) window.clearTimeout(scrollTimer);
      if (freezeTimerRef.current) window.clearTimeout(freezeTimerRef.current);
    };
  }, []);

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

  // ── Spatial animation engine — full-viewport free roam ─────────────────────
  // Ellie now owns the whole page as her stage (canvas is pointer-events:none
  // so she never blocks a click; only her own hit-region button is clickable).
  // "Free will" = a tiny behaviour brain: she strolls, pauses to look around,
  // occasionally does a spontaneous visual ding, and wraps around the screen
  // edges. Depth illusion: she scales smaller the higher (farther) she is,
  // faces her direction of travel, and waddles a real step cycle.
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
      const dpr = Math.min(window.devicePixelRatio || 1, 2); // cap for 4K perf
      canvas!.width = stageWidth * dpr;
      canvas!.height = stageHeight * dpr;
      canvas!.style.width = `${stageWidth}px`;
      canvas!.style.height = `${stageHeight}px`;
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(stage);
    resize();

    const baseH = () => Math.max(90, Math.min(165, Math.min(stageWidth, stageHeight) * 0.17));

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
      if (tooltipRef.current) {
        const tw = tooltipRef.current.offsetWidth || 120;
        tooltipRef.current.style.left = `${Math.min(Math.max(8, cx - tw / 2), stageWidth - tw - 8)}px`;
        tooltipRef.current.style.top = `${Math.max(8, groundY - H - 34)}px`;
      }
      if (menuRef.current) {
        const mw = menuRef.current.offsetWidth || 160;
        menuRef.current.style.left = `${Math.min(Math.max(8, cx - mw / 2), stageWidth - mw - 8)}px`;
        menuRef.current.style.top = `${Math.max(8, groundY - H - 46)}px`;
      }
      if (micRef.current) {
        micRef.current.style.left = `${cx + H * 0.24}px`;
        micRef.current.style.top = `${groundY - H * 0.22}px`;
      }
    }

    // Settle target (pixels): her "home" beside the chat panel, bottom-right.
    const settleTarget = (H: number) => ({
      x: (stageWidth - 105) / stageWidth,
      y: (stageHeight - 55 - H / 2) / stageHeight,
    });

    const staticState = (): DrawState => ({
      pose: poseRef.current, phase: 0, eyeOpen: 1, tilt: 0, ding: 0, mouth: 0,
      walk: 0, facing: -1, lookAt: { x: 0, y: 0 },
    });

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) {
      const H = baseH();
      const t = settleTarget(H);
      const cx = t.x * stageWidth;
      const groundY = t.y * stageHeight + H / 2;
      ctx.clearRect(0, 0, stageWidth, stageHeight);
      drawEllie(ctx, cx, groundY, H, staticState());
      placeOverlays(cx, groundY, H);
      return () => ro.disconnect();
    }

    // Cursor tracking — her eyes follow the mouse within a small damped cone.
    const cursor = { x: -1, y: -1 };
    const lookAt = { x: 0, y: 0 };
    function onMouseMove(e: MouseEvent) {
      cursor.x = e.clientX;
      cursor.y = e.clientY;
    }
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    const pos = { x: 0.7, y: 0.65 };
    let heading = Math.PI + Math.random() * Math.PI; // start heading leftish/up
    let phase = 0;
    let walkPhase = 0;
    let speedNow = 0;            // px/s, eased toward the behaviour's target
    let facing: 1 | -1 = -1;
    let blinkTimer = 2 + Math.random() * 3;
    let blinkPhase = 0;

    // Behaviour brain — premium duty cycle: mostly still, occasionally alive.
    // Target ≤25-30% walking. Strolls are short; dwells are long and chain
    // (pause → gaze) so she reads as composed, not restless.
    type Behaviour = "stroll" | "pause" | "gaze";
    let behaviour: Behaviour = "pause";
    let behaviourTimer = 2 + Math.random() * 3;
    let spontaneousDingDone = false; // one unprompted delight per page view, max
    let spontaneousDingTimer = 30 + Math.random() * 30;
    const STROLL_SPEED = 58; // px/s

    function nextBehaviour() {
      if (behaviour === "stroll") {
        const r = Math.random();
        if (r < 0.6) { behaviour = "pause"; behaviourTimer = 6 + Math.random() * 8; }
        else { behaviour = "gaze"; behaviourTimer = 5 + Math.random() * 6; }
      } else if (behaviour === "pause" && Math.random() < 0.4) {
        behaviour = "gaze"; behaviourTimer = 4 + Math.random() * 4;
      } else {
        behaviour = "stroll";
        behaviourTimer = 2.5 + Math.random() * 2.5;
        heading += (Math.random() - 0.5) * 2.4; // pick a fresh-ish direction
      }
    }

    function draw() {
      const H0 = baseH();
      ctx!.clearRect(0, 0, stageWidth, stageHeight);

      const mode = modeRef.current;
      const pose = poseRef.current;

      // Depth illusion: farther (higher on screen) = smaller + softer.
      const depth = 0.72 + 0.42 * pos.y;
      const H = H0 * (mode === "settled" ? 1 : depth);

      const eyeOpen = blinkPhase > 0 ? Math.max(0, Math.cos(Math.min(blinkPhase, 1) * Math.PI)) : 1;
      const bobAmp = mode === "wander" && unreadRef.current > 0 ? 0.012 : 0.007;
      const bobY = speedNow > 8 ? 0 : Math.sin(phase) * bobAmp; // bob only when standing
      const tilt = speedNow > 8 ? Math.cos(heading) * facing * 0.05 : Math.sin(phase * 0.6) * 0.015;
      const mouth = pose === "speaking" ? Math.max(0, Math.sin(phase * 6)) : 0;

      const state: DrawState = {
        pose, phase, eyeOpen, tilt, ding: dingRef.current, mouth,
        walk: speedNow > 8 ? walkPhase : 0,
        facing,
        lookAt: { x: lookAt.x, y: lookAt.y },
      };

      const cx = pos.x * stageWidth;
      const groundY = (pos.y + bobY) * stageHeight + H / 2;
      drawEllie(ctx!, cx, groundY, H, state);

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

      // Damped cursor gaze (skip while she's mid-thought)
      const H0 = baseH();
      if (cursor.x >= 0 && pose !== "thinking") {
        const dx = cursor.x - pos.x * stageWidth;
        const dy = cursor.y - (pos.y * stageHeight);
        const dist = Math.hypot(dx, dy) || 1;
        const strength = behaviour === "gaze" ? 1.7 : 1.1;
        const tx = (dx / dist) * Math.min(1, dist / 300) * strength;
        const ty = (dy / dist) * Math.min(1, dist / 300) * strength * 0.6;
        lookAt.x += (tx - lookAt.x) * Math.min(1, dt * 4);
        lookAt.y += (ty - lookAt.y) * Math.min(1, dt * 4);
      } else {
        lookAt.x += (0 - lookAt.x) * Math.min(1, dt * 3);
        lookAt.y += (0 - lookAt.y) * Math.min(1, dt * 3);
      }

      const eff = effectiveModeRef.current;
      const frozen = freezeRef.current;
      const wandering = mode === "wander" && (eff === "PATROL" || eff === "ROAM");

      if (wandering) {
        // Frozen (user scrolling/typing/selecting): hold position, don't
        // advance the behaviour clock — she waits, attentive, until resumed.
        if (frozen) {
          speedNow += (0 - speedNow) * Math.min(1, dt * 6);
        } else {
          behaviourTimer -= dt;
          if (behaviourTimer <= 0) nextBehaviour();

          // One unprompted visual-only delight ding per page view, max
          if (!spontaneousDingDone) {
            spontaneousDingTimer -= dt;
            if (spontaneousDingTimer <= 0) {
              dingRef.current = 1;
              spontaneousDingDone = true;
            }
          }

          const targetSpeed = behaviour === "stroll" ? STROLL_SPEED : 0;
          speedNow += (targetSpeed - speedNow) * Math.min(1, dt * 4);

          if (behaviour === "stroll") {
            heading += (Math.random() - 0.5) * WANDER_JITTER * dt;
          }
        }

        // PATROL: confined to the bottom-third band (nav + hero are off
        // limits). ROAM: full viewport minus the top-third and edges.
        const bandTop = eff === "PATROL" ? 0.62 : 0.4;
        const bandBottom = 0.92;

        // Edge turn-around — she obeys physics, never teleports. Reflect
        // heading when moving into a boundary, then clamp inside it.
        if (pos.x < EDGE_MARGIN && Math.cos(heading) < 0) heading = Math.PI - heading;
        if (pos.x > 1 - EDGE_MARGIN && Math.cos(heading) > 0) heading = Math.PI - heading;
        if (pos.y < bandTop && Math.sin(heading) < 0) heading = -heading;
        if (pos.y > bandBottom && Math.sin(heading) > 0) heading = -heading;

        const vxPx = Math.cos(heading) * speedNow;
        pos.x += (vxPx * dt) / stageWidth;
        pos.y += (Math.sin(heading) * speedNow * 0.7 * dt) / stageHeight;
        pos.x = Math.min(1 - EDGE_MARGIN, Math.max(EDGE_MARGIN, pos.x));
        pos.y = Math.min(bandBottom, Math.max(bandTop, pos.y));

        // Face travel direction (with hysteresis so she doesn't flicker)
        if (vxPx > 12) facing = 1;
        else if (vxPx < -12) facing = -1;

        walkPhase += dt * (speedNow / 58) * 9;
      } else {
        // Settle home beside the panel (chat open, or DOCKED page policy)
        speedNow = 0;
        const t = settleTarget(H0);
        pos.x += (t.x - pos.x) * Math.min(1, dt * 3);
        pos.y += (t.y - pos.y) * Math.min(1, dt * 3);
        facing = -1; // face the panel/user
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
      window.removeEventListener("mousemove", onMouseMove);
    };
    // Re-init when the stage mounts/unmounts (user hides or shows Ellie)
  }, [elliePref]);

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

      {/* Free-roam character stage — the whole viewport. pointer-events:none
          means she can never block a click; only her hit-region button (which
          follows her) is interactive. z-40 keeps her under the sticky header
          and the chat panel for a natural depth cue. */}
      {elliePref !== "hidden" && (
      <div
        ref={stageRef}
        className="fixed inset-0 z-40"
        style={{ pointerEvents: "none" }}
      >
        <canvas style={{ display: "block", width: "100%", height: "100%" }} ref={canvasRef} aria-hidden="true" />

        <AnimatePresence>
          {!open && !menuOpen && (
            <motion.div
              ref={tooltipRef}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="absolute bg-card border border-primary/30 rounded-xl px-3 py-2 shadow-lg text-xs text-muted-foreground flex items-center gap-2 whitespace-nowrap"
              style={{ pointerEvents: "none", left: -999, top: -999 }}
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
          onMouseEnter={openMenu}
          onMouseLeave={closeMenuSoon}
          onFocus={openMenu}
          onBlur={closeMenuSoon}
          aria-label={open ? "Close chat" : "Open chat with Ellie"}
          className="absolute rounded-full"
          style={{ pointerEvents: "auto", background: "transparent", border: "none", cursor: "pointer", padding: 0 }}
        />

        {/* Pill menu: Chat · Dock · Hide — WCAG 2.2.2 pause/stop/hide controls */}
        <AnimatePresence>
          {menuOpen && !open && (
            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              onMouseEnter={openMenu}
              onMouseLeave={closeMenuSoon}
              className="absolute flex items-center gap-0.5 bg-card border border-border/60 rounded-full px-1.5 py-1 shadow-lg"
              style={{ pointerEvents: "auto", left: -999, top: -999 }}
            >
              <button
                type="button"
                onClick={handleCharacterClick}
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:bg-muted/60 rounded-full px-2.5 py-1 transition-colors"
              >
                <MessageCircle size={12} className="text-primary" /> Chat
              </button>
              <button
                type="button"
                onClick={() => { setElliePref((p) => (p === "docked" ? "auto" : "docked")); setMenuOpen(false); }}
                className="flex items-center gap-1 text-xs font-medium text-foreground hover:bg-muted/60 rounded-full px-2.5 py-1 transition-colors"
              >
                <Anchor size={12} className="text-primary" /> {elliePref === "docked" ? "Roam" : "Dock"}
              </button>
              <button
                type="button"
                onClick={hideEllie}
                className="flex items-center gap-1 text-xs font-medium text-muted-foreground hover:bg-muted/60 rounded-full px-2.5 py-1 transition-colors"
              >
                <EyeOff size={12} /> Hide
              </button>
            </motion.div>
          )}
        </AnimatePresence>

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
            ref={micRef}
            className="absolute flex items-center justify-center rounded-full bg-primary text-primary-foreground w-7 h-7 shadow-lg"
            style={{ pointerEvents: "none", left: -999, top: -999 }}
            aria-hidden="true"
          >
            <Mic size={13} className={voiceListening ? "animate-pulse text-accent" : ""} />
          </span>
        )}
      </div>
      )}

      {/* Hidden-state minimal launcher — Ellie is gone but chat stays a click away */}
      {elliePref === "hidden" && !open && (
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Open chat with Ellie"
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
        >
          <MessageCircle size={20} />
          {unread > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-destructive text-white text-xs rounded-full flex items-center justify-center font-bold">
              {unread}
            </span>
          )}
        </button>
      )}

      {/* Quiet toast after hiding — no guilt copy, just the way back */}
      <AnimatePresence>
        {hideToast && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed bottom-20 right-5 z-50 bg-card border border-border/60 rounded-xl px-3.5 py-2.5 shadow-lg text-xs text-muted-foreground"
          >
            Ellie is hidden — the chat button is always here for you.
          </motion.div>
        )}
      </AnimatePresence>

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
                {elliePref !== "auto" && (
                  <button
                    onClick={() => setElliePref("auto")}
                    className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
                    title={elliePref === "hidden" ? "Show Ellie" : "Let Ellie roam"}
                    aria-label={elliePref === "hidden" ? "Show Ellie" : "Let Ellie roam"}
                  >
                    {elliePref === "hidden" ? <Eye size={13} /> : <Anchor size={13} />}
                  </button>
                )}
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
