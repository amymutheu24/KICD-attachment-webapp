import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { BookOpen, Building2, Compass, Target } from "lucide-react";

export const Route = createFileRoute("/about")({
  component: About,
  head: () => ({
    meta: [
      { title: "About the KICD Attachment Programme" },
      { name: "description", content: "Learn about industrial attachment opportunities at the Kenya Institute of Curriculum Development — our mission, departments, and what to expect." },
    ],
  }),
});

function About() {
  return (
    <PublicLayout>
      <section className="border-b bg-subtle">
        <div className="mx-auto max-w-4xl px-4 py-16 md:px-6 md:py-20">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">About the programme</div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">Building Kenya's next generation of education professionals.</h1>
          <p className="mt-5 text-lg leading-relaxed text-muted-foreground">
            The Kenya Institute of Curriculum Development (KICD) industrial attachment programme offers
            students hands-on exposure across curriculum design, educational media, ICT, quality
            assurance, and corporate services. Successful applicants gain practical experience inside
            Kenya's premier curriculum body.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-6 md:grid-cols-2">
          {[
            { icon: <Target className="h-5 w-5" />, t: "Our mission", d: "To equip learners with practical skills aligned with Kenya's competency-based curriculum." },
            { icon: <BookOpen className="h-5 w-5" />, t: "Learning environment", d: "Mentorship from professionals shaping national education policy and content." },
            { icon: <Building2 className="h-5 w-5" />, t: "Departments", d: "Six functional areas: curriculum, media, ICT, QA, finance, and HR." },
            { icon: <Compass className="h-5 w-5" />, t: "Eligibility", d: "Open to students in tertiary institutions with an attachment requirement." },
          ].map((b) => (
            <Card key={b.t} className="shadow-card">
              <CardContent className="flex gap-4 p-6">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">{b.icon}</div>
                <div>
                  <div className="font-display text-lg font-semibold">{b.t}</div>
                  <p className="mt-1 text-sm text-muted-foreground">{b.d}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </PublicLayout>
  );
}
