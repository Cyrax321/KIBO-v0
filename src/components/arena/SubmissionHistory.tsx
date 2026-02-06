import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Clock, Code2, ChevronDown, ChevronUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format, formatDistanceToNow } from "date-fns";

interface Submission {
  id: string;
  problem_id: string;
  status: string;
  language: string;
  runtime_ms: number | null;
  memory_kb: number | null;
  created_at: string;
  code: string;
}

interface SubmissionHistoryProps {
  userId: string;
  problemId?: string;
  onViewCode?: (code: string, language: string) => void;
}

export const SubmissionHistory: React.FC<SubmissionHistoryProps> = ({
  userId,
  problemId,
  onViewCode,
}) => {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSubmissions = async () => {
      if (!userId) return;

      let query = supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(20);

      if (problemId) {
        query = query.eq("problem_id", problemId);
      }

      const { data, error } = await query;

      if (!error && data) {
        setSubmissions(data);
      }
      setLoading(false);
    };

    fetchSubmissions();

    // Realtime subscription
    const channel = supabase
      .channel(`submissions:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setSubmissions((prev) => [payload.new as Submission, ...prev.slice(0, 19)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, problemId]);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-12 bg-muted/50 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Code2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">No submissions yet</p>
        <p className="text-xs mt-1">Start solving problems to see your history</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <AnimatePresence mode="popLayout">
        {submissions.map((sub, index) => {
          const isAccepted = sub.status === "accepted";
          const isExpanded = expanded === sub.id;

          return (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.03 }}
              className="border border-border rounded-lg overflow-hidden"
            >
              <div
                className={cn(
                  "flex items-center justify-between p-3 cursor-pointer hover:bg-muted/30 transition-colors",
                  isAccepted ? "bg-success/5" : "bg-destructive/5"
                )}
                onClick={() => setExpanded(isExpanded ? null : sub.id)}
              >
                <div className="flex items-center gap-3">
                  {isAccepted ? (
                    <CheckCircle2 className="h-4 w-4 text-success" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="text-sm font-medium capitalize">
                      {sub.status.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="text-xs">
                    {sub.language}
                  </Badge>
                  {sub.runtime_ms && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {sub.runtime_ms}ms
                    </span>
                  )}
                  {isExpanded ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-border"
                  >
                    <div className="p-3 bg-muted/20">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(sub.created_at), "PPpp")}
                        </p>
                        {onViewCode && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewCode(sub.code, sub.language)}
                          >
                            View Code
                          </Button>
                        )}
                      </div>
                      {sub.memory_kb && (
                        <p className="text-xs text-muted-foreground">
                          Memory: {(sub.memory_kb / 1024).toFixed(2)} MB
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};
