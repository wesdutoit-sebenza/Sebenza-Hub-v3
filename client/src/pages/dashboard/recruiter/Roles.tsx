import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function RecruiterRoles() {
  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Roles & Screenings</h1>
        <p className="text-muted-foreground mt-2">
          Manage hiring roles and screen candidates
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Roles & Screenings</CardTitle>
          <CardDescription>
            Create roles, define screening criteria, and evaluate candidates
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <p>Roles and screening functionality will be integrated here.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
