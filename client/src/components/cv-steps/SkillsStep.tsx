import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Plus, Trash2 } from "lucide-react";
import type { CVSkills } from "@shared/schema";

interface Props {
  data: any;
  updateData: (section: string, data: any) => void;
  onNext: () => void;
}

export default function SkillsStep({ data, updateData, onNext }: Props) {
  const [skills, setSkills] = useState<CVSkills>(
    data.skills || {
      softSkills: [],
      technicalSkills: [],
      languages: [],
    }
  );

  const addSkillCategory = (type: "softSkills" | "technicalSkills") => {
    setSkills({
      ...skills,
      [type]: [...(skills[type] || []), { category: "", items: [""] }],
    });
  };

  const updateSkillCategory = (
    type: "softSkills" | "technicalSkills",
    index: number,
    field: "category" | "items",
    value: any
  ) => {
    const updated = { ...skills };
    updated[type]![index][field] = value;
    setSkills(updated);
  };

  const removeSkillCategory = (type: "softSkills" | "technicalSkills", index: number) => {
    const updated = { ...skills };
    updated[type] = updated[type]!.filter((_, i) => i !== index);
    setSkills(updated);
  };

  const handleContinue = () => {
    updateData("skills", skills);
    onNext();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4" data-testid="text-step-title">Skills</h3>
      <p className="text-muted-foreground mb-6">
        Highlight your soft skills, technical skills, and languages
      </p>

      <div className="space-y-6">
        <div>
          <h4 className="font-semibold mb-4">Soft Skills</h4>
          {skills.softSkills && skills.softSkills.length > 0 ? (
            skills.softSkills.map((skill, index) => (
              <Card key={index} className="p-4 mb-4" data-testid={`card-soft-skill-${index}`}>
                <div className="flex justify-between items-start mb-2">
                  <Input
                    placeholder="Category (e.g. Presentation Skills)"
                    value={skill.category}
                    onChange={(e) => updateSkillCategory("softSkills", index, "category", e.target.value)}
                    className="flex-1 mr-2"
                    data-testid={`input-soft-category-${index}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSkillCategory("softSkills", index)}
                    data-testid={`button-remove-soft-${index}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <Textarea
                  placeholder="List skills (one per line)"
                  value={skill.items.join("\n")}
                  onChange={(e) =>
                    updateSkillCategory("softSkills", index, "items", e.target.value.split("\n"))
                  }
                  className="min-h-20"
                  data-testid={`textarea-soft-${index}`}
                />
              </Card>
            ))
          ) : null}
          <Button
            variant="outline"
            onClick={() => addSkillCategory("softSkills")}
            className="w-full"
            data-testid="button-add-soft-skill"
          >
            <Plus size={16} className="mr-2" />
            Add Soft Skill Category
          </Button>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Technical Skills</h4>
          {skills.technicalSkills && skills.technicalSkills.length > 0 ? (
            skills.technicalSkills.map((skill, index) => (
              <Card key={index} className="p-4 mb-4" data-testid={`card-tech-skill-${index}`}>
                <div className="flex justify-between items-start mb-2">
                  <Input
                    placeholder="Category (e.g. Software Proficiency)"
                    value={skill.category}
                    onChange={(e) => updateSkillCategory("technicalSkills", index, "category", e.target.value)}
                    className="flex-1 mr-2"
                    data-testid={`input-tech-category-${index}`}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => removeSkillCategory("technicalSkills", index)}
                    data-testid={`button-remove-tech-${index}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <Textarea
                  placeholder="List skills (one per line)"
                  value={skill.items.join("\n")}
                  onChange={(e) =>
                    updateSkillCategory("technicalSkills", index, "items", e.target.value.split("\n"))
                  }
                  className="min-h-20"
                  data-testid={`textarea-tech-${index}`}
                />
              </Card>
            ))
          ) : null}
          <Button
            variant="outline"
            onClick={() => addSkillCategory("technicalSkills")}
            className="w-full"
            data-testid="button-add-tech-skill"
          >
            <Plus size={16} className="mr-2" />
            Add Technical Skill Category
          </Button>
        </div>

        <div>
          <h4 className="font-semibold mb-4">Languages</h4>
          <Textarea
            placeholder="List languages you speak (one per line, e.g. English, Afrikaans, French)"
            value={(skills.languages || []).join("\n")}
            onChange={(e) => setSkills({ ...skills, languages: e.target.value.split("\n").filter(l => l.trim()) })}
            className="min-h-20"
            data-testid="textarea-languages"
          />
        </div>
      </div>

      <Button onClick={handleContinue} className="w-full mt-6" data-testid="button-continue">
        Continue to Education
      </Button>
    </div>
  );
}
