import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  GripVertical, ExternalLink, MapPin, Banknote, Building2, Trash2,
  BarChart3, Bell, FileText, LayoutGrid, Table as TableIcon, Star
} from "lucide-react";
import confetti from "canvas-confetti";
import { supabase } from "@/integrations/supabase/client";
import { playSound } from "@/lib/sounds";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useGamification } from "@/hooks/useGamification";
import { useAppNotifications } from "@/hooks/useAppNotifications";
import { ApplicationStats } from "@/components/applications/ApplicationStats";
import { ApplicationReminders } from "@/components/applications/ApplicationReminders";
import { AddApplicationDialog } from "@/components/applications/AddApplicationDialog";
import { ApplicationTableView } from "@/components/applications/ApplicationTableView";
import { ApplicationDetailPanel } from "@/components/applications/ApplicationDetailPanel";
import { ImportExportTools } from "@/components/applications/ImportExportTools";

interface Application {
  id: string;
  company: string;
  role: string;
  status: string;
  notes: string | null;
  salary: string | null;
  location: string | null;
  is_remote: boolean;
  job_url: string | null;
  applied_at: string | null;
  created_at: string;
}

const COLUMNS = [
  { id: "wishlist", title: "Wishlist", color: "bg-muted" },
  { id: "applied", title: "Applied", color: "bg-primary/10" },
  { id: "oa", title: "Online Assessment", color: "bg-warning/10" },
  { id: "technical", title: "Technical", color: "bg-accent" },
  { id: "hr", title: "HR / Managerial", color: "bg-success/10" },
  { id: "offer", title: "Offer", color: "bg-success/20" },
];

// Parse notes to extract priority
const getPriority = (notes: string | null): string => {
  if (!notes) return "medium";
  try {
    const parsed = JSON.parse(notes);
    return parsed.priority || "medium";
  } catch {
    return "medium";
  }
};

const ApplicationCard: React.FC<{
  app: Application;
  onDelete: (id: string) => void;
  onDragStart: () => void;
  onSelect: () => void;
}> = ({ app, onDelete, onDragStart, onSelect }) => {
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(app.created_at).getTime()) / (1000 * 60 * 60 * 24)
  );
  const priority = getPriority(app.notes);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group cursor-grab active:cursor-grabbing"
      onDragStart={onDragStart}
      draggable
      onClick={onSelect}
    >
      <Card className="p-2 bg-card border-border shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-start gap-1">
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-semibold text-sm text-foreground truncate">{app.company}</h4>
                  {priority === "high" && (
                    <Star className="h-3 w-3 text-destructive fill-destructive flex-shrink-0" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground truncate">{app.role}</p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(app.id);
                }}
              >
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
            <p className="text-[10px] text-muted-foreground mt-1">
              {daysSinceUpdate === 0 ? "Today" : `${daysSinceUpdate}d ago`}
            </p>
            <div className="flex flex-wrap gap-1 mt-2">
              {app.is_remote && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Remote
                </Badge>
              )}
              {app.salary && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  <Banknote className="h-2.5 w-2.5 mr-0.5" />
                  {app.salary}
                </Badge>
              )}
              {app.location && (
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  <MapPin className="h-2.5 w-2.5 mr-0.5" />
                  {app.location}
                </Badge>
              )}
              {app.notes && (
                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                  <FileText className="h-2.5 w-2.5" />
                </Badge>
              )}
              {app.job_url && (
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 cursor-pointer hover:bg-primary/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.open(app.job_url!, "_blank");
                  }}
                >
                  <ExternalLink className="h-2.5 w-2.5" />
                </Badge>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};

