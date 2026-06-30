import { Link, useLocation } from "wouter";
import { Home, FileText, CreditCard, Wrench, FolderOpen, MessageSquare, LogOut, User, Gift } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUser, useClerk } from "@clerk/react";
import { useChatContext } from "@/contexts/ChatContext";

const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

const navItems = [
  { label: "Dashboard", href: "/tenant/dashboard", icon: Home },
  { label: "My Tenancy", href: "/tenant/my-tenancy", icon: FileText },
  { label: "Rent", href: "/tenant/rent", icon: CreditCard },
  { label: "Maintenance", href: "/tenant/maintenance", icon: Wrench },
  { label: "Documents", href: "/tenant/documents", icon: FolderOpen },
  { label: "Messages", href: "/tenant/messages", icon: MessageSquare },
  { label: "Refer & Earn", href: "/tenant/referral", icon: Gift },
];

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();
  const { unreadCount } = useChatContext();

  const displayName = user?.fullName ?? user?.firstName ?? "Tenant";
  const email = user?.primaryEmailAddress?.emailAddress ?? "";
  const initials = displayName.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <aside className="w-60 shrink-0 bg-sidebar border-r border-sidebar-border flex flex-col">
        <div className="px-5 py-5 border-b border-sidebar-border">
          <Link href="/">
            <span className="font-display text-xl font-bold text-primary cursor-pointer">Elite Tenancy</span>
          </Link>
          <p className="mt-1 text-xs text-muted-foreground">Tenant Portal</p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ label, href, icon: Icon }) => {
            const active = location === href || location.startsWith(href + "/");
            const isMessages = href === "/tenant/messages";
            return (
              <Link key={href} href={href}>
                <div className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors cursor-pointer ${active ? "bg-primary/15 text-primary" : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"}`}>
                  <Icon size={16} />
                  <span className="flex-1">{label}</span>
                  {isMessages && unreadCount > 0 && (
                    <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0 h-[18px] min-w-[18px] flex items-center justify-center">
                      {unreadCount}
                    </Badge>
                  )}
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
        <div className="max-w-5xl mx-auto px-6 py-8">{children}</div>
      </main>
    </div>
  );
}
