import { supabase } from "@/integrations/supabase/client";

export interface XPResult {
  new_xp: number;
  new_level: number;
  xp_gained: number;
  leveled_up: boolean;
}

export interface StreakResult {
  new_streak: number;
  streak_bonus: number;
}

export interface DailyInitResult {
  streak: number;
  daily_xp: number;
  is_new_day: boolean;
}

export interface AchievementUnlock {
  achievement_id: string;
  achievement_name: string;
  xp_reward: number;
}

export interface LevelThreshold {
  level: number;
  xp_required: number;
  title: string;
}

// Initialize daily activity (call on app load/login)
export async function initDailyActivity(userId: string): Promise<DailyInitResult | null> {
  const { data, error } = await supabase.rpc('init_daily_activity', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error initializing daily activity:', error);
    return null;
  }

  return data?.[0] || null;
}

// Award XP for an action
export async function awardXP(userId: string, action: string, customXP?: number): Promise<XPResult | null> {
  const { data, error } = await supabase.rpc('award_xp', {
    p_user_id: userId,
    p_action: action,
    p_custom_xp: customXP || null
  });

  if (error) {
    console.error('Error awarding XP:', error);
    return null;
  }

  return data?.[0] || null;
}

// Record problem solved
export async function recordProblemSolved(
  userId: string,
  difficulty: 'easy' | 'medium' | 'hard'
): Promise<XPResult & { new_problems_solved: number } | null> {
  const { data, error } = await supabase.rpc('record_problem_solved', {
    p_user_id: userId,
    p_difficulty: difficulty
  });

  if (error) {
    console.error('Error recording problem solved:', error);
    return null;
  }

  return data?.[0] || null;
}

// Record assessment completion
export async function recordAssessmentCompleted(
  userId: string,
  assessmentId: string,
  score: number,
  passed: boolean,
  timeTaken: number
): Promise<XPResult | null> {
  const { data, error } = await supabase.rpc('record_assessment_completed', {
    p_user_id: userId,
    p_assessment_id: assessmentId,
    p_score: score,
    p_passed: passed,
    p_time_taken: timeTaken
  });

  if (error) {
    console.error('Error recording assessment:', error);
    return null;
  }

  return data?.[0] || null;
}

// Record application status change
export async function recordApplicationUpdate(
  userId: string,
  oldStatus: string,
  newStatus: string,
  applicationId?: string
): Promise<{ new_xp: number; xp_gained: number } | null> {
  const { data, error } = await supabase.rpc('record_application_update', {
    p_user_id: userId,
    p_old_status: oldStatus,
    p_new_status: newStatus,
    p_application_id: applicationId
  });

  if (error) {
    console.error('Error recording application update:', error);
    return null;
  }

  return data?.[0] || null;
}

// Check and award achievements
export async function checkAchievements(userId: string): Promise<AchievementUnlock[]> {
  const { data, error } = await supabase.rpc('check_achievements', {
    p_user_id: userId
  });

  if (error) {
    console.error('Error checking achievements:', error);
    return [];
  }

  return data || [];
}

// Get level thresholds for progress display
export async function getLevelThresholds(): Promise<LevelThreshold[]> {
  const { data, error } = await supabase
    .from('level_thresholds')
    .select('*')
    .order('level', { ascending: true });

  if (error) {
    console.error('Error fetching level thresholds:', error);
    return [];
  }

  return data || [];
}

// Get XP config
export async function getXPConfig(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .from('xp_config')
    .select('id, xp_value');

  if (error) {
    console.error('Error fetching XP config:', error);
    return {};
  }

  return (data || []).reduce((acc, item) => {
    acc[item.id] = item.xp_value;
    return acc;
  }, {} as Record<string, number>);
}

// Get user's daily activities for heatmap (last 365 days)
export async function getDailyActivities(userId: string): Promise<{
  date: string;
  xp: number;
  problems: number;
  applications: number;
  assessments: number;
}[]> {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 365);

  const { data, error } = await supabase
    .from('daily_activities')
    .select('activity_date, xp_earned, problems_solved, applications_sent, assessments_completed')
    .eq('user_id', userId)
    .gte('activity_date', startDate.toISOString().split('T')[0])
    .order('activity_date', { ascending: true });

  if (error) {
    console.error('Error fetching daily activities:', error);
    return [];
  }

  return (data || []).map(d => ({
    date: d.activity_date,
    xp: d.xp_earned,
    problems: d.problems_solved,
    applications: d.applications_sent,
    assessments: d.assessments_completed
  }));
}

// Get user stats summary
export async function getUserStats(userId: string): Promise<{
  totalXP: number;
  level: number;
  streak: number;
  problemsSolved: number;
  applicationsCount: number;
  achievementsCount: number;
} | null> {
  const [profileRes, achievementsRes] = await Promise.all([
    supabase
      .from('profiles')
      .select('xp, level, streak, problems_solved, applications_count')
      .eq('user_id', userId)
      .single(),
    supabase
      .from('user_achievements')
      .select('id')
      .eq('user_id', userId)
  ]);

  if (profileRes.error) {
    console.error('Error fetching user stats:', profileRes.error);
    return null;
  }

  const profile = profileRes.data;

  return {
    totalXP: profile.xp || 0,
    level: profile.level || 1,
    streak: profile.streak || 0,
    problemsSolved: profile.problems_solved || 0,
    applicationsCount: profile.applications_count || 0,
    achievementsCount: achievementsRes.data?.length || 0
  };
}

// Calculate XP progress to next level
export function calculateLevelProgress(
  currentXP: number,
  thresholds: LevelThreshold[]
): { current: number; next: number; progress: number; title: string } {
  const currentLevel = thresholds.find(t => t.xp_required <= currentXP);
  const nextLevel = thresholds.find(t => t.xp_required > currentXP);

  if (!currentLevel) {
    return { current: 0, next: 100, progress: 0, title: 'Novice' };
  }

  if (!nextLevel) {
    return { current: currentXP, next: currentXP, progress: 100, title: currentLevel.title };
  }

  const xpInCurrentLevel = currentXP - currentLevel.xp_required;
  const xpNeededForNext = nextLevel.xp_required - currentLevel.xp_required;
  const progress = Math.min(100, Math.round((xpInCurrentLevel / xpNeededForNext) * 100));

  return {
    current: xpInCurrentLevel,
    next: xpNeededForNext,
    progress,
    title: currentLevel.title
  };
}
