import { useState } from "react";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Search, UserPlus, Mail, Phone, MapPin, FileText } from "lucide-react";
import type { Candidate } from "@shared/schema";

export default function CandidatesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const { data: candidatesData, isLoading } = useQuery<{
    success: boolean;
    count: number;
    candidates: Candidate[];
  }>({
    queryKey: ["/api/ats/candidates"],
  });

  const candidates = candidatesData?.candidates || [];
  
  const filteredCandidates = candidates.filter((candidate) =>
    searchQuery
      ? candidate.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.headline?.toLowerCase().includes(searchQuery.toLowerCase())
      : true
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold" data-testid="heading-candidates">
              Candidate Database
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your talent pool and track candidates
            </p>
          </div>
          <Link href="/candidates/new">
            <Button data-testid="button-add-candidate">
              <UserPlus className="w-4 h-4 mr-2" />
              Add Candidate
            </Button>
          </Link>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search candidates by name, email, or headline..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              data-testid="input-search-candidates"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <div className="animate-pulse space-y-3">
                    <div className="h-6 bg-muted rounded w-1/3"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-2/3"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCandidates.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                  <UserPlus className="w-8 h-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold mb-1">No candidates found</h3>
                  <p className="text-muted-foreground mb-4">
                    {searchQuery
                      ? "Try adjusting your search criteria"
                      : "Get started by adding your first candidate"}
                  </p>
                  {!searchQuery && (
                    <Link href="/candidates/new">
                      <Button>
                        <UserPlus className="w-4 h-4 mr-2" />
                        Add Candidate
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {filteredCandidates.map((candidate) => (
              <Link
                key={candidate.id}
                href={`/candidates/${candidate.id}`}
                data-testid={`card-candidate-${candidate.id}`}
              >
                <Card className="hover-elevate active-elevate-2 cursor-pointer transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-xl truncate" data-testid="text-candidate-name">
                          {candidate.fullName || "Unnamed Candidate"}
                        </CardTitle>
                        {candidate.headline && (
                          <p className="text-sm text-muted-foreground mt-1" data-testid="text-candidate-headline">
                            {candidate.headline}
                          </p>
                        )}
                      </div>
                      {candidate.workAuthorization && (
                        <Badge variant="secondary" data-testid="badge-work-auth">
                          {candidate.workAuthorization}
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {candidate.email && (
                        <div className="flex items-center gap-1.5" data-testid="text-candidate-email">
                          <Mail className="w-3.5 h-3.5" />
                          <span>{candidate.email}</span>
                        </div>
                      )}
                      {candidate.phone && (
                        <div className="flex items-center gap-1.5" data-testid="text-candidate-phone">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{candidate.phone}</span>
                        </div>
                      )}
                      {(candidate.city || candidate.country) && (
                        <div className="flex items-center gap-1.5" data-testid="text-candidate-location">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>
                            {[candidate.city, candidate.country].filter(Boolean).join(", ")}
                          </span>
                        </div>
                      )}
                    </div>
                    {candidate.summary && (
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-3" data-testid="text-candidate-summary">
                        {candidate.summary}
                      </p>
                    )}
                    {(candidate.availability || candidate.salaryExpectation) && (
                      <div className="flex gap-2 mt-3">
                        {candidate.availability && (
                          <Badge variant="outline" data-testid="badge-availability">
                            {candidate.availability}
                          </Badge>
                        )}
                        {candidate.salaryExpectation && (
                          <Badge variant="outline" data-testid="badge-salary">
                            {candidate.salaryExpectation}
                          </Badge>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-6 text-center text-sm text-muted-foreground">
          {filteredCandidates.length > 0 && (
            <span data-testid="text-candidate-count">
              Showing {filteredCandidates.length} of {candidates.length} candidates
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
