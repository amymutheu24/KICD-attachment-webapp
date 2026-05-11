import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, Cell } from "recharts";
import { CheckCircle2, Clock, FileText, XCircle } from "lucide-react";

export const Route = createFileRoute("/admin/")({ component: AdminOverview });

function AdminOverview() {
  const { data } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const { data: apps } = await supabase.from("applications").select("status, department_id, created_at, departments(name)");
      const list = apps ?? [];
      const byStatus = list.reduce((acc: any, a: any) => { acc[a.status] = (acc[a.status] ?? 0) + 1; return acc; }, {});
      const byDept: Record<string, number> = {};
      list.forEach((a: any) => { const n = a.departments?.name ?? "Unassigned"; byDept[n] = (byDept[n] ?? 0) + 1; });
      return {
        total: list.length,
        submitted: byStatus.submitted ?? 0,
        underReview: byStatus.under_review ?? 0,
        approved: byStatus.approved ?? 0,
        rejected: byStatus.rejected ?? 0,
        draft: byStatus.draft ?? 0,
        byDept: Object.entries(byDept).map(([name, count]) => ({ name, count })),
      };
    },
  });

  const colors = ["oklch(0.45 0.16 252)","oklch(0.78 0.14 80)","oklch(0.55 0.14 155)","oklch(0.55 0.18 25)","oklch(0.55 0.14 290)","oklch(0.6 0.12 200)"];

  return (
    <AppShell role="admin">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Overview</h1>
      <p className="mt-1 text-sm text-muted-foreground">High-level metrics across the attachment programme.</p>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <Stat icon={<FileText className="h-5 w-5" />} label="Total applications" value={data?.total ?? 0} tone="primary" />
        <Stat icon={<Clock className="h-5 w-5" />} label="Pending review" value={(data?.submitted ?? 0) + (data?.underReview ?? 0)} tone="warning" />
        <Stat icon={<CheckCircle2 className="h-5 w-5" />} label="Approved" value={data?.approved ?? 0} tone="success" />
        <Stat icon={<XCircle className="h-5 w-5" />} label="Rejected" value={data?.rejected ?? 0} tone="destructive" />
      </div>

      <Card className="mt-6 shadow-card">
        <CardContent className="p-6">
          <div className="font-display text-lg font-semibold">Applications by department</div>
          <div className="mt-4 h-72 w-full">
            {data?.byDept && data.byDept.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.byDept}>
                  <XAxis dataKey="name" stroke="oklch(0.5 0.02 250)" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="oklch(0.5 0.02 250)" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                  <Tooltip cursor={{ fill: "oklch(0.96 0.008 240)" }} contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.92 0.01 240)" }} />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {data.byDept.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : <div className="flex h-full items-center justify-center text-muted-foreground">No data yet</div>}
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Stat({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: number; tone: "primary" | "warning" | "success" | "destructive" }) {
  const t = {
    primary: "bg-primary/10 text-primary", warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/15 text-success", destructive: "bg-destructive/15 text-destructive",
  }[tone];
  return (
    <Card className="shadow-card"><CardContent className="p-5">
      <div className={`flex h-10 w-10 items-center justify-center rounded-md ${t}`}>{icon}</div>
      <div className="mt-3 font-display text-2xl font-semibold">{value}</div>
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
    </CardContent></Card>
  );
}
