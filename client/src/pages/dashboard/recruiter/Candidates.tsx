import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruiterCandidates() {
  return (
    <div className="container max-w-6xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-foreground">Candidate Database</h1>
        <p className="text-muted-foreground mt-2">
          Access and manage your ATS candidate database
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Candidates</CardTitle>
          <CardDescription>
            Search, filter, and manage candidates in your database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>ATS candidate management will be integrated here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
