import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, UserPlus, MessageSquare, ThumbsUp, Award, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/sounds";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  from_user_id: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
  from_user?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

// Get appropriate sound for notification type
const getNotificationSoundType = (type: string) => {
  switch (type) {
    case "connection_request":
      return "connectionRequest";
    case "connection_accepted":
      return "connectionAccepted";
    case "message":
      return "messageReceived";
    case "post_like":
      return "like";
    case "comment":
      return "comment";
    case "achievement":
      return "achievement";
    case "new_post":
      return "notification";
    default:
      return "notification";
  }
};

export const NotificationBell: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [open, setOpen] = React.useState(false);
  const [currentUserId, setCurrentUserId] = React.useState<string | null>(null);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  React.useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUserId(session.user.id);
        fetchNotifications(session.user.id);
      }
    };
    init();
  }, []);

  // Real-time subscription for new notifications
  React.useEffect(() => {
    if (!currentUserId) return;

    const channel = supabase
      .channel("notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${currentUserId}`,
        },
        async (payload) => {
          const newNotification = payload.new as Notification;
          
          // Fetch from_user profile
          if (newNotification.from_user_id) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("user_id", newNotification.from_user_id)
              .single();
            
            newNotification.from_user = profile || undefined;
          }
          
          setNotifications(prev => [newNotification, ...prev]);
          
          // Play appropriate sound based on notification type
          const soundType = getNotificationSoundType(newNotification.type);
          playSound(soundType as any);
          
          // Show toast
          toast({
            title: newNotification.title,
            description: newNotification.body || undefined,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentUserId, toast]);

  const fetchNotifications = async (userId: string) => {
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);

    if (data && data.length > 0) {
      // Fetch profiles for from_user_ids
      const fromUserIds = [...new Set(data.map(n => n.from_user_id).filter(Boolean))] as string[];
      
      if (fromUserIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("user_id, full_name, avatar_url")
          .in("user_id", fromUserIds);

        const notificationsWithProfiles = data.map(n => ({
          ...n,
          from_user: profiles?.find(p => p.user_id === n.from_user_id) || undefined,
        }));
        
        setNotifications(notificationsWithProfiles);
      } else {
        setNotifications(data);
      }
    }
  };

  const markAsRead = async (notificationId: string) => {
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", notificationId);

    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, is_read: true } : n)
    );
  };

  const markAllAsRead = async () => {
    if (!currentUserId) return;
    
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", currentUserId)
      .eq("is_read", false);

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const handleNotificationClick = async (notification: Notification) => {
    await markAsRead(notification.id);
    setOpen(false);

    switch (notification.type) {
      case "connection_request":
        navigate("/network?tab=requests");
        break;
      case "connection_accepted":
        if (notification.from_user_id) {
          navigate(`/messages?user=${notification.from_user_id}`);
        }
        break;
      case "message":
        if (notification.from_user_id) {
          navigate(`/messages?user=${notification.from_user_id}`);
        } else {
          navigate("/messages");
        }
        break;
      case "post_like":
      case "comment":
      case "new_post":
        navigate("/network?tab=feed");
        break;
      case "achievement":
        if (notification.from_user_id) {
          navigate(`/profile/${notification.from_user_id}`);
        } else {
          navigate("/network?tab=feed");
        }
        break;
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "connection_request":
      case "connection_accepted":
        return <UserPlus className="h-4 w-4" />;
      case "message":
        return <MessageSquare className="h-4 w-4" />;
      case "post_like":
        return <ThumbsUp className="h-4 w-4" />;
      case "achievement":
        return <Award className="h-4 w-4" />;
      case "new_post":
        return <FileText className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          <AnimatePresence>
            {unreadCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center font-medium"
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </motion.span>
            )}
          </AnimatePresence>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-auto py-1"
              onClick={markAllAsRead}
            >
              Mark all read
            </Button>
          )}
        </div>
        
        <ScrollArea className="max-h-[400px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    "flex items-start gap-3 p-4 cursor-pointer transition-colors hover:bg-muted/50",
                    !notification.is_read && "bg-primary/5"
                  )}
                >
                  <Avatar className="h-10 w-10 shrink-0">
                    <AvatarImage src={notification.from_user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                      {notification.from_user 
                        ? getInitials(notification.from_user.full_name)
                        : getNotificationIcon(notification.type)
                      }
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      "text-sm",
                      !notification.is_read && "font-medium"
                    )}>
                      {notification.title}
                    </p>
                    {notification.body && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {notification.body}
                      </p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        
        <div className="p-2 border-t">
          <Button
            variant="ghost"
            className="w-full text-sm"
            onClick={() => {
              setOpen(false);
              navigate("/network?tab=requests");
            }}
          >
            View all notifications
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};
