import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface AuroraBackgroundProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  showRadialGradient?: boolean;
}

const AuroraBackground: React.FC<AuroraBackgroundProps> = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background transition-bg",
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
          className={cn(
            "pointer-events-none absolute -inset-[10px] opacity-50",
            "[--aurora:repeating-linear-gradient(100deg,hsl(262.1_83.3%_57.8%_/_0.1)_10%,hsl(280_80%_60%_/_0.15)_15%,hsl(160_84%_39%_/_0.1)_20%,hsl(262.1_83.3%_57.8%_/_0.05)_25%,transparent_30%)]",
            "[background-image:var(--aurora)]",
            "[background-size:300%_300%]",
            "[background-position:50%_50%]",
            "animate-[aurora_60s_linear_infinite]",
            "blur-[60px]",
            "after:content-['']",
            "after:absolute",
            "after:inset-0",
            "after:[background-image:var(--aurora)]",
            "after:[background-size:200%_200%]",
            "after:animate-[aurora_30s_linear_infinite_reverse]",
            "after:blur-[80px]",
            "after:opacity-50"
          )}
        />
      </div>
      {showRadialGradient && (
        <div className="absolute inset-0 bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]" />
      )}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

export { AuroraBackground };
