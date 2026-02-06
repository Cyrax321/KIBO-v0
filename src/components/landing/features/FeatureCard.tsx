import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  category: string;
  title: string;
  description: string;
  accentColor?: "primary" | "success" | "warning";
  size?: "small" | "large";
  badge?: string;
  children?: React.ReactNode;
  delay?: number;
  className?: string;
}

const accentStyles = {
  primary: {
    label: "text-primary/80",
    gradient: "from-primary/[0.04]",
    glow: "bg-primary/5 group-hover:bg-primary/10",
    shadow: "hover:shadow-primary/10",
  },
  success: {
    label: "text-success/80",
    gradient: "from-success/[0.04]",
    glow: "bg-success/5 group-hover:bg-success/10",
    shadow: "hover:shadow-success/10",
  },
  warning: {
    label: "text-warning/80",
    gradient: "from-warning/[0.04]",
    glow: "bg-warning/5 group-hover:bg-warning/10",
    shadow: "hover:shadow-warning/10",
  },
};

const FeatureCard: React.FC<FeatureCardProps> = ({
  category,
  title,
  description,
  accentColor = "primary",
  size = "small",
  badge,
  children,
  delay = 0,
  className,
}) => {
  const accent = accentStyles[accentColor];
  const isLarge = size === "large";

  return (
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ 
        duration: 0.5, 
        delay, 
        ease: [0.25, 0.1, 0.25, 1] 
      }}
      whileHover={{ 
        y: -4, 
        transition: { duration: 0.25, ease: "easeOut" } 
      }}
      className={cn(
        "group relative rounded-3xl bg-gradient-to-br from-white/90 to-white/50 backdrop-blur-xl border border-white/50 cursor-pointer overflow-hidden transition-all duration-400 hover:shadow-xl hover:border-white/60",
        isLarge ? "p-8 sm:p-10" : "p-6 sm:p-8",
        accent.shadow,
        className
      )}
    >
      {/* Subtle gradient overlay */}
      <div className={cn(
        "absolute inset-0 bg-gradient-to-br to-transparent opacity-60",
        accent.gradient
      )} />
      
      {/* Ambient glow for large cards */}
      {isLarge && (
        <div className={cn(
          "absolute w-64 h-64 sm:w-80 sm:h-80 rounded-full blur-3xl transition-colors duration-600 pointer-events-none",
          accent.glow,
          category === "Core Feature" 
            ? "top-0 right-0 -translate-y-1/3 translate-x-1/3" 
            : "bottom-0 left-0 translate-y-1/3 -translate-x-1/3"
        )} />
      )}

      <div className="relative z-10 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-2.5 mb-5">
          <span className={cn(
            "text-[11px] font-semibold uppercase tracking-[0.12em]",
            accent.label
          )}>
            {category}
          </span>
          {badge && (
            <span className="text-[10px] font-semibold text-primary bg-primary/10 px-2.5 py-1 rounded-full leading-none">
              {badge}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className={cn(
          "font-bold text-foreground tracking-tight leading-tight",
          isLarge ? "text-2xl sm:text-3xl mb-3" : "text-xl mb-2.5"
        )}>
          {title}
        </h3>

        {/* Description */}
        <p className={cn(
          "text-muted-foreground leading-relaxed",
          isLarge ? "text-sm sm:text-base max-w-md" : "text-sm max-w-xs"
        )}>
          {description}
        </p>

        {/* Visual content */}
        {children && (
          <div className={cn(
            "mt-auto",
            isLarge ? "pt-8 sm:pt-10" : "pt-6"
          )}>
            {children}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export { FeatureCard };
