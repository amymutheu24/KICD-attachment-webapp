import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Calendar, FileText, ShieldCheck } from "lucide-react";

export const Route = createFileRoute("/dashboard/")({
  component: ApplicantDashboard,
});

const STATUS: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive"; cls?: string }> = {
  draft: { label: "Draft", variant: "secondary" },
  submitted: { label: "Submitted", variant: "default" },
  under_review: { label: "Under review", variant: "default", cls: "bg-warning text-warning-foreground hover:bg-warning/90" },
  approved: { label: "Approved", variant: "default", cls: "bg-success text-success-foreground hover:bg-success/90" },
  rejected: { label: "Rejected", variant: "destructive" },
};

function ApplicantDashboard() {
  const { user } = useAuth();
  const { data: app } = useQuery({
    queryKey: ["my-application", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*, departments(name), attachment_periods(name)").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });
  const { data: period } = useQuery({
    queryKey: ["current-period-applicant"],
    queryFn: async () => {
      const { data } = await supabase.from("attachment_periods").select("*").order("application_open", { ascending: false }).limit(1).maybeSingle();
      return data;
    },
  });

  return (
    <AppShell role="applicant">
      <div className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Here's the status of your application.</p>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="md:col-span-2 shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">My application</div>
              {app && <Badge variant={STATUS[app.status].variant} className={STATUS[app.status].cls}>{STATUS[app.status].label}</Badge>}
            </div>
            {app ? (
              <>
                <div className="mt-3 font-display text-xl font-semibold">{(app as any).departments?.name ?? "Department not selected"}</div>
                <div className="mt-1 text-sm text-muted-foreground">{(app as any).attachment_periods?.name ?? "Period not selected"}</div>
                <div className="mt-5 grid grid-cols-2 gap-4 text-sm md:grid-cols-3">
                  <Mini label="Last updated" value={new Date(app.updated_at).toLocaleDateString(undefined,{ dateStyle:"medium" })} />
                  {app.submitted_at && <Mini label="Submitted" value={new Date(app.submitted_at).toLocaleDateString(undefined,{ dateStyle:"medium" })} />}
                  {app.reviewed_at && <Mini label="Reviewed" value={new Date(app.reviewed_at).toLocaleDateString(undefined,{ dateStyle:"medium" })} />}
                </div>
                {app.review_notes && (
                  <div className="mt-4 rounded-md border bg-muted/40 p-3 text-sm">
                    <div className="text-xs uppercase tracking-wider text-muted-foreground">Reviewer notes</div>
                    <div className="mt-1">{app.review_notes}</div>
                  </div>
                )}
                <Button className="mt-5" asChild>
                  <Link to="/dashboard/application">{app.status === "draft" ? "Continue application" : "View application"} <ArrowRight className="ml-1 h-4 w-4" /></Link>
                </Button>
              </>
            ) : (
              <>
                <p className="mt-3 text-muted-foreground">You haven't started an application yet.</p>
                <Button className="mt-4" asChild><Link to="/dashboard/application">Start application <ArrowRight className="ml-1 h-4 w-4" /></Link></Button>
              </>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Calendar className="h-4 w-4" /> Current intake</div>
            <div className="mt-3 font-display text-lg font-semibold">{period?.name ?? "—"}</div>
            <div className="mt-1 text-sm text-muted-foreground capitalize">Status: {period?.status?.replace("_", " ")}</div>
            {period && <div className="mt-3 text-xs text-muted-foreground">Closes {new Date(period.application_close).toLocaleDateString(undefined,{ dateStyle:"medium" })}</div>}
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <InfoCard icon={<FileText className="h-5 w-5" />} title="Multi-step form" desc="Complete personal, academic, and attachment details with validation." />
        <InfoCard icon={<ShieldCheck className="h-5 w-5" />} title="Secure uploads" desc="CV, ID, transcripts, and your introduction letter — all encrypted at rest." />
        <InfoCard icon={<Calendar className="h-5 w-5" />} title="Save drafts" desc="Save your progress and complete on your own schedule." />
      </div>
    </AppShell>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (<div><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className="mt-0.5 font-medium">{value}</div></div>);
}
function InfoCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <Card className="shadow-card">
      <CardContent className="p-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">{icon}</div>
        <div className="mt-3 font-display text-base font-semibold">{title}</div>
        <p className="mt-1 text-sm text-muted-foreground">{desc}</p>
      </CardContent>
    </Card>
  );
}
