import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function OnboardingRecruiter() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle data-testid="text-onboarding-recruiter-title">Recruiter Onboarding</CardTitle>
          <CardDescription data-testid="text-onboarding-recruiter-description">
            This feature is coming soon
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            The recruiter/agency onboarding flow is currently under development. This will allow you to:
          </p>
          <ul className="list-disc list-inside space-y-2 text-muted-foreground">
            <li>Create your agency profile</li>
            <li>Get verified as a recruitment professional</li>
            <li>Post roles for your clients</li>
            <li>Manage multiple client organizations</li>
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
