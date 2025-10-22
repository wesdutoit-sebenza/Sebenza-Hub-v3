import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import FAQAccordion from "@/components/FAQAccordion";
import { User, Clock, Video, Upload, Award, Shield } from "lucide-react";

export default function Individuals() {
  useEffect(() => {
    document.title = "For Individuals | One profile. Verified skills. Transparent pay.";
  }, []);

  const steps = [
    {
      number: 1,
      icon: <User className="text-amber" size={24} />,
      title: "Create your profile",
      description: "One profile for all your applications. No more filling out the same info 50 times."
    },
    {
      number: 2,
      icon: <Clock className="text-amber" size={24} />,
      title: "2-minute skills task",
      description: "Short, relevant assessments that prove your skills. Way better than just a CV."
    },
    {
      number: 3,
      icon: <Video className="text-amber" size={24} />,
      title: "Interview",
      description: "Only for roles where you're a real fit—and you'll see the salary range upfront."
    }
  ];

  return (
    <main id="main-content">
      <PageHeader
        title="One profile. Real salary ranges."
        description="Stop wasting time on mystery jobs. See transparent salaries, apply via WhatsApp, and prove your skills with quick assessments."
        breadcrumb="For Individuals"
        gradientVariant="amber"
      />

      <Section>
        <h2 className="text-3xl font-serif font-semibold text-center mb-12" data-testid="text-section-title">
          How it works
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {steps.map((step, idx) => (
            <div key={idx} className="text-center" data-testid={`step-${idx}`}>
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber/10 mb-4">
                {step.icon}
              </div>
              <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber text-primary-foreground text-sm font-bold mb-3">
                {step.number}
              </div>
              <h3 className="font-semibold text-lg mb-2" data-testid="text-step-title">{step.title}</h3>
              <p className="text-sm text-muted-foreground" data-testid="text-step-description">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-serif font-semibold mb-6" data-testid="text-whatsapp-title">
              Apply on WhatsApp
            </h2>
            <p className="text-muted-foreground mb-6">
              See a job you like? Scan the QR code or tap the button. We'll guide you through a quick application right in WhatsApp—no emails, no portals.
            </p>
            <Button
              size="lg"
              className="bg-green hover:bg-green/90"
              data-testid="button-whatsapp-apply"
              onClick={() => console.log("WhatsApp apply clicked")}
            >
              Apply on WhatsApp
            </Button>
          </div>
          <Card className="p-8">
            <div className="aspect-square max-w-sm mx-auto bg-gradient-to-br from-amber/10 to-transparent rounded-2xl flex items-center justify-center border">
              <div className="text-center">
                <div className="w-48 h-48 bg-muted rounded-lg flex items-center justify-center mb-4">
                  <p className="text-muted-foreground text-sm">[QR Code]</p>
                </div>
                <p className="text-sm text-muted-foreground" data-testid="text-qr-instruction">
                  Scan to apply via WhatsApp
                </p>
              </div>
            </div>
          </Card>
        </div>

        <h2 className="text-3xl font-serif font-semibold text-center mb-12" data-testid="text-portfolio-title">
          Stand out with verified skills
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <Card className="p-6 hover-elevate" data-testid="card-portfolio-upload">
            <Upload className="text-violet mb-4" size={32} />
            <h3 className="font-semibold mb-2">Upload work samples</h3>
            <p className="text-sm text-muted-foreground">
              Show, don't just tell. Upload your best work to your profile.
            </p>
          </Card>
          <Card className="p-6 hover-elevate" data-testid="card-portfolio-assessment">
            <Award className="text-cyan mb-4" size={32} />
            <h3 className="font-semibold mb-2">Short assessments</h3>
            <p className="text-sm text-muted-foreground">
              2-minute skill checks that prove what you can do.
            </p>
          </Card>
          <Card className="p-6 hover-elevate" data-testid="card-portfolio-verified">
            <Shield className="text-green mb-4" size={32} />
            <h3 className="font-semibold mb-2">Verified credentials</h3>
            <p className="text-sm text-muted-foreground">
              Get badges for completed tasks, qualifications, and experience.
            </p>
          </Card>
        </div>

        <div className="text-center">
          <Button
            size="lg"
            data-testid="button-create-profile"
            onClick={() => console.log("Create profile clicked")}
          >
            Create your profile
          </Button>
        </div>
      </Section>

      <Section className="bg-card" id="faq">
        <h2 className="text-3xl font-serif font-semibold text-center mb-12" data-testid="text-faq-title">
          Individual FAQs
        </h2>
        <div className="max-w-3xl mx-auto">
          <FAQAccordion audience="individuals" />
        </div>
      </Section>
    </main>
  );
}
