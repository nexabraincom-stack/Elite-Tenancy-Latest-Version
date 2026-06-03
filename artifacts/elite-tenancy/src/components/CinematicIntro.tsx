import { useEffect, useMemo, useState } from "react";

/**
 * Elite Tenancy — Cinematic Intro (v3 — premium edition)
 *
 * A rich, lightweight (pure CSS + inline SVG) intro shown once per browser
 * session on first load, then fades into the homepage. Fully responsive,
 * skippable, and respects `prefers-reduced-motion`.
 *
 * Visual layers:
 *  - Drifting aurora glow + depth bokeh particles
 *  - Gold city-skyline silhouette rising (on-brand for a lettings business)
 *  - Animated gold "ET" monogram with an expanding glow ring (sonar pulse)
 *  - Diagonal light-ray sweep
 *  - Letter-by-letter "Elite Tenancy" gold reveal + shimmer
 *  - Elegant corner frame accents + warm aspirational copy
 *
 * Uses the site's existing Playfair Display + Plus Jakarta Sans (no extra requests).
 * Mounted above <App /> in main.tsx.
 */

const SESSION_KEY = "et_intro_seen";
const TOTAL_MS = 7500;   // full timeline before auto-dismiss
const FADE_MS = 800;     // fade-out duration

const ELITE = "Elite".split("");
const TENANCY = "Tenancy".split("");

// Lit windows scattered across the taller buildings (viewBox 1440x220).
// "Lit windows = homes" — a warm, on-brand touch for a lettings business.
const WINDOWS: Array<[number, number]> = [
  [186, 96], [186, 112], [186, 128], [228, 92], [228, 110], [228, 128],
  [482, 84], [482, 104], [482, 124], [516, 56], [516, 80], [516, 110],
  [786, 70], [786, 96], [820, 46], [820, 72], [820, 100],
  [1090, 78], [1090, 102], [1108, 78], [1108, 102],
  [330, 142], [630, 132], [930, 118], [990, 90],
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

  // Depth particles — two layers (near = larger/brighter, far = small/blurred)
  const particles = useMemo(
    () =>
      Array.from({ length: 54 }, (_, i) => {
        const far = i % 2 === 0;
        const size = far ? 1 + Math.random() * 2 : 2 + Math.random() * 4;
        return {
          key: i,
          far,
          left: `${Math.random() * 100}vw`,
          size: `${size}px`,
          duration: `${(far ? 9 : 6) + Math.random() * 6}s`,
          delay: `${Math.random() * 6}s`,
        };
      }),
    [],
  );

  if (!show) return null;

  // Letter-by-letter brand timing
  const eliteStart = 3.0;
  const tenancyStart = 3.7;
  const step = 0.07;

  return (
    <div
      className={`et-intro${leaving ? " et-intro--out" : ""}`}
      role="presentation"
      aria-hidden="true"
    >
      <style>{CSS}</style>

      {/* drifting aurora glow */}
      <div className="et-aurora" />

      {/* letterbox bars */}
      <div className="et-bar et-bar--top" />
      <div className="et-bar et-bar--bottom" />

      {/* elegant corner frame accents */}
      <div className="et-corner et-corner--tl" />
      <div className="et-corner et-corner--tr" />
      <div className="et-corner et-corner--bl" />
      <div className="et-corner et-corner--br" />

      {/* depth particles */}
      <div className="et-particles">
        {particles.map((p) => (
          <span
            key={p.key}
            className={`et-p${p.far ? " et-p--far" : ""}`}
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              animation: `etRise ${p.duration} linear ${p.delay} infinite`,
            }}
          />
        ))}
      </div>

      {/* gold city skyline (rises from bottom) */}
      <svg className="et-skyline" viewBox="0 0 1440 220" preserveAspectRatio="xMidYMax slice" aria-hidden="true">
        <defs>
          <linearGradient id="etSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1f4a3f" stopOpacity="0.6" />
            <stop offset="1" stopColor="#1f4a3f" stopOpacity="0.06" />
          </linearGradient>
        </defs>
        <path fill="url(#etSky)" d="M0 220 L0 150 L60 150 L60 110 L110 110 L110 150 L170 150 L170 80 L210 80 L210 60 L250 60 L250 80 L300 80 L300 130 L360 130 L360 95 L410 95 L410 130 L470 130 L470 70 L500 70 L500 40 L540 40 L540 70 L600 70 L600 120 L660 120 L660 90 L710 90 L710 120 L770 120 L770 55 L810 55 L810 30 L850 30 L850 55 L910 55 L910 105 L970 105 L970 75 L1020 75 L1020 105 L1080 105 L1080 60 L1120 60 L1120 100 L1180 100 L1180 130 L1240 130 L1240 85 L1290 85 L1290 130 L1350 130 L1350 150 L1440 150 L1440 220 Z" />
        <g className="et-windows" fill="#f1e0a8">
          {WINDOWS.map(([x, y], i) => (
            <rect
              key={i}
              x={x}
              y={y}
              width="5"
              height="7"
              rx="1"
              style={{ animationDelay: `${1.9 + (i % 9) * 0.22}s` }}
            />
          ))}
        </g>
      </svg>

      {/* diagonal light-ray sweep */}
      <div className="et-ray" />

      <div className="et-content">
        {/* final luminous glow pulse behind the composition */}
        <div className="et-pulse" />

        {/* monogram with glow ring */}
        <div className="et-mono-wrap">
          <span className="et-ring" />
          <span className="et-ring et-ring--ping" />
          <svg className="et-monogram" viewBox="0 0 120 150" fill="none" aria-hidden="true">
            <defs>
              <linearGradient id="etGold" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#d9b566" />
                <stop offset="0.4" stopColor="#c9a227" />
                <stop offset="0.75" stopColor="#a07c20" />
                <stop offset="1" stopColor="#7a5e18" />
              </linearGradient>
            </defs>
            <path
              className="et-mono-shield"
              d="M60 5 L107 24 L107 87 L60 145 L13 87 L13 24 Z"
              stroke="url(#etGold)"
              strokeWidth="2.2"
              strokeLinejoin="round"
            />
            <g className="et-mono-letters" stroke="url(#etGold)" strokeWidth="7.5" strokeLinecap="square">
              <path d="M44 46 V104" />
              <path d="M44 46 H62" />
              <path d="M44 75 H58" />
              <path d="M44 104 H62" />
              <path d="M57 46 H86" />
              <path d="M71.5 46 V104" />
            </g>
          </svg>
        </div>

        <div className="et-crest">Premium Lettings · United Kingdom</div>
        <div className="et-rule" />

        <h1 className="et-brand">
          <span className="et-line">
            {ELITE.map((c, i) => (
              <span key={`e${i}`} className="et-letter" style={{ animationDelay: `${eliteStart + i * step}s` }}>
                {c}
              </span>
            ))}
          </span>{" "}
          <span className="et-line">
            {TENANCY.map((c, i) => (
              <span key={`t${i}`} className="et-letter" style={{ animationDelay: `${tenancyStart + i * step}s` }}>
                {c}
              </span>
            ))}
          </span>
          <span className="et-shimmer" />
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
  background:radial-gradient(ellipse at 50% 40%, #ffffff 0%, #faf7f1 45%, #f0eadf 100%);
  opacity:1;transition:opacity ${FADE_MS}ms ease;
}
.et-intro.et-intro--out{opacity:0;}

