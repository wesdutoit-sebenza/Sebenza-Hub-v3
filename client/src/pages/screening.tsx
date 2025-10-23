import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Upload, FileText, TrendingUp, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import type { ScreeningJob, ScreeningCandidate, ScreeningEvaluation } from "@shared/schema";

export default function Screening() {
  const { toast } = useToast();
  const [view, setView] = useState<'list' | 'create' | 'results'>('list');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Fetch screening jobs
  const { data: jobsData, isLoading: jobsLoading } = useQuery<{ success: boolean; jobs: ScreeningJob[] }>({
    queryKey: ['/api/screening/jobs'],
    enabled: view === 'list',
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-screening">CV Screening</h1>
            <p className="text-muted-foreground mt-1">AI-powered candidate evaluation</p>
          </div>
          {view === 'list' && (
            <Button
              onClick={() => setView('create')}
              data-testid="button-create-screening"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Screening Job
            </Button>
          )}
          {view !== 'list' && (
            <Button
              variant="outline"
              onClick={() => {
                setView('list');
                setSelectedJobId(null);
              }}
              data-testid="button-back"
            >
              Back to List
            </Button>
          )}
        </div>

        {view === 'list' && (
          <ScreeningJobList
            jobs={jobsData?.jobs || []}
            isLoading={jobsLoading}
            onViewResults={(jobId) => {
              setSelectedJobId(jobId);
              setView('results');
            }}
          />
        )}

        {view === 'create' && (
          <CreateScreeningJob
            onSuccess={(jobId) => {
              setSelectedJobId(jobId);
              setView('results');
            }}
          />
        )}

        {view === 'results' && selectedJobId && (
          <ScreeningResults jobId={selectedJobId} />
        )}
      </div>
    </div>
  );
}

function ScreeningJobList({ jobs, isLoading, onViewResults }: {
  jobs: ScreeningJob[];
  isLoading: boolean;
  onViewResults: (jobId: string) => void;
}) {
  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (jobs.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No screening jobs yet</h3>
          <p className="text-muted-foreground">Create your first screening job to get started</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4">
      {jobs.map((job) => (
        <Card key={job.id} className="hover-elevate active-elevate-2 cursor-pointer" onClick={() => onViewResults(job.id)}>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle data-testid={`text-job-title-${job.id}`}>{job.jobTitle}</CardTitle>
                <CardDescription className="mt-1">
                  Created {new Date(job.createdAt).toLocaleDateString()}
                </CardDescription>
              </div>
              <Badge
                variant={
                  job.status === 'completed' ? 'default' :
                  job.status === 'processing' ? 'secondary' :
                  job.status === 'failed' ? 'destructive' : 'outline'
                }
                data-testid={`badge-status-${job.id}`}
              >
                {job.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {job.mustHaveSkills.slice(0, 3).map((skill, i) => (
                <Badge key={i} variant="outline">{skill}</Badge>
              ))}
              {job.mustHaveSkills.length > 3 && (
                <Badge variant="outline">+{job.mustHaveSkills.length - 3} more</Badge>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function CreateScreeningJob({ onSuccess }: { onSuccess: (jobId: string) => void }) {
  const { toast } = useToast();
  const [jobTitle, setJobTitle] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [mustHaveSkills, setMustHaveSkills] = useState<string[]>([]);
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>([]);
  const [knockouts, setKnockouts] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [niceSkillInput, setNiceSkillInput] = useState("");
  const [knockoutInput, setKnockoutInput] = useState("");

  // Weights (must sum to 100)
  const [skillsWeight, setSkillsWeight] = useState(30);
  const [experienceWeight, setExperienceWeight] = useState(25);
  const [achievementsWeight, setAchievementsWeight] = useState(20);
  const [educationWeight, setEducationWeight] = useState(15);
  const [locationWeight, setLocationWeight] = useState(5);
  const [salaryWeight, setSalaryWeight] = useState(5);

  const createJobMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/screening/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to create job');
      return response.json();
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['/api/screening/jobs'] });
      toast({
        title: "Success",
        description: "Screening job created successfully",
      });
      onSuccess(data.job.id);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create screening job",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = () => {
    if (!jobTitle || !jobDescription) {
      toast({
        title: "Validation Error",
        description: "Job title and description are required",
        variant: "destructive",
      });
      return;
    }

    if (mustHaveSkills.length === 0) {
      toast({
        title: "Validation Error",
        description: "At least one must-have skill is required",
        variant: "destructive",
      });
      return;
    }

    const totalWeight = skillsWeight + experienceWeight + achievementsWeight + educationWeight + locationWeight + salaryWeight;
    if (Math.abs(totalWeight - 100) > 0.1) {
      toast({
        title: "Validation Error",
        description: "Weights must sum to 100%",
        variant: "destructive",
      });
      return;
    }

    createJobMutation.mutate({
      jobTitle,
      jobDescription,
      mustHaveSkills,
      niceToHaveSkills,
      knockouts,
      weights: {
        skills: skillsWeight,
        experience: experienceWeight,
        achievements: achievementsWeight,
        education: educationWeight,
        location_auth: locationWeight,
        salary_availability: salaryWeight,
      },
    });
  };

  const addSkill = () => {
    if (skillInput.trim()) {
      setMustHaveSkills([...mustHaveSkills, skillInput.trim()]);
      setSkillInput("");
    }
  };

  const addNiceSkill = () => {
    if (niceSkillInput.trim()) {
      setNiceToHaveSkills([...niceToHaveSkills, niceSkillInput.trim()]);
      setNiceSkillInput("");
    }
  };

  const addKnockout = () => {
    if (knockoutInput.trim()) {
      setKnockouts([...knockouts, knockoutInput.trim()]);
      setKnockoutInput("");
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Create Screening Job</CardTitle>
          <CardDescription>Define criteria and weights for AI-powered candidate evaluation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <Label htmlFor="jobTitle">Job Title</Label>
            <Input
              id="jobTitle"
              value={jobTitle}
              onChange={(e) => setJobTitle(e.target.value)}
              placeholder="e.g., Senior React Developer"
              data-testid="input-job-title"
            />
          </div>

          <div>
            <Label htmlFor="jobDescription">Job Description</Label>
            <Textarea
              id="jobDescription"
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Describe the role, responsibilities, and team..."
              rows={4}
              data-testid="input-job-description"
            />
          </div>

          <div>
            <Label>Must-Have Skills</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Type a skill and press Enter"
                data-testid="input-must-skill"
              />
              <Button onClick={addSkill} type="button" data-testid="button-add-must-skill">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {mustHaveSkills.map((skill, i) => (
                <Badge key={i} variant="default" className="cursor-pointer" onClick={() => setMustHaveSkills(mustHaveSkills.filter((_, idx) => idx !== i))}>
                  {skill} <XCircle className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Nice-to-Have Skills</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={niceSkillInput}
                onChange={(e) => setNiceSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNiceSkill())}
                placeholder="Type a skill and press Enter"
                data-testid="input-nice-skill"
              />
              <Button onClick={addNiceSkill} type="button" data-testid="button-add-nice-skill">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {niceToHaveSkills.map((skill, i) => (
                <Badge key={i} variant="secondary" className="cursor-pointer" onClick={() => setNiceToHaveSkills(niceToHaveSkills.filter((_, idx) => idx !== i))}>
                  {skill} <XCircle className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <Label>Knockout Criteria</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={knockoutInput}
                onChange={(e) => setKnockoutInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addKnockout())}
                placeholder="e.g., Must have work authorization"
                data-testid="input-knockout"
              />
              <Button onClick={addKnockout} type="button" data-testid="button-add-knockout">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex gap-2 flex-wrap mt-2">
              {knockouts.map((ko, i) => (
                <Badge key={i} variant="destructive" className="cursor-pointer" onClick={() => setKnockouts(knockouts.filter((_, idx) => idx !== i))}>
                  {ko} <XCircle className="w-3 h-3 ml-1" />
                </Badge>
              ))}
            </div>
          </div>

          <div className="space-y-4 pt-4 border-t">
            <h3 className="font-semibold">Scoring Weights (must sum to 100%)</h3>
            
            <div>
              <div className="flex justify-between mb-2">
                <Label>Skills Match</Label>
                <span className="text-sm font-medium">{skillsWeight}%</span>
              </div>
              <Slider value={[skillsWeight]} onValueChange={([v]) => setSkillsWeight(v)} max={100} step={5} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Experience Relevance</Label>
                <span className="text-sm font-medium">{experienceWeight}%</span>
              </div>
              <Slider value={[experienceWeight]} onValueChange={([v]) => setExperienceWeight(v)} max={100} step={5} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Achievements & Impact</Label>
                <span className="text-sm font-medium">{achievementsWeight}%</span>
              </div>
              <Slider value={[achievementsWeight]} onValueChange={([v]) => setAchievementsWeight(v)} max={100} step={5} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Education & Certifications</Label>
                <span className="text-sm font-medium">{educationWeight}%</span>
              </div>
              <Slider value={[educationWeight]} onValueChange={([v]) => setEducationWeight(v)} max={100} step={5} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Location & Authorization</Label>
                <span className="text-sm font-medium">{locationWeight}%</span>
              </div>
              <Slider value={[locationWeight]} onValueChange={([v]) => setLocationWeight(v)} max={100} step={5} />
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Salary & Availability</Label>
                <span className="text-sm font-medium">{salaryWeight}%</span>
              </div>
              <Slider value={[salaryWeight]} onValueChange={([v]) => setSalaryWeight(v)} max={100} step={5} />
            </div>

            <div className="text-sm text-muted-foreground">
              Total: <span className={Math.abs(skillsWeight + experienceWeight + achievementsWeight + educationWeight + locationWeight + salaryWeight - 100) < 0.1 ? "text-green-600" : "text-destructive font-semibold"}>
                {skillsWeight + experienceWeight + achievementsWeight + educationWeight + locationWeight + salaryWeight}%
              </span>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={createJobMutation.isPending}
            className="w-full"
            data-testid="button-create-job"
          >
            {createJobMutation.isPending ? "Creating..." : "Create Screening Job"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

function ScreeningResults({ jobId }: { jobId: string }) {
  const { toast } = useToast();
  const [cvTexts, setCvTexts] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  const { data, isLoading, refetch } = useQuery<{
    success: boolean;
    job: ScreeningJob;
    candidates: ScreeningCandidate[];
    evaluations: ScreeningEvaluation[];
  }>({
    queryKey: ['/api/screening/jobs', jobId],
  });

  const processMutation = useMutation({
    mutationFn: async (cvTexts: string[]) => {
      const response = await fetch(`/api/screening/jobs/${jobId}/process`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvTexts }),
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to process CVs');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "CVs processed successfully",
      });
      refetch();
      setCvTexts([]);
    },
    onError: (error: any) => {
      const message = error?.message?.includes("503") || error?.message?.includes("not configured")
        ? "AI screening service is temporarily unavailable. Please try again later."
        : "Failed to process CVs. Please check your files and try again.";
      
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    const texts: string[] = [];

    for (const file of Array.from(files)) {
      const text = await file.text();
      texts.push(text);
    }

    setCvTexts(texts);
    setUploading(false);
  };

  const handleProcess = () => {
    if (cvTexts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please upload at least one CV",
        variant: "destructive",
      });
      return;
    }

    processMutation.mutate(cvTexts);
  };

  if (isLoading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  if (!data) {
    return <div className="text-center py-12">Job not found</div>;
  }

  const { job, candidates, evaluations } = data;

  // Merge candidates with their evaluations
  const rankedCandidates = evaluations.map((evaluation) => {
    const candidate = candidates.find((c) => c.id === evaluation.candidateId);
    return { ...evaluation, candidate };
  });

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle data-testid="text-results-title">{job.jobTitle}</CardTitle>
          <CardDescription>{job.jobDescription}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {job.mustHaveSkills.map((skill, i) => (
              <Badge key={i} variant="default">{skill}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      {job.status === 'draft' && (
        <Card>
          <CardHeader>
            <CardTitle>Upload CVs</CardTitle>
            <CardDescription>Upload candidate CVs as text files for AI screening</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="cv-upload">Upload CV Files (.txt)</Label>
              <Input
                id="cv-upload"
                type="file"
                accept=".txt"
                multiple
                onChange={handleFileUpload}
                disabled={uploading || processMutation.isPending}
                data-testid="input-cv-upload"
                className="mt-2"
              />
              <p className="text-sm text-muted-foreground mt-2">
                {uploading ? "Loading files..." : cvTexts.length > 0 ? `${cvTexts.length} CV(s) ready` : "No files selected"}
              </p>
            </div>

            <Button
              onClick={handleProcess}
              disabled={uploading || processMutation.isPending || cvTexts.length === 0}
              className="w-full"
              data-testid="button-process-cvs"
            >
              <Upload className="w-4 h-4 mr-2" />
              {processMutation.isPending ? "Processing..." : "Process CVs with AI"}
            </Button>
          </CardContent>
        </Card>
      )}

      {job.status === 'processing' && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-muted-foreground">Processing CVs with AI...</p>
          </CardContent>
        </Card>
      )}

      {job.status === 'completed' && rankedCandidates.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Ranked Candidates ({rankedCandidates.length})</h2>
            <Button
              variant="outline"
              onClick={() => {
                const json = JSON.stringify(rankedCandidates, null, 2);
                const blob = new Blob([json], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `screening-results-${jobId}.json`;
                a.click();
              }}
              data-testid="button-export-json"
            >
              Export JSON
            </Button>
          </div>

          {rankedCandidates.map((result) => (
            <Card key={result.id} data-testid={`card-candidate-${result.rank}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">#{result.rank}</Badge>
                      <CardTitle data-testid={`text-candidate-name-${result.rank}`}>{result.candidate?.fullName || 'Unknown'}</CardTitle>
                    </div>
                    {result.candidate?.headline && (
                      <CardDescription className="mt-1">{result.candidate.headline}</CardDescription>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold" data-testid={`text-score-${result.rank}`}>{result.scoreTotal}</div>
                    <div className="text-xs text-muted-foreground">Total Score</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {(result.knockout as any)?.is_ko && (
                  <div className="bg-destructive/10 border border-destructive rounded-md p-3">
                    <div className="flex items-center gap-2 font-semibold text-destructive mb-1">
                      <XCircle className="w-4 h-4" />
                      Knockout
                    </div>
                    <ul className="text-sm space-y-1">
                      {((result.knockout as any)?.reasons || []).map((reason: string, i: number) => (
                        <li key={i}>• {reason}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                    Must-Haves Satisfied ({result.mustHavesSatisfied.length})
                  </h4>
                  <div className="flex gap-2 flex-wrap">
                    {result.mustHavesSatisfied.map((skill, i) => (
                      <Badge key={i} variant="outline" className="bg-green-50">{skill}</Badge>
                    ))}
                  </div>
                </div>

                {result.missingMustHaves.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-600" />
                      Missing Must-Haves ({result.missingMustHaves.length})
                    </h4>
                    <div className="flex gap-2 flex-wrap">
                      {result.missingMustHaves.map((skill, i) => (
                        <Badge key={i} variant="outline" className="bg-orange-50">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    AI Reasoning
                  </h4>
                  <ul className="text-sm space-y-1">
                    {result.reasons.map((reason, i) => (
                      <li key={i}>• {reason}</li>
                    ))}
                  </ul>
                </div>

                {(((result.flags as any)?.red?.length || 0) > 0 || ((result.flags as any)?.yellow?.length || 0) > 0) && (
                  <div>
                    <h4 className="font-semibold mb-2">Flags</h4>
                    {((result.flags as any)?.red?.length || 0) > 0 && (
                      <div className="mb-2">
                        <span className="text-sm font-medium text-destructive">Red Flags:</span>
                        <ul className="text-sm space-y-1 mt-1">
                          {((result.flags as any)?.red || []).map((flag: string, i: number) => (
                            <li key={i} className="text-destructive">• {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {((result.flags as any)?.yellow?.length || 0) > 0 && (
                      <div>
                        <span className="text-sm font-medium text-orange-600">Yellow Flags:</span>
                        <ul className="text-sm space-y-1 mt-1">
                          {((result.flags as any)?.yellow || []).map((flag: string, i: number) => (
                            <li key={i} className="text-orange-600">• {flag}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div>
                    <div className="text-xs text-muted-foreground">Skills</div>
                    <div className="font-semibold">{(result.scoreBreakdown as any)?.skills || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Experience</div>
                    <div className="font-semibold">{(result.scoreBreakdown as any)?.experience || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Achievements</div>
                    <div className="font-semibold">{(result.scoreBreakdown as any)?.achievements || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Education</div>
                    <div className="font-semibold">{(result.scoreBreakdown as any)?.education || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Location</div>
                    <div className="font-semibold">{(result.scoreBreakdown as any)?.location_auth || 0}/100</div>
                  </div>
                  <div>
                    <div className="text-xs text-muted-foreground">Salary</div>
                    <div className="font-semibold">{(result.scoreBreakdown as any)?.salary_availability || 0}/100</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
