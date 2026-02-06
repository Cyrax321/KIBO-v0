import * as React from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MapPin, Link as LinkIcon, Github, Linkedin, Award, Code2, 
  Target, Users, Trophy, Edit2, CheckCircle2
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  headline: string | null;
  bio: string | null;
  avatar_url: string | null;
  country: string | null;
  github_url: string | null;
  linkedin_url: string | null;
  skills: string[] | null;
  level: number;
  xp: number;
  streak: number;
  problems_solved: number;
  applications_count: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

const LEVEL_NAMES = ["Novice", "Apprentice", "Developer", "Engineer", "Architect", "Senior", "Staff", "Principal", "Distinguished", "Fellow"];

// Demo achievements
const DEMO_ACHIEVEMENTS: Achievement[] = [
  { id: "1", name: "First Steps", description: "Solve your first problem", icon: "trophy", unlocked: true },
  { id: "2", name: "Problem Solver", description: "Solve 10 problems", icon: "award", unlocked: true },
  { id: "3", name: "Algorithm Master", description: "Solve 50 problems", icon: "crown", unlocked: false },
  { id: "4", name: "Job Hunter", description: "Track your first application", icon: "target", unlocked: true },
  { id: "5", name: "Dedicated Applicant", description: "Track 25 applications", icon: "briefcase", unlocked: false },
  { id: "6", name: "Streak Starter", description: "7-day streak", icon: "flame", unlocked: true },
  { id: "7", name: "Streak Champion", description: "30-day streak", icon: "fire", unlocked: false },
  { id: "8", name: "Social Butterfly", description: "Make 10 connections", icon: "users", unlocked: false },
];

