import * as React from "react";
import { useInView, useScroll, useTransform, MotionValue } from "framer-motion";

interface ScrollRevealOptions {
  threshold?: number;
  once?: boolean;
  margin?: string;
}

export const useScrollReveal = (options: ScrollRevealOptions = {}) => {
  const { threshold = 0.1, once = true, margin = "-50px" } = options;
  const ref = React.useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { 
    amount: threshold, 
    once,
    margin: margin as "-50px"
  });

  return { ref, isInView };
};

interface ParallaxOptions {
  offset?: number;
}

export const useParallax = (options: ParallaxOptions = {}): {
  ref: React.RefObject<HTMLDivElement>;
  y: MotionValue<number>;
} => {
  const { offset = 30 } = options;
  const ref = React.useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"]
  });

  const y = useTransform(scrollYProgress, [0, 1], [offset, -offset]);

  return { ref, y };
};

// Stagger children animation variants
export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    }
  }
};

export const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 24,
    scale: 0.96
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      type: "tween",
      ease: [0.16, 1, 0.3, 1],
      duration: 0.5
    }
  }
};

// Smooth reveal variants
export const revealVariants = {
  hidden: { 
    opacity: 0, 
    y: 32,
    filter: "blur(8px)"
  },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: "blur(0px)",
    transition: {
      type: "tween",
      ease: [0.16, 1, 0.3, 1],
      duration: 0.6
    }
  }
};
