import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { COUNTRY_CODES } from "@shared/countryCodes";

const formSchema = z.object({
  agencyName: z.string().min(2, "Agency name must be at least 2 characters"),
  website: z.string().url("Invalid URL").or(z.literal("")),
  email: z.string().email("Invalid email address"),
  telephoneCountryCode: z.string().min(1, "Country code required"),
  telephoneNumber: z.string().min(7, "Invalid phone number"),
  sectors: z.array(z.string()).min(1, "Please select at least one industry sector"),
  proofUrl: z.string().url("Invalid URL").or(z.literal("")),
});

type FormData = z.infer<typeof formSchema>;

const SECTORS = [
  "Technology",
  "Finance",
  "Healthcare",
  "Education",
  "Retail",
  "Manufacturing",
  "Construction",
  "Hospitality",
  "Legal",
  "Engineering",
  "Marketing",
  "Sales",
];

export default function OnboardingRecruiter() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      agencyName: "",
      website: "",
      email: "",
      telephoneCountryCode: "+27",
      telephoneNumber: "",
      sectors: [],
      proofUrl: "",
    },
  });

  const createRecruiterProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Combine country code and phone number, remove leading 0
      const phoneNumber = data.telephoneNumber.replace(/^0+/, '');
      const fullTelephone = `${data.telephoneCountryCode} ${phoneNumber}`;
      
      const payload = {
        agencyName: data.agencyName,
        website: data.website || undefined,
        email: data.email,
        telephone: fullTelephone,
        sectors: data.sectors,
        proofUrl: data.proofUrl || undefined,
      };
      
      const res = await apiRequest('POST', '/api/profile/recruiter', payload);
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Recruiter profile created!",
        description: "Your profile is pending verification.",
      });
      setLocation("/");
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create recruiter profile",
        variant: "destructive",
      });
      setIsSubmitting(false);
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    createRecruiterProfileMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle className="text-white-brand" data-testid="text-onboarding-recruiter-title">Set Up Your Recruiter Profile</CardTitle>
          <CardDescription className="text-slate" data-testid="text-onboarding-recruiter-description">
            Tell us about your recruiting agency
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="agencyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agency Name *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., Talent Solutions SA" 
                        {...field} 
                        data-testid="input-agency-name" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="website"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Website (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://www.youragency.co.za" 
                        type="url"
                        {...field} 
                        data-testid="input-website" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="contact@youragency.co.za" 
                        type="email"
                        {...field} 
                        data-testid="input-email" 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="telephoneCountryCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Country Code *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-country-code">
                            <SelectValue placeholder="Code" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {COUNTRY_CODES.map((item: { code: string; country: string; dialCode: string }) => (
                            <SelectItem key={item.code} value={item.dialCode}>
                              {item.dialCode} {item.country}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="md:col-span-2">
                  <FormField
                    control={form.control}
                    name="telephoneNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telephone Number *</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="82 123 4567" 
                            {...field} 
                            data-testid="input-telephone" 
                          />
                        </FormControl>
                        <FormDescription>
                          Leading 0 will be removed automatically
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="sectors"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Industry Sectors *</FormLabel>
                      <FormDescription>
                        Select all industries you recruit for
                      </FormDescription>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {SECTORS.map((sector) => (
                        <FormField
                          key={sector}
                          control={form.control}
                          name="sectors"
                          render={({ field }) => {
                            return (
                              <FormItem
                                key={sector}
                                className="flex flex-row items-start space-x-3 space-y-0"
                              >
                                <FormControl>
                                  <Checkbox
                                    data-testid={`checkbox-sector-${sector.toLowerCase()}`}
                                    checked={field.value?.includes(sector)}
                                    onCheckedChange={(checked) => {
                                      return checked
                                        ? field.onChange([...field.value, sector])
                                        : field.onChange(
                                            field.value?.filter(
                                              (value) => value !== sector
                                            )
                                          );
                                    }}
                                  />
                                </FormControl>
                                <FormLabel className="font-normal">
                                  {sector}
                                </FormLabel>
                              </FormItem>
                            );
                          }}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="proofUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>LinkedIn Profile or Company Page (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://linkedin.com/in/yourprofile" 
                        type="url"
                        {...field} 
                        data-testid="input-proof-url" 
                      />
                    </FormControl>
                    <FormDescription>
                      Help us verify your recruiting credentials faster
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="p-4 bg-amber/10 rounded-md border border-amber/20">
                <p className="text-sm text-slate">
                  <strong className="text-amber">Note:</strong> Your recruiter profile will be reviewed by our team before being activated.
                  This typically takes 1-2 business days.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-amber-gradient text-charcoal hover:opacity-90" 
                disabled={isSubmitting}
                data-testid="button-create-recruiter-profile"
              >
                {isSubmitting ? "Submitting..." : "Submit for Verification"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
