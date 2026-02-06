import * as React from "react";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { TextReveal } from "@/components/ui/text-reveal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import kiboLogo from "@/assets/kibo-logo.png";

// Lazy load the 3D component with delayed mount
const KiboMascot3D = React.lazy(() => 
  import("@/components/kibo/KiboMascot3D").then(module => ({ 
    default: module.KiboMascot3D 
  }))
);

interface HeroSectionProps {
  className?: string;
}

const HeroSection: React.FC<HeroSectionProps> = ({ className }) => {
  // Delay 3D component mount to prioritize text content
  const [show3D, setShow3D] = React.useState(false);
  
  React.useEffect(() => {
    // Wait for first paint + small delay to prioritize text
    const timer = setTimeout(() => setShow3D(true), 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section
      className={cn(
        "relative min-h-screen overflow-hidden bg-background",
        className
      )}
    >
      {/* Subtle grid pattern */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '80px 80px',
        }}
      />

      {/* Gradient orbs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-success/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4" />

      <div className="container relative z-10 mx-auto flex min-h-screen items-center px-6 pt-20 pb-24 lg:px-12">
        <div className="grid w-full items-center gap-12 lg:grid-cols-2 lg:gap-16">
          
          {/* Left side - Text content */}
          <div className="flex flex-col justify-center">
            {/* Brand Logo */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <motion.div 
                className="relative inline-flex items-center gap-3"
                whileHover={{ scale: 1.02 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <img src={kiboLogo} alt="Kibo" className="h-16 w-16 sm:h-20 sm:w-20 lg:h-24 lg:w-24 rounded-2xl shadow-lg" />
                <span className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter bg-gradient-to-br from-primary via-primary to-primary/50 bg-clip-text text-transparent">
                  kibo
                </span>
                <motion.span 
                  className="absolute -top-2 -right-4 text-sm font-bold text-primary/70"
                  animate={{ y: [0, -3, 0] }}
                  transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                >
                  
                </motion.span>
              </motion.div>
            </motion.div>
            
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-2 text-sm font-medium text-primary shadow-sm">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-primary"></span>
                </span>
                10,000+ engineers already leveling up
              </span>
            </motion.div>

            {/* Main headline */}
            <div className="mb-6 space-y-1">
              <TextReveal
                text="Find your"
                className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl"
                delay={0.2}
              />
              <TextReveal
                text="flow state"
                className="text-4xl font-bold tracking-tight text-primary sm:text-5xl lg:text-6xl"
                delay={0.4}
              />
            </div>

            {/* Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mb-10 max-w-lg text-base text-muted-foreground leading-relaxed sm:text-lg"
            >
              The all-in-one workspace for ambitious engineers. Track every application, 
              master coding challenges, and turn your job search into a winning strategy.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="flex flex-wrap items-center gap-4"
            >
              <Link to="/signup">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-7 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90"
                >
                  Start Free
                  <ArrowRight className="h-4 w-4 stroke-[2]" />
                </motion.button>
              </Link>
              <Link to="/login">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="inline-flex h-12 items-center justify-center gap-2 rounded-xl border-2 border-border bg-white px-7 text-sm font-medium text-foreground transition-colors hover:border-primary/40 hover:bg-muted/50"
                >
                  Login
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.5 }}
              className="mt-12 flex flex-wrap items-center gap-8 sm:gap-10"
            >
              <TooltipProvider delayDuration={200}>
                {[
                  { value: "10K+", label: "Engineers", hasTooltip: false },
                  { value: "500+", label: "Problems", hasTooltip: false },
                  { value: "95%", label: "Success Rate", hasTooltip: true, tooltip: "Based on 2025 user placement data" },
                ].map((stat, index) => (
                  <React.Fragment key={stat.label}>
                    {index > 0 && (
                      <div className="hidden h-8 w-px bg-border/50 sm:block" />
                    )}
                    {stat.hasTooltip ? (
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="cursor-help transition-colors hover:text-primary">
                            <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{stat.value}</div>
                            <div className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</div>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="bottom" className="bg-foreground text-background text-xs">
                          <p>{stat.tooltip}</p>
                        </TooltipContent>
                      </Tooltip>
                    ) : (
                      <div>
                        <div className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">{stat.value}</div>
                        <div className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</div>
                      </div>
                    )}
                  </React.Fragment>
                ))}
              </TooltipProvider>
            </motion.div>
          </div>

          {/* Right side - 3D Kibo Mascot */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7, type: "spring", stiffness: 100 }}
            className="relative hidden lg:flex lg:items-center lg:justify-center"
          >
            <div className="relative w-full max-w-md aspect-square">
              {/* Glow effect behind */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/15 via-primary/5 to-success/10 blur-3xl scale-110" />
              
              {/* 3D Canvas Container */}
              <div className="relative w-full h-full">
                {show3D ? (
                  <React.Suspense fallback={
                    <div className="w-full h-full flex items-center justify-center">
                      <motion.div
                        animate={{ scale: [1, 1.03, 1] }}
                        transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                        className="h-28 w-28 rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 shadow-xl flex items-center justify-center overflow-hidden"
                      >
                        <img src={kiboLogo} alt="Kibo" className="h-20 w-20" />
                      </motion.div>
                    </div>
                  }>
                    <KiboMascot3D className="w-full h-full" />
                  </React.Suspense>
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <motion.div
                      animate={{ scale: [1, 1.03, 1] }}
                      transition={{ repeat: Infinity, duration: 2.5, ease: "easeInOut" }}
                      className="h-28 w-28 rounded-3xl bg-white/90 backdrop-blur-md border border-white/50 shadow-xl flex items-center justify-center overflow-hidden"
                    >
                      <img src={kiboLogo} alt="Kibo" className="h-20 w-20" />
                    </motion.div>
                  </div>
                )}
              </div>

              {/* Floating info cards - refined positioning */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                className="absolute top-4 left-0 w-32 rounded-xl bg-white/90 backdrop-blur-md border border-border/30 p-3 shadow-lg shadow-black/5"
              >
                <div className="text-[11px] font-semibold text-foreground mb-1.5">Level 12</div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "75%" }}
                    transition={{ delay: 1, duration: 0.8, ease: "easeOut" }}
                    className="h-full bg-primary rounded-full" 
                  />
                </div>
                <div className="text-[9px] text-muted-foreground mt-1">2,450 / 3,000 XP</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.5 }}
                className="absolute top-8 right-0 w-28 rounded-xl bg-white/90 backdrop-blur-md border border-border/30 p-3 shadow-lg shadow-black/5"
              >
                <div className="text-lg font-bold text-success">247</div>
                <div className="text-[9px] text-muted-foreground">problems solved</div>
              </motion.div>

              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut", delay: 1 }}
                className="absolute bottom-16 -left-4 w-36 rounded-xl bg-white/90 backdrop-blur-md border border-border/30 p-3 shadow-lg shadow-black/5"
              >
                <div className="text-[11px] font-semibold text-foreground mb-1.5">12 Day Streak</div>
                <div className="flex gap-1">
                  {[...Array(7)].map((_, i) => (
                    <motion.div 
                      key={i}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 1.2 + i * 0.05, type: "spring", stiffness: 300 }}
                      className={cn(
                        "h-2.5 w-2.5 rounded-sm",
                        i < 5 ? "bg-success" : "bg-muted"
                      )} 
                    />
                  ))}
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 0.8 }}
                className="absolute bottom-4 right-4 rounded-xl bg-gradient-to-br from-primary to-primary/85 p-3 shadow-lg shadow-primary/25"
              >
                <div className="text-[11px] font-semibold text-primary-foreground">Applied: 24</div>
                <div className="text-[10px] text-primary-foreground/75">Interviews: 8</div>
              </motion.div>
            </div>
          </motion.div>

          {/* Mobile visual - 2D fallback */}
          <div className="relative flex items-center justify-center lg:hidden">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="relative w-56 h-56"
            >
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/10 to-success/10 blur-2xl" />
              <div className="relative w-full h-full rounded-3xl bg-white/60 backdrop-blur-xl border border-white/40 flex items-center justify-center shadow-xl overflow-hidden">
                <motion.div
                  animate={{ scale: [1, 1.03, 1] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                >
                  <img src={kiboLogo} alt="Kibo" className="h-32 w-32" />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export { HeroSection };
