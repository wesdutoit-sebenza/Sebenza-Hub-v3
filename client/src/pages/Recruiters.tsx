import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import Stat from "@/components/Stat";
import FAQAccordion from "@/components/FAQAccordion";
import { CheckCircle, FileText, Kanban, Download } from "lucide-react";

export default function Recruiters() {
  useEffect(() => {
    document.title = "For Recruiters | Reduce noise. Faster shortlists.";
  }, []);

  const features = [
    {
      icon: <CheckCircle className="text-cyan" size={24} />,
      title: "Verify employers & ads",
      description: "All job posts verified. No more time wasted on fake listings."
    },
    {
      icon: <FileText className="text-cyan" size={24} />,
      title: "Required salary ranges",
      description: "Every job includes transparent salary info. Build trust, save time."
    },
    {
      icon: <Download className="text-cyan" size={24} />,
      title: "Export to Pnet/CJ/Adzuna",
      description: "One-click export to all major SA job boards. Post once, reach everywhere."
    },
    {
      icon: <Kanban className="text-cyan" size={24} />,
      title: "Pipeline Kanban",
      description: "Visual pipeline with drag-and-drop. Track every candidate at a glance."
    }
  ];

  return (
    <main id="main-content">
      <PageHeader
        title="Less noise. Faster shortlists."
        description="Purpose-built tools for SA recruiters. Verify employers, require salary transparency, and export to all major job boards."
        breadcrumb="For Recruiters"
        gradientVariant="cyan"
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h2 className="text-3xl font-serif font-semibold mb-6" data-testid="text-section-title">
              Everything you need to recruit smarter
            </h2>
            <div className="space-y-6">
              {features.map((feature, idx) => (
                <div key={idx} className="flex gap-4" data-testid={`feature-${idx}`}>
                  <div className="flex-shrink-0">{feature.icon}</div>
                  <div>
                    <h3 className="font-semibold mb-1" data-testid="text-feature-title">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground" data-testid="text-feature-description">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <Card className="p-8">
            <div className="aspect-video bg-gradient-to-br from-cyan/10 to-transparent rounded-lg flex items-center justify-center border">
              <p className="text-muted-foreground" data-testid="text-mock-ui">[Kanban Pipeline Mock UI]</p>
            </div>
          </Card>
        </div>

        <div className="bg-card rounded-2xl p-8 mb-16">
          <h3 className="text-2xl font-serif font-semibold mb-8 text-center" data-testid="text-stats-title">
            Real results from SA recruiters
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Stat value="↓50%" label="Time-to-shortlist" trend="down" color="cyan" />
            <Stat value="↓22%" label="Cost-per-hire" trend="down" color="violet" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          <Card className="p-6">
            <div className="aspect-video bg-gradient-to-br from-violet/10 to-transparent rounded-lg flex items-center justify-center border mb-4">
              <p className="text-muted-foreground text-sm">[Job Post Form Mock]</p>
            </div>
            <h3 className="font-semibold mb-2" data-testid="text-mock-title">Post with mandatory salary ranges</h3>
            <p className="text-sm text-muted-foreground">
              Build trust and reduce time-wasters with transparent salary info on every post.
            </p>
          </Card>
          <Card className="p-6">
            <div className="aspect-video bg-gradient-to-br from-green/10 to-transparent rounded-lg flex items-center justify-center border mb-4">
              <div className="text-center">
                <FileText size={48} className="text-green mx-auto mb-2" />
                <p className="text-muted-foreground text-sm">CSV Export</p>
              </div>
            </div>
            <h3 className="font-semibold mb-2" data-testid="text-mock-title">EE Report Export</h3>
            <p className="text-sm text-muted-foreground">
              One-click Employment Equity reports ready for submission.
            </p>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            data-testid="button-workflow"
            onClick={() => console.log("See recruiter workflow clicked")}
          >
            See recruiter workflow
          </Button>
          <Button
            size="lg"
            variant="outline"
            data-testid="button-demo"
            onClick={() => console.log("Book a demo clicked")}
          >
            Book a demo
          </Button>
        </div>
      </Section>

      <Section className="bg-card" id="faq">
        <h2 className="text-3xl font-serif font-semibold text-center mb-12" data-testid="text-faq-title">
          Recruiter FAQs
        </h2>
        <div className="max-w-3xl mx-auto">
          <FAQAccordion audience="recruiters" />
        </div>
      </Section>
    </main>
  );
}
