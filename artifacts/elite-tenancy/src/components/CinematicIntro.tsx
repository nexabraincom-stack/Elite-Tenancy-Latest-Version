import { useEffect, useMemo, useState } from "react";

/**
 * Elite Tenancy — Cinematic Intro
 *
 * A premium, lightweight (pure CSS + inline SVG) intro shown once per browser
 * session on first load, then fades into the homepage. Fully responsive
 * (mobile + desktop), skippable, and respects `prefers-reduced-motion`.
 *
 * - Animated gold "ET" monogram (vector — crisp on every screen)
 * - Gold-gradient "Elite Tenancy" serif reveal with shimmer sweep
 * - Warm, aspirational copy
 * - Uses the site's existing Playfair Display + Plus Jakarta Sans (no extra requests)
 *
 * Mounted above <App /> in main.tsx.
 */

const SESSION_KEY = "et_intro_seen";
const TOTAL_MS = 4800;   // full timeline before auto-dismiss (tightened for patience)
const FADE_MS = 700;     // fade-out duration

export default function CinematicIntro() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (reduced || seen) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setShow(true);
  }, []);

  useEffect(() => {
    if (!show) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const t = setTimeout(() => dismiss(), TOTAL_MS);
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show]);

  function dismiss() {
    setLeaving(true);
    setTimeout(() => setShow(false), FADE_MS);
  }

  const particles = useMemo(
    () =>
      Array.from({ length: 38 }, (_, i) => {
        const size = 1.5 + Math.random() * 3.5;
        return {
          key: i,
          left: `${Math.random() * 100}vw`,
          size: `${size}px`,
          duration: `${5 + Math.random() * 6}s`,
          delay: `${Math.random() * 5}s`,
        };
      }),
    [],
  );

  if (!show) return null;

  return (
    <div
      className={`et-intro${leaving ? " et-intro--out" : ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <style>{CSS}</style>

      <div className="et-bar et-bar--top" />
      <div className="et-bar et-bar--bottom" />

      <div className="et-glow" />
      <div className="et-particles">
        {particles.map((p) => (
          <span
            key={p.key}
            className="et-p"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animation: `etRise ${p.duration} linear ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      <div className="et-content">
        {/* Gold ET monogram (vector) */}
        <svg className="et-monogram" viewBox="0 0 120 150" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="etGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#f1e0a8" />
              <stop offset="0.4" stopColor="#e6c45a" />
              <stop offset="0.75" stopColor="#c9a227" />
              <stop offset="1" stopColor="#9c7c1c" />
            </linearGradient>
          </defs>
          {/* Shield outline — draws in */}
          <path
            className="et-mono-shield"
            d="M60 5 L107 24 L107 87 L60 145 L13 87 L13 24 Z"
            stroke="url(#etGold)"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* E + T towers — fade/scale in */}
          <g className="et-mono-letters" stroke="url(#etGold)" strokeWidth="6.5" strokeLinecap="square">
            {/* E */}
            <path d="M44 46 V104" />
            <path d="M44 46 H62" />
            <path d="M44 75 H58" />
            <path d="M44 104 H62" />
            {/* T */}
            <path d="M57 46 H86" />
            <path d="M71.5 46 V104" />
          </g>
        </svg>

        <div className="et-crest">Premium Lettings · United Kingdom</div>
        <div className="et-rule" />
        <h1 className="et-brand">
          <span className="et-word et-word--1">Elite</span>{" "}
          <span className="et-word et-word--2">Tenancy</span>
        </h1>
        <div className="et-tag">Premium <span>UK</span> Lettings</div>
        <div className="et-sub">Find the place you’ll love to call home.</div>
      </div>

      <div className="et-vignette" />
      <button className="et-skip" onClick={dismiss} type="button">
        Skip ›
      </button>
    </div>
  );
}

