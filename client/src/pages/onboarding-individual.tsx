import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { JOB_TITLES } from "@shared/jobTitles";
import { SkillsMultiSelect } from "@/components/SkillsMultiSelect";
import { COUNTRIES, DEFAULT_COUNTRY } from "@shared/countries";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "@shared/countryCodes";
import { useEffect } from "react";
import type { User } from "@shared/schema";

const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  surname: z.string().min(2, "Surname must be at least 2 characters"),
  province: z.string().min(1, "Please select a province"),
  postalCode: z.string().optional(),
  city: z.string().min(1, "City is required"),
  country: z.string().min(1, "Please select a country"),
  email: z.string().email("Valid email is required").optional(),
  countryCode: z.string().default(DEFAULT_COUNTRY_CODE),
  telephone: z.string().optional(),
  jobTitle: z.string().min(1, "Please select a job title"),
  customJobTitle: z.string().optional(),
  experienceLevel: z.enum(['entry', 'intermediate', 'senior', 'executive']),
  skills: z.array(z.string()).min(1, "Please select at least one skill").max(10, "Maximum 10 skills allowed"),
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

  const { data: user } = useQuery<User>({
    queryKey: ['/api/auth/user'],
    retry: false,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      surname: "",
      province: "",
      postalCode: "",
      city: "",
      country: DEFAULT_COUNTRY,
      email: "",
      countryCode: DEFAULT_COUNTRY_CODE,
      telephone: "",
      jobTitle: "",
      customJobTitle: "",
      experienceLevel: "entry",
      skills: [],
      isPublic: true,
      dataConsent: false,
    },
  });

  // Pre-populate email with user's authentication email
  useEffect(() => {
    if (user?.email) {
      form.setValue("email", user.email);
    }
  }, [user?.email, form]);

  const selectedJobTitle = form.watch("jobTitle");
  const selectedCountry = form.watch("country");

  const createProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const fullName = `${data.firstName} ${data.surname}`;
      const finalJobTitle = data.jobTitle === "Other" ? data.customJobTitle || "" : data.jobTitle;
      
      // Remove leading 0 from telephone number before combining with country code
      let phoneNumber = data.telephone ? data.telephone.trim() : "";
      if (phoneNumber.startsWith("0")) {
        phoneNumber = phoneNumber.substring(1);
      }
      const fullTelephone = phoneNumber ? `${data.countryCode} ${phoneNumber}` : "";
      
      const res = await apiRequest('POST', '/api/profile/candidate', {
        fullName,
        province: data.province,
        postalCode: data.postalCode,
        city: data.city,
        country: data.country,
        email: data.email,
        telephone: fullTelephone,
        jobTitle: finalJobTitle,
        experienceLevel: data.experienceLevel,
        skills: data.skills,
        isPublic: data.isPublic ? 1 : 0,
        popiaConsentGiven: data.dataConsent ? 1 : 0,
      });
      return res.json();
    },
    onSuccess: () => {
      // Invalidate user cache to refresh role and onboarding status
      queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
      
      toast({
        title: "Profile created!",
        description: "Your job seeker profile is ready.",
      });
      setLocation('/dashboard/individual/profile');
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
      <Card className="max-w-4xl w-full">
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

                <FormField
                  control={form.control}
                  name="province"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Province / State</FormLabel>
                      {selectedCountry === "South Africa" ? (
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
                      ) : (
                        <FormControl>
                          <Input {...field} placeholder="Enter province or state" data-testid="input-province" />
                        </FormControl>
                      )}
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="postalCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Postal Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g., 2000" data-testid="input-postal-code" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="country"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-country">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[300px]">
                          {COUNTRIES.map((country) => (
                            <SelectItem key={country} value={country}>
                              {country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="e.g., your.email@example.com" data-testid="input-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormItem>
                  <FormLabel>Telephone</FormLabel>
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
                      name="telephone"
                      render={({ field }) => (
                        <FormItem className="flex-1">
                          <FormControl>
                            <Input {...field} type="tel" placeholder="e.g., 082 123 4567" data-testid="input-telephone" />
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
                      <SkillsMultiSelect
                        value={field.value}
                        onChange={field.onChange}
                        maxSkills={10}
                        placeholder="Select your skills..."
                      />
                    </FormControl>
                    <FormDescription>
                      Select up to 10 skills from the list
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