const Applications: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { recordApplicationUpdate } = useGamification();
  const { notifyApplicationUpdate } = useAppNotifications();

  const [applications, setApplications] = React.useState<Application[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [draggedApp, setDraggedApp] = React.useState<Application | null>(null);
  const [selectedApp, setSelectedApp] = React.useState<Application | null>(null);
  const [activeTab, setActiveTab] = React.useState("board");
  const [viewMode, setViewMode] = React.useState<"kanban" | "table">("kanban");

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      fetchApplications();
    };
    checkAuth();
  }, [navigate]);

  // Realtime subscription for applications
  React.useEffect(() => {
    const setupRealtime = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      const channel = supabase
        .channel("applications-realtime")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "applications",
            filter: `user_id=eq.${session.user.id}`,
          },
          (payload) => {
            if (payload.eventType === "INSERT") {
              setApplications((prev) => [payload.new as Application, ...prev]);
            } else if (payload.eventType === "UPDATE") {
              setApplications((prev) =>
                prev.map((a) => (a.id === payload.new.id ? (payload.new as Application) : a))
              );
            } else if (payload.eventType === "DELETE") {
              setApplications((prev) => prev.filter((a) => a.id !== payload.old.id));
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    setupRealtime();
  }, []);

  const fetchApplications = async () => {
    const { data, error } = await supabase
      .from("applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setApplications(data || []);
    }
    setLoading(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from("applications").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const app = applications.find((a) => a.id === id);
    if (!app || app.status === newStatus) return;

    const oldStatus = app.status;

    // Optimistic update: immediately update local state for instant UI feedback
    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
    );

    // Celebrate if moving to Offer!
    if (newStatus === "offer") {
      playSound("offer");
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#8b5cf6", "#10b981", "#f97316"],
      });
      toast({ title: "🎉 Congratulations!", description: "You received an offer!" });
    }

    const { error } = await supabase
      .from("applications")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      // Revert optimistic update on error
      setApplications((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: oldStatus } : a))
      );
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      recordApplicationUpdate(oldStatus, newStatus);
      notifyApplicationUpdate(app.company, newStatus);
    }
  };

  const handleDrop = async (columnId: string) => {
    if (!draggedApp || draggedApp.status === columnId) {
      setDraggedApp(null);
      return;
    }
    handleStatusChange(draggedApp.id, columnId);
    setDraggedApp(null);
  };

  const getColumnApps = (columnId: string) =>
    applications.filter(app => app.status === columnId);

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Application Tracker</h1>
            <p className="text-muted-foreground text-sm">
              Track your job applications from wishlist to offer • {applications.length} total
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <ImportExportTools
              applications={applications}
              onImportComplete={fetchApplications}
            />
            <AddApplicationDialog />
          </div>
        </div>

        {/* Tabs for different views */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="board" className="gap-2">
                <Building2 className="h-4 w-4" />
                Board
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                Analytics
              </TabsTrigger>
              <TabsTrigger value="reminders" className="gap-2">
                <Bell className="h-4 w-4" />
                Reminders
              </TabsTrigger>
            </TabsList>

            {activeTab === "board" && (
              <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
                <Button
                  variant={viewMode === "kanban" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode("kanban")}
                >
                  <LayoutGrid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "table" ? "default" : "ghost"}
                  size="sm"
                  className="h-8 px-3"
                  onClick={() => setViewMode("table")}
                >
                  <TableIcon className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <TabsContent value="board" className="space-y-4">
            {viewMode === "kanban" ? (
              /* Kanban Board - Grid layout to fit all columns */
              <div className="grid grid-cols-6 gap-3">
                {COLUMNS.map((column) => (
                  <div
                    key={column.id}
                    className={cn(
                      "rounded-xl p-2 min-h-[500px] transition-colors",
                      column.color,
                      draggedApp && "ring-2 ring-primary/20"
                    )}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(column.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-xs text-foreground truncate">{column.title}</h3>
                      <Badge variant="secondary" className="text-xs h-5 px-1.5">
                        {getColumnApps(column.id).length}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <AnimatePresence>
                        {getColumnApps(column.id).map((app) => (
                          <ApplicationCard
                            key={app.id}
                            app={app}
                            onDelete={handleDelete}
                            onDragStart={() => setDraggedApp(app)}
                            onSelect={() => setSelectedApp(app)}
                          />
                        ))}
                      </AnimatePresence>
                      {getColumnApps(column.id).length === 0 && (
                        <div className="text-center py-6 text-muted-foreground text-xs">
                          Drop here
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              /* Table View */
              <ApplicationTableView
                applications={applications}
                onSelect={setSelectedApp}
                onDelete={handleDelete}
                onStatusChange={handleStatusChange}
              />
            )}
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <ApplicationStats applications={applications} />
          </TabsContent>

          <TabsContent value="reminders" className="space-y-4">
            <ApplicationReminders applications={applications} />
          </TabsContent>
        </Tabs>
      </div>

      {/* Detail Panel */}
      {selectedApp && (
        <ApplicationDetailPanel
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdate={(updated) => {
            setApplications((apps) =>
              apps.map((a) => (a.id === updated.id ? updated : a))
            );
            setSelectedApp(updated);
          }}
        />
      )}
    </AppLayout>
  );
};

export default Applications;
