import { useParams, useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import type { CompleteJob } from "@/types/job";
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
  ChevronDown,
  ChevronUp,
  Calendar,
  Users,
  Award,
  FileText,
  Shield,
  TrendingUp,
  Globe,
  Phone,
  Mail,
  Linkedin,
  ExternalLink,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Car,
  Languages,
  Plane,
  Moon,
  Package,
  Target,
  Sparkles,
  Search
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { JobApplication } from "@shared/schema";
import {
  formatLocation,
  formatSalary,
  formatClosingDate,
  getDaysRemaining,
  getCompensationPerks,
  getWorkArrangementDisplay
} from "@/types/job";

export default function JobDetail() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Track which sections are open
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    core: true,
    compensation: true,
    responsibilities: true,
    skills: true,
    qualifications: true,
  });

  const { data: jobData, isLoading, error } = useQuery<{
    success: boolean;
    job: CompleteJob;
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
    const whatsapp = job?.application?.whatsappNumber || job?.whatsappContact;
    if (!whatsapp) return;

    const message = encodeURIComponent(
      `Hi! I'm interested in applying for the ${job.title} position at ${job.company}. I'd like to learn more about this opportunity.`
    );

    const whatsappNumber = whatsapp.replace(/[^\d+]/g, "");
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

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal py-12">
        <div className="container max-w-5xl mx-auto px-4">
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
        <div className="container max-w-5xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => setLocation("/dashboard/individual/jobs/manual")}
            className="mb-8 text-white"
            data-testid="button-back"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Jobs
          </Button>
          <Card className="p-12 text-center">
            <h2 className="text-2xl font-semibold mb-4">
              Job Not Found
            </h2>
            <p className="text-muted-foreground mb-6">
              The job you're looking for doesn't exist or has been removed.
            </p>
            <Button
              onClick={() => setLocation("/dashboard/individual/jobs/manual")}
              data-testid="button-browse-jobs"
            >
              Browse Available Jobs
            </Button>
          </Card>
        </div>
      </div>
    );
  }

  const daysLeft = getDaysRemaining(job.application?.closingDate || job.admin?.closingDate);
  const isUrgent = daysLeft !== null && daysLeft <= 7;
  const perks = getCompensationPerks(job);
  const workArrangement = getWorkArrangementDisplay(job);

  return (
    <div className="min-h-screen bg-charcoal py-12">
      <div className="container max-w-5xl mx-auto px-4 space-y-6">
        <Button
          variant="ghost"
          onClick={() => setLocation("/dashboard/individual/jobs/manual")}
          className="text-white"
          data-testid="button-back"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Jobs
        </Button>

        {/* Header Card */}
        <Card>
          <CardHeader className="space-y-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-3">
                  <h1
                    className="text-3xl font-bold"
                    data-testid="text-job-title"
                  >
                    {job.title}
                  </h1>
                  {job.seo?.urgent && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                  {job.admin?.status && (
                    <Badge variant="outline">{job.admin.status}</Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Building2 className="h-5 w-5 shrink-0" />
                  <span className="text-lg font-semibold" data-testid="text-company-name">
                    {job.company}
                  </span>
                  {job.companyDetails?.eeAa && (
                    <Badge variant="outline">EE/AA Employer</Badge>
                  )}
                </div>

                {job.referenceNumber && (
                  <p className="text-sm text-muted-foreground">
                    Reference: {job.referenceNumber}
                  </p>
                )}
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

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              <Badge variant="secondary" className="flex items-center gap-1.5 p-3">
                <MapPin className="h-4 w-4 shrink-0" />
                <span className="truncate">{formatLocation(job)}</span>
              </Badge>
              
              <Badge variant="secondary" className="flex items-center gap-1.5 p-3 bg-green-100 text-green-800">
                <DollarSign className="h-4 w-4 shrink-0" />
                <span className="truncate">{formatSalary(job)}</span>
              </Badge>
              
              {job.core?.seniority && (
                <Badge variant="secondary" className="flex items-center gap-1.5 p-3">
                  <TrendingUp className="h-4 w-4 shrink-0" />
                  {job.core.seniority} Level
                </Badge>
              )}
              
              {job.core?.department && (
                <Badge variant="secondary" className="flex items-center gap-1.5 p-3">
                  <Users className="h-4 w-4 shrink-0" />
                  <span className="truncate">{job.core.department}</span>
                </Badge>
              )}
              
              {workArrangement && (
                <Badge variant="secondary" className="flex items-center gap-1.5 p-3">
                  <Briefcase className="h-4 w-4 shrink-0" />
                  <span className="truncate">{workArrangement}</span>
                </Badge>
              )}
              
              {job.employmentType && (
                <Badge variant="secondary" className="flex items-center gap-1.5 p-3">
                  <Clock className="h-4 w-4 shrink-0" />
                  {job.employmentType}
                </Badge>
              )}
            </div>

            {(job.application?.closingDate || job.admin?.closingDate) && (
              <div className={`flex items-center gap-2 p-3 rounded-lg ${isUrgent ? 'bg-red-50 border border-red-200' : 'bg-muted'}`}>
                <Calendar className={`h-5 w-5 ${isUrgent ? 'text-red-600' : 'text-muted-foreground'}`} />
                <span className={`font-semibold ${isUrgent ? 'text-red-600' : ''}`}>
                  {formatClosingDate(job.application?.closingDate || job.admin?.closingDate)}
                </span>
              </div>
            )}
          </CardHeader>

          <CardContent className="space-y-4">
            {existingApplication && (
              <div className="p-4 bg-accent/50 rounded-lg border border-accent flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-green-600 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium" data-testid="text-application-status">
                    You've applied to this position
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Applied on {new Date(existingApplication.appliedAt).toLocaleDateString("en-ZA")} • Status: {existingApplication.status}
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white flex-1"
                onClick={handleApplyViaWhatsApp}
                disabled={!job.application?.whatsappNumber && !job.whatsappContact}
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
                Share
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Role Summary */}
        {job.core?.summary && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Role Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground whitespace-pre-wrap">{job.core.summary}</p>
            </CardContent>
          </Card>
        )}

        {/* Responsibilities */}
        {job.core?.responsibilities && job.core.responsibilities.length > 0 && (
          <Card>
            <Collapsible open={openSections.responsibilities} onOpenChange={() => toggleSection('responsibilities')}>
              <CardHeader className="cursor-pointer hover-elevate" onClick={() => toggleSection('responsibilities')}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-primary" />
                      Key Responsibilities ({job.core.responsibilities.length})
                    </CardTitle>
                    {openSections.responsibilities ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent>
                  <ul className="space-y-2">
                    {job.core.responsibilities.map((resp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Required Skills */}
        {job.core?.requiredSkills && job.core.requiredSkills.length > 0 && (
          <Card>
            <Collapsible open={openSections.skills} onOpenChange={() => toggleSection('skills')}>
              <CardHeader className="cursor-pointer hover-elevate" onClick={() => toggleSection('skills')}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-primary" />
                      Required Skills ({job.core.requiredSkills.length})
                    </CardTitle>
                    {openSections.skills ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {job.core.requiredSkills.map((skill, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <div className="flex items-center gap-2">
                          {skill.priority === "Must-Have" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                          ) : (
                            <CheckCircle className="h-4 w-4 text-blue-600 shrink-0" />
                          )}
                          <span className="font-medium">{skill.skill}</span>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {skill.level}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Qualifications & Experience */}
        {((job.core?.qualifications && job.core.qualifications.length > 0) || 
          (job.core?.experience && job.core.experience.length > 0) ||
          job.core?.minQualifications ||
          job.core?.yearsExperience) && (
          <Card>
            <Collapsible open={openSections.qualifications} onOpenChange={() => toggleSection('qualifications')}>
              <CardHeader className="cursor-pointer hover-elevate" onClick={() => toggleSection('qualifications')}>
                <CollapsibleTrigger className="w-full">
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5 text-primary" />
                      Qualifications & Experience
                    </CardTitle>
                    {openSections.qualifications ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </CollapsibleTrigger>
              </CardHeader>
              <CollapsibleContent>
                <CardContent className="space-y-4">
                  {job.core.minQualifications && (
                    <div>
                      <h4 className="font-semibold mb-2">Minimum Qualification</h4>
                      <p className="text-muted-foreground">{job.core.minQualifications}</p>
                    </div>
                  )}
                  
                  {job.core.yearsExperience !== undefined && (
                    <div>
                      <h4 className="font-semibold mb-2">Years of Experience Required</h4>
                      <p className="text-muted-foreground">{job.core.yearsExperience}+ years</p>
                    </div>
                  )}
                  
                  {job.core.qualifications && job.core.qualifications.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Qualifications</h4>
                      <ul className="space-y-1">
                        {job.core.qualifications.map((qual, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span>{qual}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  
                  {job.core.experience && job.core.experience.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Experience Requirements</h4>
                      <ul className="space-y-1">
                        {job.core.experience.map((exp, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        )}

        {/* Additional Requirements */}
        {(job.core?.driversLicenseRequired || job.core?.languagesRequired || job.core?.visaRequired) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Additional Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.core.driversLicenseRequired === "Yes" && (
                <div className="flex items-start gap-2">
                  <Car className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Driver's License Required</span>
                    {job.core.licenseCode && (
                      <span className="text-muted-foreground"> - Code {job.core.licenseCode}</span>
                    )}
                  </div>
                </div>
              )}
              
              {job.core.languagesRequired && job.core.languagesRequired.length > 0 && (
                <div className="flex items-start gap-2">
                  <Languages className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Languages:</span>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {job.core.languagesRequired.map((lang, idx) => (
                        <Badge key={idx} variant="outline">
                          {lang.language} ({lang.proficiency})
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              
              {job.core.visaRequired && (
                <div className="flex items-start gap-2">
                  <Globe className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5" />
                  <div>
                    <span className="font-medium">Work Visa May Be Required</span>
                    {job.core.visaNote && (
                      <p className="text-sm text-muted-foreground mt-1">{job.core.visaNote}</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Compensation & Benefits */}
        <Card>
          <Collapsible open={openSections.compensation} onOpenChange={() => toggleSection('compensation')}>
            <CardHeader className="cursor-pointer hover-elevate" onClick={() => toggleSection('compensation')}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-primary" />
                    Compensation & Benefits
                  </CardTitle>
                  {openSections.compensation ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                </div>
              </CollapsibleTrigger>
            </CardHeader>
            <CollapsibleContent>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-lg font-bold text-green-800">{formatSalary(job)}</p>
                  {job.compensation?.currency && job.compensation.currency !== "ZAR" && (
                    <p className="text-sm text-muted-foreground">Currency: {job.compensation.currency}</p>
                  )}
                </div>

                {perks.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Additional Benefits</h4>
                    <div className="flex flex-wrap gap-2">
                      {perks.map((perk, idx) => (
                        <Badge key={idx} variant="secondary" className="bg-green-100 text-green-800">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          {perk}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {job.benefits?.benefits && job.benefits.benefits.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Company Benefits</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {job.benefits.benefits.map((benefit, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Package className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {job.benefits?.equipment && job.benefits.equipment.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-2">Equipment Provided</h4>
                    <div className="flex flex-wrap gap-2">
                      {job.benefits.equipment.map((item, idx) => (
                        <Badge key={idx} variant="outline">{item}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>

        {/* Role Details */}
        {job.roleDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" />
                Role Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.roleDetails.problemStatement && (
                <div>
                  <h4 className="font-semibold mb-2">The Challenge</h4>
                  <p className="text-muted-foreground">{job.roleDetails.problemStatement}</p>
                </div>
              )}

              {job.roleDetails.successMetrics && job.roleDetails.successMetrics.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Success Metrics</h4>
                  <ul className="space-y-1">
                    {job.roleDetails.successMetrics.map((metric, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <TrendingUp className="h-4 w-4 text-green-600 shrink-0 mt-0.5" />
                        <span>{metric}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.roleDetails.toolsTech && job.roleDetails.toolsTech.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Tools & Technologies</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.roleDetails.toolsTech.map((tool, idx) => (
                      <Badge key={idx} variant="secondary">{tool}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.benefits?.teamSize !== undefined && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Team Size:</strong> {job.benefits.teamSize} people</span>
                </div>
              )}

              {job.benefits?.reportingLine && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Reports to:</strong> {job.benefits.reportingLine}</span>
                </div>
              )}

              {job.roleDetails.travel && (
                <div className="flex items-center gap-2">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Travel Required:</strong> {job.roleDetails.travel}</span>
                </div>
              )}

              {job.roleDetails.shiftPattern && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Shift Pattern:</strong> {job.roleDetails.shiftPattern}</span>
                </div>
              )}

              {job.roleDetails.coreHours && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Core Hours:</strong> {job.roleDetails.coreHours}</span>
                </div>
              )}

              {job.roleDetails.weekendWork && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Weekend Work:</strong> Required</span>
                </div>
              )}

              {job.roleDetails.onCall && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span><strong>On-Call:</strong> Required</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Contract Details */}
        {job.contract && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Contract Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.contract.startDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Start Date:</strong> {new Date(job.contract.startDate).toLocaleDateString("en-ZA")}</span>
                </div>
              )}

              {job.contract.endDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span><strong>End Date:</strong> {new Date(job.contract.endDate).toLocaleDateString("en-ZA")}</span>
                </div>
              )}

              {job.contract.renewalPossible !== undefined && (
                <div className="flex items-center gap-2">
                  {job.contract.renewalPossible ? (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-600" />
                  )}
                  <span><strong>Renewal Possible:</strong> {job.contract.renewalPossible ? "Yes" : "No"}</span>
                </div>
              )}

              {job.contract.noticePeriod && (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Notice Period:</strong> {job.contract.noticePeriod}</span>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Company Information */}
        {job.companyDetails && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5 text-primary" />
                About {job.company}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.companyDetails.description && (
                <p className="text-muted-foreground whitespace-pre-wrap">{job.companyDetails.description}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {job.companyDetails.industry && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span><strong>Industry:</strong> {job.companyDetails.industry}</span>
                  </div>
                )}

                {job.companyDetails.companySize && (
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span><strong>Company Size:</strong> {job.companyDetails.companySize} employees</span>
                  </div>
                )}

                {job.companyDetails.website && (
                  <a 
                    href={job.companyDetails.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Globe className="h-4 w-4 shrink-0" />
                    <span>Visit Website</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {job.companyDetails.linkedinUrl && (
                  <a 
                    href={job.companyDetails.linkedinUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Linkedin className="h-4 w-4 shrink-0" />
                    <span>LinkedIn Page</span>
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}

                {job.companyDetails.contactEmail && (
                  <a 
                    href={`mailto:${job.companyDetails.contactEmail}`}
                    className="flex items-center gap-2 text-primary hover:underline"
                  >
                    <Mail className="h-4 w-4 shrink-0" />
                    <span className="truncate">{job.companyDetails.contactEmail}</span>
                  </a>
                )}

                {job.companyDetails.recruitingAgency && (
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span><strong>Recruiting Agency:</strong> {job.companyDetails.recruitingAgency}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Vetting & Background Checks */}
        {job.vetting && (Object.values(job.vetting).some(v => v === true)) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                Background Checks Required
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {job.vetting.criminal && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Criminal Record Check</span>
                  </div>
                )}
                {job.vetting.credit && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Credit Check</span>
                  </div>
                )}
                {job.vetting.qualification && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Qualification Verification</span>
                  </div>
                )}
                {job.vetting.references && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
                    <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                    <span>Reference Checks</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Application Requirements */}
        {(job.attachments || job.application?.competencyTestRequired || job.compliance) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Application Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {job.attachments?.required && job.attachments.required.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Required Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.attachments.required.map((doc, idx) => (
                      <Badge key={idx} variant="destructive">{doc} *</Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.attachments?.optional && job.attachments.optional.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Optional Documents</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.attachments.optional.map((doc, idx) => (
                      <Badge key={idx} variant="outline">{doc}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.application?.competencyTestRequired === "Yes" && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-blue-900">Competency Test Required</p>
                      {job.application.competencyTestReference && (
                        <p className="text-sm text-blue-700">Reference: {job.application.competencyTestReference}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {job.compliance && (
                <div className="space-y-2">
                  {job.compliance.rightToWork && (
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                      <span><strong>Right to Work:</strong> {job.compliance.rightToWork}</span>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* SEO Keywords (for job seekers to understand key terms) */}
        {job.seo?.keywords && job.seo.keywords.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="h-5 w-5 text-primary" />
                Related Keywords
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {job.seo.keywords.map((keyword, idx) => (
                  <Badge key={idx} variant="outline">{keyword}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Admin/Meta Information */}
        {(job.admin?.owner || job.admin?.targetStartDate || job.admin?.externalJobBoards) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                Additional Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {job.admin.owner && (
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Hiring Manager:</strong> {job.admin.owner}</span>
                </div>
              )}

              {job.admin.targetStartDate && (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span><strong>Target Start Date:</strong> {new Date(job.admin.targetStartDate).toLocaleDateString("en-ZA")}</span>
                </div>
              )}

              {job.admin.externalJobBoards && Object.values(job.admin.externalJobBoards).some(v => v) && (
                <div>
                  <h4 className="font-semibold mb-2">Also Posted On:</h4>
                  <div className="flex flex-wrap gap-2">
                    {job.admin.externalJobBoards.linkedin && <Badge variant="secondary">LinkedIn</Badge>}
                    {job.admin.externalJobBoards.pnet && <Badge variant="secondary">PNet</Badge>}
                    {job.admin.externalJobBoards.careerJunction && <Badge variant="secondary">Career Junction</Badge>}
                    {job.admin.externalJobBoards.jobMail && <Badge variant="secondary">JobMail</Badge>}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Final Apply Section */}
        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <h3 className="text-2xl font-bold">Ready to Apply?</h3>
              <p className="text-muted-foreground">
                Apply now via WhatsApp and start your journey with {job.company}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  size="lg"
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={handleApplyViaWhatsApp}
                  disabled={!job.application?.whatsappNumber && !job.whatsappContact}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  Apply via WhatsApp
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share with Friends
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
