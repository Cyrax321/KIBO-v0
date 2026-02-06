import * as React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShimmerButtonProps {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = "rgba(255, 255, 255, 0.3)",
      shimmerSize = "0.1em",
      shimmerDuration = "2s",
      borderRadius = "0.75rem",
      background = "hsl(var(--primary))",
      className,
      children,
      onClick,
      disabled,
      type = "button",
      ...props
    },
    ref
  ) => {
    return (
      <motion.button
        ref={ref}
        type={type}
        onClick={onClick}
        disabled={disabled}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden whitespace-nowrap px-8 text-base font-semibold text-primary-foreground shadow-lg transition-all duration-300",
          "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/30 before:to-transparent",
          "hover:shadow-xl hover:shadow-primary/25",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        style={{
          background,
          borderRadius,
        }}
      >
        <span className="relative z-10 flex items-center gap-2">{children}</span>
      </motion.button>
    );
  }
);

ShimmerButton.displayName = "ShimmerButton";

export { ShimmerButton };