const AchievementBadge: React.FC<{ achievement: Achievement }> = ({ achievement }) => (
  <motion.div
    whileHover={{ scale: 1.05 }}
    className={cn(
      "relative flex flex-col items-center p-3 rounded-xl transition-all",
      achievement.unlocked 
        ? "bg-primary/10" 
        : "bg-muted opacity-50"
    )}
  >
    <div className={cn(
      "w-12 h-12 rounded-full flex items-center justify-center mb-2",
      achievement.unlocked 
        ? "bg-primary/20 text-primary" 
        : "bg-muted-foreground/20 text-muted-foreground"
    )}>
      <Trophy className="h-6 w-6" />
    </div>
    <span className="text-xs font-medium text-center">{achievement.name}</span>
    {achievement.unlocked && (
      <CheckCircle2 className="absolute top-1 right-1 h-4 w-4 text-success" />
    )}
  </motion.div>
);

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { userId } = useParams();
  
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [isOwnProfile, setIsOwnProfile] = React.useState(false);
  const [loading, setLoading] = React.useState(true);
  const [editDialogOpen, setEditDialogOpen] = React.useState(false);
  const [editForm, setEditForm] = React.useState({
    full_name: "",
    headline: "",
    bio: "",
    country: "",
    github_url: "",
    linkedin_url: "",
  });

  React.useEffect(() => {
    const fetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }

      const targetUserId = userId || session.user.id;
      setIsOwnProfile(!userId || userId === session.user.id);

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", targetUserId)
        .single();

      if (error) {
        toast({ title: "Error", description: "Profile not found", variant: "destructive" });
        navigate("/dashboard");
        return;
      }

      setProfile(data);
      setEditForm({
        full_name: data.full_name || "",
        headline: data.headline || "",
        bio: data.bio || "",
        country: data.country || "",
        github_url: data.github_url || "",
        linkedin_url: data.linkedin_url || "",
      });
      setLoading(false);
    };

    fetchProfile();
  }, [userId, navigate, toast]);

  const handleUpdateProfile = async () => {
    if (!profile) return;

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: editForm.full_name,
        headline: editForm.headline,
        bio: editForm.bio,
        country: editForm.country,
        github_url: editForm.github_url || null,
        linkedin_url: editForm.linkedin_url || null,
      })
      .eq("id", profile.id);

    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Success", description: "Profile updated!" });
      setProfile({ ...profile, ...editForm });
      setEditDialogOpen(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return "U";
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const levelName = profile ? LEVEL_NAMES[Math.min(profile.level - 1, LEVEL_NAMES.length - 1)] : "Novice";

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

  if (!profile) return null;

  return (
    <AppLayout>
      <div className="p-6 lg:p-8 max-w-4xl mx-auto">
        {/* Profile Header */}
        <Card className="p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Avatar */}
            <Avatar className="h-24 w-24 ring-4 ring-primary/20">
              <AvatarImage src={profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                {getInitials(profile.full_name)}
              </AvatarFallback>
            </Avatar>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <h1 className="text-2xl font-bold">{profile.full_name || "Anonymous"}</h1>
                  <p className="text-muted-foreground">{profile.headline || "Kibo User"}</p>
                  {profile.country && (
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {profile.country}
                    </p>
                  )}
                </div>
                
                {isOwnProfile && (
                  <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Edit2 className="h-4 w-4 mr-2" />
                        Edit Profile
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div className="space-y-2">
                          <Label>Full Name</Label>
                          <Input
                            value={editForm.full_name}
                            onChange={(e) => setEditForm({ ...editForm, full_name: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Headline</Label>
                          <Input
                            value={editForm.headline}
                            onChange={(e) => setEditForm({ ...editForm, headline: e.target.value })}
                            placeholder="Software Engineer @ Google"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Bio</Label>
                          <Textarea
                            value={editForm.bio}
                            onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                            placeholder="Tell us about yourself..."
                            rows={3}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>Country</Label>
                          <Input
                            value={editForm.country}
                            onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label>GitHub URL</Label>
                            <Input
                              value={editForm.github_url}
                              onChange={(e) => setEditForm({ ...editForm, github_url: e.target.value })}
                              placeholder="https://github.com/..."
                            />
                          </div>
                          <div className="space-y-2">
                            <Label>LinkedIn URL</Label>
                            <Input
                              value={editForm.linkedin_url}
                              onChange={(e) => setEditForm({ ...editForm, linkedin_url: e.target.value })}
                              placeholder="https://linkedin.com/in/..."
                            />
                          </div>
                        </div>
                        <Button className="w-full" onClick={handleUpdateProfile}>
                          Save Changes
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                )}
              </div>

              {/* Social Links */}
              <div className="flex gap-2 mt-3">
                {profile.github_url && (
                  <a href={profile.github_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Github className="h-4 w-4" />
                    </Button>
                  </a>
                )}
                {profile.linkedin_url && (
                  <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" size="icon" className="h-8 w-8">
                      <Linkedin className="h-4 w-4" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="mt-4 text-sm text-muted-foreground">{profile.bio}</p>
          )}
        </Card>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-4 mb-6">
          <Card className="p-4 text-center">
            <Code2 className="h-6 w-6 mx-auto mb-2 text-primary" />
            <p className="text-2xl font-bold">{profile.problems_solved}</p>
            <p className="text-xs text-muted-foreground">Problems Solved</p>
          </Card>
          <Card className="p-4 text-center">
            <Target className="h-6 w-6 mx-auto mb-2 text-success" />
            <p className="text-2xl font-bold">{profile.applications_count}</p>
            <p className="text-xs text-muted-foreground">Applications</p>
          </Card>
          <Card className="p-4 text-center">
            <Award className="h-6 w-6 mx-auto mb-2 text-warning" />
            <p className="text-2xl font-bold">Lvl {profile.level}</p>
            <p className="text-xs text-muted-foreground">{levelName}</p>
          </Card>
          <Card className="p-4 text-center">
            <Users className="h-6 w-6 mx-auto mb-2 text-accent-foreground" />
            <p className="text-2xl font-bold">#42</p>
            <p className="text-xs text-muted-foreground">Global Rank</p>
          </Card>
        </div>

        {/* Skills */}
        {profile.skills && profile.skills.length > 0 && (
          <Card className="p-4 mb-6">
            <h3 className="font-semibold mb-3">Skills</h3>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill) => (
                <Badge key={skill} variant="secondary" className="px-3 py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </Card>
        )}

        {/* Achievements */}
        <Card className="p-4">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-warning" />
            Achievements
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {DEMO_ACHIEVEMENTS.map((achievement) => (
              <AchievementBadge key={achievement.id} achievement={achievement} />
            ))}
          </div>
        </Card>
      </div>
    </AppLayout>
  );
};

export default Profile;
