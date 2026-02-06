import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, MapPin, Link as LinkIcon, Trash2, Edit2, Bell, Calendar } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  event_date: string;
  event_time: string | null;
  event_type: string;
}

interface EventDetailsPanelProps {
  event: ScheduleEvent | null;
  onClose: () => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<ScheduleEvent>) => void;
}

const EVENT_TYPES = [
  { id: "deadline", label: "Deadline", color: "bg-destructive" },
  { id: "interview", label: "Interview", color: "bg-primary" },
  { id: "contest", label: "Contest", color: "bg-warning" },
  { id: "reminder", label: "Reminder", color: "bg-success" },
  { id: "other", label: "Other", color: "bg-muted-foreground" },
];

export const EventDetailsPanel: React.FC<EventDetailsPanelProps> = ({
  event,
  onClose,
  onDelete,
  onUpdate,
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedEvent, setEditedEvent] = React.useState<Partial<ScheduleEvent>>({});

  React.useEffect(() => {
    if (event) {
      setEditedEvent({
        title: event.title,
        description: event.description,
        event_date: event.event_date,
        event_time: event.event_time,
        event_type: event.event_type,
      });
    }
    setIsEditing(false);
  }, [event]);

  const handleSave = () => {
    if (event && editedEvent.title) {
      onUpdate(event.id, editedEvent);
      setIsEditing(false);
    }
  };

  const getEventTypeColor = (type: string) =>
    EVENT_TYPES.find((t) => t.id === type)?.color || "bg-muted-foreground";

  const getEventTypeLabel = (type: string) =>
    EVENT_TYPES.find((t) => t.id === type)?.label || "Other";

  return (
    <AnimatePresence>
      {event && (
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={cn("h-3 w-3 rounded-full", getEventTypeColor(event.event_type))} />
              <Badge variant="secondary" className="text-xs">
                {getEventTypeLabel(event.event_type)}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsEditing(!isEditing)}>
                <Edit2 className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive"
                onClick={() => onDelete(event.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onClose}>
                <X className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>

          {isEditing ? (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs">Title</Label>
                <Input
                  value={editedEvent.title || ""}
                  onChange={(e) => setEditedEvent({ ...editedEvent, title: e.target.value })}
                  className="h-9"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label className="text-xs">Date</Label>
                  <Input
                    type="date"
                    value={editedEvent.event_date || ""}
                    onChange={(e) => setEditedEvent({ ...editedEvent, event_date: e.target.value })}
                    className="h-9"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs">Time</Label>
                  <Input
                    type="time"
                    value={editedEvent.event_time || ""}
                    onChange={(e) => setEditedEvent({ ...editedEvent, event_time: e.target.value })}
                    className="h-9"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-xs">Type</Label>
                <Select
                  value={editedEvent.event_type}
                  onValueChange={(value) => setEditedEvent({ ...editedEvent, event_type: value })}
                >
                  <SelectTrigger className="h-9">
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
                <Label className="text-xs">Notes</Label>
                <Textarea
                  value={editedEvent.description || ""}
                  onChange={(e) => setEditedEvent({ ...editedEvent, description: e.target.value })}
                  rows={3}
                  className="resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 h-9" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button className="flex-1 h-9" onClick={handleSave}>
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold">{event.title}</h2>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  <span>{format(new Date(event.event_date), "EEEE, MMMM d, yyyy")}</span>
                </div>
                {event.event_time && (
                  <div className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" />
                    <span>{event.event_time}</span>
                  </div>
                )}
              </div>

              {event.description && (
                <div className="pt-3 border-t">
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </div>
              )}

              <div className="pt-3 border-t">
                <Button variant="outline" size="sm" className="w-full gap-2">
                  <Bell className="h-3.5 w-3.5" />
                  Set Reminder
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
