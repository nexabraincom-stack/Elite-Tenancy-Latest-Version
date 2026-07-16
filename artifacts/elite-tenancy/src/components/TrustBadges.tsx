import { ShieldCheck, Scale, FileCheck2, Lock } from "lucide-react";

interface TrustBadgesProps {
  /** Compact renders a single-line row of small pills (good for tight hero/CTA spots). */
  variant?: "compact" | "full";
  className?: string;
}

const BADGES = [
  { icon: ShieldCheck, label: "Property Ombudsman member" },
  { icon: Scale, label: "RRA 2025 compliant" },
  { icon: FileCheck2, label: "Tenant Fees Act 2019 compliant" },
  { icon: Lock, label: "Deposits protected" },
];

/**
 * Authority/trust signals, meant to sit beside the exact CTA or tool where a
 * visitor is weighing risk (Find My Match, sign-up, Verify a Landlord) —
 * not just in the footer, where trust badges are rarely seen at the moment
 * they'd actually change someone's mind.
 */
export default function TrustBadges({ variant = "compact", className = "" }: TrustBadgesProps) {
  return (
    <div
      className={`flex flex-wrap items-center gap-x-4 gap-y-2 ${className}`}
      role="list"
      aria-label="Compliance and trust credentials"
    >
      {BADGES.map(({ icon: Icon, label }) => (
        <span
          key={label}
          role="listitem"
          className={
            variant === "compact"
              ? "inline-flex items-center gap-1.5 text-xs text-muted-foreground"
              : "inline-flex items-center gap-2 bg-primary/10 text-primary border border-primary/20 rounded-full px-3 py-1.5 text-xs font-medium"
          }
        >
          <Icon size={variant === "compact" ? 12 : 13} className={variant === "compact" ? "text-primary shrink-0" : "shrink-0"} />
          {label}
        </span>
      ))}
    </div>
  );
}
