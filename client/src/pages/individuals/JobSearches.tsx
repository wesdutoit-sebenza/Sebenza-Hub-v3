import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Briefcase, MapPin, DollarSign, Clock, Search, Filter, ExternalLink } from "lucide-react";

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  salaryMin: number;
  salaryMax: number;
  description: string;
  requirements: string;
  whatsappContact: string;
  employmentType: string;
  industry: string;
  createdAt: Date;
}

export default function IndividualJobSearches() {
  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState("all");
  const [industryFilter, setIndustryFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  const { data: jobsData, isLoading } = useQuery<{ success: boolean; jobs: Job[] }>({
    queryKey: ["/api/jobs"],
  });

  // Extract unique values for filters
  const locations = jobsData?.jobs
    ? Array.from(new Set(jobsData.jobs.map(job => job.location)))
    : [];
  
  const industries = jobsData?.jobs
    ? Array.from(new Set(jobsData.jobs.map(job => job.industry)))
    : [];

  const employmentTypes = jobsData?.jobs
    ? Array.from(new Set(jobsData.jobs.map(job => job.employmentType)))
    : [];

  // Filter jobs based on search and filters
  const filteredJobs = jobsData?.jobs?.filter(job => {
    const matchesSearch = searchQuery === "" || 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesLocation = locationFilter === "all" || job.location === locationFilter;
    const matchesIndustry = industryFilter === "all" || job.industry === industryFilter;
    const matchesType = typeFilter === "all" || job.employmentType === typeFilter;

    return matchesSearch && matchesLocation && matchesIndustry && matchesType;
  }) || [];

  const formatSalary = (min: number, max: number) => {
    return `R${min.toLocaleString()} - R${max.toLocaleString()}`;
  };

  const handleApplyViaWhatsApp = (job: Job) => {
    const message = `Hi! I'm interested in the ${job.title} position at ${job.company}. I found this opportunity on Sebenza Hub.`;
    const whatsappUrl = `https://wa.me/${job.whatsappContact.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      {/* Browse Available Jobs Section */}
      <div className="bg-graphite rounded-lg p-8 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-white mb-2">Browse Available Jobs</h2>
          <p className="text-white/80">
            All jobs include transparent salary ranges. Apply directly via WhatsApp.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Search by job title, company, or keywords..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-base bg-white"
              data-testid="input-job-search"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex items-center gap-2 flex-1">
              <Filter className="h-4 w-4 text-white/70" />
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="bg-white/10 border-white/20 text-white" data-testid="select-location">
                  <SelectValue placeholder="All Locations" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  {locations.map(location => (
                    <SelectItem key={location} value={location}>{location}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Select value={industryFilter} onValueChange={setIndustryFilter} >
              <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1" data-testid="select-industry">
                <SelectValue placeholder="All Industries" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Industries</SelectItem>
                {industries.map(industry => (
                  <SelectItem key={industry} value={industry}>{industry}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white flex-1" data-testid="select-type">
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {employmentTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Jobs List */}
        <div className="mt-6">
          {isLoading ? (
            <Card className="bg-white/95">
              <CardContent className="p-8 text-center">
                <p className="text-muted-foreground">Loading jobs...</p>
              </CardContent>
            </Card>
          ) : filteredJobs.length > 0 ? (
            <div className="space-y-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="bg-white/95 hover-elevate" data-testid={`job-card-${job.id}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2 flex items-center gap-2">
                          <Briefcase className="h-5 w-5 text-primary" />
                          {job.title}
                        </CardTitle>
                        <p className="text-lg font-semibold text-muted-foreground mb-3">{job.company}</p>
                        <div className="flex flex-wrap gap-3 text-sm">
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </div>
                          <div className="flex items-center gap-1 text-green-600 font-semibold">
                            <DollarSign className="h-4 w-4" />
                            {formatSalary(job.salaryMin, job.salaryMax)}
                          </div>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            {new Date(job.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Badge variant="secondary">{job.employmentType}</Badge>
                        <Badge variant="outline">{job.industry}</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-semibold mb-2">Description</h4>
                      <p className="text-sm text-muted-foreground line-clamp-3">{job.description}</p>
                    </div>
                    <Button 
                      onClick={() => handleApplyViaWhatsApp(job)}
                      className="w-full bg-green-600 hover:bg-green-700"
                      data-testid={`button-apply-${job.id}`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Apply via WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-white/95">
              <CardContent className="p-12 text-center">
                <Briefcase className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No jobs available yet</h3>
                <p className="text-muted-foreground">
                  Check back soon for new opportunities
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Job Search Tracking Section (Coming Soon) */}
      <div className="bg-graphite rounded-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold mb-2 text-white" data-testid="text-jobs-title">
            My Job Applications
          </h1>
          <p className="text-white/80">Track your job search activity and applications</p>
        </div>

        <Card className="bg-white">
          <CardContent className="p-12 text-center">
            <Search className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2" data-testid="text-no-searches">No Job Applications Yet</h3>
            <p className="text-muted-foreground mb-4">
              Your job application history will appear here
            </p>
            <p className="text-sm text-muted-foreground">
              This feature is coming soon. You'll be able to see all the jobs you've applied to and track their status.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
