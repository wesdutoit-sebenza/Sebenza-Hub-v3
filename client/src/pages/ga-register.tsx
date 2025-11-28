import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2 } from "lucide-react";
import { GA_EVENTS, registerAllEvents } from "@/lib/analytics";

export default function GARegister() {
  const [registered, setRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = () => {
    setIsLoading(true);
    registerAllEvents();
    setTimeout(() => {
      setIsLoading(false);
      setRegistered(true);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Google Analytics Event Registration
              {registered && <CheckCircle className="h-5 w-5 text-green-500" />}
            </CardTitle>
            <CardDescription>
              Click the button below to fire all events once and register them with Google Analytics.
              This only needs to be done once in production.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleRegister} 
              disabled={isLoading || registered}
              data-testid="button-register-events"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Registering Events...
                </>
              ) : registered ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Events Registered
                </>
              ) : (
                "Register All Events"
              )}
            </Button>

            {registered && (
              <p className="text-sm text-muted-foreground">
                All {GA_EVENTS.length} events have been sent to Google Analytics. 
                Check your GA dashboard under Configure → Events to see them.
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Events to Register ({GA_EVENTS.length})</CardTitle>
            <CardDescription>
              These events will be available in your Google Analytics dashboard after registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {GA_EVENTS.map((event) => (
                <Badge key={event} variant="secondary" data-testid={`badge-event-${event}`}>
                  {event}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Examples</CardTitle>
            <CardDescription>
              How to use the analytics helper in your code
            </CardDescription>
          </CardHeader>
          <CardContent>
            <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
{`import { analytics, trackEvent } from "@/lib/analytics";

// Using the structured analytics object
analytics.job.viewed({ job_id: "123", company_id: "456" });
analytics.application.started({ job_id: "123" });
analytics.signup.completed({ user_id: "789" });

// Or use the generic trackEvent function
trackEvent("custom_event", { param1: "value1" });`}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
