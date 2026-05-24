import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SignIn() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [, navigate] = useLocation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.email.includes("admin")) navigate("/admin/dashboard");
    else if (form.email.includes("landlord") || form.email.includes("chambers")) navigate("/landlord/dashboard");
    else navigate("/tenant/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-serif text-3xl font-bold text-primary cursor-pointer">Elite Tenancy</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Sign in to your account</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs mb-1.5 block">Email address</Label>
              <Input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="your@email.com"
                className="bg-background"
              />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Password</Label>
              <Input
                type="password"
                required
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="••••••••"
                className="bg-background"
              />
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Sign In
            </Button>
          </form>
          <div className="mt-6 space-y-2 border-t border-border/50 pt-5">
            <p className="text-xs text-muted-foreground text-center">Demo logins:</p>
            <div className="space-y-1 text-xs text-muted-foreground">
              <button className="w-full text-left px-3 py-2 bg-background rounded hover:bg-muted/50 transition-colors" onClick={() => setForm({ email: "tenant@demo.com", password: "demo" })}>
                Tenant: tenant@demo.com
              </button>
              <button className="w-full text-left px-3 py-2 bg-background rounded hover:bg-muted/50 transition-colors" onClick={() => setForm({ email: "landlord@demo.com", password: "demo" })}>
                Landlord: landlord@demo.com
              </button>
              <button className="w-full text-left px-3 py-2 bg-background rounded hover:bg-muted/50 transition-colors" onClick={() => setForm({ email: "admin@demo.com", password: "demo" })}>
                Admin: admin@demo.com
              </button>
            </div>
          </div>
        </div>
        <p className="text-center mt-5 text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/sign-up" className="text-primary hover:underline">Sign up</Link>
        </p>
      </div>
    </div>
  );
}
