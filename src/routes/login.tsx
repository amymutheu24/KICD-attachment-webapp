import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({
  component: LoginPage,
  head: () => ({ meta: [{ title: "Sign in — KICD Attachments" }] }),
});

function LoginPage() {
  const nav = useNavigate();
  const { refreshRoles } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error, data } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) return toast.error(error.message);
    toast.success("Welcome back");
    // Determine role to redirect
    const { data: roles } = await supabase.from("user_roles").select("role").eq("user_id", data.user.id);
    await refreshRoles();
    const isAdmin = (roles ?? []).some((r) => r.role === "admin");
    nav({ to: isAdmin ? "/admin" : "/dashboard" });
  };

  return (
    <PublicLayout>
      <section className="mx-auto flex max-w-md flex-col px-4 py-16 md:px-6">
        <h1 className="font-display text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Access your application dashboard.</p>
        <Card className="mt-6 shadow-card">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1.5" />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>{loading ? "Signing in…" : "Sign in"}</Button>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account? <Link to="/register" className="font-medium text-primary hover:underline">Create one</Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>
    </PublicLayout>
  );
}
