import { Link, useLocation } from "wouter";
import { LayoutDashboard, Building2, UserCheck, BookOpen, Users, LogOut, ShieldCheck, User, Star, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser, useClerk } from "@clerk/react";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Listings", href: "/admin/listings", icon: Building2 },
  { label: "Leads", href: "/admin/leads", icon: UserCheck },
  { label: "Articles", href: "/admin/articles", icon: BookOpen },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Reputation", href: "/admin/reputation", icon: Star },
  { label: "Referrals", href: "/admin/referrals", icon: Gift },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const displayName = user?.fullName ?? user?.firstName ?? "Admin";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-56 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Link href="/">
            <span className="font-display text-xl font-bold text-primary cursor-pointer">Elite Tenancy</span>
          </Link>
          <Badge className="mt-2 bg-destructive/20 text-destructive border-destructive/30 text-xs gap-1">
            <ShieldCheck size={10} />
            Admin
          </Badge>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
                  <Icon size={16} />
                  {label}
                </div>
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-sidebar-border space-y-1">
          <Link href="/profile">
            <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${location === "/profile" ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
              <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                {initials || <User size={12} />}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground truncate">{displayName}</p>
                <p className="text-[10px] text-muted-foreground truncate">{email}</p>
              </div>
            </div>
          </Link>
          <button
            onClick={() => signOut({ redirectUrl: basePath || "/" })}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
          >
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
