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
  LayoutDashboard,
  Users,
  Briefcase,
  Building2,
  User,
  FileText,
  AlertTriangle,
  Target,
} from "lucide-react";

const menuItems = [
  {
    title: "Overview",
    url: "/admin/overview",
    icon: LayoutDashboard,
  },
  {
    title: "Recruiters",
    url: "/admin/recruiters",
    icon: Briefcase,
  },
  {
    title: "Businesses",
    url: "/admin/businesses",
    icon: Building2,
  },
  {
    title: "Individuals",
    url: "/admin/individuals",
    icon: User,
  },
  {
    title: "Candidates",
    url: "/admin/candidates",
    icon: Users,
  },
  {
    title: "Roles & Screening",
    url: "/admin/roles",
    icon: Target,
  },
  {
    title: "CV Ingestion",
    url: "/admin/cvs",
    icon: FileText,
  },
  {
    title: "Fraud Detection",
    url: "/admin/fraud",
    icon: AlertTriangle,
  },
];

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();

  const style = {
    "--sidebar-width": "16rem",
  };

  return (
    <SidebarProvider style={style as React.CSSProperties}>
      <div className="flex h-screen w-full">
        <Sidebar data-testid="admin-sidebar">
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel className="text-lg font-semibold">
                Admin Dashboard
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
        
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
}
