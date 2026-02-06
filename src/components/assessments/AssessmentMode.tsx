import * as React from "react";
import { motion } from "framer-motion";
import { Clock, AlertTriangle } from "lucide-react";
import Editor from "@monaco-editor/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { Assessment } from "./types";

interface AssessmentModeProps {
  assessment: Assessment;
  onComplete: (passed: boolean, score: number) => void;
  onExit: () => void;
}

export const AssessmentMode: React.FC<AssessmentModeProps> = ({ assessment, onComplete, onExit }) => {
  const [timeLeft, setTimeLeft] = React.useState(assessment.duration_minutes * 60);
  const [currentQuestion, setCurrentQuestion] = React.useState(0);
  const [code, setCode] = React.useState("// Write your solution here\n");
  const [showWarning, setShowWarning] = React.useState(false);

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

  const progress = ((assessment.duration_minutes * 60 - timeLeft) / (assessment.duration_minutes * 60)) * 100;

  const handleSubmit = () => {
    // Simulate scoring
    const score = Math.floor(Math.random() * 40) + 60; // 60-100
    const passed = score >= 70;
    onComplete(passed, score);
  };

  return (
    <div className="fixed inset-0 bg-background z-50 flex flex-col">
      {/* Tab warning dialog */}
      <Dialog open={showWarning} onOpenChange={setShowWarning}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Tab Switch Detected
            </DialogTitle>
            <DialogDescription>
              Switching tabs during an assessment is monitored. This activity has been logged.
              Please stay focused on the assessment.
            </DialogDescription>
          </DialogHeader>
          <Button onClick={() => setShowWarning(false)}>I Understand</Button>
        </DialogContent>
      </Dialog>

      {/* Timer Bar */}
      <div className="h-1 bg-muted">
        <motion.div
          className={cn(
            "h-full transition-colors",
            timeLeft < 300 ? "bg-destructive" : timeLeft < 600 ? "bg-warning" : "bg-primary"
          )}
          style={{ width: `${100 - progress}%` }}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-4">
          <span className="font-bold">{assessment.title}</span>
          <Badge variant="secondary">
            Question {currentQuestion + 1} of {assessment.problem_ids.length}
          </Badge>
        </div>
        <div className="flex items-center gap-4">
          <div className={cn(
            "flex items-center gap-2 px-3 py-1 rounded-full font-mono font-bold",
            timeLeft < 300 ? "bg-destructive/10 text-destructive" : 
            timeLeft < 600 ? "bg-warning/10 text-warning" : "bg-muted"
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
      <div className="flex-1 flex">
        {/* Problem description */}
        <div className="w-1/2 border-r border-border p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">Two Sum</h2>
          <div className="prose prose-sm max-w-none">
            <p>
              Given an array of integers <code>nums</code> and an integer <code>target</code>, 
              return indices of the two numbers such that they add up to <code>target</code>.
            </p>
            <p>
              You may assume that each input would have exactly one solution, 
              and you may not use the same element twice.
            </p>
            <h4>Example:</h4>
            <pre className="bg-muted p-3 rounded-lg">
{`Input: nums = [2,7,11,15], target = 9
Output: [0,1]
Explanation: nums[0] + nums[1] == 9`}
            </pre>
          </div>
        </div>

        {/* Editor */}
        <div className="w-1/2 flex flex-col">
          <Editor
            height="100%"
            language="javascript"
            value={code}
            onChange={(value) => setCode(value || "")}
            theme="vs-light"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
            }}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card">
        <div className="flex gap-2">
          {assessment.problem_ids.map((_, i) => (
            <Button
              key={i}
              variant={currentQuestion === i ? "default" : "outline"}
              size="sm"
              onClick={() => setCurrentQuestion(i)}
            >
              Q{i + 1}
            </Button>
          ))}
        </div>
        <Button onClick={handleSubmit}>
          Submit Assessment
        </Button>
      </div>
    </div>
  );
};
