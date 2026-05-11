import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/app/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { CheckCircle2, FileUp, Save, Send, Trash2 } from "lucide-react";

export const Route = createFileRoute("/dashboard/application")({
  component: ApplicationPage,
});

const DOC_TYPES = [
  { key: "cv", label: "CV / Resume" },
  { key: "intro_letter", label: "Introduction Letter" },
  { key: "national_id", label: "National ID / Passport" },
  { key: "transcripts", label: "Academic Transcripts" },
];
const STEPS = ["Personal", "Institution", "Attachment", "Documents", "Review"];

function ApplicationPage() {
  const { user } = useAuth();
  const [step, setStep] = useState(0);
  const [appId, setAppId] = useState<string | null>(null);
  const [form, setForm] = useState<any>({
    full_name: "", phone: "", email: user?.email ?? "", national_id: "", gender: "", date_of_birth: "",
    institution: "", course: "", year_of_study: "",
    attachment_start: "", attachment_end: "", department_id: "", period_id: "", skills: "", motivation: "",
  });

  const { data: depts } = useQuery({ queryKey:["depts"], queryFn: async()=>{ const{data}=await supabase.from("departments").select("*").eq("active",true).order("name"); return data??[];} });
  const { data: periods } = useQuery({ queryKey:["periods"], queryFn: async()=>{ const{data}=await supabase.from("attachment_periods").select("*").in("status",["open","opening_soon"]).order("application_open",{ascending:false}); return data??[];} });
  const { data: existing } = useQuery({
    queryKey: ["my-app", user?.id], enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("applications").select("*").eq("user_id", user!.id).order("created_at",{ascending:false}).limit(1).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    if (existing) {
      setAppId(existing.id);
      setForm((f: any) => ({ ...f, ...existing }));
    }
  }, [existing]);

  const { data: docs, refetch: refetchDocs } = useQuery({
    queryKey: ["docs", appId],
    enabled: !!appId,
    queryFn: async () => {
      const { data } = await supabase.from("documents").select("*").eq("application_id", appId!);
      return data ?? [];
    },
  });

  const update = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const isReadOnly = existing?.status && existing.status !== "draft";

  const saveDraft = async () => {
    if (!user) return;
    const payload = { ...form, user_id: user.id, status: "draft" as const };
    Object.keys(payload).forEach((k) => { if ((payload as any)[k] === "") (payload as any)[k] = null; });
    if (appId) {
      const { error } = await supabase.from("applications").update(payload).eq("id", appId);
      if (error) return toast.error(error.message);
    } else {
      const { data, error } = await supabase.from("applications").insert(payload).select().single();
      if (error) return toast.error(error.message);
      setAppId(data.id);
    }
    toast.success("Draft saved");
  };

  const submit = async () => {
    if (!appId) { toast.error("Save a draft first"); return; }
    const required = ["full_name","phone","national_id","institution","course","year_of_study","attachment_start","attachment_end","department_id","period_id"];
    for (const k of required) if (!form[k]) return toast.error(`Missing: ${k.replace("_"," ")}`);
    if ((docs ?? []).length < 1) return toast.error("Please upload at least one document");
    const { error } = await supabase.from("applications").update({ status: "submitted", submitted_at: new Date().toISOString(), ...form }).eq("id", appId);
    if (error) return toast.error(error.message);
    toast.success("Application submitted!");
  };

  const uploadDoc = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    if (!user || !e.target.files?.[0]) return;
    const file = e.target.files[0];
    if (file.size > 5 * 1024 * 1024) return toast.error("Max file size is 5MB");
    let id = appId;
    if (!id) {
      // ensure draft exists
      const { data } = await supabase.from("applications").insert({ user_id: user.id, status: "draft" }).select().single();
      if (data) { id = data.id; setAppId(data.id); }
    }
    if (!id) return;
    const path = `${user.id}/${id}/${docType}-${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("application-documents").upload(path, file);
    if (error) return toast.error(error.message);
    await supabase.from("documents").insert({ application_id: id, user_id: user.id, doc_type: docType, file_path: path, file_name: file.name });
    toast.success(`${docType} uploaded`);
    refetchDocs();
  };

  const deleteDoc = async (docId: string, path: string) => {
    await supabase.storage.from("application-documents").remove([path]);
    await supabase.from("documents").delete().eq("id", docId);
    toast.success("Removed");
    refetchDocs();
  };

  return (
    <AppShell role="applicant">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold md:text-3xl">Attachment application</h1>
          <p className="mt-1 text-sm text-muted-foreground">Complete each section and submit when ready.</p>
        </div>
        {existing?.status && <Badge variant="secondary" className="capitalize">{existing.status.replace("_"," ")}</Badge>}
      </div>

      {/* Stepper */}
      <div className="mb-6 grid grid-cols-5 gap-2">
        {STEPS.map((s, i) => (
          <button key={s} onClick={() => setStep(i)} className={`rounded-md border px-2 py-2 text-left text-xs transition ${i===step ? "border-primary bg-primary/5 text-primary" : "hover:bg-muted"}`}>
            <div className="font-mono text-[10px] uppercase tracking-wider opacity-60">Step {i+1}</div>
            <div className="font-medium">{s}</div>
          </button>
        ))}
      </div>

      <Card className="shadow-card">
        <CardContent className="p-6">
          {isReadOnly && <div className="mb-4 rounded-md border border-warning bg-warning/10 p-3 text-sm">Your application has been submitted. Editing is locked.</div>}
          {step === 0 && (
            <Grid>
              <Field label="Full name" v={form.full_name} on={(v)=>update("full_name",v)} ro={isReadOnly} />
              <Field label="Phone" v={form.phone} on={(v)=>update("phone",v)} ro={isReadOnly} />
              <Field label="Email" v={form.email} on={(v)=>update("email",v)} ro={isReadOnly} />
              <Field label="National ID / Passport" v={form.national_id} on={(v)=>update("national_id",v)} ro={isReadOnly} />
              <SelectField label="Gender" v={form.gender} on={(v)=>update("gender",v)} options={[["male","Male"],["female","Female"],["other","Other"]]} ro={isReadOnly}/>
              <Field label="Date of birth" type="date" v={form.date_of_birth ?? ""} on={(v)=>update("date_of_birth",v)} ro={isReadOnly} />
            </Grid>
          )}
          {step === 1 && (
            <Grid>
              <Field label="Institution" v={form.institution} on={(v)=>update("institution",v)} ro={isReadOnly} />
              <Field label="Course / Programme" v={form.course} on={(v)=>update("course",v)} ro={isReadOnly} />
              <SelectField label="Year of study" v={form.year_of_study} on={(v)=>update("year_of_study",v)} options={[["1","Year 1"],["2","Year 2"],["3","Year 3"],["4","Year 4"],["graduate","Graduate"]]} ro={isReadOnly}/>
            </Grid>
          )}
          {step === 2 && (
            <>
              <Grid>
                <SelectField label="Attachment period" v={form.period_id} on={(v)=>update("period_id",v)} options={(periods??[]).map((p)=>[p.id,p.name])} ro={isReadOnly}/>
                <SelectField label="Preferred department" v={form.department_id} on={(v)=>update("department_id",v)} options={(depts??[]).map((d)=>[d.id,d.name])} ro={isReadOnly}/>
                <Field label="Attachment start" type="date" v={form.attachment_start ?? ""} on={(v)=>update("attachment_start",v)} ro={isReadOnly} />
                <Field label="Attachment end" type="date" v={form.attachment_end ?? ""} on={(v)=>update("attachment_end",v)} ro={isReadOnly} />
              </Grid>
              <div className="mt-4 grid gap-4">
                <div>
                  <Label>Skills & interests</Label>
                  <Textarea className="mt-1.5" rows={3} value={form.skills ?? ""} onChange={(e)=>update("skills",e.target.value)} disabled={isReadOnly} />
                </div>
                <div>
                  <Label>Motivation statement</Label>
                  <Textarea className="mt-1.5" rows={5} value={form.motivation ?? ""} onChange={(e)=>update("motivation",e.target.value)} disabled={isReadOnly} placeholder="Why do you want to do your attachment at KICD?" />
                </div>
              </div>
            </>
          )}
          {step === 3 && (
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Upload PDF or image files (max 5 MB each).</p>
              {DOC_TYPES.map((d) => {
                const got = (docs ?? []).filter((x) => x.doc_type === d.key);
                return (
                  <div key={d.key} className="flex items-center justify-between gap-4 rounded-md border p-4">
                    <div>
                      <div className="font-medium">{d.label}</div>
                      <div className="mt-1 space-y-1">
                        {got.length === 0 && <div className="text-xs text-muted-foreground">Not uploaded</div>}
                        {got.map((g) => (
                          <div key={g.id} className="flex items-center gap-2 text-xs">
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" /> {g.file_name}
                            {!isReadOnly && <button onClick={()=>deleteDoc(g.id, g.file_path)} className="text-destructive hover:underline"><Trash2 className="h-3 w-3" /></button>}
                          </div>
                        ))}
                      </div>
                    </div>
                    {!isReadOnly && (
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border bg-card px-3 py-2 text-sm hover:bg-muted">
                        <FileUp className="h-4 w-4" /> Upload
                        <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={(e)=>uploadDoc(e, d.key)} />
                      </label>
                    )}
                  </div>
                );
              })}
            </div>
          )}
          {step === 4 && (
            <div className="space-y-4 text-sm">
              <p className="text-muted-foreground">Review your details before submitting.</p>
              <ReviewBlock title="Personal" rows={[["Name", form.full_name],["Phone", form.phone],["Email", form.email],["National ID", form.national_id]]} />
              <ReviewBlock title="Institution" rows={[["Institution", form.institution],["Course", form.course],["Year", form.year_of_study]]} />
              <ReviewBlock title="Attachment" rows={[
                ["Department", depts?.find((d)=>d.id===form.department_id)?.name ?? "—"],
                ["Period", periods?.find((p)=>p.id===form.period_id)?.name ?? "—"],
                ["Start", form.attachment_start ?? "—"],["End", form.attachment_end ?? "—"],
              ]} />
              <ReviewBlock title="Documents" rows={[["Uploaded", String((docs ?? []).length)]]} />
            </div>
          )}

          <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t pt-5">
            <div className="flex gap-2">
              <Button variant="outline" disabled={step===0} onClick={()=>setStep(s=>Math.max(0,s-1))}>Back</Button>
              <Button variant="outline" disabled={step===STEPS.length-1} onClick={()=>setStep(s=>Math.min(STEPS.length-1,s+1))}>Next</Button>
            </div>
            <div className="flex gap-2">
              {!isReadOnly && <Button variant="secondary" onClick={saveDraft}><Save className="mr-1.5 h-4 w-4" /> Save draft</Button>}
              {!isReadOnly && step === STEPS.length - 1 && <Button onClick={submit}><Send className="mr-1.5 h-4 w-4" /> Submit application</Button>}
            </div>
          </div>
        </CardContent>
      </Card>
    </AppShell>
  );
}

function Grid({ children }: { children: React.ReactNode }) { return <div className="grid gap-4 md:grid-cols-2">{children}</div>; }
function Field({ label, v, on, type = "text", ro }: { label: string; v: string; on: (v: string) => void; type?: string; ro?: boolean }) {
  return (<div><Label>{label}</Label><Input type={type} className="mt-1.5" value={v ?? ""} onChange={(e)=>on(e.target.value)} disabled={ro} /></div>);
}
function SelectField({ label, v, on, options, ro }: { label: string; v: string; on: (v: string) => void; options: any[]; ro?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <Select value={v ?? ""} onValueChange={on} disabled={ro}>
        <SelectTrigger className="mt-1.5"><SelectValue placeholder={`Select ${label.toLowerCase()}`} /></SelectTrigger>
        <SelectContent>{options.map(([val, lbl]) => <SelectItem key={val} value={val}>{lbl}</SelectItem>)}</SelectContent>
      </Select>
    </div>
  );
}
function ReviewBlock({ title, rows }: { title: string; rows: [string, any][] }) {
  return (
    <div className="rounded-md border p-4">
      <div className="font-display text-sm font-semibold">{title}</div>
      <dl className="mt-2 grid grid-cols-2 gap-2">
        {rows.map(([k, val]) => (<div key={k}><dt className="text-xs uppercase tracking-wider text-muted-foreground">{k}</dt><dd className="text-sm">{val || "—"}</dd></div>))}
      </dl>
    </div>
  );
}
