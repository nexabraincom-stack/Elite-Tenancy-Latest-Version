import { useState } from "react";
import { useSeo } from "@/hooks/use-seo";

// Standalone page, deliberately NOT using PublicLayout/EllieChat — this page
// serves elitetenancy.com, where Elite Tenancy has no live US operations yet
// (no US entity, no state real-estate/property-management licensing). It must
// never surface "list your property" / "find a room" / chat CTAs that imply
// an active US service. Content here is informational + a waitlist only.
export default function UsaComingSoon() {
  useSeo({
    title: "Elite Tenancy USA — Coming Soon | Join the Waitlist",
    description:
      "Elite Tenancy is bringing its AI-powered, zero-fee tenant matching platform to the United States. Join the waitlist to be first to know when we launch in your area.",
    canonical: "https://www.elitetenancy.com/",
    noindex: true, // placeholder content — re-enable once real US content/service exists
  });

  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"tenant" | "landlord" | "agent">("tenant");
  const [cityState, setCityState] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "done" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/usa-waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, role, cityState }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong");
      setStatus("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong");
      setStatus("error");
    }
  }

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[#FAF8F4] text-[#163A4A]">
      {/* Minimal header — logo only, no service nav */}
      <header className="border-b border-[#E8E4DE]">
        <div className="max-w-3xl mx-auto px-6 py-6 flex items-center gap-3">
          <svg width="32" height="32" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M60 4 L108 24 L108 88 L60 146 L12 88 L12 24 Z" stroke="#D4A24A" strokeWidth="6" strokeLinejoin="round" />
          </svg>
          <span className="font-display text-lg font-semibold tracking-tight">Elite Tenancy</span>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-3xl mx-auto px-6 pt-16 pb-12 text-center">
          <span className="inline-flex items-center gap-2 bg-[#163A4A]/5 border border-[#163A4A]/10 text-[#163A4A] text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full mb-6">
            Coming to the United States
          </span>
          <h1 className="font-display text-3xl md:text-4xl font-semibold tracking-tight mb-4">
            Elite Tenancy is bringing zero-fee, AI-matched renting to the US
          </h1>
          <p className="text-[#5E7A84] text-base leading-relaxed max-w-xl mx-auto">
            We've spent the last year building a verified tenant-matching platform for the UK rental market —
            AI-powered compatibility scoring, digital renter passports, and zero fees for tenants. We're now
            exploring bringing that same model to US renters and landlords, market by market.
          </p>
          <p className="text-[#5E7A84]/80 text-sm mt-4 max-w-xl mx-auto">
            We are not yet operating as a licensed real estate or property-management service in any US state.
            This page exists to gauge interest and keep early supporters informed — it isn't a live listing or
            tenant-placement service.
          </p>
        </section>

        <section className="max-w-md mx-auto px-6 pb-20">
          {status === "done" ? (
            <div className="bg-white border border-[#E8E4DE] rounded-2xl p-8 text-center shadow-sm">
              <p className="font-display text-lg font-semibold mb-2">You're on the list</p>
              <p className="text-[#5E7A84] text-sm">
                We'll email you as soon as Elite Tenancy has real news for your area. No spam, no obligation.
              </p>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="bg-white border border-[#E8E4DE] rounded-2xl p-8 shadow-sm space-y-4"
            >
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-[#5E7A84] mb-1.5">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-[#E8E4DE] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A24A]/40"
                />
              </div>

              <div>
                <label htmlFor="role" className="block text-xs font-medium text-[#5E7A84] mb-1.5">
                  I am a
                </label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as typeof role)}
                  className="w-full rounded-lg border border-[#E8E4DE] px-3.5 py-2.5 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#D4A24A]/40"
                >
                  <option value="tenant">Renter</option>
                  <option value="landlord">Landlord / property owner</option>
                  <option value="agent">Real estate agent</option>
                </select>
              </div>

              <div>
                <label htmlFor="cityState" className="block text-xs font-medium text-[#5E7A84] mb-1.5">
                  City &amp; state (optional)
                </label>
                <input
                  id="cityState"
                  type="text"
                  value={cityState}
                  onChange={(e) => setCityState(e.target.value)}
                  placeholder="Austin, TX"
                  className="w-full rounded-lg border border-[#E8E4DE] px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#D4A24A]/40"
                />
              </div>

              {status === "error" && (
                <p className="text-sm text-red-600">{errorMsg}</p>
              )}

              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full bg-[#163A4A] hover:bg-[#1E4D60] disabled:opacity-60 text-[#FAF8F4] font-semibold rounded-lg py-2.5 text-sm transition-colors"
              >
                {status === "submitting" ? "Joining…" : "Join the waitlist"}
              </button>
            </form>
          )}
        </section>
      </main>

      <footer className="border-t border-[#E8E4DE]">
        <div className="max-w-3xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#5E7A84]">
          <p>&copy; {new Date().getFullYear()} Elite Tenancy Ltd. Currently operating in the UK only.</p>
          <div className="flex gap-5">
            <a href="https://www.elitetenancy.co.uk/privacy" className="hover:text-[#163A4A]">Privacy</a>
            <a href="https://www.elitetenancy.co.uk/terms" className="hover:text-[#163A4A]">Terms</a>
            <a href="https://www.elitetenancy.co.uk" className="hover:text-[#163A4A]">UK site &rarr;</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
