import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Target, Code2, Briefcase, FileText, Trophy } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface WeeklyGoalsProps {
  userId: string;
  dailyActivities?: Array<{
    date: string;
    xp: number;
    problems: number;
    applications: number;
    assessments: number;
  }>;
}

interface Goal {
  id: string;
  label: string;
  icon: React.ElementType;
  current: number;
  target: number;
  color: string;
}

export const WeeklyGoals: React.FC<WeeklyGoalsProps> = ({ userId, dailyActivities = [] }) => {
  // Calculate this week's totals from daily activities
  const weeklyTotals = React.useMemo(() => {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    const weekActivities = dailyActivities.filter((a) => {
      const activityDate = new Date(a.date);
      return activityDate >= startOfWeek;
    });

    return weekActivities.reduce(
      (acc, day) => ({
        xp: acc.xp + day.xp,
        problems: acc.problems + day.problems,
        applications: acc.applications + day.applications,
        assessments: acc.assessments + day.assessments,
      }),
      { xp: 0, problems: 0, applications: 0, assessments: 0 }
    );
  }, [dailyActivities]);

  // Default weekly goals (could be made configurable later)
  const goals: Goal[] = [
    {
      id: "problems",
      label: "Problems Solved",
      icon: Code2,
      current: weeklyTotals.problems,
      target: 10,
      color: "text-blue-500",
    },
    {
      id: "applications",
      label: "Applications Sent",
      icon: Briefcase,
      current: weeklyTotals.applications,
      target: 5,
      color: "text-green-500",
    },
    {
      id: "assessments",
      label: "Assessments Done",
      icon: FileText,
      current: weeklyTotals.assessments,
      target: 3,
      color: "text-purple-500",
    },
    {
      id: "xp",
      label: "XP Earned",
      icon: Trophy,
      current: weeklyTotals.xp,
      target: 500,
      color: "text-amber-500",
    },
  ];

  const completedGoals = goals.filter((g) => g.current >= g.target).length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.25 }}
      className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Weekly Goals</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {completedGoals}/{goals.length} completed
        </span>
      </div>

      <div className="space-y-4">
        {goals.map((goal, index) => {
          const progress = Math.min(100, (goal.current / goal.target) * 100);
          const isCompleted = goal.current >= goal.target;

          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <goal.icon className={cn("h-4 w-4", goal.color)} />
                  <span className={cn(isCompleted && "line-through text-muted-foreground")}>
                    {goal.label}
                  </span>
                </div>
                <span className={cn("text-xs font-medium", isCompleted ? "text-success" : "text-muted-foreground")}>
                  {goal.current}/{goal.target}
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </motion.div>
          );
        })}
      </div>

      {completedGoals === goals.length && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-4 p-3 rounded-xl bg-success/10 border border-success/20 text-center"
        >
          <p className="text-sm font-medium text-success">All goals completed</p>
          <p className="text-xs text-success/80">Excellent work this week</p>
        </motion.div>
      )}
    </motion.div>
  );
};
