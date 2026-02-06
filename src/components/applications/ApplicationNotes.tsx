import * as React from "react";
import { motion } from "framer-motion";
import { FileText, Save, Edit2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface ApplicationNotesProps {
  applicationId: string;
  initialNotes: string | null;
  company: string;
  onUpdate?: (notes: string) => void;
}

export const ApplicationNotes: React.FC<ApplicationNotesProps> = ({
  applicationId,
  initialNotes,
  company,
  onUpdate,
}) => {
  const { toast } = useToast();
  const [notes, setNotes] = React.useState(initialNotes || "");
  const [isEditing, setIsEditing] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  const handleSave = async () => {
    setIsSaving(true);
    
    const { error } = await supabase
      .from("applications")
      .update({ notes })
      .eq("id", applicationId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: "Notes updated successfully" });
      setIsEditing(false);
      onUpdate?.(notes);
    }
    
    setIsSaving(false);
  };

  const handleCancel = () => {
    setNotes(initialNotes || "");
    setIsEditing(false);
  };

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm">Notes for {company}</h3>
        </div>
        {!isEditing ? (
          <Button size="sm" variant="ghost" onClick={() => setIsEditing(true)}>
            <Edit2 className="h-3 w-3 mr-1" />
            Edit
          </Button>
        ) : (
          <div className="flex items-center gap-1">
            <Button size="sm" variant="ghost" onClick={handleCancel}>
              <X className="h-3 w-3" />
            </Button>
            <Button size="sm" onClick={handleSave} disabled={isSaving}>
              <Save className="h-3 w-3 mr-1" />
              Save
            </Button>
          </div>
        )}
      </div>

      {isEditing ? (
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add notes about this application...

Examples:
- Recruiter contact: john@company.com
- Interview prep topics: System Design, React
- Salary expectations discussed
- Important dates or deadlines"
          rows={6}
          className="text-sm"
        />
      ) : (
        <div
          className={cn(
            "text-sm whitespace-pre-wrap min-h-[100px] p-3 rounded-lg bg-muted/30",
            !notes && "text-muted-foreground italic"
          )}
        >
          {notes || "No notes yet. Click edit to add details about this application."}
        </div>
      )}
    </Card>
  );
};
