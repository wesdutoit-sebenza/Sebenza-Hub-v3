import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, FileText } from "lucide-react";
import PersonalInfoStep from "./cv-steps/PersonalInfoStep";
import WorkExperienceStep from "./cv-steps/WorkExperienceStep";
import SkillsStep from "./cv-steps/SkillsStep";
import EducationStep from "./cv-steps/EducationStep";
import AboutMeStep from "./cv-steps/AboutMeStep";
import CVPreview from "./CVPreview";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { InsertCV, CVPersonalInfo, CVWorkExperience, CVSkills, CVEducation } from "@shared/schema";

const steps = [
  { id: 1, name: "Personal Info", component: PersonalInfoStep },
  { id: 2, name: "Work Experience", component: WorkExperienceStep },
  { id: 3, name: "Skills", component: SkillsStep },
  { id: 4, name: "Education", component: EducationStep },
  { id: 5, name: "About Me", component: AboutMeStep },
  { id: 6, name: "Preview", component: CVPreview },
];

export default function CVBuilder({ onComplete }: { onComplete?: () => void }) {
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [cvData, setCvData] = useState<Partial<InsertCV>>({
    personalInfo: {} as CVPersonalInfo,
    workExperience: [] as CVWorkExperience[],
    skills: {} as CVSkills,
    education: [] as CVEducation[],
    aboutMe: "",
  });

  const mutation = useMutation({
    mutationFn: async (data: InsertCV) => {
      const response = await apiRequest("POST", "/api/cvs", data);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success!",
        description: "Your CV has been created successfully!",
      });
      if (onComplete) {
        onComplete();
      }
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save CV. Please try again.",
        variant: "destructive",
      });
    },
  });

  const updateCVData = (section: keyof InsertCV, data: any) => {
    setCvData((prev) => ({
      ...prev,
      [section]: data,
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveCV = () => {
    mutation.mutate(cvData as InsertCV);
  };

  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;
  const CurrentStepComponent = steps[currentStep - 1].component;

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <FileText className="text-amber" size={28} />
              <h2 className="text-2xl font-serif font-semibold" data-testid="text-cv-builder-title">
                Create Your CV
              </h2>
            </div>
            <span className="text-sm text-muted-foreground" data-testid="text-step-indicator">
              Step {currentStep} of {steps.length}
            </span>
          </div>
          <Progress value={progress} className="h-2" data-testid="progress-cv-builder" />
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <button
                key={step.id}
                onClick={() => setCurrentStep(step.id)}
                className={`text-xs ${
                  step.id === currentStep
                    ? "text-foreground font-semibold"
                    : step.id < currentStep
                    ? "text-muted-foreground"
                    : "text-muted-foreground/50"
                }`}
                data-testid={`button-step-${step.id}`}
              >
                {step.name}
              </button>
            ))}
          </div>
        </div>

        <div className="min-h-[400px]">
          <CurrentStepComponent
            data={cvData}
            updateData={updateCVData}
            onNext={nextStep}
          />
        </div>

        <div className="flex justify-between mt-8 pt-6 border-t">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1}
            data-testid="button-prev-step"
          >
            <ChevronLeft size={16} className="mr-2" />
            Previous
          </Button>

          {currentStep < steps.length ? (
            <Button onClick={nextStep} data-testid="button-next-step">
              Next
              <ChevronRight size={16} className="ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSaveCV}
              disabled={mutation.isPending}
              data-testid="button-save-cv"
            >
              {mutation.isPending ? "Saving..." : "Save CV"}
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
}
