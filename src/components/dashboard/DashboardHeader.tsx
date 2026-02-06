import * as React from "react";
import { motion } from "framer-motion";

interface DashboardHeaderProps {
  userName: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ userName }) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-1"
    >
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {getGreeting()}, <span className="text-primary">{userName}</span>
      </h1>
      <p className="text-sm text-muted-foreground">
        Here's your progress overview. Keep the momentum going!
      </p>
    </motion.div>
  );
};