/* drifting aurora */
.et-aurora{position:absolute;inset:-20%;z-index:0;pointer-events:none;opacity:0;
  background:
    radial-gradient(closest-side at 32% 42%, rgba(201,162,39,.18), transparent 70%),
    radial-gradient(closest-side at 68% 55%, rgba(230,196,90,.12), transparent 70%);
  animation:etAuroraIn 2.4s ease .3s forwards, etAuroraDrift 16s ease-in-out 2s infinite alternate;}
@keyframes etAuroraIn{to{opacity:1;}}
@keyframes etAuroraDrift{0%{transform:translate(0,0) scale(1);}100%{transform:translate(4%,-3%) scale(1.12);}}

/* letterbox bars */
.et-bar{position:absolute;left:0;right:0;height:9vh;background:#15302a;z-index:6;}
.et-bar--top{top:0;transform:translateY(-100%);
  animation:etBarInTop .85s cubic-bezier(.16,1,.3,1) .25s forwards, etBarOutTop .85s ease 6.7s forwards;}
.et-bar--bottom{bottom:0;transform:translateY(100%);
  animation:etBarInBottom .85s cubic-bezier(.16,1,.3,1) .25s forwards, etBarOutBottom .85s ease 6.7s forwards;}
@keyframes etBarInTop{to{transform:translateY(0);}}
@keyframes etBarInBottom{to{transform:translateY(0);}}
@keyframes etBarOutTop{to{transform:translateY(-100%);}}
@keyframes etBarOutBottom{to{transform:translateY(100%);}}

/* corner frame accents */
.et-corner{position:absolute;width:46px;height:46px;z-index:5;border-color:rgba(201,162,39,.55);
  opacity:0;animation:etFadeIn 1s ease 1s forwards;}
.et-corner--tl{top:calc(10vh + 22px);left:22px;border-top:1px solid;border-left:1px solid;}
.et-corner--tr{top:calc(10vh + 22px);right:22px;border-top:1px solid;border-right:1px solid;}
.et-corner--bl{bottom:calc(10vh + 22px);left:22px;border-bottom:1px solid;border-left:1px solid;}
.et-corner--br{bottom:calc(10vh + 22px);right:22px;border-bottom:1px solid;border-right:1px solid;}
@keyframes etFadeIn{to{opacity:1;}}

/* particles */
.et-particles{position:absolute;inset:0;z-index:1;pointer-events:none;}
.et-p{position:absolute;bottom:-12px;border-radius:50%;background:#e6c45a;opacity:0;
  filter:drop-shadow(0 0 6px #c9a227);}
.et-p--far{filter:blur(1.5px) drop-shadow(0 0 4px rgba(201,162,39,.6));}
@keyframes etRise{
  0%{transform:translateY(0) scale(.6);opacity:0;}
  12%{opacity:.85;}
  85%{opacity:.4;}
  100%{transform:translateY(-112vh) scale(1.1);opacity:0;}
}

/* skyline */
.et-skyline{position:absolute;left:0;right:0;bottom:10vh;width:100%;height:min(220px,26vh);z-index:1;
  opacity:0;transform:translateY(40px);
  animation:etSkylineIn 2s cubic-bezier(.16,1,.3,1) .9s forwards;}
@keyframes etSkylineIn{to{opacity:.9;transform:translateY(0);}}

/* twinkling lit windows */
.et-windows rect{opacity:0;filter:drop-shadow(0 0 3px rgba(241,224,168,.9));
  animation:etTwinkle 3.4s ease-in-out infinite;}
@keyframes etTwinkle{
  0%{opacity:0;}
  18%{opacity:.95;}
  45%{opacity:.35;}
  70%{opacity:.85;}
  100%{opacity:.45;}
}

/* final luminous glow pulse */
.et-pulse{position:absolute;top:54%;left:50%;width:680px;height:680px;border-radius:50%;
  transform:translate(-50%,-50%) scale(.6);z-index:0;pointer-events:none;opacity:0;
  background:radial-gradient(circle, rgba(230,196,90,.22) 0%, rgba(201,162,39,.08) 40%, transparent 66%);
  animation:etPulse 2.4s ease 5.6s forwards;}
@keyframes etPulse{
  0%{opacity:0;transform:translate(-50%,-50%) scale(.6);}
  45%{opacity:1;transform:translate(-50%,-50%) scale(1.05);}
  100%{opacity:.55;transform:translate(-50%,-50%) scale(1.15);}
}

/* light ray */
.et-ray{position:absolute;top:-40%;left:-30%;width:50%;height:180%;z-index:2;pointer-events:none;
  background:linear-gradient(90deg, transparent, rgba(255,247,214,.10), transparent);
  transform:rotate(18deg) translateX(-60vw);
  animation:etRaySweep 2.6s ease 2.1s forwards;}
@keyframes etRaySweep{to{transform:rotate(18deg) translateX(160vw);}}

.et-content{position:relative;z-index:4;text-align:center;padding:0 24px;}

/* monogram + glow rings */
.et-mono-wrap{position:relative;display:inline-block;margin:0 auto 26px;}
.et-ring{position:absolute;top:50%;left:50%;width:150px;height:150px;border-radius:50%;
  transform:translate(-50%,-50%) scale(.4);z-index:0;
  border:1px solid rgba(201,162,39,.35);box-shadow:0 0 50px rgba(201,162,39,.25);
  opacity:0;animation:etRingIn 1.2s cubic-bezier(.16,1,.3,1) .8s forwards;}
.et-ring--ping{animation:etPing 1.6s ease 1.4s forwards;border-color:rgba(230,196,90,.5);box-shadow:none;}
@keyframes etRingIn{to{opacity:1;transform:translate(-50%,-50%) scale(1);}}
@keyframes etPing{0%{opacity:.7;transform:translate(-50%,-50%) scale(.6);}100%{opacity:0;transform:translate(-50%,-50%) scale(1.8);}}

.et-monogram{position:relative;z-index:1;width:clamp(60px,12vw,108px);height:auto;display:block;
  filter:drop-shadow(0 0 18px rgba(201,162,39,.4));}
.et-mono-shield{stroke-dasharray:560;stroke-dashoffset:560;
  animation:etDraw 1.6s cubic-bezier(.16,1,.3,1) .6s forwards;opacity:.85;}
@keyframes etDraw{to{stroke-dashoffset:0;}}
.et-mono-letters{opacity:0;transform-box:fill-box;transform-origin:center;transform:scale(.82);
  animation:etMonoIn 1s cubic-bezier(.16,1,.3,1) 1.2s forwards;}
@keyframes etMonoIn{to{opacity:1;transform:scale(1);}}

.et-crest{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;letter-spacing:.5em;
  text-transform:uppercase;color:#b8923f;opacity:0;margin-bottom:20px;transform:translateY(8px);
  animation:etFadeUp .9s ease 2.3s forwards;}

.et-rule{height:1px;width:0;margin:0 auto 24px;
  background:linear-gradient(90deg, transparent, #b8923f 50%, transparent);
  animation:etRuleGrow 1.2s cubic-bezier(.16,1,.3,1) 2.5s forwards;}
@keyframes etRuleGrow{to{width:min(360px,72vw);}}

/* brand — letter by letter */
.et-brand{position:relative;font-family:'Cormorant Garamond','Playfair Display',serif;font-weight:700;
  font-size:clamp(44px,9vw,112px);line-height:1.02;letter-spacing:.01em;display:inline-block;}
.et-line{display:inline-block;white-space:nowrap;}
.et-letter{display:inline-block;opacity:0;transform:translateY(28px) scale(.9) rotate(4deg);filter:blur(8px);
  background:linear-gradient(180deg,#2c6353 0%,#1f4a3f 48%,#15302a 100%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;
  animation:etLetterIn .8s cubic-bezier(.16,1,.3,1) forwards;}
@keyframes etLetterIn{to{opacity:1;transform:translateY(0) scale(1) rotate(0);filter:blur(0);}}

/* shimmer sweep over the brand */
.et-shimmer{position:absolute;inset:0;z-index:2;pointer-events:none;
  background:linear-gradient(105deg, transparent 40%, rgba(255,255,255,.45) 50%, transparent 60%);
  transform:translateX(-120%);mix-blend-mode:screen;
  animation:etShimmer 1.5s ease 4.6s forwards;}
@keyframes etShimmer{to{transform:translateX(120%);}}

.et-tag{font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;
  font-size:clamp(11px,1.5vw,15px);letter-spacing:.4em;text-transform:uppercase;
  color:#1f4a3f;opacity:0;margin-top:28px;transform:translateY(10px);
  animation:etFadeUp .9s ease 4.8s forwards;}
.et-tag span{color:#b8923f;}

.et-sub{font-family:'Cormorant Garamond','Playfair Display',serif;font-style:italic;font-weight:600;
  font-size:clamp(16px,2.4vw,22px);letter-spacing:.01em;color:#6b6256;opacity:0;margin-top:16px;
  transform:translateY(10px);animation:etFadeUp 1s ease 5.3s forwards;}

@keyframes etFadeUp{to{opacity:1;transform:translateY(0);}}

.et-vignette{position:absolute;inset:0;z-index:3;pointer-events:none;
  box-shadow:inset 0 0 180px 60px rgba(21,48,42,.10);}

.et-skip{position:absolute;bottom:13vh;right:34px;z-index:7;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;letter-spacing:.2em;
  text-transform:uppercase;color:#7d8696;background:transparent;border:none;cursor:pointer;
  opacity:0;animation:etFadeUp 1s ease 2.0s forwards;transition:color .2s;
  -webkit-tap-highlight-color:transparent;padding:10px;}
.et-skip{color:#6b6256;}
.et-skip:hover{color:#b8923f;}

/* mobile tuning */
@media (max-width:600px){
  .et-bar{height:8vh;}
  .et-corner{width:34px;height:34px;top:auto;}
  .et-corner--tl{top:calc(8vh + 16px);left:16px;}
  .et-corner--tr{top:calc(8vh + 16px);right:16px;}
  .et-corner--bl{bottom:calc(8vh + 16px);left:16px;}
  .et-corner--br{bottom:calc(8vh + 16px);right:16px;}
  .et-ring{width:118px;height:118px;}
  .et-crest{letter-spacing:.32em;font-size:10px;margin-bottom:16px;}
  .et-brand{font-size:clamp(34px,12.5vw,58px);letter-spacing:0;}
  .et-tag{letter-spacing:.26em;margin-top:22px;}
  .et-sub{font-size:15px;padding:0 10px;}
  .et-skip{right:16px;bottom:11vh;}
  .et-skyline{bottom:8vh;height:18vh;}
}

@media (prefers-reduced-motion: reduce){ .et-intro{display:none;} }
`;
