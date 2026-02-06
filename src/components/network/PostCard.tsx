import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  ThumbsUp, MessageSquare, Share2, Award, HelpCircle, Globe,
  MoreHorizontal, Trash2, Flag, Bookmark
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { playSound } from "@/lib/sounds";

interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

interface PostCardProps {
  post: {
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
  };
  currentUserId: string;
  onUpvote: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  currentUserId,
  onUpvote,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showComments, setShowComments] = React.useState(false);
  const [comments, setComments] = React.useState<Comment[]>([]);
  const [newComment, setNewComment] = React.useState("");
  const [loadingComments, setLoadingComments] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const getPostTypeIcon = () => {
    switch (post.post_type) {
      case "achievement": 
        return <Award className="h-4 w-4 text-primary" />;
      case "question": 
        return <HelpCircle className="h-4 w-4 text-muted-foreground" />;
      default: 
        return <Globe className="h-4 w-4 text-primary" />;
    }
  };

  const fetchComments = async () => {
    setLoadingComments(true);
    const { data } = await supabase
      .from("comments")
      .select("*")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });

    if (data && data.length > 0) {
      const userIds = [...new Set(data.map(c => c.user_id))];
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, full_name, avatar_url")
        .in("user_id", userIds);

      const commentsWithProfiles = data.map(comment => ({
        ...comment,
        profiles: profiles?.find(p => p.user_id === comment.user_id) || undefined,
      }));
      setComments(commentsWithProfiles);
    } else {
      setComments([]);
    }
    setLoadingComments(false);
  };

  const handleShowComments = () => {
    if (!showComments) {
      fetchComments();
    }
    setShowComments(!showComments);
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return;
    setSubmitting(true);

    const { error } = await supabase.from("comments").insert({
      post_id: post.id,
      user_id: currentUserId,
      content: newComment.trim(),
    });

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      setNewComment("");
      fetchComments();
      
      // Notify post author
      if (post.user_id !== currentUserId) {
        const { data: myProfile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", currentUserId)
          .single();

        await supabase.from("notifications").insert({
          user_id: post.user_id,
          type: "comment",
          title: `${myProfile?.full_name || "Someone"} commented on your post`,
          body: newComment.trim().slice(0, 100),
          from_user_id: currentUserId,
          reference_id: post.id,
        });
      }
    }
    setSubmitting(false);
  };

  const isVideo = post.image_url?.match(/\.(mp4|webm|ogg|mov)$/i);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Card className="overflow-hidden">
        {/* Author Header */}
        <div className="p-4 flex items-start gap-3">
          <Avatar 
            className="h-12 w-12 cursor-pointer hover:ring-2 hover:ring-primary transition-all"
            onClick={() => navigate(`/profile/${post.user_id}`)}
          >
            <AvatarImage src={post.profiles?.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(post.profiles?.full_name)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span 
                className="font-semibold text-sm hover:text-primary cursor-pointer transition-colors"
                onClick={() => navigate(`/profile/${post.user_id}`)}
              >
                {post.profiles?.full_name || "Anonymous"}
              </span>
              {getPostTypeIcon()}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {post.profiles?.headline || "Kibo User"}
            </p>
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
            </p>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Bookmark className="h-4 w-4 mr-2" />
                Save post
              </DropdownMenuItem>
              {post.user_id === currentUserId ? (
                <DropdownMenuItem 
                  className="text-destructive"
                  onClick={() => onDelete?.(post.id)}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete post
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem>
                  <Flag className="h-4 w-4 mr-2" />
                  Report post
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Content */}
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground whitespace-pre-wrap">{post.content}</p>
        </div>

        {/* Media */}
        {post.image_url && (
          <div className="bg-muted">
            {isVideo ? (
              <video
                src={post.image_url}
                controls
                className="w-full max-h-[500px] object-contain"
              />
            ) : (
              <img
                src={post.image_url}
                alt="Post media"
                className="w-full max-h-[500px] object-contain"
              />
            )}
          </div>
        )}

        {/* Engagement Stats */}
        {(post.upvotes > 0 || comments.length > 0) && (
          <div className="px-4 py-2 flex items-center justify-between text-xs text-muted-foreground border-t">
            {post.upvotes > 0 && (
              <span className="flex items-center gap-1">
                <ThumbsUp className="h-3 w-3 fill-primary text-primary" />
                {post.upvotes}
              </span>
            )}
            {comments.length > 0 && (
              <span>{comments.length} comment{comments.length !== 1 ? "s" : ""}</span>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center border-t">
          <Button
            variant="ghost"
            className={cn(
              "flex-1 gap-2 rounded-none h-12",
              post.user_upvoted && "text-primary"
            )}
            onClick={() => onUpvote(post.id)}
          >
            <ThumbsUp className={cn("h-4 w-4", post.user_upvoted && "fill-current")} />
            Like
          </Button>
          <Button
            variant="ghost"
            className="flex-1 gap-2 rounded-none h-12"
            onClick={handleShowComments}
          >
            <MessageSquare className="h-4 w-4" />
            Comment
          </Button>
          <Button variant="ghost" className="flex-1 gap-2 rounded-none h-12">
            <Share2 className="h-4 w-4" />
            Share
          </Button>
        </div>

        {/* Comments Section */}
        <AnimatePresence>
          {showComments && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t overflow-hidden"
            >
              <div className="p-4 space-y-4">
                {/* Comment Input */}
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      You
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      className="min-h-[40px] resize-none flex-1"
                      rows={1}
                    />
                    <Button
                      size="sm"
                      onClick={handleSubmitComment}
                      disabled={!newComment.trim() || submitting}
                    >
                      Post
                    </Button>
                  </div>
                </div>

                {/* Comments List */}
                {loadingComments ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Loading comments...
                  </p>
                ) : comments.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No comments yet. Be the first!
                  </p>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="flex gap-3">
                        <Avatar 
                          className="h-8 w-8 shrink-0 cursor-pointer"
                          onClick={() => navigate(`/profile/${comment.user_id}`)}
                        >
                          <AvatarImage src={comment.profiles?.avatar_url || undefined} />
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {getInitials(comment.profiles?.full_name)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 bg-muted rounded-lg p-3">
                          <div className="flex items-center justify-between gap-2">
                            <span 
                              className="font-medium text-sm hover:text-primary cursor-pointer"
                              onClick={() => navigate(`/profile/${comment.user_id}`)}
                            >
                              {comment.profiles?.full_name || "User"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                            </span>
                          </div>
                          <p className="text-sm mt-1">{comment.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
};
