import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, XCircle, Clock, Code2, ChevronDown, ChevronUp, RotateCcw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

interface SubmissionHistoryFullProps {
  userId: string;
  onViewCode?: (code: string, language: string) => void;
}

export const SubmissionHistoryFull: React.FC<SubmissionHistoryFullProps> = ({
  userId,
  onViewCode,
}) => {
  const [submissions, setSubmissions] = React.useState<Submission[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [expanded, setExpanded] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchSubmissions = async () => {
      if (!userId) return;

      const { data, error } = await supabase
        .from("submissions")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (!error && data) {
        setSubmissions(data);
      }
      setLoading(false);
    };

    fetchSubmissions();

    // Realtime subscription
    const channel = supabase
      .channel(`submissions-full:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "submissions",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          setSubmissions((prev) => [payload.new as Submission, ...prev.slice(0, 49)]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RotateCcw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (submissions.length === 0) {
    return (
      <div className="text-center py-12">
        <Code2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold mb-2">No submissions yet</h3>
        <p className="text-sm text-muted-foreground">
          Solve problems to see your submission history here
        </p>
      </div>
    );
  }

  return (
    <motion.div className="space-y-3">
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
              transition={{ delay: index * 0.02 }}
            >
              <Card className="overflow-hidden">
                <div
                  className={cn(
                    "flex items-center justify-between p-4 cursor-pointer hover:bg-muted/30 transition-colors",
                    isAccepted ? "border-l-4 border-l-success" : "border-l-4 border-l-destructive"
                  )}
                  onClick={() => setExpanded(isExpanded ? null : sub.id)}
                >
                  <div className="flex items-center gap-3">
                    {isAccepted ? (
                      <CheckCircle2 className="h-5 w-5 text-success" />
                    ) : (
                      <XCircle className="h-5 w-5 text-destructive" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-semibold capitalize">
                          {sub.status.replace(/_/g, " ")}
                        </p>
                        <Badge variant="secondary" className="text-xs">
                          {sub.language}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(sub.created_at), "MMM d, yyyy 'at' h:mm a")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    {sub.runtime_ms && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{sub.runtime_ms}ms</p>
                        <p className="text-xs text-muted-foreground">Runtime</p>
                      </div>
                    )}
                    {sub.memory_kb && (
                      <div className="text-right">
                        <p className="text-sm font-medium">{(sub.memory_kb / 1024).toFixed(1)}MB</p>
                        <p className="text-xs text-muted-foreground">Memory</p>
                      </div>
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
                      <div className="p-4 bg-muted/20">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-xs text-muted-foreground">
                            Submitted {formatDistanceToNow(new Date(sub.created_at), { addSuffix: true })}
                          </p>
                          {onViewCode && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewCode(sub.code, sub.language);
                              }}
                            >
                              Load Code in Editor
                            </Button>
                          )}
                        </div>
                        <pre className="text-xs bg-muted p-3 rounded-lg overflow-x-auto max-h-48 overflow-y-auto">
                          {sub.code.slice(0, 500)}
                          {sub.code.length > 500 && "..."}
                        </pre>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </motion.div>
  );
};
