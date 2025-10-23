import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

const formSchema = z.object({
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
      sectors: [],
      proofUrl: "",
    },
  });

  const createRecruiterProfileMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const res = await apiRequest('POST', '/api/profile/recruiter', data);
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader>
          <CardTitle data-testid="text-onboarding-recruiter-title">Set Up Your Recruiter Profile</CardTitle>
          <CardDescription data-testid="text-onboarding-recruiter-description">
            Tell us about your recruiting expertise
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="sectors"
                render={() => (
                  <FormItem>
                    <div className="mb-4">
                      <FormLabel>Industry Sectors</FormLabel>
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
                    <FormLabel>LinkedIn Profile or Agency Website (optional)</FormLabel>
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

              <div className="p-4 bg-muted rounded-md">
                <p className="text-sm text-muted-foreground">
                  <strong>Note:</strong> Your recruiter profile will be reviewed by our team before being activated.
                  This typically takes 1-2 business days.
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
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
