import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowRight, CalendarDays, CheckCircle2, FileText, ShieldCheck, Sparkles, Users } from "lucide-react";

export const Route = createFileRoute("/")({
  component: Home,
  head: () => ({
    meta: [
      { title: "KICD Attachment Portal — Apply for Industrial Attachment" },
      { name: "description", content: "Apply for industrial attachment at the Kenya Institute of Curriculum Development. View open slots, track your application status, and manage your documents securely." },
    ],
  }),
});

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string }> = {
    open: { label: "Open", cls: "bg-success text-success-foreground" },
    closed: { label: "Closed", cls: "bg-muted text-muted-foreground" },
    opening_soon: { label: "Opening soon", cls: "bg-warning text-warning-foreground" },
  };
  const v = map[status] ?? map.closed;
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${v.cls}`}><span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />{v.label}</span>;
}

function Home() {
  const { data: period } = useQuery({
    queryKey: ["current-period"],
    queryFn: async () => {
      const { data } = await supabase
        .from("attachment_periods")
        .select("*")
        .order("application_open", { ascending: false })
        .limit(1)
        .maybeSingle();
      return data;
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["public-stats"],
    queryFn: async () => {
      const [{ count: depts }, { count: slots }] = await Promise.all([
        supabase.from("departments").select("*", { count: "exact", head: true }).eq("active", true),
        supabase.from("departments").select("slots_total"),
      ]);
      const totalSlots = (slots as any)?.reduce?.((a: number, b: any) => a + (b.slots_total ?? 0), 0) ?? 0;
      return { depts: depts ?? 0, totalSlots };
    },
  });

  const { data: announcements } = useQuery({
    queryKey: ["announcements-public"],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").eq("published", true).order("created_at", { ascending: false }).limit(3);
      return data ?? [];
    },
  });

  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden bg-hero text-primary-foreground">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 0%, white 0, transparent 40%), radial-gradient(circle at 80% 80%, oklch(0.78 0.14 80) 0, transparent 35%)" }} />
        <div className="relative mx-auto max-w-7xl px-4 py-20 md:px-6 md:py-28">
          <div className="grid items-center gap-10 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <Badge className="mb-5 border-white/20 bg-white/10 text-white hover:bg-white/15" variant="outline">
                <Sparkles className="mr-1.5 h-3.5 w-3.5" /> Official KICD Attachment Portal
              </Badge>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Begin your career journey at the heart of Kenya's curriculum.
              </h1>
              <p className="mt-5 max-w-xl text-base text-white/80 md:text-lg">
                Apply online for industrial attachment at the Kenya Institute of Curriculum Development.
                Choose a department, upload your documents, and track every step of your application.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-3">
                <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                  <Link to="/register">Start application <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="border-white/30 bg-white/5 text-white hover:bg-white/15 hover:text-white">
                  <Link to="/about">Learn more</Link>
                </Button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <Card className="border-white/15 bg-white/95 text-foreground shadow-elegant backdrop-blur">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Current intake</div>
                    <StatusBadge status={period?.status ?? "closed"} />
                  </div>
                  <div className="mt-3 font-display text-2xl font-semibold">{period?.name ?? "No active intake"}</div>
                  {period && (
                    <>
                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <Stat icon={<CalendarDays className="h-4 w-4" />} label="Attachment period" value={`${new Date(period.start_date).toLocaleDateString(undefined,{month:'short',day:'numeric'})} – ${new Date(period.end_date).toLocaleDateString(undefined,{month:'short',day:'numeric',year:'numeric'})}`} />
                        <Stat icon={<Users className="h-4 w-4" />} label="Available slots" value={String(period.total_slots)} />
                      </div>
                      <div className="mt-4 rounded-md bg-muted/60 p-3 text-xs text-muted-foreground">
                        Application closes <span className="font-medium text-foreground">{new Date(period.application_close).toLocaleDateString(undefined,{ dateStyle:"medium" })}</span>
                      </div>
                    </>
                  )}
                  <Button className="mt-5 w-full" asChild disabled={period?.status !== "open"}>
                    <Link to={period?.status === "open" ? "/register" : "/"}>
                      {period?.status === "open" ? "Apply for this intake" : period?.status === "opening_soon" ? "Opens soon — get notified" : "Applications closed"}
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-y bg-subtle">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-12 sm:grid-cols-3 md:px-6">
          <HighlightStat label="Active departments" value={stats?.depts ?? 0} icon={<ShieldCheck className="h-5 w-5" />} />
          <HighlightStat label="Attachment slots" value={stats?.totalSlots ?? 0} icon={<Users className="h-5 w-5" />} />
          <HighlightStat label="Application steps" value={4} icon={<FileText className="h-5 w-5" />} />
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">How it works</div>
          <h2 className="mt-2 font-display text-3xl font-semibold md:text-4xl">A simple, transparent application process</h2>
          <p className="mt-3 text-muted-foreground">Designed to be fast, fair, and accessible — from application to placement.</p>
        </div>
        <div className="mt-12 grid gap-6 md:grid-cols-4">
          {[
            { n: "01", t: "Create account", d: "Register with your email and verify your details." },
            { n: "02", t: "Fill application", d: "Complete a guided multi-step form with your academic and personal info." },
            { n: "03", t: "Upload documents", d: "Attach CV, ID, transcripts, and your introduction letter." },
            { n: "04", t: "Track status", d: "Receive updates as your application moves through review." },
          ].map((s) => (
            <Card key={s.n} className="border-border/60 shadow-card transition hover:shadow-elegant">
              <CardContent className="p-6">
                <div className="font-display text-3xl font-semibold text-primary/30">{s.n}</div>
                <div className="mt-2 font-display text-lg font-semibold">{s.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Announcements */}
      {announcements && announcements.length > 0 && (
        <section className="border-t bg-muted/30">
          <div className="mx-auto max-w-7xl px-4 py-16 md:px-6">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-primary">Announcements</div>
                <h2 className="mt-2 font-display text-3xl font-semibold">Latest from KICD</h2>
              </div>
            </div>
            <div className="mt-8 grid gap-5 md:grid-cols-3">
              {announcements.map((a) => (
                <Card key={a.id} className="bg-card shadow-card">
                  <CardContent className="p-6">
                    <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString(undefined,{ dateStyle:"medium" })}</div>
                    <div className="mt-2 font-display text-lg font-semibold">{a.title}</div>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">{a.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-4 py-20 md:px-6">
        <div className="overflow-hidden rounded-2xl bg-hero p-10 text-primary-foreground shadow-elegant md:p-14">
          <div className="grid items-center gap-6 md:grid-cols-2">
            <div>
              <h2 className="font-display text-3xl font-semibold md:text-4xl">Ready to apply?</h2>
              <p className="mt-2 max-w-md text-white/80">Create your account and submit your application in minutes. Save drafts and complete on your schedule.</p>
            </div>
            <div className="flex md:justify-end">
              <Button size="lg" asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
                <Link to="/register"><CheckCircle2 className="mr-2 h-4 w-4" /> Start your application</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div>
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground">{icon}{label}</div>
      <div className="mt-1 font-display text-base font-semibold">{value}</div>
    </div>
  );
}

function HighlightStat({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center gap-4 rounded-xl border bg-card p-5 shadow-card">
      <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
      <div>
        <div className="font-display text-2xl font-semibold">{value}</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      </div>
    </div>
  );
}
