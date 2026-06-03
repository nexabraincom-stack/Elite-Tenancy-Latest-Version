import { useEffect, useMemo, useState, type CSSProperties } from "react";

/**
 * Elite Tenancy — Cinematic Intro (v4 — "Convergence" edition)
 *
 * Shown once per browser session on first load, then fades into the homepage.
 * Fully responsive, skippable, and respects `prefers-reduced-motion`.
 *
 * Sequence:
 *  1. Deep forest-green cinematic void (brand colour, letterboxed).
 *  2. Gold particles + comet streaks fly IN from every edge and converge
 *     on the centre, accelerating.
 *  3. They collapse into a luminous golden BURST that washes the stage to ivory.
 *  4. The gold "ET" monogram materialises out of the burst, followed by a
 *     letter-by-letter "Elite Tenancy" reveal, crest, tagline and sub-line.
 *
 * Pure CSS + inline SVG (no video, no heavy deps). Mounted above <App/>.
 */

const SESSION_KEY = "et_intro_seen_v4";
const TOTAL_MS = 8200; // full timeline before auto-dismiss
const FADE_MS = 800;

const ELITE = "Elite".split("");
const TENANCY = "Tenancy".split("");

const COLORS = ["#e6c45a", "#c9a227", "#f1e0a8", "#d9b566", "#9fbcad"];

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

  // Converging particles — each starts off one of the four edges and flies to centre.
  const particles = useMemo(() => {
    return Array.from({ length: 140 }, (_, i) => {
      const side = i % 4; // even spread across all four edges
      const spread = () => Math.random() * 2 - 1; // -1..1
      let sx: string, sy: string;
      if (side === 0) { sx = `${spread() * 70}vw`; sy = `${-58 - Math.random() * 25}vh`; }
      else if (side === 1) { sx = `${58 + Math.random() * 25}vw`; sy = `${spread() * 70}vh`; }
      else if (side === 2) { sx = `${spread() * 70}vw`; sy = `${58 + Math.random() * 25}vh`; }
      else { sx = `${-58 - Math.random() * 25}vw`; sy = `${spread() * 70}vh`; }
      const hero = Math.random() < 0.18;
      const size = hero ? 5 + Math.random() * 4 : 2 + Math.random() * 3.4;
      const col = COLORS[(Math.random() * COLORS.length) | 0];
      return {
        key: i, sx, sy, col,
        size: `${size.toFixed(1)}px`,
        glow: `${(7 + size * 1.8).toFixed(0)}px`,
        s0: (0.5 + Math.random() * 0.8).toFixed(2),
        op: (0.55 + Math.random() * 0.45).toFixed(2),
        dur: `${(1.7 + Math.random() * 0.7).toFixed(2)}s`,
        del: `${(Math.random() * 0.9).toFixed(2)}s`,
      };
    });
  }, []);

  const streaks = useMemo(() => {
    return Array.from({ length: 18 }, (_, i) => ({
      key: i,
      ang: `${(i / 18) * 360 + Math.random() * 14}deg`,
      len: `${80 + Math.random() * 120}px`,
      slen: `${34 + Math.random() * 16}vw`,
      dur: `${(1.5 + Math.random() * 0.5).toFixed(2)}s`,
      del: `${(0.3 + Math.random() * 0.8).toFixed(2)}s`,
    }));
  }, []);

  if (!show) return null;

  const eliteStart = 3.4;
  const tenancyStart = 4.1;
  const step = 0.07;

  return (
    <div className={`et4${leaving ? " et4--out" : ""}`} role="presentation" aria-hidden="true">
      <style>{CSS}</style>

      {/* letterbox bars */}
      <div className="et4-bar et4-bar--top" />
      <div className="et4-bar et4-bar--bottom" />

      {/* converging particle field */}
      <div className="et4-field">
        {particles.map((p) => (
          <span
            key={p.key}
            className="et4-p"
            style={{
              width: p.size, height: p.size, background: p.col,
              boxShadow: `0 0 ${p.glow} ${p.col}`,
              "--sx": p.sx, "--sy": p.sy, "--s0": p.s0, "--op": p.op,
              "--dur": p.dur, "--del": p.del,
            } as CSSProperties}
          />
        ))}
        {streaks.map((s) => (
          <span
            key={`s${s.key}`}
            className="et4-streak"
            style={{
              width: s.len,
              "--ang": s.ang, "--slen": s.slen, "--sdur": s.dur, "--sdel": s.del,
            } as CSSProperties}
          />
        ))}
      </div>

      {/* burst + ivory wash */}
      <div className="et4-burst" />
      <div className="et4-ringburst" />
      <div className="et4-wash" />

      <div className="et4-content">
        <div className="et4-pulse" />
        <div className="et4-mono-wrap">
          <span className="et4-ring" />
          <svg className="et4-monogram" viewBox="0 0 120 150" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="et4Gold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d9b566" />
                <stop offset="0.4" stopColor="#c9a227" />
                <stop offset="0.75" stopColor="#a07c20" />
                <stop offset="1" stopColor="#7a5e18" />
              </linearGradient>
            </defs>
            <path d="M60 5 L107 24 L107 87 L60 145 L13 87 L13 24 Z" stroke="url(#et4Gold)" strokeWidth="2.4" strokeLinejoin="round" opacity="0.9" />
            <g stroke="url(#et4Gold)" strokeWidth="7.5" strokeLinecap="square">
              <path d="M44 46 V104" /><path d="M44 46 H62" /><path d="M44 75 H58" />
              <path d="M44 104 H62" /><path d="M57 46 H86" /><path d="M71.5 46 V104" />
            </g>
          </svg>
        </div>

        <div className="et4-crest">Premium Lettings · United Kingdom</div>
        <div className="et4-rule" />

        <h1 className="et4-brand">
          <span className="et4-line">
            {ELITE.map((c, i) => (
              <span key={`e${i}`} className="et4-ltr" style={{ animationDelay: `${eliteStart + i * step}s` }}>{c}</span>
            ))}
          </span>{" "}
          <span className="et4-line">
            {TENANCY.map((c, i) => (
              <span key={`t${i}`} className="et4-ltr" style={{ animationDelay: `${tenancyStart + i * step}s` }}>{c}</span>
            ))}
          </span>
          <span className="et4-shimmer" />
        </h1>

        <div className="et4-tag">Premium <span>UK</span> Lettings</div>
        <div className="et4-sub">Find the place you’ll love to call home.</div>
      </div>

      <div className="et4-vignette" />
      <button className="et4-skip" onClick={dismiss} type="button">Skip ›</button>
    </div>
  );
}

