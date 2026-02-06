import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { 
  Code2, 
  FileText, 
  Trophy, 
  Briefcase, 
  CheckCircle2, 
  Clock,
  Zap,
  Target,
  Award
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface ActivityItem {
  id: string;
  type: 'problem' | 'assessment' | 'application' | 'achievement' | 'task' | 'xp';
  title: string;
  description?: string;
  xp?: number;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface ActivityHistoryProps {
  userId: string;
}

const activityIcons: Record<string, React.ElementType> = {
  problem: Code2,
  assessment: FileText,
  application: Briefcase,
  achievement: Trophy,
  task: CheckCircle2,
  xp: Zap,
};

const activityColors: Record<string, string> = {
  problem: "text-blue-500 bg-blue-500/10",
  assessment: "text-purple-500 bg-purple-500/10",
  application: "text-green-500 bg-green-500/10",
  achievement: "text-amber-500 bg-amber-500/10",
  task: "text-emerald-500 bg-emerald-500/10",
  xp: "text-primary bg-primary/10",
};

export const ActivityHistory: React.FC<ActivityHistoryProps> = ({ userId }) => {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchActivities = React.useCallback(async () => {
    if (!userId) return;

    try {
      // Fetch multiple activity types in parallel
      const [
        submissionsRes,
        assessmentAttemptsRes,
        applicationsRes,
        achievementsRes,
        tasksRes
      ] = await Promise.all([
        // Recent submissions (problems solved)
        supabase
          .from("submissions")
          .select("id, created_at, status, problem_id, coding_problems(title, difficulty)")
          .eq("user_id", userId)
          .eq("status", "accepted")
          .order("created_at", { ascending: false })
          .limit(10),
        
        // Assessment attempts
        supabase
          .from("assessment_attempts")
          .select("id, created_at, score, passed, assessments(title, company)")
          .eq("user_id", userId)
          .not("completed_at", "is", null)
          .order("created_at", { ascending: false })
          .limit(10),
        
        // Applications
        supabase
          .from("applications")
          .select("id, created_at, company, role, status")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(10),
        
        // Achievements
        supabase
          .from("user_achievements")
          .select("id, unlocked_at, achievements(name, description, xp_reward, icon)")
          .eq("user_id", userId)
          .order("unlocked_at", { ascending: false })
          .limit(10),
        
        // Completed tasks
        supabase
          .from("daily_tasks")
          .select("id, completed_at, title, xp_reward")
          .eq("user_id", userId)
          .eq("is_completed", true)
          .order("completed_at", { ascending: false })
          .limit(10),
      ]);

      const allActivities: ActivityItem[] = [];

      // Process submissions
      if (submissionsRes.data) {
        submissionsRes.data.forEach((sub: any) => {
          allActivities.push({
            id: `sub-${sub.id}`,
            type: "problem",
            title: `Solved: ${sub.coding_problems?.title || "Problem"}`,
            description: sub.coding_problems?.difficulty,
            xp: sub.coding_problems?.difficulty === "hard" ? 30 : sub.coding_problems?.difficulty === "medium" ? 20 : 10,
            timestamp: new Date(sub.created_at),
          });
        });
      }

      // Process assessment attempts
      if (assessmentAttemptsRes.data) {
        assessmentAttemptsRes.data.forEach((attempt: any) => {
          allActivities.push({
            id: `assess-${attempt.id}`,
            type: "assessment",
            title: `${attempt.passed ? "Passed" : "Completed"}: ${attempt.assessments?.title || "Assessment"}`,
            description: `${attempt.assessments?.company} • Score: ${attempt.score}%`,
            xp: attempt.passed ? 50 : 20,
            timestamp: new Date(attempt.created_at),
          });
        });
      }

      // Process applications
      if (applicationsRes.data) {
        applicationsRes.data.forEach((app: any) => {
          allActivities.push({
            id: `app-${app.id}`,
            type: "application",
            title: `Applied: ${app.role}`,
            description: app.company,
            xp: 15,
            timestamp: new Date(app.created_at),
            metadata: { status: app.status },
          });
        });
      }

      // Process achievements
      if (achievementsRes.data) {
        achievementsRes.data.forEach((ach: any) => {
          allActivities.push({
            id: `ach-${ach.id}`,
            type: "achievement",
            title: `Unlocked: ${ach.achievements?.name || "Achievement"}`,
            description: ach.achievements?.description,
            xp: ach.achievements?.xp_reward || 0,
            timestamp: new Date(ach.unlocked_at),
          });
        });
      }

      // Process completed tasks
      if (tasksRes.data) {
        tasksRes.data.forEach((task: any) => {
          if (task.completed_at) {
            allActivities.push({
              id: `task-${task.id}`,
              type: "task",
              title: `Completed: ${task.title}`,
              xp: task.xp_reward,
              timestamp: new Date(task.completed_at),
            });
          }
        });
      }

      // Sort by timestamp descending
      allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      
      setActivities(allActivities.slice(0, 20));
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  React.useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // Set up realtime subscriptions
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`activity-history:${userId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions", filter: `user_id=eq.${userId}` },
        () => fetchActivities()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "assessment_attempts", filter: `user_id=eq.${userId}` },
        () => fetchActivities()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applications", filter: `user_id=eq.${userId}` },
        () => fetchActivities()
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "user_achievements", filter: `user_id=eq.${userId}` },
        () => fetchActivities()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_tasks", filter: `user_id=eq.${userId}` },
        () => fetchActivities()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchActivities]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Activity History</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-xl bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-1/2 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Activity History</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {activities.length} recent
        </Badge>
      </div>

      <ScrollArea className="h-[320px] pr-4">
        {activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <Target className="h-12 w-12 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">No activities yet</p>
            <p className="text-xs text-muted-foreground/70 mt-1">
              Start solving problems, taking assessments, or applying to jobs!
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            <div className="space-y-3">
              {activities.map((activity, index) => {
                const Icon = activityIcons[activity.type] || Zap;
                const colorClass = activityColors[activity.type] || activityColors.xp;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    transition={{ delay: index * 0.03 }}
                    className="flex gap-3 group"
                  >
                    <div className={cn(
                      "flex-shrink-0 h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105",
                      colorClass
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium truncate">{activity.title}</p>
                        {activity.xp && activity.xp > 0 && (
                          <Badge variant="outline" className="flex-shrink-0 text-xs text-primary border-primary/30">
                            +{activity.xp} XP
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        {activity.description && (
                          <span className="text-xs text-muted-foreground truncate">
                            {activity.description}
                          </span>
                        )}
                        <span className="text-[10px] text-muted-foreground/70">
                          • {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </ScrollArea>
    </motion.div>
  );
};
