import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AppShell } from "@/components/app/AppShell";
import { Card, CardContent } from "@/components/ui/card";
import { Megaphone } from "lucide-react";

export const Route = createFileRoute("/dashboard/notifications")({
  component: Notifs,
});

function Notifs() {
  const { data } = useQuery({
    queryKey: ["announcements"],
    queryFn: async () => {
      const { data } = await supabase.from("announcements").select("*").eq("published", true).order("created_at", { ascending: false });
      return data ?? [];
    },
  });
  return (
    <AppShell role="applicant">
      <h1 className="font-display text-2xl font-semibold md:text-3xl">Announcements</h1>
      <p className="mt-1 text-sm text-muted-foreground">Updates from the KICD attachment office.</p>
      <div className="mt-6 space-y-4">
        {(data ?? []).map((a) => (
          <Card key={a.id} className="shadow-card">
            <CardContent className="p-6">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-accent/20 text-accent-foreground"><Megaphone className="h-4 w-4" /></div>
                <div>
                  <div className="text-xs text-muted-foreground">{new Date(a.created_at).toLocaleDateString(undefined,{ dateStyle:"medium" })}</div>
                  <div className="font-display text-lg font-semibold">{a.title}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{a.body}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {(data ?? []).length === 0 && <div className="text-muted-foreground">No announcements yet.</div>}
      </div>
    </AppShell>
  );
}
