import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cvPersonalInfoSchema, type CVPersonalInfo } from "@shared/schema";

interface Props {
  data: any;
  updateData: (section: string, data: any) => void;
  onNext: () => void;
}

export default function PersonalInfoStep({ data, updateData, onNext }: Props) {
  const form = useForm<CVPersonalInfo>({
    resolver: zodResolver(cvPersonalInfoSchema),
    defaultValues: data.personalInfo || {
      fullName: "",
      physicalAddress: "",
      contactPhone: "",
      contactEmail: "",
      legalName: "",
      age: undefined,
      gender: "",
      driversLicense: "",
    },
  });

  const onSubmit = (formData: CVPersonalInfo) => {
    updateData("personalInfo", formData);
    onNext();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4" data-testid="text-step-title">Personal Information</h3>
      <p className="text-muted-foreground mb-6">
        Let's start with your basic contact information
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Full Name *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. Wes du Toit" data-testid="input-full-name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address *</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="e.g. your.email@example.com"
                    data-testid="input-email"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone *</FormLabel>
                <FormControl>
                  <Input placeholder="e.g. 082 552 0536" data-testid="input-phone" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="physicalAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Physical Address</FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. 12 Blackrock, 221 Main Road, Cape Town"
                    data-testid="input-address"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="legalName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Legal Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Wesly John du Toit" data-testid="input-legal-name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="age"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="e.g. 46"
                      data-testid="input-age"
                      {...field}
                      onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Male" data-testid="input-gender" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="driversLicense"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Driver's License Code</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. EB" data-testid="input-license" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" data-testid="button-continue">
            Continue to Work Experience
          </Button>
        </form>
      </Form>
    </div>
  );
}
