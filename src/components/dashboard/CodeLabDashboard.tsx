import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Code2, Trophy, Zap, Target } from "lucide-react";
import { Progress } from "@/components/ui/progress";

interface CodeLabDashboardProps {
    userId: string;
}

interface Stats {
    totalSolved: number;
    easyCount: number;
    mediumCount: number;
    hardCount: number;
    acceptanceRate: number;
    totalAttempts: number;
}

export const CodeLabDashboard: React.FC<CodeLabDashboardProps> = ({ userId }) => {
    const [stats, setStats] = React.useState<Stats>({
        totalSolved: 0,
        easyCount: 0,
        mediumCount: 0,
        hardCount: 0,
        acceptanceRate: 0,
        totalAttempts: 0,
    });
    const [loading, setLoading] = React.useState(true);

    const fetchStats = React.useCallback(async () => {
        if (!userId) return;

        try {
            // Fetch accepted submissions with difficulty
            const { data: solved, error: solvedError } = await supabase
                .from("submissions")
                .select("id, coding_problems(difficulty)")
                .eq("user_id", userId)
                .eq("status", "accepted");

            if (solvedError) throw solvedError;

            // Fetch total attempts for acceptance rate
            const { count: totalAttempts, error: countError } = await supabase
                .from("submissions")
                .select("id", { count: "exact", head: true })
                .eq("user_id", userId);

            if (countError) throw countError;

            const easy = solved?.filter((s: any) => s.coding_problems?.difficulty === "easy").length || 0;
            const medium = solved?.filter((s: any) => s.coding_problems?.difficulty === "medium").length || 0;
            const hard = solved?.filter((s: any) => s.coding_problems?.difficulty === "hard").length || 0;
            const totalSolved = solved?.length || 0;

            setStats({
                totalSolved,
                easyCount: easy,
                mediumCount: medium,
                hardCount: hard,
                totalAttempts: totalAttempts || 0,
                acceptanceRate: totalAttempts ? Math.round((totalSolved / totalAttempts) * 100) : 0,
            });
        } catch (error) {
            console.error("Error fetching CodeLab stats:", error);
        } finally {
            setLoading(false);
        }
    }, [userId]);

    React.useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Realtime subscription
    React.useEffect(() => {
        if (!userId) return;

        const channel = supabase
            .channel(`codelab-dashboard:${userId}`)
            .on(
                "postgres_changes",
                { event: "*", schema: "public", table: "submissions", filter: `user_id=eq.${userId}` },
                () => fetchStats()
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [userId, fetchStats]);

    if (loading) {
        return (
            <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 h-full flex flex-col justify-between">
                <div className="flex items-center gap-2 mb-4">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Code Lab</h3>
                </div>
                <div className="flex-1 flex items-center justify-center">
                    <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6 h-full flex flex-col justify-between"
        >
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <Code2 className="h-5 w-5 text-muted-foreground" />
                    <h3 className="font-semibold">Code Lab</h3>
                </div>
                <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                    {stats.acceptanceRate}% Success
                </span>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center p-3 rounded-xl bg-primary/5 border border-primary/10">
                    <div className="text-2xl font-bold text-primary">{stats.totalSolved}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
                        Solved
                    </div>
                </div>
                <div className="text-center p-3 rounded-xl bg-muted/30 border border-white/5">
                    <div className="text-2xl font-bold text-foreground">{stats.totalAttempts}</div>
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mt-1">
                        Attempts
                    </div>
                </div>
            </div>

            <div className="space-y-3">
                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-success font-medium">Easy</span>
                        <span className="text-muted-foreground">{stats.easyCount}</span>
                    </div>
                    <Progress value={stats.totalSolved ? (stats.easyCount / stats.totalSolved) * 100 : 0} className="h-1.5 bg-muted [&>div]:bg-success" />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-warning font-medium">Medium</span>
                        <span className="text-muted-foreground">{stats.mediumCount}</span>
                    </div>
                    <Progress value={stats.totalSolved ? (stats.mediumCount / stats.totalSolved) * 100 : 0} className="h-1.5 bg-muted [&>div]:bg-warning" />
                </div>

                <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                        <span className="text-destructive font-medium">Hard</span>
                        <span className="text-muted-foreground">{stats.hardCount}</span>
                    </div>
                    <Progress value={stats.totalSolved ? (stats.hardCount / stats.totalSolved) * 100 : 0} className="h-1.5 bg-muted [&>div]:bg-destructive" />
                </div>
            </div>
        </motion.div>
    );
};
