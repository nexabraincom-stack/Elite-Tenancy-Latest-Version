import { useEffect, useMemo, useState } from "react";

/**
 * Elite Tenancy — Cinematic Intro
 *
 * A premium, lightweight (pure CSS) intro animation shown once per browser
 * session on first load. Auto-dismisses after the timeline completes, can be
 * skipped, and respects `prefers-reduced-motion` (skipped entirely for users
 * who opt out of motion). Uses the site's existing Playfair Display + Plus
 * Jakarta Sans fonts — no extra network requests.
 *
 * Mounted above <App /> in main.tsx so it overlays the whole site, then fades
 * out to reveal the homepage.
 */

const SESSION_KEY = "et_intro_seen";
const TOTAL_MS = 6000;   // full timeline before auto-dismiss
const FADE_MS = 800;     // fade-out duration

export default function CinematicIntro() {
  const [show, setShow] = useState(false);
  const [leaving, setLeaving] = useState(false);

  // Decide whether to play (once per session, and not if reduced-motion)
  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const seen = sessionStorage.getItem(SESSION_KEY);
    if (reduced || seen) return;
    sessionStorage.setItem(SESSION_KEY, "1");
    setShow(true);
  }, []);

  // Auto-dismiss timer + lock scroll while playing
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

  // 40 randomised rising gold particles (generated once)
  const particles = useMemo(
    () =>
      Array.from({ length: 40 }, (_, i) => {
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
        <div className="et-crest">Established · United Kingdom</div>
        <div className="et-rule" />
        <h1 className="et-brand">
          <span className="et-word et-word--1">Elite</span>{" "}
          <span className="et-word et-word--2">Tenancy</span>
        </h1>
        <div className="et-tag">
          Premium <span>UK</span> Lettings
        </div>
        <div className="et-sub">
          AI-matched tenants · RRA 2025 compliant · Let with confidence
        </div>
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
  background:radial-gradient(ellipse at 50% 40%, #16263a 0%, #0d1b2a 45%, #0a1420 100%);
  opacity:1;transition:opacity ${FADE_MS}ms ease;
}
.et-intro.et-intro--out{opacity:0;}

.et-bar{position:absolute;left:0;right:0;height:11vh;background:#000;z-index:6;}
.et-bar--top{top:0;transform:translateY(-100%);
  animation:etBarInTop .9s cubic-bezier(.16,1,.3,1) .1s forwards, etBarOutTop .9s ease 5.3s forwards;}
.et-bar--bottom{bottom:0;transform:translateY(100%);
  animation:etBarInBottom .9s cubic-bezier(.16,1,.3,1) .1s forwards, etBarOutBottom .9s ease 5.3s forwards;}
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

.et-glow{position:absolute;width:760px;height:760px;border-radius:50%;z-index:1;
  background:radial-gradient(circle, rgba(201,162,39,.16) 0%, rgba(201,162,39,0) 62%);
  opacity:0;animation:etGlowIn 2s ease 1s forwards;}
@keyframes etGlowIn{to{opacity:1;}}

.et-content{position:relative;z-index:4;text-align:center;padding:0 24px;}

.et-crest{font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;letter-spacing:.55em;
  text-transform:uppercase;color:#c9a227;opacity:0;margin-bottom:22px;transform:translateY(8px);
  animation:etFadeUp .9s ease 1.2s forwards;}

.et-rule{height:1px;width:0;margin:0 auto 26px;
  background:linear-gradient(90deg, transparent, #c9a227 50%, transparent);
  animation:etRuleGrow 1.3s cubic-bezier(.16,1,.3,1) 1.4s forwards;}
@keyframes etRuleGrow{to{width:min(360px,72vw);}}

.et-brand{font-family:'Playfair Display',serif;font-weight:600;
  font-size:clamp(40px,9vw,104px);line-height:1;letter-spacing:.02em;
  background:linear-gradient(180deg,#f1e0a8 0%,#e6c45a 38%,#c9a227 72%,#9c7c1c 100%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
  color:transparent;position:relative;display:inline-block;}
.et-word{display:inline-block;opacity:0;transform:translateY(26px) scale(.96);filter:blur(8px);}
.et-word--1{animation:etWordIn 1.1s cubic-bezier(.16,1,.3,1) 1.7s forwards;}
.et-word--2{animation:etWordIn 1.1s cubic-bezier(.16,1,.3,1) 1.95s forwards;}
@keyframes etWordIn{to{opacity:1;transform:translateY(0) scale(1);filter:blur(0);}}
.et-brand::after{content:"";position:absolute;inset:0;z-index:2;
  background:linear-gradient(105deg, transparent 35%, rgba(255,255,255,.55) 50%, transparent 65%);
  -webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;
  transform:translateX(-120%);animation:etShimmer 1.6s ease 3.1s forwards;
  mix-blend-mode:screen;pointer-events:none;}
@keyframes etShimmer{to{transform:translateX(120%);}}

.et-tag{font-family:'Plus Jakarta Sans',sans-serif;font-weight:500;
  font-size:clamp(11px,1.5vw,15px);letter-spacing:.42em;text-transform:uppercase;
  color:#f1ece1;opacity:0;margin-top:30px;transform:translateY(10px);
  animation:etFadeUp 1s ease 3.2s forwards;}
.et-tag span{color:#c9a227;}

.et-sub{font-family:'Plus Jakarta Sans',sans-serif;font-weight:400;font-size:13px;
  letter-spacing:.05em;color:#9a8f7a;opacity:0;margin-top:14px;
  animation:etFadeUp 1s ease 3.7s forwards;}

@keyframes etFadeUp{to{opacity:1;transform:translateY(0);}}

.et-vignette{position:absolute;inset:0;z-index:3;pointer-events:none;
  box-shadow:inset 0 0 220px 60px rgba(0,0,0,.65);}

.et-skip{position:absolute;bottom:14vh;right:34px;z-index:7;
  font-family:'Plus Jakarta Sans',sans-serif;font-size:11px;letter-spacing:.2em;
  text-transform:uppercase;color:#7d8696;background:transparent;border:none;cursor:pointer;
  opacity:0;animation:etFadeUp 1s ease 2.5s forwards;transition:color .2s;}
.et-skip:hover{color:#c9a227;}

@media (prefers-reduced-motion: reduce){
  .et-intro{display:none;}
}
`;
