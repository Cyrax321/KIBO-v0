import * as React from "react";
import { motion } from "framer-motion";
import { TrendingUp, Target, Clock, CheckCircle2, Send, Building2, Calendar, Bell } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface ApplicationStatsProps {
  applications: Array<{
    id: string;
    status: string;
    created_at: string;
    applied_at: string | null;
    company: string;
  }>;
}

export const ApplicationStats: React.FC<ApplicationStatsProps> = ({ applications }) => {
  const stats = React.useMemo(() => {
    const total = applications.length;
    const applied = applications.filter(a => a.status !== "wishlist").length;
    const interviews = applications.filter(a => ["oa", "technical", "hr"].includes(a.status)).length;
    const offers = applications.filter(a => a.status === "offer").length;
    
    // Response rate (moved beyond wishlist / applied)
    const responseRate = applied > 0 ? Math.round((interviews / applied) * 100) : 0;
    
    // Offer rate
    const offerRate = interviews > 0 ? Math.round((offers / interviews) * 100) : 0;
    
    // Average time to response (mock for now)
    const avgDaysToResponse = 7;

    // This week's applications
    const thisWeek = applications.filter(a => {
      const date = new Date(a.created_at);
      const now = new Date();
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      return date >= weekAgo;
    }).length;

    return {
      total,
      applied,
      interviews,
      offers,
      responseRate,
      offerRate,
      avgDaysToResponse,
      thisWeek,
    };
  }, [applications]);

  const statCards = [
    {
      label: "Total Applications",
      value: stats.total,
      icon: Building2,
      color: "text-primary bg-primary/10",
    },
    {
      label: "Applied",
      value: stats.applied,
      icon: Send,
      color: "text-blue-500 bg-blue-500/10",
    },
    {
      label: "In Interviews",
      value: stats.interviews,
      icon: Calendar,
      color: "text-warning bg-warning/10",
    },
    {
      label: "Offers",
      value: stats.offers,
      icon: CheckCircle2,
      color: "text-success bg-success/10",
    },
  ];

  const rateCards = [
    {
      label: "Response Rate",
      value: `${stats.responseRate}%`,
      description: "Applications getting responses",
      icon: TrendingUp,
      color: stats.responseRate > 30 ? "text-success" : stats.responseRate > 15 ? "text-warning" : "text-destructive",
    },
    {
      label: "Offer Rate",
      value: `${stats.offerRate}%`,
      description: "Interviews converting to offers",
      icon: Target,
      color: stats.offerRate > 20 ? "text-success" : stats.offerRate > 10 ? "text-warning" : "text-destructive",
    },
    {
      label: "This Week",
      value: stats.thisWeek,
      description: "Applications added",
      icon: Clock,
      color: stats.thisWeek >= 5 ? "text-success" : stats.thisWeek >= 3 ? "text-warning" : "text-muted-foreground",
    },
  ];

  return (
    <div className="space-y-4">
      {/* Primary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card className="p-4 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3">
                <div className={cn("rounded-lg p-2", stat.color)}>
                  <stat.icon className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Rate Cards */}
      <div className="grid grid-cols-3 gap-3">
        {rateCards.map((rate, i) => (
          <motion.div
            key={rate.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + i * 0.05 }}
          >
            <Card className="p-4 text-center">
              <rate.icon className={cn("h-5 w-5 mx-auto mb-2", rate.color)} />
              <p className={cn("text-xl font-bold", rate.color)}>{rate.value}</p>
              <p className="text-xs text-muted-foreground">{rate.label}</p>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
