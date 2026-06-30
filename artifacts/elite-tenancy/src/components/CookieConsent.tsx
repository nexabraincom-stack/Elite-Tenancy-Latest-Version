import { useEffect, useState } from "react";

/**
 * Elite Tenancy — Cookie Consent Banner (UK GDPR / PECR compliant)
 *
 * Shows on first visit until the user makes a choice. Stores the decision in
 * localStorage so it never nags returning visitors. Offers a genuine choice
 * (Accept all / Reject non-essential) — required under UK PECR; a reject option
 * must be as easy as accept. Dispatches a `cookie-consent` window event so
 * analytics/marketing scripts can gate themselves on the user's choice.
 *
 * On-brand: navy surface, gold accents, Inter. Fully responsive,
 * keyboard-accessible, and unobtrusive (bottom sheet).
 */

const STORAGE_KEY = "et_cookie_consent"; // values: "all" | "essential"

export function getCookieConsent(): "all" | "essential" | null {
  if (typeof window === "undefined") return null;
  const v = localStorage.getItem(STORAGE_KEY);
  return v === "all" || v === "essential" ? v : null;
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return undefined;
    if (!getCookieConsent()) {
      // small delay so it doesn't fight the cinematic intro on first load
      const t = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, []);

  function choose(choice: "all" | "essential"): void {
    localStorage.setItem(STORAGE_KEY, choice);
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: choice }));
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      className="et-cookie"
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
    >
      <style>{CSS}</style>
      <div className="et-cookie__inner">
        <div className="et-cookie__text">
          <p className="et-cookie__title">We value your privacy</p>
          <p className="et-cookie__body">
            We use essential cookies to make Elite Tenancy work, and optional
            cookies to understand traffic and improve your experience. You can
            accept all, or continue with essential cookies only. See our{" "}
            <a href="/cookies">Cookie Policy</a> and{" "}
            <a href="/privacy">Privacy Policy</a>.
          </p>
        </div>
        <div className="et-cookie__actions">
          <button
            type="button"
            className="et-cookie__btn et-cookie__btn--ghost"
            onClick={() => choose("essential")}
          >
            Essential only
          </button>
          <button
            type="button"
            className="et-cookie__btn et-cookie__btn--gold"
            onClick={() => choose("all")}
          >
            Accept all
          </button>
        </div>
      </div>
    </div>
  );
}

const CSS = `
.et-cookie{
  position:fixed;left:0;right:0;bottom:0;z-index:9000;
  padding:16px;display:flex;justify-content:center;
  animation:etCookieUp .45s cubic-bezier(.16,1,.3,1);
}
@keyframes etCookieUp{from{transform:translateY(110%);opacity:0;}to{transform:translateY(0);opacity:1;}}

.et-cookie__inner{
  width:100%;max-width:1080px;
  display:flex;align-items:center;gap:20px;flex-wrap:wrap;
  background:rgba(13,27,42,.97);backdrop-filter:blur(10px);
  border:1px solid rgba(212,162,74,.35);border-radius:14px;
  box-shadow:0 18px 50px rgba(0,0,0,.5);
  padding:18px 22px;
}
.et-cookie__text{flex:1;min-width:260px;}
.et-cookie__title{
  font-family:'Inter',sans-serif;font-weight:600;font-size:14px;
  color:#D4A24A;letter-spacing:.02em;margin:0 0 4px;
}
.et-cookie__body{
  font-family:'Inter',sans-serif;font-weight:400;font-size:13px;line-height:1.6;
  color:#cabfa6;margin:0;
}
.et-cookie__body a{color:#D4A24A;text-decoration:underline;text-underline-offset:2px;}
.et-cookie__body a:hover{color:#F0D89A;}

.et-cookie__actions{display:flex;gap:10px;flex-shrink:0;}
.et-cookie__btn{
  font-family:'Inter',sans-serif;font-weight:600;font-size:13px;
  padding:11px 20px;border-radius:9px;cursor:pointer;border:1px solid transparent;
  transition:all .18s ease;white-space:nowrap;
}
.et-cookie__btn--ghost{
  background:transparent;border-color:rgba(241,236,225,.25);color:#f1ece1;
}
.et-cookie__btn--ghost:hover{border-color:rgba(241,236,225,.6);background:rgba(255,255,255,.04);}
.et-cookie__btn--gold{
  background:#D4A24A;color:#0d1b2a;
}
.et-cookie__btn--gold:hover{background:#D4A24A;}

@media (max-width:640px){
  .et-cookie{padding:12px;}
  .et-cookie__inner{padding:16px;gap:14px;}
  .et-cookie__actions{width:100%;}
  .et-cookie__btn{flex:1;text-align:center;}
}
`;
