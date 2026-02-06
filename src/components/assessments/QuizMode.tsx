import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, ChevronLeft, ChevronRight, CheckCircle2, XCircle, AlertTriangle, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { Quiz, QuizResult } from "./types";

interface QuizModeProps {
  quiz: Quiz;
  onComplete: (result: QuizResult & { attemptId: string }) => void;
  onExit: () => void;
}

export const QuizMode: React.FC<QuizModeProps> = ({ quiz, onComplete, onExit }) => {
  const [timeLeft, setTimeLeft] = React.useState(quiz.duration_minutes * 60);
  const [startTime] = React.useState(Date.now());
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [answers, setAnswers] = React.useState<Record<string, number>>({});
  const [showWarning, setShowWarning] = React.useState(false);
  const [tabSwitchCount, setTabSwitchCount] = React.useState(0);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Tab visibility warning
  React.useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        setTabSwitchCount((prev) => prev + 1);
        setShowWarning(true);
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    return () => document.removeEventListener("visibilitychange", handleVisibility);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((currentQuestion + 1) / quiz.questions.length) * 100;
  const question = quiz.questions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  const handleAnswer = (value: string) => {
    setAnswers((prev) => ({ ...prev, [question.id]: parseInt(value) }));
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    // Calculate results
    let correct = 0;
    const questionResults: Record<string, { selected: number; correct: number; isCorrect: boolean }> = {};
    
    quiz.questions.forEach((q) => {
      const selectedAnswer = answers[q.id];
      const isCorrect = selectedAnswer === q.correctIndex;
      if (isCorrect) correct++;
      
      questionResults[q.id] = {
        selected: selectedAnswer ?? -1,
        correct: q.correctIndex,
        isCorrect,
      };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= 70;
    const xpBase = quiz.difficulty === "easy" ? 50 : quiz.difficulty === "medium" ? 100 : 150;
    const xpEarned = passed ? xpBase + Math.floor(score / 10) * 10 : Math.floor(score / 10) * 5;
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);

    // Save to database
    let attemptId = "";
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase
          .from("quiz_attempts")
          .insert({
            user_id: session.user.id,
            quiz_id: quiz.id,
            quiz_title: quiz.title,
            quiz_topic: quiz.topic,
            score,
            total_questions: quiz.questions.length,
            correct_answers: correct,
            passed,
            answers: questionResults,
            xp_earned: xpEarned,
            time_taken_seconds: timeTaken,
            completed_at: new Date().toISOString(),
          })
          .select("id")
          .single();

        if (data) {
          attemptId = data.id;
        }
        if (error) {
          console.error("Failed to save quiz attempt:", error);
        }
      }
    } catch (error) {
      console.error("Error saving quiz attempt:", error);
    }

    onComplete({
      passed,
      score,
      correct,
      total: quiz.questions.length,
      xpEarned,
      attemptId,
    });
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Tab warning dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Tab Switch Detected ({tabSwitchCount})
            </DialogTitle>
            <DialogDescription>
              Switching tabs during a quiz is monitored. This has been recorded. 
              Multiple tab switches may affect your score in real assessments.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowWarning(false)}>I Understand</Button>
        </DialogContent>
      </Dialog>

      {/* Progress Bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className={cn(
            "h-full transition-colors",
            timeLeft < 60 ? "bg-destructive" : timeLeft < 180 ? "bg-warning" : "bg-primary"
          )}
          initial={{ width: "100%" }}
          animate={{ width: `${(timeLeft / (quiz.duration_minutes * 60)) * 100}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <span className="text-2xl">{quiz.icon}</span>
          <div>
            <h1 className="font-bold">{quiz.title}</h1>
            <p className="text-sm text-muted-foreground">{quiz.topic}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            {answeredCount}/{quiz.questions.length} answered
          </Badge>
          {tabSwitchCount > 0 && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="h-3 w-3" />
              {tabSwitchCount} tab switch{tabSwitchCount > 1 ? "es" : ""}
            </Badge>
          )}
          <div className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold",
            timeLeft < 60 ? "bg-destructive/10 text-destructive" : 
            timeLeft < 180 ? "bg-warning/10 text-warning" : "bg-muted"
          )}>
            <Clock className="h-4 w-4" />
            {formatTime(timeLeft)}
          </div>
          <Button variant="outline" size="sm" onClick={onExit}>
            Exit
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-2xl">
          {/* Question Progress */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                Question {currentQuestion + 1} of {quiz.questions.length}
              </span>
              <Badge variant={answers[question.id] !== undefined ? "default" : "secondary"}>
                {answers[question.id] !== undefined ? "Answered" : "Unanswered"}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Question Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="p-8">
                <h2 className="text-xl font-semibold mb-6 leading-relaxed">
                  {question.question}
                </h2>

                <RadioGroup
                  value={answers[question.id]?.toString()}
                  onValueChange={handleAnswer}
                  className="space-y-3"
                >
                  {question.options.map((option, idx) => (
                    <motion.div
                      key={idx}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                    >
                      <Label
                        htmlFor={`option-${idx}`}
                        className={cn(
                          "flex items-center gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                          answers[question.id] === idx
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-muted/50"
                        )}
                      >
                        <RadioGroupItem value={idx.toString()} id={`option-${idx}`} />
                        <span className="flex-1">{option}</span>
                      </Label>
                    </motion.div>
                  ))}
                </RadioGroup>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              onClick={handlePrev}
              disabled={currentQuestion === 0}
              className="gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>

            <div className="flex gap-2">
              {quiz.questions.map((q, i) => (
                <button
                  key={q.id}
                  onClick={() => setCurrentQuestion(i)}
                  className={cn(
                    "w-8 h-8 rounded-full text-xs font-medium transition-all",
                    currentQuestion === i
                      ? "bg-primary text-primary-foreground"
                      : answers[q.id] !== undefined
                      ? "bg-success/20 text-success"
                      : "bg-muted hover:bg-muted/80"
                  )}
                >
                  {i + 1}
                </button>
              ))}
            </div>

            {currentQuestion === quiz.questions.length - 1 ? (
              <Button onClick={handleSubmit} disabled={isSubmitting} className="gap-2">
                {isSubmitting ? (
                  <>
                    <RotateCcw className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    Submit Quiz
                    <CheckCircle2 className="h-4 w-4" />
                  </>
                )}
              </Button>
            ) : (
              <Button onClick={handleNext} className="gap-2">
                Next
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