const CSS = `
.et-intro{
  position:fixed;inset:0;z-index:9999;
  display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:radial-gradient(ellipse at 50% 38%, #16263a 0%, #0d1b2a 45%, #0a1420 100%);
  opacity:1;transition:opacity ${FADE_MS}ms ease;
}
.et-intro.et-intro--out{opacity:0;}

.et-bar{position:absolute;left:0;right:0;height:10vh;background:#000;z-index:6;}
.et-bar--top{top:0;transform:translateY(-100%);
  animation:etBarInTop .8s cubic-bezier(.16,1,.3,1) .05s forwards, etBarOutTop .8s ease 4.0s forwards;}
.et-bar--bottom{bottom:0;transform:translateY(100%);
  animation:etBarInBottom .8s cubic-bezier(.16,1,.3,1) .05s forwards, etBarOutBottom .8s ease 4.0s forwards;}
@keyframes etBarInTop{to{transform:translateY(0);}}
@keyframes etBarInBottom{to{transform:translateY(0);}}
@keyframes etBarOutTop{to{transform:translateY(-100%);}}
@keyframes etBarOutBottom{to{transform:translateY(100%);}}

.et-particles{position:absolute;inset:0;z-index:1;pointer-events:none;}
.et-p{position:absolute;bottom:-10px;border-radius:50%;background:#e6c45a;opacity:0;
  filter:drop-shadow(0 0 6px #c9a227);}
@keyframes etRise{
  0%{transform:translateY(0) scale(.6);opacity:0;}
  12%{opacity:.9;}
  85%{opacity:.5;}
  100%{transform:translateY(-105vh) scale(1.1);opacity:0;}
}

.et-glow{position:absolute;width:720px;height:720px;border-radius:50%;z-index:1;max-width:120vw;
  background:radial-gradient(circle, rgba(201,162,39,.16) 0%, rgba(201,162,39,0) 62%);
  opacity:0;animation:etGlowIn 1.8s ease .8s forwards;}
@keyframes etGlowIn{to{opacity:1;}}

.et-content{position:relative;z-index:4;text-align:center;padding:0 24px;}

/* ── ET monogram ── */
.et-monogram{width:clamp(58px,12vw,104px);height:auto;display:block;margin:0 auto 26px;
  filter:drop-shadow(0 0 16px rgba(201,162,39,.32));}
.et-mono-shield{stroke-dasharray:560;stroke-dashoffset:560;
  animation:etDraw 1.5s cubic-bezier(.16,1,.3,1) .5s forwards;opacity:.85;}
@keyframes etDraw{to{stroke-dashoffset:0;}}
.et-mono-letters{opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(.82);
  animation:etMonoIn 1s cubic-bezier(.16,1,.3,1) 1.0s forwards;}
@keyframes etMonoIn{to{opacity:1;transform:scale(1);}}

.et-crest{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;letter-spacing:.5em;
  text-transform:uppercase;color:#c9a227;opacity:0;margin-bottom:20px;transform:translateY(8px);
  animation:etFadeUp .9s ease 1.3s forwards;}

.et-rule{height:1px;width:0;margin:0 auto 24px;
  background:linear-gradient(90deg, transparent, #c9a227 50%, transparent);
  animation:etRuleGrow 1.2s cubic-bezier(.16,1,.3,1) 1.5s forwards;}
@keyframes etRuleGrow{to{width:min(340px,72vw);}}

.et-brand{font-family:'Playfair Display',serif;font-weight:600;
  font-size:clamp(38px,8.5vw,98px);line-height:1.04;letter-spacing:.02em;
  background:linear-gradient(180deg,#f1e0a8 0%,#e6c45a 38%,#c9a227 72%,#9c7c1c 100%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
  color:transparent;position:relative;display:inline-block;}
.et-word{display:inline-block;opacity:0;transform:translateY(24px) scale(.96);filter:blur(8px);}
.et-word--1{animation:etWordIn 1s cubic-bezier(.16,1,.3,1) 1.7s forwards;}
.et-word--2{animation:etWordIn 1s cubic-bezier(.16,1,.3,1) 1.9s forwards;}
@keyframes etWordIn{to{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
.et-brand::after{content:"";position:absolute;inset:0;z-index:2;
  background:linear-gradient(105deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
  transform:translateX(-120%);animation:etShimmer 1.5s ease 2.7s forwards;
  mix-blend-mode:screen;pointer-events:none;}
@keyframes etShimmer{to{transform:translateX(120%);}}

.et-tag{font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;
  font-size:clamp(11px,1.5vw,15px);letter-spacing:.4em;text-transform:uppercase;
  color:#f1ece1;opacity:0;margin-top:28px;transform:translateY(10px);
  animation:etFadeUp .9s ease 2.8s forwards;}
.et-tag span{color:#c9a227;}

.et-sub{font-family:'Playfair Display',serif;font-style:italic;font-weight:400;
  font-size:clamp(14px,2.2vw,19px);letter-spacing:.01em;color:#c8bfa8;opacity:0;margin-top:16px;
  animation:etFadeUp .9s ease 3.2s forwards;}

@keyframes etFadeUp{to{opacity:1;transform:translateY(0);}}

.et-vignette{position:absolute;inset:0;z-index:3;pointer-events:none;
  box-shadow:inset 0 0 220px 60px rgba(0,0,0,.65);}

.et-skip{position:absolute;bottom:13vh;right:34px;z-index:7;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;letter-spacing:.2em;
  text-transform:uppercase;color:#7d8696;background:transparent;border:none;cursor:pointer;
  opacity:0;animation:etFadeUp 1s ease 2.4s forwards;transition:color .2s;
  -webkit-tap-highlight-color:transparent;padding:10px;}
.et-skip:hover{color:#c9a227;}

/* ── Mobile tuning ── */
@media (max-width:600px){
  .et-bar{height:8vh;}
  .et-monogram{margin-bottom:20px;}
  .et-crest{letter-spacing:.34em;font-size:10px;margin-bottom:16px;}
  .et-brand{font-size:clamp(36px,13vw,60px);letter-spacing:0;line-height:1.06;}
  .et-tag{letter-spacing:.28em;margin-top:22px;}
  .et-sub{font-size:15px;padding:0 10px;margin-top:14px;}
  .et-skip{right:16px;bottom:11vh;}
}

@media (prefers-reduced-motion: reduce){
  .et-intro{display:none;}
}
`;
