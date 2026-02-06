import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { Code2, TrendingUp, Target, Flame } from "lucide-react";
import { format, subDays, eachDayOfInterval, parseISO } from "date-fns";

interface CodeLabAnalyticsProps {
    userId: string;
}

const COLORS = {
    accepted: "#10b981",
    rejected: "#ef4444",
};

export const CodeLabAnalytics: React.FC<CodeLabAnalyticsProps> = ({ userId }) => {
    const [submissionHistory, setSubmissionHistory] = React.useState<any[]>([]);
    const [stats, setStats] = React.useState({
        totalSolved: 0,
        totalAttempts: 0,
        acceptanceRate: 0,
        hardCount: 0,
    });
    const [loading, setLoading] = React.useState(true);

    const fetchAnalytics = React.useCallback(async () => {
        if (!userId) return;

        try {
            const { data: submissions } = await supabase
                .from("submissions")
                .select("*, coding_problems(difficulty)")
                .eq("user_id", userId)
                .order("created_at", { ascending: true });

            if (!submissions) return;

            // Last 14 days for compact view
            const last14Days = eachDayOfInterval({
                start: subDays(new Date(), 13),
                end: new Date(),
            });

            const historyMap: Record<string, { accepted: number; total: number }> = {};
            last14Days.forEach(day => {
                historyMap[format(day, "yyyy-MM-dd")] = { accepted: 0, total: 0 };
            });

            submissions.forEach((sub: any) => {
                const dateStr = format(parseISO(sub.created_at), "yyyy-MM-dd");
                if (historyMap[dateStr]) {
                    historyMap[dateStr].total++;
                    if (sub.status === "accepted") historyMap[dateStr].accepted++;
                }
            });

            setSubmissionHistory(
                last14Days.map(day => ({
                    date: format(day, "d"),
                    accepted: historyMap[format(day, "yyyy-MM-dd")].accepted,
                    total: historyMap[format(day, "yyyy-MM-dd")].total,
                }))
            );

            // Stats
            const solvedProblems = new Map<string, string>();
            submissions.filter((s: any) => s.status === "accepted").forEach((sub: any) => {
                if (!solvedProblems.has(sub.problem_id)) {
                    solvedProblems.set(sub.problem_id, sub.coding_problems?.difficulty || "easy");
                }
            });

            const hardCount = [...solvedProblems.values()].filter(d => d === "hard").length;
            const totalSolved = solvedProblems.size;
            const accepted = submissions.filter((s: any) => s.status === "accepted").length;
            const totalAttempts = submissions.length;

            setStats({
                totalSolved,
                totalAttempts,
                acceptanceRate: totalAttempts ? Math.round((accepted / totalAttempts) * 100) : 0,
                hardCount,
            });
        } catch (error) {
            console.error("Error fetching CodeLab analytics:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    React.useEffect(() => {
        fetchAnalytics();
    }, [fetchAnalytics]);

    // Realtime subscription - properly refetches data
    React.useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`codelab-analytics:${userId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "submissions", filter: `user_id=eq.${userId}` },
                () => {
                    console.log("[CodeLabAnalytics] Realtime update, refetching...");
                    fetchAnalytics();
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchAnalytics]);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (!active || !payload) return null;
        return (
            <div className="rounded-lg border bg-card/95 backdrop-blur-sm p-2 shadow-lg text-xs">
                <p className="font-medium">Day {label}</p>
                {payload.map((entry: any, index: number) => (
                    <p key={index} style={{ color: entry.color }}>
                        {entry.name}: {entry.value}
                    </p>
                ))}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-4 flex items-center justify-center h-[180px]">
                <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-4 h-full"
        >
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                    <Code2 className="h-4 w-4 text-primary" />
                    <h3 className="font-semibold text-sm">CodeLab Activity</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {stats.acceptanceRate}% Rate
                </span>
            </div>

            {/* Compact Stats Row */}
            <div className="grid grid-cols-4 gap-2 mb-3">
                <div className="text-center p-2 rounded-lg bg-green-500/10">
                    <div className="text-lg font-bold text-green-500">{stats.totalSolved}</div>
                    <div className="text-[9px] text-muted-foreground">Solved</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-blue-500/10">
                    <div className="text-lg font-bold text-blue-500">{stats.totalAttempts}</div>
                    <div className="text-[9px] text-muted-foreground">Attempts</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-purple-500/10">
                    <div className="text-lg font-bold text-purple-500">{stats.acceptanceRate}%</div>
                    <div className="text-[9px] text-muted-foreground">Rate</div>
                </div>
                <div className="text-center p-2 rounded-lg bg-orange-500/10">
                    <div className="text-lg font-bold text-orange-500">{stats.hardCount}</div>
                    <div className="text-[9px] text-muted-foreground">Hard</div>
                </div>
            </div>

            {/* Mini Chart */}
            <div className="h-[80px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={submissionHistory} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                        <defs>
                            <linearGradient id="acceptedGrad" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor={COLORS.accepted} stopOpacity={0.4} />
                                <stop offset="95%" stopColor={COLORS.accepted} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <XAxis dataKey="date" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} />
                        <YAxis tick={{ fontSize: 8 }} tickLine={false} axisLine={false} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="accepted"
                            name="Accepted"
                            stroke={COLORS.accepted}
                            strokeWidth={2}
                            fill="url(#acceptedGrad)"
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};
