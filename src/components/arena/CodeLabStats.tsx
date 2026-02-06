import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Clock, Code2, Trophy, Target, Zap, BarChart3 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

interface CodeLabStats {
  totalSubmissions: number;
  acceptedCount: number;
  totalXPEarned: number;
  acceptanceRate: number;
  problemsSolved: number;
  languageBreakdown: Record<string, number>;
}

interface CodeLabStatsProps {
  userId: string;
}

export const CodeLabStats: React.FC<CodeLabStatsProps> = ({ userId }) => {
  const [stats, setStats] = React.useState<CodeLabStats>({
    totalSubmissions: 0,
    acceptedCount: 0,
    totalXPEarned: 0,
    acceptanceRate: 0,
    problemsSolved: 0,
    languageBreakdown: {},
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        // Fetch all submissions
        const { data: submissions, error } = await supabase
          .from("submissions")
          .select("*")
          .eq("user_id", userId);

        if (error) throw error;

        if (submissions) {
          const totalSubmissions = submissions.length;
          const acceptedSubmissions = submissions.filter(s => s.status === "accepted");
          const acceptedCount = acceptedSubmissions.length;

          // Unique problems solved
          const uniqueProblems = new Set(acceptedSubmissions.map(s => s.problem_id));
          const problemsSolved = uniqueProblems.size;

          // Calculate XP (estimate based on difficulty - actual comes from profile)
          const totalXPEarned = acceptedCount * 25; // Average XP per problem

          // Acceptance rate
          const acceptanceRate = totalSubmissions > 0
            ? Math.round((acceptedCount / totalSubmissions) * 100)
            : 0;

          // Language breakdown
          const languageBreakdown: Record<string, number> = {};
          submissions.forEach(s => {
            languageBreakdown[s.language] = (languageBreakdown[s.language] || 0) + 1;
          });

          setStats({
            totalSubmissions,
            acceptedCount,
            totalXPEarned,
            acceptanceRate,
            problemsSolved,
            languageBreakdown,
          });
        }
      } catch (error) {
        console.error("Error fetching Code Lab stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Realtime subscription for stats updates
    const channel = supabase
      .channel(`codelab-stats:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          fetchStats();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-8 bg-muted/50 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Solved Progress Ring */}
      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16">
          <svg className="w-16 h-16 -rotate-90" viewBox="0 0 36 36">
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="text-muted/30"
            />
            <path
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray={`${stats.problemsSolved * 10}, 100`}
              className="text-primary"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-lg font-bold">{stats.problemsSolved}</span>
          </div>
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium">Problems Solved</p>
          <p className="text-xs text-muted-foreground">
            {stats.acceptedCount} accepted submissions
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-muted/30 rounded-lg p-2.5">
          <p className="text-lg font-bold text-success">{stats.acceptanceRate}%</p>
          <p className="text-[10px] text-muted-foreground">Acceptance</p>
        </div>
        <div className="bg-muted/30 rounded-lg p-2.5">
          <p className="text-lg font-bold text-primary">{stats.totalSubmissions}</p>
          <p className="text-[10px] text-muted-foreground">Submissions</p>
        </div>
      </div>

      {/* Language Breakdown */}
      {Object.keys(stats.languageBreakdown).length > 0 && (
        <div>
          <p className="text-xs font-medium mb-2 text-muted-foreground">Languages</p>
          <div className="flex flex-wrap gap-1">
            {Object.entries(stats.languageBreakdown).map(([lang, count]) => (
              <Badge key={lang} variant="outline" className="text-[10px] px-1.5 py-0">
                {lang} <span className="text-muted-foreground ml-1">{count}</span>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

