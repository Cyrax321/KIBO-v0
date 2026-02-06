import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

interface CTASectionProps {
  className?: string;
}

const CTASection: React.FC<CTASectionProps> = ({ className }) => {
  return (
    <section className={cn("py-24 bg-background", className)}>
      <div className="container mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary/5 via-white/60 to-success/5 backdrop-blur-xl border border-white/30 shadow-xl p-12 lg:p-20"
        >
          {/* Background decorations */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-success/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          {/* Grid pattern */}
          <div 
            className="absolute inset-0 opacity-[0.015]"
            style={{
              backgroundImage: `radial-gradient(hsl(var(--foreground)) 1px, transparent 1px)`,
              backgroundSize: '32px 32px',
            }}
          />

          {/* Content */}
          <div className="relative z-10 max-w-3xl mx-auto text-center">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center rounded-full bg-white/80 border border-white/40 px-5 py-2 mb-8 shadow-sm"
            >
              <span className="text-sm font-medium text-foreground">Free to start, no credit card required</span>
            </motion.div>

            <h2 className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Ready to launch<br />
              <span className="text-primary">your career?</span>
            </h2>
            
            <p className="mx-auto mb-10 max-w-xl text-lg text-muted-foreground leading-relaxed">
              Join thousands of engineers who have transformed their job search with Kibo. 
              Your dream role is closer than you think.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex h-14 items-center justify-center gap-2 rounded-xl bg-primary px-10 text-base font-semibold text-primary-foreground shadow-lg shadow-primary/25 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                >
                  Get Started Free
                  <ArrowRight className="h-5 w-5 stroke-[1.5]" />
                </motion.button>
              </Link>
              <Link to="/demo">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="inline-flex h-14 items-center justify-center rounded-xl border border-border bg-white/70 backdrop-blur-sm px-10 text-base font-medium text-foreground transition-all hover:bg-white"
                >
                  Watch Demo
                </motion.button>
              </Link>
            </div>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              className="mt-12 flex flex-wrap items-center justify-center gap-6 text-sm text-muted-foreground"
            >
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                Free forever plan
              </span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                No credit card needed
              </span>
              <span className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-success" />
                Cancel anytime
              </span>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export { CTASection };
