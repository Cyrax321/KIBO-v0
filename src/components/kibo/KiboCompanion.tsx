import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import kiboLogo from "@/assets/kibo-logo.png";

// Lazy load the 3D component
const KiboMascot3D = React.lazy(() => 
  import("@/components/kibo/KiboMascot3D").then(module => ({ 
    default: module.KiboMascot3D 
  }))
);

type KiboState = "idle" | "focus" | "victory" | "thinking";

interface KiboCompanionProps {
  state?: KiboState;
  className?: string;
}

const KiboCompanion: React.FC<KiboCompanionProps> = ({
  state = "idle",
  className,
}) => {
  const [isMinimized, setIsMinimized] = React.useState(false);

  return (
    <AnimatePresence>
      {!isMinimized ? (
        <motion.div
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={cn(
            "fixed bottom-6 right-6 z-50",
            className
          )}
        >
          {/* Kibo Container */}
          <div className="relative">
            {/* Close/Minimize button */}
            <button
              onClick={() => setIsMinimized(true)}
              className="absolute -right-2 -top-2 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm text-muted-foreground shadow-sm transition-colors hover:bg-white hover:text-foreground"
            >
              <X className="h-3 w-3 stroke-[1.5]" />
            </button>

            {/* 3D Mascot Container */}
            <motion.div
              animate={
                state === "idle"
                  ? { y: [0, -8, 0] }
                  : state === "victory"
                  ? { rotate: [0, -5, 5, 0], scale: [1, 1.1, 1] }
                  : {}
              }
              transition={{
                repeat: state === "idle" ? Infinity : 0,
                duration: state === "idle" ? 3 : 0.5,
                ease: "easeInOut",
              }}
              className="relative h-32 w-32 overflow-hidden rounded-2xl border border-white/20 bg-white/40 backdrop-blur-xl shadow-lg"
            >
              <React.Suspense fallback={
                <div className="flex h-full w-full items-center justify-center">
                  <img src={kiboLogo} alt="Kibo" className="h-16 w-16 animate-pulse" />
                </div>
              }>
                <KiboMascot3D className="w-full h-full" />
              </React.Suspense>

              {/* State indicator */}
              <div className="absolute bottom-2 left-2 flex items-center gap-1.5">
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    state === "idle" && "bg-success animate-pulse",
                    state === "focus" && "bg-warning",
                    state === "victory" && "bg-primary animate-pulse",
                    state === "thinking" && "bg-muted-foreground animate-pulse"
                  )}
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      ) : (
        /* Minimized state - small floating button with Kibo logo */
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          onClick={() => setIsMinimized(false)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-white/80 backdrop-blur-xl border border-white/20 shadow-lg transition-transform hover:scale-110"
        >
          <img src={kiboLogo} alt="Kibo" className="h-10 w-10" />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

export { KiboCompanion };
