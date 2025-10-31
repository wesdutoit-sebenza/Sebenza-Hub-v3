import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, Users, Target, FileText, Shield, Calendar, Edit } from "lucide-react";
import { Loader2 } from "lucide-react";

interface TestSection {
  id: string;
  title: string;
  description: string | null;
  itemCount: number;
  weight: number;
  cutScore: number;
  items: TestItem[];
}

interface TestItem {
  id: string;
  type: 'mcq' | 'sjt' | 'likert' | 'work_sample';
  question: string;
  points: number;
  options: any;
  correctAnswer: any;
}

interface TestDetails {
  id: string;
  referenceNumber: string;
  title: string;
  jobTitle: string;
  jobFamily: string | null;
  industry: string | null;
  seniority: string | null;
  status: 'draft' | 'active' | 'archived';
  durationMinutes: number;
  languages: string[];
  weights: any;
  cutScores: any;
  antiCheatConfig: any;
  candidateNotice: string | null;
  totalAttempts: number;
  averageScore: number | null;
  createdAt: string;
  sections: TestSection[];
}

export default function TestDetails() {
  const { id } = useParams();
  const [, setLocation] = useLocation();

  const { data, isLoading } = useQuery<{ success: boolean; test: TestDetails }>({
    queryKey: ['/api/competency-tests', id],
  });

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data?.test) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground">Test not found</p>
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setLocation('/dashboard/recruiter/tests')}
              data-testid="button-back-to-tests"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Tests
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const test = data.test;

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setLocation('/dashboard/recruiter/tests')}
          className="mb-4"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Tests
        </Button>

        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="font-mono">
                {test.referenceNumber}
              </Badge>
              <Badge 
                variant={
                  test.status === 'active' ? 'default' : 
                  test.status === 'draft' ? 'secondary' : 
                  'outline'
                }
              >
                {test.status}
              </Badge>
            </div>
            <h1 className="text-3xl font-bold mb-2" data-testid="heading-test-title">{test.title}</h1>
            <p className="text-muted-foreground">{test.jobTitle}</p>
          </div>
          <Button variant="outline" data-testid="button-edit-test">
            <Edit className="w-4 h-4 mr-2" />
            Edit Test
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Duration</CardTitle>
            <Clock className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{test.durationMinutes} min</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Attempts</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{test.totalAttempts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <Target className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {test.averageScore !== null ? `${test.averageScore}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Test Configuration</CardTitle>
            <CardDescription>Basic settings and metadata</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {test.jobFamily && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Job Family</div>
                <div className="mt-1">{test.jobFamily}</div>
              </div>
            )}
            {test.industry && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Industry</div>
                <div className="mt-1">{test.industry}</div>
              </div>
            )}
            {test.seniority && (
              <div>
                <div className="text-sm font-medium text-muted-foreground">Seniority Level</div>
                <div className="mt-1 capitalize">{test.seniority}</div>
              </div>
            )}
            <div>
              <div className="text-sm font-medium text-muted-foreground">Languages</div>
              <div className="mt-1">{test.languages.join(', ')}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">Created</div>
              <div className="mt-1">{new Date(test.createdAt).toLocaleString()}</div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Anti-Cheat Configuration
            </CardTitle>
            <CardDescription>Security and compliance measures</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm">Question Shuffle</span>
              <Badge variant={test.antiCheatConfig.shuffle ? 'default' : 'outline'}>
                {test.antiCheatConfig.shuffle ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Fullscreen Monitor</span>
              <Badge variant={test.antiCheatConfig.fullscreenMonitor ? 'default' : 'outline'}>
                {test.antiCheatConfig.fullscreenMonitor ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">IP Logging</span>
              <Badge variant={test.antiCheatConfig.ipLogging ? 'default' : 'outline'}>
                {test.antiCheatConfig.ipLogging ? 'Enabled' : 'Disabled'}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Webcam Monitoring</span>
              <Badge variant="outline">
                {test.antiCheatConfig.webcam || 'Not configured'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Test Sections ({test.sections.length})
          </CardTitle>
          <CardDescription>
            Questions organized by skill area
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {test.sections.map((section, index) => (
            <div key={section.id}>
              {index > 0 && <Separator className="my-4" />}
              <div>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium text-lg" data-testid={`section-title-${index}`}>
                      {section.title}
                    </h3>
                    {section.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.description}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Badge variant="outline">
                      {section.itemCount} questions
                    </Badge>
                    <Badge variant="outline">
                      Weight: {(section.weight * 100).toFixed(0)}%
                    </Badge>
                  </div>
                </div>
                
                <div className="mt-3 space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div 
                      key={item.id} 
                      className="p-3 bg-muted/50 rounded-md"
                      data-testid={`question-${index}-${itemIndex}`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {item.type && (
                              <Badge variant="secondary" className="text-xs">
                                {item.type.toUpperCase()}
                              </Badge>
                            )}
                            <span className="text-xs text-muted-foreground">
                              {item.points} points
                            </span>
                          </div>
                          <p className="text-sm">{item.question}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
