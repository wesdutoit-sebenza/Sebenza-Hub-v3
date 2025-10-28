import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { sendEmailVerification } from "firebase/auth";
import { Mail, Loader2, CheckCircle2 } from "lucide-react";

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user, loading } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  useEffect(() => {
    if (!loading && !user) {
      setLocation("/login");
    }
    
    if (user?.emailVerified) {
      setLocation("/onboarding");
    }
  }, [user, loading, setLocation]);

  const handleResendEmail = async () => {
    if (!user) return;

    setIsSending(true);
    try {
      await sendEmailVerification(user, {
        url: `${window.location.origin}/onboarding`,
        handleCodeInApp: true
      });
      
      setEmailSent(true);
      toast({
        title: "Email sent!",
        description: "Check your inbox for the verification link.",
      });
    } catch (error: any) {
      console.error("Failed to send verification email:", error);
      
      let errorMessage = "Failed to send verification email. Please try again.";
      if (error.code === "auth/too-many-requests") {
        errorMessage = "Too many requests. Please wait a few minutes before trying again.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleCheckVerification = async () => {
    if (!user) return;

    try {
      await user.reload();
      
      if (user.emailVerified) {
        toast({
          title: "Email verified!",
          description: "Redirecting you to onboarding...",
        });
        setLocation("/onboarding");
      } else {
        toast({
          title: "Not verified yet",
          description: "Please check your email and click the verification link.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Failed to check verification status:", error);
    }
  };

  const handleSkipVerification = async () => {
    // Development bypass - always go to role selection if onboarding not complete
    try {
      const response = await fetch('/api/auth/user', {
        headers: {
          'Authorization': `Bearer ${await user?.getIdToken()}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        const userRole = data.user?.role;
        const onboardingComplete = data.user?.onboardingComplete || 0;
        
        // If onboarding complete, go to dashboard
        if (onboardingComplete === 1 && userRole) {
          toast({
            title: "Skipping verification",
            description: "Redirecting to dashboard...",
          });
          setLocation(`/dashboard/${userRole}`);
        } else {
          // If onboarding not complete, always go to role selection
          toast({
            title: "Skipping verification",
            description: "Proceeding to onboarding (dev mode)...",
          });
          setLocation("/onboarding");
        }
      }
    } catch (error) {
      console.error("Failed to fetch user data:", error);
      // Fallback to onboarding page
      setLocation("/onboarding");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md" data-testid="card-verify-email">
        <CardHeader className="text-center space-y-2">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">Verify your email</CardTitle>
          <CardDescription>
            We sent a verification link to <strong>{user?.email}</strong>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-4">
            <div className="rounded-lg border bg-muted/50 p-4 space-y-2">
              <p className="text-sm text-muted-foreground">
                Click the link in the email to verify your account. The link will take you to the onboarding page where you can choose your role and get started.
              </p>
            </div>

            {emailSent && (
              <div className="flex items-center gap-2 rounded-lg border bg-green-50 dark:bg-green-950/20 p-3 text-sm text-green-900 dark:text-green-100" data-testid="message-email-sent">
                <CheckCircle2 className="h-4 w-4" />
                <span>Verification email sent! Check your inbox.</span>
              </div>
            )}

            <div className="space-y-2">
              <Button 
                onClick={handleCheckVerification}
                className="w-full"
                variant="default"
                data-testid="button-check-verification"
              >
                I've verified my email
              </Button>
              
              <Button 
                onClick={handleResendEmail}
                disabled={isSending}
                className="w-full"
                variant="outline"
                data-testid="button-resend-email"
              >
                {isSending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  "Resend verification email"
                )}
              </Button>

              {/* Development bypass - only show in development mode */}
              {import.meta.env.DEV && (
                <Button 
                  onClick={handleSkipVerification}
                  className="w-full"
                  variant="secondary"
                  data-testid="button-skip-verification"
                >
                  Skip verification (Dev Mode)
                </Button>
              )}
            </div>

            <p className="text-center text-sm text-muted-foreground">
              Didn't receive the email? Check your spam folder or try resending.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
