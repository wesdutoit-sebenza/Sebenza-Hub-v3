import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Briefcase, Building2, UserCircle } from "lucide-react";

type UserRole = 'individual' | 'business' | 'recruiter';

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  const { data: userData, isLoading } = useQuery({
    queryKey: ['/api/me'],
  });

  const selectRoleMutation = useMutation({
    mutationFn: async (role: UserRole) => {
      const res = await apiRequest('POST', '/api/me/role', { role });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/me'] });
      if (selectedRole === 'individual') {
        setLocation('/onboarding/individual');
      } else if (selectedRole === 'business') {
        setLocation('/onboarding/business');
      } else if (selectedRole === 'recruiter') {
        setLocation('/onboarding/recruiter');
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to select role. Please try again.",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (userData?.user) {
      const roles = userData.user.roles || [];
      const onboarding = userData.user.onboardingComplete || {};

      if (roles.length > 0 && Object.keys(onboarding).some((key) => onboarding[key])) {
        setLocation('/');
      }
    }
  }, [userData, setLocation]);

  const handleSelectRole = (role: UserRole) => {
    setSelectedRole(role);
    selectRoleMutation.mutate(role);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" data-testid="text-onboarding-title">
            Welcome to Sebenza Hub
          </h1>
          <p className="text-muted-foreground" data-testid="text-onboarding-description">
            How will you use the platform?
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <Card className="hover-elevate cursor-pointer" onClick={() => handleSelectRole('individual')} data-testid="card-role-individual">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <UserCircle className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Find a Job</CardTitle>
              <CardDescription>
                I'm looking for employment opportunities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={selectRoleMutation.isPending}
                data-testid="button-select-individual"
              >
                {selectRoleMutation.isPending && selectedRole === 'individual' ? 'Setting up...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => handleSelectRole('business')} data-testid="card-role-business">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>Hire for My Company</CardTitle>
              <CardDescription>
                I need to find talent for my business
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={selectRoleMutation.isPending}
                data-testid="button-select-business"
              >
                {selectRoleMutation.isPending && selectedRole === 'business' ? 'Setting up...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>

          <Card className="hover-elevate cursor-pointer" onClick={() => handleSelectRole('recruiter')} data-testid="card-role-recruiter">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-primary" />
              </div>
              <CardTitle>I'm a Recruiter</CardTitle>
              <CardDescription>
                I run a recruiting agency or firm
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                className="w-full"
                disabled={selectRoleMutation.isPending}
                data-testid="button-select-recruiter"
              >
                {selectRoleMutation.isPending && selectedRole === 'recruiter' ? 'Setting up...' : 'Get Started'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
