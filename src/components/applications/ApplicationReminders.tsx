import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, Plus, Trash2, Calendar, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { format, differenceInDays, isPast, isToday, isTomorrow } from "date-fns";
import { usePushNotifications } from "@/hooks/usePushNotifications";
import { useToast } from "@/hooks/use-toast";

interface Reminder {
  id: string;
  applicationId: string;
  company: string;
  title: string;
  date: Date;
  type: "follow_up" | "interview" | "deadline" | "other";
}

interface ApplicationRemindersProps {
  applications: Array<{
    id: string;
    company: string;
    role: string;
    status: string;
  }>;
}

export const ApplicationReminders: React.FC<ApplicationRemindersProps> = ({
  applications,
}) => {
  const { toast } = useToast();
  const { sendNotification, scheduleReminder, isEnabled, requestPermission } = usePushNotifications();
  const [reminders, setReminders] = React.useState<Reminder[]>([]);
  const [dialogOpen, setDialogOpen] = React.useState(false);
  const [newReminder, setNewReminder] = React.useState({
    applicationId: "",
    title: "",
    date: "",
    time: "09:00",
    type: "follow_up" as const,
  });

  // Load reminders from localStorage
  React.useEffect(() => {
    const saved = localStorage.getItem("application-reminders");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setReminders(parsed.map((r: any) => ({ ...r, date: new Date(r.date) })));
      } catch (e) {
        console.error("Failed to parse reminders:", e);
      }
    }
  }, []);

  // Save reminders to localStorage
  React.useEffect(() => {
    localStorage.setItem("application-reminders", JSON.stringify(reminders));
  }, [reminders]);

  const handleAddReminder = () => {
    if (!newReminder.applicationId || !newReminder.title || !newReminder.date) {
      toast({ title: "Error", description: "Please fill all fields", variant: "destructive" });
      return;
    }

    const app = applications.find(a => a.id === newReminder.applicationId);
    if (!app) return;

    const reminderDate = new Date(`${newReminder.date}T${newReminder.time}`);
    
    const reminder: Reminder = {
      id: Date.now().toString(),
      applicationId: newReminder.applicationId,
      company: app.company,
      title: newReminder.title,
      date: reminderDate,
      type: newReminder.type,
    };

    setReminders(prev => [...prev, reminder]);
    
    // Schedule push notification
    if (isEnabled) {
      scheduleReminder(`${app.company}: ${newReminder.title}`, reminderDate, 15);
      toast({ title: "Reminder Set", description: "You'll be notified 15 minutes before" });
    }

    setDialogOpen(false);
    setNewReminder({ applicationId: "", title: "", date: "", time: "09:00", type: "follow_up" });
  };

  const handleDeleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  };

  const getUrgencyColor = (date: Date) => {
    if (isPast(date) && !isToday(date)) return "text-destructive bg-destructive/10";
    if (isToday(date)) return "text-warning bg-warning/10";
    if (isTomorrow(date)) return "text-primary bg-primary/10";
    return "text-muted-foreground bg-muted";
  };

  const getUrgencyLabel = (date: Date) => {
    const days = differenceInDays(date, new Date());
    if (isPast(date) && !isToday(date)) return "Overdue";
    if (isToday(date)) return "Today";
    if (isTomorrow(date)) return "Tomorrow";
    if (days <= 7) return `In ${days} days`;
    return format(date, "MMM d");
  };

  const typeLabels = {
    follow_up: "Follow Up",
    interview: "Interview",
    deadline: "Deadline",
    other: "Other",
  };

  const sortedReminders = [...reminders].sort((a, b) => a.date.getTime() - b.date.getTime());
  const upcomingReminders = sortedReminders.filter(r => !isPast(r.date) || isToday(r.date));
  const pastReminders = sortedReminders.filter(r => isPast(r.date) && !isToday(r.date));

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Bell className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Reminders</h3>
          {upcomingReminders.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              {upcomingReminders.length}
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isEnabled && (
            <Button size="sm" variant="ghost" onClick={requestPermission}>
              Enable Notifications
            </Button>
          )}
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="gap-1">
                <Plus className="h-3 w-3" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Reminder</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label>Application</Label>
                  <Select
                    value={newReminder.applicationId}
                    onValueChange={(v) => setNewReminder({ ...newReminder, applicationId: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select application" />
                    </SelectTrigger>
                    <SelectContent>
                      {applications.map((app) => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.company} - {app.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={newReminder.type}
                    onValueChange={(v) => setNewReminder({ ...newReminder, type: v as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="follow_up">Follow Up</SelectItem>
                      <SelectItem value="interview">Interview</SelectItem>
                      <SelectItem value="deadline">Deadline</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    value={newReminder.title}
                    onChange={(e) => setNewReminder({ ...newReminder, title: e.target.value })}
                    placeholder="e.g., Follow up on application"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input
                      type="date"
                      value={newReminder.date}
                      onChange={(e) => setNewReminder({ ...newReminder, date: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Time</Label>
                    <Input
                      type="time"
                      value={newReminder.time}
                      onChange={(e) => setNewReminder({ ...newReminder, time: e.target.value })}
                    />
                  </div>
                </div>
                <Button className="w-full" onClick={handleAddReminder}>
                  Add Reminder
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-2 max-h-[300px] overflow-y-auto">
        <AnimatePresence mode="popLayout">
          {reminders.length === 0 ? (
            <p className="text-xs text-muted-foreground text-center py-4">
              No reminders set. Add one to stay on track!
            </p>
          ) : (
            <>
              {pastReminders.length > 0 && (
                <div className="mb-2">
                  <p className="text-xs text-destructive font-medium mb-1 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    Overdue
                  </p>
                  {pastReminders.map((reminder) => (
                    <ReminderItem
                      key={reminder.id}
                      reminder={reminder}
                      onDelete={handleDeleteReminder}
                      getUrgencyColor={getUrgencyColor}
                      getUrgencyLabel={getUrgencyLabel}
                      typeLabels={typeLabels}
                    />
                  ))}
                </div>
              )}
              {upcomingReminders.map((reminder) => (
                <ReminderItem
                  key={reminder.id}
                  reminder={reminder}
                  onDelete={handleDeleteReminder}
                  getUrgencyColor={getUrgencyColor}
                  getUrgencyLabel={getUrgencyLabel}
                  typeLabels={typeLabels}
                />
              ))}
            </>
          )}
        </AnimatePresence>
      </div>
    </Card>
  );
};

const ReminderItem: React.FC<{
  reminder: Reminder;
  onDelete: (id: string) => void;
  getUrgencyColor: (date: Date) => string;
  getUrgencyLabel: (date: Date) => string;
  typeLabels: Record<string, string>;
}> = ({ reminder, onDelete, getUrgencyColor, getUrgencyLabel, typeLabels }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    exit={{ opacity: 0, x: 10 }}
    className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/30 transition-colors group"
  >
    <div className="flex items-center gap-3 min-w-0">
      <div className={cn("rounded-lg p-1.5 flex-shrink-0", getUrgencyColor(reminder.date))}>
        <Calendar className="h-3 w-3" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium truncate">{reminder.title}</p>
        <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
          <span>{reminder.company}</span>
          <span>•</span>
          <span>{typeLabels[reminder.type]}</span>
        </div>
      </div>
    </div>
    <div className="flex items-center gap-2">
      <Badge variant="secondary" className={cn("text-[10px]", getUrgencyColor(reminder.date))}>
        {getUrgencyLabel(reminder.date)}
      </Badge>
      <Button
        size="icon"
        variant="ghost"
        className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={() => onDelete(reminder.id)}
      >
        <Trash2 className="h-3 w-3 text-destructive" />
      </Button>
    </div>
  </motion.div>
);
