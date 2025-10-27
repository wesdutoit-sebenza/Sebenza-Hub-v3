import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { type Job, type JobApplication } from "@shared/schema";
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Briefcase,
  Building2,
  Clock,
  MessageCircle,
  Share2,
  CheckCircle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";

export default function JobDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();

  const { data: jobData, isLoading, error } = useQuery<{
    success: boolean;
    job: Job;
  }>({
    queryKey: [`/api/jobs/${id}`],
    enabled: !!id,
    queryFn: async () => {
      const response = await fetch(`/api/jobs/${id}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch job: ${response.statusText}`);
      }
      return response.json();
    },
  });

  const job = jobData?.job;

  // Check if user has already applied to this job
  const { data: applicationsData } = useQuery<{
    success: boolean;
    applications: JobApplication[];
  }>({
    queryKey: ["/api/applications"],
    enabled: !!user,
  });

  const existingApplication = applicationsData?.applications?.find(
    (app) => app.jobId === job?.id
  );

  // Mutation to track application
  const trackApplicationMutation = useMutation({
    mutationFn: async (data: { jobId: string }) => {
      return apiRequest("POST", "/api/applications", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/applications"] });
      toast({
        title: "Application tracked!",
        description: "Your application has been saved to your dashboard.",
      });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to track application. Please try again.",
      });
    },
  });

  const handleApplyViaWhatsApp = () => {
    if (!job?.whatsappContact) return;

    const message = encodeURIComponent(
      `Hi! I'm interested in applying for the ${job.title} position at ${job.company}. I'd like to learn more about this opportunity.`
    );

    const whatsappNumber = job.whatsappContact.replace(/[^\d+]/g, "");
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;

    window.open(whatsappUrl, "_blank");

    // Track application if user is logged in and hasn't applied yet
    if (user && job.id && !existingApplication) {
      trackApplicationMutation.mutate({ jobId: job.id });
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job?.title} at ${job?.company}`,
          text: `Check out this job opportunity: ${job?.title}`,
          url: url,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          copyToClipboard(url);
        }
      }
    } else {
      copyToClipboard(url);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Link copied!",
      description: "Job link has been copied to your clipboard.",
    });
  };

  const formatSalary = (min?: number | null, max?: number | null) => {
    if (!min && !max) return "Salary not specified";
    if (min && max) return `R${min.toLocaleString()} - R${max.toLocaleString()}`;
    if (min) return `From R${min.toLocaleString()}`;
    if (max) return `Up to R${max.toLocaleString()}`;
    return "Salary not specified";
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Skeleton className="h-10 w-32 mb-8" />
          <Card>
            <CardHeader className="space-y-4">
              <Skeleton className="h-8 w-3/4" />
              <Skeleton className="h-6 w-1/2" />
              <div className="flex flex-wrap gap-2">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-6 w-28" />
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-12 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-charcoal py-12">
        <div className="container max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/individuals/job-searches")}
            className="mb-8"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-semibold mb-4 text-white-brand">
              Job Not Found
            </h2>
            <p className="text-slate mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => setLocation("/individuals/job-searches")}
              data-testid="button-browse-jobs"
            >
              Browse Available Jobs
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-charcoal py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <Button
          variant="ghost"
          onClick={() => setLocation("/individuals/job-searches")}
          className="mb-8"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        <Card>
          <CardHeader className="space-y-6">
            <div className="flex flex-col gap-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1
                    className="text-3xl font-serif font-semibold text-white-brand mb-2"
                    data-testid="text-job-title"
                  >
                    {job.title}
                  </h1>
                  <div className="flex items-center gap-2 text-slate mb-4">
                    <Building2 className="h-4 w-4" />
                    <span className="text-lg" data-testid="text-company-name">
                      {job.company}
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleShare}
                  className="shrink-0"
                  data-testid="button-share"
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-3">
                {job.location && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                    data-testid="badge-location"
                  >
                    <MapPin className="h-3 w-3" />
                    {job.location}
                  </Badge>
                )}
                {(job.salaryMin || job.salaryMax) && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                    data-testid="badge-salary"
                  >
                    <DollarSign className="h-3 w-3" />
                    {formatSalary(job.salaryMin, job.salaryMax)}
                  </Badge>
                )}
                {job.employmentType && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                    data-testid="badge-employment-type"
                  >
                    <Clock className="h-3 w-3" />
                    {job.employmentType}
                  </Badge>
                )}
                {job.industry && (
                  <Badge
                    variant="secondary"
                    className="flex items-center gap-1"
                    data-testid="badge-industry"
                  >
                    <Briefcase className="h-3 w-3" />
                    {job.industry}
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-8">
            {job.description && (
              <div>
                <h2
                  className="text-xl font-semibold mb-3 text-white-brand"
                  data-testid="text-description-heading"
                >
                  About the Role
                </h2>
                <p
                  className="text-slate whitespace-pre-wrap"
                  data-testid="text-job-description"
                >
                  {job.description}
                </p>
              </div>
            )}

            {job.requirements && (
              <div>
                <h2
                  className="text-xl font-semibold mb-3 text-white-brand"
                  data-testid="text-requirements-heading"
                >
                  Requirements
                </h2>
                <p
                  className="text-slate whitespace-pre-wrap"
                  data-testid="text-job-requirements"
                >
                  {job.requirements}
                </p>
              </div>
            )}

            <div className="pt-6 border-t border-border">
              {existingApplication && (
                <div className="mb-4 p-4 bg-accent/50 rounded-lg border border-accent flex items-center gap-3">
                  <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                  <div className="flex-1">
                    <p className="font-medium text-white-brand" data-testid="text-application-status">
                      You've applied to this position
                    </p>
                    <p className="text-sm text-slate">
                      Applied on {new Date(existingApplication.appliedAt).toLocaleDateString("en-ZA")} • Status: {existingApplication.status}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  size="lg"
                  className="bg-amber-gradient text-charcoal hover:opacity-90 flex-1"
                  onClick={handleApplyViaWhatsApp}
                  disabled={!job.whatsappContact}
                  data-testid="button-apply-whatsapp"
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  {existingApplication ? "Apply Again via WhatsApp" : "Apply via WhatsApp"}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShare}
                  data-testid="button-share-job"
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Job
                </Button>
              </div>
              {!job.whatsappContact && (
                <p className="text-sm text-slate mt-3 text-center">
                  Contact information not available for this position
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
