import { Badge } from "@/components/ui/badge";
import { Mail } from "lucide-react";
import AdminLayout from "@/components/AdminLayout";
import { useGetAdminUsers } from "@workspace/api-client-react";

function roleColor(r: string) {
  if (r === "admin") return "bg-red-500/10 text-red-400 border-red-500/20";
  if (r === "landlord") return "bg-primary/10 text-primary border-primary/20";
  return "bg-blue-500/10 text-blue-400 border-blue-500/20";
}

export default function AdminUsers() {
  const { data: users, isLoading } = useGetAdminUsers();

  return (
    <AdminLayout>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-foreground">Users</h1>
        <p className="text-muted-foreground mt-1">{users?.length ?? 0} registered users.</p>
      </div>

      <div className="bg-card border border-border/50 rounded-xl overflow-hidden">
        <div className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-3 px-6 py-3 bg-muted/30 text-xs font-medium text-muted-foreground border-b border-border/50">
          <span>Name</span>
          <span>Email</span>
          <span>Role</span>
          <span>Joined</span>
          <span>Last Active</span>
        </div>
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="divide-y divide-border/30">
            {users?.map(user => (
              <div key={user.id} className="grid grid-cols-[2fr_2fr_1fr_1fr_1fr] gap-3 px-6 py-4 items-center text-sm hover:bg-muted/20 transition-colors">
                <span className="text-foreground font-medium">{user.name}</span>
                <a href={`mailto:${user.email}`} className="text-muted-foreground hover:text-primary flex items-center gap-1.5 transition-colors text-xs">
                  <Mail size={11} />{user.email}
                </a>
                <Badge className={`${roleColor(user.role)} text-xs capitalize w-fit`}>{user.role}</Badge>
                <span className="text-muted-foreground text-xs">{new Date(user.createdAt).toLocaleDateString("en-GB")}</span>
                <span className="text-muted-foreground text-xs">{user.lastActiveAt ? new Date(user.lastActiveAt).toLocaleDateString("en-GB") : "—"}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
