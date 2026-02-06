import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Image, Video, X, Send, Smile, Globe, 
  FileImage, FileVideo, Loader2, Award, HelpCircle
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { playSound } from "@/lib/sounds";

interface CreatePostProps {
  currentUserId: string;
  userProfile?: {
    full_name: string | null;
    avatar_url: string | null;
    headline: string | null;
  };
  onPostCreated: () => void;
}

type PostType = "update" | "question" | "achievement";

export const CreatePost: React.FC<CreatePostProps> = ({
  currentUserId,
  userProfile,
  onPostCreated,
}) => {
  const { toast } = useToast();
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  
  const [content, setContent] = React.useState("");
  const [postType, setPostType] = React.useState<PostType>("update");
  const [mediaFiles, setMediaFiles] = React.useState<File[]>([]);
  const [mediaPreviews, setMediaPreviews] = React.useState<string[]>([]);
  const [uploading, setUploading] = React.useState(false);
  const [expanded, setExpanded] = React.useState(false);

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter(file => {
      const isImage = file.type.startsWith("image/");
      const isVideo = file.type.startsWith("video/");
      const isValidSize = file.size <= 50 * 1024 * 1024; // 50MB limit
      return (isImage || isVideo) && isValidSize;
    });

    if (validFiles.length !== files.length) {
      toast({
        title: "Some files were skipped",
        description: "Only images and videos under 50MB are allowed.",
        variant: "destructive",
      });
    }

    // Limit to 4 files
    const newFiles = [...mediaFiles, ...validFiles].slice(0, 4);
    setMediaFiles(newFiles);

    // Create previews
    newFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setMediaPreviews(prev => {
          const updated = [...prev, reader.result as string];
          return updated.slice(0, 4);
        });
      };
      reader.readAsDataURL(file);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removeMedia = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
    setMediaPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadMedia = async (file: File): Promise<string | null> => {
    const fileExt = file.name.split(".").pop();
    const fileName = `${currentUserId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    
    const { error: uploadError } = await supabase.storage
      .from("post-media")
      .upload(fileName, file);

    if (uploadError) {
      console.error("Upload error:", uploadError);
      return null;
    }

    const { data: { publicUrl } } = supabase.storage
      .from("post-media")
      .getPublicUrl(fileName);

    return publicUrl;
  };

  const handleSubmit = async () => {
    if (!content.trim() && mediaFiles.length === 0) return;

    setUploading(true);

    try {
      // Upload media files
      let imageUrl: string | null = null;
      
      if (mediaFiles.length > 0) {
        // For simplicity, just upload the first file as image_url
        // In a real app, you'd want a media_urls array
        imageUrl = await uploadMedia(mediaFiles[0]);
        
        if (!imageUrl) {
          toast({
            title: "Upload failed",
            description: "Failed to upload media. Please try again.",
            variant: "destructive",
          });
          setUploading(false);
          return;
        }
      }

      // Create post
      const { data: newPost, error } = await supabase.from("posts").insert({
        user_id: currentUserId,
        content: content.trim(),
        post_type: postType,
        image_url: imageUrl,
      }).select().single();

      if (error) {
        toast({ title: "Error", description: error.message, variant: "destructive" });
      } else {
        // Notify all connections about the new post
        const { data: connections } = await supabase
          .from("connections")
          .select("requester_id, receiver_id")
          .eq("status", "connected")
          .or(`requester_id.eq.${currentUserId},receiver_id.eq.${currentUserId}`);

        if (connections && connections.length > 0) {
          const connectionUserIds = connections.map(c => 
            c.requester_id === currentUserId ? c.receiver_id : c.requester_id
          );

          // Create notifications for all connections
          const notifications = connectionUserIds.map(userId => ({
            user_id: userId,
            type: postType === "achievement" ? "achievement" : "new_post",
            title: postType === "achievement" 
              ? `${userProfile?.full_name || "Someone"} just earned an achievement!`
              : `${userProfile?.full_name || "Someone"} shared a new post`,
            body: content.trim().length > 100 ? content.trim().slice(0, 100) + "..." : content.trim(),
            from_user_id: currentUserId,
            reference_id: newPost?.id,
          }));

          await supabase.from("notifications").insert(notifications);
        }

        playSound("success");
        toast({ title: "Posted!", description: "Your post is now live." });
        setContent("");
        setMediaFiles([]);
        setMediaPreviews([]);
        setPostType("update");
        setExpanded(false);
        onPostCreated();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    }

    setUploading(false);
  };

  const postTypeConfig = {
    update: { icon: Globe, label: "Update", color: "text-primary" },
    question: { icon: HelpCircle, label: "Question", color: "text-muted-foreground" },
    achievement: { icon: Award, label: "Achievement", color: "text-primary" },
  };

  return (
    <Card className="overflow-hidden">
      {/* Header */}
      <div className="p-4 flex items-start gap-3">
        <Avatar className="h-12 w-12">
          <AvatarImage src={userProfile?.avatar_url || undefined} />
          <AvatarFallback className="bg-primary/10 text-primary">
            {getInitials(userProfile?.full_name)}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1" onClick={() => setExpanded(true)}>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share an update, ask a question, or celebrate an achievement..."
            className={cn(
              "min-h-[60px] resize-none border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0",
              expanded && "min-h-[120px]"
            )}
          />
        </div>
      </div>

      {/* Media Previews */}
      <AnimatePresence>
        {mediaPreviews.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-3"
          >
            <div className={cn(
              "grid gap-2",
              mediaPreviews.length === 1 && "grid-cols-1",
              mediaPreviews.length === 2 && "grid-cols-2",
              mediaPreviews.length >= 3 && "grid-cols-2"
            )}>
              {mediaPreviews.map((preview, index) => (
                <div
                  key={index}
                  className={cn(
                    "relative rounded-lg overflow-hidden bg-muted",
                    mediaPreviews.length === 3 && index === 0 && "row-span-2"
                  )}
                >
                  {mediaFiles[index]?.type.startsWith("video/") ? (
                    <video
                      src={preview}
                      className="w-full h-full object-cover max-h-64"
                      controls
                    />
                  ) : (
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover max-h-64"
                    />
                  )}
                  <button
                    onClick={() => removeMedia(index)}
                    className="absolute top-2 right-2 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="px-4 pb-4 pt-2 border-t flex items-center justify-between gap-3">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,video/*"
            multiple
            className="hidden"
            onChange={handleFileSelect}
          />
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={mediaFiles.length >= 4}
          >
            <FileImage className="h-4 w-4 text-primary" />
            <span className="hidden sm:inline">Photo</span>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            className="gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={mediaFiles.length >= 4}
          >
            <FileVideo className="h-4 w-4 text-secondary-foreground" />
            <span className="hidden sm:inline">Video</span>
          </Button>

          <Select value={postType} onValueChange={(v) => setPostType(v as PostType)}>
            <SelectTrigger className="w-auto h-8 gap-2 border-0 hover:bg-muted">
              {React.createElement(postTypeConfig[postType].icon, {
                className: cn("h-4 w-4", postTypeConfig[postType].color)
              })}
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="update">
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-primary" />
                  Update
                </div>
              </SelectItem>
              <SelectItem value="question">
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-muted-foreground" />
                  Question
                </div>
              </SelectItem>
              <SelectItem value="achievement">
                <div className="flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  Achievement
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={(!content.trim() && mediaFiles.length === 0) || uploading}
          className="gap-2"
        >
          {uploading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
          {uploading ? "Posting..." : "Post"}
        </Button>
      </div>
    </Card>
  );
};
