import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Trophy, Award, Target, Flame, Code2, Users, Heart, 
  Crown, Medal, Zap, Star, CheckCircle2, Lock, Gift,
  Briefcase, MessageSquare, TrendingUp, Rocket, Shield, Sparkles
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { RealtimeLeaderboard } from "@/components/leaderboard/RealtimeLeaderboard";

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
  requirement_type: string;
  requirement_value: number;
  unlocked: boolean;
  progress: number;
}

interface UserStats {
  xp: number;
  level: number;
  problems_solved: number;
  streak: number;
  applications_count: number;
}

const ICON_MAP: Record<string, React.ElementType> = {
  trophy: Trophy,
  award: Award,
  crown: Crown,
  target: Target,
  briefcase: Briefcase,
  flame: Flame,
  fire: Flame,
  users: Users,
  heart: Heart,
  code: Code2,
  star: Star,
  zap: Zap,
  medal: Medal,
  rocket: Rocket,
  shield: Shield,
  sparkles: Sparkles,
  trending: TrendingUp,
  message: MessageSquare,
  gift: Gift,
};

const CATEGORIES = [
  { id: "all", label: "All", icon: Sparkles },
  { id: "problems_solved", label: "Coding", icon: Code2 },
  { id: "applications", label: "Applications", icon: Briefcase },
  { id: "streak", label: "Streaks", icon: Flame },
  { id: "level", label: "Level", icon: TrendingUp },
  { id: "social", label: "Social", icon: Users },
  { id: "assessments", label: "Assessments", icon: Target },
];

const AchievementCard: React.FC<{ achievement: Achievement }> = ({ achievement }) => {
  const Icon = ICON_MAP[achievement.icon] || ICON_MAP[achievement.icon.toLowerCase()] || Trophy;

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all cursor-pointer",
        achievement.unlocked 
          ? "bg-gradient-to-br from-card to-card/80 border-primary/30 shadow-lg shadow-primary/5" 
          : "bg-muted/30 border-border hover:border-border/80"
      )}
    >
      {/* Shine effect for unlocked */}
      {achievement.unlocked && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
        />
      )}

      {/* Status indicator */}
      <div className="absolute top-2 right-2">
        {achievement.unlocked ? (
          <CheckCircle2 className="h-5 w-5 text-success" />
        ) : (
          <Lock className="h-4 w-4 text-muted-foreground" />
        )}
      </div>

      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className={cn(
          "flex h-14 w-14 items-center justify-center rounded-xl transition-all",
          achievement.unlocked 
            ? "bg-primary/15 text-primary shadow-inner" 
            : "bg-muted text-muted-foreground"
        )}>
          <Icon className="h-7 w-7" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className={cn(
            "font-semibold",
            !achievement.unlocked && "text-muted-foreground"
          )}>
            {achievement.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
            {achievement.description}
          </p>
          
          {/* XP Reward */}
          <Badge 
            variant={achievement.unlocked ? "default" : "secondary"} 
            className={cn("mt-2", achievement.unlocked && "bg-primary/90")}
          >
            <Zap className="h-3 w-3 mr-1" />
            +{achievement.xp_reward.toLocaleString()} XP
          </Badge>
        </div>
      </div>

      {/* Progress bar for locked achievements */}
      {!achievement.unlocked && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{Math.min(achievement.progress, 100)}%</span>
          </div>
          <Progress value={Math.min(achievement.progress, 100)} className="h-2" />
        </div>
      )}
    </motion.div>
  );
};

