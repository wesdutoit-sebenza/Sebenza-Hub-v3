import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { JOB_TITLES } from "@shared/jobTitles";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  province: z.string().min(1, "Please select a province"),
  city: z.string().min(1, "City is required"),
  jobTitle: z.string().min(1, "Please select a job title"),
  customJobTitle: z.string().optional(),
  experienceLevel: z.enum(['entry', 'intermediate', 'senior', 'executive']),
  skills: z.string().min(1, "Please add at least one skill"),
  isPublic: z.boolean().default(true),
  dataConsent: z.boolean().refine((val) => val === true, {
    message: "You must agree to the data collection policy (POPIA compliance)",
  }),
}).refine((data) => {
  if (data.jobTitle === "Other" && !data.customJobTitle) {
    return false;
  }
  return true;
}, {
  message: "Please specify your job title",
  path: ["customJobTitle"],
});

type FormData = z.infer<typeof formSchema>;

export default function OnboardingIndividual() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      province: "",
      city: "",
      jobTitle: "",
      customJobTitle: "",
      experienceLevel: "entry",
      skills: "",
      isPublic: true,
      dataConsent: false,
    },
  });

  const selectedJobTitle = form.watch("jobTitle");

  const createProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const skills = data.skills.split(',').map(s => s.trim()).filter(Boolean);
      const fullName = `${data.firstName} ${data.surname}`;
      const finalJobTitle = data.jobTitle === "Other" ? data.customJobTitle || "" : data.jobTitle;
      
      const res = await apiRequest('POST', '/api/profile/candidate', {
        fullName,
        province: data.province,
        city: data.city,
        jobTitle: finalJobTitle,
        experienceLevel: data.experienceLevel,
        skills,
        isPublic: data.isPublic ? 1 : 0,
        popiaConsentGiven: data.dataConsent ? 1 : 0,
      });
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Profile created!",
        description: "Your job seeker profile is ready.",
      });
      setLocation('/individuals');
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createProfileMutation.mutate(data);
  };

  const provinces = ["Eastern Cape", "Free State", "Gauteng", "KwaZulu-Natal", "Limpopo", "Mpumalanga", "Northern Cape", "North West", "Western Cape"];

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle data-testid="text-onboarding-individual-title">Set Up Your Job Seeker Profile</CardTitle>
          <CardDescription className="text-slate" data-testid="text-onboarding-individual-description">
            Tell us about yourself so employers can find you
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-first-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="surname"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Surname</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-surname" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-province">
                            <SelectValue placeholder="Select province" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {provinces.map((province) => (
                            <SelectItem key={province} value={province}>
                              {province}
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
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>City</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-city" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title / Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-job-title">
                          <SelectValue placeholder="Select your job title" />
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

              {selectedJobTitle === "Other" && (
                <FormField
                  control={form.control}
                  name="customJobTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specify Job Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Enter your job title" data-testid="input-custom-job-title" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              <FormField
                control={form.control}
                name="experienceLevel"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Experience Level</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-experience-level">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                        <SelectItem value="intermediate">Intermediate (3-5 years)</SelectItem>
                        <SelectItem value="senior">Senior (6+ years)</SelectItem>
                        <SelectItem value="executive">Executive / Leadership</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skills"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skills</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g., Customer Service, Excel, Communication (comma-separated)" data-testid="input-skills" />
                    </FormControl>
                    <FormDescription>
                      Enter your key skills separated by commas
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="isPublic"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-is-public"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Make my profile visible to employers
                      </FormLabel>
                      <FormDescription>
                        Recruiters and employers can find and contact you
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataConsent"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                        data-testid="checkbox-data-consent"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        I agree to the collection of my personal data
                      </FormLabel>
                      <FormDescription>
                        Required for POPIA (Protection of Personal Information Act) compliance. We will store and use your data only to connect you with job opportunities.
                      </FormDescription>
                      <FormMessage />
                    </div>
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-amber-gradient text-charcoal hover:opacity-90"
                disabled={createProfileMutation.isPending}
                data-testid="button-complete-onboarding"
              >
                {createProfileMutation.isPending ? "Creating profile..." : "Complete Setup"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
