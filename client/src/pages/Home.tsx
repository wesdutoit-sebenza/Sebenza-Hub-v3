import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Shield, Layout, MessageCircle, Award, ArrowRight } from "lucide-react";
import GradientBlob from "@/components/GradientBlob";
import Section from "@/components/Section";
import Modal from "@/components/Modal";
import PricingTable from "@/components/PricingTable";
import FAQAccordion from "@/components/FAQAccordion";
import TourSlides from "@/components/TourSlides";
import { testimonials, valueProps } from "@/data";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Home() {
  const [showTourModal, setShowTourModal] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    document.title = "HireMove | SA recruiting platform—trust layer, WhatsApp-first, compliance";
  }, []);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await apiRequest("POST", "/api/subscribe", { email });
      const data = await response.json();

      if (data.success) {
        toast({
          title: "Success!",
          description: data.message,
        });
        setEmail("");
      } else {
        toast({
          title: "Oops!",
          description: data.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const iconMap = {
    Shield,
    Layout,
    MessageCircle,
    Award,
  };

  return (
    <main id="main-content">
      <section className="relative min-h-[80vh] flex items-center justify-center px-6 overflow-hidden">
        <GradientBlob variant="violet-cyan" />
        <div className="max-w-4xl mx-auto text-center relative z-10 py-20">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif font-semibold mb-6" data-testid="text-hero-title">
            Hiring that actually moves.
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            A trust layer for SA recruiting—transparent salaries, WhatsApp-first funnels, and built-in compliance.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Button
              size="lg"
              data-testid="button-hero-access"
              onClick={() => document.getElementById('cta')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get early access
            </Button>
            <Button
              size="lg"
              variant="outline"
              data-testid="button-hero-tour"
              onClick={() => setShowTourModal(true)}
            >
              View product tour
            </Button>
          </div>
        </div>
      </section>

      <Section id="value-props">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((prop, idx) => {
            const Icon = iconMap[prop.icon as keyof typeof iconMap];
            return (
              <Card key={idx} className="p-6 hover-elevate" data-testid={`card-value-${idx}`}>
                <Icon size={32} className="text-primary mb-4" />
                <h3 className="font-semibold text-lg mb-2" data-testid="text-value-title">{prop.title}</h3>
                <p className="text-sm text-muted-foreground" data-testid="text-value-description">{prop.description}</p>
              </Card>
            );
          })}
        </div>
      </Section>

      <Section className="bg-card" id="for-who">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center mb-12" data-testid="text-section-title">
          Built for everyone in SA hiring
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link href="/recruiters">
            <Card className="p-8 hover-elevate h-full cursor-pointer group" data-testid="card-teaser-recruiters">
              <div className="relative mb-4">
                <GradientBlob variant="cyan" className="rounded-lg" />
                <div className="relative z-10 aspect-video flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">[Pipeline UI Mock]</p>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-2" data-testid="text-teaser-title">For Recruiters</h3>
              <p className="text-muted-foreground mb-4">
                Less noise. Faster shortlists. Export to Pnet/CJ/Adzuna.
              </p>
              <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowRight size={16} />
              </div>
            </Card>
          </Link>

          <Link href="/businesses">
            <Card className="p-8 hover-elevate h-full cursor-pointer group" data-testid="card-teaser-businesses">
              <div className="relative mb-4">
                <GradientBlob variant="green" className="rounded-lg" />
                <div className="relative z-10 aspect-video flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">[Job Post Form Mock]</p>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-2" data-testid="text-teaser-title">For Businesses</h3>
              <p className="text-muted-foreground mb-4">
                SME-friendly hiring with POPIA/EE compliance built-in.
              </p>
              <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowRight size={16} />
              </div>
            </Card>
          </Link>

          <Link href="/individuals">
            <Card className="p-8 hover-elevate h-full cursor-pointer group" data-testid="card-teaser-individuals">
              <div className="relative mb-4">
                <GradientBlob variant="amber" className="rounded-lg" />
                <div className="relative z-10 aspect-video flex items-center justify-center">
                  <p className="text-sm text-muted-foreground">[WhatsApp QR Mock]</p>
                </div>
              </div>
              <h3 className="text-2xl font-serif font-semibold mb-2" data-testid="text-teaser-title">For Individuals</h3>
              <p className="text-muted-foreground mb-4">
                One profile. Real salary ranges. Skills that matter.
              </p>
              <div className="flex items-center gap-2 text-primary group-hover:gap-3 transition-all">
                <span className="text-sm font-medium">Learn more</span>
                <ArrowRight size={16} />
              </div>
            </Card>
          </Link>
        </div>
      </Section>

      <Section id="pricing">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center mb-4" data-testid="text-pricing-title">
          Simple, transparent pricing
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          All plans include POPIA compliance, WhatsApp integration, and salary transparency tools.
        </p>
        <PricingTable />
      </Section>

      <Section className="bg-card" id="testimonials">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center mb-12" data-testid="text-testimonials-title">
          Trusted by SA recruiters
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, idx) => (
            <Card key={idx} className="p-6" data-testid={`card-testimonial-${idx}`}>
              <p className="text-muted-foreground mb-4 italic" data-testid="text-testimonial-quote">
                "{testimonial.quote}"
              </p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-semibold">
                    {testimonial.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-sm" data-testid="text-testimonial-name">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground" data-testid="text-testimonial-role">
                    {testimonial.title}, {testimonial.company}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Section>

      <Section id="faq">
        <h2 className="text-3xl md:text-4xl font-serif font-semibold text-center mb-12" data-testid="text-faq-title">
          Frequently asked questions
        </h2>
        <div className="max-w-3xl mx-auto">
          <FAQAccordion audience="all" />
        </div>
      </Section>

      <Section className="bg-card" id="cta">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-semibold mb-4" data-testid="text-cta-title">
            Ready to transform your hiring?
          </h2>
          <p className="text-muted-foreground mb-8">
            Join the waitlist for early access. No credit card required.
          </p>
          <form onSubmit={handleEmailSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.co.za"
              data-testid="input-email"
              className="flex-1 px-4 py-2 rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-ring"
              required
              disabled={isSubmitting}
            />
            <Button type="submit" data-testid="button-subscribe" disabled={isSubmitting}>
              {isSubmitting ? "Submitting..." : "Get early access"}
            </Button>
          </form>
        </div>
      </Section>

      <Modal isOpen={showTourModal} onClose={() => setShowTourModal(false)} title="Product Tour">
        <TourSlides />
      </Modal>
    </main>
  );
}
