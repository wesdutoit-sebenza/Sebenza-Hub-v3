import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Briefcase, MapPin, Clock, Search } from "lucide-react";

export default function IndividualJobSearches() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-jobs-title">
            Job Searches
          </h1>
          <p className="text-muted-foreground">Track your job search activity and applications</p>
        </div>
      </div>

      <Card>
        <CardContent className="p-12 text-center">
          <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2" data-testid="text-no-searches">No Job Searches Yet</h3>
          <p className="text-muted-foreground mb-4">
            Your job search history and applications will appear here
          </p>
          <p className="text-sm text-muted-foreground">
            This feature is coming soon. You'll be able to see all the jobs you've searched for and applied to.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
