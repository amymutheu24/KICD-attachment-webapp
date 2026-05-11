import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth-context";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/admin/announcements")({ component: Ann });

function Ann() {
  const { user } = useAuth();
  const { data, refetch } = useQuery({ queryKey: ["ann-admin"], queryFn: async () => {
    const { data } = await supabase.from("announcements").select("*").order("created_at",{ ascending:false });
    return data ?? [];
  }});
  const [f, setF] = useState({ title: "", body: "", published: true });

  const create = async () => {
    if (!f.title || !f.body) return toast.error("Title and body required");
    const { error } = await supabase.from("announcements").insert({ ...f, created_by: user?.id });
    if (error) return toast.error(error.message);
    toast.success("Published"); setF({ title:"", body:"", published:true }); refetch();
  };
  const update = async (id: string, patch: any) => {
    const { error } = await supabase.from("announcements").update(patch).eq("id", id);
    if (error) return toast.error(error.message); refetch();
  };
  const del = async (id: string) => { await supabase.from("announcements").delete().eq("id", id); refetch(); };

  return (
    <AppShell role="admin">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Announcements</h1>
      <p className="mt-1 text-sm text-muted-foreground">Publish notices visible on the public site and applicant dashboards.</p>

      <Card className="mt-6 shadow-card"><CardContent className="p-6">
        <div><Label>Title</Label><Input className="mt-1.5" value={f.title} onChange={(e)=>setF({...f, title:e.target.value})} /></div>
        <div className="mt-3"><Label>Body</Label><Textarea className="mt-1.5" rows={3} value={f.body} onChange={(e)=>setF({...f, body:e.target.value})} /></div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-2"><Switch checked={f.published} onCheckedChange={(v) => setF({...f, published:v})} /><Label>Published</Label></div>
          <Button onClick={create}><Plus className="mr-1.5 h-4 w-4" /> Add announcement</Button>
        </div>
      </CardContent></Card>

      <div className="mt-6 space-y-3">
        {(data ?? []).map((a) => (
          <Card key={a.id} className="shadow-card"><CardContent className="p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <Input className="font-display text-base font-semibold" defaultValue={a.title} onBlur={(e)=>update(a.id, { title:e.target.value })} />
                <Textarea className="mt-2" rows={2} defaultValue={a.body} onBlur={(e)=>update(a.id, { body:e.target.value })} />
                <div className="mt-2 text-xs text-muted-foreground">{new Date(a.created_at).toLocaleString()}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <div className="flex items-center gap-2"><Label className="text-xs">Published</Label><Switch checked={a.published} onCheckedChange={(v)=>update(a.id, { published:v })} /></div>
                <Button variant="ghost" size="icon" onClick={()=>del(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </div>
          </CardContent></Card>
        ))}
      </div>
    </AppShell>
  );
}
