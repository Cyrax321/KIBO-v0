import * as React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "What is Kibo?",
    answer:
      "Kibo is your all-in-one career command center. Track applications, master coding challenges, and stay motivated with gamification.",
  },
  {
    question: "Is it free?",
    answer:
      "Yes! Free tier includes app tracking, problem stats, and streaks. Premium unlocks advanced analytics and unlimited history.",
  },
  {
    question: "How does XP work?",
    answer:
      "Every action earns XP – solving problems, updating apps, maintaining streaks. Level up to unlock achievements and badges!",
  },
  {
    question: "What is CS Arena?",
    answer:
      "CS Arena is our built-in coding practice platform with 500+ curated problems, real-time IDE, and instant feedback. No external tools needed.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Absolutely. All data is encrypted and never shared. You have full control to export or delete anytime.",
  },
  {
    question: "Works on mobile?",
    answer:
      "Yes! Fully responsive on all devices. Check your streaks and update applications from anywhere.",
  },
];

interface FAQSectionProps {
  className?: string;
}

export const FAQSection: React.FC<FAQSectionProps> = ({ className }) => {
  return (
    <section className={`py-24 px-6 ${className || ""}`}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Questions? Answered.
          </h2>
          <p className="text-muted-foreground">
            Quick answers to get you started.
          </p>
        </div>

        {/* FAQ Accordion - Clean aligned layout */}
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="border-b border-border/50 last:border-b-0"
            >
              <AccordionTrigger className="text-left text-base font-medium text-foreground py-4 hover:no-underline hover:text-primary transition-colors">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        {/* Still have questions - Compact */}
        <div className="mt-10 text-center">
          <p className="text-muted-foreground text-sm">
            Still curious?{" "}
            <a
              href="mailto:support@kibo.app"
              className="text-primary font-medium hover:underline"
            >
              Reach out to us →
            </a>
          </p>
        </div>
      </div>
    </section>
  );
};
