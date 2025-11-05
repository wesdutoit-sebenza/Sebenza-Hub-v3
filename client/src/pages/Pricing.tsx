import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Plan {
  plan: {
    id: string;
    product: 'individual' | 'recruiter' | 'corporate';
    tier: 'free' | 'standard' | 'premium';
    name: string;
    description: string;
    priceMonthly: string;
    interval: 'monthly' | 'annual';
    isPublic: number;
  };
  entitlements: Array<{
    featureKey: string;
    featureName: string;
    featureDescription: string;
    featureKind: 'TOGGLE' | 'QUOTA' | 'METERED';
    enabled: number;
    monthlyCap: number | null;
    unit: string | null;
  }>;
}

const PRODUCT_INFO = {
  individual: {
    name: "Individual",
    description: "For job seekers building their careers",
  },
  recruiter: {
    name: "Recruiter",
    description: "For recruiting agencies and talent teams",
  },
  corporate: {
    name: "Corporate",
    description: "For businesses hiring direct",
  },
};

const TIER_INFO = {
  free: {
    name: "Free",
    badge: "Get Started",
  },
  standard: {
    name: "Standard",
    badge: "Most Popular",
  },
  premium: {
    name: "Premium",
    badge: "Full Power",
  },
};

export default function Pricing() {
  const [, navigate] = useLocation();
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');
  
  const { data, isLoading } = useQuery<{ success: boolean; plans: Plan[] }>({
    queryKey: ['/api/public/plans'],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-pricing">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const plans = data?.plans || [];
  
  // Group plans by product and tier
  const plansByProduct = {
    individual: {
      free: plans.find(p => p.plan.product === 'individual' && p.plan.tier === 'free' && p.plan.interval === interval),
      standard: plans.find(p => p.plan.product === 'individual' && p.plan.tier === 'standard' && p.plan.interval === interval),
      premium: plans.find(p => p.plan.product === 'individual' && p.plan.tier === 'premium' && p.plan.interval === interval),
    },
    recruiter: {
      free: plans.find(p => p.plan.product === 'recruiter' && p.plan.tier === 'free' && p.plan.interval === interval),
      standard: plans.find(p => p.plan.product === 'recruiter' && p.plan.tier === 'standard' && p.plan.interval === interval),
      premium: plans.find(p => p.plan.product === 'recruiter' && p.plan.tier === 'premium' && p.plan.interval === interval),
    },
    corporate: {
      free: plans.find(p => p.plan.product === 'corporate' && p.plan.tier === 'free' && p.plan.interval === interval),
      standard: plans.find(p => p.plan.product === 'corporate' && p.plan.tier === 'standard' && p.plan.interval === interval),
      premium: plans.find(p => p.plan.product === 'corporate' && p.plan.tier === 'premium' && p.plan.interval === interval),
    },
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-4" data-testid="heading-pricing">
              Simple, Transparent Pricing
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose the plan that's right for you. Start free, upgrade anytime.
            </p>
          </div>

          {/* Billing Interval Toggle */}
          <div className="mt-8 flex justify-center">
            <Tabs value={interval} onValueChange={(v) => setInterval(v as 'monthly' | 'annual')} className="w-auto">
              <TabsList data-testid="toggle-billing-interval">
                <TabsTrigger value="monthly" data-testid="tab-monthly">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="annual" data-testid="tab-annual">
                  Annual
                  <Badge variant="secondary" className="ml-2 text-xs">Save 17%</Badge>
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {/* Pricing Tables - One section per product */}
      <div className="max-w-7xl mx-auto px-6 py-12 space-y-16">
        {Object.entries(plansByProduct).map(([product, tiers]) => {
          const productInfo = PRODUCT_INFO[product as keyof typeof PRODUCT_INFO];
          
          return (
            <div key={product} data-testid={`section-${product}`}>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-2" data-testid={`heading-${product}`}>
                  {productInfo.name}
                </h2>
                <p className="text-muted-foreground">
                  {productInfo.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Object.entries(tiers).map(([tier, planData]) => {
                  if (!planData) return null;
                  
                  const { plan, entitlements } = planData;
                  const tierInfo = TIER_INFO[tier as keyof typeof TIER_INFO];
                  const isPopular = tier === 'standard';
                  
                  return (
                    <Card 
                      key={plan.id} 
                      className={isPopular ? "border-primary border-2" : ""}
                      data-testid={`card-plan-${product}-${tier}`}
                    >
                      <CardHeader>
                        {isPopular && (
                          <Badge className="w-fit mb-2" data-testid={`badge-popular-${product}`}>
                            {tierInfo.badge}
                          </Badge>
                        )}
                        <CardTitle className="text-2xl" data-testid={`title-${product}-${tier}`}>
                          {tierInfo.name}
                        </CardTitle>
                        <CardDescription data-testid={`description-${product}-${tier}`}>
                          {plan.description}
                        </CardDescription>
                        
                        <div className="mt-4">
                          <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold" data-testid={`price-${product}-${tier}`}>
                              R{parseFloat(plan.priceMonthly).toLocaleString()}
                            </span>
                            <span className="text-muted-foreground">
                              /{interval === 'monthly' ? 'mo' : 'year'}
                            </span>
                          </div>
                          {interval === 'annual' && parseFloat(plan.priceMonthly) > 0 && (
                            <p className="text-sm text-muted-foreground mt-1">
                              R{(parseFloat(plan.priceMonthly) / 12).toFixed(0)}/month billed annually
                            </p>
                          )}
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-4">
                        <Button 
                          className="w-full" 
                          variant={isPopular ? "default" : "outline"}
                          onClick={() => {
                            // Free tier: navigate to signup/login
                            if (tier === 'free') {
                              navigate('/login');
                            } else {
                              // Paid tiers: navigate to login (checkout flow coming soon)
                              // TODO: Implement checkout flow with Netcash
                              navigate('/login');
                            }
                          }}
                          data-testid={`button-select-${product}-${tier}`}
                        >
                          {tier === 'free' ? 'Get Started' : 'Upgrade Now'}
                        </Button>

                        <div className="space-y-2">
                          <p className="text-sm font-semibold">Features:</p>
                          {entitlements
                            .filter(ent => {
                              // Only show enabled features
                              if (ent.featureKind === 'TOGGLE') {
                                return ent.enabled === 1;
                              }
                              // Show all QUOTA and METERED features
                              return true;
                            })
                            .map((ent) => (
                              <div 
                                key={ent.featureKey} 
                                className="flex items-start gap-2 text-sm"
                                data-testid={`feature-${product}-${tier}-${ent.featureKey}`}
                              >
                                <Check className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                                <div>
                                  <span>{ent.featureName}</span>
                                  {ent.featureKind === 'QUOTA' && ent.monthlyCap !== null && (
                                    <span className="text-muted-foreground">
                                      {' '}({ent.monthlyCap === -1 ? 'Unlimited' : `${ent.monthlyCap} ${ent.unit || 'per month'}`})
                                    </span>
                                  )}
                                  {ent.featureKind === 'METERED' && (
                                    <span className="text-muted-foreground">
                                      {' '}(Usage-based)
                                    </span>
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* FAQ Section */}
      <div className="bg-card border-t">
        <div className="max-w-4xl mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold text-center mb-8">Frequently Asked Questions</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I switch plans anytime?</h3>
              <p className="text-muted-foreground">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, 
                and we'll prorate your billing.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-muted-foreground">
                We accept all major credit cards, debit cards, and instant EFT through Netcash, 
                a trusted South African payment gateway.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Is my data safe and POPIA compliant?</h3>
              <p className="text-muted-foreground">
                Absolutely. We're fully POPIA compliant and use bank-level encryption to protect your data. 
                All candidate information is stored securely in South Africa.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-2">Can I cancel my subscription?</h3>
              <p className="text-muted-foreground">
                Yes, you can cancel anytime from your billing dashboard. You'll continue to have access 
                until the end of your billing period.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="border-t">
        <div className="max-w-4xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join hundreds of South African businesses already hiring smarter with Sebenza Hub.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" onClick={() => navigate('/login')} data-testid="button-get-started-cta">
              Get Started Free
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate('/contact')} data-testid="button-contact-sales">
              Contact Sales
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
