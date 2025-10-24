import { Link, useLocation } from "wouter";
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
} from "@/components/ui/sidebar";
import {
  User,
  FileText,
  Briefcase,
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
  const [location] = useLocation();

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex min-h-screen w-full">
        <Sidebar data-testid="individuals-sidebar">
          <SidebarContent className="pt-20">
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-semibold px-4 mb-4">
                My Dashboard
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
        
        <main className="flex-1 overflow-auto bg-background">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
