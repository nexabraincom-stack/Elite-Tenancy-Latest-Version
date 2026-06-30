import { useState, useEffect } from "react";
import { useUser, useClerk } from "@clerk/react";
import { motion } from "framer-motion";
import { User, Mail, Shield, LogOut, Save, CheckCircle2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const ROLE_LABELS: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrator", color: "bg-red-500/15 text-red-400 border-red-500/30" },
  landlord: { label: "Premium Landlord", color: "bg-primary/15 text-primary border-primary/30" },
  tenant: { label: "Tenant", color: "bg-blue-500/15 text-blue-400 border-blue-500/30" },
};

export default function Profile() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();

  const [name, setName] = useState("");
  const [role, setRole] = useState<string>("tenant");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [profileLoaded, setProfileLoaded] = useState(false);

  useEffect(() => {
    if (!isLoaded || !user) return;
    setName(user.fullName ?? user.firstName ?? "");
    fetch(`${import.meta.env.BASE_URL}api/auth/me`, { credentials: "include" })
      .then((r) => r.json())
      .then((d) => {
        setRole(d.role ?? "tenant");
        if (!name) setName(d.name ?? "");
        setProfileLoaded(true);
      })
      .catch(() => setProfileLoaded(true));
  }, [isLoaded, user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await user?.update({ firstName: name.split(" ")[0], lastName: name.split(" ").slice(1).join(" ") || undefined });
      await fetch(`${import.meta.env.BASE_URL}api/auth/profile`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  }

  const roleInfo = ROLE_LABELS[role] ?? ROLE_LABELS.tenant;
  const portalHref = role === "admin" ? "/admin/dashboard" : role === "landlord" ? "/landlord/dashboard" : "/tenant/dashboard";

  if (!isLoaded || !profileLoaded) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/">
            <span className="font-display text-xl font-bold text-primary cursor-pointer">Elite Tenancy</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={portalHref}>
              <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground text-xs">
                ← Back to portal
              </Button>
            </Link>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => signOut({ redirectUrl: basePath || "/" })}
              className="text-muted-foreground hover:text-destructive gap-1.5 text-xs"
            >
              <LogOut size={13} /> Sign out
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="font-display text-3xl font-bold text-foreground">Account Settings</h1>
          <p className="text-muted-foreground mt-1">Manage your Elite Tenancy profile</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Avatar + role card */}
          <div className="md:col-span-1">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card border border-border/50 rounded-xl p-6 text-center"
            >
              <div className="w-20 h-20 rounded-full bg-primary/15 flex items-center justify-center mx-auto mb-4 text-3xl font-display font-bold text-primary">
                {(name || user?.firstName || "?")[0]?.toUpperCase()}
              </div>
              <p className="font-semibold text-foreground text-sm">{name || user?.fullName || "—"}</p>
              <p className="text-xs text-muted-foreground mt-1">{user?.primaryEmailAddress?.emailAddress}</p>
              <Badge className={`mt-3 text-xs ${roleInfo.color}`}>{roleInfo.label}</Badge>

              <div className="mt-5 pt-5 border-t border-border/50 space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Member since</span>
                  <span className="text-foreground">
                    {user?.createdAt
                      ? new Date(user.createdAt).toLocaleDateString("en-GB", { month: "short", year: "numeric" })
                      : "—"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Verified</span>
                  <span className="text-green-400 flex items-center gap-1">
                    <CheckCircle2 size={11} /> Yes
                  </span>
                </div>
              </div>
            </motion.div>

            {/* AI Match promo */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="mt-4 bg-primary/5 border border-primary/20 rounded-xl p-4"
            >
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={14} className="text-primary" />
                <span className="text-xs font-semibold text-primary">AI Match</span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Use our AI to find properties perfectly matched to your lifestyle and priorities.
              </p>
              <Link href="/find-my-match">
                <Button size="sm" className="w-full mt-3 bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-primary-foreground text-xs h-8">
                  Try AI Matching
                </Button>
              </Link>
            </motion.div>
          </div>

          {/* Settings form */}
          <div className="md:col-span-2 space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="bg-card border border-border/50 rounded-xl p-6"
            >
              <h2 className="font-semibold text-foreground mb-5 flex items-center gap-2 text-sm">
                <User size={15} className="text-primary" />
                Personal Information
              </h2>
              <form onSubmit={handleSave} className="space-y-4">
                <div>
                  <Label className="text-xs mb-1.5 block text-muted-foreground">Full name</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your full name"
                    className="bg-background text-sm"
                    required
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1.5 block text-muted-foreground">Email address</Label>
                  <Input
                    value={user?.primaryEmailAddress?.emailAddress ?? ""}
                    disabled
                    className="bg-background text-sm opacity-60"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email is managed by your Clerk account</p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div>
                    {saved && (
                      <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-xs text-green-400 flex items-center gap-1"
                      >
                        <CheckCircle2 size={12} /> Changes saved
                      </motion.p>
                    )}
                  </div>
                  <Button
                    type="submit"
                    disabled={saving}
                    size="sm"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 gap-1.5 text-xs"
                  >
                    <Save size={13} />
                    {saving ? "Saving…" : "Save changes"}
                  </Button>
                </div>
              </form>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-card border border-border/50 rounded-xl p-6"
            >
              <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm">
                <Shield size={15} className="text-primary" />
                Account & Security
              </h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between py-3 border-b border-border/30">
                  <div>
                    <p className="text-foreground text-xs font-medium">Password</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Managed securely by Clerk</p>
                  </div>
                  <Badge className="text-xs bg-muted text-muted-foreground border-border/50">Protected</Badge>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-border/30">
                  <div>
                    <p className="text-foreground text-xs font-medium">Two-factor authentication</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Add extra security to your account</p>
                  </div>
                  <Badge className="text-xs bg-muted text-muted-foreground border-border/50">Via Clerk</Badge>
                </div>
                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-foreground text-xs font-medium">Account role</p>
                    <p className="text-muted-foreground text-xs mt-0.5">Contact support to change your role</p>
                  </div>
                  <Badge className={`text-xs ${roleInfo.color}`}>{roleInfo.label}</Badge>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-destructive/5 border border-destructive/20 rounded-xl p-5"
            >
              <h2 className="font-semibold text-destructive text-sm mb-1 flex items-center gap-2">
                <Mail size={14} /> Sign out
              </h2>
              <p className="text-xs text-muted-foreground mb-3">You'll be redirected to the homepage.</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => signOut({ redirectUrl: basePath || "/" })}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive border border-destructive/20 gap-1.5 text-xs"
              >
                <LogOut size={13} /> Sign out of Elite Tenancy
              </Button>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
