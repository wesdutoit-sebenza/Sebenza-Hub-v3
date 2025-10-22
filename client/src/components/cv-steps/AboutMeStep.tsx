import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface Props {
  data: any;
  updateData: (section: string, data: any) => void;
  onNext: () => void;
}

export default function AboutMeStep({ data, updateData, onNext }: Props) {
  const [aboutMe, setAboutMe] = useState(data.aboutMe || "");

  const handleContinue = () => {
    updateData("aboutMe", aboutMe);
    onNext();
  };

  return (
    <div>
      <h3 className="text-xl font-semibold mb-4" data-testid="text-step-title">About Me</h3>
      <p className="text-muted-foreground mb-6">
        Write a brief professional summary or personal statement
      </p>

      <Textarea
        placeholder="Describe your professional background, goals, and what makes you unique..."
        value={aboutMe}
        onChange={(e) => setAboutMe(e.target.value)}
        className="min-h-48"
        data-testid="textarea-about-me"
      />

      <p className="text-sm text-muted-foreground mt-2">
        This section is optional but recommended. Share your career story, passions, and what drives you.
      </p>

      <Button onClick={handleContinue} className="w-full mt-6" data-testid="button-continue">
        Continue to Preview
      </Button>
    </div>
  );
}
