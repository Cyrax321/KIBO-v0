import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Zap, Target, Send, Award, Clock } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface LiveActivityFeedProps {
  userId: string;
}

interface ActivityItem {
  id: string;
  type: "xp" | "problem" | "application" | "achievement";
  description: string;
  xp?: number;
  timestamp: Date;
}

const activityIcons = {
  xp: Zap,
  problem: Target,
  application: Send,
  achievement: Award,
};

const activityColors = {
  xp: "text-success bg-success/10",
  problem: "text-primary bg-primary/10",
  application: "text-blue-500 bg-blue-500/10",
  achievement: "text-warning bg-warning/10",
};

export const LiveActivityFeed: React.FC<LiveActivityFeedProps> = ({ userId }) => {
  const [activities, setActivities] = React.useState<ActivityItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!userId) return;

      try {
        // Fetch recent submissions
        const { data: submissions } = await supabase
          .from("submissions")
          .select("id, created_at, status, coding_problems(title, difficulty)")
          .eq("user_id", userId)
          .eq("status", "accepted")
          .order("created_at", { ascending: false })
          .limit(5);

        // Fetch recent applications
        const { data: applications } = await supabase
          .from("applications")
          .select("id, created_at, company, role")
          .eq("user_id", userId)
          .order("created_at", { ascending: false })
          .limit(3);

        // Fetch recent achievements
        const { data: achievements } = await supabase
          .from("user_achievements")
          .select("id, unlocked_at, achievements(name, xp_reward)")
          .eq("user_id", userId)
          .order("unlocked_at", { ascending: false })
          .limit(3);

        const allActivities: ActivityItem[] = [];

        submissions?.forEach((sub: any) => {
          allActivities.push({
            id: `sub-${sub.id}`,
            type: "problem",
            description: `Solved "${sub.coding_problems?.title || "Problem"}"`,
            xp: sub.coding_problems?.difficulty === "hard" ? 50 : sub.coding_problems?.difficulty === "medium" ? 30 : 15,
            timestamp: new Date(sub.created_at),
          });
        });

        applications?.forEach((app: any) => {
          allActivities.push({
            id: `app-${app.id}`,
            type: "application",
            description: `Applied to ${app.company} - ${app.role}`,
            xp: 10,
            timestamp: new Date(app.created_at),
          });
        });

        achievements?.forEach((ach: any) => {
          allActivities.push({
            id: `ach-${ach.id}`,
            type: "achievement",
            description: `Unlocked "${ach.achievements?.name}"`,
            xp: ach.achievements?.xp_reward || 0,
            timestamp: new Date(ach.unlocked_at),
          });
        });

        // Sort by timestamp and take top 6
        allActivities.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setActivities(allActivities.slice(0, 6));
      } catch (error) {
        console.error("Error fetching activities:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();

    // Subscribe to realtime updates
    const channel = supabase
      .channel("live-activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "submissions", filter: `user_id=eq.${userId}` },
        (payload) => {
          const newActivity: ActivityItem = {
            id: `sub-${payload.new.id}`,
            type: "problem",
            description: "Solved a problem",
            xp: 25,
            timestamp: new Date(payload.new.created_at),
          };
          setActivities((prev) => [newActivity, ...prev.slice(0, 5)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5 h-full">
        <div className="flex items-center gap-2 mb-4">
          <Activity className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Live Activity</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative">
          <Activity className="h-4 w-4 text-primary" />
          <span className="absolute -top-1 -right-1 h-2 w-2 bg-success rounded-full animate-pulse" />
        </div>
        <h3 className="font-semibold text-sm">Live Activity</h3>
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {activities.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No recent activity yet
            </p>
          ) : (
            activities.map((activity, index) => {
              const Icon = activityIcons[activity.type];
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20, scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: 20, scale: 0.95 }}
                  transition={{ 
                    type: "spring",
                    stiffness: 500,
                    damping: 30,
                    delay: index * 0.05 
                  }}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className={cn("rounded-lg p-1.5", activityColors[activity.type])}>
                    <Icon className="h-3 w-3" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate">{activity.description}</p>
                    <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                      <Clock className="h-2.5 w-2.5" />
                      {formatDistanceToNow(activity.timestamp, { addSuffix: true })}
                    </p>
                  </div>
                  {activity.xp && activity.xp > 0 && (
                    <span className="text-xs font-semibold text-success">+{activity.xp}</span>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
