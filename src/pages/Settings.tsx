import * as React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  User, Bell, Shield, Palette, LogOut, 
  ChevronRight, Moon, Sun, Volume2, VolumeX
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle, 
  AlertDialogTrigger 
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(true);
  const [settings, setSettings] = React.useState({
    emailNotifications: true,
    pushNotifications: false,
    soundEffects: true,
    darkMode: false,
  });

  React.useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate("/login");
        return;
      }
      setLoading(false);
    };
    checkAuth();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleSettingChange = (key: keyof typeof settings, value: boolean) => {
    setSettings({ ...settings, [key]: value });
    toast({ title: "Setting updated", description: "Your preferences have been saved." });
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
      <div className="p-6 lg:p-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground text-sm">
            Manage your account preferences
          </p>
        </div>

        <div className="space-y-6">
          {/* Account */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-muted-foreground" />
              Account
            </h3>
            <div className="space-y-3">
              <Button 
                variant="ghost" 
                className="w-full justify-between h-auto py-3"
                onClick={() => navigate("/profile")}
              >
                <span>Edit Profile</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-auto py-3"
                onClick={() => toast({ title: "Coming soon", description: "Password change will be available soon." })}
              >
                <span>Change Password</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </Card>

          {/* Notifications */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Bell className="h-5 w-5 text-muted-foreground" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-notif">Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  id="email-notif"
                  checked={settings.emailNotifications}
                  onCheckedChange={(v) => handleSettingChange("emailNotifications", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="push-notif">Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                </div>
                <Switch
                  id="push-notif"
                  checked={settings.pushNotifications}
                  onCheckedChange={(v) => handleSettingChange("pushNotifications", v)}
                />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5 text-muted-foreground" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.darkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  <div>
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                  </div>
                </div>
                <Switch
                  id="dark-mode"
                  checked={settings.darkMode}
                  onCheckedChange={(v) => handleSettingChange("darkMode", v)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {settings.soundEffects ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
                  <div>
                    <Label htmlFor="sound">Sound Effects</Label>
                    <p className="text-sm text-muted-foreground">Play sounds for actions</p>
                  </div>
                </div>
                <Switch
                  id="sound"
                  checked={settings.soundEffects}
                  onCheckedChange={(v) => handleSettingChange("soundEffects", v)}
                />
              </div>
            </div>
          </Card>

          {/* Privacy */}
          <Card className="p-4">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              Privacy & Security
            </h3>
            <div className="space-y-3">
              <Button 
                variant="ghost" 
                className="w-full justify-between h-auto py-3"
                onClick={() => toast({ title: "Coming soon", description: "Privacy settings will be available soon." })}
              >
                <span>Privacy Settings</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-between h-auto py-3"
                onClick={() => toast({ title: "Coming soon", description: "Data export will be available soon." })}
              >
                <span>Export Data</span>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          </Card>

          {/* Danger Zone */}
          <Card className="p-4 border-destructive/20">
            <h3 className="font-semibold mb-4 text-destructive">Danger Zone</h3>
            <div className="space-y-3">
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="w-full justify-start gap-2 text-destructive hover:text-destructive hover:bg-destructive/10">
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Sign out?</AlertDialogTitle>
                    <AlertDialogDescription>
                      You will be signed out of your account on this device.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleLogout}>Sign Out</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Settings;
