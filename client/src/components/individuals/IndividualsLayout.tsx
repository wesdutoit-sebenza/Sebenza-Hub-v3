import { Link, useLocation } from "wouter";
import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  User,
  FileText,
  Briefcase,
  ClipboardList,
  MessageCircle,
  CreditCard,
  Settings,
} from "lucide-react";

const menuItems = [
  {
    title: "Profile",
    url: "/dashboard/individual/profile",
    icon: User,
  },
  {
    title: "CVs",
    url: "/dashboard/individual/cvs",
    icon: FileText,
  },
  {
    title: "Job Searches",
    url: "/dashboard/individual/jobs",
    icon: Briefcase,
  },
  {
    title: "My Applications",
    url: "/dashboard/individual/applications",
    icon: ClipboardList,
  },
  {
    title: "Coaching",
    url: "/dashboard/individual/coaching",
    icon: MessageCircle,
  },
  {
    title: "Billing",
    url: "/dashboard/individual/billing",
    icon: CreditCard,
  },
  {
    title: "Settings",
    url: "/dashboard/individual/settings",
    icon: Settings,
  },
];

interface IndividualsLayoutProps {
  children: React.ReactNode;
}

export function IndividualsLayout({ children }: IndividualsLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, loading } = useAuth();

  // Development: Email verification check disabled
  // useEffect(() => {
  //   if (!loading && user && !user.emailVerified) {
  //     setLocation("/verify-email");
  //   }
  // }, [user, loading, setLocation]);

  const style = {
    "--sidebar-width": "18rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <Sidebar data-testid="individuals-sidebar">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-semibold px-4 mb-4">
                Individual's Dashboard
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {menuItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={location === item.url}>
                        <Link href={item.url} data-testid={`link-${item.title.toLowerCase().replace(/\s+/g, '-')}`}>
                          <item.icon className="w-4 h-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>
        
        <div className="flex flex-col flex-1">
          <header className="flex items-center h-16 px-4 border-b bg-background sticky top-0 z-10">
            <SidebarTrigger data-testid="button-sidebar-toggle" />
            <h1 className="ml-4 text-lg font-semibold">Individual Dashboard</h1>
          </header>
          <main className="flex-1 overflow-auto bg-background">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
