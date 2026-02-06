import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Trophy, Crown, Medal, Flame, TrendingUp, ChevronUp, ChevronDown,
  Minus, User, Zap, Star, Award, Clock, Gift
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { differenceInDays, endOfWeek } from "date-fns";

interface LeaderboardUser {
  id: string;
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  xp: number;
  level: number;
  problems_solved: number;
  streak: number;
  applications_count: number;
  rank?: number;
  previousRank?: number;
}

interface RealtimeLeaderboardProps {
  className?: string;
  compact?: boolean;
}

const RANK_ICONS = [Crown, Medal, Award];
const RANK_COLORS = ["text-warning", "text-muted-foreground", "text-primary"];

// Weekly XP rewards for top performers
const WEEKLY_REWARDS = [
  { rank: 1, xp: 1000, label: "🥇 1st Place" },
  { rank: 2, xp: 500, label: "🥈 2nd Place" },
  { rank: 3, xp: 250, label: "🥉 3rd Place" },
  { rank: 4, xp: 100, label: "Top 10" },
  { rank: 10, xp: 50, label: "Top 25" },
];

export const RealtimeLeaderboard: React.FC<RealtimeLeaderboardProps> = ({
  className,
  compact = false
}) => {
  const [users, setUsers] = React.useState<LeaderboardUser[]>([]);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState("xp");
  const [timeUntilReset, setTimeUntilReset] = React.useState("");

  // Calculate time until weekly reset (Sunday midnight)
  React.useEffect(() => {
    const updateTimer = () => {
      const now = new Date();
      const endOfCurrentWeek = endOfWeek(now, { weekStartsOn: 1 }); // Monday start
      const diff = differenceInDays(endOfCurrentWeek, now);
      const hours = Math.floor((endOfCurrentWeek.getTime() - now.getTime()) / (1000 * 60 * 60)) % 24;
      setTimeUntilReset(`${diff}d ${hours}h`);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchLeaderboard = React.useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setCurrentUserId(session.user.id);
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("id, user_id, full_name, avatar_url, xp, level, problems_solved, streak, applications_count")
      .order("xp", { ascending: false })
      .limit(100);

    if (!error && data) {
      const rankedUsers = data.map((user, index) => ({
        ...user,
        rank: index + 1,
      }));
      setUsers(rankedUsers);
    }
    setLoading(false);
  }, []);

  React.useEffect(() => {
    fetchLeaderboard();

    // Realtime subscription for profile updates
    const channel = supabase
      .channel("leaderboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
        },
        () => {
          // Refetch leaderboard on any profile change
          fetchLeaderboard();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchLeaderboard]);

  const getSortedUsers = () => {
    const sorted = [...users];
    switch (activeTab) {
      case "xp":
        sorted.sort((a, b) => b.xp - a.xp);
        break;
      case "problems":
        sorted.sort((a, b) => b.problems_solved - a.problems_solved);
        break;
      case "streak":
        sorted.sort((a, b) => b.streak - a.streak);
        break;
      case "applications":
        sorted.sort((a, b) => b.applications_count - a.applications_count);
        break;
    }
    return sorted.map((user, index) => ({ ...user, rank: index + 1 }));
  };

  const sortedUsers = getSortedUsers();
  const currentUserRank = sortedUsers.find((u) => u.user_id === currentUserId)?.rank || 0;

  const getStatValue = (user: LeaderboardUser) => {
    switch (activeTab) {
      case "xp":
        return user.xp.toLocaleString();
      case "problems":
        return user.problems_solved;
      case "streak":
        return `${user.streak} days`;
      case "applications":
        return user.applications_count;
      default:
        return user.xp;
    }
  };

  const getStatLabel = () => {
    switch (activeTab) {
      case "xp":
        return "XP";
      case "problems":
        return "Solved";
      case "streak":
        return "Streak";
      case "applications":
        return "Apps";
      default:
        return "XP";
    }
  };

  if (loading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-center h-32">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </Card>
    );
  }

  if (compact) {
    // Compact version for dashboard
    return (
      <Card className={cn("p-4", className)}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Trophy className="h-4 w-4 text-primary" />
            Leaderboard
          </h3>
          <Badge variant="secondary" className="text-xs">
            <Clock className="h-3 w-3 mr-1" />
            {timeUntilReset}
          </Badge>
        </div>

        <div className="space-y-2">
          {sortedUsers.slice(0, 5).map((user, index) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.05 }}
              className={cn(
                "flex items-center gap-2 p-2 rounded-lg transition-colors",
                user.user_id === currentUserId && "bg-primary/10 ring-1 ring-primary/20"
              )}
            >
              <span className={cn(
                "w-5 text-center font-bold text-sm",
                index < 3 ? RANK_COLORS[index] : "text-muted-foreground"
              )}>
                {index < 3 ? (
                  React.createElement(RANK_ICONS[index], { className: "h-4 w-4" })
                ) : (
                  index + 1
                )}
              </span>
              <Avatar className="h-6 w-6">
                <AvatarImage src={user.avatar_url || undefined} />
                <AvatarFallback className="text-xs">
                  {user.full_name?.[0] || "U"}
                </AvatarFallback>
              </Avatar>
              <span className="flex-1 text-sm truncate">
                {user.full_name || "Anonymous"}
              </span>
              <span className="text-xs font-medium text-muted-foreground">
                {user.xp.toLocaleString()} XP
              </span>
            </motion.div>
          ))}
        </div>

        {currentUserRank > 5 && (
          <div className="mt-3 pt-3 border-t">
            <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/10">
              <span className="w-5 text-center text-sm font-bold">{currentUserRank}</span>
              <User className="h-4 w-4" />
              <span className="flex-1 text-sm">You</span>
            </div>
          </div>
        )}
      </Card>
    );
  }

  // Full leaderboard view
  return (
    <Card className={cn("overflow-hidden", className)}>
      {/* Header with weekly rewards */}
      <div className="p-4 bg-gradient-to-r from-primary/10 to-primary/5 border-b">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            <h2 className="font-bold">Global Leaderboard</h2>
          </div>
          <Badge variant="outline" className="gap-1">
            <Clock className="h-3 w-3" />
            Resets in {timeUntilReset}
          </Badge>
        </div>

        {/* Weekly Rewards Preview */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Gift className="h-3.5 w-3.5 text-primary" />
          <span>Weekly rewards:</span>
          <span className="font-medium">🥇 +1000 XP</span>
          <span>•</span>
          <span className="font-medium">🥈 +500 XP</span>
          <span>•</span>
          <span className="font-medium">🥉 +250 XP</span>
        </div>
      </div>

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="px-4 pt-3">
          <TabsList className="w-full grid grid-cols-4">
            <TabsTrigger value="xp" className="gap-1">
              <Zap className="h-3.5 w-3.5" />
              XP
            </TabsTrigger>
            <TabsTrigger value="problems" className="gap-1">
              <Star className="h-3.5 w-3.5" />
              Problems
            </TabsTrigger>
            <TabsTrigger value="streak" className="gap-1">
              <Flame className="h-3.5 w-3.5" />
              Streak
            </TabsTrigger>
            <TabsTrigger value="applications" className="gap-1">
              <TrendingUp className="h-3.5 w-3.5" />
              Apps
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="mt-0">
          {/* Top 3 Podium */}
          <div className="px-4 py-4">
            <div className="flex items-end justify-center gap-2">
              {sortedUsers.slice(0, 3).map((user, index) => {
                const order = [1, 0, 2][index]; // 2nd, 1st, 3rd
                const heights = ["h-20", "h-28", "h-16"];
                const actualUser = sortedUsers[order];
                if (!actualUser) return null;

                return (
                  <motion.div
                    key={actualUser.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex flex-col items-center"
                  >
                    <Avatar className={cn("border-2 mb-2", order === 0 ? "h-16 w-16 border-warning" : "h-12 w-12 border-muted")}>
                      <AvatarImage src={actualUser.avatar_url || undefined} />
                      <AvatarFallback>{actualUser.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <p className="text-xs font-medium truncate max-w-[80px] text-center">
                      {actualUser.full_name || "Anonymous"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {getStatValue(actualUser)} {getStatLabel()}
                    </p>
                    <div className={cn(
                      "w-20 rounded-t-lg flex items-end justify-center",
                      order === 0 ? "bg-warning/20" : order === 1 ? "bg-muted" : "bg-primary/20",
                      heights[index]
                    )}>
                      {React.createElement(RANK_ICONS[order], {
                        className: cn("h-6 w-6 mb-2", RANK_COLORS[order])
                      })}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Full Rankings */}
          <ScrollArea className="h-[180px] px-4 pb-4">
            <div className="space-y-1">
              {sortedUsers.slice(3).map((user, index) => (
                <motion.div
                  key={user.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: Math.min(index * 0.02, 0.5) }}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-lg transition-all hover:bg-muted/50",
                    user.user_id === currentUserId && "bg-primary/10 ring-1 ring-primary/20"
                  )}
                >
                  <span className="w-8 text-center font-bold text-muted-foreground">
                    {user.rank}
                  </span>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || undefined} />
                    <AvatarFallback>{user.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {user.full_name || "Anonymous"}
                      {user.user_id === currentUserId && (
                        <Badge variant="secondary" className="ml-2 text-xs">You</Badge>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Level {user.level}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-sm">{getStatValue(user)}</p>
                    <p className="text-xs text-muted-foreground">{getStatLabel()}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>

      {/* Current User Position (if not in top) */}
      {currentUserRank > 10 && (
        <div className="p-4 border-t bg-muted/30">
          <div className="flex items-center gap-3">
            <span className="w-8 text-center font-bold">{currentUserRank}</span>
            <User className="h-5 w-5" />
            <span className="flex-1 font-medium">Your Position</span>
            <Badge variant="outline">
              {sortedUsers.find((u) => u.user_id === currentUserId)?.xp.toLocaleString() || 0} XP
            </Badge>
          </div>
        </div>
      )}
    </Card>
  );
};
