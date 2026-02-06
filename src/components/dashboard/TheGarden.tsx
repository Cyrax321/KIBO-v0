import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface DailyActivity {
  date: string;
  xp: number;
  problems: number;
  applications: number;
  assessments: number;
}

interface TheGardenProps {
  userId: string;
  activities?: DailyActivity[];
}

interface DayData {
  date: string;
  intensity: number;
  xp: number;
  problems: number;
  applications: number;
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getIntensityLevel(xp: number): number {
  if (xp === 0) return 0;
  if (xp < 15) return 1;
  if (xp < 40) return 2;
  if (xp < 80) return 3;
  return 4;
}

export const TheGarden: React.FC<TheGardenProps> = ({ userId, activities: propActivities }) => {
  const [activityData, setActivityData] = React.useState<DayData[]>([]);
  const [totalXP, setTotalXP] = React.useState(0);
  const [activeDays, setActiveDays] = React.useState(0);

  React.useEffect(() => {
    const processActivities = () => {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 364);

      const activityMap = new Map<string, DailyActivity>();
      let xpTotal = 0;
      let daysActive = 0;

      if (propActivities) {
        propActivities.forEach((activity) => {
          activityMap.set(activity.date, activity);
          xpTotal += activity.xp;
          if (activity.xp > 0) daysActive++;
        });
      }

      setTotalXP(xpTotal);
      setActiveDays(daysActive);

      const days: DayData[] = [];
      const current = new Date(startDate);

      while (current <= endDate) {
        const dateStr = current.toISOString().split("T")[0];
        const activity = activityMap.get(dateStr);
        const xp = activity?.xp || 0;

        days.push({
          date: dateStr,
          intensity: getIntensityLevel(xp),
          xp,
          problems: activity?.problems || 0,
          applications: activity?.applications || 0,
        });
        current.setDate(current.getDate() + 1);
      }

      setActivityData(days);
    };

    processActivities();
  }, [propActivities]);

  React.useEffect(() => {
    if (!propActivities && userId) {
      const fetchActivities = async () => {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - 364);

        const { data } = await supabase
          .from("daily_activities")
          .select("activity_date, xp_earned, problems_solved, applications_sent, assessments_completed")
          .eq("user_id", userId)
          .gte("activity_date", startDate.toISOString().split("T")[0])
          .lte("activity_date", endDate.toISOString().split("T")[0]);

        if (data) {
          const activities: DailyActivity[] = data.map(d => ({
            date: d.activity_date,
            xp: d.xp_earned,
            problems: d.problems_solved,
            applications: d.applications_sent,
            assessments: d.assessments_completed,
          }));

          const activityMap = new Map<string, DailyActivity>();
          let xpTotal = 0;
          let daysActive = 0;

          activities.forEach((activity) => {
            activityMap.set(activity.date, activity);
            xpTotal += activity.xp;
            if (activity.xp > 0) daysActive++;
          });

          setTotalXP(xpTotal);
          setActiveDays(daysActive);

          const days: DayData[] = [];
          const current = new Date(startDate);

          while (current <= endDate) {
            const dateStr = current.toISOString().split("T")[0];
            const activity = activityMap.get(dateStr);
            const xp = activity?.xp || 0;

            days.push({
              date: dateStr,
              intensity: getIntensityLevel(xp),
              xp,
              problems: activity?.problems || 0,
              applications: activity?.applications || 0,
            });
            current.setDate(current.getDate() + 1);
          }

          setActivityData(days);
        }
      };

      fetchActivities();
    }
  }, [userId, propActivities]);

  // Group by weeks (columns)
  const weeks: DayData[][] = [];
  let currentWeek: DayData[] = [];

  if (activityData.length > 0) {
    const firstDay = new Date(activityData[0].date).getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: "", intensity: -1, xp: 0, problems: 0, applications: 0 });
    }
  }

  activityData.forEach((day) => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  const getGitHubColor = (intensity: number) => {
    switch (intensity) {
      case 4: return "bg-[#216e39]"; // darkest green
      case 3: return "bg-[#30a14e]";
      case 2: return "bg-[#40c463]";
      case 1: return "bg-[#9be9a8]"; // lightest green
      case 0: return "bg-[#ebedf0] dark:bg-[#161b22]"; // empty
      default: return ""; // placeholder
    }
  };

  // Get month labels with positions
  const monthLabels: { label: string; weekIndex: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, weekIndex) => {
    const firstValidDay = week.find(d => d.intensity >= 0);
    if (firstValidDay && firstValidDay.date) {
      const month = new Date(firstValidDay.date).getMonth();
      if (month !== lastMonth) {
        monthLabels.push({ label: MONTHS[month], weekIndex });
        lastMonth = month;
      }
    }
  });

  return (
    <div className="rounded-md border border-border bg-card p-4">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-foreground">{activeDays} contributions in the last year</span>
        </div>
      </div>

      {/* Contribution graph */}
      <div className="overflow-x-auto">
        <table className="border-collapse w-full" style={{ borderSpacing: 0 }}>
          <thead>
            <tr>
              <td className="w-8"></td>
              {weeks.map((_, weekIndex) => {
                const monthLabel = monthLabels.find(m => m.weekIndex === weekIndex);
                return (
                  <td key={weekIndex} className="text-xs text-muted-foreground font-normal p-0 align-bottom pb-2" style={{ height: 20 }}>
                    {monthLabel?.label || ""}
                  </td>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
              <tr key={dayIndex}>
                <td className="text-xs text-muted-foreground pr-2 text-right align-middle" style={{ width: 32, height: 24 }}>
                  {dayIndex === 1 ? "Mon" : dayIndex === 3 ? "Wed" : dayIndex === 5 ? "Fri" : ""}
                </td>
                {weeks.map((week, weekIndex) => {
                  const day = week[dayIndex];
                  if (!day || day.intensity < 0) {
                    return <td key={weekIndex} className="p-[2px]"><div className="w-[18px] h-[18px]" /></td>;
                  }

                  const formattedDate = day.date
                    ? new Date(day.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric'
                    })
                    : '';

                  return (
                    <td key={weekIndex} className="p-[2px]">
                      <TooltipProvider>
                        <Tooltip delayDuration={0}>
                          <TooltipTrigger asChild>
                            <div
                              className={cn(
                                "w-[18px] h-[18px] rounded-[3px] outline-1 outline-offset-[-1px] outline-black/5 transition-transform hover:scale-110",
                                getGitHubColor(day.intensity)
                              )}
                            />
                          </TooltipTrigger>
                          <TooltipContent
                            side="top"
                            className="bg-[#24292f] text-white text-xs py-1.5 px-2 rounded-md border-0"
                          >
                            <strong>{day.xp > 0 ? `${day.xp} XP` : 'No contributions'}</strong> on {formattedDate}
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-4 text-xs text-muted-foreground">
        <span>Less</span>
        <div className={cn("w-[18px] h-[18px] rounded-[3px]", getGitHubColor(0))} />
        <div className={cn("w-[18px] h-[18px] rounded-[3px]", getGitHubColor(1))} />
        <div className={cn("w-[18px] h-[18px] rounded-[3px]", getGitHubColor(2))} />
        <div className={cn("w-[18px] h-[18px] rounded-[3px]", getGitHubColor(3))} />
        <div className={cn("w-[18px] h-[18px] rounded-[3px]", getGitHubColor(4))} />
        <span>More</span>
      </div>
    </div>
  );
};
