import * as React from "react";
import { motion } from "framer-motion";
import { Clock, Users, Play, Building2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Assessment } from "./types";

interface AssessmentCardProps {
  assessment: Assessment;
  onStart: () => void;
}

export const AssessmentCard: React.FC<AssessmentCardProps> = ({ assessment, onStart }) => {
  const difficultyColor = {
    easy: "text-success bg-success/10",
    medium: "text-warning bg-warning/10",
    hard: "text-destructive bg-destructive/10",
  }[assessment.difficulty];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400 }}
    >
      <Card className="p-5 hover:shadow-lg transition-all border-border/50 hover:border-primary/30 cursor-pointer group" onClick={onStart}>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-muted-foreground" />
            <span className="font-semibold">{assessment.company}</span>
          </div>
          <Badge className={cn("text-xs capitalize", difficultyColor)}>
            {assessment.difficulty}
          </Badge>
        </div>
        
        <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">
          {assessment.title}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {assessment.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {assessment.duration_minutes} min
          </div>
          <div className="flex items-center gap-1">
            <Users className="h-4 w-4" />
            {assessment.problem_ids.length} Questions
          </div>
        </div>
        
        <Button className="w-full gap-2 group-hover:bg-primary transition-colors">
          <Play className="h-4 w-4" />
          Start Assessment
        </Button>
      </Card>
    </motion.div>
  );
};
