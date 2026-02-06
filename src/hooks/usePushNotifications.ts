import * as React from "react";
import { useToast } from "@/hooks/use-toast";

interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  data?: Record<string, any>;
}

export const usePushNotifications = () => {
  const { toast } = useToast();
  const [permission, setPermission] = React.useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = React.useState(false);

  React.useEffect(() => {
    // Check if notifications are supported
    const supported = "Notification" in window;
    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = React.useCallback(async () => {
    if (!isSupported) {
      toast({
        title: "Not Supported",
        description: "Push notifications are not supported in this browser",
        variant: "destructive",
      });
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);

      if (result === "granted") {
        toast({
          title: "Notifications Enabled",
          description: "You'll receive important updates and reminders",
        });
        return true;
      } else if (result === "denied") {
        toast({
          title: "Notifications Blocked",
          description: "Enable notifications in your browser settings",
          variant: "destructive",
        });
      }
      return false;
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }, [isSupported, toast]);

  const sendNotification = React.useCallback(
    async ({ title, body, icon, tag, data }: PushNotificationOptions) => {
      if (!isSupported || permission !== "granted") {
        // Fall back to in-app toast
        toast({ title, description: body });
        return;
      }

      try {
        // Play notification sound
        const audio = new Audio("data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBg==");
        audio.volume = 0.3;
        audio.play().catch((e) => console.warn("Audio play failed:", e));

        const notification = new Notification(title, {
          body,
          icon: icon || "/favicon.png",
          tag,
          data,
          badge: "/favicon.png",
          requireInteraction: false,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
          // Navigate if data contains a path
          if (data?.path) {
            window.location.href = data.path;
          }
        };

        // Auto-close after 5 seconds
        setTimeout(() => notification.close(), 5000);
      } catch (error) {
        console.error("Error sending notification:", error);
        // Fall back to in-app toast
        toast({ title, description: body });
      }
    },
    [isSupported, permission, toast]
  );

  const scheduleReminder = React.useCallback(
    (eventTitle: string, eventDate: Date, minutesBefore: number = 15) => {
      const reminderTime = new Date(eventDate.getTime() - minutesBefore * 60 * 1000);
      const now = new Date();
      const delay = reminderTime.getTime() - now.getTime();

      if (delay > 0) {
        setTimeout(() => {
          sendNotification({
            title: `Upcoming: ${eventTitle}`,
            body: `Starting in ${minutesBefore} minutes`,
            tag: `reminder-${eventTitle}`,
            data: { path: "/schedule" },
          });
        }, delay);
        return true;
      }
      return false;
    },
    [sendNotification]
  );

  return {
    isSupported,
    permission,
    requestPermission,
    sendNotification,
    scheduleReminder,
    isEnabled: permission === "granted",
  };
};
