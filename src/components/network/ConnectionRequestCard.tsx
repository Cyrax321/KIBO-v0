import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Check, X, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface ConnectionRequestCardProps {
  connection: {
    id: string;
    requester_id: string;
    note?: string | null;
    created_at: string;
    profiles?: {
      full_name: string | null;
      headline: string | null;
      avatar_url: string | null;
    } | null;
  };
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  loading?: boolean;
}

export const ConnectionRequestCard: React.FC<ConnectionRequestCardProps> = ({
  connection,
  onAccept,
  onDecline,
  loading = false,
}) => {
  const navigate = useNavigate();
  const [showNote, setShowNote] = React.useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
        <Avatar 
          className="h-14 w-14 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
          onClick={() => navigate(`/profile/${connection.requester_id}`)}
        >
          <AvatarImage src={connection.profiles?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary text-lg">
            {getInitials(connection.profiles?.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p 
                className="font-semibold hover:text-primary cursor-pointer transition-colors"
                onClick={() => navigate(`/profile/${connection.requester_id}`)}
              >
                {connection.profiles?.full_name || "User"}
              </p>
              <p className="text-sm text-muted-foreground">
                {connection.profiles?.headline || "Kibo User"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onDecline(connection.id)}
                disabled={loading}
              >
                <X className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                onClick={() => onAccept(connection.id)}
                disabled={loading}
              >
                <Check className="h-4 w-4 mr-1" />
                Accept
              </Button>
            </div>
          </div>

          {connection.note && (
            <div className="mt-3">
              {!showNote ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 text-primary hover:text-primary/80"
                  onClick={() => setShowNote(true)}
                >
                  <MessageSquare className="h-3 w-3 mr-1" />
                  View note
                </Button>
              ) : (
                <div className="p-3 rounded-lg bg-muted/50 border-l-2 border-primary">
                  <p className="text-sm text-foreground">{connection.note}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};
