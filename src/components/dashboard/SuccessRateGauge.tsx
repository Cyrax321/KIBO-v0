import * as React from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuccessRateGaugeProps {
  userId: string;
}

export const SuccessRateGauge: React.FC<SuccessRateGaugeProps> = ({ userId }) => {
  const [stats, setStats] = React.useState({
    responseRate: 0,
    offerRate: 0,
    totalApps: 0,
    responses: 0,
    offers: 0,
  });
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      try {
        const { data: applications } = await supabase
          .from("applications")
          .select("status")
          .eq("user_id", userId);

        if (applications) {
          const total = applications.length;
          const responses = applications.filter(
            (a) => ["phone_screen", "technical", "onsite", "offer", "rejected"].includes(a.status)
          ).length;
          const offers = applications.filter((a) => a.status === "offer").length;

          setStats({
            responseRate: total > 0 ? Math.round((responses / total) * 100) : 0,
            offerRate: responses > 0 ? Math.round((offers / responses) * 100) : 0,
            totalApps: total,
            responses,
            offers,
          });
        }
      } catch (error) {
        console.error("Error fetching success rate:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    // Realtime subscription
    const channel = supabase
      .channel("success-rate")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "applications", filter: `user_id=eq.${userId}` },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId]);

  const GaugeCircle = ({ 
    percentage, 
    color, 
    label 
  }: { 
    percentage: number; 
    color: string; 
    label: string;
  }) => {
    const circumference = 2 * Math.PI * 40;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <div className="flex flex-col items-center">
        <div className="relative h-24 w-24">
          <svg className="h-24 w-24 -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke="hsl(var(--muted))"
              strokeWidth="8"
            />
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              fill="none"
              stroke={color}
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1, delay: 0.3, ease: "easeOut" }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold">{percentage}%</span>
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-2">{label}</p>
      </div>
    );
  };

  const getTrend = (rate: number) => {
    if (rate >= 30) return { icon: TrendingUp, color: "text-success", label: "Great" };
    if (rate >= 15) return { icon: Minus, color: "text-warning", label: "Average" };
    return { icon: TrendingDown, color: "text-destructive", label: "Needs work" };
  };

  if (loading) {
    return (
      <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5 h-full">
        <h3 className="font-semibold text-sm mb-4">Success Metrics</h3>
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin h-6 w-6 border-2 border-primary border-t-transparent rounded-full" />
        </div>
      </div>
    );
  }

  const responseTrend = getTrend(stats.responseRate);
  const ResponseIcon = responseTrend.icon;

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5 h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-sm">Success Metrics</h3>
        <div className={cn("flex items-center gap-1 text-xs", responseTrend.color)}>
          <ResponseIcon className="h-3 w-3" />
          <span>{responseTrend.label}</span>
        </div>
      </div>

      <div className="flex justify-around items-center">
        <GaugeCircle 
          percentage={stats.responseRate} 
          color="hsl(var(--primary))" 
          label="Response Rate"
        />
        <GaugeCircle 
          percentage={stats.offerRate} 
          color="hsl(var(--success))" 
          label="Offer Rate"
        />
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-sm font-bold">{stats.totalApps}</p>
          <p className="text-[10px] text-muted-foreground">Applied</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-sm font-bold text-primary">{stats.responses}</p>
          <p className="text-[10px] text-muted-foreground">Responses</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="text-sm font-bold text-success">{stats.offers}</p>
          <p className="text-[10px] text-muted-foreground">Offers</p>
        </div>
      </div>
    </div>
  );
};
