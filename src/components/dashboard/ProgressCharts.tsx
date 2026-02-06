import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, PieChart as PieChartIcon, BarChart3 } from "lucide-react";
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns";

interface ProgressChartsProps {
  userId: string;
  dailyActivities?: Array<{
    date: string;
    xp: number;
    problems: number;
    applications: number;
    assessments: number;
  }>;
}

const COLORS = {
  problems: "hsl(var(--chart-1))",
  applications: "hsl(var(--chart-2))",
  assessments: "hsl(var(--chart-3))",
  xp: "hsl(var(--primary))",
};

const DIFFICULTY_COLORS = {
  easy: "#10b981",
  medium: "#f59e0b",
  hard: "#ef4444",
};

export const ProgressCharts: React.FC<ProgressChartsProps> = ({ userId, dailyActivities = [] }) => {
  const [problemStats, setProblemStats] = React.useState<{ difficulty: string; count: number }[]>([]);
  const [applicationStats, setApplicationStats] = React.useState<{ status: string; count: number }[]>([]);
  const [loading, setLoading] = React.useState(true);

  // Prepare XP trend data for the last 14 days
  const xpTrendData = React.useMemo(() => {
    const last14Days = eachDayOfInterval({
      start: subDays(new Date(), 13),
      end: new Date(),
    });

    const activityMap = new Map(
      dailyActivities.map((a) => [a.date, a])
    );

    return last14Days.map((date) => {
      const dateStr = format(date, "yyyy-MM-dd");
      const activity = activityMap.get(dateStr);
      return {
        date: format(date, "MMM d"),
        xp: activity?.xp || 0,
        problems: activity?.problems || 0,
        applications: activity?.applications || 0,
      };
    });
  }, [dailyActivities]);

  // Activity breakdown for pie chart
  const activityBreakdown = React.useMemo(() => {
    const totals = dailyActivities.reduce(
      (acc, day) => ({
        problems: acc.problems + day.problems,
        applications: acc.applications + day.applications,
        assessments: acc.assessments + day.assessments,
      }),
      { problems: 0, applications: 0, assessments: 0 }
    );

    return [
      { name: "Problems Solved", value: totals.problems, color: COLORS.problems },
      { name: "Applications Sent", value: totals.applications, color: COLORS.applications },
      { name: "Assessments Done", value: totals.assessments, color: COLORS.assessments },
    ].filter((item) => item.value > 0);
  }, [dailyActivities]);

  // Fetch problem difficulty distribution
  React.useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        const [problemsRes, applicationsRes] = await Promise.all([
          // Get problem difficulty counts
          supabase
            .from("submissions")
            .select("problem_id, coding_problems(difficulty)")
            .eq("user_id", userId)
            .eq("status", "accepted"),

          // Get application status counts
          supabase
            .from("applications")
            .select("status")
            .eq("user_id", userId),
        ]);

        // Process problem difficulties
        if (problemsRes.data) {
          const difficultyCount: Record<string, number> = { easy: 0, medium: 0, hard: 0 };
          const seenProblems = new Set<string>();

          problemsRes.data.forEach((sub: any) => {
            if (!seenProblems.has(sub.problem_id)) {
              seenProblems.add(sub.problem_id);
              const difficulty = sub.coding_problems?.difficulty?.toLowerCase() || "easy";
              difficultyCount[difficulty] = (difficultyCount[difficulty] || 0) + 1;
            }
          });

          setProblemStats([
            { difficulty: "Easy", count: difficultyCount.easy },
            { difficulty: "Medium", count: difficultyCount.medium },
            { difficulty: "Hard", count: difficultyCount.hard },
          ]);
        }

        // Process application statuses
        if (applicationsRes.data) {
          const statusCount: Record<string, number> = {};
          applicationsRes.data.forEach((app: any) => {
            const status = app.status || "wishlist";
            statusCount[status] = (statusCount[status] || 0) + 1;
          });

          setApplicationStats(
            Object.entries(statusCount).map(([status, count]) => ({
              status: status.charAt(0).toUpperCase() + status.slice(1).replace("_", " "),
              count,
            }))
          );
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [userId]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload) return null;
    return (
      <div className="rounded-lg border bg-card/95 backdrop-blur-sm p-3 shadow-lg">
        <p className="text-sm font-medium mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-xs" style={{ color: entry.color }}>
            {entry.name}: {entry.value}
          </p>
        ))}
      </div>
    );
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 h-full flex flex-col"
    >
      <Tabs defaultValue="xp" className="w-full">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold">Progress Analytics</h3>
          <TabsList className="h-8">
            <TabsTrigger value="xp" className="text-xs px-2 h-6">
              <TrendingUp className="h-3 w-3 mr-1" />
              XP Trend
            </TabsTrigger>
            <TabsTrigger value="breakdown" className="text-xs px-2 h-6">
              <PieChartIcon className="h-3 w-3 mr-1" />
              Activity
            </TabsTrigger>
            <TabsTrigger value="problems" className="text-xs px-2 h-6">
              <BarChart3 className="h-3 w-3 mr-1" />
              Problems
            </TabsTrigger>
          </TabsList>
        </div>

        {/* XP Trend Chart */}
        <TabsContent value="xp" className="mt-0">
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={xpTrendData} margin={{ top: 20, right: 20, left: 10, bottom: 10 }}>
                <defs>
                  <linearGradient id="xpGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                />
                <YAxis
                  tick={{ fontSize: 12 }}
                  tickLine={false}
                  axisLine={false}
                  className="text-muted-foreground"
                  width={50}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="xp"
                  name="XP Earned"
                  stroke="hsl(var(--primary))"
                  strokeWidth={2}
                  fill="url(#xpGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-lg font-bold text-primary">
                {xpTrendData.reduce((sum, d) => sum + d.xp, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">14-Day XP</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-lg font-bold text-chart-1">
                {xpTrendData.reduce((sum, d) => sum + d.problems, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Problems</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-2">
              <p className="text-lg font-bold text-chart-2">
                {xpTrendData.reduce((sum, d) => sum + d.applications, 0)}
              </p>
              <p className="text-[10px] text-muted-foreground">Applications</p>
            </div>
          </div>
        </TabsContent>

        {/* Activity Breakdown */}
        <TabsContent value="breakdown" className="mt-0">
          <div className="h-[400px] w-full">
            {activityBreakdown.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No activity data yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={activityBreakdown}
                    cx="50%"
                    cy="45%"
                    innerRadius={90}
                    outerRadius={140}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {activityBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    verticalAlign="bottom"
                    height={36}
                    formatter={(value) => (
                      <span className="text-xs text-muted-foreground">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </TabsContent>

        {/* Problem Difficulty Distribution */}
        <TabsContent value="problems" className="mt-0">
          <div className="h-[400px] w-full">
            {loading ? (
              <div className="h-full flex items-center justify-center">
                <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
              </div>
            ) : problemStats.every((s) => s.count === 0) ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-sm text-muted-foreground">No problems solved yet</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={problemStats} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted/30" />
                  <XAxis
                    dataKey="difficulty"
                    tick={{ fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" name="Problems Solved" radius={[6, 6, 0, 0]}>
                    <Cell fill={DIFFICULTY_COLORS.easy} />
                    <Cell fill={DIFFICULTY_COLORS.medium} />
                    <Cell fill={DIFFICULTY_COLORS.hard} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          {!loading && (
            <div className="mt-3 flex items-center justify-center gap-4 text-xs">
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-success" />
                <span className="text-muted-foreground">Easy</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-warning" />
                <span className="text-muted-foreground">Medium</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="h-2 w-2 rounded-full bg-destructive" />
                <span className="text-muted-foreground">Hard</span>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </motion.div >
  );
};
