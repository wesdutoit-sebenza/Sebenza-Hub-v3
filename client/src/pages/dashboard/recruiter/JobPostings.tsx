import { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Search, Plus, X, Briefcase, MapPin, DollarSign, Calendar, Building2, FileText, Sparkles, AlertCircle, Play, Pause, Eye, EyeOff, Trash2, Edit, CheckCircle2, Upload, FileText as FileTextIcon, ArrowUp, ArrowDown, Download } from "lucide-react";
import { type Job, type RecruiterProfile, insertJobSchema } from "@shared/schema";
import { JobDescriptionAIDialog } from "@/components/JobDescriptionAIDialog";
import { CompanyDescriptionAIDialog } from "@/components/CompanyDescriptionAIDialog";
import { ImportJobDialog } from "@/components/ImportJobDialog";
import {
  SA_PROVINCES,
  EMPLOYMENT_TYPES,
  SENIORITY_LEVELS,
  WORK_ARRANGEMENTS,
  PAY_TYPES,
  INDUSTRIES,
  TOOLS_TECH,
  TRAVEL_REQUIREMENTS,
  SHIFT_PATTERNS,
  RIGHT_TO_WORK,
  JOB_STATUS,
  JOB_VISIBILITY,
  REQUIRED_ATTACHMENTS,
  OPTIONAL_ATTACHMENTS,
  COMMON_BENEFITS,
  SA_LANGUAGES,
  PROFICIENCY_LEVELS,
} from "@shared/jobTaxonomies";
import { JOB_TITLES, JOB_TITLES_BY_INDUSTRY, getIndustryForJobTitle } from "@shared/jobTitles";
import { CITIES_BY_PROVINCE, getLocationDataForCity } from "@shared/cities";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { GoogleAddressSearch } from "@/components/GoogleAddressSearch";
import { SkillsMultiSelect } from "@/components/SkillsMultiSelect";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import html2pdf from "html2pdf.js";

type FormData = z.infer<typeof insertJobSchema>;

const todayISO = () => new Date().toISOString().split("T")[0];

