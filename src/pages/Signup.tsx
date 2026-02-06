import * as React from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, ArrowRight, Mail, Lock, User, Github, Chrome, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import kiboLogo from "@/assets/kibo-logo.png";

const benefits = [
  "Track unlimited job applications",
  "500+ coding problems with solutions",
  "GitHub-style progress heatmap",
  "Connect with 10K+ engineers",
];

const Signup = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = React.useState(false);
  const [name, setName] = React.useState("");
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

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          full_name: name,
        },
      },
    });

    setIsLoading(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Account created. Welcome to Kibo.");
    navigate("/dashboard");
  };

  const handleOAuthSignup = async (provider: "google" | "github") => {
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

  // Password strength indicator
  const getPasswordStrength = (pass: string) => {
    if (pass.length === 0) return { width: "0%", color: "bg-muted", label: "" };
    if (pass.length < 6) return { width: "25%", color: "bg-destructive", label: "Weak" };
    if (pass.length < 10) return { width: "50%", color: "bg-warning", label: "Fair" };
    if (pass.length < 14) return { width: "75%", color: "bg-success/70", label: "Good" };
    return { width: "100%", color: "bg-success", label: "Strong" };
  };

  const strength = getPasswordStrength(password);

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
          x: [0, 80, 0],
          y: [0, -40, 0],
        }}
        transition={{ repeat: Infinity, duration: 18, ease: "easeInOut" }}
        className="absolute top-40 right-20 w-72 h-72 rounded-full bg-primary/5 blur-3xl"
      />
      <motion.div
        animate={{ 
          x: [0, -60, 0],
          y: [0, 40, 0],
        }}
        transition={{ repeat: Infinity, duration: 22, ease: "easeInOut" }}
        className="absolute bottom-40 left-20 w-96 h-96 rounded-full bg-success/5 blur-3xl"
      />

      <div className="container relative z-10 mx-auto flex min-h-screen items-center justify-center px-4 py-12">
        <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-2 lg:gap-12">
          
          {/* Left side - Signup form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center order-2 lg:order-1"
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
                  <h2 className="text-2xl font-bold text-foreground">Create account</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Start your journey to landing your dream role
                  </p>
                </div>

                {/* Social login */}
                <div className="mb-6 grid grid-cols-2 gap-3">
                  <Button 
                    variant="outline" 
                    className="h-11"
                    onClick={() => handleOAuthSignup("google")}
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
                    onClick={() => handleOAuthSignup("github")}
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
                <form onSubmit={handleEmailSignup} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="name">
                      Full name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="Your name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 pl-10 bg-white/60 border-white/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="email">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-11 pl-10 bg-white/60 border-white/20"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-foreground" htmlFor="password">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground stroke-[1.5]" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a strong password"
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
                    {/* Password strength bar */}
                    {password.length > 0 && (
                      <div className="space-y-1">
                        <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: strength.width }}
                            className={cn("h-full rounded-full transition-colors", strength.color)}
                          />
                        </div>
                        <p className="text-xs text-muted-foreground">{strength.label}</p>
                      </div>
                    )}
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
                        Create account
                        <ArrowRight className="h-4 w-4 stroke-[1.5]" />
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-center text-muted-foreground">
                    By signing up, you agree to our{" "}
                    <Link to="/terms" className="text-primary hover:underline">Terms</Link>
                    {" "}and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
                  </p>
                </form>

                {/* Sign in link */}
                <p className="mt-6 text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <Link 
                    to="/login" 
                    className="font-medium text-primary hover:text-primary/80 transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </motion.div>

          {/* Right side - Branding */}
          <motion.div 
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="hidden lg:flex flex-col justify-center order-1 lg:order-2"
          >
            {/* Logo */}
            <Link to="/" className="mb-8 inline-flex items-center gap-2">
              <img src={kiboLogo} alt="Kibo" className="h-10 w-10 rounded-lg" />
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                kibo
              </span>
            </Link>

            <h1 className="mb-4 text-4xl font-bold tracking-tight text-foreground">
              Your career<br />
              <span className="text-primary">launchpad.</span>
            </h1>
            <p className="mb-8 text-lg text-muted-foreground max-w-md">
              Join thousands of engineers who've transformed their job search into a strategic mission.
            </p>

            {/* Benefits list */}
            <ul className="space-y-3">
              {benefits.map((benefit, i) => (
                <motion.li
                  key={benefit}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 text-muted-foreground"
                >
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                    <Check className="h-3 w-3 text-success stroke-[2]" />
                  </div>
                  {benefit}
                </motion.li>
              ))}
            </ul>

            {/* Testimonial */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="mt-12 rounded-xl bg-white/40 backdrop-blur-sm border border-white/20 p-4"
            >
              <p className="text-sm text-muted-foreground italic">
                "Kibo helped me land my dream role at Google. The structured approach changed everything."
              </p>
              <div className="mt-3 flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-xs font-medium text-primary">SK</span>
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Sarah K.</p>
                  <p className="text-xs text-muted-foreground">SWE at Google</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Signup;
