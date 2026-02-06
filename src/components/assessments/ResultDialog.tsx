import * as React from "react";
import { CheckCircle2, XCircle, Trophy, Target, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { QuizResult } from "./types";

interface ResultDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: QuizResult | null;
  type: "quiz" | "assessment";
}

export const ResultDialog: React.FC<ResultDialogProps> = ({ open, onOpenChange, result, type }) => {
  if (!result) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="text-center max-w-md">
        <DialogHeader>
          <DialogTitle className="flex flex-col items-center gap-4">
            {result.passed ? (
              <div className="relative">
                <div className="absolute inset-0 bg-success/20 blur-xl rounded-full" />
                <CheckCircle2 className="h-20 w-20 text-success relative" />
              </div>
            ) : (
              <div className="relative">
                <div className="absolute inset-0 bg-destructive/20 blur-xl rounded-full" />
                <XCircle className="h-20 w-20 text-destructive relative" />
              </div>
            )}
            <span className="text-2xl">
              {result.passed ? `${type === "quiz" ? "Quiz" : "Assessment"} Passed!` : `${type === "quiz" ? "Quiz" : "Assessment"} Completed`}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-6 space-y-6">
          {/* Score */}
          <div>
            <div className="text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {result.score}%
            </div>
            <p className="text-muted-foreground mt-1">
              {result.correct} of {result.total} correct
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Passing score: 70%</span>
              <span className={result.passed ? "text-success" : "text-destructive"}>
                Your score: {result.score}%
              </span>
            </div>
            <Progress 
              value={result.score} 
              className={`h-3 ${result.passed ? "[&>div]:bg-success" : "[&>div]:bg-destructive"}`}
            />
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div className="text-center">
              <Target className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-bold">{result.correct}</div>
              <div className="text-xs text-muted-foreground">Correct</div>
            </div>
            <div className="text-center">
              <XCircle className="h-5 w-5 mx-auto mb-1 text-muted-foreground" />
              <div className="font-bold">{result.total - result.correct}</div>
              <div className="text-xs text-muted-foreground">Wrong</div>
            </div>
            <div className="text-center">
              <Zap className="h-5 w-5 mx-auto mb-1 text-warning" />
              <div className="font-bold text-warning">+{result.xpEarned}</div>
              <div className="text-xs text-muted-foreground">XP</div>
            </div>
          </div>

          {/* Message */}
          <p className="text-muted-foreground">
            {result.passed 
              ? "Excellent work! You've demonstrated strong knowledge in this topic."
              : "Keep studying and try again. You'll get there!"}
          </p>
          
          {result.passed && (
            <Badge className="bg-success text-success-foreground gap-1">
              <Trophy className="h-3 w-3" />
              Achievement Unlocked
            </Badge>
          )}
        </div>
        
        <Button onClick={() => onOpenChange(false)} className="w-full">
          Continue
        </Button>
      </DialogContent>
    </Dialog>
  );
};
