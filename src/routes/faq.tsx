import { createFileRoute } from "@tanstack/react-router";
import { PublicLayout } from "@/components/site/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/faq")({
  component: FAQ,
  head: () => ({
    meta: [
      { title: "Frequently Asked Questions — KICD Attachment" },
      { name: "description", content: "Answers to common questions about applying for industrial attachment at KICD." },
    ],
  }),
});

const faqs = [
  { q: "Who is eligible to apply?", a: "Students currently enrolled in a recognized tertiary institution with an attachment requirement as part of their programme." },
  { q: "What documents do I need?", a: "A current CV, an introduction/recommendation letter from your institution, a copy of your National ID or Passport, and your latest academic transcripts." },
  { q: "How long is the attachment?", a: "Attachments typically run for 3 months and align with KICD's intake calendar (January–April, May–August, or September–December)." },
  { q: "Is the attachment paid?", a: "KICD attachment is non-paid; however, attachees receive professional mentorship and a certificate upon completion." },
  { q: "Can I save my application as a draft?", a: "Yes. You can save your progress at any step and return to complete and submit it before the application window closes." },
  { q: "How will I know if my application is approved?", a: "You'll see real-time status updates in your dashboard, and notifications will be sent to your registered email." },
];

function FAQ() {
  return (
    <PublicLayout>
      <section className="border-b bg-subtle">
        <div className="mx-auto max-w-4xl px-4 py-14 md:px-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-primary">Help center</div>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight md:text-5xl">Frequently asked questions</h1>
        </div>
      </section>
      <section className="mx-auto max-w-3xl px-4 py-12 md:px-6">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem value={`i${i}`} key={i}>
              <AccordionTrigger className="text-left font-display text-base font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>
    </PublicLayout>
  );
}
