import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { FileText, Plus, Eye, Trash2, Calendar, Upload, FilePen } from "lucide-react";
import { type CV, type CVPersonalInfo, type CVWorkExperience } from "@shared/schema";
import CVBuilder from "@/components/CVBuilder";
import ResumeUpload from "@/components/ResumeUpload";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function IndividualCVs() {
  const { toast } = useToast();
  const [showCVBuilder, setShowCVBuilder] = useState(false);
  const [showResumeUpload, setShowResumeUpload] = useState(false);

  const { data: cvsData, isLoading } = useQuery<{ success: boolean; count: number; cvs: CV[] }>({
    queryKey: ["/api/cvs"],
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest("DELETE", `/api/cvs/${id}`, {});
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cvs"] });
      toast({
        title: "CV deleted",
        description: "Your CV has been deleted successfully.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: "Failed to delete CV. Please try again.",
      });
    },
  });

  const handleCVComplete = () => {
    setShowCVBuilder(false);
    queryClient.invalidateQueries({ queryKey: ["/api/cvs"] });
  };

  const handleResumeUploadSuccess = () => {
    setShowResumeUpload(false);
    queryClient.invalidateQueries({ queryKey: ["/api/cvs"] });
    toast({
      title: "Success!",
      description: "Your CV has been created from your resume.",
    });
  };

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold" data-testid="text-cvs-title">
              My CVs
            </h1>
            <p className="text-muted-foreground">Create and manage your CVs</p>
          </div>
        </div>
        
        {/* CV Creation Options */}
        <div className="flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto mb-8">
          <Button 
            onClick={() => setShowResumeUpload(true)} 
            className="flex-1 h-auto py-6 text-lg"
            data-testid="button-upload-resume"
          >
            <Upload className="h-5 w-5 mr-2" />
            Upload Resume (AI Powered)
          </Button>
          <Button 
            onClick={() => setShowCVBuilder(true)} 
            variant="outline"
            className="flex-1 h-auto py-6 text-lg"
            data-testid="button-build-manually"
          >
            <FilePen className="h-5 w-5 mr-2" />
            Build CV Manually
          </Button>
        </div>
        <p className="text-center text-sm text-muted-foreground max-w-2xl mx-auto">
          Upload your existing resume for instant AI-powered profile creation, or build your CV step-by-step
        </p>
      </div>

      {isLoading ? (
        <Card>
          <CardContent className="p-8">
            <p className="text-center text-muted-foreground">Loading CVs...</p>
          </CardContent>
        </Card>
      ) : cvsData && cvsData.cvs.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {cvsData.cvs.map((cv) => {
            const personalInfo = cv.personalInfo as unknown as CVPersonalInfo;
            const workExperience = cv.workExperience as unknown as CVWorkExperience[];
            
            return (
              <Card key={cv.id} data-testid={`cv-card-${cv.id}`}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      <span className="truncate">{personalInfo?.fullName || "Untitled CV"}</span>
                    </div>
                    <Badge variant="secondary" data-testid={`cv-status-${cv.id}`}>Complete</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Created {new Date(cv.createdAt).toLocaleDateString()}</span>
                  </div>

                  {personalInfo?.contactEmail && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Email</p>
                      <p className="font-medium">{personalInfo.contactEmail}</p>
                    </div>
                  )}

                  {workExperience && workExperience.length > 0 && (
                    <div className="text-sm">
                      <p className="text-muted-foreground">Experience</p>
                      <p className="font-medium">{workExperience.length} position(s)</p>
                    </div>
                  )}

                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      toast({
                        title: "CV Preview",
                        description: "CV preview functionality coming soon.",
                      });
                    }}
                    data-testid={`button-view-${cv.id}`}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid={`button-delete-${cv.id}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete CV?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your CV.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(cv.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2" data-testid="text-no-cvs">No CVs Yet</h3>
            <p className="text-muted-foreground mb-4">
              Upload your resume or build your CV manually to get started
            </p>
          </CardContent>
        </Card>
      )}

      {/* Manual CV Builder Dialog */}
      <Dialog open={showCVBuilder} onOpenChange={setShowCVBuilder}>
        <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Build CV Manually</DialogTitle>
            <DialogDescription>
              Build your professional CV step by step
            </DialogDescription>
          </DialogHeader>
          <CVBuilder onComplete={handleCVComplete} />
        </DialogContent>
      </Dialog>

      {/* AI Resume Upload Dialog */}
      <Dialog open={showResumeUpload} onOpenChange={setShowResumeUpload}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Upload Resume (AI Powered)</DialogTitle>
            <DialogDescription>
              Upload your existing resume and let AI create your CV automatically
            </DialogDescription>
          </DialogHeader>
          <ResumeUpload onSuccess={handleResumeUploadSuccess} />
        </DialogContent>
      </Dialog>
    </div>
  );
}