const CSS = `
.et4{position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;overflow:hidden;
  background:radial-gradient(ellipse at 50% 50%, #15302a 0%, #102521 55%, #0a1714 100%);
  opacity:1;transition:opacity ${FADE_MS}ms ease;}
.et4--out{opacity:0;}

.et4-wash{position:absolute;inset:0;z-index:3;opacity:0;pointer-events:none;
  background:radial-gradient(ellipse at 50% 44%, #ffffff 0%, #faf7f1 42%, #f0eadf 100%);
  animation:et4Wash 1.7s cubic-bezier(.16,1,.3,1) 2.35s forwards;}
@keyframes et4Wash{to{opacity:1;}}

.et4-bar{position:absolute;left:0;right:0;height:9vh;background:#0a1714;z-index:8;}
.et4-bar--top{top:0;transform:translateY(-100%);animation:et4BarTop .9s cubic-bezier(.16,1,.3,1) .15s forwards, et4BarTopOut .8s ease 7.1s forwards;}
.et4-bar--bottom{bottom:0;transform:translateY(100%);animation:et4BarBot .9s cubic-bezier(.16,1,.3,1) .15s forwards, et4BarBotOut .8s ease 7.1s forwards;}
@keyframes et4BarTop{to{transform:translateY(0);}} @keyframes et4BarBot{to{transform:translateY(0);}}
@keyframes et4BarTopOut{to{transform:translateY(-100%);}} @keyframes et4BarBotOut{to{transform:translateY(100%);}}

.et4-field{position:absolute;top:50%;left:50%;width:0;height:0;z-index:2;}
.et4-p{position:absolute;top:0;left:0;border-radius:50%;
  transform:translate(var(--sx),var(--sy)) scale(var(--s0));opacity:0;
  animation:et4Converge var(--dur) cubic-bezier(.55,0,.85,.4) var(--del) forwards;}
@keyframes et4Converge{
  0%{transform:translate(var(--sx),var(--sy)) scale(var(--s0));opacity:0;}
  12%{opacity:var(--op);}
  72%{opacity:var(--op);}
  100%{transform:translate(0,0) scale(.15);opacity:0;}
}
.et4-streak{position:absolute;top:0;left:0;height:1.5px;transform-origin:left center;
  background:linear-gradient(90deg, rgba(230,196,90,0) 0%, rgba(230,196,90,.85) 80%, #fff 100%);
  opacity:0;animation:et4Streak var(--sdur) cubic-bezier(.55,0,.85,.4) var(--sdel) forwards;}
@keyframes et4Streak{
  0%{opacity:0;transform:rotate(var(--ang)) translateX(var(--slen)) scaleX(.2);}
  30%{opacity:.9;}
  100%{opacity:0;transform:rotate(var(--ang)) translateX(0) scaleX(1.4);}
}

.et4-burst{position:absolute;top:50%;left:50%;width:10px;height:10px;border-radius:50%;z-index:4;
  transform:translate(-50%,-50%) scale(0);
  background:radial-gradient(circle, #ffffff 0%, #fff6da 18%, rgba(230,196,90,.65) 38%, rgba(201,162,39,0) 70%);
  animation:et4Burst 1.5s cubic-bezier(.16,1,.3,1) 2.3s forwards;}
@keyframes et4Burst{0%{opacity:0;transform:translate(-50%,-50%) scale(0);}30%{opacity:1;transform:translate(-50%,-50%) scale(34);}100%{opacity:0;transform:translate(-50%,-50%) scale(60);}}
.et4-ringburst{position:absolute;top:50%;left:50%;width:60px;height:60px;border-radius:50%;z-index:4;
  border:2px solid rgba(230,196,90,.7);transform:translate(-50%,-50%) scale(.2);opacity:0;
  animation:et4RingBurst 1.4s cubic-bezier(.16,1,.3,1) 2.45s forwards;}
@keyframes et4RingBurst{0%{opacity:.9;transform:translate(-50%,-50%) scale(.2);}100%{opacity:0;transform:translate(-50%,-50%) scale(9);}}

.et4-content{position:relative;z-index:6;text-align:center;padding:0 24px;}
.et4-pulse{position:absolute;top:50%;left:50%;width:680px;height:680px;border-radius:50%;
  transform:translate(-50%,-50%) scale(.6);opacity:0;pointer-events:none;
  background:radial-gradient(circle, rgba(184,146,63,.18) 0%, rgba(201,162,39,.06) 42%, transparent 66%);
  animation:et4Pulse 2.4s ease 3.2s forwards;}
@keyframes et4Pulse{0%{opacity:0;transform:translate(-50%,-50%) scale(.6);}50%{opacity:1;transform:translate(-50%,-50%) scale(1.05);}100%{opacity:.5;transform:translate(-50%,-50%) scale(1.15);}}

.et4-mono-wrap{position:relative;display:inline-block;margin:0 auto 24px;}
.et4-ring{position:absolute;top:50%;left:50%;width:150px;height:150px;border-radius:50%;
  transform:translate(-50%,-50%) scale(.4);border:1px solid rgba(184,146,63,.4);
  box-shadow:0 0 50px rgba(184,146,63,.25);opacity:0;animation:et4RingIn 1.1s cubic-bezier(.16,1,.3,1) 2.7s forwards;}
@keyframes et4RingIn{to{opacity:1;transform:translate(-50%,-50%) scale(1);}}
.et4-monogram{position:relative;z-index:1;width:clamp(64px,12vw,112px);height:auto;display:block;opacity:0;
  transform:scale(.3) rotate(-12deg);filter:drop-shadow(0 0 22px rgba(201,162,39,.55));
  animation:et4MonoIn 1.2s cubic-bezier(.16,1,.3,1) 2.55s forwards;}
@keyframes et4MonoIn{0%{opacity:0;transform:scale(.3) rotate(-12deg);}60%{opacity:1;}100%{opacity:1;transform:scale(1) rotate(0);}}

.et4-crest{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;letter-spacing:.5em;text-transform:uppercase;
  color:#b8923f;opacity:0;margin-bottom:18px;transform:translateY(8px);animation:et4FadeUp .9s ease 3.9s forwards;}
.et4-rule{height:1px;width:0;margin:0 auto 22px;background:linear-gradient(90deg,transparent,#b8923f 50%,transparent);
  animation:et4Rule 1.1s cubic-bezier(.16,1,.3,1) 4.05s forwards;}
@keyframes et4Rule{to{width:min(360px,72vw);}}

.et4-brand{position:relative;font-family:'Cormorant Garamond','Playfair Display',serif;font-weight:700;
  font-size:clamp(46px,9vw,116px);line-height:1.02;letter-spacing:.01em;display:inline-block;}
.et4-line{display:inline-block;white-space:nowrap;}
.et4-ltr{display:inline-block;opacity:0;transform:translateY(30px) scale(.9) rotate(4deg);filter:blur(8px);
  background:linear-gradient(180deg,#2c6353 0%,#1f4a3f 48%,#15302a 100%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;
  animation:et4LtrIn .8s cubic-bezier(.16,1,.3,1) forwards;}
@keyframes et4LtrIn{to{opacity:1;transform:translateY(0) scale(1) rotate(0);filter:blur(0);}}
.et4-shimmer{position:absolute;inset:0;z-index:2;pointer-events:none;mix-blend-mode:screen;
  background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.5) 50%,transparent 60%);
  transform:translateX(-120%);animation:et4Shimmer 1.5s ease 5.2s forwards;}
@keyframes et4Shimmer{to{transform:translateX(120%);}}

.et4-tag{font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;font-size:clamp(11px,1.5vw,15px);
  letter-spacing:.4em;text-transform:uppercase;color:#1f4a3f;opacity:0;margin-top:26px;transform:translateY(10px);
  animation:et4FadeUp .9s ease 5.3s forwards;}
.et4-tag span{color:#b8923f;}
.et4-sub{font-family:'Cormorant Garamond','Playfair Display',serif;font-style:italic;font-weight:600;
  font-size:clamp(16px,2.4vw,23px);color:#6b6256;opacity:0;margin-top:14px;transform:translateY(10px);
  animation:et4FadeUp 1s ease 5.8s forwards;}
@keyframes et4FadeUp{to{opacity:1;transform:translateY(0);}}

.et4-vignette{position:absolute;inset:0;z-index:5;pointer-events:none;box-shadow:inset 0 0 200px 70px rgba(10,23,20,.35);
  animation:et4Vig 1.7s ease 2.35s forwards;}
@keyframes et4Vig{to{box-shadow:inset 0 0 180px 60px rgba(21,48,42,.10);}}

.et4-skip{position:absolute;bottom:13vh;right:34px;z-index:9;font-family:'Plus Jakarta Sans',sans-serif;
  font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:#c9a227;background:transparent;border:none;
  cursor:pointer;opacity:0;animation:et4FadeUp 1s ease 1.6s forwards;transition:color .2s;
  -webkit-tap-highlight-color:transparent;padding:10px;}
.et4-skip:hover{color:#f1e0a8;}

@media (max-width:600px){
  .et4-bar{height:8vh;}
  .et4-ring{width:118px;height:118px;}
  .et4-brand{font-size:clamp(38px,12.5vw,60px);letter-spacing:0;}
  .et4-tag{letter-spacing:.26em;margin-top:22px;}
  .et4-sub{font-size:15px;padding:0 10px;}
  .et4-skip{right:16px;bottom:11vh;}
}
@media (prefers-reduced-motion: reduce){ .et4{display:none;} }
`;
