import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  X, Building2, Briefcase, MapPin, Banknote, Link, Calendar, User, 
  Mail, Phone, Star, Tag, Clock, Edit, Save, ExternalLink, 
  MessageSquare, CheckCircle2, AlertCircle, ArrowRight
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

interface ParsedNotes {
  content?: string;
  priority?: string;
  job_type?: string;
  source?: string;
  deadline?: string;
  contact?: {
    name?: string;
    email?: string;
    phone?: string;
  };
  requirements?: string;
  tags?: string[];
  timeline?: Array<{
    action: string;
    date: string;
    note?: string;
  }>;
}

interface ApplicationDetailPanelProps {
  application: Application | null;
  onClose: () => void;
  onUpdate: (app: Application) => void;
}

const STATUSES = [
  { id: "wishlist", label: "Wishlist", color: "bg-muted" },
  { id: "applied", label: "Applied", color: "bg-primary/20" },
  { id: "oa", label: "Online Assessment", color: "bg-warning/20" },
  { id: "technical", label: "Technical", color: "bg-accent" },
  { id: "hr", label: "HR / Managerial", color: "bg-success/20" },
  { id: "offer", label: "Offer", color: "bg-success/30" },
  { id: "rejected", label: "Rejected", color: "bg-destructive/20" },
];

