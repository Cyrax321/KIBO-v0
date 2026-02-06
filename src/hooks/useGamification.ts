import * as React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  initDailyActivity,
  awardXP,
  recordProblemSolved,
  recordAssessmentCompleted,
  recordApplicationUpdate,
  checkAchievements,
  getLevelThresholds,
  getDailyActivities,
  getUserStats,
  calculateLevelProgress,
  XPResult,
  AchievementUnlock,
  LevelThreshold
} from "@/lib/gamification";
import { playSound } from "@/lib/sounds";
import confetti from "canvas-confetti";

interface UseGamificationOptions {
  showNotifications?: boolean;
}

export function useGamification(options: UseGamificationOptions = { showNotifications: true }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [userId, setUserId] = React.useState<string | null>(null);

  // Get current user
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch level thresholds
  const { data: levelThresholds = [] } = useQuery({
    queryKey: ['levelThresholds'],
    queryFn: getLevelThresholds,
    staleTime: Infinity,
  });

  // Fetch user stats
  const { data: userStats, refetch: refetchStats } = useQuery({
    queryKey: ['userStats', userId],
    queryFn: () => userId ? getUserStats(userId) : null,
    enabled: !!userId,
  });

  // Fetch daily activities for heatmap
  const { data: dailyActivities = [], refetch: refetchActivities } = useQuery({
    queryKey: ['dailyActivities', userId],
    queryFn: () => userId ? getDailyActivities(userId) : [],
    enabled: !!userId,
  });

  // Realtime: keep stats + heatmap in sync instantly (even across tabs/pages)
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`gamification:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['userStats', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_activities',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['dailyActivities', userId] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'user_achievements',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['userStats', userId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Initialize daily activity on mount
  React.useEffect(() => {
    if (userId) {
      initDailyActivity(userId).then((result) => {
        if (result?.is_new_day && options.showNotifications) {
          toast({
            title: "Welcome back",
            description: `Day ${result.streak} streak. +5 XP login bonus`,
          });
        }
        // Refresh relevant cached data immediately
        queryClient.invalidateQueries({ queryKey: ['userStats', userId] });
        queryClient.invalidateQueries({ queryKey: ['dailyActivities', userId] });
      }).catch((err) => {
        console.error('Failed to init daily activity:', err);
      });
    }
  }, [userId, queryClient, options.showNotifications, toast]);

  // Helper to show XP notification
  const showXPNotification = React.useCallback((result: XPResult, action: string) => {
    if (!options.showNotifications) return;

    if (result.leveled_up) {
      playSound("levelUp");
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#10b981", "#f59e0b"],
      });
      toast({
        title: "Level Up",
        description: `You're now level ${result.new_level}. +${result.xp_gained} XP`,
      });
    } else {
      playSound("xpGained");
      toast({
        title: `+${result.xp_gained} XP`,
        description: action,
      });
    }
  }, [toast, options.showNotifications]);

  // Helper to show achievement notification
  const showAchievementNotification = React.useCallback((achievements: AchievementUnlock[]) => {
    if (!options.showNotifications) return;

    achievements.forEach((achievement) => {
      playSound("achievement");
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 },
        colors: ["#f59e0b", "#eab308"],
      });
      toast({
        title: "Achievement Unlocked",
        description: `${achievement.achievement_name} (+${achievement.xp_reward} XP)`,
      });
    });
  }, [toast, options.showNotifications]);

  // Award XP mutation
  const awardXPMutation = useMutation({
    mutationFn: async ({ action, customXP }: { action: string; customXP?: number }) => {
      if (!userId) throw new Error("Not logged in");
      return awardXP(userId, action, customXP);
    },
    onSuccess: async (result, { action }) => {
      if (result) {
        showXPNotification(result, action);
        
        // Check for new achievements
        if (userId) {
          const achievements = await checkAchievements(userId);
          if (achievements.length > 0) {
            showAchievementNotification(achievements);
          }
        }
        
        // Invalidate queries to refresh data immediately
        queryClient.invalidateQueries({ queryKey: ['userStats', userId] });
        queryClient.invalidateQueries({ queryKey: ['dailyActivities', userId] });
      }
    },
  });

  // Record problem solved mutation
  const recordProblemMutation = useMutation({
    mutationFn: async ({ difficulty }: { difficulty: 'easy' | 'medium' | 'hard' }) => {
      if (!userId) throw new Error("Not logged in");
      return recordProblemSolved(userId, difficulty);
    },
    onSuccess: async (result, { difficulty }) => {
      if (result) {
        showXPNotification(result, `${difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} problem solved!`);
        
        if (userId) {
          const achievements = await checkAchievements(userId);
          if (achievements.length > 0) {
            showAchievementNotification(achievements);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['userStats', userId] });
        queryClient.invalidateQueries({ queryKey: ['dailyActivities', userId] });
      }
    },
  });

  // Record assessment mutation
  const recordAssessmentMutation = useMutation({
    mutationFn: async ({ 
      assessmentId, 
      score, 
      passed, 
      timeTaken 
    }: { 
      assessmentId: string; 
      score: number; 
      passed: boolean; 
      timeTaken: number;
    }) => {
      if (!userId) throw new Error("Not logged in");
      return recordAssessmentCompleted(userId, assessmentId, score, passed, timeTaken);
    },
    onSuccess: async (result, { passed }) => {
      if (result) {
        showXPNotification(result, passed ? "Assessment passed!" : "Assessment completed");
        
        if (userId) {
          const achievements = await checkAchievements(userId);
          if (achievements.length > 0) {
            showAchievementNotification(achievements);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['userStats', userId] });
        queryClient.invalidateQueries({ queryKey: ['dailyActivities', userId] });
      }
    },
  });

  // Record application update mutation
  const recordApplicationMutation = useMutation({
    mutationFn: async ({ oldStatus, newStatus }: { oldStatus: string; newStatus: string }) => {
      if (!userId) throw new Error("Not logged in");
      return recordApplicationUpdate(userId, oldStatus, newStatus);
    },
    onSuccess: async (result, { newStatus }) => {
      if (result && result.xp_gained > 0) {
        const message = newStatus === 'offer' 
          ? "Congratulations, you received an offer" 
          : "Application sent";
        toast({
          title: `+${result.xp_gained} XP`,
          description: message,
        });
        
        if (userId) {
          const achievements = await checkAchievements(userId);
          if (achievements.length > 0) {
            showAchievementNotification(achievements);
          }
        }
        
        queryClient.invalidateQueries({ queryKey: ['userStats', userId] });
        queryClient.invalidateQueries({ queryKey: ['dailyActivities', userId] });
      }
    },
  });

  // Calculate level progress
  const levelProgress = React.useMemo(() => {
    if (!userStats || levelThresholds.length === 0) {
      return { current: 0, next: 100, progress: 0, title: 'Novice' };
    }
    return calculateLevelProgress(userStats.totalXP, levelThresholds);
  }, [userStats, levelThresholds]);

  return {
    userId,
    userStats,
    levelProgress,
    levelThresholds,
    dailyActivities,
    
    // Actions
    awardXP: (action: string, customXP?: number) => awardXPMutation.mutate({ action, customXP }),
    recordProblemSolved: (difficulty: 'easy' | 'medium' | 'hard') => recordProblemMutation.mutate({ difficulty }),
    recordAssessment: (assessmentId: string, score: number, passed: boolean, timeTaken: number) => 
      recordAssessmentMutation.mutate({ assessmentId, score, passed, timeTaken }),
    recordApplicationUpdate: (oldStatus: string, newStatus: string) => 
      recordApplicationMutation.mutate({ oldStatus, newStatus }),
    
    // Refetch
    refetchStats,
    refetchActivities,
    
    // Loading states
    isLoading: awardXPMutation.isPending || recordProblemMutation.isPending || 
               recordAssessmentMutation.isPending || recordApplicationMutation.isPending,
  };
}
