import * as React from "react";
import { supabase } from "@/integrations/supabase/client";
import { usePushNotifications } from "./usePushNotifications";
import { useToast } from "./use-toast";

/**
 * Hook to handle app-wide push notifications for various events
 */
export const useAppNotifications = () => {
  const { toast } = useToast();
  const { sendNotification, isEnabled, scheduleReminder } = usePushNotifications();
  const [userId, setUserId] = React.useState<string | null>(null);

  // Get current user
  React.useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUserId(session?.user?.id || null);
    };
    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      setUserId(session?.user?.id || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Subscribe to realtime events for notifications
  React.useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`app-notifications:${userId}`)
      // New message received
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          // Get sender info
          const { data: sender } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", payload.new.sender_id)
            .single();

          sendNotification({
            title: "New Message",
            body: `${sender?.full_name || "Someone"} sent you a message`,
            tag: `message-${payload.new.id}`,
            data: { path: "/messages" },
          });
        }
      )
      // New connection request
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "connections",
          filter: `receiver_id=eq.${userId}`,
        },
        async (payload) => {
          const { data: requester } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("user_id", payload.new.requester_id)
            .single();

          sendNotification({
            title: "Connection Request",
            body: `${requester?.full_name || "Someone"} wants to connect`,
            tag: `connection-${payload.new.id}`,
            data: { path: "/network" },
          });
        }
      )
      // Connection accepted
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "connections",
          filter: `requester_id=eq.${userId}`,
        },
        async (payload) => {
          if (payload.new.status === "accepted") {
            const { data: receiver } = await supabase
              .from("profiles")
              .select("full_name")
              .eq("user_id", payload.new.receiver_id)
              .single();

            sendNotification({
              title: "Connection Accepted",
              body: `${receiver?.full_name || "Someone"} accepted your request`,
              tag: `connection-accepted-${payload.new.id}`,
              data: { path: "/network" },
            });
          }
        }
      )
      // New notification in-app
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Also push if it's important
          if (["interview", "offer", "achievement"].includes(payload.new.type)) {
            sendNotification({
              title: payload.new.title,
              body: payload.new.body || "",
              tag: `notification-${payload.new.id}`,
            });
          }
        }
      )
      // Achievement unlocked
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "user_achievements",
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const { data: achievement } = await supabase
            .from("achievements")
            .select("name, xp_reward")
            .eq("id", payload.new.achievement_id)
            .single();

          sendNotification({
            title: "Achievement Unlocked! 🏆",
            body: `${achievement?.name || "New achievement"} (+${achievement?.xp_reward || 0} XP)`,
            tag: `achievement-${payload.new.id}`,
            data: { path: "/achievements" },
          });
        }
      )
      // Schedule event reminder (upcoming events)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "schedule_events",
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          // Schedule reminder for 15 min before
          if (payload.new.event_date && payload.new.event_time) {
            const eventDate = new Date(`${payload.new.event_date}T${payload.new.event_time}`);
            scheduleReminder(payload.new.title, eventDate, 15);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, sendNotification, scheduleReminder]);

  // Notify on specific actions
  const notifyProblemSolved = React.useCallback(
    (problemTitle: string, xpEarned: number) => {
      sendNotification({
        title: "Problem Solved! 💡",
        body: `${problemTitle} (+${xpEarned} XP)`,
        tag: `problem-${Date.now()}`,
        data: { path: "/arena" },
      });
    },
    [sendNotification]
  );

  const notifyLevelUp = React.useCallback(
    (newLevel: number) => {
      sendNotification({
        title: "Level Up! 🎉",
        body: `You've reached level ${newLevel}!`,
        tag: `levelup-${newLevel}`,
        data: { path: "/dashboard" },
      });
    },
    [sendNotification]
  );

  const notifyApplicationUpdate = React.useCallback(
    (company: string, newStatus: string) => {
      const statusMessages: Record<string, string> = {
        oa: `${company} sent you an Online Assessment`,
        technical: `${company} invited you for a Technical Interview`,
        hr: `${company} wants to schedule an HR Interview`,
        offer: `🎉 ${company} extended you an OFFER!`,
      };

      if (statusMessages[newStatus]) {
        sendNotification({
          title: "Application Update",
          body: statusMessages[newStatus],
          tag: `app-update-${Date.now()}`,
          data: { path: "/applications" },
        });
      }
    },
    [sendNotification]
  );

  const notifyDailyReminder = React.useCallback(() => {
    sendNotification({
      title: "Daily Reminder 📅",
      body: "Don't forget to complete your daily tasks!",
      tag: "daily-reminder",
      data: { path: "/dashboard" },
    });
  }, [sendNotification]);

  return {
    isEnabled,
    notifyProblemSolved,
    notifyLevelUp,
    notifyApplicationUpdate,
    notifyDailyReminder,
  };
};
