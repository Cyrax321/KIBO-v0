import * as React from "react";
import { Search, Circle, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface Conversation {
  user_id: string;
  full_name: string | null;
  headline: string | null;
  avatar_url: string | null;
  last_message: string | null;
  last_message_time: string | null;
  unread_count: number;
  is_new_connection: boolean;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedUserId: string | null;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSelectConversation: (conversation: Conversation) => void;
}

export const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedUserId,
  searchQuery,
  onSearchChange,
  onSelectConversation,
}) => {
  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const filteredConversations = conversations.filter((c) =>
    c.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Separate new connections and existing conversations
  const newConnections = filteredConversations.filter((c) => c.is_new_connection);
  const existingConversations = filteredConversations.filter((c) => !c.is_new_connection);

  return (
    <div className="w-80 border-r border-border flex flex-col">
      <div className="p-4 border-b border-border">
        <h1 className="text-lg font-bold mb-3">Messages</h1>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9"
          />
        </div>
      </div>

      <ScrollArea className="flex-1">
        {/* New Connections Section */}
        {newConnections.length > 0 && (
          <div>
            <div className="px-4 py-2 bg-primary/5 border-b border-border">
              <div className="flex items-center gap-2 text-xs font-medium text-primary">
                <UserPlus className="h-3.5 w-3.5" />
                New Connections
                <Badge variant="secondary" className="ml-auto h-5 px-1.5 text-xs">
                  {newConnections.length}
                </Badge>
              </div>
            </div>
            {newConnections.map((conv) => (
              <div
                key={conv.user_id}
                onClick={() => onSelectConversation(conv)}
                className={cn(
                  "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border bg-primary/5",
                  selectedUserId === conv.user_id && "bg-muted"
                )}
              >
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={conv.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {getInitials(conv.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <UserPlus className="h-2.5 w-2.5" />
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{conv.full_name}</span>
                  </div>
                  <p className="text-xs text-primary font-medium mt-0.5">
                    Say hello to your new connection
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Existing Conversations */}
        {existingConversations.length === 0 && newConnections.length === 0 ? (
          <div className="p-4 text-center text-muted-foreground text-sm">
            No conversations yet
          </div>
        ) : (
          existingConversations.map((conv) => (
            <div
              key={conv.user_id}
              onClick={() => onSelectConversation(conv)}
              className={cn(
                "flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b border-border",
                selectedUserId === conv.user_id && "bg-muted"
              )}
            >
              <div className="relative">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={conv.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(conv.full_name)}
                  </AvatarFallback>
                </Avatar>
                {conv.unread_count > 0 && (
                  <Circle className="absolute -top-0.5 -right-0.5 h-3 w-3 fill-primary text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className={cn("font-medium text-sm", conv.unread_count > 0 && "font-semibold")}>
                    {conv.full_name}
                  </span>
                  {conv.last_message_time && (
                    <span className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(conv.last_message_time), { addSuffix: false })}
                    </span>
                  )}
                </div>
                <p className={cn(
                  "text-xs truncate mt-0.5",
                  conv.unread_count > 0 ? "text-foreground font-medium" : "text-muted-foreground"
                )}>
                  {conv.last_message || "Start a conversation..."}
                </p>
              </div>
            </div>
          ))
        )}
      </ScrollArea>
    </div>
  );
};
