import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Plus, Target, X, Zap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { awardXP } from "@/lib/gamification";
import confetti from "canvas-confetti";

interface DailyFocusProps {
  userId: string;
}

interface Task {
  id: string;
  title: string;
  is_completed: boolean;
  xp_reward: number;
}

const DEFAULT_TASKS = [
  { title: "Solve 1 coding problem", task_type: "problem", xp_reward: 50 },
  { title: "Apply to 1 company", task_type: "application", xp_reward: 50 },
  { title: "Review your notes", task_type: "review", xp_reward: 20 },
];

export const DailyFocus: React.FC<DailyFocusProps> = ({ userId }) => {
  const [tasks, setTasks] = React.useState<Task[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [newTaskTitle, setNewTaskTitle] = React.useState("");
  const [showAddTask, setShowAddTask] = React.useState(false);

  const fetchTasks = React.useCallback(async () => {
    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_tasks")
      .select("id, title, is_completed, xp_reward")
      .eq("user_id", userId)
      .eq("task_date", today)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching tasks:", error);
      return;
    }

    // If no tasks for today, create default ones
    if (!data || data.length === 0) {
      const { data: newTasks } = await supabase
        .from("daily_tasks")
        .insert(
          DEFAULT_TASKS.map((t) => ({
            user_id: userId,
            task_date: today,
            ...t,
          }))
        )
        .select("id, title, is_completed, xp_reward");

      setTasks(newTasks || []);
    } else {
      setTasks(data);
    }
    setLoading(false);
  }, [userId]);

  React.useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId, fetchTasks]);

  // Realtime subscription
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`daily-focus:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "daily_tasks", filter: `user_id=eq.${userId}` },
        () => fetchTasks()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, fetchTasks]);

  const toggleTask = async (taskId: string, currentState: boolean) => {
    const newState = !currentState;
    const task = tasks.find((t) => t.id === taskId);

    // Optimistic update
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, is_completed: newState } : t))
    );

    const { error } = await supabase
      .from("daily_tasks")
      .update({
        is_completed: newState,
        completed_at: newState ? new Date().toISOString() : null,
      })
      .eq("id", taskId);

    if (error) {
      // Revert on error
      setTasks((prev) =>
        prev.map((t) => (t.id === taskId ? { ...t, is_completed: currentState } : t))
      );
      toast.error("Failed to update task");
      return;
    }

    if (newState && task) {
      // Award XP for completing task
      const result = await awardXP(userId, 'daily_task', task.xp_reward);

      // Mini confetti for task completion
      confetti({
        particleCount: 30,
        spread: 50,
        origin: { y: 0.8 },
        colors: ["#10b981", "#8b5cf6"],
      });

      toast.success(
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-warning" />
          <span>+{task.xp_reward} XP earned!</span>
        </div>
      );

      // Check if all tasks are completed
      const allCompleted = tasks.every(t => t.id === taskId ? true : t.is_completed);
      if (allCompleted) {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#8b5cf6", "#10b981", "#f59e0b"],
          });
          toast.success("All daily tasks completed. Bonus XP awarded");
          // Award bonus XP for completing all tasks
          awardXP(userId, 'all_tasks_completed', 50);
        }, 500);
      }
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) return;

    const today = new Date().toISOString().split("T")[0];

    const { data, error } = await supabase
      .from("daily_tasks")
      .insert({
        user_id: userId,
        task_date: today,
        title: newTaskTitle.trim(),
        task_type: "custom",
        xp_reward: 10,
      })
      .select("id, title, is_completed, xp_reward")
      .single();

    if (error) {
      toast.error("Failed to add task");
      return;
    }

    setTasks((prev) => [...prev, data]);
    setNewTaskTitle("");
    setShowAddTask(false);
    toast.success("Task added!");
  };

  const completedCount = tasks.filter((t) => t.is_completed).length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-white/20 bg-white/40 backdrop-blur-xl p-5 shadow-sm h-full flex flex-col"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-primary/10 p-2">
            <Target className="h-4 w-4 stroke-[1.5] text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Daily Focus</h3>
            <p className="text-xs text-muted-foreground">
              {completedCount}/{tasks.length} completed
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowAddTask(!showAddTask)}
          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          {showAddTask ? (
            <X className="h-4 w-4 stroke-[1.5]" />
          ) : (
            <Plus className="h-4 w-4 stroke-[1.5]" />
          )}
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-4 h-1.5 rounded-full bg-muted overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="h-full rounded-full bg-success"
        />
      </div>

      {/* Add task input */}
      <AnimatePresence>
        {showAddTask && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 overflow-hidden"
          >
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addTask()}
                placeholder="Add a task..."
                className="flex-1 rounded-lg border border-white/20 bg-white/60 px-3 py-2 text-sm outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/25"
                autoFocus
              />
              <button
                onClick={addTask}
                className="rounded-lg bg-primary px-3 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Add
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tasks list */}
      <div className="space-y-2">
        {loading ? (
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {tasks.map((task) => (
              <motion.div
                key={task.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => toggleTask(task.id, task.is_completed)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 transition-all",
                  task.is_completed
                    ? "border-success/30 bg-success/5"
                    : "border-white/20 bg-white/60 hover:border-primary/30 hover:bg-white/80"
                )}
              >
                <div
                  className={cn(
                    "flex h-5 w-5 items-center justify-center rounded-md border-2 transition-colors",
                    task.is_completed
                      ? "border-success bg-success"
                      : "border-muted-foreground/30"
                  )}
                >
                  {task.is_completed && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Check className="h-3 w-3 text-white" />
                    </motion.div>
                  )}
                </div>
                <span
                  className={cn(
                    "flex-1 text-sm transition-all",
                    task.is_completed
                      ? "text-muted-foreground line-through"
                      : "text-foreground"
                  )}
                >
                  {task.title}
                </span>
                <span className="text-[10px] font-medium text-success">
                  +{task.xp_reward} XP
                </span>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </motion.div>
  );
};
