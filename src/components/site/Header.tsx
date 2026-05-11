import { Link, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { GraduationCap, LogOut, LayoutDashboard, ShieldCheck } from "lucide-react";

export function SiteHeader() {
  const { user, isAdmin, signOut } = useAuth();
  const nav = useNavigate();
  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-elegant">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div className="leading-tight">
            <div className="font-display text-base font-semibold tracking-tight">KICD Attachments</div>
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Kenya Institute of Curriculum Development</div>
          </div>
        </Link>
        <nav className="hidden items-center gap-7 md:flex">
          <Link to="/" className="text-sm text-foreground/80 transition hover:text-primary [&.active]:text-primary [&.active]:font-medium" activeOptions={{ exact: true }}>Home</Link>
          <Link to="/about" className="text-sm text-foreground/80 transition hover:text-primary [&.active]:text-primary [&.active]:font-medium">About</Link>
          <Link to="/departments" className="text-sm text-foreground/80 transition hover:text-primary [&.active]:text-primary [&.active]:font-medium">Departments</Link>
          <Link to="/faq" className="text-sm text-foreground/80 transition hover:text-primary [&.active]:text-primary [&.active]:font-medium">FAQ</Link>
          <Link to="/contact" className="text-sm text-foreground/80 transition hover:text-primary [&.active]:text-primary [&.active]:font-medium">Contact</Link>
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => nav({ to: isAdmin ? "/admin" : "/dashboard" })}>
                {isAdmin ? <ShieldCheck className="mr-1.5 h-4 w-4" /> : <LayoutDashboard className="mr-1.5 h-4 w-4" />}
                {isAdmin ? "Admin" : "Dashboard"}
              </Button>
              <Button variant="outline" size="sm" onClick={() => { signOut(); nav({ to: "/" }); }}>
                <LogOut className="mr-1.5 h-4 w-4" /> Sign out
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild><Link to="/login">Sign in</Link></Button>
              <Button size="sm" asChild><Link to="/register">Apply now</Link></Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
