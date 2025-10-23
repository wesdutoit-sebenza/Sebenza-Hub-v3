import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function OnboardingBusiness() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle data-testid="text-onboarding-business-title">Business Onboarding</CardTitle>
          <CardDescription data-testid="text-onboarding-business-description">
            This feature is coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The business onboarding flow is currently under development. This will allow you to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Create your company profile</li>
            <li>Post job openings</li>
            <li>Manage hiring workflows</li>
            <li>Invite team members</li>
          </ul>
          <Link href="/">
            <Button className="w-full" data-testid="button-back-home">
              Back to Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
