import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RecruiterScheduling() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Interview Scheduling</h1>
          <p className="text-muted-foreground mt-2">
            Schedule and manage candidate interviews
          </p>
        </div>
        <Button data-testid="button-schedule-interview">
          <Plus className="w-4 h-4 mr-2" />
          Schedule Interview
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Upcoming Interviews</CardTitle>
          <CardDescription>
            View and manage all scheduled interviews
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Interview scheduling feature coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
