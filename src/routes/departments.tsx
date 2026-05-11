import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2 } from "lucide-react";

export const Route = createFileRoute("/departments")({
  component: DepartmentsPage,
  head: () => ({
    meta: [
      { title: "KICD Departments — Attachment Slots & Roles" },
      { name: "description", content: "Browse KICD departments offering industrial attachment opportunities and view available slots for the current intake." },
    ],
  }),
});

function DepartmentsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["departments-public"],
    queryFn: async () => {
      const { data } = await supabase.from("departments").select("*").eq("active", true).order("name");
      return data ?? [];
    },
  });
  return (
    <PublicLayout>
      <section className="border-b bg-subtle">
        <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Departments</div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">Find a department that fits your career path.</h1>
          <p className="mt-3 max-w-2xl text-muted-foreground">Each department offers a limited number of attachment slots per intake.</p>
        </div>
      </section>
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        {isLoading ? (
          <div className="text-muted-foreground">Loading departments…</div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {data!.map((d) => (
              <Card key={d.id} className="shadow-card transition hover:shadow-elegant">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary">{d.slots_total} slots</Badge>
                  </div>
                  <div className="mt-4 font-display text-lg font-semibold">{d.name}</div>
                  <p className="mt-2 text-sm text-muted-foreground">{d.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
    </PublicLayout>
  );
}
