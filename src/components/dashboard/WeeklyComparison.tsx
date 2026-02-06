import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, TrendingDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { subDays, format, startOfWeek, endOfWeek, isWithinInterval } from "date-fns";

interface WeeklyComparisonProps {
  dailyActivities: Array<{
    date: string;
    xp: number;
    problems: number;
    applications: number;
    assessments: number;
  }>;
}

export const WeeklyComparison: React.FC<WeeklyComparisonProps> = ({ dailyActivities = [] }) => {
  const comparison = React.useMemo(() => {
    const today = new Date();
    
    // Current week (Mon-Sun including today)
    const currentWeekStart = startOfWeek(today, { weekStartsOn: 1 });
    const currentWeekEnd = today;
    
    // Last week
    const lastWeekStart = startOfWeek(subDays(currentWeekStart, 1), { weekStartsOn: 1 });
    const lastWeekEnd = endOfWeek(subDays(currentWeekStart, 1), { weekStartsOn: 1 });

    const currentWeekData = dailyActivities.filter((a) => {
      const date = new Date(a.date);
      return isWithinInterval(date, { start: currentWeekStart, end: currentWeekEnd });
    });

    const lastWeekData = dailyActivities.filter((a) => {
      const date = new Date(a.date);
      return isWithinInterval(date, { start: lastWeekStart, end: lastWeekEnd });
    });

    const sumData = (data: typeof dailyActivities) => ({
      xp: data.reduce((sum, d) => sum + d.xp, 0),
      problems: data.reduce((sum, d) => sum + d.problems, 0),
      applications: data.reduce((sum, d) => sum + d.applications, 0),
    });

    const current = sumData(currentWeekData);
    const last = sumData(lastWeekData);

    const calculateChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      xp: { current: current.xp, last: last.xp, change: calculateChange(current.xp, last.xp) },
      problems: { current: current.problems, last: last.problems, change: calculateChange(current.problems, last.problems) },
      applications: { current: current.applications, last: last.applications, change: calculateChange(current.applications, last.applications) },
    };
  }, [dailyActivities]);

  const metrics = [
    { label: "XP Earned", ...comparison.xp, color: "text-success" },
    { label: "Problems", ...comparison.problems, color: "text-primary" },
    { label: "Applications", ...comparison.applications, color: "text-blue-500" },
  ];

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Week vs Last Week</h3>
        <span className="text-[10px] text-muted-foreground">This week so far</span>
      </div>

      <div className="space-y-4">
        {metrics.map((metric, index) => {
          const isPositive = metric.change >= 0;
          const TrendIcon = isPositive ? TrendingUp : TrendingDown;

          return (
            <motion.div
              key={metric.label}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{metric.label}</span>
                <div className={cn(
                  "flex items-center gap-1 text-xs font-medium",
                  isPositive ? "text-success" : "text-destructive"
                )}>
                  <TrendIcon className="h-3 w-3" />
                  <span>{isPositive ? "+" : ""}{metric.change}%</span>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1">
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 0.8, delay: 0.2 + index * 0.1 }}
                      className="h-full bg-muted-foreground/30 rounded-full relative"
                    >
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ 
                          width: `${Math.min(100, (metric.current / Math.max(metric.last, metric.current, 1)) * 100)}%` 
                        }}
                        transition={{ duration: 0.8, delay: 0.4 + index * 0.1 }}
                        className={cn("h-full rounded-full", 
                          metric.label === "XP Earned" ? "bg-success" :
                          metric.label === "Problems" ? "bg-primary" : "bg-blue-500"
                        )}
                      />
                    </motion.div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-xs min-w-[80px] justify-end">
                  <span className="text-muted-foreground">{metric.last}</span>
                  <ArrowRight className="h-3 w-3 text-muted-foreground" />
                  <span className={cn("font-semibold", metric.color)}>{metric.current}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
