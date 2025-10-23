import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Upload, Loader2, ArrowLeft } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { Link } from "wouter";

export default function AddCandidatePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [filename, setFilename] = useState("");
  const [rawText, setRawText] = useState("");

  const parseResumeMutation = useMutation({
    mutationFn: async () => {
      if (!filename || !rawText) {
        throw new Error("Please provide both filename and resume text");
      }

      const response = await fetch("/api/ats/resumes/parse", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename,
          rawText,
          createCandidate: true,
        }),
        credentials: "include",
      });

      if (!response.ok) throw new Error("Failed to parse resume");
      return response.json();
    },
    onSuccess: (data: any) => {
      toast({
        title: "Success",
        description: "Candidate profile created successfully from resume",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/ats/candidates"] });
      setLocation(`/candidates/${data.candidate.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to parse resume",
        variant: "destructive",
      });
    },
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFilename(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setRawText(text);
    };
    reader.readAsText(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    parseResumeMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <Link href="/candidates">
            <Button variant="ghost" size="sm" className="mb-4" data-testid="button-back">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Candidates
            </Button>
          </Link>
          <h1 className="text-3xl font-bold" data-testid="heading-add-candidate">
            Add Candidate
          </h1>
          <p className="text-muted-foreground mt-1">
            Upload a resume to automatically create a candidate profile
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Card>
            <CardHeader>
              <CardTitle>Resume Upload</CardTitle>
              <CardDescription>
                Upload a resume file (.txt) to automatically extract candidate information using AI
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume-file">Resume File</Label>
                <div className="flex gap-2">
                  <Input
                    id="resume-file"
                    type="file"
                    accept=".txt"
                    onChange={handleFileUpload}
                    data-testid="input-resume-file"
                  />
                </div>
                {filename && (
                  <p className="text-sm text-muted-foreground" data-testid="text-filename">
                    Selected: {filename}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="raw-text">Resume Text (or paste here)</Label>
                <Textarea
                  id="raw-text"
                  placeholder="Paste resume text here or upload a file above..."
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  rows={15}
                  className="font-mono text-sm"
                  data-testid="textarea-resume-text"
                />
                <p className="text-sm text-muted-foreground">
                  {rawText.length > 0 ? `${rawText.length} characters` : "No text entered"}
                </p>
              </div>

              <div className="flex gap-3 justify-end pt-4">
                <Link href="/candidates">
                  <Button type="button" variant="outline" data-testid="button-cancel">
                    Cancel
                  </Button>
                </Link>
                <Button
                  type="submit"
                  disabled={!rawText || parseResumeMutation.isPending}
                  data-testid="button-parse-resume"
                >
                  {parseResumeMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Parsing Resume...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Parse & Create Candidate
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>What happens next?</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                <li>AI will parse the resume and extract structured information</li>
                <li>A candidate profile will be created automatically</li>
                <li>Work experience, education, skills, and certifications will be added</li>
                <li>You can review and edit the profile after creation</li>
              </ol>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  );
}
