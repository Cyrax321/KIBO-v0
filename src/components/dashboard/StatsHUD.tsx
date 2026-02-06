import * as React from "react";
import { motion } from "framer-motion";
import { Flame, Award, Zap, TrendingUp, Target, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface LevelThreshold {
  level: number;
  xp_required: number;
  title: string;
}

interface LevelProgress {
  current: number;
  next: number;
  progress: number;
  title: string;
}

interface UserStats {
  totalXP: number;
  level: number;
  streak: number;
  problemsSolved: number;
  applicationsCount: number;
  achievementsCount: number;
}

interface StatsHUDProps {
  profile: {
    streak: number;
    level: number;
    xp: number;
  } | null;
  userStats?: UserStats | null;
  levelProgress?: LevelProgress;
  levelThresholds?: LevelThreshold[];
}

export const StatsHUD: React.FC<StatsHUDProps> = ({ 
  profile, 
  userStats, 
  levelProgress,
  levelThresholds = []
}) => {
  // Use userStats if available, fallback to profile
  const streak = userStats?.streak ?? profile?.streak ?? 0;
  const level = userStats?.level ?? profile?.level ?? 1;
  const xp = userStats?.totalXP ?? profile?.xp ?? 0;
  const problemsSolved = userStats?.problemsSolved ?? 0;
  const applicationsCount = userStats?.applicationsCount ?? 0;
  const achievementsCount = userStats?.achievementsCount ?? 0;
  
  // Calculate level progress
  const currentThreshold = levelThresholds.find(t => t.level === level);
  const nextThreshold = levelThresholds.find(t => t.level === level + 1);
  const levelName = currentThreshold?.title || levelProgress?.title || "Novice";
  
  const xpInLevel = levelProgress?.current ?? (xp - (currentThreshold?.xp_required ?? 0));
  const xpNeeded = levelProgress?.next ?? ((nextThreshold?.xp_required ?? xp) - (currentThreshold?.xp_required ?? 0));
  const progressPercent = levelProgress?.progress ?? (xpNeeded > 0 ? Math.min(100, (xpInLevel / xpNeeded) * 100) : 100);

  const stats = [
    {
      icon: Flame,
      label: "Day Streak",
      value: streak,
      suffix: streak === 1 ? "Day" : "Days",
      color: "text-warning",
      bgColor: "bg-warning/10",
      borderColor: "border-warning/20",
      tooltip: streak > 0 ? `${streak} day streak active` : "Start your streak today",
    },
    {
      icon: Award,
      label: "Level",
      value: `Lvl ${level}`,
      suffix: levelName,
      color: "text-primary",
      bgColor: "bg-primary/10",
      borderColor: "border-primary/20",
      tooltip: `Level ${level} - ${levelName}`,
    },
    {
      icon: Zap,
      label: "Experience",
      value: xp.toLocaleString(),
      suffix: "XP",
      color: "text-success",
      bgColor: "bg-success/10",
      borderColor: "border-success/20",
      showProgress: true,
      progress: progressPercent,
      xpInLevel,
      xpNeeded,
      tooltip: `${xpNeeded - xpInLevel} XP to level ${level + 1}`,
    },
  ];

  const secondaryStats = [
    {
      icon: Target,
      label: "Problems",
      value: problemsSolved,
      color: "text-blue-500",
    },
    {
      icon: TrendingUp,
      label: "Applications",
      value: applicationsCount,
      color: "text-purple-500",
    },
    {
      icon: Trophy,
      label: "Achievements",
      value: achievementsCount,
      color: "text-amber-500",
    },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="space-y-4"
    >
      {/* Main Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((stat, index) => (
          <TooltipProvider key={stat.label}>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 + index * 0.05 }}
                  whileHover={{ scale: 1.02 }}
                  className={cn(
                    "relative overflow-hidden rounded-2xl border bg-card/80 backdrop-blur-xl p-5 shadow-sm transition-shadow hover:shadow-md",
                    stat.borderColor
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        {stat.label}
                      </p>
                      <div className="flex items-baseline gap-1.5">
                        <span className={cn("text-2xl font-bold", stat.color)}>
                          {stat.value}
                        </span>
                        <span className="text-sm text-muted-foreground">{stat.suffix}</span>
                      </div>
                    </div>
                    <div className={cn("rounded-xl p-2.5", stat.bgColor)}>
                      <stat.icon className={cn("h-5 w-5 stroke-[1.5]", stat.color)} />
                    </div>
                  </div>

                  {stat.showProgress && (
                    <div className="mt-4 space-y-1.5">
                      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min(stat.progress || 0, 100)}%` }}
                          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
                          className="h-full rounded-full bg-gradient-to-r from-success to-primary"
                        />
                      </div>
                      <p className="text-[10px] text-muted-foreground">
                        {stat.xpInLevel?.toLocaleString()} / {stat.xpNeeded?.toLocaleString()} XP to next level
                      </p>
                    </div>
                  )}
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>{stat.tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ))}
      </div>

      {/* Secondary Stats Row */}
      <div className="flex items-center justify-center gap-6 py-2">
        {secondaryStats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.05 }}
            className="flex items-center gap-2 text-sm"
          >
            <stat.icon className={cn("h-4 w-4", stat.color)} />
            <span className="text-muted-foreground">{stat.label}:</span>
            <span className="font-semibold">{stat.value}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
