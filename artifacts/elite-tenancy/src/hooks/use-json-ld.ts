import { useEffect } from "react";

/**
 * Injects a <script type="application/ld+json"> block into <head> for the
 * current page and removes it on unmount, so structured data never leaks
 * onto pages that don't declare it.
 *
 * @param id     Stable, unique key for this schema block (e.g. "pricing-faq").
 * @param schema The JSON-LD object to serialise, or null to inject nothing.
 *
 * Note: pass a stable `schema` reference (e.g. defined at module scope or
 * memoised) so the effect doesn't re-run on every render.
 */
export function useJsonLd(id: string, schema: Record<string, unknown> | null) {
  useEffect(() => {
    if (!schema) return;

    const scriptId = `ld-json-${id}`;
    let script = document.getElementById(scriptId) as HTMLScriptElement | null;
    if (!script) {
      script = document.createElement("script");
      script.type = "application/ld+json";
      script.id = scriptId;
      document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(schema);

    return () => {
      const el = document.getElementById(scriptId);
      if (el) el.remove();
    };
  }, [id, schema]);
}