export const ApplicationDetailPanel: React.FC<ApplicationDetailPanelProps> = ({
  application,
  onClose,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [editing, setEditing] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Application | null>(null);
  const [newTimelineNote, setNewTimelineNote] = React.useState("");

  React.useEffect(() => {
    if (application) {
      setFormData({ ...application });
      setEditing(false);
    }
  }, [application]);

  const parseNotes = (notes: string | null): ParsedNotes => {
    if (!notes) return {};
    try {
      return JSON.parse(notes);
    } catch {
      return { content: notes };
    }
  };

  const parsedNotes = application ? parseNotes(application.notes) : {};

  const handleSave = async () => {
    if (!formData) return;
    setLoading(true);

    const { error } = await supabase
      .from("applications")
      .update({
        company: formData.company,
        role: formData.role,
        salary: formData.salary,
        location: formData.location,
        is_remote: formData.is_remote,
        job_url: formData.job_url,
        status: formData.status,
        notes: formData.notes,
      })
      .eq("id", formData.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Application updated" });
      onUpdate(formData);
      setEditing(false);
    }
    setLoading(false);
  };

  const addTimelineEntry = async () => {
    if (!application || !newTimelineNote.trim()) return;

    const currentNotes = parseNotes(application.notes);
    const newTimeline = [
      ...(currentNotes.timeline || []),
      {
        action: "note",
        date: new Date().toISOString(),
        note: newTimelineNote.trim(),
      },
    ];

    const updatedNotes = JSON.stringify({
      ...currentNotes,
      timeline: newTimeline,
    });

    const { error } = await supabase
      .from("applications")
      .update({ notes: updatedNotes })
      .eq("id", application.id);

    if (!error) {
      onUpdate({ ...application, notes: updatedNotes });
      setNewTimelineNote("");
      toast({ title: "Note added", description: "Timeline updated" });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "offer":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "rejected":
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      default:
        return <ArrowRight className="h-4 w-4 text-muted-foreground" />;
    }
  };

  if (!application || !formData) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, x: 300 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 300 }}
        className="fixed right-0 top-0 h-screen w-full max-w-md bg-background border-l shadow-xl z-50"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h2 className="font-semibold">{application.company}</h2>
                <p className="text-sm text-muted-foreground">{application.role}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {editing ? (
                <>
                  <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                    Cancel
                  </Button>
                  <Button size="sm" onClick={handleSave} disabled={loading}>
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </Button>
                </>
              ) : (
                <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </Button>
              )}
              <Button size="icon" variant="ghost" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-6">
              {/* Status */}
              <div className="space-y-2">
                <Label>Status</Label>
                {editing ? (
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUSES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center gap-2">
                    {getStatusIcon(application.status)}
                    <Badge className={cn(
                      STATUSES.find((s) => s.id === application.status)?.color
                    )}>
                      {STATUSES.find((s) => s.id === application.status)?.label}
                    </Badge>
                  </div>
                )}
              </div>

              <Separator />

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Banknote className="h-3.5 w-3.5" />
                    Salary
                  </Label>
                  {editing ? (
                    <Input
                      value={formData.salary || ""}
                      onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      placeholder="$120k - $150k"
                    />
                  ) : (
                    <p className="text-sm">{application.salary || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-3.5 w-3.5" />
                    Location
                  </Label>
                  {editing ? (
                    <Input
                      value={formData.location || ""}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="San Francisco, CA"
                    />
                  ) : (
                    <p className="text-sm">{application.location || "Not specified"}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    Added
                  </Label>
                  <p className="text-sm">
                    {format(new Date(application.created_at), "MMM d, yyyy")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label className="text-muted-foreground">Remote</Label>
                  {editing ? (
                    <Switch
                      checked={formData.is_remote}
                      onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
                    />
                  ) : (
                    <Badge variant={application.is_remote ? "default" : "secondary"}>
                      {application.is_remote ? "Yes" : "No"}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Job URL */}
              {(application.job_url || editing) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Link className="h-3.5 w-3.5" />
                      Job Posting
                    </Label>
                    {editing ? (
                      <Input
                        value={formData.job_url || ""}
                        onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                        placeholder="https://..."
                      />
                    ) : application.job_url ? (
                      <Button variant="outline" size="sm" asChild>
                        <a href={application.job_url} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Open Job Posting
                        </a>
                      </Button>
                    ) : null}
                  </div>
                </>
              )}

              {/* Contact Info */}
              {parsedNotes.contact && (parsedNotes.contact.name || parsedNotes.contact.email) && (
                <>
                  <Separator />
                  <div className="space-y-3">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <User className="h-3.5 w-3.5" />
                      Contact
                    </Label>
                    <Card className="p-3 space-y-2">
                      {parsedNotes.contact.name && (
                        <p className="text-sm font-medium">{parsedNotes.contact.name}</p>
                      )}
                      {parsedNotes.contact.email && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="h-3.5 w-3.5" />
                          <a href={`mailto:${parsedNotes.contact.email}`} className="hover:underline">
                            {parsedNotes.contact.email}
                          </a>
                        </div>
                      )}
                      {parsedNotes.contact.phone && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Phone className="h-3.5 w-3.5" />
                          {parsedNotes.contact.phone}
                        </div>
                      )}
                    </Card>
                  </div>
                </>
              )}

              {/* Tags */}
              {parsedNotes.tags && parsedNotes.tags.length > 0 && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      Tags
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {parsedNotes.tags.map((tag) => (
                        <Badge key={tag} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Notes */}
              {(parsedNotes.content || editing) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="flex items-center gap-2 text-muted-foreground">
                      <MessageSquare className="h-3.5 w-3.5" />
                      Notes
                    </Label>
                    {editing ? (
                      <Textarea
                        value={formData.notes || ""}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                      />
                    ) : (
                      <p className="text-sm whitespace-pre-wrap">
                        {parsedNotes.content || "No notes"}
                      </p>
                    )}
                  </div>
                </>
              )}

              {/* Activity Timeline */}
              <Separator />
              <div className="space-y-3">
                <Label className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-3.5 w-3.5" />
                  Activity Timeline
                </Label>
                
                {/* Add note */}
                <div className="flex gap-2">
                  <Input
                    value={newTimelineNote}
                    onChange={(e) => setNewTimelineNote(e.target.value)}
                    placeholder="Add a note..."
                    onKeyDown={(e) => e.key === "Enter" && addTimelineEntry()}
                  />
                  <Button size="sm" onClick={addTimelineEntry} disabled={!newTimelineNote.trim()}>
                    Add
                  </Button>
                </div>

                {/* Timeline entries */}
                <div className="space-y-3">
                  {(parsedNotes.timeline || []).slice().reverse().map((entry, i) => (
                    <div key={i} className="flex gap-3">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm">{entry.note || entry.action}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(entry.date), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {/* Default creation entry */}
                  <div className="flex gap-3">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground mt-2 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm">Application created</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(application.created_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
