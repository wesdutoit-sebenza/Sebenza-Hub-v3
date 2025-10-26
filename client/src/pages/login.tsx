import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { SiGoogle, SiGithub } from "react-icons/si";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const endpoint = isSignup ? "/api/auth/signup" : "/api/auth/login";
      const body = isSignup
        ? formData
        : { email: formData.email, password: formData.password };

      const response = await apiRequest("POST", endpoint, body);
      const data = await response.json();
      
      // The signup/login endpoint sets the session cookie
      // Remove any stale query data and reset error state
      queryClient.removeQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "Success!",
        description: isSignup ? "Account created successfully" : "Logged in successfully",
      });
      
      // Wait longer to ensure browser has processed the session cookie
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Verify the session is working before redirecting
      try {
        const verifyResponse = await fetch('/api/auth/user', {
          credentials: 'include',
        });
        
        if (verifyResponse.ok) {
          // Session is working, safe to redirect
          setLocation("/onboarding");
        } else {
          // Session not working yet, wait a bit more and try again
          await new Promise(resolve => setTimeout(resolve, 500));
          const retryResponse = await fetch('/api/auth/user', {
            credentials: 'include',
          });
          
          if (retryResponse.ok) {
            setLocation("/onboarding");
          } else {
            throw new Error("Session verification failed");
          }
        }
      } catch (verifyError) {
        console.error("Session verification error:", verifyError);
        // Try redirecting anyway - onboarding page will handle auth check
        setLocation("/onboarding");
      }
    } catch (error: any) {
      console.error("Auth error:", error);
      
      // Try to extract a meaningful error message
      let errorMessage = "Something went wrong. Please try again.";
      if (error?.message) {
        // Extract just the error message without status codes
        const match = error.message.match(/\d+:\s*(.+)/);
        if (match) {
          try {
            const parsed = JSON.parse(match[1]);
            errorMessage = parsed.message || parsed.error || errorMessage;
          } catch {
            errorMessage = match[1] || errorMessage;
          }
        }
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = (provider: "google" | "github") => {
    window.location.href = `/api/auth/${provider}`;
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center" data-testid="text-auth-title">
            {isSignup ? "Create an account" : "Welcome back"}
          </CardTitle>
          <CardDescription className="text-center" data-testid="text-auth-description">
            {isSignup
              ? "Sign up to get started with Sebenza Hub"
              : "Sign in to your account"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignup && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={handleChange}
                    data-testid="input-firstname"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={handleChange}
                    data-testid="input-lastname"
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                data-testid="input-email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                data-testid="input-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-amber-gradient text-charcoal"
              disabled={isLoading}
              data-testid="button-submit"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isSignup ? "Creating account..." : "Signing in..."}
                </>
              ) : (
                <>{isSignup ? "Sign up" : "Sign in"}</>
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">
                Or continue with
              </span>
            </div>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            Social login (Google, GitHub) available when OAuth credentials are configured
          </div>

          <div className="text-center text-sm">
            {isSignup ? (
              <p>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(false)}
                  className="text-amber hover:underline"
                  data-testid="button-switch-login"
                >
                  Sign in
                </button>
              </p>
            ) : (
              <p>
                Don't have an account?{" "}
                <button
                  type="button"
                  onClick={() => setIsSignup(true)}
                  className="text-amber hover:underline"
                  data-testid="button-switch-signup"
                >
                  Sign up
                </button>
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
