import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Briefcase, ArrowRight } from "lucide-react";

interface ApplicationFunnelProps {
  userId: string;
}

interface StatusCount {
  status: string;
  count: number;
  label: string;
  color: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; order: number }> = {
  wishlist: { label: "Wishlist", color: "bg-muted-foreground", order: 0 },
  applied: { label: "Applied", color: "bg-blue-500", order: 1 },
  screening: { label: "Screening", color: "bg-amber-500", order: 2 },
  interview: { label: "Interview", color: "bg-purple-500", order: 3 },
  offer: { label: "Offer", color: "bg-emerald-500", order: 4 },
  rejected: { label: "Rejected", color: "bg-destructive", order: 5 },
};

export const ApplicationFunnel: React.FC<ApplicationFunnelProps> = ({ userId }) => {
  const [statusCounts, setStatusCounts] = React.useState<StatusCount[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [totalApps, setTotalApps] = React.useState(0);

  React.useEffect(() => {
    const fetchApplicationStats = async () => {
      if (!userId) return;

      try {
        const { data, error } = await supabase
          .from("applications")
          .select("status")
          .eq("user_id", userId);

        if (error) throw error;

        const counts: Record<string, number> = {};
        (data || []).forEach((app) => {
          const status = app.status || "wishlist";
          counts[status] = (counts[status] || 0) + 1;
        });

        const total = Object.values(counts).reduce((sum, c) => sum + c, 0);
        setTotalApps(total);

        const sortedCounts = Object.entries(counts)
          .map(([status, count]) => ({
            status,
            count,
            label: STATUS_CONFIG[status]?.label || status,
            color: STATUS_CONFIG[status]?.color || "bg-muted",
          }))
          .sort((a, b) => {
            const orderA = STATUS_CONFIG[a.status]?.order ?? 99;
            const orderB = STATUS_CONFIG[b.status]?.order ?? 99;
            return orderA - orderB;
          });

        setStatusCounts(sortedCounts);
      } catch (error) {
        console.error("Error fetching application stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplicationStats();

    // Subscribe to changes
    const channel = supabase
      .channel(`app-funnel:${userId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${userId}` },
        () => fetchApplicationStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Application Funnel</h3>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-8 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      </motion.div>
    );
  }

  const maxCount = Math.max(...statusCounts.map((s) => s.count), 1);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-semibold">Application Funnel</h3>
        </div>
        <span className="text-sm text-muted-foreground">{totalApps} total</span>
      </div>

      {statusCounts.length === 0 ? (
        <div className="text-center py-8">
          <Briefcase className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No applications yet</p>
          <p className="text-xs text-muted-foreground/70 mt-1">
            Start tracking your job applications!
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {statusCounts.map((status, index) => {
            const width = (status.count / maxCount) * 100;

            return (
              <motion.div
                key={status.status}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="space-y-1"
              >
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{status.label}</span>
                  <span className="font-medium">{status.count}</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    transition={{ duration: 0.6, delay: 0.2 + index * 0.05 }}
                    className={cn("h-full rounded-full", status.color)}
                  />
                </div>
              </motion.div>
            );
          })}

          {/* Conversion rates */}
          <div className="mt-4 pt-4 border-t border-border/50">
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Response Rate</span>
              <span className="font-medium text-foreground">
                {totalApps > 0
                  ? Math.round(
                    ((statusCounts.find(s => s.status === 'screening')?.count || 0) +
                      (statusCounts.find(s => s.status === 'interview')?.count || 0) +
                      (statusCounts.find(s => s.status === 'offer')?.count || 0)) /
                    Math.max(statusCounts.find(s => s.status === 'applied')?.count || 1, 1) * 100
                  )
                  : 0}%
              </span>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
              <span>Offer Rate</span>
              <span className="font-medium text-foreground">
                {totalApps > 0
                  ? Math.round(
                    (statusCounts.find(s => s.status === 'offer')?.count || 0) /
                    Math.max(statusCounts.find(s => s.status === 'applied')?.count || 1, 1) * 100
                  )
                  : 0}%
              </span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
};
