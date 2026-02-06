import * as React from "react";
import { Send, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConnectDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: {
    user_id: string;
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
  } | null;
  onConnect: (userId: string, note: string) => void;
  loading?: boolean;
}

export const ConnectDialog: React.FC<ConnectDialogProps> = ({
  open,
  onOpenChange,
  user,
  onConnect,
  loading = false,
}) => {
  const [note, setNote] = React.useState("");

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleSubmit = () => {
    if (user) {
      onConnect(user.user_id, note);
      setNote("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Send Connection Request
          </DialogTitle>
          <DialogDescription>
            Add a personalized note to increase your chances of connecting.
          </DialogDescription>
        </DialogHeader>

        {user && (
          <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(user.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium">{user.full_name || "User"}</p>
              <p className="text-sm text-muted-foreground truncate">
                {user.headline || "Kibo User"}
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Add a note <span className="text-muted-foreground">(optional)</span>
          </label>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Hi! I'd like to connect with you because..."
            className="min-h-[120px] resize-none"
            maxLength={300}
          />
          <p className="text-xs text-muted-foreground text-right">
            {note.length}/300 characters
          </p>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading}>
            <Send className="h-4 w-4 mr-2" />
            {loading ? "Sending..." : "Send Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
