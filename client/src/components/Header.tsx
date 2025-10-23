import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Menu, X, User as UserIcon, LogOut, Database, Sparkles, Briefcase, Settings } from "lucide-react";
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
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
      <a
        href="#main-content"
        data-testid="link-skip-to-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-lg"
      >
        Skip to content
      </a>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          <Link href="/" data-testid="link-home" className="font-serif font-semibold text-xl hover-elevate px-2 py-1 rounded-md">
            Sebenza Hub
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link 
                key={link.path} 
                href={link.path}
                data-testid={`link-nav-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors hover-elevate ${
                  isActive(link.path)
                    ? "text-primary border-b-2 border-primary"
                    : "text-muted-foreground"
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
                  <Button variant="ghost" className="gap-2" data-testid="button-user-menu">
                    <UserIcon size={16} />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel data-testid="text-user-email">
                    {user.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
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
                    onClick={() => setLocation('/settings/recruiter')}
                    className="gap-2 cursor-pointer"
                    data-testid="link-recruiter-settings"
                  >
                    <Settings size={16} />
                    Recruiter Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => setLocation('/settings/business')}
                    className="gap-2 cursor-pointer"
                    data-testid="link-business-settings"
                  >
                    <Settings size={16} />
                    Business Settings
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
                  onClick={() => setLocation('/login')}
                >
                  Sign In
                </Button>
                <Button 
                  data-testid="button-get-access" 
                  variant="default"
                  onClick={() => setLocation('/login')}
                >
                  Get Started
                </Button>
              </>
            )}
          </div>

          <button
            data-testid="button-mobile-menu"
            className="md:hidden p-2 hover-elevate rounded-md"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t">
            <div className="flex flex-col gap-2">
              {navLinks.map((link) => (
                <Link 
                  key={link.path} 
                  href={link.path}
                  data-testid={`link-mobile-${link.label.toLowerCase().replace(/\s+/g, '-')}`}
                  className={`block px-4 py-2 rounded-md text-sm font-medium hover-elevate ${
                    isActive(link.path)
                      ? "text-primary bg-primary/10"
                      : "text-muted-foreground"
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              {user ? (
                <>
                  <div className="mt-2 px-4 py-2 text-sm text-muted-foreground" data-testid="text-mobile-user-email">
                    {user.email}
                  </div>
                  <Button 
                    variant="ghost" 
                    className="gap-2"
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
                    className="mt-2" 
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
