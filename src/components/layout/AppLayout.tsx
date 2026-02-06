import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { NotificationBell } from "../notifications/NotificationBell";
import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { useAppNotifications } from "@/hooks/useAppNotifications";

interface AppLayoutProps {
  children: React.ReactNode;
}

const MainContent: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <div className="flex min-h-screen flex-1 min-w-0 flex-col overflow-hidden">
      {/* Header with sidebar trigger and notifications */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-white/20 bg-white/40 px-4 backdrop-blur-xl lg:px-6">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="flex-1" />
        <NotificationBell />
      </header>

      {/* Main content area with page transitions */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{
              type: "tween",
              ease: [0.16, 1, 0.3, 1],
              duration: 0.35
            }}
            className="h-full"
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
};

const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  // Initialize app-wide notifications listener
  useAppNotifications();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full overflow-hidden">
        <AppSidebar />
        <MainContent>{children}</MainContent>
      </div>
    </SidebarProvider>
  );
};

export { AppLayout };
