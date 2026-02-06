import * as React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Briefcase, Code2, FileText, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const actions = [
  {
    label: "Tracker",
    description: "Manage applications",
    icon: Briefcase,
    href: "/tracker",
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    label: "CS Arena",
    description: "Practice problems",
    icon: Code2,
    href: "/arena",
    color: "text-success",
    bgColor: "bg-success/10",
  },
  {
    label: "Assessments",
    description: "Mock interviews",
    icon: FileText,
    href: "/assessments",
    color: "text-warning",
    bgColor: "bg-warning/10",
  },
  {
    label: "Schedule",
    description: "Plan your week",
    icon: Calendar,
    href: "/schedule",
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
];

export const QuickActions: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4 }}
      className="rounded-2xl border border-white/20 bg-white/40 backdrop-blur-xl p-5 shadow-sm"
    >
      <h3 className="mb-4 text-sm font-semibold text-foreground">⚡ Kibo Boost</h3>

      <div className="grid grid-cols-2 gap-2">
        {actions.map((action, index) => (
          <motion.div
            key={action.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 + index * 0.05 }}
          >
            <Link
              to={action.href}
              className={cn(
                "flex flex-col items-center gap-2 rounded-xl border border-white/20 bg-white/60 p-3 transition-all",
                "hover:border-primary/30 hover:bg-white/80 hover:scale-[1.02]",
                "active:scale-[0.98]"
              )}
            >
              <div className={cn("rounded-lg p-2", action.bgColor)}>
                <action.icon className={cn("h-4 w-4 stroke-[1.5]", action.color)} />
              </div>
              <div className="text-center">
                <p className="text-xs font-medium text-foreground">{action.label}</p>
                <p className="text-[10px] text-muted-foreground">{action.description}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};
