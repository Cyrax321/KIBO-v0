import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen, Code2, Filter, History, Trophy, RotateCcw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import confetti from "canvas-confetti";
import { useGamification } from "@/hooks/useGamification";
import { playSound } from "@/lib/sounds";
import { format } from "date-fns";

// Import components
import { AssessmentCard } from "@/components/assessments/AssessmentCard";
import { AssessmentMode } from "@/components/assessments/AssessmentMode";
import { QuizCard } from "@/components/assessments/QuizCard";
import { QuizMode } from "@/components/assessments/QuizMode";
import { ResultDialog } from "@/components/assessments/ResultDialog";
import { Assessment, Quiz, QuizResult } from "@/components/assessments/types";
import { FAANG_QUIZZES, QUIZ_TOPICS } from "@/components/assessments/quizData";

interface QuizAttempt {
  id: string;
  quiz_id: string;
  quiz_title: string;
  quiz_topic: string;
  score: number;
  total_questions: number;
  correct_answers: number;
  passed: boolean;
  xp_earned: number;
  time_taken_seconds: number | null;
  completed_at: string;
}

// Demo assessments
const DEMO_ASSESSMENTS: Assessment[] = [
  {
    id: "google-oa",
    title: "Google Online Assessment",
    company: "Google",
    duration_minutes: 60,
    difficulty: "medium",
    description: "Standard Google OA with 2 algorithm questions focusing on arrays and strings.",
    problem_ids: ["demo-1", "demo-2"],
  },
  {
    id: "meta-oa",
    title: "Meta Technical Screen",
    company: "Meta",
    duration_minutes: 45,
    difficulty: "medium",
    description: "Meta's coding interview simulation with focus on data structures.",
    problem_ids: ["demo-1"],
  },
  {
    id: "amazon-oa",
    title: "Amazon OA",
    company: "Amazon",
    duration_minutes: 90,
    difficulty: "hard",
    description: "Amazon's Leadership Principles + Coding assessment simulation.",
    problem_ids: ["demo-1", "demo-2"],
  },
  {
    id: "microsoft-oa",
    title: "Microsoft Explore",
    company: "Microsoft",
    duration_minutes: 60,
    difficulty: "easy",
    description: "Microsoft Explore program assessment for early-career candidates.",
    problem_ids: ["demo-1"],
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const Assessments: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { awardXP, recordAssessment, userId } = useGamification({ showNotifications: true });

  // Tab state
  const [activeTab, setActiveTab] = React.useState("quizzes");

  // Assessment state
  const [assessments] = React.useState<Assessment[]>(DEMO_ASSESSMENTS);
  const [activeAssessment, setActiveAssessment] = React.useState<Assessment | null>(null);

  // Quiz state
  const [selectedTopic, setSelectedTopic] = React.useState("all");
  const [activeQuiz, setActiveQuiz] = React.useState<Quiz | null>(null);

  // History state
  const [quizAttempts, setQuizAttempts] = React.useState<QuizAttempt[]>([]);
  const [loadingHistory, setLoadingHistory] = React.useState(false);

  // Result state
  const [showResult, setShowResult] = React.useState(false);
  const [result, setResult] = React.useState<QuizResult | null>(null);
  const [resultType, setResultType] = React.useState<"quiz" | "assessment">("quiz");

  // Stats
  const [stats, setStats] = React.useState({
    totalAttempts: 0,
    passedCount: 0,
    totalXPEarned: 0,
    avgScore: 0,
  });

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchQuizHistory();
    };
    checkAuth();
  }, [navigate]);

  const fetchQuizHistory = async () => {
    setLoadingHistory(true);
    try {
      const { data, error } = await supabase
        .from("quiz_attempts")
        .select("*")
        .order("completed_at", { ascending: false })
        .limit(20);

      if (error) throw error;

      if (data) {
        setQuizAttempts(data);

        // Calculate stats
        const totalAttempts = data.length;
        const passedCount = data.filter(a => a.passed).length;
        const totalXPEarned = data.reduce((sum, a) => sum + (a.xp_earned || 0), 0);
        const avgScore = totalAttempts > 0
          ? Math.round(data.reduce((sum, a) => sum + a.score, 0) / totalAttempts)
          : 0;

        setStats({ totalAttempts, passedCount, totalXPEarned, avgScore });
      }
    } catch (error) {
      console.error("Error fetching quiz history:", error);
    } finally {
      setLoadingHistory(false);
    }
  };

  const filteredQuizzes = selectedTopic === "all"
    ? FAANG_QUIZZES
    : FAANG_QUIZZES.filter(q => q.topic === selectedTopic);

  const handleQuizComplete = async (quizResult: QuizResult & { attemptId: string }) => {
    setActiveQuiz(null);
    setResult(quizResult);
    setResultType("quiz");
    setShowResult(true);

    // Award XP through gamification system
    if (quizResult.passed) {
      playSound("quizPassed");
      awardXP('quiz_passed', quizResult.xpEarned);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#10b981", "#f59e0b"],
      });
      toast({
        title: "Quiz Passed",
        description: `You scored ${quizResult.score}%. +${quizResult.xpEarned} XP earned`
      });
    } else {
      awardXP('quiz_completed', Math.floor(quizResult.xpEarned / 2));
      toast({
        title: "Quiz Completed",
        description: `You scored ${quizResult.score}%. Keep practicing!`,
        variant: "destructive"
      });
    }

    // Refresh history
    fetchQuizHistory();
  };

  const handleAssessmentComplete = async (passed: boolean, score: number, timeTaken: number) => {
    setActiveAssessment(null);
    const xpEarned = passed ? 300 : 50;
    setResult({
      passed,
      score,
      correct: Math.round(score / 10),
      total: 10,
      xpEarned
    });
    setResultType("assessment");
    setShowResult(true);

    // Record assessment and award XP through gamification system
    if (activeAssessment) {
      recordAssessment(activeAssessment.id, score, passed, timeTaken);
    }

    if (passed) {
      playSound("quizPassed");
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#10b981"],
      });
      toast({
        title: "Assessment Passed",
        description: `You scored ${score}%. +${xpEarned} XP earned`
      });
    } else {
      toast({
        title: "Assessment Completed",
        description: `You scored ${score}%. Keep practicing!`,
        variant: "destructive"
      });
    }
  };

  // Get attempt count for a specific quiz
  const getQuizAttemptCount = (quizId: string) => {
    return quizAttempts.filter(a => a.quiz_id === quizId).length;
  };

  const getBestScore = (quizId: string) => {
    const attempts = quizAttempts.filter(a => a.quiz_id === quizId);
    if (attempts.length === 0) return null;
    return Math.max(...attempts.map(a => a.score));
  };

  // Full-screen modes
  if (activeQuiz) {
    return (
      <QuizMode
        quiz={activeQuiz}
        onComplete={handleQuizComplete}
        onExit={() => setActiveQuiz(null)}
      />
    );
  }

  if (activeAssessment) {
    return (
      <AssessmentMode
        assessment={activeAssessment}
        onComplete={(passed, score) => handleAssessmentComplete(passed, score, 0)}
        onExit={() => setActiveAssessment(null)}
      />
    );
  }

  return (
    <AppLayout>
      <motion.div
        className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Result Dialog */}
        <ResultDialog
          open={showResult}
          onOpenChange={setShowResult}
          result={result}
          type={resultType}
        />

        {/* Header */}
        <motion.div variants={itemVariants}>
          <h1 className="text-2xl font-bold text-foreground">Assessments & Quizzes</h1>
          <p className="text-muted-foreground text-sm">
            Test your knowledge with FAANG-style quizzes and mock assessments
          </p>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.totalAttempts}</p>
                <p className="text-xs text-muted-foreground">Total Attempts</p>
              </div>
              <History className="h-5 w-5 text-muted-foreground" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-success">{stats.passedCount}</p>
                <p className="text-xs text-muted-foreground">Quizzes Passed</p>
              </div>
              <Trophy className="h-5 w-5 text-success" />
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold text-primary">{stats.totalXPEarned}</p>
                <p className="text-xs text-muted-foreground">XP Earned</p>
              </div>
              <Badge variant="secondary">XP</Badge>
            </div>
          </Card>
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-2xl font-bold">{stats.avgScore}%</p>
                <p className="text-xs text-muted-foreground">Average Score</p>
              </div>
              <Badge variant={stats.avgScore >= 70 ? "default" : "secondary"}>
                {stats.avgScore >= 70 ? "Good" : "Practice"}
              </Badge>
            </div>
          </Card>
        </motion.div>

        {/* Tabs */}
        <motion.div variants={itemVariants}>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList className="grid w-full max-w-lg grid-cols-3">
              <TabsTrigger value="quizzes" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Topic Quizzes
              </TabsTrigger>
              <TabsTrigger value="assessments" className="gap-2">
                <Code2 className="h-4 w-4" />
                Mock OAs
              </TabsTrigger>
              <TabsTrigger value="history" className="gap-2">
                <History className="h-4 w-4" />
                History
              </TabsTrigger>
            </TabsList>

            {/* Quizzes Tab */}
            <TabsContent value="quizzes" className="space-y-6">
              {/* Topic Filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <Filter className="h-4 w-4 text-muted-foreground" />
                {QUIZ_TOPICS.map((topic) => (
                  <Button
                    key={topic.id}
                    variant={selectedTopic === topic.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedTopic(topic.id)}
                  >
                    {topic.label}
                  </Button>
                ))}
              </div>

              {/* Quiz Grid */}
              <motion.div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
              >
                {filteredQuizzes.map((quiz, index) => {
                  const attemptCount = getQuizAttemptCount(quiz.id);
                  const bestScore = getBestScore(quiz.id);

                  return (
                    <motion.div
                      key={quiz.id}
                      variants={itemVariants}
                    >
                      <QuizCard
                        quiz={quiz}
                        onStart={() => setActiveQuiz(quiz)}
                        attemptCount={attemptCount}
                        bestScore={bestScore}
                      />
                    </motion.div>
                  );
                })}
              </motion.div>

              {filteredQuizzes.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  No quizzes found for this topic.
                </div>
              )}
            </TabsContent>

            {/* Assessments Tab */}
            <TabsContent value="assessments" className="space-y-6">
              {/* Info Banner */}
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-xl">
                <h3 className="font-semibold text-primary mb-1">Mock Online Assessments</h3>
                <p className="text-sm text-muted-foreground">
                  Simulate real FAANG company OA environments with timed coding challenges,
                  tab-switch monitoring, and realistic problem sets.
                </p>
              </div>

              {/* Assessments Grid */}
              <motion.div
                className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
                variants={containerVariants}
              >
                {assessments.map((assessment, index) => (
                  <motion.div
                    key={assessment.id}
                    variants={itemVariants}
                  >
                    <AssessmentCard
                      assessment={assessment}
                      onStart={() => setActiveAssessment(assessment)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history" className="space-y-4">
              {loadingHistory ? (
                <div className="flex items-center justify-center py-12">
                  <RotateCcw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : quizAttempts.length === 0 ? (
                <div className="text-center py-12">
                  <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="font-semibold mb-2">No attempts yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Take your first quiz to see your history here
                  </p>
                </div>
              ) : (
                <motion.div className="space-y-3" variants={containerVariants}>
                  {quizAttempts.map((attempt, index) => (
                    <motion.div
                      key={attempt.id}
                      variants={itemVariants}
                    >
                      <Card className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h3 className="font-semibold">{attempt.quiz_title}</h3>
                              <Badge variant={attempt.passed ? "default" : "secondary"}>
                                {attempt.passed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {attempt.quiz_topic} • {format(new Date(attempt.completed_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="flex items-center gap-3">
                              <div>
                                <p className={`text-lg font-bold ${attempt.passed ? "text-success" : "text-muted-foreground"}`}>
                                  {attempt.score}%
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {attempt.correct_answers}/{attempt.total_questions} correct
                                </p>
                              </div>
                              <Badge variant="outline" className="text-primary">
                                +{attempt.xp_earned} XP
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </AppLayout>
  );
};

export default Assessments;
