import { useState } from "react";
import { Helmet } from "react-helmet";

const NAV_TABS = [
  { id: "affordability", label: "Affordability" },
  { id: "yield", label: "Rental Yield" },
  { id: "deposit", label: "Deposit & Upfront" },
  { id: "comparison", label: "UK Cities" },
  { id: "global", label: "EU & USA" },
] as const;

type Tab = (typeof NAV_TABS)[number]["id"];

function fmt(n: number, currency = "£") {
  return currency + Math.round(n).toLocaleString("en-GB");
}

// ── Affordability Calculator ─────────────────────────────────────────────────
function AffordabilityCalc() {
  const [income, setIncome] = useState(35000);
  const [period, setPeriod] = useState<"annual" | "monthly">("annual");
  const [bills, setBills] = useState(200);

  const annualIncome = period === "annual" ? income : income * 12;
  const maxRentRule30 = annualIncome / 30;
  const maxRentRule40 = annualIncome * 0.4 / 12;
  const comfortable = maxRentRule30 - bills;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Most UK letting agents require your annual income to be at least <strong>30× the monthly rent</strong>. This calculator shows the maximum rent you qualify for and what's genuinely comfortable.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Your income</label>
          <div className="flex gap-2">
            <input
              type="number"
              value={income}
              onChange={e => setIncome(Number(e.target.value))}
              className="flex-1 border rounded-lg px-3 py-2 text-sm bg-background"
              min={0}
              step={500}
            />
            <select
              value={period}
              onChange={e => setPeriod(e.target.value as "annual" | "monthly")}
              className="border rounded-lg px-3 py-2 text-sm bg-background"
            >
              <option value="annual">per year</option>
              <option value="monthly">per month</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Monthly bills (gas, electric, council tax)</label>
          <input
            type="number"
            value={bills}
            onChange={e => setBills(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            min={0}
            step={50}
          />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ResultCard
          label="Max rent (30× rule)"
          value={fmt(maxRentRule30)}
          sublabel="per month — what agents check"
          highlight
        />
        <ResultCard
          label="Comfortable rent"
          value={fmt(Math.max(0, comfortable))}
          sublabel="per month — after bills"
        />
        <ResultCard
          label="40% of income"
          value={fmt(maxRentRule40)}
          sublabel="per month — upper absolute limit"
        />
      </div>

      <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-1">
        <p className="font-medium">Annual income needed for common London rents</p>
        {[800, 1000, 1200, 1500, 1800, 2000].map(r => (
          <div key={r} className="flex justify-between text-muted-foreground">
            <span>Rent £{r.toLocaleString()}/mo</span>
            <span className="font-medium text-foreground">£{(r * 30).toLocaleString()}/yr needed</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Rental Yield Calculator ──────────────────────────────────────────────────
function YieldCalc() {
  const [propertyValue, setPropertyValue] = useState(280000);
  const [monthlyRent, setMonthlyRent] = useState(1400);
  const [managementPct, setManagementPct] = useState(12);
  const [maintenancePct, setMaintenancePct] = useState(5);
  const [insurance, setInsurance] = useState(50);
  const [voidWeeks, setVoidWeeks] = useState(2);

  const annualRent = monthlyRent * 12;
  const grossYield = (annualRent / propertyValue) * 100;

  const managementCost = annualRent * (managementPct / 100);
  const maintenanceCost = propertyValue * (maintenancePct / 100);
  const voidCost = (monthlyRent / 4.33) * voidWeeks;
  const totalCosts = managementCost + maintenanceCost + insurance * 12 + voidCost;
  const netIncome = annualRent - totalCosts;
  const netYield = (netIncome / propertyValue) * 100;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Calculate gross and net yield for a UK buy-to-let property. Gross yield is headline return; net yield is what you actually keep after costs.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { label: "Property value", value: propertyValue, set: setPropertyValue, step: 5000, prefix: "£" },
          { label: "Monthly rent", value: monthlyRent, set: setMonthlyRent, step: 50, prefix: "£" },
          { label: "Management fee (%)", value: managementPct, set: setManagementPct, step: 1, prefix: "" },
          { label: "Maintenance allowance (%)", value: maintenancePct, set: setMaintenancePct, step: 0.5, prefix: "" },
          { label: "Monthly insurance (£)", value: insurance, set: setInsurance, step: 10, prefix: "£" },
          { label: "Void weeks per year", value: voidWeeks, set: setVoidWeeks, step: 1, prefix: "" },
        ].map(({ label, value, set, step, prefix }) => (
          <div key={label}>
            <label className="block text-sm font-medium mb-1">{label}</label>
            <div className="flex items-center gap-1">
              {prefix && <span className="text-muted-foreground text-sm">{prefix}</span>}
              <input
                type="number"
                value={value}
                onChange={e => set(Number(e.target.value))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
                min={0}
                step={step}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ResultCard label="Gross yield" value={`${grossYield.toFixed(2)}%`} sublabel="before costs" />
        <ResultCard label="Net yield" value={`${netYield.toFixed(2)}%`} sublabel="after all costs" highlight />
        <ResultCard label="Net income" value={fmt(Math.max(0, netIncome))} sublabel="per year" />
      </div>

      <div className="bg-muted/40 rounded-xl p-4 text-sm">
        <p className="font-medium mb-2">UK city average gross yields 2026</p>
        <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-muted-foreground">
          {[
            ["Liverpool", "6–8.5%"], ["Leeds", "5.5–7.5%"],
            ["Manchester", "5–7%"], ["Birmingham", "5–7%"],
            ["Bristol", "4.5–6%"], ["London", "3–4.5%"],
          ].map(([city, yield_]) => (
            <div key={city} className="flex justify-between">
              <span>{city}</span><span className="font-medium text-foreground">{yield_}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Deposit & Upfront Calculator ─────────────────────────────────────────────
function DepositCalc() {
  const [monthlyRent, setMonthlyRent] = useState(1200);
  const [depositWeeks, setDepositWeeks] = useState(5);

  const weeklyRent = monthlyRent * 12 / 52;
  const deposit = weeklyRent * depositWeeks;
  const advanceRent = monthlyRent;
  const total = deposit + advanceRent;
  const maxDeposit = weeklyRent * 5;

  return (
    <div className="space-y-6">
      <p className="text-muted-foreground text-sm">
        Under UK law: deposit capped at <strong>5 weeks' rent</strong>, advance rent capped at <strong>1 month</strong>. Total upfront cost cannot exceed ~2.25 months' rent.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium mb-1">Monthly rent</label>
          <input
            type="number"
            value={monthlyRent}
            onChange={e => setMonthlyRent(Number(e.target.value))}
            className="w-full border rounded-lg px-3 py-2 text-sm bg-background"
            min={0}
            step={50}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Deposit weeks (max 5 by law)</label>
          <input
            type="range"
            min={1}
            max={5}
            value={depositWeeks}
            onChange={e => setDepositWeeks(Number(e.target.value))}
            className="w-full"
          />
          <span className="text-sm text-muted-foreground">{depositWeeks} weeks</span>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <ResultCard label="Deposit" value={fmt(deposit)} sublabel={`${depositWeeks} weeks' rent`} />
        <ResultCard label="1st month rent" value={fmt(advanceRent)} sublabel="max allowed upfront" />
        <ResultCard label="Total upfront" value={fmt(total)} sublabel="maximum you pay" highlight />
      </div>

      {deposit > maxDeposit + 0.5 && (
        <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 text-sm">
          ⚠️ A deposit of {depositWeeks} weeks exceeds the legal 5-week cap (max £{Math.round(maxDeposit).toLocaleString()}). If a landlord asks for more, report it to Trading Standards.
        </div>
      )}

      <div className="bg-muted/40 rounded-xl p-4 text-sm space-y-2">
        <p className="font-medium">UK upfront cost rules (2026)</p>
        <ul className="space-y-1 text-muted-foreground list-disc list-inside">
          <li>Deposit: max 5 weeks' rent (Tenant Fees Act 2019)</li>
          <li>Advance rent: max 1 month (Renters' Rights Act 2026)</li>
          <li>Holding deposit: max 1 week's rent (refundable or off deposit)</li>
          <li>Agency fees: prohibited for tenants</li>
        </ul>
      </div>
    </div>
  );
}

// ── UK Cities Comparison ─────────────────────────────────────────────────────
const UK_CITIES = [
  { city: "London (inner)", room: 1100, studio: 1500, oneBed: 2100, twoBed: 2900 },
  { city: "London (outer / E6)", room: 782, studio: 1100, oneBed: 1500, twoBed: 1950 },
  { city: "Manchester (centre)", room: 700, studio: 950, oneBed: 1300, twoBed: 1700 },
  { city: "Birmingham", room: 600, studio: 850, oneBed: 1100, twoBed: 1400 },
  { city: "Bristol", room: 750, studio: 900, oneBed: 1200, twoBed: 1600 },
  { city: "Leeds", room: 550, studio: 750, oneBed: 1000, twoBed: 1300 },
  { city: "Liverpool", room: 500, studio: 650, oneBed: 850, twoBed: 1100 },
  { city: "Edinburgh", room: 750, studio: 900, oneBed: 1200, twoBed: 1600 },
  { city: "Sheffield", room: 480, studio: 650, oneBed: 850, twoBed: 1100 },
  { city: "Cardiff", room: 550, studio: 700, oneBed: 950, twoBed: 1250 },
];

function UKComparison() {
  const [type, setType] = useState<"room" | "studio" | "oneBed" | "twoBed">("oneBed");
  const sorted = [...UK_CITIES].sort((a, b) => a[type] - b[type]);
  const min = sorted[0][type];
  const max = sorted[sorted.length - 1][type];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        {(["room", "studio", "oneBed", "twoBed"] as const).map(t => (
          <button
            key={t}
            onClick={() => setType(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              type === t
                ? "bg-primary text-primary-foreground border-primary"
                : "bg-background border-border hover:bg-muted"
            }`}
          >
            {t === "room" ? "Room" : t === "studio" ? "Studio" : t === "oneBed" ? "1-bed flat" : "2-bed flat"}
          </button>
        ))}
      </div>
      <div className="space-y-2">
        {sorted.map(row => (
          <div key={row.city} className="flex items-center gap-3">
            <span className="w-40 text-sm shrink-0">{row.city}</span>
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary rounded-full"
                style={{ width: `${((row[type] - min) / (max - min + 1)) * 100 + 15}%` }}
              />
            </div>
            <span className="text-sm font-medium w-20 text-right">{fmt(row[type])}/mo</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        Sources: ONS Private Rent Index May 2026, SpareRoom Q1 2026, Rightmove Q1 2026. Data is indicative average asking rent.
      </p>
    </div>
  );
}

// ── EU & USA Global Comparison ───────────────────────────────────────────────
const GLOBAL_CITIES = [
  { city: "New York (NYC)", country: "USA 🇺🇸", oneBed: 3200, currency: "$" },
  { city: "Los Angeles", country: "USA 🇺🇸", oneBed: 2400, currency: "$" },
  { city: "Boston", country: "USA 🇺🇸", oneBed: 2700, currency: "$" },
  { city: "Amsterdam", country: "Netherlands 🇳🇱", oneBed: 2100, currency: "€" },
  { city: "Paris", country: "France 🇫🇷", oneBed: 1900, currency: "€" },
  { city: "Berlin", country: "Germany 🇩🇪", oneBed: 1500, currency: "€" },
  { city: "Dublin", country: "Ireland 🇮🇪", oneBed: 2200, currency: "€" },
  { city: "London (inner)", country: "UK 🇬🇧", oneBed: 2100, currency: "£" },
  { city: "East Ham E6", country: "UK 🇬🇧", oneBed: 1450, currency: "£" },
  { city: "Madrid", country: "Spain 🇪🇸", oneBed: 1300, currency: "€" },
  { city: "Rome", country: "Italy 🇮🇹", oneBed: 1200, currency: "€" },
  { city: "Warsaw", country: "Poland 🇵🇱", oneBed: 900, currency: "€" },
  { city: "Chicago", country: "USA 🇺🇸", oneBed: 1900, currency: "$" },
  { city: "Austin TX", country: "USA 🇺🇸", oneBed: 1600, currency: "$" },
  { city: "Oklahoma City", country: "USA 🇺🇸", oneBed: 900, currency: "$" },
];

function GlobalComparison() {
  const sorted = [...GLOBAL_CITIES].sort((a, b) => {
    const gbpA = a.currency === "£" ? a.oneBed : a.currency === "€" ? a.oneBed * 0.86 : a.oneBed * 0.79;
    const gbpB = b.currency === "£" ? b.oneBed : b.currency === "€" ? b.oneBed * 0.86 : b.oneBed * 0.79;
    return gbpA - gbpB;
  });
  const gbpValues = sorted.map(r =>
    r.currency === "£" ? r.oneBed : r.currency === "€" ? r.oneBed * 0.86 : r.oneBed * 0.79
  );
  const minGbp = Math.min(...gbpValues);
  const maxGbp = Math.max(...gbpValues);

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        1-bedroom apartment monthly rent, sorted cheapest → most expensive. Converted to GBP for bar chart (£1 ≈ €1.17 ≈ $1.27 as of Jun 2026).
      </p>
      <div className="space-y-2">
        {sorted.map((row, i) => {
          const gbp = gbpValues[i];
          const pct = ((gbp - minGbp) / (maxGbp - minGbp + 1)) * 100 + 10;
          const isEastHam = row.city === "East Ham E6";
          return (
            <div key={row.city} className={`flex items-center gap-3 ${isEastHam ? "ring-1 ring-primary/40 rounded-lg px-2 -mx-2 py-0.5" : ""}`}>
              <div className="w-36 shrink-0">
                <p className={`text-sm leading-tight ${isEastHam ? "font-semibold text-primary" : ""}`}>{row.city}</p>
                <p className="text-xs text-muted-foreground">{row.country}</p>
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${isEastHam ? "bg-amber-500" : "bg-primary/60"}`}
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="text-sm font-medium w-24 text-right">
                {row.currency}{row.oneBed.toLocaleString()}/mo
              </span>
            </div>
          );
        })}
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-900">
        <strong>East Ham E6 insight:</strong> At ~£1,450/mo for a 1-bed flat, East Ham is one of the most affordable postcodes in London — cheaper than Amsterdam, Paris, Dublin, and comparable to Madrid.
      </div>
      <p className="text-xs text-muted-foreground">
        Sources: HousingAnywhere Q4 2025, Numbeo Jun 2026, Apartments.com May 2026, ONS May 2026. Conversion rates approximate.
      </p>
    </div>
  );
}

// ── Shared Result Card ────────────────────────────────────────────────────────
function ResultCard({ label, value, sublabel, highlight }: {
  label: string; value: string; sublabel: string; highlight?: boolean;
}) {
  return (
    <div className={`rounded-xl p-4 border ${highlight ? "bg-primary text-primary-foreground border-primary" : "bg-muted/40 border-border"}`}>
      <p className={`text-xs mb-1 ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-primary-foreground" : "text-foreground"}`}>{value}</p>
      <p className={`text-xs mt-0.5 ${highlight ? "text-primary-foreground/70" : "text-muted-foreground"}`}>{sublabel}</p>
    </div>
  );
}

// ── JSON-LD Schema ────────────────────────────────────────────────────────────
const SCHEMA = JSON.stringify({
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebApplication",
      "name": "UK Rent Calculator 2026",
      "url": "https://www.elitetenancy.co.uk/rent-calculator",
      "applicationCategory": "FinanceApplication",
      "operatingSystem": "Web",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "GBP" },
      "description": "Free UK rent calculator 2026 — affordability, rental yield, deposit limits, UK city comparison and global EU/USA rent comparison.",
    },
    {
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "How much rent can I afford in the UK?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Most UK letting agents require your annual income to be at least 30 times the monthly rent. So for rent of £1,200/month you need at least £36,000/year gross income. A comfortable rule of thumb is that rent should not exceed 33–40% of your take-home pay."
          }
        },
        {
          "@type": "Question",
          "name": "What is the maximum deposit a landlord can charge in 2026?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Under the Tenant Fees Act 2019, the maximum tenancy deposit is 5 weeks' rent for properties where annual rent is under £50,000. The Renters' Rights Act 2026 also limits advance rent to 1 month maximum."
          }
        },
        {
          "@type": "Question",
          "name": "What is a good rental yield in the UK in 2026?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A gross rental yield of 5–7% is considered good in the UK in 2026. Liverpool (6–8.5%), Leeds (5.5–7.5%), Manchester and Birmingham (5–7%) offer the best yields. London yields are lower at 3–4.5% but offer stronger capital growth potential."
          }
        },
        {
          "@type": "Question",
          "name": "How does East Ham compare to other UK cities for rent?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "East Ham (E6) is one of only 5 London postcodes where room rents average under £800/month (around £782). A 1-bedroom flat averages approximately £1,450/month — significantly cheaper than inner London (£2,100) and comparable to or cheaper than Amsterdam, Paris, and Dublin."
          }
        }
      ]
    }
  ]
});

// ── Main Export ───────────────────────────────────────────────────────────────
export default function RentCalculator() {
  const [tab, setTab] = useState<Tab>("affordability");

  return (
    <>
      <Helmet>
        <title>UK Rent Calculator 2026 — Free Affordability, Yield & Deposit Tools</title>
        <meta
          name="description"
          content="Free UK rent calculator 2026. Check how much rent you can afford, rental yields for landlords, deposit limits, and compare rents across UK cities and globally."
        />
        <link rel="canonical" href="https://www.elitetenancy.co.uk/rent-calculator" />
        <script type="application/ld+json">{SCHEMA}</script>
      </Helmet>

      <main className="min-h-screen bg-background">
        {/* Hero */}
        <section className="bg-gradient-to-b from-primary/5 to-background pt-12 pb-8 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-sm font-medium text-primary mb-2 uppercase tracking-wider">Free Tool — Updated June 2026</p>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-foreground mb-3">
              UK Rent Calculator 2026
            </h1>
            <p className="text-muted-foreground text-base max-w-xl mx-auto">
              Five calculators in one: affordability checker, rental yield, deposit limits, UK city comparison, and global EU &amp; USA rent data.
            </p>
          </div>
        </section>

        {/* Tab bar */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur border-b border-border">
          <div className="max-w-3xl mx-auto px-4 flex gap-1 overflow-x-auto py-2 scrollbar-none">
            {NAV_TABS.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                  tab === t.id
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Calculator panel */}
        <section className="max-w-3xl mx-auto px-4 py-8">
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            {tab === "affordability" && <AffordabilityCalc />}
            {tab === "yield" && <YieldCalc />}
            {tab === "deposit" && <DepositCalc />}
            {tab === "comparison" && <UKComparison />}
            {tab === "global" && <GlobalComparison />}
          </div>
        </section>

        {/* FAQ — Featured Snippet bait */}
        <section className="max-w-3xl mx-auto px-4 pb-16">
          <h2 className="text-xl font-serif font-semibold mb-4">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {[
              {
                q: "How much rent can I afford in the UK?",
                a: "Most UK letting agents require your annual income to be at least 30× the monthly rent. For rent of £1,200/month you need at least £36,000/year gross income. As a comfort guide, keep rent below 33–40% of take-home pay after tax.",
              },
              {
                q: "What is the maximum deposit a landlord can charge in the UK in 2026?",
                a: "The Tenant Fees Act 2019 caps tenancy deposits at 5 weeks' rent (for annual rents under £50,000). The Renters' Rights Act 2026 also limits advance rent to 1 month. Total maximum upfront cost is approximately 2.25 months' rent.",
              },
              {
                q: "What is a good rental yield in the UK in 2026?",
                a: "A gross yield of 5–7% is considered good in 2026. Liverpool (6–8.5%) and Leeds (5.5–7.5%) offer the highest yields. London yields are 3–4.5% gross but offer stronger long-term capital growth.",
              },
              {
                q: "Is East Ham cheap to rent compared to the rest of London?",
                a: "Yes. East Ham (E6) is one of only 5 London postcodes where rooms still average under £800/month (approximately £782 in Q1 2026, SpareRoom data). A 1-bedroom flat averages around £1,450/month — significantly below the inner London average of £2,100.",
              },
              {
                q: "How does UK rent compare to Europe and the USA?",
                a: "London inner-city rents (£2,100/mo for a 1-bed) are comparable to Amsterdam (€2,100) and more expensive than Berlin (€1,500) or Madrid (€1,300). US cities like New York ($3,200) and Boston ($2,700) are significantly more expensive than any UK city. East Ham E6 at £1,450/mo is one of the best-value options in a global capital city.",
              },
            ].map(({ q, a }) => (
              <details key={q} className="border border-border rounded-xl overflow-hidden group">
                <summary className="px-4 py-3 cursor-pointer text-sm font-medium list-none flex justify-between items-center hover:bg-muted/40">
                  {q}
                  <span className="text-muted-foreground group-open:rotate-180 transition-transform">▾</span>
                </summary>
                <p className="px-4 pb-4 pt-1 text-sm text-muted-foreground">{a}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 bg-primary/5 border border-primary/20 rounded-2xl p-6 text-center">
            <p className="font-semibold text-foreground mb-1">Looking for a property that fits your budget?</p>
            <p className="text-sm text-muted-foreground mb-4">Elite Tenancy lists verified rental properties across London and major UK cities. Find your match in minutes.</p>
            <a
              href="/listings"
              className="inline-block bg-primary text-primary-foreground font-medium px-6 py-2.5 rounded-full text-sm hover:bg-primary/90 transition-colors"
            >
              Browse Properties
            </a>
          </div>
        </section>
      </main>
    </>
  );
}
