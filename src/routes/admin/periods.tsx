import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/periods")({ component: Periods });

function Periods() {
  const { data, refetch } = useQuery({ queryKey: ["periods-admin"], queryFn: async () => {
    const { data } = await supabase.from("attachment_periods").select("*").order("application_open", { ascending: false });
    return data ?? [];
  }});
  const [f, setF] = useState<any>({ name: "", start_date: "", end_date: "", application_open: "", application_close: "", total_slots: 0, status: "opening_soon" });

  const create = async () => {
    const { error } = await supabase.from("attachment_periods").insert(f);
    if (error) return toast.error(error.message);
    toast.success("Period created"); refetch();
    setF({ name: "", start_date: "", end_date: "", application_open: "", application_close: "", total_slots: 0, status: "opening_soon" });
  };
  const updateStatus = async (id: string, status: "open" | "closed" | "opening_soon") => {
    const { error } = await supabase.from("attachment_periods").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Updated"); refetch();
  };
  const del = async (id: string) => { await supabase.from("attachment_periods").delete().eq("id", id); refetch(); };

  return (
    <AppShell role="admin">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Attachment periods</h1>
      <p className="mt-1 text-sm text-muted-foreground">Open or close application windows and manage slot capacity.</p>

      <Card className="mt-6 shadow-card"><CardContent className="p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div><Label>Name</Label><Input className="mt-1.5" value={f.name} onChange={(e)=>setF({...f, name:e.target.value})} /></div>
          <div><Label>Start date</Label><Input type="date" className="mt-1.5" value={f.start_date} onChange={(e)=>setF({...f, start_date:e.target.value})} /></div>
          <div><Label>End date</Label><Input type="date" className="mt-1.5" value={f.end_date} onChange={(e)=>setF({...f, end_date:e.target.value})} /></div>
          <div><Label>Application opens</Label><Input type="datetime-local" className="mt-1.5" value={f.application_open} onChange={(e)=>setF({...f, application_open:e.target.value})} /></div>
          <div><Label>Application closes</Label><Input type="datetime-local" className="mt-1.5" value={f.application_close} onChange={(e)=>setF({...f, application_close:e.target.value})} /></div>
          <div><Label>Total slots</Label><Input type="number" className="mt-1.5" value={f.total_slots} onChange={(e)=>setF({...f, total_slots:Number(e.target.value)})} /></div>
        </div>
        <div className="mt-4"><Button onClick={create}><Plus className="mr-1.5 h-4 w-4" /> Add period</Button></div>
      </CardContent></Card>

      <div className="mt-6 space-y-3">
        {(data ?? []).map((p) => (
          <Card key={p.id} className="shadow-card"><CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="font-display text-lg font-semibold">{p.name}</div>
              <div className="text-xs text-muted-foreground">{p.start_date} → {p.end_date} · {p.total_slots} slots</div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={p.status} onValueChange={(v) => updateStatus(p.id, v)}>
                <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                  <SelectItem value="opening_soon">Opening soon</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="icon" onClick={() => del(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </AppShell>
  );
}
