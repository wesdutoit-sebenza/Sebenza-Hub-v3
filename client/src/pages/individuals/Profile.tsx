import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { User, Briefcase, MapPin, Mail, Phone, Globe, Save, Edit } from "lucide-react";
import { type User as UserType } from "@shared/schema";
import { COUNTRY_CODES, DEFAULT_COUNTRY_CODE } from "@shared/countryCodes";

interface ProfileData {
  candidate: {
    id: string;
    fullName: string | null;
    headline: string | null;
    email: string | null;
    phone: string | null;
    city: string | null;
    country: string | null;
    links: any;
    summary: string | null;
    workAuthorization: string | null;
    availability: string | null;
    salaryExpectation: string | null;
  };
}

export default function IndividualProfile() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Parse existing phone to separate country code and number
  const parsePhoneNumber = (phone: string) => {
    if (!phone) return { code: DEFAULT_COUNTRY_CODE, number: "" };
    const match = phone.match(/^(\+\d+(?:-\d+)?)\s*(.*)$/);
    if (match) {
      return { code: match[1], number: match[2] };
    }
    return { code: DEFAULT_COUNTRY_CODE, number: phone };
  };

  const [countryCode, setCountryCode] = useState(DEFAULT_COUNTRY_CODE);
  const [phoneNumber, setPhoneNumber] = useState("");

  const { data: user } = useQuery<UserType>({
    queryKey: ['/api/me'],
    retry: false,
  });

  const { data, isLoading } = useQuery<{ profile: ProfileData | null }>({
    queryKey: ["/api/individuals/profile"],
    enabled: !!user,
  });

  const form = useForm({
    defaultValues: {
      fullName: "",
      headline: "",
      email: "",
      phone: "",
      city: "",
      country: "",
      summary: "",
      workAuthorization: "",
      availability: "",
      salaryExpectation: "",
      linkedin: "",
      github: "",
      portfolio: "",
    },
  });

  // Update form when data loads
  useEffect(() => {
    if (data?.profile) {
      const { candidate } = data.profile;
      
      // Parse phone number
      const parsedPhone = parsePhoneNumber(candidate.phone || "");
      setCountryCode(parsedPhone.code);
      setPhoneNumber(parsedPhone.number);
      
      form.reset({
        fullName: candidate.fullName || "",
        headline: candidate.headline || "",
        email: candidate.email || "",
        phone: candidate.phone || "",
        city: candidate.city || "",
        country: candidate.country || "",
        summary: candidate.summary || "",
        workAuthorization: candidate.workAuthorization || "",
        availability: candidate.availability || "",
        salaryExpectation: candidate.salaryExpectation || "",
        linkedin: candidate.links?.linkedin || "",
        github: candidate.links?.github || "",
        portfolio: candidate.links?.portfolio || "",
      });
    }
  }, [data?.profile, form]);

  const updateMutation = useMutation({
    mutationFn: async (values: any) => {
      // Remove leading 0 from phone number before combining with country code
      let cleanPhone = phoneNumber.trim();
      if (cleanPhone.startsWith("0")) {
        cleanPhone = cleanPhone.substring(1);
      }
      const fullPhone = cleanPhone ? `${countryCode} ${cleanPhone}` : "";
      
      return apiRequest("PUT", "/api/individuals/profile", {
        fullName: values.fullName,
        headline: values.headline,
        email: values.email,
        phone: fullPhone,
        city: values.city,
        country: values.country,
        summary: values.summary,
        workAuthorization: values.workAuthorization,
        availability: values.availability,
        salaryExpectation: values.salaryExpectation,
        links: {
          linkedin: values.linkedin || undefined,
          github: values.github || undefined,
          portfolio: values.portfolio || undefined,
        },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/individuals/profile"] });
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Update failed",
        description: error.message || "Failed to update profile. Please try again.",
      });
    },
  });

  const onSubmit = (values: any) => {
    updateMutation.mutate(values);
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Skeleton className="h-8 w-64 mb-6" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!data?.profile) {
    return (
      <div className="container mx-auto p-6 max-w-4xl">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">No profile found. Please complete your onboarding.</p>
            <Button onClick={() => navigate("/onboarding/individual")} className="mt-4" data-testid="button-onboarding">
              Complete Onboarding
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold" data-testid="text-profile-title">
            My Profile
          </h1>
          <p className="text-muted-foreground">View and manage your professional information</p>
        </div>
        <Button
          onClick={() => setIsEditing(!isEditing)}
          variant={isEditing ? "outline" : "default"}
          data-testid="button-edit-toggle"
        >
          <Edit className="h-4 w-4 mr-2" />
          {isEditing ? "Cancel" : "Edit Profile"}
        </Button>
      </div>

      {isEditing ? (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input {...field} data-testid="input-full-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="headline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Headline</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Senior Software Engineer"
                          data-testid="input-headline"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="summary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Professional Summary</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          placeholder="Brief overview of your professional background..."
                          rows={4}
                          data-testid="input-summary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" data-testid="input-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <div className="flex gap-2">
                      <Select value={countryCode} onValueChange={setCountryCode}>
                        <SelectTrigger className="w-[180px]" data-testid="select-country-code">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent className="max-h-[300px]">
                          {COUNTRY_CODES.map((cc) => (
                            <SelectItem key={cc.code} value={cc.dialCode}>
                              {cc.dialCode} {cc.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Input
                        type="tel"
                        placeholder="e.g. 082 123 4567"
                        data-testid="input-phone"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        className="flex-1"
                      />
                    </div>
                  </FormItem>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    name="country"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Country</FormLabel>
                        <FormControl>
                          <Input {...field} data-testid="input-country" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Links */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Professional Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="linkedin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>LinkedIn URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://linkedin.com/in/yourprofile"
                          data-testid="input-linkedin"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="github"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GitHub URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://github.com/yourusername"
                          data-testid="input-github"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="portfolio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Portfolio URL</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="https://yourportfolio.com"
                          data-testid="input-portfolio"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Work Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Briefcase className="h-5 w-5" />
                  Work Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="workAuthorization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Work Authorization</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. South African Citizen, Work Permit"
                          data-testid="input-work-auth"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="availability"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Availability</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. Immediate, 2 weeks notice"
                          data-testid="input-availability"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryExpectation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Salary Expectation</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="e.g. R500,000 - R600,000 per year"
                          data-testid="input-salary"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                data-testid="button-cancel-bottom"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                data-testid="button-save"
              >
                <Save className="h-4 w-4 mr-2" />
                {updateMutation.isPending ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      ) : (
        <div className="space-y-6">
          {/* View Mode - Display Profile Data */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Full Name</p>
                <p className="font-medium" data-testid="text-display-name">{data.profile.candidate.fullName || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Professional Headline</p>
                <p className="font-medium" data-testid="text-display-headline">{data.profile.candidate.headline || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Professional Summary</p>
                <p className="font-medium" data-testid="text-display-summary">{data.profile.candidate.summary || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium" data-testid="text-display-email">{data.profile.candidate.email || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Phone</p>
                  <p className="font-medium" data-testid="text-display-phone">{data.profile.candidate.phone || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">City</p>
                  <p className="font-medium" data-testid="text-display-city">{data.profile.candidate.city || "Not provided"}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Country</p>
                  <p className="font-medium" data-testid="text-display-country">{data.profile.candidate.country || "Not provided"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {(data.profile.candidate.links?.linkedin || data.profile.candidate.links?.github || data.profile.candidate.links?.portfolio) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Globe className="h-5 w-5" />
                  Professional Links
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {data.profile.candidate.links?.linkedin && (
                  <div>
                    <p className="text-sm text-muted-foreground">LinkedIn</p>
                    <a href={data.profile.candidate.links.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" data-testid="link-linkedin">
                      {data.profile.candidate.links.linkedin}
                    </a>
                  </div>
                )}
                {data.profile.candidate.links?.github && (
                  <div>
                    <p className="text-sm text-muted-foreground">GitHub</p>
                    <a href={data.profile.candidate.links.github} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" data-testid="link-github">
                      {data.profile.candidate.links.github}
                    </a>
                  </div>
                )}
                {data.profile.candidate.links?.portfolio && (
                  <div>
                    <p className="text-sm text-muted-foreground">Portfolio</p>
                    <a href={data.profile.candidate.links.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline" data-testid="link-portfolio">
                      {data.profile.candidate.links.portfolio}
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Work Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Work Authorization</p>
                <p className="font-medium" data-testid="text-display-work-auth">{data.profile.candidate.workAuthorization || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Availability</p>
                <p className="font-medium" data-testid="text-display-availability">{data.profile.candidate.availability || "Not provided"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Salary Expectation</p>
                <p className="font-medium" data-testid="text-display-salary">{data.profile.candidate.salaryExpectation || "Not provided"}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
