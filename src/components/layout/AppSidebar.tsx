import * as React from "react";
import { useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Target,
  FlaskConical,
  BookOpen,
  Users,
  MessageSquare,
  Calendar,
  Settings,
  Trophy,
} from "lucide-react";
import kiboLogo from "@/assets/kibo-logo.png";
import { NavLink } from "@/components/NavLink";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

const mainNavItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Applications", url: "/applications", icon: Target },
  { title: "Code Lab", url: "/arena", icon: FlaskConical },
  { title: "Assessments", url: "/assessments", icon: BookOpen },
  { title: "Contests", url: "/contests", icon: Trophy },
  { title: "Schedule", url: "/schedule", icon: Calendar },
];

const socialNavItems = [
  { title: "Network", url: "/network", icon: Users },
  { title: "Messages", url: "/messages", icon: MessageSquare },
];

const bottomNavItems = [
  {
    title: "Achievements",
    url: "/achievements",
    icon: Trophy,
  },
  {
    title: "Settings",
    url: "/settings",
    icon: Settings,
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const collapsed = state === "collapsed";

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar
      className={cn(
        "border-r border-border/50 bg-background/80 backdrop-blur-xl transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]",
        collapsed ? "w-0 opacity-0" : "w-60"
      )}
      collapsible="offcanvas"
    >
      {/* Logo Header */}
      <SidebarHeader className="border-b border-white/20 p-4">
        <motion.div 
          className="flex items-center gap-3"
          initial={false}
          animate={{ justifyContent: collapsed ? "center" : "flex-start" }}
        >
          <img 
            src={kiboLogo} 
            alt="Kibo" 
            className="h-9 w-9 rounded-xl shadow-md shadow-primary/15 object-cover"
          />
          {!collapsed && (
            <motion.span 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-xl font-black tracking-tight bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent"
            >
              kibo
            </motion.span>
          )}
        </motion.div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-4">
        {/* Main Navigation */}
        <SidebarGroup>
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Main
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-white/60 hover:text-foreground",
                        isActive(item.url) && "bg-white/60 text-foreground font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0 stroke-[1.5]" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Social Navigation */}
        <SidebarGroup className="mt-6">
          {!collapsed && (
            <SidebarGroupLabel className="px-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Social
            </SidebarGroupLabel>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {socialNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.url)}
                    tooltip={collapsed ? item.title : undefined}
                  >
                    <NavLink
                      to={item.url}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-white/60 hover:text-foreground",
                        isActive(item.url) && "bg-white/60 text-foreground font-medium"
                      )}
                    >
                      <item.icon className="h-4 w-4 shrink-0 stroke-[1.5]" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* Footer Navigation */}
      <SidebarFooter className="mt-auto border-t border-white/20 p-2">
        <SidebarMenu>
          {bottomNavItems.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                isActive={isActive(item.url)}
                tooltip={collapsed ? item.title : undefined}
              >
                <NavLink
                  to={item.url}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:bg-white/60 hover:text-foreground",
                    isActive(item.url) && "bg-white/60 text-foreground font-medium"
                  )}
                >
                  <item.icon className="h-4 w-4 shrink-0 stroke-[1.5]" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
