import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Clock, Users, Trophy, Medal, Crown, Flame, Timer } from "lucide-react";
import { formatDistanceToNow, isPast, isFuture, differenceInSeconds } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Contest {
  id: string;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
  problem_ids: string[];
  is_active: boolean;
}

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  full_name: string;
  avatar_url: string | null;
  score: number;
  finish_time: string | null;
}

// Demo contests
const DEMO_CONTESTS: Contest[] = [
  {
    id: "weekly-104",
    title: "Weekly Contest 104",
    description: "Standard weekly contest with 4 problems of varying difficulty.",
    start_time: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // 4 hours from now
    end_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    problem_ids: ["p1", "p2", "p3", "p4"],
    is_active: true,
  },
  {
    id: "biweekly-50",
    title: "Biweekly Contest 50",
    description: "Biweekly challenge with medium-hard problems.",
    start_time: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 1 day from now
    end_time: new Date(Date.now() + 26 * 60 * 60 * 1000).toISOString(),
    problem_ids: ["p1", "p2", "p3", "p4"],
    is_active: true,
  },
  {
    id: "past-103",
    title: "Weekly Contest 103",
    description: "Previous week's contest.",
    start_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    end_time: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000).toISOString(),
    problem_ids: ["p1", "p2", "p3", "p4"],
    is_active: false,
  },
];

// Demo leaderboard
const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, user_id: "1", full_name: "Alex Chen", avatar_url: null, score: 400, finish_time: "00:45:23" },
  { rank: 2, user_id: "2", full_name: "Sarah Johnson", avatar_url: null, score: 400, finish_time: "00:52:11" },
  { rank: 3, user_id: "3", full_name: "Mike Wilson", avatar_url: null, score: 350, finish_time: "01:02:45" },
  { rank: 4, user_id: "4", full_name: "Emily Davis", avatar_url: null, score: 300, finish_time: "01:15:33" },
  { rank: 5, user_id: "5", full_name: "James Brown", avatar_url: null, score: 250, finish_time: "01:28:19" },
  { rank: 6, user_id: "6", full_name: "Lisa Anderson", avatar_url: null, score: 200, finish_time: "01:35:42" },
  { rank: 7, user_id: "7", full_name: "David Lee", avatar_url: null, score: 150, finish_time: "01:42:18" },
  { rank: 8, user_id: "8", full_name: "Anna Martinez", avatar_url: null, score: 100, finish_time: "01:55:09" },
];

