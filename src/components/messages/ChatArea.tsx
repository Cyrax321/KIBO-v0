import * as React from "react";
import { useNavigate } from "react-router-dom";
import { Send, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { StarterMessages } from "./StarterMessages";
import type { Conversation } from "./ConversationList";

export interface Message {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface ChatAreaProps {
  selectedUser: Conversation | null;
  messages: Message[];
  currentUserId: string;
  newMessage: string;
  onNewMessageChange: (value: string) => void;
  onSendMessage: () => void;
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedUser,
  messages,
  currentUserId,
  newMessage,
  onNewMessageChange,
  onSendMessage,
  messagesEndRef,
}) => {
  const navigate = useNavigate();

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleStarterSelect = (message: string) => {
    onNewMessageChange(message);
  };

  if (!selectedUser) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground flex-col gap-2">
        <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-2">
          <Send className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <p className="font-medium">Select a conversation</p>
        <p className="text-sm">Choose someone from your connections to start chatting</p>
      </div>
    );
  }

  const isNewConnection = selectedUser.is_new_connection && messages.length === 0;

  return (
    <div className="flex-1 flex flex-col">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex items-center gap-3">
        <Avatar 
          className="h-10 w-10 cursor-pointer"
          onClick={() => navigate(`/profile/${selectedUser.user_id}`)}
        >
          <AvatarImage src={selectedUser.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(selectedUser.full_name)}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <p 
            className="font-semibold cursor-pointer hover:text-primary transition-colors"
            onClick={() => navigate(`/profile/${selectedUser.user_id}`)}
          >
            {selectedUser.full_name}
          </p>
          <p className="text-xs text-muted-foreground">{selectedUser.headline}</p>
        </div>
        {isNewConnection && (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-medium">
            <UserPlus className="h-3.5 w-3.5" />
            New Connection
          </div>
        )}
      </div>

      {/* New Connection Welcome */}
      {isNewConnection && (
        <div className="p-6 bg-gradient-to-b from-primary/5 to-transparent border-b border-border">
          <div className="text-center mb-4">
            <Avatar className="h-20 w-20 mx-auto mb-3">
              <AvatarImage src={selectedUser.avatar_url || undefined} />
              <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                {getInitials(selectedUser.full_name)}
              </AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">
              You're now connected with {selectedUser.full_name?.split(" ")[0]}!
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              Start the conversation and build your professional network
            </p>
          </div>
          <StarterMessages
            userName={selectedUser.full_name || "there"}
            onSelect={handleStarterSelect}
          />
        </div>
      )}

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg) => {
            const isMine = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={cn("flex items-end gap-2", isMine ? "justify-end" : "justify-start")}
              >
                {/* Avatar for other person's messages */}
                {!isMine && (
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarImage src={selectedUser?.avatar_url || undefined} />
                    <AvatarFallback className="bg-muted text-muted-foreground text-xs">
                      {getInitials(selectedUser?.full_name || null)}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm",
                    isMine
                      ? "bg-primary text-primary-foreground rounded-br-sm"
                      : "bg-white border border-border/50 rounded-bl-sm"
                  )}
                >
                  <p className={cn("text-sm leading-relaxed", !isMine && "text-foreground")}>
                    {msg.content}
                  </p>
                  <p className={cn(
                    "text-[10px] mt-1",
                    isMine ? "text-primary-foreground/70 text-right" : "text-muted-foreground"
                  )}>
                    {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                  </p>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-border">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={newMessage}
            onChange={(e) => onNewMessageChange(e.target.value)}
            placeholder={isNewConnection ? "Send your first message..." : "Type a message..."}
            className="flex-1"
          />
          <Button type="submit" disabled={!newMessage.trim()}>
            <Send className="h-4 w-4" />
          </Button>
        </form>
      </div>
    </div>
  );
};
