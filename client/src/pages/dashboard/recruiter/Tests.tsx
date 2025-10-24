import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function RecruiterTests() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Competency Tests</h1>
          <p className="text-muted-foreground mt-2">
            Create and manage assessments for candidates
          </p>
        </div>
        <Button data-testid="button-create-test">
          <Plus className="w-4 h-4 mr-2" />
          Create Test
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Competency Tests</CardTitle>
          <CardDescription>
            Design tests to evaluate candidate skills and knowledge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Competency testing feature coming soon.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
