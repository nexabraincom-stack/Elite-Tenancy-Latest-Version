import { useEffect, useState, type CSSProperties } from "react";

/**
 * Elite Tenancy — Property Showcase Intro (v5)
 *
 * A property-themed animated intro that showcases beautiful homes with
 * Ken Burns pan/zoom effects, then reveals the brand with a golden key-turn
 * animation. Uses the Housebox navy/gold/cream palette throughout.
 *
 * Sequence (6s total):
 *  1. Navy void with gold shimmer particles
 *  2. Three property image panels slide in with Ken Burns zoom
 *  3. Panels converge and dissolve into a golden key-turn reveal
 *  4. Brand text materialises with golden rule + tagline
 *  5. Smooth cream wash transitions into the homepage
 */

const SESSION_KEY = "et_intro_seen_v5";
const TOTAL_MS = 6200;
const FADE_MS = 700;

const ELITE = "Elite".split("");
const TENANCY = "Tenancy".split("");

const PROPERTY_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
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

  const eliteStart = 3.6;
  const tenancyStart = 4.15;
  const step = 0.065;

  return (
    <div className={`et5${leaving ? " et5--out" : ""}`} role="presentation" aria-hidden="true">
      <style>{CSS}</style>

      {/* Floating gold particles */}
      <div className="et5-particles">
        {Array.from({ length: 35 }, (_, i) => (
          <span
            key={i}
            className="et5-dot"
            style={{
              "--x": `${10 + Math.random() * 80}%`,
              "--y": `${10 + Math.random() * 80}%`,
              "--s": `${1.5 + Math.random() * 3}px`,
              "--d": `${Math.random() * 2}s`,
              "--dur": `${2 + Math.random() * 2}s`,
              "--drift": `${-20 + Math.random() * 40}px`,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* Property image panels with Ken Burns effect */}
      <div className="et5-panels">
        {PROPERTY_IMAGES.map((src, i) => (
          <div
            key={i}
            className={`et5-panel et5-panel--${i}`}
            style={{ "--pdel": `${0.15 + i * 0.25}s` } as CSSProperties}
          >
            <div className="et5-panel-inner">
              <img src={src} alt="" className={`et5-panel-img et5-kb--${i}`} draggable={false} />
              <div className="et5-panel-overlay" />
            </div>
          </div>
        ))}
      </div>

      {/* Golden key icon reveal */}
      <div className="et5-key-wrap">
        <svg className="et5-key" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="et5KeyGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F0D89A" />
              <stop offset="0.4" stopColor="#D4A24A" />
              <stop offset="1" stopColor="#B8862A" />
            </linearGradient>
          </defs>
          <circle cx="24" cy="20" r="10" stroke="url(#et5KeyGrad)" strokeWidth="2.5" fill="none" />
          <circle cx="24" cy="20" r="4" fill="url(#et5KeyGrad)" opacity="0.6" />
          <line x1="24" y1="30" x2="24" y2="52" stroke="url(#et5KeyGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="42" x2="32" y2="42" stroke="url(#et5KeyGrad)" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="24" y1="48" x2="30" y2="48" stroke="url(#et5KeyGrad)" strokeWidth="2.5" strokeLinecap="round" />
        </svg>
      </div>

      {/* Burst + cream wash */}
      <div className="et5-burst" />
      <div className="et5-wash" />

      {/* Brand content */}
      <div className="et5-content">
        <div className="et5-glow" />

        <div className="et5-mono-wrap">
          <svg className="et5-monogram" viewBox="0 0 120 150" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="et5Gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d9b566" />
                <stop offset="0.4" stopColor="#D4A24A" />
                <stop offset="0.75" stopColor="#a07c20" />
                <stop offset="1" stopColor="#7a5e18" />
              </linearGradient>
            </defs>
            <path d="M60 5 L107 24 L107 87 L60 145 L13 87 L13 24 Z" stroke="url(#et5Gold)" strokeWidth="2.4" strokeLinejoin="round" opacity="0.9" />
            <g stroke="url(#et5Gold)" strokeWidth="7.5" strokeLinecap="square">
              <path d="M44 46 V104" /><path d="M44 46 H62" /><path d="M44 75 H58" />
              <path d="M44 104 H62" /><path d="M57 46 H86" /><path d="M71.5 46 V104" />
            </g>
          </svg>
        </div>

        <div className="et5-rule" />

        <h1 className="et5-brand">
          <span className="et5-line">
            {ELITE.map((c, i) => (
              <span key={`e${i}`} className="et5-ltr" style={{ animationDelay: `${eliteStart + i * step}s` }}>{c}</span>
            ))}
          </span>{" "}
          <span className="et5-line">
            {TENANCY.map((c, i) => (
              <span key={`t${i}`} className="et5-ltr" style={{ animationDelay: `${tenancyStart + i * step}s` }}>{c}</span>
            ))}
          </span>
          <span className="et5-shimmer" />
        </h1>

        <div className="et5-tag">Find the place you'll love to call <span>home</span></div>
      </div>

      <button className="et5-skip" onClick={dismiss} type="button">Skip ›</button>
    </div>
  );
}

const CSS = `
/* Root container */
.et5{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:#0D1520;opacity:1;transition:opacity ${FADE_MS}ms ease;}
.et5--out{opacity:0;}

/* Floating gold dots */
.et5-particles{position:absolute;inset:0;z-index:1;pointer-events:none;}
.et5-dot{position:absolute;left:var(--x);top:var(--y);width:var(--s);height:var(--s);border-radius:50%;
  background:#D4A24A;opacity:0;
  animation:et5Float var(--dur) ease-in-out var(--d) infinite;}
@keyframes et5Float{
  0%{opacity:0;transform:translateY(0);}
  30%{opacity:.6;}
  70%{opacity:.4;}
  100%{opacity:0;transform:translateY(var(--drift));}
}

/* Property image panels */
.et5-panels{position:absolute;inset:0;z-index:2;display:flex;align-items:center;justify-content:center;gap:16px;padding:10vh 6vw;
  opacity:0;animation:et5PanelsIn .9s cubic-bezier(.16,1,.3,1) .3s forwards, et5PanelsOut .7s ease 2.2s forwards;}
@keyframes et5PanelsIn{to{opacity:1;}}
@keyframes et5PanelsOut{to{opacity:0;transform:scale(1.08);}}

.et5-panel{flex:1;max-width:320px;height:clamp(200px,42vh,380px);border-radius:14px;overflow:hidden;
  box-shadow:0 20px 60px rgba(0,0,0,.6),0 0 0 1px rgba(212,162,74,.25);
  transform:translateY(40px);opacity:0;
  animation:et5CardIn .8s cubic-bezier(.16,1,.3,1) var(--pdel) forwards;}
.et5-panel--0{transform:translateY(40px) rotate(-3deg);}
.et5-panel--1{transform:translateY(30px) scale(1.04);z-index:1;}
.et5-panel--2{transform:translateY(40px) rotate(3deg);}
@keyframes et5CardIn{
  to{opacity:1;transform:translateY(0) rotate(0) scale(1);}
}

.et5-panel-inner{width:100%;height:100%;position:relative;overflow:hidden;}
.et5-panel-img{width:100%;height:100%;object-fit:cover;display:block;}
.et5-panel-overlay{position:absolute;inset:0;
  background:linear-gradient(180deg,rgba(13,21,32,0) 40%,rgba(13,21,32,.55) 100%);
  border-bottom:2px solid rgba(212,162,74,.4);}

/* Ken Burns zoom/pan per panel */
.et5-kb--0{animation:et5KB0 3s ease-in-out .4s both;}
.et5-kb--1{animation:et5KB1 3s ease-in-out .6s both;}
.et5-kb--2{animation:et5KB2 3s ease-in-out .8s both;}
@keyframes et5KB0{from{transform:scale(1.15) translateX(-3%);}to{transform:scale(1.25) translateX(2%);}}
@keyframes et5KB1{from{transform:scale(1.1);}to{transform:scale(1.22) translateY(-2%);}}
@keyframes et5KB2{from{transform:scale(1.15) translateX(3%);}to{transform:scale(1.25) translateX(-2%);}}

/* Golden key reveal */
.et5-key-wrap{position:absolute;top:50%;left:50%;z-index:4;
  transform:translate(-50%,-50%) scale(0) rotate(-45deg);opacity:0;
  animation:et5KeyIn 1s cubic-bezier(.16,1,.3,1) 2.4s forwards, et5KeyOut .6s ease 3s forwards;}
@keyframes et5KeyIn{to{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(0deg);}}
@keyframes et5KeyOut{to{opacity:0;transform:translate(-50%,-50%) scale(1.5) rotate(15deg);}}
.et5-key{width:clamp(48px,10vw,80px);height:auto;filter:drop-shadow(0 0 30px rgba(212,162,74,.6));}

/* Burst + wash */
.et5-burst{position:absolute;top:50%;left:50%;width:10px;height:10px;border-radius:50%;z-index:5;
  transform:translate(-50%,-50%) scale(0);
  background:radial-gradient(circle,#ffffff 0%,#fff6da 20%,rgba(212,162,74,.5) 40%,transparent 70%);
  animation:et5Burst 1.2s cubic-bezier(.16,1,.3,1) 2.85s forwards;}
@keyframes et5Burst{0%{opacity:0;transform:translate(-50%,-50%) scale(0);}
  35%{opacity:1;transform:translate(-50%,-50%) scale(30);}
  100%{opacity:0;transform:translate(-50%,-50%) scale(50);}}

.et5-wash{position:absolute;inset:0;z-index:6;opacity:0;pointer-events:none;
  background:radial-gradient(ellipse at 50% 44%,#ffffff 0%,#FAF8F4 45%,#f0ece4 100%);
  animation:et5Wash 1.4s cubic-bezier(.16,1,.3,1) 2.95s forwards;}
@keyframes et5Wash{to{opacity:1;}}

/* Brand content */
.et5-content{position:relative;z-index:7;text-align:center;padding:0 24px;}
.et5-glow{position:absolute;top:50%;left:50%;width:500px;height:500px;border-radius:50%;
  transform:translate(-50%,-50%) scale(.5);opacity:0;pointer-events:none;
  background:radial-gradient(circle,rgba(212,162,74,.15) 0%,rgba(212,162,74,.04) 50%,transparent 70%);
  animation:et5Glow 2s ease 3.4s forwards;}
@keyframes et5Glow{0%{opacity:0;transform:translate(-50%,-50%) scale(.5);}
  50%{opacity:1;transform:translate(-50%,-50%) scale(1);}
  100%{opacity:.4;transform:translate(-50%,-50%) scale(1.1);}}

.et5-mono-wrap{display:inline-block;margin:0 auto 20px;}
.et5-monogram{width:clamp(56px,10vw,96px);height:auto;display:block;opacity:0;
  transform:scale(.4) rotate(-8deg);filter:drop-shadow(0 0 18px rgba(212,162,74,.5));
  animation:et5MonoIn 1s cubic-bezier(.16,1,.3,1) 3.1s forwards;}
@keyframes et5MonoIn{0%{opacity:0;transform:scale(.4) rotate(-8deg);}
  60%{opacity:1;}100%{opacity:1;transform:scale(1) rotate(0);}}

.et5-rule{height:1px;width:0;margin:0 auto 18px;
  background:linear-gradient(90deg,transparent,#D4A24A 50%,transparent);
  animation:et5Rule .9s cubic-bezier(.16,1,.3,1) 3.5s forwards;}
@keyframes et5Rule{to{width:min(300px,65vw);}}

.et5-brand{position:relative;font-family:'Poppins',sans-serif;font-weight:700;
  font-size:clamp(40px,8.5vw,100px);line-height:1.05;letter-spacing:.01em;display:inline-block;}
.et5-line{display:inline-block;white-space:nowrap;}
.et5-ltr{display:inline-block;opacity:0;transform:translateY(24px) scale(.92);filter:blur(6px);
  background:linear-gradient(180deg,#1E4D60 0%,#163A4A 50%,#0F2830 100%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;
  animation:et5LtrIn .7s cubic-bezier(.16,1,.3,1) forwards;}
@keyframes et5LtrIn{to{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
.et5-shimmer{position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:screen;
  background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.45) 50%,transparent 60%);
  transform:translateX(-120%);animation:et5Shimmer 1.2s ease 4.8s forwards;}
@keyframes et5Shimmer{to{transform:translateX(120%);}}

.et5-tag{font-family:'Inter',sans-serif;font-weight:400;font-size:clamp(13px,1.8vw,17px);
  font-style:italic;color:#5E7A84;opacity:0;margin-top:20px;transform:translateY(8px);
  animation:et5FadeUp .8s ease 5s forwards;}
.et5-tag span{color:#D4A24A;font-weight:600;}
@keyframes et5FadeUp{to{opacity:1;transform:translateY(0);}}

/* Skip button */
.et5-skip{position:absolute;bottom:max(24px,4vh);right:28px;z-index:10;font-family:'Inter',sans-serif;
  font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#D4A24A;background:transparent;border:none;
  cursor:pointer;opacity:0;animation:et5FadeUp .8s ease 1s forwards;transition:color .2s;
  -webkit-tap-highlight-color:transparent;padding:10px;}
.et5-skip:hover{color:#F0D89A;}

/* Mobile */
@media(max-width:640px){
  .et5-panels{gap:10px;padding:12vh 4vw;}
  .et5-panel{max-width:240px;height:clamp(160px,35vh,260px);border-radius:10px;}
  .et5-brand{font-size:clamp(34px,12vw,54px);}
  .et5-tag{font-size:13px;padding:0 12px;}
  .et5-skip{right:14px;bottom:20px;}
}
@media(prefers-reduced-motion:reduce){.et5{display:none;}}
`;
