import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, Save, Bell } from "lucide-react";

export default function AutoJobSearch() {
  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Auto Job Search</h1>
        <p className="text-muted-foreground">
          Set your preferences once and get automatically matched with relevant jobs
        </p>
      </div>

      <div className="bg-graphite rounded-lg p-8">
        <div className="text-center mb-6">
          <Sparkles className="h-16 w-16 mx-auto mb-4 text-amber-500" />
          <h2 className="text-3xl font-bold text-white mb-2">AI-Powered Job Matching</h2>
          <p className="text-white/80">
            Configure your preferences and we'll notify you when jobs match your criteria
          </p>
        </div>

        <Card className="bg-white/95">
          <CardHeader>
            <CardTitle>Set Your Job Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Preferred Job Titles</label>
              <Input 
                placeholder="e.g., Software Developer, Project Manager" 
                data-testid="input-auto-job-titles"
              />
              <p className="text-xs text-muted-foreground">
                Enter job titles you're interested in, separated by commas
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Locations</label>
                <Select defaultValue="any">
                  <SelectTrigger data-testid="select-auto-location">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Location</SelectItem>
                    <SelectItem value="cape-town">Cape Town</SelectItem>
                    <SelectItem value="johannesburg">Johannesburg</SelectItem>
                    <SelectItem value="durban">Durban</SelectItem>
                    <SelectItem value="pretoria">Pretoria</SelectItem>
                    <SelectItem value="remote">Remote</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Preferred Industries</label>
                <Select defaultValue="any">
                  <SelectTrigger data-testid="select-auto-industry">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Industry</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="finance">Finance</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Employment Type</label>
                <Select defaultValue="any">
                  <SelectTrigger data-testid="select-auto-employment-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Type</SelectItem>
                    <SelectItem value="permanent">Permanent</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="temporary">Temporary</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Minimum Salary (Monthly)</label>
                <Input 
                  type="number" 
                  placeholder="e.g., 25000" 
                  data-testid="input-auto-min-salary"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 p-4 bg-muted rounded-lg">
              <Bell className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">Email Notifications</p>
                <p className="text-xs text-muted-foreground">
                  Get notified when new jobs match your preferences
                </p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-enable-notifications">
                Enable
              </Button>
            </div>

            <div className="flex gap-3 pt-4">
              <Button className="flex-1" data-testid="button-save-preferences">
                <Save className="h-4 w-4 mr-2" />
                Save Preferences
              </Button>
              <Button variant="outline" className="flex-1" data-testid="button-view-matches">
                View Matched Jobs
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-white/60 text-sm">
            Your preferences are saved automatically and can be updated anytime
          </p>
        </div>
      </div>
    </div>
  );
}