// MultiAdd component for adding/removing items
function MultiAdd({
  items,
  onAdd,
  onRemove,
  placeholder,
  suggestions = [],
}: {
  items: string[];
  onAdd: (val: string) => void;
  onRemove: (idx: number) => void;
  placeholder?: string;
  suggestions?: readonly string[];
}) {
  const [val, setVal] = useState("");
  const add = () => {
    const v = val.trim();
    if (v && !items.includes(v)) {
      onAdd(v);
      setVal("");
    }
  };
  
  return (
    <div>
      <div className="flex gap-2 mb-3">
        <Input
          value={val}
          onChange={(e) => setVal(e.target.value)}
          placeholder={placeholder}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          data-testid="input-multi-add"
        />
        <Button type="button" onClick={add} size="sm" data-testid="button-add-item">
          <Plus className="h-4 w-4 mr-1" />
          Add
        </Button>
      </div>
      <div className="flex flex-wrap gap-2 mb-3">
        {items.map((item, i) => (
          <Badge key={i} variant="secondary" className="gap-1" data-testid={`badge-item-${i}`}>
            {item}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="hover:text-destructive"
              data-testid={`button-remove-${i}`}
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      {suggestions.length > 0 && (
        <div className="text-xs text-muted-foreground">
          <span className="font-medium">Suggestions:</span>{" "}
          {suggestions.slice(0, 10).map((s) => (
            <button
              type="button"
              key={s}
              onClick={() => !items.includes(s) && onAdd(s)}
              className="mr-2 underline hover:no-underline"
              data-testid={`button-suggestion-${s}`}
            >
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Section wrapper component
function FormSection({ title, description, children, id }: { title: string; description?: string; children: React.ReactNode; id?: string }) {
  return (
    <Card className="mb-6" id={id}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-4">
        {children}
      </CardContent>
    </Card>
  );
}

// Job Form Navigation Component
const FORM_SECTIONS = [
  { id: "company-info", label: "Company Info" },
  { id: "company-description", label: "Company Description" },
  { id: "core-details", label: "Core Details" },
  { id: "responsibilities", label: "Responsibilities" },
  { id: "job-summary", label: "Job Summary" },
  { id: "qualifications", label: "Qualifications" },
  { id: "compensation", label: "Compensation" },
  { id: "application-details", label: "Application" },
  { id: "compliance", label: "Compliance" },
  { id: "admin-publishing", label: "Admin & Publishing" },
  { id: "legal-consents", label: "Legal Consents" },
];

function JobFormNavigation() {
  const [activeSection, setActiveSection] = useState<string>(FORM_SECTIONS[0].id);
  const navRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: "-20% 0px -70% 0px",
      threshold: 0,
    };

    const observerCallback = (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id);
        }
      });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Observe all sections
    FORM_SECTIONS.forEach(({ id }) => {
      const element = document.getElementById(id);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, []);

  // Scroll active nav item into view when it changes
  useEffect(() => {
    const activeNavButton = navRefs.current[activeSection];
    const container = scrollContainerRef.current;
    
    if (activeNavButton && container) {
      const buttonTop = activeNavButton.offsetTop;
      const buttonHeight = activeNavButton.offsetHeight;
      const containerScrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      // Check if button is outside visible area
      if (buttonTop < containerScrollTop) {
        // Button is above visible area, scroll up
        container.scrollTo({
          top: buttonTop - 10, // 10px padding
          behavior: "smooth"
        });
      } else if (buttonTop + buttonHeight > containerScrollTop + containerHeight) {
        // Button is below visible area, scroll down
        container.scrollTo({
          top: buttonTop - containerHeight + buttonHeight + 10, // 10px padding
          behavior: "smooth"
        });
      }
    }
  }, [activeSection]);

  const scrollToSection = (sectionId: string) => {
    // Immediately update active section when clicking
    setActiveSection(sectionId);
    
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80; // Adjust for sticky header
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="sticky top-20 self-start">
      <Card className="w-64">
        <CardHeader className="pb-2 pt-3 px-3">
          <CardTitle className="text-xs font-medium">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3 pt-0">
          <div className="space-y-0.5">
            {FORM_SECTIONS.map((section) => (
              <button
                key={section.id}
                ref={(el) => { navRefs.current[section.id] = el; }}
                onClick={() => scrollToSection(section.id)}
                className={`
                  w-full text-left px-2 py-1.5 rounded text-xs transition-colors
                  hover-elevate active-elevate-2
                  ${activeSection === section.id 
                    ? "bg-primary text-primary-foreground font-medium" 
                    : "text-muted-foreground"
                  }
                `}
                data-testid={`nav-${section.id}`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function RecruiterJobPostings() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [jobTitleSearchQuery, setJobTitleSearchQuery] = useState("");
  const [jobTitleDropdownOpen, setJobTitleDropdownOpen] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);
  const [companyDescriptionAIDialogOpen, setCompanyDescriptionAIDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const { data: jobsData, isLoading } = useQuery<{ success: boolean; count: number; jobs: Job[] }>({
    queryKey: ["/api/jobs"],
  });

  const { data: recruiterProfile } = useQuery<RecruiterProfile>({
    queryKey: ["/api/profile/recruiter"],
  });

  const jobs = jobsData?.jobs || [];
  
  const filteredJobs = jobs.filter((job) =>
    searchTerm
      ? job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchTerm.toLowerCase())
      : true
  );

  // Filter cities based on search query
  const filteredCities = useMemo(() => {
    if (!citySearchQuery) return CITIES_BY_PROVINCE;

    const query = citySearchQuery.toLowerCase();
    return CITIES_BY_PROVINCE.map(provinceData => ({
      ...provinceData,
      cities: provinceData.cities.filter(cityData =>
        cityData.city.toLowerCase().includes(query)
      ),
    })).filter(provinceData => provinceData.cities.length > 0);
  }, [citySearchQuery]);

  // Filter job titles based on search query
  const filteredJobTitles = useMemo(() => {
    if (!jobTitleSearchQuery) return JOB_TITLES_BY_INDUSTRY;

    const query = jobTitleSearchQuery.toLowerCase();
    return JOB_TITLES_BY_INDUSTRY.map(category => ({
      ...category,
      titles: category.titles.filter(title =>
        title.toLowerCase().includes(query)
      ),
    })).filter(category => category.titles.length > 0);
  }, [jobTitleSearchQuery]);

  const form = useForm<FormData>({
    mode: "onSubmit",
    defaultValues: {
      title: "",
      jobIndustry: "",
      company: "",
      employmentType: "Permanent",
      core: {
        seniority: "Mid",
        department: "",
        workArrangement: "On-site",
        location: { country: "South Africa", province: "", city: "" },
        summary: "",
        responsibilities: [""],
        requiredSkills: [],
        qualifications: [""],
        experience: [""],
        languagesRequired: [],
        licenseCode: "",
      },
      compensation: {
        displayRange: true,
        currency: "ZAR",
        payType: "Annual",
        commissionAvailable: false,
        performanceBonus: false,
        medicalAidContribution: false,
        pensionContribution: false,
      },
      application: {
        method: "in-app",
        closingDate: todayISO(),
        whatsappNumber: "",
        competencyTestReference: "",
      },
      companyDetails: {
        name: "",
        industry: "",
        recruitingAgency: "",
        website: "",
        logoUrl: "",
        description: "",
        linkedinUrl: "",
        companySize: undefined,
        eeAa: false,
        contactEmail: "",
      },
      contract: undefined,
      benefits: undefined,
      attachments: undefined,
      accessibility: undefined,
      vetting: {
        criminal: false,
        credit: false,
        qualification: false,
        references: false,
      },
      compliance: {
        rightToWork: "Citizen/PR",
        popiaConsent: false,
        checksConsent: false,
      },
      admin: {
        jobId: `JOB-${Date.now()}`,
        owner: "",
        visibility: "Public",
        status: "Draft",
        pipeline: ["Applied", "Screen", "Interview 1", "Interview 2", "Offer", "Hired"],
        closingDate: "",
        externalJobBoards: {
          linkedin: false,
          pnet: false,
          careerJunction: false,
          jobMail: false,
        },
      },
    },
  });

  // TypeScript inference limitation: react-hook-form's useFieldArray only infers union types for object arrays,
  // not string arrays, when both exist in the same parent object. These are string arrays, so we use @ts-expect-error.
  const {
    fields: respFields,
    append: respAppend,
    remove: respRemove,
    move: respMove,
    // @ts-expect-error - core.responsibilities is a string[], but TypeScript infers only object array keys
  } = useFieldArray<FormData>({ control: form.control, name: "core.responsibilities" });

  const {
    fields: qualFields,
    append: qualAppend,
    remove: qualRemove,
    move: qualMove,
    // @ts-expect-error - core.qualifications is a string[], but TypeScript infers only object array keys
  } = useFieldArray<FormData>({ control: form.control, name: "core.qualifications" });

  const {
    fields: expFields,
    append: expAppend,
    remove: expRemove,
    move: expMove,
    // @ts-expect-error - core.experience is a string[], but TypeScript infers only object array keys
  } = useFieldArray<FormData>({ control: form.control, name: "core.experience" });

  const workArrangement = form.watch("core.workArrangement");
  const applicationMethod = form.watch("application.method");
  const jobTitle = form.watch("title");
  const selectedSkills = form.watch("core.requiredSkills") || [];

  // Auto-populate recruiting agency from profile
  useEffect(() => {
    if (recruiterProfile?.agencyName) {
      form.setValue("companyDetails.recruitingAgency", recruiterProfile.agencyName);
    }
  }, [recruiterProfile, form]);

  // Debounced job title for skill suggestions
  const [debouncedJobTitle, setDebouncedJobTitle] = useState("");
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (jobTitle && jobTitle.trim().length >= 3) {
        setDebouncedJobTitle(jobTitle.trim());
      } else {
        setDebouncedJobTitle("");
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, [jobTitle]);

  // Fetch AI skill suggestions based on job title
  const { data: skillSuggestionsData, isLoading: isLoadingSuggestions, error: suggestionsError } = useQuery({
    queryKey: ["/api/jobs/suggest-skills", debouncedJobTitle],
    queryFn: async () => {
      const response = await apiRequest(
        "POST", 
        "/api/jobs/suggest-skills", 
        {
          jobTitle: debouncedJobTitle,
        }
      );
      return response.json();
    },
    enabled: debouncedJobTitle.length >= 3,
    retry: 1,
  });

  // Filter out already-selected skills from suggestions
  const filteredSuggestions = useMemo(() => {
    if (!skillSuggestionsData) return [];
    const suggestions = (skillSuggestionsData as { success: boolean; suggestions: string[] }).suggestions || [];
    return suggestions.filter((skill: string) => !selectedSkills.some(s => s.skill === skill));
  }, [skillSuggestionsData, selectedSkills]);

  const updateJobStatusMutation = useMutation({
    mutationFn: async ({ jobId, status }: { jobId: string; status: string }) => {
      return apiRequest("PATCH", `/api/jobs/${jobId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success!",
        description: "Job status updated successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job status.",
        variant: "destructive",
      });
    },
  });

  const deleteJobMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("DELETE", `/api/jobs/${jobId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success!",
        description: "Job deleted successfully.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete job.",
        variant: "destructive",
      });
    },
  });

  const updateJobMutation = useMutation({
    mutationFn: async ({ jobId, data }: { jobId: string; data: FormData }) => {
      // Transform data to include legacy fields for backward compatibility
      const locationParts = [data.core?.location?.city, data.core?.location?.province].filter(Boolean);
      const transformedData = {
        ...data,
        company: data.companyDetails?.name || "",
        location: locationParts.length > 0 ? locationParts.join(", ") : undefined,
        salaryMin: data.compensation?.min || 0,
        salaryMax: data.compensation?.max || 0,
        description: data.core?.summary || "",
        requirements: data.core?.qualifications?.join(", ") || "",
        whatsappContact: data.application?.whatsappNumber || "",
        employmentType: data.employmentType || "Permanent",
        industry: data.jobIndustry || "Other",
      };

      // Remove null values to prevent validation errors
      const cleanedData = Object.fromEntries(
        Object.entries(transformedData).filter(([_, v]) => v !== null)
      );
      
      return apiRequest("PUT", `/api/jobs/${jobId}`, cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success!",
        description: "Job updated successfully.",
      });
      form.reset();
      setShowForm(false);
      setEditingJobId(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update job.",
        variant: "destructive",
      });
    },
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Transform data to include legacy fields for backward compatibility
      const locationParts = [data.core?.location?.city, data.core?.location?.province].filter(Boolean);
      const transformedData = {
        ...data,
        company: data.companyDetails?.name || "", // Populate legacy company field
        location: locationParts.length > 0 ? locationParts.join(", ") : undefined,
        salaryMin: data.compensation?.min || 0,
        salaryMax: data.compensation?.max || 0,
        description: data.core?.summary || "",
        requirements: data.core?.qualifications?.join(", ") || "",
        whatsappContact: data.application?.whatsappNumber || "",
        employmentType: data.employmentType || "Permanent",
        industry: data.jobIndustry || "Other", // Map jobIndustry to legacy industry field
      };

      // Remove null values to prevent validation errors
      const cleanedData = Object.fromEntries(
        Object.entries(transformedData).filter(([_, v]) => v !== null)
      );
      
      return apiRequest("POST", "/api/jobs", cleanedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Success!",
        description: "Job posted successfully.",
      });
      form.reset();
      setShowForm(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post job.",
        variant: "destructive",
      });
    },
  });

  // Helper function to normalize legacy string values to booleans
  const normalizeToBoolean = (value: any): boolean => {
    // If already a boolean, return as-is
    if (typeof value === 'boolean') return value;
    
    // If string, check for explicit affirmative values
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      return normalized === 'yes' || normalized === 'true' || normalized === '1';
    }
    
    // For any other type (null, undefined, number, etc.), treat as false
    return false;
  };

  const handleEditJob = (job: Job) => {
    // Normalize legacy data: convert any string values in compensation to booleans
    const normalizedJob = {
      ...job,
      compensation: job.compensation ? {
        ...job.compensation,
        // Convert legacy string values to booleans using explicit affirmative checks
        commissionAvailable: normalizeToBoolean((job.compensation as any)?.commissionAvailable),
        performanceBonus: normalizeToBoolean((job.compensation as any)?.performanceBonus),
        medicalAidContribution: normalizeToBoolean((job.compensation as any)?.medicalAidContribution),
        pensionContribution: normalizeToBoolean((job.compensation as any)?.pensionContribution),
      } : job.compensation,
    };
    
    // Load normalized job data into form
    setEditingJobId(job.id);
    form.reset(normalizedJob as any);
    setShowForm(true);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteJob = (jobId: string, jobTitle: string) => {
    if (confirm(`Are you sure you want to delete "${jobTitle}"? This action cannot be undone.`)) {
      deleteJobMutation.mutate(jobId);
    }
  };

  const generateJobPDFHTML = (data: FormData) => {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; line-height: 1.6;">
        <h1 style="color: #D97706; border-bottom: 3px solid #D97706; padding-bottom: 10px; margin-bottom: 20px;">${data.title || 'Job Posting'}</h1>
        
        <div style="margin-bottom: 30px;">
          <h2 style="color: #262626; font-size: 18px; margin-bottom: 10px;">Company Information</h2>
          <p><strong>Company:</strong> ${data.companyDetails?.name || 'N/A'}</p>
          <p><strong>Industry:</strong> ${data.companyDetails?.industry || 'N/A'}</p>
          ${data.companyDetails?.website ? `<p><strong>Website:</strong> ${data.companyDetails.website}</p>` : ''}
          ${data.companyDetails?.description ? `<p><strong>About the Company:</strong><br/>${data.companyDetails.description}</p>` : ''}
        </div>

        <div style="margin-bottom: 30px;">
          <h2 style="color: #262626; font-size: 18px; margin-bottom: 10px;">Job Details</h2>
          <p><strong>Location:</strong> ${data.location || 'N/A'}</p>
          <p><strong>Employment Type:</strong> ${data.employmentType || 'N/A'}</p>
          <p><strong>Work Arrangement:</strong> ${data.core?.workArrangement || 'N/A'}</p>
          ${data.core?.seniority ? `<p><strong>Seniority Level:</strong> ${data.core.seniority}</p>` : ''}
        </div>

        ${data.core?.summary ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #262626; font-size: 18px; margin-bottom: 10px;">Job Summary</h2>
            <p>${data.core.summary}</p>
          </div>
        ` : ''}

        ${data.core?.responsibilities && data.core.responsibilities.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #262626; font-size: 18px; margin-bottom: 10px;">Key Responsibilities</h2>
            <ul>
              ${data.core.responsibilities.map(r => `<li>${r}</li>`).join('')}
            </ul>
          </div>
        ` : ''}

        ${data.core?.requiredSkills && data.core.requiredSkills.length > 0 ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #262626; font-size: 18px; margin-bottom: 10px;">Required Skills</h2>
            <ul>
              ${data.core.requiredSkills.map((skill: any) => {
                if (typeof skill === 'string') {
                  return `<li>${skill}</li>`;
                }
                return `<li>${skill.name} - ${skill.level} (${skill.priority})</li>`;
              }).join('')}
            </ul>
          </div>
        ` : ''}

        ${data.compensation?.min || data.compensation?.max ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #262626; font-size: 18px; margin-bottom: 10px;">Compensation</h2>
            <p><strong>Salary Range:</strong> ${data.compensation.currency || 'ZAR'} ${data.compensation.min || '0'} - ${data.compensation.max || 'N/A'} ${data.compensation.payType || ''}</p>
          </div>
        ` : ''}

        ${data.admin?.closingDate ? `
          <div style="margin-bottom: 30px;">
            <h2 style="color: #262626; font-size: 18px; margin-bottom: 10px;">Application Details</h2>
            <p><strong>Application Deadline:</strong> ${new Date(data.admin.closingDate).toLocaleDateString()}</p>
          </div>
        ` : ''}

        <div style="margin-top: 40px; padding-top: 20px; border-top: 2px solid #E5E5E5; color: #737373; font-size: 12px;">
          <p>Generated on ${new Date().toLocaleDateString()} - Sebenza Hub</p>
        </div>
      </div>
    `;
  };

  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    try {
      const formData = form.getValues();
      const htmlContent = generateJobPDFHTML(formData);
      
      const opt = {
        margin: 10,
        filename: `job-posting-${formData.title?.replace(/\s+/g, '-').toLowerCase() || 'draft'}.pdf`,
        image: { type: 'jpeg' as const, quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
      };

      await html2pdf().set(opt).from(htmlContent).save();
      
      toast({
        title: "PDF Downloaded",
        description: "Job posting PDF has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const onSubmit = (data: FormData) => {
    console.log("Form submitted with data:", data);
    console.log("Job status:", data.admin?.status);
    
    // Clean up data: remove null values for optional fields to avoid validation errors
    const cleanedData = {
      ...data,
      contract: data.contract || undefined,
      benefits: data.benefits || undefined,
      attachments: data.attachments || undefined,
      accessibility: data.accessibility || undefined,
      branding: data.branding || undefined,
      seo: data.seo || undefined,
    };
    
    // If status is Draft, skip strict validation
    if (cleanedData.admin?.status === "Draft") {
      console.log("Saving as draft - skipping strict validation");
      if (editingJobId) {
        updateJobMutation.mutate({ jobId: editingJobId, data: cleanedData });
      } else {
        createJobMutation.mutate(cleanedData);
      }
      return;
    }
    
    // For Live/Paused/Closed/Filled, validate strictly
    const validationResult = insertJobSchema.safeParse(cleanedData);
    
    if (!validationResult.success) {
      const errors = validationResult.error.format();
      console.log("Validation errors for non-draft:", errors);
      
      // Extract first error message
      const firstError = validationResult.error.errors[0];
      const errorPath = firstError.path.join(" > ");
      const errorMessage = `${errorPath}: ${firstError.message}`;
      
      toast({
        title: "Cannot save - validation failed",
        description: errorMessage,
        variant: "destructive",
      });
      return;
    }
    
    // Validation passed, submit the form
    if (editingJobId) {
      updateJobMutation.mutate({ jobId: editingJobId, data: cleanedData });
    } else {
      createJobMutation.mutate(cleanedData);
    }
  };

  const onInvalid = (errors: any) => {
    console.log("Form validation errors:", errors);
    
    // Show toast with first error
    const firstError = Object.values(errors)[0] as any;
    const errorMessage = firstError?.message || "Please check required fields";
    
    toast({
      title: "Form validation failed",
      description: errorMessage,
      variant: "destructive",
    });
  };

  if (showForm) {
    return (
      <div className="container mx-auto p-6 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="ghost" 
            onClick={() => {
              setShowForm(false);
              setEditingJobId(null);
              form.reset();
            }} 
            data-testid="button-cancel"
          >
            ← Back to Jobs
          </Button>
          <h1 className="text-3xl font-bold mt-4 mb-2">
            {editingJobId ? "Edit Job Posting" : "Create Job Posting"}
          </h1>
          <p className="text-muted-foreground">Complete job details for comprehensive candidate matching</p>
        </div>

        <div className="flex gap-6">
          {/* Sticky Navigation Sidebar - Hidden on mobile, shown on lg+ */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <JobFormNavigation />
          </aside>

          {/* Form Content */}
          <div className="flex-1 min-w-0">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-6">
            {/* Form Validation Errors Alert */}
            {Object.keys(form.formState.errors).length > 0 && (
              <Alert variant="destructive" data-testid="alert-form-errors">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Form has validation errors</AlertTitle>
                <AlertDescription>
                  Please review and fix the highlighted fields before publishing. Check:
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    {Object.entries(form.formState.errors).map(([key, error]) => (
                      <li key={key}>
                        <span className="font-medium">{key}</span>: {(error as any)?.message || "Invalid value"}
                      </li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Company Information */}
            <FormSection id="company-info" title="Company Information" description="Recruiting agency and company details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="companyDetails.recruitingAgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recruiting Agency</FormLabel>
                      <FormControl>
                        <Input 
 
                          {...field} 
                          disabled 
                          data-testid="input-recruiting-agency" 
                        />
                      </FormControl>
                      <FormDescription>
                        Auto-populated from your recruiter profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyDetails.name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-company-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyDetails.industry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Industry</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-company-industry">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {INDUSTRIES.map((ind) => (
                            <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Industry your company operates in
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location Fields */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="core.location.city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City / Town *</FormLabel>
                      <Popover open={cityDropdownOpen} onOpenChange={setCityDropdownOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={cityDropdownOpen}
                              className="w-full justify-between text-left font-normal"
                              data-testid="select-city"
                            >
                              <span className={field.value ? "" : "text-muted-foreground"}>
                                {field.value || "Select city / town"}
                              </span>
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              value={citySearchQuery}
                              onValueChange={setCitySearchQuery}
                              data-testid="input-city-search"
                            />
                            <CommandList className="max-h-[300px]">
                              <CommandEmpty>No cities found.</CommandEmpty>
                              {filteredCities.map((provinceData) => (
                                <CommandGroup
                                  key={provinceData.province}
                                  heading={provinceData.province}
                                >
                                  {provinceData.cities.map((cityData) => (
                                    <CommandItem
                                      key={`${provinceData.province}-${cityData.city}`}
                                      value={cityData.city}
                                      onSelect={() => {
                                        field.onChange(cityData.city);
                                        // Auto-fill province and postal code based on selected city
                                        const locationData = getLocationDataForCity(cityData.city);
                                        if (locationData) {
                                          form.setValue("core.location.province", locationData.province);
                                          form.setValue("core.location.postalCode", locationData.postalCode);
                                        }
                                        setCityDropdownOpen(false);
                                        setCitySearchQuery("");
                                      }}
                                      className="cursor-pointer"
                                      data-testid={`city-option-${cityData.city}`}
                                    >
                                      {cityData.city}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))}
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="core.location.province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province *</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          readOnly 
                          disabled

                          className="bg-muted"
                          data-testid="input-province-readonly"
                        />
                      </FormControl>
                      <FormDescription>
                        Auto-filled based on selected city
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="core.location.postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          readOnly 
                          disabled

                          className="bg-muted"
                          data-testid="input-postal-code-readonly"
                        />
                      </FormControl>
                      <FormDescription>
                        Auto-filled based on selected city
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="core.location.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Physical Address (Google Search)</FormLabel>
                    <FormControl>
                      <GoogleAddressSearch
                        value={field.value}
                        onChange={(address, placeDetails) => {
                          field.onChange(address);
                          
                          if (placeDetails?.address_components) {
                            const components = placeDetails.address_components;
                            
                            const city = components.find(c => 
                              c.types.includes('locality') || c.types.includes('sublocality')
                            )?.long_name;
                            
                            const province = components.find(c => 
                              c.types.includes('administrative_area_level_1')
                            )?.long_name;
                            
                            const postalCode = components.find(c => 
                              c.types.includes('postal_code')
                            )?.long_name;
                            
                            if (city) form.setValue('core.location.city', city);
                            if (province) form.setValue('core.location.province', province);
                            if (postalCode) form.setValue('core.location.postalCode', postalCode);
                          }
                        }}
                        data-testid="input-address-search"
                      />
                    </FormControl>
                    <FormDescription>
                      Start typing to search for an address. This will auto-fill city, province, and postal code.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyDetails.linkedinUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company LinkedIn Page</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="url"
                          placeholder="https://www.linkedin.com/company/yourcompany"
                          onBlur={(e) => {
                            field.onBlur(); // Preserve RHF touched-state
                            const value = e.target.value.trim();
                            if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
                              // Auto-add https:// if missing
                              const updatedValue = `https://${value}`;
                              field.onChange(updatedValue);
                            }
                          }}
                          data-testid="input-company-linkedin" 
                        />
                      </FormControl>
                      <FormDescription>
                        Link to company's LinkedIn profile
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyDetails.companySize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Size (Optional)</FormLabel>
                      <Select 
                        onValueChange={(value) => field.onChange(value === "not-specified" ? undefined : value)} 
                        value={field.value || "not-specified"}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-company-size">
                            <SelectValue placeholder="Select company size" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not-specified">Not specified</SelectItem>
                          <SelectItem value="1-10">1-10 employees</SelectItem>
                          <SelectItem value="11-50">11-50 employees</SelectItem>
                          <SelectItem value="51-200">51-200 employees</SelectItem>
                          <SelectItem value="201-500">201-500 employees</SelectItem>
                          <SelectItem value="501-1000">501-1,000 employees</SelectItem>
                          <SelectItem value="1001-5000">1,001-5,000 employees</SelectItem>
                          <SelectItem value="5000+">5,000+ employees</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Number of employees in the company
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Company Description */}
            <FormSection id="company-description" title="Company Description" description="Describe the company to attract candidates">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="companyDetails.website"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Website</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          type="url" 
                          onBlur={(e) => {
                            const value = e.target.value.trim();
                            if (value && !value.startsWith('http://') && !value.startsWith('https://')) {
                              // Auto-add https:// if missing
                              const updatedValue = `https://${value}`;
                              field.onChange(updatedValue);
                            }
                          }}
                          data-testid="input-company-website" 
                        />
                      </FormControl>
                      <FormDescription>
                        Enter URL (e.g., www.example.com) - https:// will be added automatically
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyDetails.logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Logo</FormLabel>
                      <FormControl>
                        <div className="space-y-2">
                          <Input
                            type="file"
                            accept="image/*"
                            onChange={async (e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;

                              const formData = new FormData();
                              formData.append('logo', file);

                              try {
                                const response = await fetch('/api/jobs/logo/upload', {
                                  method: 'POST',
                                  body: formData,
                                });

                                const data = await response.json();

                                if (data.success) {
                                  field.onChange(data.logoUrl);
                                  toast({
                                    title: "Success",
                                    description: "Logo uploaded successfully!",
                                  });
                                } else {
                                  toast({
                                    title: "Upload failed",
                                    description: data.message || "Failed to upload logo",
                                    variant: "destructive",
                                  });
                                }
                              } catch (error) {
                                toast({
                                  title: "Upload failed",
                                  description: "An error occurred while uploading",
                                  variant: "destructive",
                                });
                              }
                            }}
                            data-testid="input-company-logo"
                          />
                          {field.value && (
                            <div className="flex items-center gap-2">
                              <img 
                                src={field.value} 
                                alt="Company logo" 
                                className="h-12 w-12 object-contain border rounded"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => field.onChange("")}
                                data-testid="button-remove-logo"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </FormControl>
                      <FormDescription>
                        Upload your company logo (max 5MB)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyDetails.description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel>Company Description</FormLabel>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          const website = form.watch("companyDetails.website");
                          if (!website) {
                            toast({
                              title: "Company Website Required",
                              description: "Please enter a company website first before using the AI Assistant.",
                              variant: "destructive",
                            });
                            return;
                          }
                          setCompanyDescriptionAIDialogOpen(true);
                        }}
                        className="whitespace-nowrap"
                        data-testid="button-company-ai-assistant"
                      >
                        <Sparkles className="h-4 w-4 mr-2" />
                        AI Assistant
                      </Button>
                    </div>
                    <FormControl>
                      <Textarea 
                        {...field} 
                        rows={6}
                        className="resize-none"
                        data-testid="textarea-company-description" 
                      />
                    </FormControl>
                    <FormDescription>
                      Provide a brief overview of your company, its culture, mission, and what makes it a great place to work.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </FormSection>

            {/* Core Details */}
            <FormSection id="core-details" title="Core Details" description="Essential job information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Row 1: Job Title, Department */}
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Title *</FormLabel>
                      <Popover open={jobTitleDropdownOpen} onOpenChange={setJobTitleDropdownOpen}>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant="outline"
                              role="combobox"
                              aria-expanded={jobTitleDropdownOpen}
                              className="w-full justify-between text-left font-normal"
                              data-testid="select-job-title"
                            >
                              <span className={field.value ? "" : "text-muted-foreground"}>
                                {field.value || "Select job title"}
                              </span>
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-full p-0" align="start">
                          <Command>
                            <CommandInput
                              value={jobTitleSearchQuery}
                              onValueChange={setJobTitleSearchQuery}
                              data-testid="input-job-title-search"
                            />
                            <CommandList className="max-h-[300px]">
                              <CommandEmpty>No job titles found.</CommandEmpty>
                              {filteredJobTitles.map((category) => (
                                <CommandGroup
                                  key={category.industry}
                                  heading={category.industry}
                                  className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-semibold"
                                >
                                  {category.titles.map((title) => (
                                    <CommandItem
                                      key={title}
                                      value={title}
                                      onSelect={() => {
                                        field.onChange(title);
                                        // Auto-fill the job industry based on selected job title
                                        const industry = getIndustryForJobTitle(title);
                                        form.setValue("jobIndustry", industry);
                                        setJobTitleDropdownOpen(false);
                                        setJobTitleSearchQuery("");
                                      }}
                                      className="cursor-pointer"
                                      data-testid={`job-title-option-${title}`}
                                    >
                                      {title}
                                    </CommandItem>
                                  ))}
                                </CommandGroup>
                              ))}
                              <CommandGroup heading="Other" className="[&_[cmdk-group-heading]]:text-sm [&_[cmdk-group-heading]]:font-semibold">
                                <CommandItem
                                  value="Other"
                                  onSelect={() => {
                                    field.onChange("Other");
                                    form.setValue("jobIndustry", "Other");
                                    setJobTitleDropdownOpen(false);
                                    setJobTitleSearchQuery("");
                                  }}
                                  className="cursor-pointer"
                                  data-testid="job-title-option-Other"
                                >
                                  Other (Custom Job Title)
                                </CommandItem>
                              </CommandGroup>
                            </CommandList>
                          </Command>
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="core.department"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Department *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-department" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Custom Job Title input (shown when "Other" is selected) */}
                {jobTitle === "Other" && (
                  <div className="md:col-span-2">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Custom Job Title *</FormLabel>
                          <FormControl>
                            <Input 
 
                              value={field.value === "Other" ? "" : field.value}
                              onChange={field.onChange}
                              data-testid="input-custom-job-title" 
                            />
                          </FormControl>
                          <FormDescription>
                            Please specify the job title for this position
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Row 2: Job Industry (read-only, auto-filled from Job Title), Employment Type */}
                <FormField
                  control={form.control}
                  name="jobIndustry"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Industry</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          readOnly 
                          disabled
                          className="bg-muted"
                          data-testid="input-job-industry-readonly"
                        />
                      </FormControl>
                      <FormDescription>
                        Auto-filled based on selected job title
                      </FormDescription>
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
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {EMPLOYMENT_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Row 3: Seniority Level, Work Arrangement */}
                <FormField
                  control={form.control}
                  name="core.seniority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seniority Level *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-seniority">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SENIORITY_LEVELS.map((level) => (
                            <SelectItem key={level} value={level}>{level}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="core.workArrangement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Arrangement *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-work-arrangement">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {WORK_ARRANGEMENTS.map((arr) => (
                            <SelectItem key={arr} value={arr}>{arr}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {workArrangement === "Hybrid" && (
                  <FormField
                    control={form.control}
                    name="core.hybridPercentOnsite"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>% On-site (Hybrid) *</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={100}
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                            data-testid="input-hybrid-percent"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </FormSection>

            {/* Responsibilities & Requirements */}
            <FormSection id="responsibilities" title="Responsibilities & Requirements" description="What the role entails and who we're looking for">
              <div className="space-y-6">
                {/* Key Responsibilities - Full Width */}
                <div>
                  <FormLabel>Key Responsibilities * (min 5)</FormLabel>
                  <div className="space-y-2 mt-2">
                    {respFields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          {...form.register(`core.responsibilities.${idx}`)}
                          data-testid={`input-responsibility-${idx}`}
                        />
                        <div className="flex gap-1">
                          {/* Move Up Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => respMove(idx, idx - 1)}
                            disabled={idx === 0}
                            aria-label="Move responsibility up"
                            data-testid={`button-move-up-responsibility-${idx}`}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          {/* Move Down Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => respMove(idx, idx + 1)}
                            disabled={idx === respFields.length - 1}
                            aria-label="Move responsibility down"
                            data-testid={`button-move-down-responsibility-${idx}`}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          {/* Remove Button */}
                          {idx > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => respRemove(idx)}
                              aria-label="Remove responsibility"
                              data-testid={`button-remove-responsibility-${idx}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      // @ts-expect-error - respAppend is typed to accept objects due to TS inference limitation, but actually accepts strings
                      onClick={() => respAppend("")}
                      size="sm"
                      data-testid="button-add-responsibility"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Responsibility
                    </Button>
                    {form.formState.errors.core?.responsibilities && (
                      <p className="text-sm text-destructive">{form.formState.errors.core.responsibilities.message}</p>
                    )}
                  </div>
                </div>

                {/* Required Skills - Full Width */}
                <div>
                  <FormLabel>Required Skills * (min 5)</FormLabel>
                  <Controller
                    control={form.control}
                    name="core.requiredSkills"
                    render={({ field }) => (
                      <SkillsMultiSelect
                        value={field.value || []}
                        onChange={field.onChange}
                        maxSkills={20}
                      />
                    )}
                  />
                  {form.formState.errors.core?.requiredSkills && (
                    <p className="text-sm text-destructive">{form.formState.errors.core.requiredSkills.message}</p>
                  )}
                  
                  {/* AI Skill Suggestions */}
                  {debouncedJobTitle && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                        <Sparkles className="h-3.5 w-3.5" />
                        <span>Suggested skills</span>
                      </div>
                      
                      {isLoadingSuggestions ? (
                        <div className="flex flex-wrap gap-2">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <div
                              key={i}
                              className="h-7 w-24 animate-pulse bg-muted rounded-md"
                              data-testid={`skeleton-suggestion-${i}`}
                            />
                          ))}
                        </div>
                      ) : suggestionsError ? (
                        <p className="text-sm text-muted-foreground" data-testid="text-suggestions-error">
                          Unable to load suggestions. Please try again.
                        </p>
                      ) : filteredSuggestions.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {filteredSuggestions.map((skill, index) => (
                            <Badge
                              key={skill}
                              variant="outline"
                              className="cursor-pointer hover-elevate active-elevate-2"
                              onClick={() => {
                                const currentSkills = form.getValues("core.requiredSkills") || [];
                                const skillNames = currentSkills.map(s => s.skill);
                                if (!skillNames.includes(skill) && currentSkills.length < 20) {
                                  form.setValue("core.requiredSkills", [
                                    ...currentSkills,
                                    { skill, level: "Intermediate" as const, priority: "Must-Have" as const }
                                  ]);
                                }
                              }}
                              data-testid={`button-suggested-skill-${index}`}
                            >
                              <Plus className="h-3 w-3 mr-1" />
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      ) : !isLoadingSuggestions && skillSuggestionsData && (skillSuggestionsData as { success: boolean; suggestions: string[] }).suggestions?.length === 0 ? (
                        <p className="text-sm text-muted-foreground" data-testid="text-no-suggestions">
                          No suggestions available for this role
                        </p>
                      ) : !isLoadingSuggestions && skillSuggestionsData && filteredSuggestions.length === 0 ? (
                        <p className="text-sm text-muted-foreground" data-testid="text-all-added">
                          All suggested skills have been added
                        </p>
                      ) : null}
                    </div>
                  )}
                </div>
              </div>
            </FormSection>

            {/* Job Summary */}
            <FormSection id="job-summary" title="Job Summary" description="Provide a compelling overview of this opportunity">
              <div className="space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <FormField
                    control={form.control}
                    name="core.summary"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Job Summary *</FormLabel>
                        <FormControl>
                          <Textarea
                            className="min-h-[100px]"
                            {...field}
                            data-testid="textarea-summary"
                          />
                        </FormControl>
                        <FormDescription>
                          Give candidates a compelling overview of this opportunity
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="pt-8">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setAIDialogOpen(true)}
                      className="whitespace-nowrap"
                      data-testid="button-ai-assistant"
                    >
                      <Sparkles className="h-4 w-4 mr-2" />
                      AI Assistant
                    </Button>
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Qualifications & Experience Required */}
            <FormSection id="qualifications" title="Qualifications & Experience Required" description="Specify the required qualifications and experience for this role">
              <div className="space-y-6">
                {/* Qualifications */}
                <div>
                  <FormLabel>Qualifications * (min 1)</FormLabel>
                  <div className="space-y-2 mt-2">
                    {qualFields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          placeholder="e.g., Bachelor's degree in Computer Science"
                          {...form.register(`core.qualifications.${idx}`)}
                          data-testid={`input-qualification-${idx}`}
                        />
                        <div className="flex gap-1">
                          {/* Move Up Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => qualMove(idx, idx - 1)}
                            disabled={idx === 0}
                            aria-label="Move qualification up"
                            data-testid={`button-move-up-qualification-${idx}`}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          {/* Move Down Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => qualMove(idx, idx + 1)}
                            disabled={idx === qualFields.length - 1}
                            aria-label="Move qualification down"
                            data-testid={`button-move-down-qualification-${idx}`}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          {/* Remove Button */}
                          {idx > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => qualRemove(idx)}
                              aria-label="Remove qualification"
                              data-testid={`button-remove-qualification-${idx}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      // @ts-expect-error - qualAppend is typed to accept objects due to TS inference limitation, but actually accepts strings
                      onClick={() => qualAppend("")}
                      size="sm"
                      data-testid="button-add-qualification"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Qualification
                    </Button>
                    {form.formState.errors.core?.qualifications && (
                      <p className="text-sm text-destructive">{form.formState.errors.core.qualifications.message}</p>
                    )}
                  </div>
                </div>

                {/* Experience */}
                <div>
                  <FormLabel>Experience Requirements * (min 1)</FormLabel>
                  <div className="space-y-2 mt-2">
                    {expFields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          placeholder="e.g., 3+ years in software development"
                          {...form.register(`core.experience.${idx}`)}
                          data-testid={`input-experience-${idx}`}
                        />
                        <div className="flex gap-1">
                          {/* Move Up Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => expMove(idx, idx - 1)}
                            disabled={idx === 0}
                            aria-label="Move experience requirement up"
                            data-testid={`button-move-up-experience-${idx}`}
                          >
                            <ArrowUp className="h-4 w-4" />
                          </Button>
                          {/* Move Down Button */}
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => expMove(idx, idx + 1)}
                            disabled={idx === expFields.length - 1}
                            aria-label="Move experience requirement down"
                            data-testid={`button-move-down-experience-${idx}`}
                          >
                            <ArrowDown className="h-4 w-4" />
                          </Button>
                          {/* Remove Button */}
                          {idx > 0 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              onClick={() => expRemove(idx)}
                              aria-label="Remove experience requirement"
                              data-testid={`button-remove-experience-${idx}`}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      // @ts-expect-error - expAppend is typed to accept objects due to TS inference limitation, but actually accepts strings
                      onClick={() => expAppend("")}
                      size="sm"
                      data-testid="button-add-experience"
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add Experience Requirement
                    </Button>
                    {form.formState.errors.core?.experience && (
                      <p className="text-sm text-destructive">{form.formState.errors.core.experience.message}</p>
                    )}
                  </div>
                </div>

                {/* Other Requirements */}
                <div className="pt-6 border-t space-y-6">
                  <div>
                    <h4 className="text-sm font-semibold mb-4">Other Requirements</h4>
                    
                    {/* Driver's License */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                      <FormField
                        control={form.control}
                        name="core.driversLicenseRequired"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Driver's License Required</FormLabel>
                            <Select onValueChange={field.onChange} value={field.value}>
                              <FormControl>
                                <SelectTrigger data-testid="select-drivers-license-required">
                                  <SelectValue placeholder="Select..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="Yes">Yes</SelectItem>
                                <SelectItem value="No">No</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {form.watch("core.driversLicenseRequired") === "Yes" && (
                        <FormField
                          control={form.control}
                          name="core.licenseCode"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>License Code</FormLabel>
                              <FormControl>
                                <Input 
                                  {...field} 
                                  placeholder="e.g., Code 08, Code 10, Code 14" 
                                  data-testid="input-license-code"
                                />
                              </FormControl>
                              <FormDescription className="text-xs">
                                e.g., Code 08, Code 10, Code 14
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </div>

                    {/* Languages Required */}
                    <FormField
                      control={form.control}
                      name="core.languagesRequired"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Languages Required</FormLabel>
                          <div className="space-y-2">
                            <Popover>
                              <PopoverTrigger asChild>
                                <FormControl>
                                  <Button
                                    variant="outline"
                                    role="combobox"
                                    className="w-full justify-between font-normal"
                                    data-testid="button-languages-required"
                                  >
                                    {field.value && field.value.length > 0
                                      ? `${field.value.length} language${field.value.length > 1 ? 's' : ''} selected`
                                      : "Select languages..."}
                                    <Plus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                  </Button>
                                </FormControl>
                              </PopoverTrigger>
                              <PopoverContent className="w-full p-0" align="start">
                                <Command>
                                  <CommandInput placeholder="Search languages..." />
                                  <CommandList>
                                    <CommandEmpty>No language found.</CommandEmpty>
                                    <CommandGroup>
                                      {SA_LANGUAGES.map((language) => (
                                        <CommandItem
                                          key={language}
                                          onSelect={() => {
                                            const current = field.value || [];
                                            const exists = current.find(l => l.language === language);
                                            if (!exists) {
                                              field.onChange([...current, { language, proficiency: "Intermediate" }]);
                                            }
                                          }}
                                          data-testid={`command-language-${language}`}
                                        >
                                          <Checkbox
                                            checked={field.value?.some(l => l.language === language) || false}
                                            className="mr-2"
                                          />
                                          {language}
                                        </CommandItem>
                                      ))}
                                    </CommandGroup>
                                  </CommandList>
                                </Command>
                              </PopoverContent>
                            </Popover>

                            {/* Display selected languages with proficiency dropdowns */}
                            {field.value && field.value.length > 0 && (
                              <div className="space-y-2 mt-2">
                                {field.value.map((lang, idx) => (
                                  <div key={lang.language} className="flex items-center gap-2 p-2 border rounded-md">
                                    <span className="flex-1 text-sm">{lang.language}</span>
                                    <Select
                                      value={lang.proficiency}
                                      onValueChange={(proficiency) => {
                                        const updated = [...(field.value || [])];
                                        updated[idx] = { ...updated[idx], proficiency: proficiency as "Basic" | "Intermediate" | "Expert" };
                                        field.onChange(updated);
                                      }}
                                    >
                                      <SelectTrigger className="w-[140px]" data-testid={`select-proficiency-${lang.language}`}>
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        {PROFICIENCY_LEVELS.map((level) => (
                                          <SelectItem key={level} value={level}>{level}</SelectItem>
                                        ))}
                                      </SelectContent>
                                    </Select>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      size="icon"
                                      onClick={() => {
                                        const updated = field.value?.filter((_, i) => i !== idx);
                                        field.onChange(updated);
                                      }}
                                      aria-label={`Remove ${lang.language}`}
                                      data-testid={`button-remove-language-${lang.language}`}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <FormDescription className="text-xs">
                            Select required languages and set proficiency levels
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              </div>
            </FormSection>

            {/* Compensation */}
            <FormSection id="compensation" title="Compensation & Perks" description="Salary range and additional benefits">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <FormField
                  control={form.control}
                  name="compensation.currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Currency</FormLabel>
                      <FormControl>
                        <Input {...field} defaultValue="ZAR" disabled data-testid="input-currency" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compensation.payType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pay Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-pay-type">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {PAY_TYPES.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {form.formState.errors.compensation && (
                <p className="text-sm text-destructive">{form.formState.errors.compensation.message}</p>
              )}

              {/* Cost to Company Section */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-px bg-border flex-1" />
                  <h3 className="text-sm font-medium text-muted-foreground">Cost to Company</h3>
                  <div className="h-px bg-border flex-1" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="compensation.min"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basic Salary - Minimum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-salary-min"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compensation.max"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Basic Salary - Maximum</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                            data-testid="input-salary-max"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <FormField
                    control={form.control}
                    name="compensation.commissionAvailable"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-commission-available"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Commission Available</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compensation.performanceBonus"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-performance-bonus"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Performance Bonus</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compensation.medicalAidContribution"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-medical-aid"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Medical Aid Contribution</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="compensation.pensionContribution"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-pension-contribution"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Pension/Provident Fund Contributions</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FormSection>

            {/* Application Details */}
            <FormSection id="application-details" title="Application Details" description="How candidates should apply">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="application.method"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Method *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-application-method">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="in-app">Apply via Sebenza Hub</SelectItem>
                          <SelectItem value="external">External Application URL</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {applicationMethod === "external" && (
                  <FormField
                    control={form.control}
                    name="application.externalUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>External URL *</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            data-testid="input-external-url"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                <FormField
                  control={form.control}
                  name="application.closingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date *</FormLabel>
                      <FormControl>
                        <Input type="date" min={todayISO()} {...field} data-testid="input-closing-date" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="companyDetails.contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="application.whatsappNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp Number</FormLabel>
                      <FormControl>
                        <Input 
                          type="tel" 
 
                          {...field} 
                          data-testid="input-whatsapp-number" 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional - for WhatsApp-first candidate communication
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="mt-6 border-t pt-6">
                <h4 className="text-sm font-medium mb-4">Competency Test</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="application.competencyTestRequired"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Pre-Screening Competency Test Required</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger data-testid="select-competency-test-required">
                              <SelectValue placeholder="Select..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Yes">Yes</SelectItem>
                            <SelectItem value="No">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="application.competencyTestReference"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Competency Test Reference</FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., TEST-ABC123"
                            data-testid="input-competency-test-reference"
                          />
                        </FormControl>
                        <FormDescription>
                          Enter the test reference number (e.g., TEST-ABC123)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FormSection>

            {/* Company & Compliance */}
            <FormSection id="compliance" title="Compliance & Contact" description="Legal requirements and contact information">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="compliance.rightToWork"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Right to Work Required *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-right-to-work">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {RIGHT_TO_WORK.map((right) => (
                            <SelectItem key={right} value={right}>{right}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="companyDetails.eeAa"
                render={({ field }) => (
                  <FormItem className="flex items-center space-x-2 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-ee-aa"
                      />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      This company is an Employment Equity / Affirmative Action employer
                    </FormLabel>
                  </FormItem>
                )}
              />

              <Separator className="my-4" />

              <div className="space-y-3">
                <p className="text-sm font-medium">Background Checks Required</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <FormField
                    control={form.control}
                    name="vetting.criminal"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Criminal</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vetting.credit"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Credit</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vetting.qualification"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">Qualification</FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="vetting.references"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">References</FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FormSection>

            {/* Admin & Status */}
            <FormSection id="admin-publishing" title="Admin & Publishing" description="Job visibility and status settings">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="admin.visibility"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Visibility *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-visibility">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JOB_VISIBILITY.map((vis) => (
                            <SelectItem key={vis} value={vis}>{vis}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admin.status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-status">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {JOB_STATUS.map((status) => (
                            <SelectItem key={status} value={status}>{status}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="admin.owner"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Job Owner *</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-owner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Closing Date */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="admin.closingDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Closing Date for Applications</FormLabel>
                      <FormControl>
                        <Input 
                          type="date" 
                          {...field} 
                          data-testid="input-admin-closing-date" 
                        />
                      </FormControl>
                      <FormDescription>
                        Optional deadline for candidates to apply
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormItem>
                  <FormLabel>Days Left</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      value={(() => {
                        const closingDateStr = form.watch("admin.closingDate");
                        if (!closingDateStr) return "N/A";
                        
                        // Parse the date string (YYYY-MM-DD) manually to avoid timezone issues
                        const [year, month, day] = closingDateStr.split('-').map(Number);
                        const closing = new Date(year, month - 1, day); // month is 0-indexed
                        
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        closing.setHours(0, 0, 0, 0);
                        
                        const diffTime = closing.getTime() - today.getTime();
                        const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
                        
                        if (diffDays < 0) return "Closed";
                        if (diffDays === 0) return "Today";
                        if (diffDays === 1) return "1 day";
                        return `${diffDays} days`;
                      })()}
                      readOnly
                      disabled
                      className="bg-muted"
                      data-testid="text-days-left" 
                    />
                  </FormControl>
                  <FormDescription>
                    Calculated automatically from closing date
                  </FormDescription>
                </FormItem>
              </div>

              {/* External Job Boards */}
              <div className="mt-6">
                <h4 className="text-sm font-medium mb-3">Post to External Job Boards</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="admin.externalJobBoards.linkedin"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-linkedin"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          LinkedIn
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admin.externalJobBoards.pnet"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-pnet"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Pnet
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admin.externalJobBoards.careerJunction"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-career-junction"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          CareerJunction
                        </FormLabel>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="admin.externalJobBoards.jobMail"
                    render={({ field }) => (
                      <FormItem className="flex items-center space-x-2 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                            data-testid="checkbox-job-mail"
                          />
                        </FormControl>
                        <FormLabel className="font-normal cursor-pointer">
                          Job Mail
                        </FormLabel>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </FormSection>

            {/* Legal Consents */}
            <FormSection id="legal-consents" title="Legal Consents" description="Required for Live jobs">
              <div className="space-y-3">
                <FormField
                  control={form.control}
                  name="compliance.popiaConsent"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-popia"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer">
                          I confirm that this job posting complies with POPIA (Protection of Personal Information Act) requirements *
                        </FormLabel>
                        <FormDescription>
                          Candidate data will be collected, stored, and processed in accordance with South African data protection laws.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compliance.checksConsent"
                  render={({ field }) => (
                    <FormItem className="flex items-start space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-checks"
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="font-normal cursor-pointer">
                          I acknowledge that candidates will be informed of all background checks and screening processes *
                        </FormLabel>
                        <FormDescription>
                          Transparency in hiring processes builds trust and complies with employment regulations.
                        </FormDescription>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>

              {form.formState.errors.compliance && (
                <p className="text-sm text-destructive">
                  Both consent boxes must be checked before publishing this job.
                </p>
              )}
            </FormSection>

            {/* Form Actions */}
            <div className="flex gap-4 justify-between sticky bottom-0 bg-background border-t pt-4 pb-2">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setPreviewDialogOpen(true)}
                  data-testid="button-preview-job"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleDownloadPDF}
                  disabled={isGeneratingPDF}
                  data-testid="button-download-pdf"
                >
                  <Download className="h-4 w-4 mr-2" />
                  {isGeneratingPDF ? "Generating..." : "Download PDF"}
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  disabled={createJobMutation.isPending}
                  data-testid="button-cancel-form"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createJobMutation.isPending}
                  data-testid="button-submit"
                >
                  {createJobMutation.isPending ? "Saving..." : "Save Job"}
                </Button>
              </div>
            </div>
              </form>
            </Form>
          </div>
        </div>

        {/* AI Job Description Dialog */}
        <JobDescriptionAIDialog
          open={aiDialogOpen}
          onOpenChange={setAIDialogOpen}
          jobContext={{
            jobTitle: form.watch("title"),
            companyName: form.watch("companyDetails.name"),
            industry: form.watch("companyDetails.industry"),
            jobIndustry: form.watch("jobIndustry"),
            seniorityLevel: form.watch("core.seniority"),
            employmentType: form.watch("employmentType"),
            workArrangement: form.watch("core.workArrangement"),
            responsibilities: form.watch("core.responsibilities"),
            requiredSkills: form.watch("core.requiredSkills"),
          }}
          onInsert={(description) => {
            form.setValue("core.summary", description);
          }}
        />

        {/* AI Company Description Dialog */}
        <CompanyDescriptionAIDialog
          open={companyDescriptionAIDialogOpen}
          onOpenChange={setCompanyDescriptionAIDialogOpen}
          companyWebsite={form.watch("companyDetails.website")}
          companyName={form.watch("companyDetails.name")}
          onInsert={(description) => {
            form.setValue("companyDetails.description", description);
          }}
        />

        {/* Preview Dialog */}
        <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh]">
            <DialogHeader>
              <DialogTitle>Job Posting Preview</DialogTitle>
            </DialogHeader>
            <ScrollArea className="h-[70vh]">
              <div 
                className="p-6"
                dangerouslySetInnerHTML={{ __html: generateJobPDFHTML(form.getValues()) }}
              />
            </ScrollArea>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Postings</h2>
          <p className="text-muted-foreground">Manage and create job listings</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowForm(true)} variant="outline" data-testid="button-create-job-manual">
            <Plus className="mr-2 h-4 w-4" />
            Create Job Manually
          </Button>
          <Button onClick={() => setShowImportDialog(true)} data-testid="button-import-job">
            <Upload className="mr-2 h-4 w-4" />
            Import Job Posting
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
            data-testid="input-search"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      ) : filteredJobs.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Briefcase className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No jobs found</p>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? "Try a different search term" : "Get started by creating your first job posting"}
            </p>
            {!searchTerm && (
              <Button onClick={() => setShowForm(true)} data-testid="button-create-first-job">
                <Plus className="mr-2 h-4 w-4" />
                Create Job
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} className="hover-elevate" data-testid={`card-job-${job.id}`}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-xl mb-2">{job.title}</CardTitle>
                    <CardDescription className="space-y-2">
                      <div className="flex flex-wrap gap-2 text-sm">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.company}
                        </span>
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {typeof job.location === 'string' ? job.location : (job.location as any)?.name || 'Location'}
                          </span>
                        )}
                        {job.salaryMin && job.salaryMax && (
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            R{job.salaryMin.toLocaleString()} - R{job.salaryMax.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {job.employmentType && <Badge variant="secondary">{job.employmentType}</Badge>}
                        {job.industry && <Badge variant="outline">{job.industry}</Badge>}
                        {job.referenceNumber && (
                          <Badge variant="outline" className="font-mono text-xs" data-testid={`job-reference-${job.id}`}>
                            {job.referenceNumber}
                          </Badge>
                        )}
                      </div>
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              {job.description && (
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                </CardContent>
              )}
              <CardFooter className="flex flex-wrap gap-2 justify-between border-t pt-4">
                <div className="flex gap-2">
                  {/* Status-based action button */}
                  {(() => {
                    const status = (job as any).admin?.status || "Draft";
                    
                    if (status === "Draft") {
                      return (
                        <Button
                          size="sm"
                          onClick={() => updateJobStatusMutation.mutate({ jobId: job.id, status: "Live" })}
                          disabled={updateJobStatusMutation.isPending}
                          data-testid={`button-publish-${job.id}`}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Publish
                        </Button>
                      );
                    }
                    
                    if (status === "Live") {
                      return (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateJobStatusMutation.mutate({ jobId: job.id, status: "Paused" })}
                          disabled={updateJobStatusMutation.isPending}
                          data-testid={`button-pause-${job.id}`}
                        >
                          <Pause className="mr-1 h-3 w-3" />
                          Pause
                        </Button>
                      );
                    }
                    
                    if (status === "Paused") {
                      return (
                        <Button
                          size="sm"
                          onClick={() => updateJobStatusMutation.mutate({ jobId: job.id, status: "Live" })}
                          disabled={updateJobStatusMutation.isPending}
                          data-testid={`button-resume-${job.id}`}
                        >
                          <Play className="mr-1 h-3 w-3" />
                          Resume
                        </Button>
                      );
                    }
                    
                    if (status === "Closed") {
                      return (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateJobStatusMutation.mutate({ jobId: job.id, status: "Live" })}
                          disabled={updateJobStatusMutation.isPending}
                          data-testid={`button-reopen-${job.id}`}
                        >
                          <Eye className="mr-1 h-3 w-3" />
                          Reopen
                        </Button>
                      );
                    }
                    
                    if (status === "Filled") {
                      return (
                        <Badge variant="default" className="gap-1" data-testid={`badge-filled-${job.id}`}>
                          <CheckCircle2 className="h-3 w-3" />
                          Filled
                        </Badge>
                      );
                    }
                    
                    return null;
                  })()}
                  
                  {/* Status badge */}
                  <Badge variant="outline" data-testid={`badge-status-${job.id}`}>
                    {(job as any).admin?.status || "Draft"}
                  </Badge>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleEditJob(job)}
                    data-testid={`button-edit-${job.id}`}
                  >
                    <Edit className="mr-1 h-3 w-3" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    className="text-destructive hover:text-destructive"
                    onClick={() => handleDeleteJob(job.id, job.title)}
                    disabled={deleteJobMutation.isPending}
                    data-testid={`button-delete-${job.id}`}
                  >
                    <Trash2 className="mr-1 h-3 w-3" />
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <ImportJobDialog
        open={showImportDialog}
        onOpenChange={setShowImportDialog}
        onJobImported={(jobData) => {
          // Populate form with imported data and show form
          // Preserve recruitingAgency from profile
          const mergedData = {
            ...jobData,
            companyDetails: {
              ...jobData.companyDetails,
              recruitingAgency: recruiterProfile?.agencyName || jobData.companyDetails?.recruitingAgency || "",
            },
          };
          form.reset(mergedData);
          setShowForm(true);
        }}
      />
    </div>
  );
}
