import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Users, UserCheck, Clock, Send, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ConnectionRequestCard } from "./ConnectionRequestCard";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/sounds";

interface Connection {
  id: string;
  requester_id: string;
  receiver_id: string;
  status: string;
  note: string | null;
  created_at: string;
  updated_at: string;
  profiles?: {
    user_id: string;
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
  } | null;
}

interface MyConnectionsManagerProps {
  currentUserId: string;
  defaultTab?: string;
}

export const MyConnectionsManager: React.FC<MyConnectionsManagerProps> = ({
  currentUserId,
  defaultTab = "requests",
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [pendingReceived, setPendingReceived] = React.useState<Connection[]>([]);
  const [pendingSent, setPendingSent] = React.useState<Connection[]>([]);
  const [accepted, setAccepted] = React.useState<Connection[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [actionLoading, setActionLoading] = React.useState(false);

  React.useEffect(() => {
    fetchConnections();
  }, [currentUserId]);

  const fetchConnections = async () => {
    // Fetch all connections for current user
    const { data: connectionsData } = await supabase
      .from("connections")
      .select("*")
      .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`)
      .order("created_at", { ascending: false });

    if (!connectionsData) {
      setLoading(false);
      return;
    }

    // Get all unique user IDs
    const userIds = new Set<string>();
    connectionsData.forEach(c => {
      userIds.add(c.requester_id);
      userIds.add(c.receiver_id);
    });
    userIds.delete(currentUserId);

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("user_id, full_name, headline, avatar_url")
      .in("user_id", Array.from(userIds));

    // Categorize connections
    const received: Connection[] = [];
    const sent: Connection[] = [];
    const connected: Connection[] = [];

    connectionsData.forEach(conn => {
      const otherUserId = conn.requester_id === currentUserId ? conn.receiver_id : conn.requester_id;
      const profile = profiles?.find(p => p.user_id === otherUserId);
      const connectionWithProfile = { ...conn, profiles: profile || null };

      if (conn.status === "pending") {
        if (conn.receiver_id === currentUserId) {
          received.push(connectionWithProfile);
        } else {
          sent.push(connectionWithProfile);
        }
      } else if (conn.status === "connected") {
        connected.push(connectionWithProfile);
      }
    });

    setPendingReceived(received);
    setPendingSent(sent);
    setAccepted(connected);
    setLoading(false);
  };

  const handleAccept = async (connectionId: string) => {
    setActionLoading(true);
    const connection = pendingReceived.find(c => c.id === connectionId);
    
    const { error } = await supabase
      .from("connections")
      .update({ status: "connected" })
      .eq("id", connectionId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      // Send notification to requester
      if (connection) {
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", currentUserId)
          .single();

        await supabase.from("notifications").insert({
          user_id: connection.requester_id,
          type: "connection_accepted",
          title: `${myProfile?.full_name || "Someone"} accepted your connection request`,
          from_user_id: currentUserId,
          reference_id: connectionId,
        });
      }

      playSound("connectionAccepted");
      toast({ title: "Connected!", description: "You're now connected!" });
      fetchConnections();
    }
    setActionLoading(false);
  };

  const handleDecline = async (connectionId: string) => {
    setActionLoading(true);
    const { error } = await supabase
      .from("connections")
      .update({ status: "declined" })
      .eq("id", connectionId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Declined", description: "Connection request declined." });
      fetchConnections();
    }
    setActionLoading(false);
  };

  const handleWithdraw = async (connectionId: string) => {
    setActionLoading(true);
    const { error } = await supabase
      .from("connections")
      .delete()
      .eq("id", connectionId);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Withdrawn", description: "Connection request withdrawn." });
      fetchConnections();
    }
    setActionLoading(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <Tabs defaultValue={defaultTab}>
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="requests" className="gap-2">
          <Users className="h-4 w-4" />
          Received
          {pendingReceived.length > 0 && (
            <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-xs">
              {pendingReceived.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="sent" className="gap-2">
          <Send className="h-4 w-4" />
          Sent
          {pendingSent.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
              {pendingSent.length}
            </Badge>
          )}
        </TabsTrigger>
        <TabsTrigger value="connected" className="gap-2">
          <UserCheck className="h-4 w-4" />
          Connected
          <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
            {accepted.length}
          </Badge>
        </TabsTrigger>
      </TabsList>

      <TabsContent value="requests" className="mt-4 space-y-3">
        {pendingReceived.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No pending connection requests</p>
          </Card>
        ) : (
          pendingReceived.map((connection) => (
            <ConnectionRequestCard
              key={connection.id}
              connection={connection}
              onAccept={handleAccept}
              onDecline={handleDecline}
              loading={actionLoading}
            />
          ))
        )}
      </TabsContent>

      <TabsContent value="sent" className="mt-4 space-y-3">
        {pendingSent.length === 0 ? (
          <Card className="p-8 text-center">
            <Send className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No pending sent requests</p>
          </Card>
        ) : (
          pendingSent.map((connection) => (
            <Card key={connection.id} className="p-4">
              <div className="flex items-center gap-4">
                <Avatar 
                  className="h-12 w-12 cursor-pointer"
                  onClick={() => navigate(`/profile/${connection.receiver_id}`)}
                >
                  <AvatarImage src={connection.profiles?.avatar_url || undefined} />
                  <AvatarFallback className="bg-primary/10 text-primary">
                    {getInitials(connection.profiles?.full_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{connection.profiles?.full_name || "User"}</p>
                  <p className="text-sm text-muted-foreground">
                    {connection.profiles?.headline || "Kibo User"}
                  </p>
                  <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Pending · {formatDistanceToNow(new Date(connection.created_at), { addSuffix: true })}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleWithdraw(connection.id)}
                  disabled={actionLoading}
                >
                  Withdraw
                </Button>
              </div>
              {connection.note && (
                <div className="mt-3 p-3 rounded-lg bg-muted/50 border-l-2 border-muted-foreground/30">
                  <p className="text-xs text-muted-foreground mb-1">Your note:</p>
                  <p className="text-sm">{connection.note}</p>
                </div>
              )}
            </Card>
          ))
        )}
      </TabsContent>

      <TabsContent value="connected" className="mt-4 space-y-3">
        {accepted.length === 0 ? (
          <Card className="p-8 text-center">
            <UserCheck className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">No connections yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Start connecting with fellow engineers!
            </p>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {accepted.map((connection) => {
              const otherUserId = connection.requester_id === currentUserId 
                ? connection.receiver_id 
                : connection.requester_id;
              
              return (
                <Card key={connection.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <Avatar 
                      className="h-12 w-12 cursor-pointer"
                      onClick={() => navigate(`/profile/${otherUserId}`)}
                    >
                      <AvatarImage src={connection.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(connection.profiles?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">
                        {connection.profiles?.full_name || "User"}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {connection.profiles?.headline || "Kibo User"}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => navigate(`/messages?user=${otherUserId}`)}
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </TabsContent>
    </Tabs>
  );
};
