import { Link } from "wouter";
import { Home, KeyRound, Building2, Users2, ArrowRight, ShieldCheck } from "lucide-react";
import { useSeo } from "@/hooks/use-seo";
import TrustBadges from "@/components/TrustBadges";

interface PortalOption {
  role: "tenant" | "landlord";
  icon: typeof Home;
  title: string;
  description: string;
}

const PORTALS: PortalOption[] = [
  {
    role: "tenant",
    icon: Home,
    title: "Tenant",
    description: "Browse verified properties, build your Renter Passport, and manage your tenancy in one place.",
  },
  {
    role: "landlord",
    icon: KeyRound,
    title: "Landlord",
    description: "List properties, screen tenants, and collect rent — completion-only fees, no upfront cost.",
  },
  {
    role: "landlord",
    icon: Building2,
    title: "Agency",
    description: "Manage a portfolio of client properties through the same landlord tools, at scale.",
  },
  {
    role: "landlord",
    icon: Users2,
    title: "HMO Owner",
    description: "Run a house in multiple occupation with room-by-room tracking and compliance built in.",
  },
];

export default function GetStarted() {
  useSeo({
    title: "Get Started — Choose Your Portal | Elite Tenancy",
    description: "Sign up to Elite Tenancy as a tenant, landlord, agency, or HMO owner and get access to the right portal for you.",
    canonical: "https://www.elitetenancy.co.uk/sign-up",
  });

  return (
    <div className="min-h-[100dvh] bg-background flex flex-col items-center justify-center px-4 py-16">
      <Link href="/" className="flex items-center gap-2.5 mb-8">
        <svg viewBox="0 0 120 150" className="h-9 w-auto shrink-0" fill="none" aria-hidden="true">
          <defs>
            <linearGradient id="gsGold" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="#F0D89A" />
              <stop offset="0.4" stopColor="#D4A24A" />
              <stop offset="0.75" stopColor="#B8862A" />
              <stop offset="1" stopColor="#8C6518" />
            </linearGradient>
          </defs>
          <path d="M60 4 L108 24 L108 88 L60 146 L12 88 L12 24 Z" stroke="url(#gsGold)" strokeWidth="4" strokeLinejoin="round" opacity="0.9" />
          <g stroke="url(#gsGold)" strokeWidth="8" strokeLinecap="square">
            <path d="M43 46 V104" />
            <path d="M43 46 H62" />
            <path d="M43 75 H58" />
            <path d="M43 104 H62" />
            <path d="M56 46 H88" />
            <path d="M72 46 V104" />
          </g>
        </svg>
        <span className="font-display text-2xl font-bold text-primary tracking-tight">Elite Tenancy</span>
      </Link>

      <div className="text-center mb-10 max-w-lg">
        <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent text-[11px] font-semibold uppercase tracking-[0.14em] px-4 py-2 rounded-full mb-5">
          Get Started
        </span>
        <h1 className="font-display text-3xl sm:text-4xl font-semibold text-foreground tracking-tight mb-3">
          How will you use Elite Tenancy?
        </h1>
        <p className="text-muted-foreground text-base leading-relaxed">
          Pick the portal that fits you — we'll set your account up accordingly.
        </p>
        <TrustBadges className="justify-center mt-5" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full mb-8">
        {PORTALS.map((portal) => (
          <Link
            key={portal.title}
            href={`/sign-up?role=${portal.role}&portal=${portal.title.toLowerCase().replace(/\s+/g, "-")}`}
            className="group flex flex-col gap-3 bg-card border border-border/60 rounded-xl p-6 text-left hover:border-accent/40 hover:shadow-md transition-all duration-300"
          >
            <div className="w-[54px] h-[54px] rounded-[14px] bg-primary text-accent flex items-center justify-center shrink-0">
              <portal.icon size={24} />
            </div>
            <div>
              <div className="flex items-center gap-1.5 mb-1.5">
                <h2 className="font-display text-lg font-semibold text-foreground tracking-tight">{portal.title}</h2>
                <ArrowRight size={15} className="text-accent opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{portal.description}</p>
            </div>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground mb-3">
        Already have an account?{" "}
        <Link href="/sign-in" className="text-primary font-medium hover:text-accent transition-colors">
          Sign in
        </Link>
      </p>

      <Link
        href="/sign-in"
        className="inline-flex items-center gap-1.5 text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors"
      >
        <ShieldCheck size={12} />
        Elite Tenancy team member? Sign in
      </Link>
    </div>
  );
}
