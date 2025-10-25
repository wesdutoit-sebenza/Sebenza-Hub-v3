import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { Briefcase, MapPin, DollarSign, MessageCircle, Search, Plus, X, Pencil } from "lucide-react";
import { type Job } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { JOB_TITLES } from "@shared/jobTitles";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "@shared/countryCodes";

const formSchema = z.object({
  title: z.string().min(1, "Please select a job title"),
  customTitle: z.string().optional(),
  company: z.string().min(1, "Company name is required"),
  location: z.string().min(1, "Location is required"),
  salaryMin: z.coerce.number().positive("Minimum salary must be positive"),
  salaryMax: z.coerce.number().positive("Maximum salary must be positive"),
  description: z.string().min(1, "Description is required"),
  requirements: z.string().min(1, "Requirements are required"),
  countryCode: z.string().default(DEFAULT_COUNTRY_CODE),
  whatsappContact: z.string().min(1, "WhatsApp number is required"),
  employmentType: z.string().min(1, "Employment type is required"),
  industry: z.string().min(1, "Industry is required"),
}).refine(
  (data) => data.salaryMin <= data.salaryMax,
  {
    message: "Minimum salary must be less than or equal to maximum salary",
    path: ["salaryMax"],
  }
).refine((data) => {
  if (data.title === "Other" && !data.customTitle) {
    return false;
  }
  return true;
}, {
  message: "Please specify the job title",
  path: ["customTitle"],
});

type FormData = z.infer<typeof formSchema>;

const saLocations = [
  "Johannesburg",
  "Cape Town",
  "Durban",
  "Pretoria",
  "Port Elizabeth",
  "Bloemfontein",
  "East London",
  "Pietermaritzburg",
  "Kimberley",
  "Nelspruit",
  "Polokwane",
  "Other",
];

const employmentTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Temporary",
  "Freelance",
  "Internship",
];

const industries = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Hospitality",
  "Construction",
  "Transport",
  "Agriculture",
  "Other",
];

