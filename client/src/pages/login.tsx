import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Mail, CheckCircle } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const sendMagicLinkMutation = useMutation({
    mutationFn: async (email: string) => {
      return apiRequest('/auth/magic/start', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
    },
    onSuccess: () => {
      setEmailSent(true);
      toast({
        title: "Check your email",
        description: "We sent you a magic link to sign in!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to send magic link. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    sendMagicLinkMutation.mutate(email);
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <CardTitle data-testid="text-email-sent-title">Check your email</CardTitle>
            <CardDescription data-testid="text-email-sent-description">
              We sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              Click the link in the email to sign in. The link will expire in 10 minutes.
            </p>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setEmailSent(false)}
              data-testid="button-try-different-email"
            >
              Try a different email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <CardTitle data-testid="text-login-title">Sign in to HireMove</CardTitle>
          <CardDescription data-testid="text-login-description">
            Enter your email to receive a magic link
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                data-testid="input-email"
                disabled={sendMagicLinkMutation.isPending}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={sendMagicLinkMutation.isPending}
              data-testid="button-send-magic-link"
            >
              {sendMagicLinkMutation.isPending ? (
                "Sending..."
              ) : (
                <>
                  <Mail className="mr-2 h-4 w-4" />
                  Send magic link
                </>
              )}
            </Button>
          </form>
          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p>No password required. We'll email you a secure link.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
