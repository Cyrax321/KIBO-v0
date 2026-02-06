import * as React from "react";
import { motion } from "framer-motion";
import { CalendarDays, Video, Trophy, AlertTriangle } from "lucide-react";
import { isThisWeek, isThisMonth, isFuture, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface ScheduleEvent {
  id: string;
  title: string;
  event_date: string;
  event_type: string;
}

interface QuickStatsProps {
  events: ScheduleEvent[];
}

export const QuickStats: React.FC<QuickStatsProps> = ({ events }) => {
  const stats = React.useMemo(() => {
    const now = new Date();
    const futureEvents = events.filter((e) => isFuture(parseISO(e.event_date)));

    return {
      thisWeek: futureEvents.filter((e) => isThisWeek(parseISO(e.event_date))).length,
      thisMonth: futureEvents.filter((e) => isThisMonth(parseISO(e.event_date))).length,
      interviews: futureEvents.filter((e) => e.event_type === "interview").length,
      deadlines: futureEvents.filter((e) => e.event_type === "deadline").length,
    };
  }, [events]);

  const statItems = [
    {
      label: "This Week",
      value: stats.thisWeek,
      icon: CalendarDays,
      color: "text-primary bg-primary/10",
    },
    {
      label: "This Month",
      value: stats.thisMonth,
      icon: CalendarDays,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "Interviews",
      value: stats.interviews,
      icon: Video,
      color: "text-success bg-success/10",
    },
    {
      label: "Deadlines",
      value: stats.deadlines,
      icon: AlertTriangle,
      color: "text-destructive bg-destructive/10",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {statItems.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="rounded-xl border border-border/50 bg-card/80 backdrop-blur-xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className={cn("rounded-lg p-2", stat.color)}>
              <stat.icon className="h-4 w-4" />
            </div>
            <span className="text-2xl font-bold">{stat.value}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-2">{stat.label}</p>
        </motion.div>
      ))}
    </div>
  );
};
