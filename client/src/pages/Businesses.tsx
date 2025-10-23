import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import FAQAccordion from "@/components/FAQAccordion";
import { Zap, MessageCircle, Shield, TrendingUp } from "lucide-react";

export default function Businesses() {
  useEffect(() => {
    document.title = "For Businesses | SME-friendly hiring with POPIA/EE compliance";
  }, []);

  const valueProps = [
    {
      icon: <Zap className="text-green" size={24} />,
      title: "One-click multi-post",
      description: "Post to Pnet, CareerJunction, and Adzuna simultaneously. Reach more candidates, faster."
    },
    {
      icon: <MessageCircle className="text-green" size={24} />,
      title: "WhatsApp apply",
      description: "Candidates apply where they are. You get structured data. Win-win."
    },
    {
      icon: <Shield className="text-green" size={24} />,
      title: "POPIA & EE compliance",
      description: "Automated consent logs, EE reports, and audit trails. Stay compliant, stress-free."
    },
    {
      icon: <TrendingUp className="text-green" size={24} />,
      title: "Background checks",
      description: "Integrated API for criminal, credit, and qualification checks from major SA providers."
    }
  ];

  return (
    <main id="main-content">
      <PageHeader
        title="Hiring that fits SME realities."
        description="No enterprise complexity. Just the tools you need to hire right—POPIA-compliant, WhatsApp-first, and built for South Africa."
        breadcrumb="For Businesses"
        gradientVariant="green"
      />

      <Section>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
          {valueProps.map((prop, idx) => (
            <Card key={idx} className="p-6 hover-elevate" data-testid={`card-value-${idx}`}>
              <div className="flex gap-4">
                <div className="flex-shrink-0">{prop.icon}</div>
                <div>
                  <h3 className="font-semibold mb-2" data-testid="text-value-title">{prop.title}</h3>
                  <p className="text-sm text-muted-foreground" data-testid="text-value-description">
                    {prop.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="p-8 mb-16 border-l-4 border-l-amber">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-16 h-16 rounded-full bg-amber/10 flex items-center justify-center">
              <TrendingUp className="text-amber" size={24} />
            </div>
            <div>
              <Badge className="mb-3 bg-amber/10 text-amber border-0" data-testid="badge-case-study">
                Case Study
              </Badge>
              <p className="font-serif text-lg italic mb-2" data-testid="text-case-quote">
                "Since switching to Sebenza Hub, our JHB retail stores reduced candidate no-shows by 28%. WhatsApp-first apply is a game-changer."
              </p>
              <p className="text-sm text-muted-foreground" data-testid="text-case-author">
                — Cape Town Retail Co, 150 employees
              </p>
            </div>
          </div>
        </Card>

        <div className="bg-card rounded-2xl p-8 mb-16">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <Badge className="mb-3 bg-green/10 text-green border-0" data-testid="badge-recommended">
                Recommended
              </Badge>
              <h3 className="text-2xl font-serif font-semibold mb-2" data-testid="text-plan-callout">
                The Team plan is perfect for SMEs
              </h3>
              <p className="text-muted-foreground">
                Up to 50 active jobs, multi-user accounts, EE reporting, and priority support.
              </p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold mb-1" data-testid="text-plan-price">R1,499</p>
              <p className="text-sm text-muted-foreground mb-4">/month</p>
              <Button data-testid="button-plan-cta" onClick={() => console.log("Team plan selected")}>
                Start free trial
              </Button>
            </div>
          </div>
        </div>

        <div className="mb-16">
          <Card className="p-8 bg-gradient-to-br from-green/5 to-transparent">
            <h3 className="text-xl font-semibold mb-4 flex items-center gap-2" data-testid="text-bbbee-title">
              <Badge className="bg-green/10 text-green border-0">New</Badge>
              Learnerships & BBBEE support
            </h3>
            <p className="text-muted-foreground mb-4">
              Track learnership placements, BBBEE scorecards, and skills development initiatives—all in one place.
            </p>
            <Button
              variant="outline"
              data-testid="button-bbbee"
              onClick={() => console.log("Learn more about BBBEE clicked")}
            >
              Learn more
            </Button>
          </Card>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          <Button
            size="lg"
            data-testid="button-start-free"
            onClick={() => console.log("Start free clicked")}
          >
            Start free
          </Button>
          <Button
            size="lg"
            variant="outline"
            data-testid="button-talk-sales"
            onClick={() => console.log("Talk to sales clicked")}
          >
            Talk to sales
          </Button>
        </div>
      </Section>

      <Section className="bg-card" id="faq">
        <h2 className="text-3xl font-serif font-semibold text-center mb-12" data-testid="text-faq-title">
          Business FAQs
        </h2>
        <div className="max-w-3xl mx-auto">
          <FAQAccordion audience="businesses" />
        </div>
      </Section>
    </main>
  );
}
