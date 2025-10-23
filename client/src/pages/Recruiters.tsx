import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Stat from "@/components/Stat";
import FAQAccordion from "@/components/FAQAccordion";
import { CheckCircle, FileText, Kanban, Download, Briefcase, MapPin, DollarSign, MessageCircle, Search } from "lucide-react";
import { type Job } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

const formSchema = z.object({
  title: z.string().min(1, "Job title is required"),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  salaryMin: z.coerce.number().positive("Minimum salary must be positive"),
  salaryMax: z.coerce.number().positive("Maximum salary must be positive"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  whatsappContact: z.string().min(1, "WhatsApp contact is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  industry: z.string().min(1, "Industry is required"),
}).refine(
  (data) => data.salaryMin <= data.salaryMax,
  {
    message: "Minimum salary must be less than or equal to maximum salary",
    path: ["salaryMax"],
  }
);

type FormData = z.infer<typeof formSchema>;

export default function Recruiters() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    document.title = "For Recruiters | Reduce noise. Faster shortlists.";
  }, []);

  const { data: jobsData, isLoading } = useQuery<{ success: boolean; count: number; jobs: Job[] }>({
    queryKey: ["/api/jobs"],
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      company: "",
      location: "",
      salaryMin: 0,
      salaryMax: 0,
      description: "",
      requirements: "",
      whatsappContact: "",
      employmentType: "",
      industry: "",
    },
  });

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await apiRequest("POST", "/api/jobs", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success!",
        description: "Job posted successfully!",
      });
      form.reset();
      setShowForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to post job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const features = [
    {
      icon: <CheckCircle className="text-amber" size={24} />,
      title: "Verify employers & ads",
      description: "All job posts verified. No more time wasted on fake listings."
    },
    {
      icon: <FileText className="text-amber" size={24} />,
      title: "Required salary ranges",
      description: "Every job includes transparent salary info. Build trust, save time."
    },
    {
      icon: <Download className="text-amber" size={24} />,
      title: "Export to Pnet/CJ/Adzuna",
      description: "One-click export to all major SA job boards. Post once, reach everywhere."
    },
    {
      icon: <Kanban className="text-amber" size={24} />,
      title: "Pipeline Kanban",
      description: "Visual pipeline with drag-and-drop. Track every candidate at a glance."
    }
  ];

  const saLocations = [
    "Johannesburg",
    "Cape Town",
    "Durban",
    "Pretoria",
    "Port Elizabeth",
    "Bloemfontein",
    "East London",
    "Polokwane",
    "Nelspruit",
    "Kimberley",
    "Remote"
  ];

  const employmentTypes = [
    "Permanent",
    "Contract",
    "Temporary",
    "Part-time",
    "Internship"
  ];

  const industries = [
    "Technology",
    "Finance",
    "Healthcare",
    "Retail",
    "Manufacturing",
    "Education",
    "Hospitality",
    "Construction",
    "Legal",
    "Marketing",
    "Other"
  ];

  const filteredJobs = jobsData?.jobs?.filter((job) => {
    if (!searchTerm) return true;
    const search = searchTerm.toLowerCase();
    return (
      job.title.toLowerCase().includes(search) ||
      job.company.toLowerCase().includes(search) ||
      job.location.toLowerCase().includes(search) ||
      job.industry.toLowerCase().includes(search)
    );
  }) || [];

  return (
    <main id="main-content">
      <PageHeader
        title="Less noise. Faster shortlists."
        description="Purpose-built tools for SA recruiters. Verify employers, require salary transparency, and export to all major job boards."
        breadcrumb="For Recruiters"
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-serif font-semibold mb-6 text-white-brand" data-testid="text-section-title">
              Everything you need to recruit smarter
            </h2>
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4" data-testid={`feature-${idx}`}>
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold mb-1 text-white-brand" data-testid="text-feature-title">{feature.title}</h3>
                    <p className="text-sm text-slate" data-testid="text-feature-description">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-8">
            <div className="aspect-video bg-gradient-to-br from-amber/10 to-transparent rounded-lg flex items-center justify-center border">
              <p className="text-slate" data-testid="text-mock-ui">[Kanban Pipeline Mock UI]</p>
            </div>
          </Card>
        </div>

        <div className="bg-card rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-serif font-semibold mb-8 text-center text-white-brand" data-testid="text-stats-title">
            Real results from SA recruiters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Stat value="↓50%" label="Time-to-shortlist" trend="down" color="amber" />
            <Stat value="↓22%" label="Cost-per-hire" trend="down" color="amber" />
          </div>
        </div>
      </Section>

      <Section className="bg-graphite" id="jobs">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
            <div>
              <h2 className="text-3xl font-serif font-semibold mb-2 text-white-brand" data-testid="text-jobs-title">
                Job Postings
              </h2>
              <p className="text-slate">
                Post jobs with mandatory salary ranges and WhatsApp contact
              </p>
            </div>
            <Button
              size="lg"
              className="bg-amber-gradient text-charcoal hover:opacity-90"
              data-testid="button-post-job"
              onClick={() => setShowForm(!showForm)}
            >
              {showForm ? "Cancel" : "Post a Job"}
            </Button>
          </div>

          {showForm && (
            <Card className="p-8 mb-8">
              <h3 className="text-xl font-semibold mb-6 text-white-brand" data-testid="text-form-title">Create Job Posting</h3>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Job Title *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. Senior Software Engineer"
                              data-testid="input-job-title"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. TechCorp SA"
                              data-testid="input-company"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-location">
                                <SelectValue placeholder="Select location" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {saLocations.map((loc) => (
                                <SelectItem key={loc} value={loc}>
                                  {loc}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="employmentType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Employment Type *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-employment-type">
                                <SelectValue placeholder="Select type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {employmentTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salaryMin"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Salary (ZAR) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 500000"
                              data-testid="input-salary-min"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salaryMax"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Maximum Salary (ZAR) *</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="e.g. 700000"
                              data-testid="input-salary-max"
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : 0)}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="industry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Industry *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-industry">
                                <SelectValue placeholder="Select industry" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {industries.map((ind) => (
                                <SelectItem key={ind} value={ind}>
                                  {ind}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="whatsappContact"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp Number *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g. +27821234567"
                              data-testid="input-whatsapp"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Job Description *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Describe the role, responsibilities, and ideal candidate..."
                            className="min-h-32"
                            data-testid="textarea-description"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="requirements"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Requirements *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="List required skills, experience, and qualifications..."
                            className="min-h-32"
                            data-testid="textarea-requirements"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-4">
                    <Button
                      type="submit"
                      className="bg-amber-gradient text-charcoal hover:opacity-90"
                      disabled={mutation.isPending}
                      data-testid="button-submit-job"
                    >
                      {mutation.isPending ? "Posting..." : "Post Job"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowForm(false)}
                      data-testid="button-cancel"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </Card>
          )}

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search jobs by title, company, location, or industry..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-jobs"
              />
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-slate">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="mx-auto mb-4 text-slate" size={48} />
              <h3 className="text-xl font-semibold mb-2 text-white-brand" data-testid="text-no-jobs">
                {searchTerm ? "No jobs found" : "No jobs posted yet"}
              </h3>
              <p className="text-slate mb-4">
                {searchTerm
                  ? "Try adjusting your search terms"
                  : "Be the first to post a job with transparent salary ranges"}
              </p>
              {!showForm && !searchTerm && (
                <Button className="bg-amber-gradient text-charcoal hover:opacity-90" onClick={() => setShowForm(true)} data-testid="button-post-first">
                  Post the first job
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="p-6 hover-elevate" data-testid={`card-job-${job.id}`}>
                  <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-xl font-semibold mb-2 text-white-brand" data-testid="text-job-title">
                        {job.title}
                      </h3>
                      <p className="text-lg text-slate mb-3" data-testid="text-job-company">
                        {job.company}
                      </p>
                    </div>
                    <Badge className="bg-amber/10 text-amber border-0 text-sm" data-testid="badge-employment-type">
                      {job.employmentType}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-4 mb-4 text-sm text-slate">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} />
                      <span data-testid="text-job-location">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} />
                      <span data-testid="text-job-salary">
                        R{job.salaryMin.toLocaleString()} - R{job.salaryMax.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Briefcase size={16} />
                      <span data-testid="text-job-industry">{job.industry}</span>
                    </div>
                  </div>

                  <p className="text-slate mb-4 line-clamp-3" data-testid="text-job-description">
                    {job.description}
                  </p>

                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      className="bg-amber-gradient text-charcoal hover:opacity-90"
                      size="sm"
                      onClick={() => window.open(`https://wa.me/${job.whatsappContact.replace(/\D/g, '')}`, '_blank')}
                      data-testid="button-whatsapp"
                    >
                      <MessageCircle size={16} className="mr-2" />
                      Apply via WhatsApp
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      data-testid="button-view-details"
                    >
                      View Details
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}

          {filteredJobs.length > 0 && (
            <p className="text-center text-sm text-slate mt-6">
              Showing {filteredJobs.length} of {jobsData?.count || 0} jobs
            </p>
          )}
        </div>
      </Section>

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="p-6">
            <div className="aspect-video bg-gradient-to-br from-violet/10 to-transparent rounded-lg flex items-center justify-center border mb-4">
              <p className="text-muted-foreground text-sm">[Salary Transparency Mock]</p>
            </div>
            <h3 className="font-semibold mb-2" data-testid="text-mock-title">Post with mandatory salary ranges</h3>
            <p className="text-sm text-muted-foreground">
              Build trust and reduce time-wasters with transparent salary info on every post.
            </p>
          </Card>
          <Card className="p-6">
            <div className="aspect-video bg-gradient-to-br from-green/10 to-transparent rounded-lg flex items-center justify-center border mb-4">
              <div className="text-center">
                <FileText size={48} className="text-green mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">CSV Export</p>
              </div>
            </div>
            <h3 className="font-semibold mb-2" data-testid="text-mock-title">EE Report Export</h3>
            <p className="text-sm text-muted-foreground">
              One-click Employment Equity reports ready for submission.
            </p>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            data-testid="button-workflow"
            onClick={() => console.log("See recruiter workflow clicked")}
          >
            See recruiter workflow
          </Button>
          <Button
            size="lg"
            variant="outline"
            data-testid="button-demo"
            onClick={() => console.log("Book a demo clicked")}
          >
            Book a demo
          </Button>
        </div>
      </Section>

      <Section className="bg-graphite" id="faq">
        <h2 className="text-3xl font-serif font-semibold text-center mb-12 text-white-brand" data-testid="text-faq-title">
          Recruiter FAQs
        </h2>
        <div className="max-w-3xl mx-auto">
          <FAQAccordion audience="recruiters" />
        </div>
      </Section>
    </main>
  );
}
