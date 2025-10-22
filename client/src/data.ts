export const testimonials = [
  {
    name: "Thandi Nkosi",
    title: "Talent Manager",
    company: "Cape Town Retail Co",
    quote: "Cut our time-to-hire by 50% and eliminated salary negotiation friction completely. Game-changer for SMEs."
  },
  {
    name: "David van der Merwe",
    title: "Recruitment Lead",
    company: "Joburg Tech Solutions",
    quote: "POPIA compliance was a nightmare before. Now it's automated, and clients trust us more."
  },
  {
    name: "Nomsa Khumalo",
    title: "HR Director",
    company: "Durban Logistics Group",
    quote: "WhatsApp-first hiring cut our no-show rate by 28%. Candidates actually respond now."
  }
];

export const faqs = [
  {
    q: "How does POPIA compliance work?",
    a: "All candidate consent is logged automatically, and we provide audit trails for every interaction. You can export compliance reports anytime.",
    audience: "all" as const
  },
  {
    q: "Can I export to Pnet and other job boards?",
    a: "Yes! One-click exports to Pnet, CareerJunction, and Adzuna. We handle the formatting for you.",
    audience: "recruiters" as const
  },
  {
    q: "Do I need technical skills to use the platform?",
    a: "Not at all. If you can use WhatsApp, you can use our platform. Setup takes under 10 minutes.",
    audience: "businesses" as const
  },
  {
    q: "What background checks do you support?",
    a: "We integrate with major SA background check providers. You can request criminal, credit, and qualification checks right from the platform.",
    audience: "businesses" as const
  },
  {
    q: "How do salary ranges work?",
    a: "All job posts must include a salary range. This builds trust and reduces wasted time for everyone.",
    audience: "all" as const
  },
  {
    q: "Is my data safe?",
    a: "Yes. We're POPIA-compliant, use bank-grade encryption, and host data in South Africa.",
    audience: "individuals" as const
  },
  {
    q: "Can I import my existing candidate database?",
    a: "Absolutely. We support CSV imports and can help migrate from most ATS systems.",
    audience: "recruiters" as const
  },
  {
    q: "What's included in the EE reporting?",
    a: "Full Employment Equity reports ready for submission, with demographic tracking and automated analytics.",
    audience: "recruiters" as const
  }
];

export const pricingPlans = [
  {
    name: "Starter",
    price: { monthly: 499, annual: 4490 },
    description: "Perfect for independent recruiters",
    features: [
      "Up to 10 active jobs",
      "WhatsApp apply integration",
      "POPIA consent logs",
      "Basic analytics",
      "Email support"
    ],
    cta: "Start free trial",
    highlighted: false
  },
  {
    name: "Team",
    price: { monthly: 1499, annual: 13490 },
    description: "For small agencies & businesses",
    features: [
      "Up to 50 active jobs",
      "Multi-user accounts (5 seats)",
      "Export to Pnet/CJ/Adzuna",
      "EE reporting",
      "Kanban pipeline",
      "Priority support"
    ],
    cta: "Start free trial",
    highlighted: true
  },
  {
    name: "Business",
    price: { monthly: 3999, annual: 35990 },
    description: "Enterprise-grade hiring",
    features: [
      "Unlimited jobs",
      "Unlimited users",
      "Background check API",
      "Custom integrations",
      "Dedicated account manager",
      "SLA guarantee"
    ],
    cta: "Talk to sales",
    highlighted: false
  }
];

export const tourSlides = [
  {
    title: "Post Once, Reach Everywhere",
    description: "Create a job post with mandatory salary ranges, then export to Pnet, CareerJunction, and Adzuna with one click.",
    bullets: [
      "Salary transparency builds trust",
      "One-click multi-board posting",
      "POPIA consent built-in"
    ]
  },
  {
    title: "WhatsApp-First Applications",
    description: "Candidates apply via WhatsApp. You get structured data in your pipeline. No more lost email threads.",
    bullets: [
      "QR code on job ads",
      "Auto-parsed responses",
      "28% lower no-show rates"
    ]
  },
  {
    title: "Compliance Made Simple",
    description: "EE reports, POPIA logs, and background checks—all in one place. Export what you need, when you need it.",
    bullets: [
      "One-click EE reports",
      "Audit-ready consent trails",
      "Integrated background checks"
    ]
  }
];

export const valueProps = [
  {
    title: "Trust Layer",
    description: "Mandatory salary ranges and verified company profiles end the guessing game.",
    icon: "Shield"
  },
  {
    title: "Mini-ATS for SMEs",
    description: "Kanban pipeline, structured interviews, and EE reporting without enterprise complexity.",
    icon: "Layout"
  },
  {
    title: "WhatsApp-First Apply",
    description: "Candidates apply where they already are. You get structured data. Everyone wins.",
    icon: "MessageCircle"
  },
  {
    title: "Skills Proof",
    description: "2-minute assessments and portfolio uploads replace guesswork with evidence.",
    icon: "Award"
  }
];
