import * as React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { FeatureCard } from "./features/FeatureCard";
import {
  KanbanVisual,
  HeatmapVisual,
  XPBarVisual,
  StreakVisual,
  CodeVisual,
  TrophyVisual,
  NetworkVisual,
  CalendarVisual,
  MessageVisual,
  ProfileVisual,
  TimerVisual,
} from "./features/GamificationVisuals";

interface FeaturesSectionProps {
  className?: string;
  id?: string;
}

const FeaturesSection: React.FC<FeaturesSectionProps> = ({ className, id }) => {
  return (
    <section id={id} className={cn("py-24 lg:py-32 bg-background", className)}>
      <div className="container mx-auto px-5 sm:px-6 lg:px-8 max-w-7xl">
        {/* Section Header */}
        <div className="mb-16 lg:mb-20 text-center max-w-2xl mx-auto">
          <motion.span
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
            className="inline-block mb-4 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
          >
            Features
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.08 }}
            className="mb-5 text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-foreground leading-[1.15]"
          >
            Your complete career toolkit
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.16 }}
            className="text-base lg:text-lg text-muted-foreground leading-relaxed"
          >
            Level up your job search with gamified progress tracking, coding practice, and a supportive community.
          </motion.p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          
          {/* Application Tracker - Large */}
          <FeatureCard
            category="Core Feature"
            title="Application Tracker"
            description="Visualize your job search with a beautiful Kanban board. Track every application from wishlist to offer."
            accentColor="primary"
            size="large"
            delay={0}
            className="sm:col-span-2 sm:row-span-2"
          >
            <div className="space-y-5">
              <XPBarVisual />
              <KanbanVisual />
            </div>
          </FeatureCard>

          {/* Progress Tracking */}
          <FeatureCard
            category="Analytics"
            title="Progress Tracking"
            description="GitHub-style heatmaps visualize your daily consistency. Build streaks and grow."
            accentColor="success"
            delay={0.08}
          >
            <div className="space-y-5">
              <StreakVisual />
              <HeatmapVisual />
            </div>
          </FeatureCard>

          {/* Community */}
          <FeatureCard
            category="Network"
            title="Professional Community"
            description="Connect with engineers preparing for top tech companies."
            accentColor="warning"
            delay={0.12}
          >
            <NetworkVisual />
          </FeatureCard>

          {/* CS Arena - Large */}
          <FeatureCard
            category="Practice"
            title="CS Arena"
            description="Sharpen your coding skills with 500+ curated problems. Practice with a real IDE and earn XP."
            accentColor="success"
            size="large"
            delay={0.16}
            className="sm:col-span-2 sm:row-span-2"
          >
            <CodeVisual />
          </FeatureCard>

          {/* Mock Assessments */}
          <FeatureCard
            category="Preparation"
            title="Mock Assessments"
            description="Simulate real interview conditions with timed coding challenges."
            accentColor="primary"
            delay={0.2}
          >
            <TimerVisual />
          </FeatureCard>

          {/* Contests */}
          <FeatureCard
            category="Competition"
            title="Contests & Challenges"
            description="Compete in weekly contests. Climb the leaderboard."
            accentColor="warning"
            delay={0.24}
          >
            <TrophyVisual />
          </FeatureCard>

          {/* Bottom Row - 4 Equal Cards */}
          <FeatureCard
            category="Communication"
            title="Messaging"
            description="Real-time chat with peers, mentors, and study groups."
            accentColor="primary"
            delay={0.28}
          >
            <MessageVisual />
          </FeatureCard>

          <FeatureCard
            category="Identity"
            title="Professional Profile"
            description="Showcase your skills, achievements, and progress."
            accentColor="success"
            delay={0.32}
          >
            <ProfileVisual />
          </FeatureCard>

          <FeatureCard
            category="Organization"
            title="Calendar & Scheduling"
            description="Never miss an interview or deadline with smart reminders."
            accentColor="warning"
            delay={0.36}
          >
            <CalendarVisual />
          </FeatureCard>

          <FeatureCard
            category="Intelligence"
            title="Smart Insights"
            description="Personalized recommendations based on your activity patterns."
            accentColor="primary"
            badge="Coming Soon"
            delay={0.4}
          />
        </div>
      </div>
    </section>
  );
};

export { FeaturesSection };
