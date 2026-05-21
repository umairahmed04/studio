'use client';

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQProps {
  content: {
    title?: string;
    items?: FAQItem[];
  };
}

export function CmsFAQ({ content }: FAQProps) {
  const items = content.items || [
    { question: 'Is this tool really free?', answer: 'Yes, our platform is 100% mission-led and free for all job seekers.' },
    { question: 'How does the ATS scan work?', answer: 'We use the Gemini 2.5 Flash model to audit your CV against industry-standard recruitment algorithms.' },
  ];

  return (
    <section className="py-24 bg-muted/5">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl font-headline font-bold mb-12 text-center">{content.title || 'Frequently Asked Questions'}</h2>
        <Accordion type="single" collapsible className="w-full">
          {items.map((item, i) => (
            <AccordionItem key={i} value={`item-${i}`} className="glass border-white/5 mb-4 rounded-xl px-4 overflow-hidden">
              <AccordionTrigger className="hover:no-underline font-bold text-left">{item.question}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
