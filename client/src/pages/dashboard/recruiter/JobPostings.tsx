import { useState, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
import { Search, Plus, X, Briefcase, MapPin, DollarSign, Calendar, Building2, FileText, Sparkles } from "lucide-react";
import { type Job, insertJobSchema } from "@shared/schema";
import { JobDescriptionAIDialog } from "@/components/JobDescriptionAIDialog";
import {
  SA_PROVINCES,
  EMPLOYMENT_TYPES,
  SENIORITY_LEVELS,
  WORK_ARRANGEMENTS,
  PAY_TYPES,
  INDUSTRIES,
  COMMON_SKILLS,
  TOOLS_TECH,
  TRAVEL_REQUIREMENTS,
  SHIFT_PATTERNS,
  RIGHT_TO_WORK,
  JOB_STATUS,
  JOB_VISIBILITY,
  REQUIRED_ATTACHMENTS,
  OPTIONAL_ATTACHMENTS,
  COMMON_BENEFITS,
} from "@shared/jobTaxonomies";
import { JOB_TITLES, JOB_TITLES_BY_INDUSTRY, getIndustryForJobTitle } from "@shared/jobTitles";
import { CITIES_BY_PROVINCE, getLocationDataForCity } from "@shared/cities";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";
import { GoogleAddressSearch } from "@/components/GoogleAddressSearch";

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
function FormSection({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <Card className="mb-6">
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

export default function RecruiterJobPostings() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [citySearchQuery, setCitySearchQuery] = useState("");
  const [cityDropdownOpen, setCityDropdownOpen] = useState(false);
  const [jobTitleSearchQuery, setJobTitleSearchQuery] = useState("");
  const [jobTitleDropdownOpen, setJobTitleDropdownOpen] = useState(false);
  const [aiDialogOpen, setAIDialogOpen] = useState(false);

  const { data: jobsData, isLoading } = useQuery<{ success: boolean; count: number; jobs: Job[] }>({
    queryKey: ["/api/jobs"],
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
    resolver: zodResolver(insertJobSchema),
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
        minQualifications: "",
        yearsExperience: 0,
      },
      compensation: {
        displayRange: true,
        currency: "ZAR",
        payType: "Annual",
        ctc: true,
        commission: false,
        bonus: false,
      },
      application: {
        method: "in-app",
        closingDate: todayISO(),
      },
      companyDetails: {
        name: "",
        industry: "",
        recruitingAgency: "",
        eeAa: false,
        contactEmail: "",
      },
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
      },
    },
  });

  const {
    fields: respFields,
    append: respAppend,
    remove: respRemove,
  } = useFieldArray({ control: form.control, name: "core.responsibilities" });

  const workArrangement = form.watch("core.workArrangement");
  const applicationMethod = form.watch("application.method");
  const jobTitle = form.watch("title");

  const createJobMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Transform data to include legacy fields for backward compatibility
      const locationParts = [data.core?.location?.city, data.core?.location?.province].filter(Boolean);
      const transformedData = {
        ...data,
        company: data.companyDetails?.name || "", // Populate legacy company field
        location: locationParts.length > 0 ? locationParts.join(", ") : undefined,
        salaryMin: data.compensation?.min,
        salaryMax: data.compensation?.max,
        description: data.core?.summary,
        requirements: data.core?.minQualifications,
        employmentType: data.employmentType,
        industry: data.jobIndustry || "Other", // Map jobIndustry to legacy industry field
      };
      
      return apiRequest("POST", "/api/jobs", transformedData);
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

  const onSubmit = (data: FormData) => {
    createJobMutation.mutate(data);
  };

  if (showForm) {
    return (
      <div className="max-w-5xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" onClick={() => setShowForm(false)} data-testid="button-cancel">
            ← Back to Jobs
          </Button>
          <h1 className="text-3xl font-bold mt-4 mb-2">Create Job Posting</h1>
          <p className="text-muted-foreground">Complete job details for comprehensive candidate matching</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Company Information */}
            <FormSection title="Company Information" description="Recruiting agency and company details">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="companyDetails.recruitingAgency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Recruiting Agency</FormLabel>
                      <FormControl>
                        <Input placeholder="Agency name (if applicable)" {...field} data-testid="input-recruiting-agency" />
                      </FormControl>
                      <FormDescription>
                        Leave blank if hiring directly
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
                        <Input placeholder="Your Company Name" {...field} data-testid="input-company-name" />
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
                            <SelectValue placeholder="Select company industry" />
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
                              placeholder="Search cities..."
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
                          placeholder="Select a city to auto-fill"
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
                          placeholder="Select a city to auto-fill"
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
                        placeholder="Search for an address..."
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
            </FormSection>

            {/* Core Details */}
            <FormSection title="Core Details" description="Essential job information">
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
                              placeholder="Search job titles..."
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
                              <CommandGroup heading="Other">
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
                        <Input placeholder="e.g., Sales" {...field} data-testid="input-department" />
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
                              placeholder="Enter custom job title" 
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
                          placeholder="Select a job title to auto-fill"
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
                            placeholder="e.g., 40"
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
            <FormSection title="Responsibilities & Requirements" description="What the role entails and who we're looking for">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <FormLabel>Key Responsibilities * (min 5)</FormLabel>
                  <div className="space-y-2 mt-2">
                    {respFields.map((field, idx) => (
                      <div key={field.id} className="flex gap-2">
                        <Input
                          placeholder={`Responsibility ${idx + 1}`}
                          {...form.register(`core.responsibilities.${idx}`)}
                          data-testid={`input-responsibility-${idx}`}
                        />
                        {idx > 0 && (
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => respRemove(idx)}
                            data-testid={`button-remove-responsibility-${idx}`}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
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

                <div>
                  <FormLabel>Required Skills * (min 5)</FormLabel>
                  <Controller
                    control={form.control}
                    name="core.requiredSkills"
                    render={({ field }) => (
                      <MultiAdd
                        items={field.value || []}
                        onAdd={(v) => field.onChange([...(field.value || []), v])}
                        onRemove={(i) => field.onChange((field.value || []).filter((_, idx) => idx !== i))}
                        placeholder="Type a skill and press Add"
                        suggestions={COMMON_SKILLS}
                      />
                    )}
                  />
                  {form.formState.errors.core?.requiredSkills && (
                    <p className="text-sm text-destructive">{form.formState.errors.core.requiredSkills.message}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="core.minQualifications"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum Qualifications *</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Matric, Diploma" {...field} data-testid="input-qualifications" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="core.yearsExperience"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Years of Experience *</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={0}
                          max={50}
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                          data-testid="input-years-experience"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Job Summary */}
            <FormSection title="Job Summary" description="Provide a compelling overview of this opportunity">
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
                            placeholder="2–4 lines summarizing the role and what makes it exciting"
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

            {/* Compensation */}
            <FormSection title="Compensation & Perks" description="Salary range and additional benefits">
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

                <FormField
                  control={form.control}
                  name="compensation.min"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Minimum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 300000"
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
                      <FormLabel>Maximum</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="e.g., 420000"
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

              {form.formState.errors.compensation && (
                <p className="text-sm text-destructive">{form.formState.errors.compensation.message}</p>
              )}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <FormField
                  control={form.control}
                  name="compensation.ctc"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-ctc"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">CTC (Cost to Company)</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compensation.commission"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-commission"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Commission Available</FormLabel>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="compensation.bonus"
                  render={({ field }) => (
                    <FormItem className="flex items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          data-testid="checkbox-bonus"
                        />
                      </FormControl>
                      <FormLabel className="font-normal cursor-pointer">Performance Bonus</FormLabel>
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Application Details */}
            <FormSection title="Application Details" description="How candidates should apply">
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
                            placeholder="https://company.com/careers/apply"
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
                        <Input type="email" placeholder="hiring@company.com" {...field} data-testid="input-contact-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Company & Compliance */}
            <FormSection title="Compliance & Contact" description="Legal requirements and contact information">
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
            <FormSection title="Admin & Publishing" description="Job visibility and status settings">
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
                        <Input placeholder="Hiring manager name" {...field} data-testid="input-owner" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </FormSection>

            {/* Legal Consents */}
            <FormSection title="Legal Consents" description="Required before publishing">
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
            <div className="flex gap-4 justify-end sticky bottom-0 bg-background border-t pt-4 pb-2">
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
                {createJobMutation.isPending ? "Publishing..." : "Publish Job"}
              </Button>
            </div>
          </form>
        </Form>

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
          }}
          onInsert={(description) => {
            form.setValue("core.summary", description);
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Job Postings</h2>
          <p className="text-muted-foreground">Manage and create job listings</p>
        </div>
        <Button onClick={() => setShowForm(true)} data-testid="button-create-job">
          <Plus className="mr-2 h-4 w-4" />
          Create Job
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search jobs..."
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
                            {job.location}
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
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