export default function RecruiterJobPostings() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);

  const { data: jobsData, isLoading } = useQuery<{ success: boolean; count: number; jobs: Job[] }>({
    queryKey: ["/api/jobs"],
  });

  const jobs = jobsData?.jobs || [];
  
  const filteredJobs = jobs.filter((job) =>
    searchTerm
      ? job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      customTitle: "",
      company: "",
      location: "",
      salaryMin: 0,
      salaryMax: 0,
      description: "",
      requirements: "",
      countryCode: DEFAULT_COUNTRY_CODE,
      whatsappContact: "",
      employmentType: "",
      industry: "",
    },
  });

  const selectedTitle = form.watch("title");

  const mutation = useMutation({
    mutationFn: async (data: FormData) => {
      const finalTitle = data.title === "Other" ? data.customTitle || "" : data.title;
      
      // Remove leading 0 from WhatsApp number before combining with country code
      let whatsappNumber = data.whatsappContact.trim();
      if (whatsappNumber.startsWith("0")) {
        whatsappNumber = whatsappNumber.substring(1);
      }
      const fullWhatsApp = whatsappNumber ? `${data.countryCode} ${whatsappNumber}` : "";
      
      const { customTitle, countryCode, whatsappContact, ...restData } = data;
      const payload = {
        ...restData,
        title: finalTitle,
        whatsappContact: fullWhatsApp,
      };
      
      const method = editingJob ? "PUT" : "POST";
      const url = editingJob ? `/api/jobs/${editingJob.id}` : "/api/jobs";
      const response = await apiRequest(method, url, payload);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success!",
        description: editingJob ? "Job updated successfully!" : "Job posted successfully!",
      });
      form.reset();
      setShowForm(false);
      setEditingJob(null);
    },
    onError: () => {
      toast({
        title: "Error",
        description: editingJob ? "Failed to update job. Please try again." : "Failed to post job. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    mutation.mutate(data);
  };

  const handleEdit = (job: Job) => {
    // Parse WhatsApp number to split country code and phone number
    let countryCode = DEFAULT_COUNTRY_CODE;
    let phoneNumber = "";
    
    if (job.whatsappContact) {
      const parts = job.whatsappContact.trim().split(" ");
      if (parts.length >= 2) {
        countryCode = parts[0];
        phoneNumber = parts.slice(1).join(" ");
      } else {
        phoneNumber = job.whatsappContact;
      }
    }

    // Check if title is a custom one (not in predefined list)
    const isCustomTitle = !JOB_TITLES.includes(job.title);
    
    form.reset({
      title: isCustomTitle ? "Other" : job.title,
      customTitle: isCustomTitle ? job.title : "",
      company: job.company,
      location: job.location,
      salaryMin: job.salaryMin,
      salaryMax: job.salaryMax,
      description: job.description,
      requirements: job.requirements,
      countryCode: countryCode,
      whatsappContact: phoneNumber,
      employmentType: job.employmentType,
      industry: job.industry,
    });
    
    setEditingJob(job);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    form.reset();
    setEditingJob(null);
    setShowForm(false);
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Job Postings</h1>
          <p className="text-muted-foreground mt-2">
            Post jobs with mandatory salary ranges and WhatsApp contact
          </p>
        </div>
        <Button
          data-testid="button-post-job"
          onClick={() => {
            if (showForm) {
              handleCancelEdit();
            } else {
              setShowForm(true);
            }
          }}
        >
          {showForm ? (
            <>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </>
          ) : (
            <>
              <Plus className="w-4 h-4 mr-2" />
              Post a Job
            </>
          )}
        </Button>
      </div>

      {showForm && (
        <Card className="p-8 mb-8">
          <h3 className="text-xl font-semibold mb-6" data-testid="text-form-title">
            {editingJob ? "Edit Job Posting" : "Create Job Posting"}
          </h3>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-job-title">
                            <SelectValue placeholder="Select job title" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {JOB_TITLES.map((title) => (
                            <SelectItem key={title} value={title}>
                              {title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedTitle === "Other" && (
                  <FormField
                    control={form.control}
                    name="customTitle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Specify Job Title *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Enter job title"
                            data-testid="input-custom-job-title"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

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

                <FormItem>
                  <FormLabel>WhatsApp Number *</FormLabel>
                  <div className="flex gap-2">
                    <FormField
                      control={form.control}
                      name="countryCode"
                      render={({ field }) => (
                        <FormItem className="w-[180px]">
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger data-testid="select-country-code">
                                <SelectValue placeholder="Code" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[300px]">
                              {COUNTRY_CODES.map((cc) => (
                                <SelectItem key={cc.code} value={cc.dialCode}>
                                  {cc.dialCode} {cc.country}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="whatsappContact"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input
                              placeholder="e.g. 082 123 4567"
                              data-testid="input-whatsapp"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </FormItem>
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
                  disabled={mutation.isPending}
                  data-testid="button-submit-job"
                >
                  {mutation.isPending 
                    ? (editingJob ? "Updating..." : "Posting...") 
                    : (editingJob ? "Update Job" : "Post Job")
                  }
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancelEdit}
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
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card className="p-12 text-center">
          <Briefcase className="mx-auto mb-4 text-muted-foreground" size={48} />
          <h3 className="text-xl font-semibold mb-2" data-testid="text-no-jobs">
            {searchTerm ? "No jobs found" : "No jobs posted yet"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm
              ? "Try adjusting your search terms"
              : "Be the first to post a job with transparent salary ranges"}
          </p>
          {!showForm && !searchTerm && (
            <Button onClick={() => setShowForm(true)} data-testid="button-post-first">
              Post your first job
            </Button>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="p-6 hover-elevate" data-testid={`card-job-${job.id}`}>
              <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2" data-testid="text-job-title">
                    {job.title}
                  </h3>
                  <p className="text-lg text-muted-foreground mb-3" data-testid="text-job-company">
                    {job.company}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" data-testid="badge-employment-type">
                    {job.employmentType}
                  </Badge>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleEdit(job)}
                    data-testid={`button-edit-${job.id}`}
                    title="Edit job"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
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

              <p className="text-muted-foreground mb-4 line-clamp-3" data-testid="text-job-description">
                {job.description}
              </p>

              {job.whatsappContact && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle size={16} className="text-primary" />
                  <span className="text-muted-foreground">WhatsApp: </span>
                  <a
                    href={`https://wa.me/${job.whatsappContact.replace(/\s+/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                    data-testid="link-whatsapp"
                  >
                    {job.whatsappContact}
                  </a>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      <div className="mt-6 text-center text-sm text-muted-foreground">
        {filteredJobs.length > 0 && (
          <span data-testid="text-job-count">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </span>
        )}
      </div>
    </div>
  );
}
