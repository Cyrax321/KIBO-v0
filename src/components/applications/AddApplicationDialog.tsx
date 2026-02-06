import * as React from "react";
import { motion } from "framer-motion";
import { Plus, Building2, Briefcase, MapPin, Banknote, Link, Calendar, User, Star, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/sounds";

interface AddApplicationDialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  trigger?: React.ReactNode;
}

const PRIORITY_OPTIONS = [
  { value: "high", label: "High Priority", color: "bg-destructive text-destructive-foreground" },
  { value: "medium", label: "Medium Priority", color: "bg-warning text-warning-foreground" },
  { value: "low", label: "Low Priority", color: "bg-muted text-muted-foreground" },
];

const JOB_TYPES = [
  "Full-time",
  "Part-time",
  "Contract",
  "Internship",
  "Co-op",
  "Freelance",
];

const SOURCES = [
  "LinkedIn",
  "Company Website",
  "Indeed",
  "Glassdoor",
  "Referral",
  "Job Fair",
  "Recruiter",
  "Other",
];

export const AddApplicationDialog: React.FC<AddApplicationDialogProps> = ({
  open,
  onOpenChange,
  trigger,
}) => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("basic");

  const [formData, setFormData] = React.useState({
    company: "",
    role: "",
    salary: "",
    location: "",
    is_remote: false,
    job_url: "",
    notes: "",
    priority: "medium",
    job_type: "Full-time",
    source: "",
    deadline: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    requirements: "",
    tags: [] as string[],
  });

  const [tagInput, setTagInput] = React.useState("");

  const dialogOpen = open !== undefined ? open : isOpen;
  const setDialogOpen = onOpenChange || setIsOpen;

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tag: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((t) => t !== tag) });
  };

  const handleSubmit = async () => {
    if (!formData.company || !formData.role) {
      toast({ title: "Error", description: "Company and Role are required", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      toast({ title: "Error", description: "Please login first", variant: "destructive" });
      setLoading(false);
      return;
    }

    const applicationData = {
      user_id: session.user.id,
      company: formData.company,
      role: formData.role,
      salary: formData.salary || null,
      location: formData.location || null,
      is_remote: formData.is_remote,
      job_url: formData.job_url || null,
      notes: formData.notes ? JSON.stringify({
        content: formData.notes,
        priority: formData.priority,
        job_type: formData.job_type,
        source: formData.source,
        deadline: formData.deadline,
        contact: {
          name: formData.contact_name,
          email: formData.contact_email,
          phone: formData.contact_phone,
        },
        requirements: formData.requirements,
        tags: formData.tags,
        timeline: [{
          action: "created",
          date: new Date().toISOString(),
          note: "Application added to tracker"
        }]
      }) : null,
      status: "wishlist",
    };

    const { error } = await supabase.from("applications").insert([applicationData]);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      playSound("applicationAdded");
      toast({ title: "Success", description: "Application added to your tracker!" });
      setDialogOpen(false);
      resetForm();
    }
    setLoading(false);
  };

  const resetForm = () => {
    setFormData({
      company: "",
      role: "",
      salary: "",
      location: "",
      is_remote: false,
      job_url: "",
      notes: "",
      priority: "medium",
      job_type: "Full-time",
      source: "",
      deadline: "",
      contact_name: "",
      contact_email: "",
      contact_phone: "",
      requirements: "",
      tags: [],
    });
    setActiveTab("basic");
  };

  const defaultTrigger = (
    <Button className="gap-2">
      <Plus className="h-4 w-4" />
      Add Application
    </Button>
  );

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            Add New Application
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="contact">Contact</TabsTrigger>
            <TabsTrigger value="notes">Notes & Tags</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company" className="flex items-center gap-2">
                  <Building2 className="h-3.5 w-3.5" />
                  Company *
                </Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  placeholder="Google, Meta, etc."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role" className="flex items-center gap-2">
                  <Briefcase className="h-3.5 w-3.5" />
                  Role *
                </Label>
                <Input
                  id="role"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  placeholder="Software Engineer"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="salary" className="flex items-center gap-2">
                  <Banknote className="h-3.5 w-3.5" />
                  Salary Range
                </Label>
                <Input
                  id="salary"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  placeholder="$120k - $180k"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5" />
                  Location
                </Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="San Francisco, CA"
                />
              </div>
            </div>

            <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="remote">Remote Position</Label>
              </div>
              <Switch
                id="remote"
                checked={formData.is_remote}
                onCheckedChange={(checked) => setFormData({ ...formData, is_remote: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="job_url" className="flex items-center gap-2">
                <Link className="h-3.5 w-3.5" />
                Job Posting URL
              </Label>
              <Input
                id="job_url"
                value={formData.job_url}
                onChange={(e) => setFormData({ ...formData, job_url: e.target.value })}
                placeholder="https://careers.google.com/..."
              />
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4 mt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(v) => setFormData({ ...formData, priority: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <div className="flex items-center gap-2">
                          <Star className={cn("h-3 w-3", opt.value === "high" ? "text-destructive" : opt.value === "medium" ? "text-warning" : "text-muted-foreground")} />
                          {opt.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Job Type</Label>
                <Select
                  value={formData.job_type}
                  onValueChange={(v) => setFormData({ ...formData, job_type: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Source</Label>
                <Select
                  value={formData.source}
                  onValueChange={(v) => setFormData({ ...formData, source: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Where did you find this?" />
                  </SelectTrigger>
                  <SelectContent>
                    {SOURCES.map((src) => (
                      <SelectItem key={src} value={src}>{src}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5" />
                  Application Deadline
                </Label>
                <Input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Requirements / Skills Needed</Label>
              <Textarea
                value={formData.requirements}
                onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                placeholder="List key requirements from the job description..."
                rows={4}
              />
            </div>
          </TabsContent>

          <TabsContent value="contact" className="space-y-4 mt-4">
            <div className="p-4 rounded-lg bg-muted/50 space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <User className="h-4 w-4" />
                Recruiter / Hiring Manager Contact
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Name</Label>
                  <Input
                    value={formData.contact_name}
                    onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                    placeholder="John Smith"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.contact_email}
                    onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                    placeholder="recruiter@company.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Phone</Label>
                <Input
                  value={formData.contact_phone}
                  onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="notes" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-2">
                <Tag className="h-3.5 w-3.5" />
                Tags
              </Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" variant="outline" onClick={handleAddTag}>
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="cursor-pointer hover:bg-destructive/20"
                    onClick={() => handleRemoveTag(tag)}
                  >
                    {tag} ×
                  </Badge>
                ))}
                {formData.tags.length === 0 && (
                  <p className="text-xs text-muted-foreground">No tags added yet</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Any additional notes about this application..."
                rows={6}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-between items-center mt-6 pt-4 border-t">
          <div className="flex gap-2">
            {activeTab !== "basic" && (
              <Button
                variant="outline"
                onClick={() => {
                  const tabs = ["basic", "details", "contact", "notes"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex > 0) setActiveTab(tabs[currentIndex - 1]);
                }}
              >
                Back
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            {activeTab !== "notes" ? (
              <Button
                onClick={() => {
                  const tabs = ["basic", "details", "contact", "notes"];
                  const currentIndex = tabs.indexOf(activeTab);
                  if (currentIndex < tabs.length - 1) setActiveTab(tabs[currentIndex + 1]);
                }}
              >
                Next
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={loading || !formData.company || !formData.role}
                className="gap-2"
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-4 w-4 border-2 border-current border-t-transparent rounded-full"
                  />
                ) : (
                  <Plus className="h-4 w-4" />
                )}
                Add Application
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
