import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon, LogOut, Database, Sparkles, Briefcase, Settings, Shield, LayoutDashboard } from "lucide-react";
import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { toast } = useToast();

  const { data: user } = useQuery<User>({
    queryKey: ['/api/me'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/auth/logout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.setQueryData(['/api/me'], null);
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      setLocation("/");
    },
  });

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  const isActive = (path: string) => location === path;

  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/recruiters", label: "For Recruiters" },
    { path: "/businesses", label: "For Businesses" },
    { path: "/individuals", label: "For Individuals" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-charcoal-gradient border-b border-slate">
      <a
        href="#main-content"
        data-testid="link-skip-to-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home" className="hover-elevate px-2 py-1 rounded-md">
            <h1 className="logo-sebenza font-serif font-semibold text-xl">
              Sebenza <span className="logo-hub">HUB</span>
            </h1>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                  isActive(link.path)
                    ? "text-amber border-b-2 border-amber"
                    : "text-white-brand"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 text-white-brand hover:text-amber" data-testid="button-user-menu">
                    <UserIcon size={16} />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel data-testid="text-user-email">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.roles?.includes('admin') && (
                    <>
                      <DropdownMenuItem
                        onClick={() => setLocation('/admin/overview')}
                        className="gap-2 cursor-pointer bg-amber/10 text-amber hover:bg-amber/20"
                        data-testid="link-admin"
                      >
                        <Shield size={16} />
                        Admin Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user.roles?.includes('individual') && (
                    <>
                      <DropdownMenuItem
                        onClick={() => setLocation('/dashboard/individual/profile')}
                        className="gap-2 cursor-pointer"
                        data-testid="link-individual-dashboard"
                      >
                        <LayoutDashboard size={16} />
                        My Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {user.roles?.includes('recruiter') && (
                    <>
                      <DropdownMenuItem
                        onClick={() => setLocation('/dashboard/recruiter/profile')}
                        className="gap-2 cursor-pointer"
                        data-testid="link-recruiter-dashboard"
                      >
                        <LayoutDashboard size={16} />
                        Recruiter Dashboard
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem
                    onClick={() => setLocation('/roles')}
                    className="gap-2 cursor-pointer"
                    data-testid="link-roles"
                  >
                    <Briefcase size={16} />
                    Roles & Screening
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocation('/candidates')}
                    className="gap-2 cursor-pointer"
                    data-testid="link-candidates"
                  >
                    <Database size={16} />
                    Candidate Database
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocation('/screening')}
                    className="gap-2 cursor-pointer"
                    data-testid="link-screening"
                  >
                    <Sparkles size={16} />
                    CV Screening (Legacy)
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    className="gap-2 cursor-pointer"
                    data-testid="button-logout"
                  >
                    <LogOut size={16} />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  data-testid="button-sign-in" 
                  variant="ghost"
                  className="text-white-brand hover:text-amber"
                  onClick={() => setLocation('/login')}
                >
                  Sign In
                </Button>
                <Button 
                  data-testid="button-get-access" 
                  className="bg-amber-gradient text-charcoal hover:opacity-90"
                  onClick={() => setLocation('/login')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            data-testid="button-mobile-menu"
            className="md:hidden p-2 hover-elevate rounded-md text-white-brand"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-slate">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`block px-4 py-2 rounded-md text-sm font-medium hover-elevate ${
                    isActive(link.path)
                      ? "text-amber bg-amber/10"
                      : "text-white-brand"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="mt-2 px-4 py-2 text-sm text-slate" data-testid="text-mobile-user-email">
                    {user.email}
                  </div>
                  {user.roles?.includes('admin') && (
                    <Button 
                      variant="ghost" 
                      className="gap-2 text-amber hover:text-amber/80"
                      onClick={() => {
                        setLocation('/admin/overview');
                        setMobileMenuOpen(false);
                      }}
                      data-testid="link-mobile-admin"
                    >
                      <Shield size={16} />
                      Admin Dashboard
                    </Button>
                  )}
                  {user.roles?.includes('individual') && (
                    <Button 
                      variant="ghost" 
                      className="gap-2 text-white-brand"
                      onClick={() => {
                        setLocation('/dashboard/individual/profile');
                        setMobileMenuOpen(false);
                      }}
                      data-testid="link-mobile-individual-dashboard"
                    >
                      <LayoutDashboard size={16} />
                      My Dashboard
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    className="gap-2 text-white-brand"
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    data-testid="button-mobile-logout"
                  >
                    <LogOut size={16} />
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    data-testid="button-mobile-sign-in" 
                    className="mt-2 text-white-brand" 
                    variant="ghost" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLocation('/login');
                    }}
                  >
                    Sign In
                  </Button>
                  <Button 
                    data-testid="button-mobile-access" 
                    variant="default" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setLocation('/login');
                    }}
                  >
                    Get Started
                  </Button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}
