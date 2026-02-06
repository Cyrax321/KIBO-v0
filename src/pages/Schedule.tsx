import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon,
  Clock, Trash2, Bell, BellOff, Repeat, Video, Trophy,
  AlertCircle, RefreshCw
} from "lucide-react";
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isSameDay, addMonths, subMonths, parseISO,
  startOfWeek, endOfWeek, addWeeks, subWeeks, isToday
} from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { UpcomingEvents } from "@/components/schedule/UpcomingEvents";
import { QuickStats } from "@/components/schedule/QuickStats";
import { EventDetailsPanel } from "@/components/schedule/EventDetailsPanel";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  event_type: string;
}

const EVENT_TYPES = [
  { id: "deadline", label: "Deadline", color: "bg-destructive", icon: AlertCircle },
  { id: "interview", label: "Interview", color: "bg-primary", icon: Video },
  { id: "contest", label: "Contest", color: "bg-warning", icon: Trophy },
  { id: "reminder", label: "Reminder", color: "bg-success", icon: Bell },
  { id: "other", label: "Other", color: "bg-muted-foreground", icon: CalendarIcon },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
};

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isSupported, isEnabled, requestPermission, sendNotification } = usePushNotifications();

  const [viewMode, setViewMode] = React.useState<"month" | "week">("month");
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [events, setEvents] = React.useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null);
  const [selectedEvent, setSelectedEvent] = React.useState<ScheduleEvent | null>(null);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [isRefreshing, setIsRefreshing] = React.useState(false);

  const [newEvent, setNewEvent] = React.useState({
    title: "",
    description: "",
    event_date: "",
    event_time: "",
    event_type: "reminder",
  });

  const [notifiedEvents, setNotifiedEvents] = React.useState<Set<string>>(new Set());

  // Realtime subscription - FIXED cleanup pattern
  React.useEffect(() => {
    let channel: any;

    const setup = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      console.log("[Schedule] Setting up realtime for user:", session.user.id);
      await fetchEvents();

      // Subscribe to realtime changes - only UPDATE since we use optimistic updates for INSERT/DELETE
      channel = supabase
        .channel("schedule-realtime")
        .on(
          "postgres_changes",
          { event: "UPDATE", schema: "public", table: "schedule_events", filter: `user_id=eq.${session.user.id}` },
          (payload) => {
            console.log("[Schedule] Realtime UPDATE received:", payload);
            setEvents((prev) =>
              prev.map((e) => (e.id === payload.new.id ? (payload.new as ScheduleEvent) : e))
            );
          }
        )
        .subscribe((status) => {
          console.log("[Schedule] Subscription status:", status);
        });
    };

    setup();

    return () => {
      if (channel) {
        console.log("[Schedule] Cleaning up realtime subscription");
        supabase.removeChannel(channel);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate, sendNotification]); // fetchEvents and toast intentionally excluded to prevent re-subscription loop

  // Time-based notification checker
  React.useEffect(() => {
    const checkUpcomingEvents = () => {
      const now = new Date();
      const fifteenMinutesFromNow = new Date(now.getTime() + 15 * 60 * 1000);

      events.forEach((event) => {
        // Skip if already notified
        if (notifiedEvents.has(event.id)) return;

        const eventDateTime = new Date(`${event.event_date}T${event.event_time || "00:00"}`);

        // Check if event is within 15 minutes and hasn't passed
        if (eventDateTime >= now && eventDateTime <= fifteenMinutesFromNow) {
          sendNotification({
            title: `Upcoming: ${event.title}`,
            body: `Starting in ${Math.round((eventDateTime.getTime() - now.getTime()) / 60000)} minutes`,
            data: { path: "/schedule", eventId: event.id },
          });

          // Mark as notified
          setNotifiedEvents((prev) => new Set(prev).add(event.id));
        }
      });
    };

    // Check immediately on mount
    checkUpcomingEvents();

    // Then check every minute
    const interval = setInterval(checkUpcomingEvents, 60 * 1000);

    return () => clearInterval(interval);
  }, [events, notifiedEvents, sendNotification]);

  // Define fetchEvents with useCallback (needed by realtime subscription)
  const fetchEvents = React.useCallback(async () => {
    const { data, error } = await supabase
      .from("schedule_events")
      .select("*")
      .order("event_date", { ascending: true });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setEvents(data || []);
    }
    setLoading(false);
  }, [toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchEvents();
    setIsRefreshing(false);
    toast({ title: "Refreshed", description: "Schedule updated" });
  };

  const handleAddEvent = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase.from("schedule_events").insert({
      user_id: session.user.id,
      title: newEvent.title,
      description: newEvent.description || null,
      event_date: newEvent.event_date,
      event_time: newEvent.event_time || null,
      event_type: newEvent.event_type,
    }).select().single();

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Optimistic update - add to local state immediately
      setEvents((prev) => [...prev, data as ScheduleEvent].sort((a, b) =>
        new Date(a.event_date).getTime() - new Date(b.event_date).getTime()
      ));
      toast({ title: "Event Created", description: newEvent.title });
      setDialogOpen(false);
      setNewEvent({ title: "", description: "", event_date: "", event_time: "", event_type: "reminder" });
    }
  };

  const handleDeleteEvent = async (id: string) => {
    // Optimistic update - remove from local state immediately
    setEvents((prev) => prev.filter((e) => e.id !== id));
    setSelectedEvent(null);

    const { error } = await supabase.from("schedule_events").delete().eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      // Revert on error - refetch events
      fetchEvents();
    } else {
      toast({ title: "Event Deleted" });
    }
  };

  const handleUpdateEvent = async (id: string, updates: Partial<ScheduleEvent>) => {
    const { error } = await supabase.from("schedule_events").update(updates).eq("id", id);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Event Updated" });
    }
  };

  // Calendar calculations
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
  const weekEnd = endOfWeek(currentDate, { weekStartsOn: 0 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

  const displayDays = viewMode === "month" ? monthDays : weekDays;
  const startPadding = viewMode === "month" ? monthStart.getDay() : 0;
  const paddedDays = Array(startPadding).fill(null).concat(displayDays);

  const getEventsForDate = (date: Date) =>
    events.filter((e) => isSameDay(parseISO(e.event_date), date));

  const getEventTypeColor = (type: string) =>
    EVENT_TYPES.find((t) => t.id === type)?.color || "bg-muted-foreground";

  const navigatePrev = () => {
    if (viewMode === "month") {
      setCurrentDate(subMonths(currentDate, 1));
    } else {
      setCurrentDate(subWeeks(currentDate, 1));
    }
  };

  const navigateNext = () => {
    if (viewMode === "month") {
      setCurrentDate(addMonths(currentDate, 1));
    } else {
      setCurrentDate(addWeeks(currentDate, 1));
    }
  };

  const goToToday = () => setCurrentDate(new Date());

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center gap-3"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
              className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
            />
            <span className="text-sm text-muted-foreground">Loading schedule...</span>
          </motion.div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div
        className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Schedule</h1>
            <p className="text-muted-foreground text-sm">Track interviews, deadlines, and contests</p>
          </div>
          <div className="flex items-center gap-2">
            {/* Notifications Toggle */}
            {isSupported && (
              <Button
                variant={isEnabled ? "secondary" : "outline"}
                size="sm"
                className="gap-2"
                onClick={() => !isEnabled && requestPermission()}
              >
                {isEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
                {isEnabled ? "Notifications On" : "Enable Notifications"}
              </Button>
            )}

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
            </Button>

            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Event
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Add New Event</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      placeholder="Google Technical Interview"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Date *</Label>
                      <Input
                        id="date"
                        type="date"
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">Time</Label>
                      <Input
                        id="time"
                        type="time"
                        value={newEvent.event_time}
                        onChange={(e) => setNewEvent({ ...newEvent, event_time: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Event Type</Label>
                    <Select
                      value={newEvent.event_type}
                      onValueChange={(value) => setNewEvent({ ...newEvent, event_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {EVENT_TYPES.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            <div className="flex items-center gap-2">
                              <div className={cn("h-2 w-2 rounded-full", type.color)} />
                              {type.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Notes about this event..."
                      rows={3}
                    />
                  </div>
                  <Button
                    className="w-full"
                    onClick={handleAddEvent}
                    disabled={!newEvent.title || !newEvent.event_date}
                  >
                    Add Event
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </motion.div>

        {/* Quick Stats */}
        <motion.div variants={itemVariants}>
          <QuickStats events={events} />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
          {/* Calendar */}
          <motion.div variants={itemVariants}>
            <Card className="p-4 sm:p-6">
              {/* View Mode & Navigation */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as "month" | "week")}>
                    <TabsList className="h-8">
                      <TabsTrigger value="month" className="text-xs px-3 h-6">Month</TabsTrigger>
                      <TabsTrigger value="week" className="text-xs px-3 h-6">Week</TabsTrigger>
                    </TabsList>
                  </Tabs>
                  <Button variant="outline" size="sm" onClick={goToToday}>
                    Today
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigatePrev}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h2 className="text-lg font-semibold min-w-[180px] text-center">
                    {viewMode === "month"
                      ? format(currentDate, "MMMM yyyy")
                      : `${format(weekStart, "MMM d")} - ${format(weekEnd, "MMM d, yyyy")}`}
                  </h2>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={navigateNext}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {paddedDays.map((day, index) => {
                  if (!day) {
                    return <div key={`empty-${index}`} className={cn(viewMode === "week" ? "h-32" : "h-24")} />;
                  }

                  const dayEvents = getEventsForDate(day);
                  const isDayToday = isToday(day);
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  const isCurrentMonth = isSameMonth(day, currentDate);

                  return (
                    <motion.div
                      key={day.toISOString()}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setSelectedDate(day);
                        setSelectedEvent(null);
                      }}
                      className={cn(
                        "p-2 rounded-xl border cursor-pointer transition-all",
                        viewMode === "week" ? "h-32" : "h-24",
                        isDayToday && "bg-primary/5 border-primary/30 shadow-sm",
                        isSelected && "ring-2 ring-primary",
                        !isDayToday && !isSelected && "hover:bg-muted/50",
                        !isCurrentMonth && viewMode === "month" && "opacity-50"
                      )}
                    >
                      <span
                        className={cn(
                          "text-sm font-medium inline-flex items-center justify-center h-6 w-6 rounded-full",
                          isDayToday && "bg-primary text-primary-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </span>
                      <div className="mt-1 space-y-0.5 overflow-hidden">
                        <AnimatePresence>
                          {dayEvents.slice(0, viewMode === "week" ? 4 : 2).map((event, i) => (
                            <motion.div
                              key={event.id}
                              initial={{ opacity: 0, x: -5 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: i * 0.05 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedEvent(event);
                              }}
                              className="flex items-center gap-1 group"
                            >
                              <div
                                className={cn(
                                  "h-1.5 w-1.5 rounded-full flex-shrink-0",
                                  getEventTypeColor(event.event_type)
                                )}
                              />
                              <span className="text-[10px] text-muted-foreground truncate group-hover:text-foreground transition-colors">
                                {event.title}
                              </span>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                        {dayEvents.length > (viewMode === "week" ? 4 : 2) && (
                          <span className="text-[10px] text-primary font-medium">
                            +{dayEvents.length - (viewMode === "week" ? 4 : 2)} more
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="flex flex-wrap gap-4 mt-6 pt-4 border-t">
                {EVENT_TYPES.map((type) => (
                  <div key={type.id} className="flex items-center gap-1.5">
                    <div className={cn("h-2.5 w-2.5 rounded-full", type.color)} />
                    <span className="text-xs text-muted-foreground">{type.label}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>

          {/* Sidebar */}
          <motion.div variants={itemVariants} className="space-y-4">
            {/* Upcoming Events */}
            <UpcomingEvents
              events={events}
              onEventClick={(event) => {
                setSelectedEvent(event);
                setSelectedDate(parseISO(event.event_date));
              }}
            />

            {/* Event Details Panel */}
            {selectedEvent && (
              <EventDetailsPanel
                event={selectedEvent}
                onClose={() => setSelectedEvent(null)}
                onDelete={handleDeleteEvent}
                onUpdate={handleUpdateEvent}
              />
            )}

            {/* Selected Day Events */}
            {selectedDate && !selectedEvent && (
              <Card className="p-4">
                <h3 className="font-semibold mb-4">{format(selectedDate, "EEEE, MMMM d")}</h3>

                <div className="space-y-2">
                  {getEventsForDate(selectedDate).length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">No events scheduled</p>
                  ) : (
                    getEventsForDate(selectedDate).map((event, index) => (
                      <motion.div
                        key={event.id}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => setSelectedEvent(event)}
                        className="p-3 rounded-xl border bg-card hover:bg-muted/50 cursor-pointer transition-colors group"
                      >
                        <div className="flex items-start gap-2">
                          <div
                            className={cn(
                              "h-2 w-2 rounded-full mt-1.5 flex-shrink-0",
                              getEventTypeColor(event.event_type)
                            )}
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-sm">{event.title}</h4>
                            {event.event_time && (
                              <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                                <Clock className="h-3 w-3" />
                                {event.event_time}
                              </p>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </Card>
            )}
          </motion.div>
        </div>
      </motion.div>
    </AppLayout>
  );
};

export default Schedule;
