import { useEffect, useState, type CSSProperties } from "react";

/**
 * Elite Tenancy — Property Showcase Intro (v6)
 *
 * A refined, editorial-feeling intro: one photo at a time (not competing
 * panels), a slow single-camera Ken Burns move, a hand-drawn stroke reveal
 * of the brand mark instead of a flash/burst, and a soft cross-dissolve out.
 * Housebox navy/gold/cream palette throughout.
 *
 * Sequence (7.6s total):
 *  1. Navy void, faint gold dust
 *  2. Three property photos cross-dissolve in sequence, each with a slow zoom
 *  3. Photos dissolve away; the diamond mark and monogram draw on stroke-by-stroke
 *  4. Brand wordmark materialises with a gold rule and tagline
 *  5. Whole overlay cross-dissolves into the homepage
 */

const SESSION_KEY = "et_intro_seen_v6";
const TOTAL_MS = 7600;
const FADE_MS = 900;

const ELITE = "Elite".split("");
const TENANCY = "Tenancy".split("");

const PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1400&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=80",
];

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

  if (!show) return null;

  const eliteStart = 5.9;
  const tenancyStart = 6.35;
  const step = 0.055;

  return (
    <div className={`et6${leaving ? " et6--out" : ""}`} role="presentation" aria-hidden="true">
      <style>{CSS}</style>

      {/* Faint gold dust */}
      <div className="et6-particles">
        {Array.from({ length: 22 }, (_, i) => (
          <span
            key={i}
            className="et6-dot"
            style={{
              "--x": `${10 + Math.random() * 80}%`,
              "--y": `${10 + Math.random() * 80}%`,
              "--s": `${1 + Math.random() * 2}px`,
              "--d": `${Math.random() * 3}s`,
              "--dur": `${3 + Math.random() * 3}s`,
              "--drift": `${-16 + Math.random() * 32}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* Single-camera photo sequence — one image at a time, slow cross-dissolve */}
      <div className="et6-stage">
        {PROPERTY_IMAGES.map((src, i) => (
          <div key={i} className={`et6-frame et6-frame--${i}`}>
            <img src={src} alt="" className="et6-frame-img" draggable={false} />
          </div>
        ))}
        <div className="et6-stage-veil" />
        <div className="et6-vignette" />
      </div>

      {/* Brand content */}
      <div className="et6-content">
        <div className="et6-glow" />

        <svg className="et6-monogram" viewBox="0 0 120 150" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="et6Gold" gradientUnits="userSpaceOnUse" x1="60" y1="5" x2="60" y2="145">
              <stop offset="0" stopColor="#F0D89A" />
              <stop offset="0.4" stopColor="#D4A24A" />
              <stop offset="0.75" stopColor="#a07c20" />
              <stop offset="1" stopColor="#7a5e18" />
            </linearGradient>
          </defs>
          <path
            className="et6-mono-outline"
            d="M60 5 L107 24 L107 87 L60 145 L13 87 L13 24 Z"
            stroke="url(#et6Gold)"
            strokeWidth="2.4"
            strokeLinejoin="round"
            style={{ "--len": 377 } as CSSProperties}
          />
          <g className="et6-mono-strokes" stroke="url(#et6Gold)" strokeWidth="7.5" strokeLinecap="square">
            <path d="M44 46 V104" />
            <path d="M44 46 H62" />
            <path d="M44 75 H58" />
            <path d="M44 104 H62" />
            <path d="M57 46 H86" />
            <path d="M71.5 46 V104" />
          </g>
        </svg>

        <div className="et6-rule" />

        <h1 className="et6-brand">
          <span className="et6-line">
            {ELITE.map((c, i) => (
              <span key={`e${i}`} className="et6-ltr" style={{ animationDelay: `${eliteStart + i * step}s` }}>{c}</span>
            ))}
          </span>{" "}
          <span className="et6-line">
            {TENANCY.map((c, i) => (
              <span key={`t${i}`} className="et6-ltr" style={{ animationDelay: `${tenancyStart + i * step}s` }}>{c}</span>
            ))}
          </span>
          <span className="et6-shimmer" />
        </h1>

        <div className="et6-tag">Find the place you'll love to call <span>home</span></div>
      </div>

      <button className="et6-skip" onClick={dismiss} type="button">Skip ›</button>
    </div>
  );
}

const CSS = `
.et6{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:#0D1520;opacity:1;transition:opacity ${FADE_MS}ms cubic-bezier(.4,0,.2,1);}
.et6--out{opacity:0;}

/* Gold dust */
.et6-particles{position:absolute;inset:0;z-index:1;pointer-events:none;}
.et6-dot{position:absolute;left:var(--x);top:var(--y);width:var(--s);height:var(--s);border-radius:50%;
  background:#D4A24A;opacity:0;
  animation:et6Float var(--dur) ease-in-out var(--d) infinite;}
@keyframes et6Float{
  0%{opacity:0;transform:translateY(0);}
  30%{opacity:.45;}
  70%{opacity:.25;}
  100%{opacity:0;transform:translateY(var(--drift));}
}

/* Photo sequence stage: fades in, holds through all 3 frames, fades out */
.et6-stage{position:absolute;inset:0;z-index:2;
  opacity:0;animation:et6StageIn .7s ease .1s forwards, et6StageOut .8s cubic-bezier(.4,0,.2,1) 4s forwards;}
@keyframes et6StageIn{to{opacity:1;}}
@keyframes et6StageOut{to{opacity:0;}}

.et6-frame{position:absolute;inset:0;opacity:0;overflow:hidden;}
.et6-frame-img{width:100%;height:100%;object-fit:cover;display:block;transform:scale(1.06);}

/* One frame visible at a time — fade in, slow zoom, hold, fade out */
.et6-frame--0{animation:et6FrameShow 1.6s ease-in-out 0s forwards;}
.et6-frame--0 .et6-frame-img{animation:et6Zoom 1.6s ease-out 0s forwards;}
.et6-frame--1{animation:et6FrameShow 1.6s ease-in-out 1.3s forwards;}
.et6-frame--1 .et6-frame-img{animation:et6Zoom 1.6s ease-out 1.3s forwards;}
.et6-frame--2{animation:et6FrameShow 1.6s ease-in-out 2.6s forwards;}
.et6-frame--2 .et6-frame-img{animation:et6Zoom 1.6s ease-out 2.6s forwards;}
@keyframes et6FrameShow{
  0%{opacity:0;}
  20%{opacity:1;}
  80%{opacity:1;}
  100%{opacity:0;}
}
@keyframes et6Zoom{from{transform:scale(1.05);}to{transform:scale(1.15);}}

.et6-stage-veil{position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(13,21,32,.35) 0%,rgba(13,21,32,.15) 35%,rgba(13,21,32,.55) 100%);}
.et6-vignette{position:absolute;inset:0;
  background:radial-gradient(ellipse at center,transparent 35%,rgba(13,21,32,.65) 100%);}

/* Brand content */
.et6-content{position:relative;z-index:7;text-align:center;padding:0 24px;}
.et6-glow{position:absolute;top:50%;left:50%;width:520px;height:520px;border-radius:50%;
  transform:translate(-50%,-50%) scale(.5);opacity:0;pointer-events:none;
  background:radial-gradient(circle,rgba(212,162,74,.16) 0%,rgba(212,162,74,.04) 50%,transparent 70%);
  animation:et6Glow 1.8s ease 4.3s forwards;}
@keyframes et6Glow{0%{opacity:0;transform:translate(-50%,-50%) scale(.5);}
  60%{opacity:1;transform:translate(-50%,-50%) scale(1);}
  100%{opacity:.5;transform:translate(-50%,-50%) scale(1.08);}}

/* Monogram — hand-drawn stroke reveal instead of a pop/burst */
.et6-monogram{width:clamp(56px,10vw,96px);height:auto;display:block;margin:0 auto 20px;opacity:0;
  filter:drop-shadow(0 0 18px rgba(212,162,74,.45));
  animation:et6MonoFadeIn .5s ease 4.3s forwards;}
@keyframes et6MonoFadeIn{to{opacity:1;}}
.et6-mono-outline{stroke-dasharray:var(--len);stroke-dashoffset:var(--len);
  animation:et6Draw .9s cubic-bezier(.65,0,.35,1) 4.3s forwards;}
@keyframes et6Draw{to{stroke-dashoffset:0;}}
.et6-mono-strokes{opacity:0;transform:scale(.85);transform-origin:60px 75px;
  animation:et6StrokesIn .55s cubic-bezier(.16,1,.3,1) 5.15s forwards;}
@keyframes et6StrokesIn{to{opacity:1;transform:scale(1);}}

.et6-rule{height:1px;width:0;margin:0 auto 18px;
  background:linear-gradient(90deg,transparent,#D4A24A 50%,transparent);
  animation:et6Rule .75s cubic-bezier(.16,1,.3,1) 5.5s forwards;}
@keyframes et6Rule{to{width:min(300px,65vw);}}

.et6-brand{position:relative;font-family:'Poppins',sans-serif;font-weight:700;
  font-size:clamp(40px,8.5vw,100px);line-height:1.05;letter-spacing:.01em;display:inline-block;}
.et6-line{display:inline-block;white-space:nowrap;}
.et6-ltr{display:inline-block;opacity:0;transform:translateY(20px) scale(.94);filter:blur(5px);
  background:linear-gradient(180deg,#1E4D60 0%,#163A4A 50%,#0F2830 100%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;
  animation:et6LtrIn .6s cubic-bezier(.16,1,.3,1) forwards;}
@keyframes et6LtrIn{to{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
.et6-shimmer{position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:screen;
  background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.4) 50%,transparent 60%);
  transform:translateX(-120%);animation:et6Shimmer 1s ease 7.05s forwards;}
@keyframes et6Shimmer{to{transform:translateX(120%);}}

.et6-tag{font-family:'Inter',sans-serif;font-weight:400;font-size:clamp(13px,1.8vw,17px);
  font-style:italic;color:#5E7A84;opacity:0;margin-top:20px;transform:translateY(8px);
  animation:et6FadeUp .7s ease 6.85s forwards;}
.et6-tag span{color:#D4A24A;font-weight:600;}
@keyframes et6FadeUp{to{opacity:1;transform:translateY(0);}}

/* Skip button */
.et6-skip{position:absolute;bottom:max(24px,4vh);right:28px;z-index:10;font-family:'Inter',sans-serif;
  font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#D4A24A;background:transparent;border:none;
  cursor:pointer;opacity:0;animation:et6FadeUp .8s ease 1s forwards;transition:color .2s;
  -webkit-tap-highlight-color:transparent;padding:10px;}
.et6-skip:hover{color:#F0D89A;}

@media(max-width:640px){
  .et6-brand{font-size:clamp(34px,12vw,54px);}
  .et6-tag{font-size:13px;padding:0 12px;}
  .et6-skip{right:14px;bottom:20px;}
}
@media(prefers-reduced-motion:reduce){.et6{display:none;}}
`;
