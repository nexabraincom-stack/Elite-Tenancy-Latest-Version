import { useState } from "react";
import {
  Shield, Wrench, ClipboardCheck, AlertTriangle,
  Calendar, CheckCircle, Clock, XCircle,
  TrendingUp, Building2, PoundSterling, Star,
  ChevronRight, Bell, FileText, Users
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import LandlordLayout from "@/components/LandlordLayout";

// ── Static demo data — in production these come from API endpoints ─────────────
const managedProperties = [
  {
    id: 1,
    address: "14 Castlefield Court, Manchester, M15 4GH",
    tenant: "James Okonkwo",
    monthlyRent: 1350,
    managementFee: 108, // 8% of £1,350
    status: "active",
    leaseEnd: "2027-03-01",
    nextInspection: "2026-06-15",
  },
  {
    id: 2,
    address: "7 Kelham Square, Sheffield, S3 8GH",
    tenant: "Sarah Mensah",
    monthlyRent: 895,
    managementFee: 72, // 8% of £895
    status: "active",
    leaseEnd: "2026-12-01",
    nextInspection: "2026-07-20",
  },
];

const complianceItems = [
  { id: 1, property: "14 Castlefield Court", type: "Gas Safety Certificate", expiry: "2026-11-14", status: "valid", daysLeft: 174 },
  { id: 2, property: "14 Castlefield Court", type: "EICR (Electrical)", expiry: "2026-09-01", status: "expiring_soon", daysLeft: 100 },
  { id: 3, property: "14 Castlefield Court", type: "EPC Rating", expiry: "2033-04-20", status: "valid", daysLeft: 2522 },
  { id: 4, property: "7 Kelham Square", type: "Gas Safety Certificate", expiry: "2026-06-30", status: "expiring_soon", daysLeft: 37 },
  { id: 5, property: "7 Kelham Square", type: "EICR (Electrical)", expiry: "2028-03-15", status: "valid", daysLeft: 660 },
  { id: 6, property: "7 Kelham Square", type: "EPC Rating", expiry: "2031-06-01", status: "valid", daysLeft: 1834 },
];

const inspections = [
  { id: 1, property: "14 Castlefield Court", date: "2026-06-15", type: "Mid-tenancy inspection", status: "scheduled" },
  { id: 2, property: "7 Kelham Square", date: "2026-07-20", type: "Quarterly inspection", status: "scheduled" },
  { id: 3, property: "14 Castlefield Court", date: "2026-03-10", type: "Move-in inspection", status: "completed", notes: "Property in excellent condition. No issues noted." },
];

const maintenanceLog = [
  { id: 1, property: "14 Castlefield Court", issue: "Boiler pressure low", priority: "high", status: "resolved", date: "2026-05-10", resolution: "Engineer attended 12 May — pressure restored." },
  { id: 2, property: "7 Kelham Square", issue: "Kitchen extractor fan noisy", priority: "low", status: "in_progress", date: "2026-05-18", resolution: null },
  { id: 3, property: "14 Castlefield Court", issue: "Bedroom window lock stiff", priority: "medium", status: "scheduled", date: "2026-05-22", resolution: null },
];

function ComplianceBadge({ status, daysLeft }: { status: string; daysLeft: number }) {
  if (status === "valid") return (
    <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs gap-1">
      <CheckCircle size={10} /> Valid · {daysLeft}d left
    </Badge>
  );
  if (status === "expiring_soon") return (
    <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20 text-xs gap-1">
      <AlertTriangle size={10} /> Renew Soon · {daysLeft}d left
    </Badge>
  );
  return (
    <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs gap-1">
      <XCircle size={10} /> EXPIRED
    </Badge>
  );
}

function PriorityBadge({ priority }: { priority: string }) {
  const map: Record<string, string> = {
    emergency: "bg-red-500/15 text-red-400 border-red-500/20",
    high: "bg-orange-500/15 text-orange-400 border-orange-500/20",
    medium: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20",
    low: "bg-muted text-muted-foreground border-border",
  };
  return <Badge className={`text-xs capitalize ${map[priority] ?? map.low}`}>{priority}</Badge>;
}

type Tab = "overview" | "compliance" | "inspections" | "maintenance" | "finances";

export default function LandlordManaged() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");

  const totalRevenue = managedProperties.reduce((a, p) => a + p.monthlyRent, 0);
  const totalFees = managedProperties.reduce((a, p) => a + p.managementFee, 0);
  const expiringCount = complianceItems.filter((c) => c.status === "expiring_soon" || c.status === "expired").length;
  const openMaintenance = maintenanceLog.filter((m) => m.status !== "resolved").length;

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Overview", icon: Building2 },
    { id: "compliance", label: "Compliance", icon: Shield },
    { id: "inspections", label: "Inspections", icon: ClipboardCheck },
    { id: "maintenance", label: "Maintenance", icon: Wrench },
    { id: "finances", label: "Finances", icon: PoundSterling },
  ];

  return (
    <LandlordLayout>
      {/* Header */}
      <div className="mb-8 flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-display text-3xl font-bold text-foreground">Managed Lettings</h1>
            <Badge className="bg-primary/20 text-primary border-primary/30 text-xs gap-1">
              <Star size={10} className="fill-current" /> Premium Service
            </Badge>
          </div>
          <p className="text-muted-foreground">
            Full property management — rent collection, compliance, maintenance, and inspections handled for you.
          </p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 text-primary-foreground text-sm">
          Add Property to Managed
        </Button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Managed Properties", value: managedProperties.length, icon: Building2, color: "text-primary" },
          { label: "Monthly Rent Collected", value: `£${totalRevenue.toLocaleString("en-GB")}`, icon: PoundSterling, color: "text-green-400" },
          { label: "Compliance Alerts", value: expiringCount, icon: AlertTriangle, color: expiringCount > 0 ? "text-yellow-400" : "text-green-400" },
          { label: "Open Maintenance", value: openMaintenance, icon: Wrench, color: openMaintenance > 0 ? "text-orange-400" : "text-green-400" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-card border border-border/50 rounded-xl p-5">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs text-muted-foreground">{label}</p>
              <Icon size={15} className={color} />
            </div>
            <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-border/50 mb-6 overflow-x-auto">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
              activeTab === id
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {/* ── OVERVIEW ──────────────────────────────────────────────────────── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          {managedProperties.map((prop) => (
            <div key={prop.id} className="bg-card border border-border/50 rounded-xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="font-semibold text-foreground">{prop.address}</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    <span className="text-primary">{prop.tenant}</span> · Lease ends{" "}
                    {new Date(prop.leaseEnd).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
                <Badge className="bg-green-500/10 text-green-400 border-green-500/20 text-xs">Active</Badge>
              </div>

              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Monthly Rent</p>
                  <p className="font-semibold text-foreground">£{prop.monthlyRent.toLocaleString("en-GB")}</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Management Fee (8%)</p>
                  <p className="font-semibold text-primary">£{prop.managementFee.toLocaleString("en-GB")}/mo</p>
                </div>
                <div className="bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground mb-1">Next Inspection</p>
                  <p className="font-semibold text-foreground">
                    {new Date(prop.nextInspection).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                </div>
              </div>

              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" className="text-xs">
                  <FileText size={12} className="mr-1" /> View Documents
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Users size={12} className="mr-1" /> Message Tenant
                </Button>
                <Button size="sm" variant="outline" className="text-xs">
                  <Bell size={12} className="mr-1" /> Set Alert
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── COMPLIANCE ────────────────────────────────────────────────────── */}
      {activeTab === "compliance" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              All legal certificates tracked automatically. Elite Tenancy alerts you 60 days before expiry.
            </p>
            <Button size="sm" variant="outline" className="text-xs">
              <Bell size={12} className="mr-1" /> Set Reminders
            </Button>
          </div>
          {complianceItems.map((item) => (
            <div key={item.id} className="bg-card border border-border/50 rounded-xl p-5 flex items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Shield size={14} className="text-primary shrink-0" />
                  <p className="font-medium text-foreground text-sm">{item.type}</p>
                </div>
                <p className="text-xs text-muted-foreground truncate">{item.property}</p>
              </div>
              <div className="text-right shrink-0">
                <ComplianceBadge status={item.status} daysLeft={item.daysLeft} />
                <p className="text-xs text-muted-foreground mt-1">
                  Expires {new Date(item.expiry).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                </p>
              </div>
              {(item.status === "expiring_soon" || item.status === "expired") && (
                <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs shrink-0">
                  Book Renewal
                </Button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── INSPECTIONS ───────────────────────────────────────────────────── */}
      {activeTab === "inspections" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              Regular inspections protect your property and keep your landlord insurance valid.
            </p>
            <Button size="sm" className="bg-primary hover:bg-primary/90 text-primary-foreground text-xs">
              <Calendar size={12} className="mr-1" /> Schedule Inspection
            </Button>
          </div>
          {inspections.map((insp) => (
            <div key={insp.id} className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <ClipboardCheck size={14} className="text-primary" />
                    <p className="font-medium text-foreground text-sm">{insp.type}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{insp.property}</p>
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <Calendar size={11} />
                    {new Date(insp.date).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <Badge className={`text-xs ${
                  insp.status === "completed"
                    ? "bg-green-500/10 text-green-400 border-green-500/20"
                    : "bg-blue-500/10 text-blue-400 border-blue-500/20"
                }`}>
                  {insp.status === "completed" ? (
                    <><CheckCircle size={10} className="mr-1" /> Completed</>
                  ) : (
                    <><Clock size={10} className="mr-1" /> Scheduled</>
                  )}
                </Badge>
              </div>
              {insp.notes && (
                <div className="mt-3 bg-muted/30 rounded-lg p-3">
                  <p className="text-xs text-muted-foreground">{insp.notes}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── MAINTENANCE ───────────────────────────────────────────────────── */}
      {activeTab === "maintenance" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm text-muted-foreground">
              All maintenance requests across your managed properties in one place.
            </p>
          </div>
          {maintenanceLog.map((m) => (
            <div key={m.id} className="bg-card border border-border/50 rounded-xl p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <p className="font-medium text-foreground text-sm">{m.issue}</p>
                    <PriorityBadge priority={m.priority} />
                  </div>
                  <p className="text-xs text-muted-foreground mb-1">{m.property}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Calendar size={11} />
                    Reported {new Date(m.date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                  </p>
                  {m.resolution && (
                    <div className="mt-2 bg-green-500/5 border border-green-500/20 rounded-lg p-2">
                      <p className="text-xs text-green-400 flex items-start gap-1.5">
                        <CheckCircle size={11} className="shrink-0 mt-0.5" />
                        {m.resolution}
                      </p>
                    </div>
                  )}
                </div>
                <Badge className={`text-xs shrink-0 ${
                  m.status === "resolved" ? "bg-green-500/10 text-green-400 border-green-500/20"
                  : m.status === "in_progress" ? "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  : "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                } capitalize`}>
                  {m.status.replace("_", " ")}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── FINANCES ──────────────────────────────────────────────────────── */}
      {activeTab === "finances" && (
        <div className="space-y-6">
          {/* Revenue summary */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "Total Rent Managed (Monthly)", value: `£${totalRevenue.toLocaleString("en-GB")}`, sub: "Collected by Elite Tenancy" },
              { label: "Management Fees (10%)", value: `£${totalFees.toLocaleString("en-GB")}/mo`, sub: "Charged by Elite Tenancy" },
              { label: "Net to You (Monthly)", value: `£${(totalRevenue - totalFees).toLocaleString("en-GB")}`, sub: "Paid to your bank account" },
            ].map(({ label, value, sub }) => (
              <div key={label} className="bg-card border border-border/50 rounded-xl p-5">
                <p className="text-xs text-muted-foreground mb-1">{label}</p>
                <p className="font-display text-2xl font-bold text-primary">{value}</p>
                <p className="text-xs text-muted-foreground mt-1">{sub}</p>
              </div>
            ))}
          </div>

          {/* Payout methods */}
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
              <PoundSterling size={16} className="text-primary" />
              Payout Method
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { name: "Bank Transfer", sub: "2–3 working days · Free", icon: "🏦", active: true },
                { name: "Wise", sub: "Same day · Low fee · Multi-currency", icon: "💱", active: false },
                { name: "PayPal", sub: "Instant · 1.4% fee", icon: "🅿️", active: false },
              ].map(({ name, sub, icon, active }) => (
                <div key={name} className={`p-4 rounded-xl border cursor-pointer transition-all ${active ? "border-primary bg-primary/5" : "border-border/50 hover:border-primary/40"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xl">{icon}</span>
                    {active && <Badge className="bg-primary/20 text-primary border-primary/30 text-[10px]">Active</Badge>}
                  </div>
                  <p className="font-medium text-foreground text-sm">{name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3 flex items-center gap-1.5">
              <TrendingUp size={12} className="text-primary" />
              Payouts processed on the 1st of each month
            </p>
          </div>

          {/* Annual projection */}
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 flex items-center justify-between">
            <div>
              <p className="font-semibold text-foreground">Annual Net Revenue Projection</p>
              <p className="text-xs text-muted-foreground mt-1">Based on current managed properties at full occupancy</p>
            </div>
            <p className="font-display text-3xl font-bold text-primary">
              £{((totalRevenue - totalFees) * 12).toLocaleString("en-GB")}
            </p>
          </div>
        </div>
      )}
    </LandlordLayout>
  );
}
