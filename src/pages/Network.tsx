import * as React from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  TrendingUp, Users, UserPlus
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { CreatePost } from "@/components/network/CreatePost";
import { PostCard } from "@/components/network/PostCard";
import { ConnectDialog } from "@/components/network/ConnectDialog";
import { MyConnectionsManager } from "@/components/network/MyConnectionsManager";
import { playSound } from "@/lib/sounds";

interface Post {
  id: string;
  user_id: string;
  content: string;
  post_type: string;
  upvotes: number;
  image_url: string | null;
  created_at: string;
  profiles?: {
    full_name: string | null;
    headline: string | null;
    avatar_url: string | null;
  };
  user_upvoted?: boolean;
}

interface SuggestedUser {
  user_id: string;
  full_name: string | null;
  headline: string | null;
  avatar_url: string | null;
}

const Network: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { toast } = useToast();
  
  const [posts, setPosts] = React.useState<Post[]>([]);
  const [suggestedUsers, setSuggestedUsers] = React.useState<SuggestedUser[]>([]);
  const [pendingCount, setPendingCount] = React.useState(0);
  const [loading, setLoading] = React.useState(true);
  const [currentUserId, setCurrentUserId] = React.useState("");
  const [userProfile, setUserProfile] = React.useState<{
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
  } | null>(null);
  
  // Connect dialog state
  const [connectDialogOpen, setConnectDialogOpen] = React.useState(false);
  const [selectedUser, setSelectedUser] = React.useState<SuggestedUser | null>(null);
  const [connectLoading, setConnectLoading] = React.useState(false);

  const activeTab = searchParams.get("tab") || "feed";

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setCurrentUserId(session.user.id);
      
      // Fetch user profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, avatar_url, headline")
        .eq("user_id", session.user.id)
        .single();
      
      if (profile) setUserProfile(profile);
      
      fetchData(session.user.id);
    };
    checkAuth();
  }, [navigate]);

  // Real-time subscription for new posts
  React.useEffect(() => {
    const channel = supabase
      .channel("posts-feed")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "posts",
        },
        () => {
          fetchPosts();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchData = async (userId: string) => {
    await Promise.all([
      fetchPosts(),
      fetchSuggestedUsers(userId),
      fetchPendingCount(userId),
    ]);
    setLoading(false);
  };

  const fetchPosts = async () => {
    const { data: postsData } = await supabase
      .from("posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (postsData) {
      const userIds = [...new Set(postsData.map(p => p.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, headline, avatar_url")
        .in("user_id", userIds);
      
      // Check upvotes for current user
      const { data: { session } } = await supabase.auth.getSession();
      let userUpvotes: string[] = [];
      
      if (session) {
        const { data: upvotes } = await supabase
          .from("post_upvotes")
          .select("post_id")
          .eq("user_id", session.user.id);
        userUpvotes = upvotes?.map(u => u.post_id) || [];
      }
      
      const postsWithProfiles = postsData.map(post => ({
        ...post,
        profiles: profiles?.find(p => p.user_id === post.user_id) || undefined,
        user_upvoted: userUpvotes.includes(post.id),
      }));
      
      setPosts(postsWithProfiles);
    }
  };

  const fetchSuggestedUsers = async (userId: string) => {
    // Get existing connections
    const { data: connections } = await supabase
      .from("connections")
      .select("requester_id, receiver_id")
      .or(`requester_id.eq.${userId},receiver_id.eq.${userId}`);

    const connectedIds = new Set<string>();
    connections?.forEach(c => {
      connectedIds.add(c.requester_id);
      connectedIds.add(c.receiver_id);
    });
    connectedIds.add(userId);

    // Get suggested users not connected
    const { data: suggestedData } = await supabase
      .from("profiles")
      .select("user_id, full_name, headline, avatar_url")
      .not("user_id", "in", `(${Array.from(connectedIds).join(",")})`)
      .limit(10);

    if (suggestedData) {
      setSuggestedUsers(suggestedData);
    }
  };

  const fetchPendingCount = async (userId: string) => {
    const { count } = await supabase
      .from("connections")
      .select("id", { count: "exact", head: true })
      .eq("receiver_id", userId)
      .eq("status", "pending");
    
    setPendingCount(count || 0);
  };

  const handleUpvote = async (postId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const post = posts.find(p => p.id === postId);
    if (!post) return;

    if (post.user_upvoted) {
      // Remove upvote
      await supabase.from("post_upvotes")
        .delete()
        .eq("post_id", postId)
        .eq("user_id", session.user.id);
      
      await supabase.from("posts")
        .update({ upvotes: post.upvotes - 1 })
        .eq("id", postId);
    } else {
      // Add upvote
      await supabase.from("post_upvotes")
        .insert({ post_id: postId, user_id: session.user.id });
      
      // Play like sound
      playSound("like");
      
      await supabase.from("posts")
        .update({ upvotes: post.upvotes + 1 })
        .eq("id", postId);
      
      // Notify post author
      if (post.user_id !== session.user.id) {
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", session.user.id)
          .single();

        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "post_like",
          title: `${myProfile?.full_name || "Someone"} liked your post`,
          from_user_id: session.user.id,
          reference_id: postId,
        });
      }
    }

    // Optimistic update
    setPosts(prev => prev.map(p => 
      p.id === postId 
        ? { ...p, upvotes: p.upvotes + (p.user_upvoted ? -1 : 1), user_upvoted: !p.user_upvoted }
        : p
    ));
  };

  const handleDeletePost = async (postId: string) => {
    const { error } = await supabase.from("posts").delete().eq("id", postId);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setPosts(prev => prev.filter(p => p.id !== postId));
      toast({ title: "Deleted", description: "Post deleted successfully." });
    }
  };

  const openConnectDialog = (user: SuggestedUser) => {
    setSelectedUser(user);
    setConnectDialogOpen(true);
  };

  const handleConnect = async (userId: string, note: string) => {
    setConnectLoading(true);
    
    const { error } = await supabase.from("connections").insert({
      requester_id: currentUserId,
      receiver_id: userId,
      status: "pending",
      note: note || null,
    });

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Already sent", description: "Connection request already pending." });
      } else {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      }
    } else {
      // Send notification
      await supabase.from("notifications").insert({
        user_id: userId,
        type: "connection_request",
        title: `${userProfile?.full_name || "Someone"} wants to connect with you`,
        body: note || "Sent you a connection request",
        from_user_id: currentUserId,
      });

      toast({ title: "Request sent!", description: "Connection request sent successfully." });
      setSuggestedUsers(prev => prev.filter(u => u.user_id !== userId));
      setConnectDialogOpen(false);
    }
    
    setConnectLoading(false);
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
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
      <div className="p-6 lg:p-8">
        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setSearchParams({ tab: v })}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Network</h1>
              <p className="text-muted-foreground text-sm">Connect with fellow engineers</p>
            </div>
            <TabsList>
              <TabsTrigger value="feed" className="gap-2">
                <TrendingUp className="h-4 w-4" />
                Feed
              </TabsTrigger>
              <TabsTrigger value="requests" className="gap-2">
                <Users className="h-4 w-4" />
                My Network
                {pendingCount > 0 && (
                  <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 text-xs">
                    {pendingCount}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="feed" className="mt-0">
            <div className="grid gap-6 lg:grid-cols-[1fr,320px]">
              {/* Main Feed */}
              <div className="space-y-4">
                {/* Create Post */}
                {userProfile && (
                  <CreatePost
                    currentUserId={currentUserId}
                    userProfile={userProfile}
                    onPostCreated={fetchPosts}
                  />
                )}

                {/* Posts */}
                <div className="space-y-4">
                  {posts.length === 0 ? (
                    <Card className="p-8 text-center">
                      <p className="text-muted-foreground">No posts yet. Be the first to share!</p>
                    </Card>
                  ) : (
                    posts.map((post) => (
                      <PostCard
                        key={post.id}
                        post={post}
                        currentUserId={currentUserId}
                        onUpvote={handleUpvote}
                        onDelete={handleDeletePost}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Sidebar */}
              <div className="space-y-4">
                {/* Suggested Connections */}
                <Card className="p-4">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <UserPlus className="h-4 w-4" />
                    People you may know
                  </h3>
                  <div className="space-y-3">
                    {suggestedUsers.length === 0 ? (
                      <p className="text-sm text-muted-foreground">No suggestions available</p>
                    ) : (
                      suggestedUsers.slice(0, 5).map((user) => (
                        <div key={user.user_id} className="flex items-center gap-3">
                          <Avatar 
                            className="h-10 w-10 cursor-pointer"
                            onClick={() => navigate(`/profile/${user.user_id}`)}
                          >
                            <AvatarImage src={user.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/10 text-primary text-sm">
                              {getInitials(user.full_name)}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p 
                              className="font-medium text-sm truncate hover:text-primary cursor-pointer"
                              onClick={() => navigate(`/profile/${user.user_id}`)}
                            >
                              {user.full_name || "User"}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              {user.headline || "Kibo User"}
                            </p>
                          </div>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openConnectDialog(user)}
                          >
                            Connect
                          </Button>
                        </div>
                      ))
                    )}
                  </div>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="requests" className="mt-0">
            <div className="max-w-3xl">
              <MyConnectionsManager
                currentUserId={currentUserId}
                defaultTab="requests"
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Connect Dialog */}
      <ConnectDialog
        open={connectDialogOpen}
        onOpenChange={setConnectDialogOpen}
        user={selectedUser}
        onConnect={handleConnect}
        loading={connectLoading}
      />
    </AppLayout>
  );
};

export default Network;
