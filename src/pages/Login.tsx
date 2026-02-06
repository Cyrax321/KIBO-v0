import * as React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail, Lock, Github, Chrome } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import kiboLogo from "@/assets/kibo-logo.png";

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = React.useState<string | null>(null);

  // Check if already logged in
  React.useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        navigate("/dashboard");
      }
    };
    checkSession();
  }, [navigate]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Welcome back!");
    navigate("/dashboard");
  };

  const handleOAuthLogin = async (provider: "google" | "github") => {
    setIsOAuthLoading(provider);
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      toast.error(error.message);
      setIsOAuthLoading(null);
    }
  };

  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Animated background grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, hsl(var(--foreground)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--foreground)) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Floating orbs */}
      <motion.div
        animate={{ 
          x: [0, 100, 0],
          y: [0, -50, 0],
        }}
        transition={{ repeat: Infinity, duration: 20, ease: "easeInOut" }}
        className="absolute top-20 left-20 w-96 h-96 rounded-full bg-primary/5 blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -80, 0],
          y: [0, 60, 0],
        }}
        transition={{ repeat: Infinity, duration: 25, ease: "easeInOut" }}
        className="absolute bottom-20 right-20 w-80 h-80 rounded-full bg-success/5 blur-3xl"
      />

      <div className="container relative z-10 mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
          
          {/* Left side - Branding */}
          <motion.div 
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="hidden lg:flex flex-col justify-center"
          >
            {/* Logo */}
            <Link to="/" className="mb-8 inline-flex items-center gap-2">
              <img src={kiboLogo} alt="Kibo" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                kibo
              </span>
            </Link>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
              Welcome back,<br />
              <span className="text-primary">commander.</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground max-w-md">
              Your mission control awaits. Track applications, sharpen skills, and land your dream role.
            </p>

            {/* Feature pills */}
            <div className="flex flex-wrap gap-2">
              {["Application Tracker", "CS Arena", "Progress Analytics", "Community"].map((feature, i) => (
                <motion.span
                  key={feature}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="inline-flex items-center rounded-full bg-white/60 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  {feature}
                </motion.span>
              ))}
            </div>

            {/* Stats */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-12 flex gap-8"
            >
              {[
                { value: "10K+", label: "Engineers" },
                { value: "95%", label: "Success Rate" },
              ].map((stat) => (
                <div key={stat.label}>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right side - Login form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center justify-center"
          >
            <div className="w-full max-w-md">
              {/* Mobile logo */}
              <div className="mb-8 flex lg:hidden items-center justify-center">
                <Link to="/" className="flex items-center gap-2">
                  <img src={kiboLogo} alt="Kibo" className="h-10 w-10 rounded-lg" />
                  <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                    kibo
                  </span>
                </Link>
              </div>

              {/* Glass card */}
              <div className="rounded-2xl bg-white/40 backdrop-blur-xl border border-white/20 shadow-sm p-8">
                <div className="mb-6 text-center lg:text-left">
                  <h2 className="text-2xl font-bold text-foreground">Sign in</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Enter your credentials to access your dashboard
                  </p>
                </div>

                {/* Social login */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-11"
                    onClick={() => handleOAuthLogin("google")}
                    disabled={isOAuthLoading !== null}
                  >
                    {isOAuthLoading === "google" ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full"
                      />
                    ) : (
                      <>
                        <Chrome className="h-4 w-4 stroke-[1.5]" />
                        Google
                      </>
                    )}
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-11"
                    onClick={() => handleOAuthLogin("github")}
                    disabled={isOAuthLoading !== null}
                  >
                    {isOAuthLoading === "github" ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-4 w-4 border-2 border-muted-foreground/30 border-t-muted-foreground rounded-full"
                      />
                    ) : (
                      <>
                        <Github className="h-4 w-4 stroke-[1.5]" />
                        GitHub
                      </>
                    )}
                  </Button>
                </div>

                {/* Divider */}
                <div className="relative mb-6">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-white/60 px-2 text-muted-foreground">
                      or continue with email
                    </span>
                  </div>
                </div>

                {/* Form */}
                <form onSubmit={handleEmailLogin} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="commander@kibo.app"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 pl-10 bg-white/60 border-white/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-foreground" htmlFor="password">
                        Password
                      </label>
                      <Link 
                        to="/forgot-password" 
                        className="text-xs text-primary hover:text-primary/80 transition-colors"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-11 pl-10 pr-10 bg-white/60 border-white/20"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4 stroke-[1.5]" />
                        ) : (
                          <Eye className="h-4 w-4 stroke-[1.5]" />
                        )}
                      </button>
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full h-11" 
                    disabled={isLoading || isOAuthLoading !== null}
                  >
                    {isLoading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="h-4 w-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full"
                      />
                    ) : (
                      <>
                        Sign in
                        <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Sign up link */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  New to Kibo?{" "}
                  <Link 
                    to="/signup" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Create an account
                  </Link>
                </p>
              </div>

              {/* Trust badges */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="mt-6 flex items-center justify-center gap-4 text-xs text-muted-foreground"
              >
                <span className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  256-bit encryption
                </span>
                <span className="flex items-center gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-success" />
                  SOC 2 compliant
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Login;
