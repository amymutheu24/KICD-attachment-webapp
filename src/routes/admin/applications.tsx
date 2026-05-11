import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Download, Eye, Search } from "lucide-react";

export const Route = createFileRoute("/admin/applications")({ component: AdminApps });

const STATUS_CLS: Record<string, string> = {
  draft: "bg-muted text-muted-foreground",
  submitted: "bg-primary text-primary-foreground",
  under_review: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

function AdminApps() {
  const [q, setQ] = useState(""); const [status, setStatus] = useState<string>("all");
  const [open, setOpen] = useState<any | null>(null);
  const [notes, setNotes] = useState("");

  const { data, refetch } = useQuery({
    queryKey: ["admin-apps"],
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*, departments(name), attachment_periods(name)").order("created_at", { ascending: false });
      return data ?? [];
    },
  });

  const filtered = useMemo(() => (data ?? []).filter((a: any) => {
    if (status !== "all" && a.status !== status) return false;
    if (q && !(a.full_name?.toLowerCase().includes(q.toLowerCase()) || a.email?.toLowerCase().includes(q.toLowerCase()) || a.institution?.toLowerCase().includes(q.toLowerCase()))) return false;
    return true;
  }), [data, q, status]);

  const updateStatus = async (id: string, newStatus: "approved" | "rejected" | "under_review") => {
    const { error } = await supabase.from("applications").update({ status: newStatus, reviewed_at: new Date().toISOString(), review_notes: notes || null }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked ${newStatus.replace("_"," ")}`);
    setOpen(null); setNotes(""); refetch();
  };

  const exportCsv = () => {
    const rows = [["Name","Email","Phone","Institution","Course","Department","Status","Submitted"]];
    filtered.forEach((a: any) => rows.push([a.full_name, a.email, a.phone, a.institution, a.course, a.departments?.name ?? "", a.status, a.submitted_at ?? ""].map((x) => String(x ?? ""))));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `applications-${Date.now()}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell role="admin">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">Applications</h1>
          <p className="mt-1 text-sm text-muted-foreground">Review, approve, or reject applicant submissions.</p>
        </div>
        <Button variant="outline" onClick={exportCsv}><Download className="mr-1.5 h-4 w-4" /> Export CSV</Button>
      </div>

      <Card className="mt-6 shadow-card">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input className="pl-9" placeholder="Search name, email, institution…" value={q} onChange={(e) => setQ(e.target.value)} />
            </div>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="submitted">Submitted</SelectItem>
                <SelectItem value="under_review">Under review</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="py-2 pr-3">Applicant</th><th className="py-2 pr-3">Institution</th><th className="py-2 pr-3">Department</th><th className="py-2 pr-3">Status</th><th className="py-2 pr-3">Submitted</th><th /></tr>
              </thead>
              <tbody>
                {filtered.map((a: any) => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-3 pr-3">
                      <div className="font-medium">{a.full_name ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{a.email ?? "—"}</div>
                    </td>
                    <td className="py-3 pr-3">
                      <div>{a.institution ?? "—"}</div>
                      <div className="text-xs text-muted-foreground">{a.course ?? ""}</div>
                    </td>
                    <td className="py-3 pr-3">{a.departments?.name ?? "—"}</td>
                    <td className="py-3 pr-3"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_CLS[a.status]}`}>{a.status.replace("_"," ")}</span></td>
                    <td className="py-3 pr-3 text-xs text-muted-foreground">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString(undefined,{dateStyle:"medium"}) : "—"}</td>
                    <td className="py-3 text-right"><Button variant="ghost" size="sm" onClick={() => { setOpen(a); setNotes(a.review_notes ?? ""); }}><Eye className="mr-1 h-4 w-4" /> Review</Button></td>
                  </tr>
                ))}
                {filtered.length === 0 && <tr><td colSpan={6} className="py-10 text-center text-muted-foreground">No applications match your filters.</td></tr>}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!open} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-2xl">
          {open && <ReviewBody app={open} notes={notes} setNotes={setNotes} updateStatus={updateStatus} />}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

function ReviewBody({ app, notes, setNotes, updateStatus }: any) {
  const { data: docs } = useQuery({
    queryKey: ["docs-admin", app.id],
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("*").eq("application_id", app.id);
      return data ?? [];
    },
  });

  const downloadDoc = async (path: string, name: string) => {
    const { data, error } = await supabase.storage.from("application-documents").createSignedUrl(path, 60);
    if (error) return toast.error(error.message);
    window.open(data.signedUrl, "_blank");
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-display">{app.full_name ?? "Applicant"}</DialogTitle>
      </DialogHeader>
      <div className="grid gap-4 md:grid-cols-2">
        <Info label="Email" value={app.email} /><Info label="Phone" value={app.phone} />
        <Info label="National ID" value={app.national_id} /><Info label="Institution" value={app.institution} />
        <Info label="Course" value={app.course} /><Info label="Year" value={app.year_of_study} />
        <Info label="Department" value={app.departments?.name} /><Info label="Period" value={app.attachment_periods?.name} />
        <Info label="Start" value={app.attachment_start} /><Info label="End" value={app.attachment_end} />
      </div>
      {app.motivation && <div className="mt-2"><div className="text-xs uppercase tracking-wider text-muted-foreground">Motivation</div><p className="mt-1 text-sm">{app.motivation}</p></div>}
      <div className="mt-3">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Documents</div>
        <div className="mt-1 flex flex-wrap gap-2">
          {(docs ?? []).map((d) => (
            <Button key={d.id} variant="outline" size="sm" onClick={() => downloadDoc(d.file_path, d.file_name)}>
              <Download className="mr-1 h-3.5 w-3.5" /> {d.doc_type}
            </Button>
          ))}
          {(docs ?? []).length === 0 && <span className="text-sm text-muted-foreground">No documents</span>}
        </div>
      </div>
      <div className="mt-4">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Reviewer notes</div>
        <Textarea className="mt-1.5" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <div className="mt-4 flex flex-wrap items-center justify-end gap-2 border-t pt-4">
        <Button variant="outline" onClick={() => updateStatus(app.id, "under_review")}>Mark under review</Button>
        <Button variant="destructive" onClick={() => updateStatus(app.id, "rejected")}>Reject</Button>
        <Button onClick={() => updateStatus(app.id, "approved")}>Approve</Button>
      </div>
    </>
  );
}
function Info({ label, value }: { label: string; value: any }) {
  return <div><div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div><div className="font-medium">{value || "—"}</div></div>;
}
