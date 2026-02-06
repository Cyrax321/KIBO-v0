import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Applications from "./pages/Applications";
import Arena from "./pages/Arena";
import Playground from "./pages/Playground";
import Assessments from "./pages/Assessments";
import Contests from "./pages/Contests";
import Schedule from "./pages/Schedule";
import Network from "./pages/Network";
import Messages from "./pages/Messages";
import Profile from "./pages/Profile";
import Achievements from "./pages/Achievements";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/arena" element={<Arena />} />
          <Route path="/playground" element={<Playground />} />
          <Route path="/assessments" element={<Assessments />} />
          <Route path="/contests" element={<Contests />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/network" element={<Network />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/profile/:userId" element={<Profile />} />
          <Route path="/achievements" element={<Achievements />} />
          <Route path="/settings" element={<Settings />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