const Achievements: React.FC = () => {
  const navigate = useNavigate();
  const [achievements, setAchievements] = React.useState<Achievement[]>([]);
  const [userStats, setUserStats] = React.useState<UserStats | null>(null);
  const [userAchievements, setUserAchievements] = React.useState<Set<string>>(new Set());
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchData = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      // Fetch all achievements
      const { data: allAchievements } = await supabase
        .from("achievements")
        .select("*")
        .order("requirement_value", { ascending: true });

      // Fetch user's unlocked achievements
      const { data: unlockedAchievements } = await supabase
        .from("user_achievements")
        .select("achievement_id")
        .eq("user_id", session.user.id);

      // Fetch user stats
      const { data: profile } = await supabase
        .from("profiles")
        .select("xp, level, problems_solved, streak, applications_count")
        .eq("user_id", session.user.id)
        .single();

      if (unlockedAchievements) {
        setUserAchievements(new Set(unlockedAchievements.map(ua => ua.achievement_id)));
      }

      if (profile) {
        setUserStats(profile);
      }

      if (allAchievements && profile) {
        // Calculate progress for each achievement
        const achievementsWithProgress = allAchievements.map(a => {
          const unlocked = unlockedAchievements?.some(ua => ua.achievement_id === a.id) || false;
          let progress = 0;
          
          switch (a.requirement_type) {
            case "problems_solved":
              progress = Math.round((profile.problems_solved / a.requirement_value) * 100);
              break;
            case "applications":
            case "applications_sent":
              progress = Math.round((profile.applications_count / a.requirement_value) * 100);
              break;
            case "streak":
            case "streak_days":
              progress = Math.round((profile.streak / a.requirement_value) * 100);
              break;
            case "level":
              progress = Math.round((profile.level / a.requirement_value) * 100);
              break;
            case "total_xp":
              progress = Math.round((profile.xp / a.requirement_value) * 100);
              break;
            default:
              progress = 0;
          }

          return {
            ...a,
            unlocked,
            progress: Math.min(progress, 100),
          };
        });

        // Sort: unlocked first (by xp_reward desc), then locked (by progress desc)
        achievementsWithProgress.sort((a, b) => {
          if (a.unlocked && !b.unlocked) return -1;
          if (!a.unlocked && b.unlocked) return 1;
          if (a.unlocked && b.unlocked) return b.xp_reward - a.xp_reward;
          return b.progress - a.progress;
        });

        setAchievements(achievementsWithProgress);
      }

      setLoading(false);
    };

    fetchData();
  }, [navigate]);

  const filteredAchievements = achievements.filter((a) => {
    if (activeCategory === "all") return true;
    if (activeCategory === "social") {
      return ["connections", "connections_count", "posts_created", "upvotes_received"].includes(a.requirement_type);
    }
    if (activeCategory === "assessments") {
      return ["assessments_completed", "perfect_scores"].includes(a.requirement_type);
    }
    return a.requirement_type === activeCategory || 
           a.requirement_type === `${activeCategory}_sent` ||
           a.requirement_type === `${activeCategory}_days`;
  });

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalXP = achievements.filter(a => a.unlocked).reduce((sum, a) => sum + a.xp_reward, 0);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">
          {/* Main Content */}
          <div>
            {/* Header */}
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <Trophy className="h-6 w-6 text-primary" />
                Achievements & Trophies
              </h1>
              <p className="text-muted-foreground text-sm">
                Unlock achievements, earn XP, and climb the leaderboard
              </p>
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 sm:grid-cols-4 mb-6">
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
                    <Trophy className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{unlockedCount}/{achievements.length}</p>
                    <p className="text-xs text-muted-foreground">Unlocked</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                    <Zap className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{totalXP.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">XP Earned</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-warning/10">
                    <Star className="h-5 w-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{Math.round((unlockedCount / achievements.length) * 100)}%</p>
                    <p className="text-xs text-muted-foreground">Completion</p>
                  </div>
                </div>
              </Card>
              <Card className="p-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent">
                    <Flame className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xl font-bold">{userStats?.streak || 0}</p>
                    <p className="text-xs text-muted-foreground">Day Streak</p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Categories */}
            <ScrollArea className="w-full mb-6">
              <Tabs value={activeCategory} onValueChange={setActiveCategory}>
                <TabsList className="inline-flex h-auto p-1 gap-1">
                  {CATEGORIES.map((cat) => (
                    <TabsTrigger 
                      key={cat.id} 
                      value={cat.id}
                      className="gap-1.5 px-3"
                    >
                      <cat.icon className="h-3.5 w-3.5" />
                      {cat.label}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </Tabs>
            </ScrollArea>

            {/* Achievements Grid */}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {filteredAchievements.map((achievement, index) => (
                <motion.div
                  key={achievement.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.3) }}
                >
                  <AchievementCard achievement={achievement} />
                </motion.div>
              ))}
              {filteredAchievements.length === 0 && (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                  No achievements in this category yet
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Leaderboard */}
          <div className="space-y-4">
            <RealtimeLeaderboard />
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Achievements;
