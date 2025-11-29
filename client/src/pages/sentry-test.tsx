import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { captureError } from "@/lib/sentry";

export default function SentryTest() {
  const triggerFrontendError = () => {
    throw new Error("Sebenza Hub Sentry test error (frontend)");
  };

  const triggerCapturedError = () => {
    try {
      throw new Error("Sebenza Hub captured error test");
    } catch (error) {
      captureError(error as Error, { test: true, source: "sentry-test-page" });
      alert("Error captured and sent to Sentry!");
    }
  };

  const triggerBackendError = async () => {
    try {
      const response = await fetch("/api/sentry-test");
      const data = await response.json();
      console.log(data);
    } catch (error) {
      alert("Backend error triggered - check Sentry!");
    }
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <Card className="max-w-md mx-auto">
        <CardHeader>
          <CardTitle>Sentry Test Page</CardTitle>
          <CardDescription>
            Use these buttons to verify Sentry error tracking is working.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button
            onClick={triggerFrontendError}
            variant="destructive"
            className="w-full"
            data-testid="button-trigger-frontend-error"
          >
            Trigger Frontend Error
          </Button>
          
          <Button
            onClick={triggerCapturedError}
            variant="outline"
            className="w-full"
            data-testid="button-trigger-captured-error"
          >
            Trigger Captured Error
          </Button>
          
          <Button
            onClick={triggerBackendError}
            variant="secondary"
            className="w-full"
            data-testid="button-trigger-backend-error"
          >
            Trigger Backend Error
          </Button>
          
          <p className="text-sm text-muted-foreground text-center pt-4">
            After clicking, check your Sentry dashboard for the errors.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