const CountdownTimer: React.FC<{ targetDate: Date }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = React.useState(differenceInSeconds(targetDate, new Date()));

  React.useEffect(() => {
    const timer = setInterval(() => {
      const diff = differenceInSeconds(targetDate, new Date());
      setTimeLeft(Math.max(0, diff));
    }, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const hours = Math.floor(timeLeft / 3600);
  const minutes = Math.floor((timeLeft % 3600) / 60);
  const seconds = timeLeft % 60;

  return (
    <div className="flex items-center gap-1 font-mono text-lg font-bold">
      <span className="bg-muted px-2 py-1 rounded">{hours.toString().padStart(2, "0")}</span>
      <span>:</span>
      <span className="bg-muted px-2 py-1 rounded">{minutes.toString().padStart(2, "0")}</span>
      <span>:</span>
      <span className="bg-muted px-2 py-1 rounded">{seconds.toString().padStart(2, "0")}</span>
    </div>
  );
};

const ContestCard: React.FC<{
  contest: Contest;
  onRegister: () => void;
  isRegistered: boolean;
}> = ({ contest, onRegister, isRegistered }) => {
  const startDate = new Date(contest.start_time);
  const endDate = new Date(contest.end_time);
  const isUpcoming = isFuture(startDate);
  const isLive = isPast(startDate) && isFuture(endDate);
  const isPastContest = isPast(endDate);

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
    >
      <Card className={cn(
        "p-5 transition-shadow hover:shadow-md",
        isLive && "ring-2 ring-success"
      )}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-bold text-lg">{contest.title}</h3>
              {isLive && (
                <Badge className="bg-success text-success-foreground animate-pulse">LIVE</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{contest.description}</p>
          </div>
          <Trophy className="h-6 w-6 text-warning" />
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {contest.problem_ids.length} Problems
          </div>
          <div className="flex items-center gap-1">
            <Timer className="h-4 w-4" />
            2 Hours
          </div>
        </div>

        {isUpcoming && (
          <div className="mb-4">
            <p className="text-sm text-muted-foreground mb-2">Starts in:</p>
            <CountdownTimer targetDate={startDate} />
          </div>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>1,204 Registered</span>
          </div>
          
          {isPastContest ? (
            <Button variant="outline">View Results</Button>
          ) : isLive ? (
            <Button className="bg-success hover:bg-success/90">
              <Flame className="h-4 w-4 mr-2" />
              Enter Contest
            </Button>
          ) : isRegistered ? (
            <Button variant="secondary" disabled>Registered</Button>
          ) : (
            <Button onClick={onRegister}>Register</Button>
          )}
        </div>
      </Card>
    </motion.div>
  );
};

const RankIcon: React.FC<{ rank: number }> = ({ rank }) => {
  if (rank === 1) return <Crown className="h-5 w-5 text-yellow-500" />;
  if (rank === 2) return <Medal className="h-5 w-5 text-gray-400" />;
  if (rank === 3) return <Medal className="h-5 w-5 text-amber-600" />;
  return <span className="text-muted-foreground font-medium w-5 text-center">{rank}</span>;
};

const Contests: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [contests] = React.useState<Contest[]>(DEMO_CONTESTS);
  const [leaderboard] = React.useState<LeaderboardEntry[]>(DEMO_LEADERBOARD);
  const [registeredContests, setRegisteredContests] = React.useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = React.useState("upcoming");

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
    };
    checkAuth();
  }, [navigate]);

  const handleRegister = (contestId: string) => {
    setRegisteredContests(new Set([...registeredContests, contestId]));
    toast({ title: "Registered!", description: "You're registered for the contest. Good luck!" });
  };

  const upcomingContests = contests.filter(c => isFuture(new Date(c.start_time)));
  const pastContests = contests.filter(c => isPast(new Date(c.end_time)));

  const getInitials = (name: string) => 
    name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Contests</h1>
          <p className="text-muted-foreground text-sm">
            Compete with others in timed coding challenges
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr,400px]">
          {/* Contests List */}
          <div>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                <TabsTrigger value="past">Past Contests</TabsTrigger>
              </TabsList>

              <TabsContent value="upcoming" className="space-y-4 mt-0">
                {upcomingContests.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No upcoming contests</p>
                  </Card>
                ) : (
                  upcomingContests.map((contest) => (
                    <ContestCard
                      key={contest.id}
                      contest={contest}
                      onRegister={() => handleRegister(contest.id)}
                      isRegistered={registeredContests.has(contest.id)}
                    />
                  ))
                )}
              </TabsContent>

              <TabsContent value="past" className="space-y-4 mt-0">
                {pastContests.length === 0 ? (
                  <Card className="p-8 text-center">
                    <p className="text-muted-foreground">No past contests</p>
                  </Card>
                ) : (
                  pastContests.map((contest) => (
                    <ContestCard
                      key={contest.id}
                      contest={contest}
                      onRegister={() => {}}
                      isRegistered={false}
                    />
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>

          {/* Leaderboard */}
          <Card className="p-4 h-fit">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-warning" />
              Weekly Leaderboard
            </h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead className="text-right">Score</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {leaderboard.map((entry) => (
                  <TableRow key={entry.user_id}>
                    <TableCell>
                      <RankIcon rank={entry.rank} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarImage src={entry.avatar_url || undefined} />
                          <AvatarFallback className="text-xs bg-primary/10 text-primary">
                            {getInitials(entry.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{entry.full_name}</p>
                          <p className="text-xs text-muted-foreground">{entry.finish_time}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-semibold">{entry.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Contests;
