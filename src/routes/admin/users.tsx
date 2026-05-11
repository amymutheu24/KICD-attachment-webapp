import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ShieldCheck, ShieldOff } from "lucide-react";

export const Route = createFileRoute("/admin/users")({ component: Users });

function Users() {
  const { data, refetch } = useQuery({ queryKey: ["users-admin"], queryFn: async () => {
    const { data: profiles } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    const { data: roles } = await supabase.from("user_roles").select("*");
    const map = new Map<string, string[]>();
    (roles ?? []).forEach((r) => { const arr = map.get(r.user_id) ?? []; arr.push(r.role); map.set(r.user_id, arr); });
    return (profiles ?? []).map((p) => ({ ...p, roles: map.get(p.id) ?? [] }));
  }});

  const toggleAdmin = async (uid: string, isAdmin: boolean) => {
    if (isAdmin) {
      const { error } = await supabase.from("user_roles").delete().eq("user_id", uid).eq("role", "admin");
      if (error) return toast.error(error.message);
      toast.success("Admin role removed");
    } else {
      const { error } = await supabase.from("user_roles").insert({ user_id: uid, role: "admin" });
      if (error) return toast.error(error.message);
      toast.success("Admin role granted");
    }
    refetch();
  };

  return (
    <AppShell role="admin">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Users</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage user roles and access.</p>

      <Card className="mt-6 shadow-card"><CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr><th className="px-5 py-3">User</th><th className="py-3">Roles</th><th className="py-3">Joined</th><th /></tr>
            </thead>
            <tbody>
              {(data ?? []).map((u: any) => {
                const isAdmin = u.roles.includes("admin");
                return (
                  <tr key={u.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="px-5 py-3"><div className="font-medium">{u.full_name ?? "—"}</div><div className="text-xs text-muted-foreground">{u.email}</div></td>
                    <td className="py-3"><div className="flex gap-1">{u.roles.map((r: string) => <Badge key={r} variant={r === "admin" ? "default" : "secondary"}>{r}</Badge>)}</div></td>
                    <td className="py-3 text-xs text-muted-foreground">{new Date(u.created_at).toLocaleDateString(undefined,{ dateStyle:"medium" })}</td>
                    <td className="py-3 pr-5 text-right">
                      <Button size="sm" variant={isAdmin ? "outline" : "default"} onClick={() => toggleAdmin(u.id, isAdmin)}>
                        {isAdmin ? <><ShieldOff className="mr-1.5 h-4 w-4" /> Revoke admin</> : <><ShieldCheck className="mr-1.5 h-4 w-4" /> Make admin</>}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent></Card>
    </AppShell>
  );
}
