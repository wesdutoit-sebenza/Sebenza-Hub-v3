import { useState, useMemo } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { SKILLS_BY_CATEGORY } from "@shared/skills";

interface SkillsMultiSelectProps {
  value: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
  placeholder?: string;
  className?: string;
}

export function SkillsMultiSelect({
  value = [],
  onChange,
  maxSkills = 10,
  placeholder = "Select skills...",
  className,
}: SkillsMultiSelectProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter categories and skills based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return SKILLS_BY_CATEGORY;

    const query = searchQuery.toLowerCase();
    return SKILLS_BY_CATEGORY.map(category => ({
      ...category,
      skills: category.skills.filter(skill =>
        skill.toLowerCase().includes(query)
      ),
    })).filter(category => category.skills.length > 0);
  }, [searchQuery]);

  const handleToggleSkill = (skill: string) => {
    const currentIndex = value.indexOf(skill);
    let newValue: string[];

    if (currentIndex === -1) {
      // Adding a skill - check max limit
      if (value.length >= maxSkills) {
        return; // Don't add if at max
      }
      newValue = [...value, skill];
    } else {
      // Removing a skill
      newValue = value.filter(s => s !== skill);
    }

    onChange(newValue);
  };

  const handleRemoveSkill = (skill: string) => {
    onChange(value.filter(s => s !== skill));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between text-left font-normal"
            data-testid="button-skills-select"
          >
            <span className="text-muted-foreground">
              {value.length === 0
                ? placeholder
                : `${value.length} skill${value.length === 1 ? '' : 's'} selected`}
            </span>
            {value.length > 0 && (
              <span className="ml-2 text-xs text-muted-foreground">
                {value.length}/{maxSkills}
              </span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0" align="start">
          <Command>
            <CommandInput
              placeholder="Search skills..."
              value={searchQuery}
              onValueChange={setSearchQuery}
              data-testid="input-skills-search"
            />
            <CommandList className="max-h-[300px]">
              <CommandEmpty>No skills found.</CommandEmpty>
              {filteredCategories.map((category) => (
                <CommandGroup
                  key={category.category}
                  heading={category.category}
                >
                  {category.skills.map((skill) => {
                    const isSelected = value.includes(skill);
                    const isDisabled = !isSelected && value.length >= maxSkills;

                    return (
                      <CommandItem
                        key={skill}
                        value={skill}
                        onSelect={() => handleToggleSkill(skill)}
                        disabled={isDisabled}
                        className={cn(
                          "cursor-pointer",
                          isDisabled && "opacity-50 cursor-not-allowed"
                        )}
                        data-testid={`skill-option-${skill.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <div
                          className={cn(
                            "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                            isSelected
                              ? "bg-primary text-primary-foreground"
                              : "opacity-50 [&_svg]:invisible"
                          )}
                        >
                          <Check className="h-3 w-3" />
                        </div>
                        <span>{skill}</span>
                      </CommandItem>
                    );
                  })}
                </CommandGroup>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {/* Display selected skills as badges */}
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2" data-testid="selected-skills-container">
          {value.map((skill) => (
            <Badge
              key={skill}
              variant="secondary"
              className="gap-1"
              data-testid={`badge-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
            >
              {skill}
              <button
                type="button"
                className="ml-1 hover:text-destructive"
                onClick={() => handleRemoveSkill(skill)}
                data-testid={`button-remove-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Show max limit warning */}
      {value.length >= maxSkills && (
        <p className="text-xs text-muted-foreground" data-testid="text-max-skills-warning">
          Maximum of {maxSkills} skills reached
        </p>
      )}
    </div>
  );
}
