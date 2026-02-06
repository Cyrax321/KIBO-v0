import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const steps = [
  {
    number: "01",
    title: "Sign up in seconds",
    description: "Create your free account. No credit card needed.",
  },
  {
    number: "02",
    title: "Track your progress",
    description: "Add applications, log coding practice, build streaks.",
  },
  {
    number: "03",
    title: "Level up daily",
    description: "Earn XP, unlock achievements, and watch your garden grow.",
  },
  {
    number: "04",
    title: "Land the role",
    description: "Stay consistent, stay organized, get hired.",
  },
];

interface HowItWorksSectionProps {
  className?: string;
}

export const HowItWorksSection: React.FC<HowItWorksSectionProps> = ({ className }) => {
  return (
    <section className={cn("py-24 bg-muted/30", className)}>
      <div className="container mx-auto px-6 lg:px-8 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            How It Works
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.08 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground"
          >
            Four steps to your dream job
          </motion.h2>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-border -translate-x-4" />
              )}
              
              {/* Step content */}
              <div className="text-center lg:text-left">
                <span className="inline-block text-5xl font-bold text-primary/20 mb-4">
                  {step.number}
                </span>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {step.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
