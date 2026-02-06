import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Target, Code2 } from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";

interface SkillsRadarProps {
  userId: string;
}

interface SkillData {
  skill: string;
  count: number;
  fullMark: number;
}

export const SkillsRadar: React.FC<SkillsRadarProps> = ({ userId }) => {
  const [skillData, setSkillData] = React.useState<SkillData[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchSkillData = React.useCallback(async () => {
    if (!userId) return;

    try {
      // Get submissions with problem topics
      const { data: submissions } = await supabase
        .from("submissions")
        .select("problem_id, coding_problems(topic_tags)")
        .eq("user_id", userId)
        .eq("status", "accepted");

      if (submissions) {
        const topicCounts: Record<string, number> = {};
        const seenProblems = new Set<string>();

        submissions.forEach((sub: any) => {
          if (!seenProblems.has(sub.problem_id)) {
            seenProblems.add(sub.problem_id);
            const topics = sub.coding_problems?.topic_tags || [];
            topics.forEach((topic: string) => {
              topicCounts[topic] = (topicCounts[topic] || 0) + 1;
            });
          }
        });

        // Get top 6 topics
        const sortedTopics = Object.entries(topicCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 6);

        const maxCount = Math.max(...sortedTopics.map(([, c]) => c), 1);

        setSkillData(
          sortedTopics.map(([skill, count]) => ({
            skill: skill.length > 12 ? skill.slice(0, 12) + "..." : skill,
            count,
            fullMark: maxCount,
          }))
        );
      }
    } catch (error) {
      console.error("Error fetching skill data:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchSkillData();
  }, [fetchSkillData]);

  // Realtime subscription
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`skills-radar:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "submissions", filter: `user_id=eq.${userId}` },
        () => fetchSkillData()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchSkillData]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Target className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Skills Breakdown</h3>
        </div>
        <div className="h-[200px] flex items-center justify-center">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.35 }}
      className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6"
    >
      <div className="flex items-center gap-2 mb-4">
        <Target className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Skills Breakdown</h3>
      </div>

      {skillData.length === 0 ? (
        <div className="h-[200px] flex flex-col items-center justify-center">
          <Code2 className="h-12 w-12 text-muted-foreground/30 mb-3" />
          <p className="text-sm text-muted-foreground">No problems solved yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Solve coding problems to see your skill breakdown
          </p>
        </div>
      ) : (
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillData}>
              <PolarGrid className="stroke-muted/40" />
              <PolarAngleAxis
                dataKey="skill"
                tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, "dataMax"]}
                tick={false}
                axisLine={false}
              />
              <Radar
                name="Problems"
                dataKey="count"
                stroke="hsl(var(--primary))"
                fill="hsl(var(--primary))"
                fillOpacity={0.3}
                strokeWidth={2}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      )}

      {skillData.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2 justify-center">
          {skillData.slice(0, 3).map((skill, i) => (
            <div
              key={i}
              className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary"
            >
              {skill.skill}: {skill.count}
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
};
