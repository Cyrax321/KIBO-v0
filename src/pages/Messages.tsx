import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { ConversationList, Conversation } from "@/components/messages/ConversationList";
import { ChatArea, Message } from "@/components/messages/ChatArea";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/sounds";

const Messages: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [currentUserId, setCurrentUserId] = React.useState("");
  const [conversations, setConversations] = React.useState<Conversation[]>([]);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = React.useState("");
  const [loading, setLoading] = React.useState(true);
  const [searchQuery, setSearchQuery] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  // Get user from URL query params
  const targetUserId = searchParams.get("user");

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setCurrentUserId(session.user.id);
      fetchConversations(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  // Auto-select user from URL
  React.useEffect(() => {
    if (targetUserId && conversations.length > 0 && !selectedUser) {
      const targetConversation = conversations.find(c => c.user_id === targetUserId);
      if (targetConversation) {
        setSelectedUser(targetConversation);
      }
    }
  }, [targetUserId, conversations, selectedUser]);

  React.useEffect(() => {
    if (selectedUser) {
      fetchMessages(selectedUser.user_id);
      markAsRead(selectedUser.user_id);
    }
  }, [selectedUser]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Real-time subscription for messages
  React.useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("messages-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${currentUserId}`,
        },
        (payload) => {
          const newMsg = payload.new as Message;
          if (selectedUser && newMsg.sender_id === selectedUser.user_id) {
            setMessages((prev) => [...prev, newMsg]);
            markAsRead(selectedUser.user_id);
            playSound("messageReceived");
          } else {
            // Message from someone not currently selected
            playSound("messageReceived");
          }
          fetchConversations(currentUserId);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, selectedUser]);

  const fetchConversations = async (userId: string) => {
    // Get all connected users
    const { data: connections } = await supabase
      .from("connections")
      .select("requester_id, receiver_id, updated_at")
      .eq("status", "connected")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    if (!connections || connections.length === 0) {
      setConversations([]);
      setLoading(false);
      return;
    }

    // Get partner IDs from connections
    const partnerIds = connections.map((c) => 
      c.requester_id === userId ? c.receiver_id : c.requester_id
    );

    // Get all messages with these partners
    const { data: messagesData } = await supabase
      .from("messages")
      .select("*")
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    // Group messages by conversation partner
    const conversationMap = new Map<string, { lastMessage: Message | null; unreadCount: number }>();
    
    // Initialize all connected users (even those without messages)
    partnerIds.forEach((partnerId) => {
      conversationMap.set(partnerId, { lastMessage: null, unreadCount: 0 });
    });

    // Process messages
    messagesData?.forEach((msg) => {
      const partnerId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
      
      if (conversationMap.has(partnerId)) {
        const conv = conversationMap.get(partnerId)!;
        if (!conv.lastMessage) {
          conv.lastMessage = msg;
        }
        if (msg.receiver_id === userId && !msg.is_read) {
          conv.unreadCount++;
        }
      }
    });

    // Fetch profiles for all partners
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, headline, avatar_url")
      .in("user_id", partnerIds);

    // Build conversation list
    const conversationsList: Conversation[] = partnerIds.map((partnerId) => {
      const conv = conversationMap.get(partnerId)!;
      const profile = profiles?.find((p) => p.user_id === partnerId);
      const connection = connections.find((c) => 
        c.requester_id === partnerId || c.receiver_id === partnerId
      );

      return {
        user_id: partnerId,
        full_name: profile?.full_name || "User",
        headline: profile?.headline || "Kibo User",
        avatar_url: profile?.avatar_url || null,
        last_message: conv.lastMessage?.content || null,
        last_message_time: conv.lastMessage?.created_at || connection?.updated_at || null,
        unread_count: conv.unreadCount,
        is_new_connection: !conv.lastMessage, // No messages = new connection
      };
    });

    // Sort: new connections first, then by last message time
    conversationsList.sort((a, b) => {
      // New connections first
      if (a.is_new_connection && !b.is_new_connection) return -1;
      if (!a.is_new_connection && b.is_new_connection) return 1;
      
      // Then by time
      const timeA = a.last_message_time ? new Date(a.last_message_time).getTime() : 0;
      const timeB = b.last_message_time ? new Date(b.last_message_time).getTime() : 0;
      return timeB - timeA;
    });

    setConversations(conversationsList);
    setLoading(false);
  };

  const fetchMessages = async (partnerId: string) => {
    const { data } = await supabase
      .from("messages")
      .select("*")
      .or(
        `and(sender_id.eq.${currentUserId},receiver_id.eq.${partnerId}),and(sender_id.eq.${partnerId},receiver_id.eq.${currentUserId})`
      )
      .order("created_at", { ascending: true });

    setMessages(data || []);
  };

  const markAsRead = async (partnerId: string) => {
    await supabase
      .from("messages")
      .update({ is_read: true })
      .eq("sender_id", partnerId)
      .eq("receiver_id", currentUserId);
    
    // Update local state
    setConversations((prev) =>
      prev.map((c) =>
        c.user_id === partnerId ? { ...c, unread_count: 0 } : c
      )
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedUser) return;

    const messageContent = newMessage.trim();
    
    // Clear input immediately
    setNewMessage("");

    // Optimistic update
    const optimisticMessage: Message = {
      id: crypto.randomUUID(),
      sender_id: currentUserId,
      receiver_id: selectedUser.user_id,
      content: messageContent,
      is_read: false,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMessage]);
    
    // Play send sound
    playSound("messageSent");

    // Update conversation list
    setConversations((prev) =>
      prev.map((c) =>
        c.user_id === selectedUser.user_id
          ? { ...c, last_message: messageContent, last_message_time: new Date().toISOString(), is_new_connection: false }
          : c
      )
    );

    // Update selected user state
    if (selectedUser.is_new_connection) {
      setSelectedUser({ ...selectedUser, is_new_connection: false });
    }

    const { error } = await supabase.from("messages").insert({
      sender_id: currentUserId,
      receiver_id: selectedUser.user_id,
      content: messageContent,
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      // Rollback optimistic update
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
    } else {
      // Send notification to receiver
      const { data: myProfile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("user_id", currentUserId)
        .single();

      await supabase.from("notifications").insert({
        user_id: selectedUser.user_id,
        type: "message",
        title: `New message from ${myProfile?.full_name || "Someone"}`,
        body: messageContent.length > 50 ? messageContent.slice(0, 50) + "..." : messageContent,
        from_user_id: currentUserId,
      });
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
            className="h-8 w-8 border-2 border-primary border-t-transparent rounded-full"
          />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-3.5rem)] flex">
        <ConversationList
          conversations={conversations}
          selectedUserId={selectedUser?.user_id || null}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onSelectConversation={setSelectedUser}
        />
        <ChatArea
          selectedUser={selectedUser}
          messages={messages}
          currentUserId={currentUserId}
          newMessage={newMessage}
          onNewMessageChange={setNewMessage}
          onSendMessage={handleSendMessage}
          messagesEndRef={messagesEndRef}
        />
      </div>
    </AppLayout>
  );
};

export default Messages;
