import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { GraduationCap, LayoutDashboard, FileText, Bell, LogOut, Users, Building2, Megaphone, BarChart3, CalendarRange, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export function AppShell({ children, role }: { children: ReactNode; role: "applicant" | "admin" }) {
  const { user, loading, isAdmin, isApplicant, signOut } = useAuth();
  const nav = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (loading) return;
    if (!user) nav({ to: "/login" });
    else if (role === "admin" && !isAdmin) nav({ to: "/dashboard" });
    else if (role === "applicant" && !isApplicant && !isAdmin) nav({ to: "/login" });
  }, [user, loading, isAdmin, isApplicant, role, nav]);

  const applicantNav = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/dashboard/application", label: "My application", icon: FileText },
    { to: "/dashboard/notifications", label: "Announcements", icon: Bell },
  ];
  const adminNav = [
    { to: "/admin", label: "Overview", icon: BarChart3 },
    { to: "/admin/applications", label: "Applications", icon: FileText },
    { to: "/admin/periods", label: "Attachment periods", icon: CalendarRange },
    { to: "/admin/departments", label: "Departments", icon: Building2 },
    { to: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { to: "/admin/users", label: "Users", icon: Users },
  ];
  const navItems = role === "admin" ? adminNav : applicantNav;

  if (loading || !user) {
    return <div className="flex min-h-screen items-center justify-center text-muted-foreground">Loading…</div>;
  }

  return (
    <div className="flex min-h-screen bg-background">
      <aside className="hidden w-64 shrink-0 flex-col border-r bg-sidebar text-sidebar-foreground md:flex">
        <Link to="/" className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <div className="font-display text-sm font-semibold">KICD Portal</div>
            <div className="text-[10px] uppercase tracking-wider text-sidebar-foreground/60">{role === "admin" ? "Admin" : "Applicant"}</div>
          </div>
        </Link>
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((it) => {
            const Icon = it.icon;
            const active = path === it.to || (it.to !== "/admin" && it.to !== "/dashboard" && path.startsWith(it.to));
            const isExact = (path === it.to);
            return (
              <Link key={it.to} to={it.to} className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition",
                (active || isExact) ? "bg-sidebar-primary text-sidebar-primary-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
              )}>
                <Icon className="h-4 w-4" /> {it.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-3">
          {isAdmin && role === "applicant" && (
            <Button variant="ghost" size="sm" className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" asChild>
              <Link to="/admin"><ShieldCheck className="mr-2 h-4 w-4" /> Switch to admin</Link>
            </Button>
          )}
          <Button variant="ghost" size="sm" className="mt-1 w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent" onClick={() => { signOut(); nav({ to: "/" }); }}>
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b bg-card px-4 md:px-8">
          <div>
            <div className="text-xs uppercase tracking-wider text-muted-foreground">{role === "admin" ? "Administration" : "Applicant area"}</div>
            <div className="font-display text-base font-semibold">{user.email}</div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild><Link to="/">View public site</Link></Button>
          </div>
        </header>
        <div className="flex-1 p-4 md:p-8">{children}</div>
      </div>
    </div>
  );
}
