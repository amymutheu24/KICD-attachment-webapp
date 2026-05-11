import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Phone } from "lucide-react";

export const Route = createFileRoute("/contact")({
  component: Contact,
  head: () => ({
    meta: [
      { title: "Contact KICD Attachment Office" },
      { name: "description", content: "Reach the KICD attachment office for support with your application." },
    ],
  }),
});

function Contact() {
  return (
    <PublicLayout>
      <section className="border-b bg-subtle">
        <div className="mx-auto max-w-4xl px-4 py-14 md:px-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Contact</div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">We're here to help.</h1>
          <p className="mt-3 text-muted-foreground">Reach the Attachment Office for assistance with applications, documents, or status enquiries.</p>
        </div>
      </section>
      <section className="mx-auto max-w-4xl px-4 py-12 md:px-6">
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: <MapPin className="h-5 w-5" />, t: "Office", d: "Desai Road, off Murang'a Road, Nairobi, Kenya" },
            { icon: <Phone className="h-5 w-5" />, t: "Phone", d: "+254 (0)20 318 6900" },
            { icon: <Mail className="h-5 w-5" />, t: "Email", d: "attachments@kicd.ac.ke" },
          ].map((c) => (
            <Card key={c.t} className="shadow-card">
              <CardContent className="p-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/10 text-primary">{c.icon}</div>
                <div className="mt-4 font-display text-base font-semibold">{c.t}</div>
                <p className="mt-1 text-sm text-muted-foreground">{c.d}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
