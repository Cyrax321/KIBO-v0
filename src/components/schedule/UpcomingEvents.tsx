import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Bell, BellOff, Calendar, Video, FileText, Trophy, AlertCircle } from "lucide-react";
import { format, formatDistanceToNow, isToday, isTomorrow, isThisWeek, differenceInHours } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { usePushNotifications } from "@/hooks/usePushNotifications";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  event_type: string;
}

interface UpcomingEventsProps {
  events: ScheduleEvent[];
  onEventClick: (event: ScheduleEvent) => void;
}

const eventIcons = {
  interview: Video,
  deadline: AlertCircle,
  contest: Trophy,
  reminder: Bell,
  other: Calendar,
};

const eventColors = {
  interview: "text-primary bg-primary/10 border-primary/20",
  deadline: "text-destructive bg-destructive/10 border-destructive/20",
  contest: "text-warning bg-warning/10 border-warning/20",
  reminder: "text-success bg-success/10 border-success/20",
  other: "text-muted-foreground bg-muted/50 border-border",
};

export const UpcomingEvents: React.FC<UpcomingEventsProps> = ({ events, onEventClick }) => {
  const { isSupported, isEnabled, requestPermission, scheduleReminder } = usePushNotifications();
  const [remindersSet, setRemindersSet] = React.useState<Set<string>>(new Set());

  // Filter and sort upcoming events
  const upcomingEvents = React.useMemo(() => {
    const now = new Date();
    return events
      .filter((e) => {
        const eventDate = new Date(`${e.event_date}T${e.event_time || "00:00"}`);
        return eventDate >= now;
      })
      .sort((a, b) => {
        const dateA = new Date(`${a.event_date}T${a.event_time || "00:00"}`);
        const dateB = new Date(`${b.event_date}T${b.event_time || "00:00"}`);
        return dateA.getTime() - dateB.getTime();
      })
      .slice(0, 5);
  }, [events]);

  const getTimeLabel = (event: ScheduleEvent) => {
    const eventDate = new Date(`${event.event_date}T${event.event_time || "00:00"}`);
    const hoursAway = differenceInHours(eventDate, new Date());

    if (hoursAway < 1) return "Starting soon";
    if (hoursAway < 24) return `In ${hoursAway}h`;
    if (isToday(eventDate)) return "Today";
    if (isTomorrow(eventDate)) return "Tomorrow";
    if (isThisWeek(eventDate)) return format(eventDate, "EEEE");
    return format(eventDate, "MMM d");
  };

  const getUrgencyClass = (event: ScheduleEvent) => {
    const eventDate = new Date(`${event.event_date}T${event.event_time || "00:00"}`);
    const hoursAway = differenceInHours(eventDate, new Date());

    if (hoursAway < 2) return "ring-2 ring-destructive/50 animate-pulse";
    if (hoursAway < 24) return "ring-1 ring-warning/50";
    return "";
  };

  const handleSetReminder = (event: ScheduleEvent) => {
    const eventDate = new Date(`${event.event_date}T${event.event_time || "00:00"}`);
    const success = scheduleReminder(event.title, eventDate, 15);
    if (success) {
      setRemindersSet((prev) => new Set(prev).add(event.id));
    }
  };

  return (
    <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Upcoming</h3>
        </div>
        {isSupported && (
          <div className="flex items-center gap-2">
            {isEnabled ? (
              <Bell className="h-3.5 w-3.5 text-success" />
            ) : (
              <BellOff className="h-3.5 w-3.5 text-muted-foreground" />
            )}
            <Switch
              checked={isEnabled}
              onCheckedChange={() => !isEnabled && requestPermission()}
              className="scale-75"
            />
          </div>
        )}
      </div>

      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {upcomingEvents.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-6">
              No upcoming events
            </p>
          ) : (
            upcomingEvents.map((event, index) => {
              const Icon = eventIcons[event.event_type as keyof typeof eventIcons] || Calendar;
              const colorClass = eventColors[event.event_type as keyof typeof eventColors] || eventColors.other;
              const urgencyClass = getUrgencyClass(event);

              return (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => onEventClick(event)}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all hover:scale-[1.02]",
                    colorClass,
                    urgencyClass
                  )}
                >
                  <div className={cn("rounded-lg p-2", colorClass)}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{event.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-muted-foreground">
                        {getTimeLabel(event)}
                      </span>
                      {event.event_time && (
                        <>
                          <span className="text-[10px] text-muted-foreground">•</span>
                          <span className="text-[10px] text-muted-foreground">
                            {event.event_time}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  {isEnabled && !remindersSet.has(event.id) && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSetReminder(event);
                      }}
                    >
                      <Bell className="h-3 w-3" />
                    </Button>
                  )}
                  {remindersSet.has(event.id) && (
                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0.5">
                      Reminder set
                    </Badge>
                  )}
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
