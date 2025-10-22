import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CVEducation } from "@shared/schema";

interface Props {
  data: any;
  updateData: (section: string, data: any) => void;
  onNext: () => void;
}

export default function EducationStep({ data, updateData, onNext }: Props) {
  const [education, setEducation] = useState<CVEducation[]>(
    data.education || []
  );

  const addEducation = () => {
    setEducation([
      ...education,
      {
        level: "",
        institution: "",
        period: "",
        location: "",
        details: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const updateEducation = (index: number, field: keyof CVEducation, value: string) => {
    const updated = [...education];
    updated[index] = { ...updated[index], [field]: value };
    setEducation(updated);
  };

  const handleContinue = () => {
    updateData("education", education);
    onNext();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4" data-testid="text-step-title">Education</h3>
      <p className="text-muted-foreground mb-6">
        Add your educational background, certifications, and qualifications
      </p>

      <div className="space-y-4 mb-6">
        {education.map((edu, index) => (
          <Card key={index} className="p-6" data-testid={`card-education-${index}`}>
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold">Education {index + 1}</h4>
              {education.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeEducation(index)}
                  data-testid={`button-remove-edu-${index}`}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Level *</label>
                <Input
                  placeholder="e.g. Tertiary Education, Secondary Education"
                  value={edu.level}
                  onChange={(e) => updateEducation(index, "level", e.target.value)}
                  data-testid={`input-level-${index}`}
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Institution *</label>
                <Input
                  placeholder="e.g. University of Pretoria"
                  value={edu.institution}
                  onChange={(e) => updateEducation(index, "institution", e.target.value)}
                  data-testid={`input-institution-${index}`}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Period *</label>
                  <Input
                    placeholder="e.g. 1998 - 2000"
                    value={edu.period}
                    onChange={(e) => updateEducation(index, "period", e.target.value)}
                    data-testid={`input-period-${index}`}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Location *</label>
                  <Input
                    placeholder="e.g. Pretoria, South Africa"
                    value={edu.location}
                    onChange={(e) => updateEducation(index, "location", e.target.value)}
                    data-testid={`input-location-${index}`}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Details</label>
                <Textarea
                  placeholder="e.g. B.Com - Human Resources Management (Undergraduate)"
                  value={edu.details}
                  onChange={(e) => updateEducation(index, "details", e.target.value)}
                  className="min-h-20"
                  data-testid={`textarea-details-${index}`}
                />
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addEducation} className="w-full mb-6" data-testid="button-add-education">
        <Plus size={16} className="mr-2" />
        Add Another Education Entry
      </Button>

      <Button onClick={handleContinue} className="w-full" data-testid="button-continue">
        Continue to About Me
      </Button>
    </div>
  );
}
