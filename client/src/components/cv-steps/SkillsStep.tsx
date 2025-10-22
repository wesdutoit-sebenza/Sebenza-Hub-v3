import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Plus, Trash2 } from "lucide-react";
import { z } from "zod";
import { cvSkillsSchema } from "@shared/schema";

const skillsFormSchema = z.object({
  skills: cvSkillsSchema,
});

type SkillsForm = z.infer<typeof skillsFormSchema>;

interface Props {
  data: any;
  updateData: (section: string, data: any) => void;
  onNext: () => void;
}

export default function SkillsStep({ data, updateData, onNext }: Props) {
  const form = useForm<SkillsForm>({
    resolver: zodResolver(skillsFormSchema),
    defaultValues: {
      skills: data.skills || {
        softSkills: [],
        technicalSkills: [],
        languages: [],
      },
    },
  });

  const { fields: softSkillsFields, append: appendSoftSkill, remove: removeSoftSkill } = useFieldArray({
    control: form.control,
    name: "skills.softSkills",
  });

  const { fields: technicalSkillsFields, append: appendTechnicalSkill, remove: removeTechnicalSkill } = useFieldArray({
    control: form.control,
    name: "skills.technicalSkills",
  });

  const onSubmit = (formData: SkillsForm) => {
    const processedSkills = {
      softSkills: formData.skills.softSkills?.map(skill => ({
        ...skill,
        items: skill.items.filter(item => item.trim()),
      })).filter(skill => skill.items.length > 0),
      technicalSkills: formData.skills.technicalSkills?.map(skill => ({
        ...skill,
        items: skill.items.filter(item => item.trim()),
      })).filter(skill => skill.items.length > 0),
      languages: formData.skills.languages?.filter(lang => lang.trim()),
    };
    updateData("skills", processedSkills);
    onNext();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4" data-testid="text-step-title">Skills</h3>
      <p className="text-muted-foreground mb-6">
        Highlight your soft skills, technical skills, and languages
      </p>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <h4 className="font-semibold mb-4">Soft Skills</h4>
            {softSkillsFields.map((field, index) => (
              <Card key={field.id} className="p-4 mb-4" data-testid={`card-soft-skill-${index}`}>
                <div className="flex justify-between items-start mb-2">
                  <FormField
                    control={form.control}
                    name={`skills.softSkills.${index}.category`}
                    render={({ field }) => (
                      <FormItem className="flex-1 mr-2">
                        <FormControl>
                          <Input
                            placeholder="Category (e.g. Presentation Skills)"
                            data-testid={`input-soft-category-${index}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeSoftSkill(index)}
                    data-testid={`button-remove-soft-${index}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`skills.softSkills.${index}.items`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="List skills (one per line)"
                          className="min-h-20"
                          data-testid={`textarea-soft-${index}`}
                          value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                          onChange={(e) => field.onChange(e.target.value.split("\n"))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendSoftSkill({ category: "", items: [""] })}
              className="w-full"
              data-testid="button-add-soft-skill"
            >
              <Plus size={16} className="mr-2" />
              Add Soft Skill Category
            </Button>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Technical Skills</h4>
            {technicalSkillsFields.map((field, index) => (
              <Card key={field.id} className="p-4 mb-4" data-testid={`card-tech-skill-${index}`}>
                <div className="flex justify-between items-start mb-2">
                  <FormField
                    control={form.control}
                    name={`skills.technicalSkills.${index}.category`}
                    render={({ field }) => (
                      <FormItem className="flex-1 mr-2">
                        <FormControl>
                          <Input
                            placeholder="Category (e.g. Software Proficiency)"
                            data-testid={`input-tech-category-${index}`}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => removeTechnicalSkill(index)}
                    data-testid={`button-remove-tech-${index}`}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                <FormField
                  control={form.control}
                  name={`skills.technicalSkills.${index}.items`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Textarea
                          placeholder="List skills (one per line)"
                          className="min-h-20"
                          data-testid={`textarea-tech-${index}`}
                          value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                          onChange={(e) => field.onChange(e.target.value.split("\n"))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </Card>
            ))}
            <Button
              type="button"
              variant="outline"
              onClick={() => appendTechnicalSkill({ category: "", items: [""] })}
              className="w-full"
              data-testid="button-add-tech-skill"
            >
              <Plus size={16} className="mr-2" />
              Add Technical Skill Category
            </Button>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Languages</h4>
            <FormField
              control={form.control}
              name="skills.languages"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea
                      placeholder="List languages you speak (one per line, e.g. English, Afrikaans, French)"
                      className="min-h-20"
                      data-testid="textarea-languages"
                      value={Array.isArray(field.value) ? field.value.join("\n") : ""}
                      onChange={(e) => field.onChange(e.target.value.split("\n").filter((l: string) => l.trim()))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" className="w-full" data-testid="button-continue">
            Continue to Education
          </Button>
        </form>
      </Form>
    </div>
  );
}
