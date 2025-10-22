import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PageHeader from "@/components/PageHeader";
import Section from "@/components/Section";
import FAQAccordion from "@/components/FAQAccordion";
import CVBuilder from "@/components/CVBuilder";
import { User, Clock, Video, Upload, Award, Shield, Briefcase, MapPin, DollarSign, MessageCircle, Search, Filter, FileText } from "lucide-react";
import { type Job } from "@shared/schema";

export default function Individuals() {
  const [searchTerm, setSearchTerm] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState("all");
  const [showCVBuilder, setShowCVBuilder] = useState(false);

  useEffect(() => {
    document.title = "For Individuals | One profile. Verified skills. Transparent pay.";
  }, []);

  const { data: jobsData, isLoading } = useQuery<{ success: boolean; count: number; jobs: Job[] }>({
    queryKey: ["/api/jobs"],
  });

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

  const availableLocations = Array.from(
    new Set(jobsData?.jobs?.map(job => job.location) || [])
  ).sort();

  const availableIndustries = Array.from(
    new Set(jobsData?.jobs?.map(job => job.industry) || [])
  ).sort();

  const availableEmploymentTypes = Array.from(
    new Set(jobsData?.jobs?.map(job => job.employmentType) || [])
  ).sort();

  const filteredJobs = jobsData?.jobs?.filter((job) => {
    const matchesSearch = !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || job.location === locationFilter;
    const matchesIndustry = industryFilter === "all" || job.industry === industryFilter;
    const matchesEmploymentType = employmentTypeFilter === "all" || job.employmentType === employmentTypeFilter;

    return matchesSearch && matchesLocation && matchesIndustry && matchesEmploymentType;
  }) || [];

  const clearFilters = () => {
    setSearchTerm("");
    setLocationFilter("all");
    setIndustryFilter("all");
    setEmploymentTypeFilter("all");
  };

  const hasActiveFilters = searchTerm || locationFilter !== "all" || industryFilter !== "all" || employmentTypeFilter !== "all";

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
            onClick={() => setShowCVBuilder(!showCVBuilder)}
          >
            <FileText size={20} className="mr-2" />
            {showCVBuilder ? "Back to Profile" : "Create Your CV"}
          </Button>
        </div>
      </Section>

      {showCVBuilder && (
        <Section>
          <CVBuilder onComplete={() => setShowCVBuilder(false)} />
        </Section>
      )}

      {!showCVBuilder && (<>
        <Section className="bg-card" id="jobs">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-serif font-semibold mb-4" data-testid="text-jobs-title">
              Browse Available Jobs
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              All jobs include transparent salary ranges. Apply directly via WhatsApp.
            </p>
          </div>

          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <Input
                placeholder="Search by job title, company, or keywords..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                data-testid="input-search-jobs"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Filter size={20} className="text-muted-foreground" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-location-filter">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="option-location-all">All Locations</SelectItem>
                  {availableLocations.map((loc) => (
                    <SelectItem key={loc} value={loc} data-testid={`option-location-${loc.toLowerCase().replace(/\s+/g, '-')}`}>
                      {loc}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={industryFilter} onValueChange={setIndustryFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-industry-filter">
                  <SelectValue placeholder="All Industries" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="option-industry-all">All Industries</SelectItem>
                  {availableIndustries.map((ind) => (
                    <SelectItem key={ind} value={ind} data-testid={`option-industry-${ind.toLowerCase().replace(/\s+/g, '-')}`}>
                      {ind}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all" data-testid="option-type-all">All Types</SelectItem>
                  {availableEmploymentTypes.map((type) => (
                    <SelectItem key={type} value={type} data-testid={`option-type-${type.toLowerCase().replace(/\s+/g, '-')}`}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearFilters}
                  data-testid="button-clear-filters"
                >
                  Clear Filters
                </Button>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Loading jobs...</p>
            </div>
          ) : filteredJobs.length === 0 ? (
            <Card className="p-12 text-center">
              <Briefcase className="mx-auto mb-4 text-muted-foreground" size={48} />
              <h3 className="text-xl font-semibold mb-2" data-testid="text-no-jobs">
                {hasActiveFilters ? "No jobs match your filters" : "No jobs available yet"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Check back soon for new opportunities"}
              </p>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  onClick={clearFilters}
                  data-testid="button-clear-filters-empty"
                >
                  Clear all filters
                </Button>
              )}
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6">
                {filteredJobs.map((job) => (
                  <Card key={job.id} className="p-6 hover-elevate" data-testid={`card-job-${job.id}`}>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold mb-2" data-testid="text-job-title">
                          {job.title}
                        </h3>
                        <p className="text-lg text-muted-foreground mb-3" data-testid="text-job-company">
                          {job.company}
                        </p>
                      </div>
                      <Badge className="text-sm" data-testid="badge-employment-type">
                        {job.employmentType}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-4 mb-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        <span data-testid="text-job-location">{job.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <DollarSign size={16} />
                        <span data-testid="text-job-salary" className="font-semibold text-foreground">
                          R{job.salaryMin.toLocaleString()} - R{job.salaryMax.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Briefcase size={16} />
                        <span data-testid="text-job-industry">{job.industry}</span>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-semibold text-sm mb-2">About the role:</h4>
                      <p className="text-muted-foreground text-sm mb-3" data-testid="text-job-description">
                        {job.description}
                      </p>
                      <h4 className="font-semibold text-sm mb-2">Requirements:</h4>
                      <p className="text-muted-foreground text-sm" data-testid="text-job-requirements">
                        {job.requirements}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        className="bg-green hover:bg-green/90"
                        size="sm"
                        onClick={() => window.open(`https://wa.me/${job.whatsappContact.replace(/\D/g, '')}`, '_blank')}
                        data-testid="button-apply-whatsapp"
                      >
                        <MessageCircle size={16} className="mr-2" />
                        Apply via WhatsApp
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        data-testid="button-save-job"
                      >
                        Save Job
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Showing {filteredJobs.length} of {jobsData?.count || 0} jobs
              </p>
            </>
          )}
        </div>
      </Section>
      
      <Section id="faq">
        <h2 className="text-3xl font-serif font-semibold text-center mb-12" data-testid="text-faq-title">
          Individual FAQs
        </h2>
        <div className="max-w-3xl mx-auto">
          <FAQAccordion audience="individuals" />
        </div>
      </Section>
      </>)}
    </main>
  );
}
