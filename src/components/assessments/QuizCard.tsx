import * as React from "react";
import { motion } from "framer-motion";
import { Clock, HelpCircle, Play, Code2, Brain, Server, Users, Cpu, Globe, Database, FileCode, Trophy, RotateCcw } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Quiz } from "./types";

interface QuizCardProps {
  quiz: Quiz;
  onStart: () => void;
  attemptCount?: number;
  bestScore?: number | null;
}

// Map topics to icons
const topicIcons: Record<string, React.ElementType> = {
  "Data Structures": Code2,
  "Algorithms": Brain,
  "System Design": Server,
  "Behavioral": Users,
  "CS Fundamentals": Cpu,
  "Languages": FileCode,
  "Databases": Database,
};

export const QuizCard: React.FC<QuizCardProps> = ({ quiz, onStart, attemptCount = 0, bestScore }) => {
  const difficultyColor = {
    easy: "text-success bg-success/10",
    medium: "text-warning bg-warning/10",
    hard: "text-destructive bg-destructive/10",
  }[quiz.difficulty];

  const TopicIcon = topicIcons[quiz.topic] || Code2;
  const hasAttempted = attemptCount > 0;

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "tween", ease: [0.16, 1, 0.3, 1], duration: 0.25 }}
    >
      <Card className="p-5 transition-all duration-300 ease-out hover:shadow-xl border-border/50 hover:border-primary/20 cursor-pointer group relative" onClick={onStart}>
        {/* Best Score Badge */}
        {bestScore !== null && bestScore !== undefined && (
          <div className="absolute -top-2 -right-2">
            <Badge 
              variant={bestScore >= 70 ? "default" : "secondary"} 
              className={cn(
                "gap-1 shadow-md",
                bestScore >= 70 ? "bg-success text-white" : ""
              )}
            >
              <Trophy className="h-3 w-3" />
              {bestScore}%
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <TopicIcon className="h-4 w-4 text-primary" />
            </div>
            <Badge variant="secondary" className="text-xs">
              {quiz.topic}
            </Badge>
          </div>
          <Badge className={cn("text-xs capitalize", difficultyColor)}>
            {quiz.difficulty}
          </Badge>
        </div>
        
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
          {quiz.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {quiz.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {quiz.duration_minutes} min
          </div>
          <div className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            {quiz.questions.length} Questions
          </div>
          {attemptCount > 0 && (
            <div className="flex items-center gap-1 text-primary">
              <RotateCcw className="h-3.5 w-3.5" />
              {attemptCount} attempt{attemptCount > 1 ? "s" : ""}
            </div>
          )}
        </div>
        
        <Button className="w-full gap-2 group-hover:bg-primary transition-colors">
          <Play className="h-4 w-4" />
          {hasAttempted ? "Retake Quiz" : "Start Quiz"}
        </Button>
      </Card>
    </motion.div>
  );
};
