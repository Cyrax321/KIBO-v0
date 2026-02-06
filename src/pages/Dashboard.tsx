import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsHUD } from "@/components/dashboard/StatsHUD";
import { TheGarden } from "@/components/dashboard/TheGarden";
import { DailyFocus } from "@/components/dashboard/DailyFocus";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityHistory } from "@/components/dashboard/ActivityHistory";
import { ProgressCharts } from "@/components/dashboard/ProgressCharts";
import { WeeklyGoals } from "@/components/dashboard/WeeklyGoals";
import { ApplicationFunnel } from "@/components/dashboard/ApplicationFunnel";
import { StreakCalendar } from "@/components/dashboard/StreakCalendar";
import { SkillsRadar } from "@/components/dashboard/SkillsRadar";
import { LiveActivityFeed } from "@/components/dashboard/LiveActivityFeed";
import { SuccessRateGauge } from "@/components/dashboard/SuccessRateGauge";
import { WeeklyComparison } from "@/components/dashboard/WeeklyComparison";
import { CodeLabDashboard } from "@/components/dashboard/CodeLabDashboard";
import { CodeLabAnalytics } from "@/components/dashboard/CodeLabAnalytics";
import { RealtimeLeaderboard } from "@/components/leaderboard/RealtimeLeaderboard";
import { useGamification } from "@/hooks/useGamification";

// Smooth staggered animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 400,
      damping: 25,
    },
  },
};

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = React.useState<any>(null);
  const [profile, setProfile] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);

  const { userStats, levelProgress, dailyActivities, levelThresholds, refetchStats } = useGamification();

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setUser(session.user);

      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", session.user.id)
        .single();

      setProfile(profileData);
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Realtime profile sync for instant dashboard updates
  React.useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`dashboard-profile:${user.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(payload.new);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center gap-4"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="text-sm text-muted-foreground">Loading your command center...</span>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        className="p-2 sm:p-3 lg:p-4 space-y-1 w-full"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants}>
          <DashboardHeader
            userName={profile?.full_name || user?.email?.split("@")[0] || "Explorer"}
          />
        </motion.div>

        {/* Priority 1: High-Level Overview (StatsHUD) - Full width */}
        <motion.div variants={itemVariants}>
          <StatsHUD
            profile={profile}
            userStats={userStats}
            levelProgress={levelProgress}
            levelThresholds={levelThresholds}
          />
        </motion.div>

        {/* Priority 2: Visual Motivation (The Garden) - Full width */}
        <motion.div variants={itemVariants}>
          <TheGarden
            userId={user?.id}
            activities={dailyActivities}
          />
        </motion.div>

        {/* Progress Analytics + Leaderboard - Side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-1">
          <motion.div variants={itemVariants} className="lg:col-span-2">
            <ProgressCharts
              userId={user?.id}
              dailyActivities={dailyActivities}
            />
          </motion.div>
          <motion.div variants={itemVariants}>
            <RealtimeLeaderboard />
          </motion.div>
        </div>

        {/* Masonry Layout - Components auto-pack without whitespace */}
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-1 [column-fill:balance]">
          {/* Daily Focus */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <DailyFocus userId={user?.id} />
          </motion.div>

          {/* CodeLab Analytics - Compact version */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <CodeLabAnalytics userId={user?.id} />
          </motion.div>

          {/* Code Lab Stats */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <CodeLabDashboard userId={user?.id} />
          </motion.div>

          {/* Application Funnel */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <ApplicationFunnel userId={user?.id} />
          </motion.div>

          {/* Streak Calendar */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <StreakCalendar
              dailyActivities={dailyActivities}
              currentStreak={userStats?.streak || profile?.streak || 0}
            />
          </motion.div>

          {/* Skills Radar */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <SkillsRadar userId={user?.id} />
          </motion.div>

          {/* Weekly Goals */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <WeeklyGoals
              userId={user?.id}
              dailyActivities={dailyActivities}
            />
          </motion.div>

          {/* Success Rate */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <SuccessRateGauge userId={user?.id} />
          </motion.div>

          {/* Weekly Comparison */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <WeeklyComparison dailyActivities={dailyActivities} />
          </motion.div>

          {/* Live Activity Feed */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <LiveActivityFeed userId={user?.id} />
          </motion.div>

          {/* Activity History */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <ActivityHistory userId={user?.id} />
          </motion.div>

          {/* Quick Actions */}
          <motion.div variants={itemVariants} className="break-inside-avoid mb-1">
            <QuickActions />
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Dashboard;
