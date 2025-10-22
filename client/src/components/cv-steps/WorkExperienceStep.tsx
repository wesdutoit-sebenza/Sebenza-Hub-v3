import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CVWorkExperience, CVReference } from "@shared/schema";

interface Props {
  data: any;
  updateData: (section: string, data: any) => void;
  onNext: () => void;
}

export default function WorkExperienceStep({ data, updateData, onNext }: Props) {
  const [experiences, setExperiences] = useState<CVWorkExperience[]>(
    data.workExperience || []
  );

  const addExperience = () => {
    setExperiences([
      ...experiences,
      {
        period: "",
        company: "",
        position: "",
        type: "",
        industry: "",
        clientele: "",
        responsibilities: [{ title: "", items: [""] }],
        references: [],
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperiences(experiences.filter((_, i) => i !== index));
  };

  const updateExperience = (index: number, field: keyof CVWorkExperience, value: any) => {
    const updated = [...experiences];
    updated[index] = { ...updated[index], [field]: value };
    setExperiences(updated);
  };

  const addResponsibility = (expIndex: number) => {
    const updated = [...experiences];
    updated[expIndex].responsibilities.push({ title: "", items: [""] });
    setExperiences(updated);
  };

  const updateResponsibility = (
    expIndex: number,
    respIndex: number,
    field: "title" | "items",
    value: any
  ) => {
    const updated = [...experiences];
    updated[expIndex].responsibilities[respIndex][field] = value;
    setExperiences(updated);
  };

  const addReference = (expIndex: number) => {
    const updated = [...experiences];
    if (!updated[expIndex].references) {
      updated[expIndex].references = [];
    }
    updated[expIndex].references!.push({ name: "", title: "", phone: "", email: "" });
    setExperiences(updated);
  };

  const updateReference = (expIndex: number, refIndex: number, field: keyof CVReference, value: string) => {
    const updated = [...experiences];
    updated[expIndex].references![refIndex][field] = value;
    setExperiences(updated);
  };

  const handleContinue = () => {
    updateData("workExperience", experiences);
    onNext();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4" data-testid="text-step-title">Work Experience</h3>
      <p className="text-muted-foreground mb-6">
        Add your work history, starting with your most recent position
      </p>

      <div className="space-y-6 mb-6">
        {experiences.map((exp, expIndex) => (
          <Card key={expIndex} className="p-6" data-testid={`card-experience-${expIndex}`}>
            <div className="flex justify-between items-start mb-4">
              <h4 className="font-semibold">Position {expIndex + 1}</h4>
              {experiences.length > 1 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeExperience(expIndex)}
                  data-testid={`button-remove-exp-${expIndex}`}
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Period *</label>
                <Input
                  placeholder="e.g. 2001 - 2012 (12 Years)"
                  value={exp.period}
                  onChange={(e) => updateExperience(expIndex, "period", e.target.value)}
                  data-testid={`input-period-${expIndex}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Company *</label>
                <Input
                  placeholder="e.g. TechCorp SA"
                  value={exp.company}
                  onChange={(e) => updateExperience(expIndex, "company", e.target.value)}
                  data-testid={`input-company-${expIndex}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Position *</label>
                <Input
                  placeholder="e.g. Director"
                  value={exp.position}
                  onChange={(e) => updateExperience(expIndex, "position", e.target.value)}
                  data-testid={`input-position-${expIndex}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Type *</label>
                <Input
                  placeholder="e.g. Full Time Employment"
                  value={exp.type}
                  onChange={(e) => updateExperience(expIndex, "type", e.target.value)}
                  data-testid={`input-type-${expIndex}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Industry *</label>
                <Input
                  placeholder="e.g. Information Technology"
                  value={exp.industry}
                  onChange={(e) => updateExperience(expIndex, "industry", e.target.value)}
                  data-testid={`input-industry-${expIndex}`}
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Clientele</label>
                <Input
                  placeholder="e.g. Audit Firms, Corporates"
                  value={exp.clientele}
                  onChange={(e) => updateExperience(expIndex, "clientele", e.target.value)}
                  data-testid={`input-clientele-${expIndex}`}
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-sm font-medium mb-2 block">Responsibilities</label>
              {exp.responsibilities.map((resp, respIndex) => (
                <div key={respIndex} className="mb-4 border-l-2 border-amber pl-4">
                  <Input
                    placeholder="Responsibility title (optional)"
                    value={resp.title}
                    onChange={(e) => updateResponsibility(expIndex, respIndex, "title", e.target.value)}
                    className="mb-2"
                    data-testid={`input-resp-title-${expIndex}-${respIndex}`}
                  />
                  <Textarea
                    placeholder="List responsibilities (one per line)"
                    value={resp.items.join("\n")}
                    onChange={(e) =>
                      updateResponsibility(expIndex, respIndex, "items", e.target.value.split("\n"))
                    }
                    className="min-h-24"
                    data-testid={`textarea-resp-${expIndex}-${respIndex}`}
                  />
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addResponsibility(expIndex)}
                data-testid={`button-add-resp-${expIndex}`}
              >
                <Plus size={16} className="mr-2" />
                Add Responsibility Section
              </Button>
            </div>

            {exp.references && exp.references.length > 0 && (
              <div className="mt-4">
                <label className="text-sm font-medium mb-2 block">References</label>
                {exp.references.map((ref, refIndex) => (
                  <div key={refIndex} className="grid grid-cols-2 gap-2 mb-2">
                    <Input
                      placeholder="Name"
                      value={ref.name}
                      onChange={(e) => updateReference(expIndex, refIndex, "name", e.target.value)}
                      data-testid={`input-ref-name-${expIndex}-${refIndex}`}
                    />
                    <Input
                      placeholder="Title"
                      value={ref.title}
                      onChange={(e) => updateReference(expIndex, refIndex, "title", e.target.value)}
                      data-testid={`input-ref-title-${expIndex}-${refIndex}`}
                    />
                    <Input
                      placeholder="Phone"
                      value={ref.phone}
                      onChange={(e) => updateReference(expIndex, refIndex, "phone", e.target.value)}
                      data-testid={`input-ref-phone-${expIndex}-${refIndex}`}
                    />
                    <Input
                      placeholder="Email"
                      value={ref.email}
                      onChange={(e) => updateReference(expIndex, refIndex, "email", e.target.value)}
                      data-testid={`input-ref-email-${expIndex}-${refIndex}`}
                    />
                  </div>
                ))}
              </div>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => addReference(expIndex)}
              className="mt-2"
              data-testid={`button-add-ref-${expIndex}`}
            >
              <Plus size={16} className="mr-2" />
              Add Reference
            </Button>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addExperience} className="w-full mb-6" data-testid="button-add-experience">
        <Plus size={16} className="mr-2" />
        Add Another Position
      </Button>

      <Button onClick={handleContinue} className="w-full" data-testid="button-continue">
        Continue to Skills
      </Button>
    </div>
  );
}
