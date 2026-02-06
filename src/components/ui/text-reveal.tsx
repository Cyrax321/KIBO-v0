import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface TextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  duration?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

const TextReveal: React.FC<TextRevealProps> = ({
  text,
  className,
  delay = 0,
  duration = 0.8,
  as: Component = "span",
}) => {
  const words = text.split(" ");

  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: 0.08, delayChildren: delay },
    }),
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
        duration,
      },
    },
  };

  return (
    <motion.div
      className={cn("flex flex-wrap", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, index) => (
        <motion.span
          key={index}
          className="mr-[0.25em] inline-block"
          variants={child}
        >
          <Component className="inline-block">{word}</Component>
        </motion.span>
      ))}
    </motion.div>
  );
};

interface TextRevealByCharacterProps {
  text: string;
  className?: string;
  delay?: number;
  as?: "h1" | "h2" | "h3" | "h4" | "p" | "span";
}

const TextRevealByCharacter: React.FC<TextRevealByCharacterProps> = ({
  text,
  className,
  delay = 0,
  as: Component = "span",
}) => {
  const letters = Array.from(text);

  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.03, delayChildren: delay },
    },
  };

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
    },
  };

  return (
    <motion.div
      className={cn("inline-block", className)}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {letters.map((letter, index) => (
        <motion.span key={index} className="inline-block" variants={child}>
          <Component className="inline-block">
            {letter === " " ? "\u00A0" : letter}
          </Component>
        </motion.span>
      ))}
    </motion.div>
  );
};

export { TextReveal, TextRevealByCharacter };
