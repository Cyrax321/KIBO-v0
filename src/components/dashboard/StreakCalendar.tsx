import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Flame, Calendar } from "lucide-react";
import { format, subDays, startOfWeek, addDays, isSameDay, isToday } from "date-fns";

interface StreakCalendarProps {
  dailyActivities?: Array<{
    date: string;
    xp: number;
    problems: number;
    applications: number;
    assessments: number;
  }>;
  currentStreak: number;
}

export const StreakCalendar: React.FC<StreakCalendarProps> = ({
  dailyActivities = [],
  currentStreak
}) => {
  // Get the last 4 weeks
  const today = new Date();
  const startDate = startOfWeek(subDays(today, 27)); // 4 weeks ago, start of that week

  // Build activity set for quick lookup
  const activeSet = new Set(
    dailyActivities
      .filter((a) => a.xp > 0 || a.problems > 0 || a.applications > 0)
      .map((a) => a.date)
  );

  // Generate 4 weeks of days
  const weeks: Date[][] = [];
  let currentDate = startDate;

  for (let w = 0; w < 4; w++) {
    const week: Date[] = [];
    for (let d = 0; d < 7; d++) {
      week.push(new Date(currentDate));
      currentDate = addDays(currentDate, 1);
    }
    weeks.push(week);
  }

  // Calculate longest streak
  const longestStreak = React.useMemo(() => {
    const dates = dailyActivities
      .filter((a) => a.xp > 0)
      .map((a) => new Date(a.date))
      .sort((a, b) => a.getTime() - b.getTime());

    if (dates.length === 0) return 0;

    let longest = 1;
    let current = 1;

    for (let i = 1; i < dates.length; i++) {
      const diff = (dates[i].getTime() - dates[i - 1].getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        current++;
        longest = Math.max(longest, current);
      } else {
        current = 1;
      }
    }

    return longest;
  }, [dailyActivities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Flame className="h-5 w-5 text-warning" />
          <h3 className="font-semibold">Streak Calendar</h3>
        </div>
        <div className="flex items-center gap-1 text-warning">
          <Flame className="h-4 w-4" />
          <span className="text-sm font-bold">{currentStreak}</span>
        </div>
      </div>

      {/* Mini calendar grid */}
      <div className="space-y-1">
        {/* Day headers */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
            <div
              key={i}
              className="text-[10px] font-medium text-muted-foreground text-center"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Weeks */}
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 gap-1">
            {week.map((day, dayIndex) => {
              const dateStr = format(day, "yyyy-MM-dd");
              const isActive = activeSet.has(dateStr);
              const isFuture = day > today;
              const isCurrentDay = isToday(day);

              return (
                <motion.div
                  key={dayIndex}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1 + weekIndex * 0.03 + dayIndex * 0.01 }}
                  className={cn(
                    "aspect-square rounded-md flex items-center justify-center text-[10px] font-medium transition-colors",
                    isFuture && "bg-transparent text-muted-foreground/30",
                    !isFuture && !isActive && "bg-muted text-muted-foreground",
                    !isFuture && isActive && "bg-warning text-warning-foreground",
                    isCurrentDay && "ring-2 ring-primary ring-offset-1 ring-offset-background"
                  )}
                >
                  {format(day, "d")}
                </motion.div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Stats */}
      <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
        <div className="text-center">
          <p className="text-2xl font-bold text-warning">{currentStreak}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Current</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-primary">{longestStreak}</p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Longest</p>
        </div>
      </div>
    </motion.div>
  );
};
