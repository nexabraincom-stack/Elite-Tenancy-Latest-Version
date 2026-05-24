import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SignUp() {
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "tenant" });
  const [, navigate] = useLocation();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.role === "landlord") navigate("/landlord/dashboard");
    else navigate("/tenant/dashboard");
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link href="/">
            <span className="font-serif text-3xl font-bold text-primary cursor-pointer">Elite Tenancy</span>
          </Link>
          <p className="mt-2 text-sm text-muted-foreground">Create your account</p>
        </div>
        <div className="bg-card border border-border/50 rounded-xl p-8">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs mb-1.5 block">Full Name</Label>
              <Input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Your name" className="bg-background" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Email address</Label>
              <Input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" className="bg-background" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">Password</Label>
              <Input type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="••••••••" className="bg-background" />
            </div>
            <div>
              <Label className="text-xs mb-1.5 block">I am a</Label>
              <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                <SelectTrigger className="bg-background"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="tenant">Tenant</SelectItem>
                  <SelectItem value="landlord">Landlord</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button type="submit" className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
              Create Account
            </Button>
          </form>
        </div>
        <p className="text-center mt-5 text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-primary hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
