import { Link, useLocation } from "wouter";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import AriaChat from "@/components/AriaChat";

const navLinks = [
  { label: "Listings", href: "/listings" },
  { label: "AI Match", href: "/find-my-match" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "For Landlords", href: "/for-landlords" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
];

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="font-serif text-2xl font-bold text-primary tracking-tight">
                Elite Tenancy
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    location === link.href ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              <Link href="/sign-in">
                <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
                  Sign In
                </Button>
              </Link>
              <Link href="/find-a-room">
                <Button size="sm" variant="outline" className="border-primary/40 text-primary hover:bg-primary/10">
                  Find a Room
                </Button>
              </Link>
              <Link href="/list-your-property">
                <Button size="sm" className="bg-primary text-primary-foreground hover:bg-primary/90">
                  List Your Property
                </Button>
              </Link>
            </div>

            <button
              className="md:hidden p-2 text-muted-foreground hover:text-foreground"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border/50 bg-background"
            >
              <div className="px-4 py-4 space-y-3">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`block text-sm font-medium py-2 transition-colors hover:text-primary ${
                      location === link.href ? "text-primary" : "text-muted-foreground"
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
                <div className="pt-3 border-t border-border/50 flex flex-col gap-2">
                  <Link href="/find-a-room" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full border-primary/40 text-primary">Find a Room</Button>
                  </Link>
                  <Link href="/list-your-property" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full bg-primary text-primary-foreground">List Your Property</Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      <main className="flex-1">{children}</main>
      <AriaChat />

      <footer className="bg-card border-t border-border/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="md:col-span-1">
              <span className="font-serif text-xl font-bold text-primary">Elite Tenancy</span>
              <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
                The UK's premier tenant introduction service. Connecting exceptional landlords with exceptional tenants.
              </p>
              <p className="mt-4 text-xs text-muted-foreground">
                Elite Tenancy Ltd is a member of The Property Ombudsman.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Properties</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/listings" className="hover:text-primary transition-colors">Browse Listings</Link></li>
                <li><Link href="/find-a-room" className="hover:text-primary transition-colors">Find a Room</Link></li>
                <li><Link href="/valuation" className="hover:text-primary transition-colors">Free Valuation</Link></li>
                <li><Link href="/list-your-property" className="hover:text-primary transition-colors">List Your Property</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/how-it-works" className="hover:text-primary transition-colors">How It Works</Link></li>
                <li><Link href="/for-landlords" className="hover:text-primary transition-colors">For Landlords</Link></li>
                <li><Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link></li>
                <li><Link href="/blog" className="hover:text-primary transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Cities</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/london" className="hover:text-primary transition-colors">London</Link></li>
                <li><Link href="/manchester" className="hover:text-primary transition-colors">Manchester</Link></li>
                <li><Link href="/birmingham" className="hover:text-primary transition-colors">Birmingham</Link></li>
                <li><Link href="/edinburgh" className="hover:text-primary transition-colors">Edinburgh</Link></li>
                <li><Link href="/bristol" className="hover:text-primary transition-colors">Bristol</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-foreground mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
                <li><Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link></li>
                <li><Link href="/cookies" className="hover:text-primary transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t border-border/50 flex flex-col sm:flex-row justify-between items-center gap-3">
            <p className="text-xs text-muted-foreground">
              © 2026 Elite Tenancy Ltd (Co. No. 17135665). All rights reserved. Registered in England &amp; Wales.
            </p>
            <p className="text-xs text-muted-foreground">
              We only charge on successful completion — no upfront fees.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
