import * as React from "react";
import { motion } from "framer-motion";

// Kanban pipeline stages
export const KanbanVisual: React.FC = () => (
  <div className="grid grid-cols-4 gap-3">
    {[
      { label: "Wishlist", width: "100%" },
      { label: "Applied", width: "75%" },
      { label: "Interview", width: "50%" },
      { label: "Offer", width: "25%" },
    ].map((stage, i) => (
      <motion.div
        key={stage.label}
        initial={{ opacity: 0, scaleY: 0 }}
        whileInView={{ opacity: 1, scaleY: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.4 + i * 0.08, duration: 0.4, ease: "easeOut" }}
        className="origin-bottom space-y-2"
      >
        <div 
          className="h-1.5 rounded-full bg-primary/25 group-hover:bg-primary/40 transition-colors duration-400" 
          style={{ width: stage.width }} 
        />
        <span className="text-[10px] font-medium text-muted-foreground/70 block">
          {stage.label}
        </span>
      </motion.div>
    ))}
  </div>
);

// GitHub-style heatmap grid
export const HeatmapVisual: React.FC = () => {
  const cells = React.useMemo(() => 
    Array.from({ length: 28 }, () => Math.random()), 
    []
  );

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {cells.map((intensity, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.012, duration: 0.25 }}
          className="aspect-square rounded-[4px] transition-colors duration-300"
          style={{
            backgroundColor: intensity > 0.75 
              ? "hsl(var(--success))" 
              : intensity > 0.45 
              ? "hsl(var(--success) / 0.6)" 
              : intensity > 0.2 
              ? "hsl(var(--success) / 0.25)" 
              : "hsl(var(--muted))",
          }}
        />
      ))}
    </div>
  );
};

// XP progress bar
export const XPBarVisual: React.FC = () => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-primary">Level 5</span>
      <span className="text-xs text-muted-foreground font-medium">2,450 / 3,000 XP</span>
    </div>
    <div className="h-2.5 rounded-full bg-primary/10 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: "82%" }}
        viewport={{ once: true }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.25, 0.1, 0.25, 1] }}
        className="h-full rounded-full bg-gradient-to-r from-primary via-primary to-primary/80"
      />
    </div>
  </div>
);

// Streak counter
export const StreakVisual: React.FC = () => (
  <div className="flex items-center gap-4">
    <motion.div
      initial={{ scale: 0, rotate: -10 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 12 }}
      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-warning/25 to-warning/10 flex items-center justify-center shadow-sm"
    >
      <span className="text-xl font-bold text-warning">12</span>
    </motion.div>
    <div className="space-y-0.5">
      <div className="text-sm font-semibold text-foreground">Day Streak</div>
      <div className="text-xs text-muted-foreground">Keep it going!</div>
    </div>
  </div>
);

// Code snippet for CS Arena
export const CodeVisual: React.FC = () => (
  <div className="font-mono text-xs space-y-1.5 select-none">
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 0.5, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.4, duration: 0.4 }}
      className="text-muted-foreground/60"
    >
      const skills = await practice();
    </motion.div>
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.5, duration: 0.4 }}
      className="text-success/70 font-medium"
    >
      // +150 XP earned
    </motion.div>
  </div>
);

// Trophy medals for contests
export const TrophyVisual: React.FC = () => (
  <div className="flex items-center gap-3">
    {[
      { color: "from-amber-300 to-amber-500", size: "w-9 h-9" },
      { color: "from-zinc-300 to-zinc-500", size: "w-8 h-8" },
      { color: "from-orange-400 to-orange-600", size: "w-7 h-7" },
    ].map((medal, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 8, scale: 0.8 }}
        whileInView={{ opacity: 1, y: 0, scale: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 + i * 0.08, duration: 0.35 }}
        className={`${medal.size} rounded-full bg-gradient-to-br ${medal.color} shadow-sm`}
      />
    ))}
  </div>
);

// Community network nodes
export const NetworkVisual: React.FC = () => (
  <div className="flex items-center">
    <div className="flex -space-x-2.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.5 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.06, type: "spring", stiffness: 200, damping: 15 }}
          className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 border-2 border-white shadow-sm"
        />
      ))}
    </div>
    <motion.span
      initial={{ opacity: 0, x: -4 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.6, duration: 0.3 }}
      className="ml-4 text-xs font-medium text-muted-foreground"
    >
      +10K members
    </motion.span>
  </div>
);

// Calendar week view
export const CalendarVisual: React.FC = () => (
  <div className="flex items-center gap-3">
    {["Mon", "Tue", "Wed", "Thu", "Fri"].map((day, i) => (
      <motion.div
        key={day}
        initial={{ opacity: 0, y: 4 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.35 + i * 0.04, duration: 0.3 }}
        className="flex flex-col items-center gap-1.5"
      >
        <div className={`w-2.5 h-2.5 rounded-full transition-colors ${
          i === 1 || i === 3 ? "bg-primary" : "bg-muted-foreground/20"
        }`} />
        <span className="text-[10px] font-medium text-muted-foreground/60">{day}</span>
      </motion.div>
    ))}
  </div>
);

// Message bubbles
export const MessageVisual: React.FC = () => {
  const widths = React.useMemo(() => [65, 45, 55], []);
  
  return (
    <div className="space-y-2">
      {[true, false, true].map((isOutgoing, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: isOutgoing ? 6 : -6 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.35 + i * 0.08, duration: 0.3 }}
          className={`h-2.5 rounded-full ${isOutgoing ? "bg-primary/30 ml-auto" : "bg-muted-foreground/15"}`}
          style={{ width: `${widths[i]}%` }}
        />
      ))}
    </div>
  );
};

// Profile completion ring
export const ProfileVisual: React.FC = () => (
  <div className="flex items-center gap-4">
    <motion.div
      initial={{ scale: 0, rotate: -15 }}
      whileInView={{ scale: 1, rotate: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.35, type: "spring", stiffness: 180, damping: 12 }}
      className="w-12 h-12 rounded-2xl bg-gradient-to-br from-success/25 to-success/10 flex items-center justify-center shadow-sm"
    >
      <span className="text-base font-bold text-success">92%</span>
    </motion.div>
    <span className="text-xs font-medium text-muted-foreground">Profile Complete</span>
  </div>
);

// Timer visual for assessments
export const TimerVisual: React.FC = () => (
  <motion.div
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    viewport={{ once: true }}
    transition={{ delay: 0.35, duration: 0.3 }}
    className="flex items-center gap-2.5"
  >
    <div className="w-2.5 h-2.5 rounded-full bg-success animate-pulse" />
    <span className="text-xs font-semibold text-foreground/80 font-mono">45:00</span>
    <span className="text-xs text-muted-foreground">remaining</span>
  </motion.div>
);
