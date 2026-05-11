import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/departments")({ component: Depts });

function Depts() {
  const { data, refetch } = useQuery({ queryKey: ["depts-admin"], queryFn: async () => {
    const { data } = await supabase.from("departments").select("*").order("name");
    return data ?? [];
  }});
  const [f, setF] = useState({ name: "", description: "", slots_total: 0 });
  const create = async () => {
    if (!f.name) return toast.error("Name required");
    const { error } = await supabase.from("departments").insert({ ...f, active: true });
    if (error) return toast.error(error.message);
    toast.success("Created"); setF({ name: "", description: "", slots_total: 0 }); refetch();
  };
  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("departments").update(patch).eq("id", id);
    if (error) return toast.error(error.message);
    refetch();
  };
  const del = async (id: string) => { await supabase.from("departments").delete().eq("id", id); refetch(); };

  return (
    <AppShell role="admin">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Departments</h1>
      <p className="mt-1 text-sm text-muted-foreground">Manage departments and their slot allocations.</p>

      <Card className="mt-6 shadow-card"><CardContent className="p-6">
        <div className="grid gap-3 md:grid-cols-3">
          <div><Label>Name</Label><Input className="mt-1.5" value={f.name} onChange={(e)=>setF({...f, name:e.target.value})} /></div>
          <div className="md:col-span-2"><Label>Description</Label><Input className="mt-1.5" value={f.description} onChange={(e)=>setF({...f, description:e.target.value})} /></div>
          <div><Label>Slots</Label><Input type="number" className="mt-1.5" value={f.slots_total} onChange={(e)=>setF({...f, slots_total:Number(e.target.value)})} /></div>
        </div>
        <Button className="mt-4" onClick={create}><Plus className="mr-1.5 h-4 w-4" /> Add department</Button>
      </CardContent></Card>

      <div className="mt-6 space-y-3">
        {(data ?? []).map((d) => (
          <Card key={d.id} className="shadow-card"><CardContent className="p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex-1">
                <Input className="font-display text-base font-semibold" defaultValue={d.name} onBlur={(e) => update(d.id, { name: e.target.value })} />
                <Textarea className="mt-2" rows={2} defaultValue={d.description ?? ""} onBlur={(e) => update(d.id, { description: e.target.value })} />
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2"><Label className="text-xs">Slots</Label><Input type="number" className="w-20" defaultValue={d.slots_total} onBlur={(e) => update(d.id, { slots_total: Number(e.target.value) })} /></div>
                <div className="flex items-center gap-2"><Label className="text-xs">Active</Label><Switch checked={d.active} onCheckedChange={(v) => update(d.id, { active: v })} /></div>
                <Button variant="ghost" size="icon" onClick={() => del(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </AppShell>
  );
}
