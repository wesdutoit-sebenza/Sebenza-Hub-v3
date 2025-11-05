import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Search, Building2, Users, Briefcase, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { ClientDialog } from "@/components/recruiter/ClientDialog";

type CorporateClient = {
  id: string;
  agencyOrganizationId: string;
  name: string;
  registrationNumber: string | null;
  industry: string | null;
  province: string | null;
  city: string | null;
  status: string;
  tier: string | null;
  rating: number | null;
  defaultFeePercent: number | null;
  guaranteePeriodDays: number | null;
  paymentTerms: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
};

type ClientContact = {
  id: string;
  clientId: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  email: string;
  phone: string | null;
  whatsappNumber: string | null;
  isPrimary: boolean;
  canShareCandidateData: boolean;
  popiaConsentDate: Date | null;
  notes: string | null;
  createdAt: Date;
};

type ClientEngagement = {
  id: string;
  clientId: string;
  feeType: string;
  feePercentage: number | null;
  feeFixed: number | null;
  guaranteePeriodDays: number;
  paymentTermsDays: number;
  specialTerms: any;
  startDate: Date;
  endDate: Date | null;
  isActive: boolean;
  createdAt: Date;
};

export default function CorporateClients() {
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<CorporateClient | undefined>();

  // Fetch all clients
  const { data: clients = [], isLoading } = useQuery<CorporateClient[]>({
    queryKey: ["/api/recruiter/clients"],
  });

  // Fetch selected client details
  const { data: selectedClient } = useQuery<CorporateClient>({
    queryKey: ["/api/recruiter/clients", selectedClientId],
    enabled: !!selectedClientId,
  });

  // Fetch client contacts
  const { data: contacts = [] } = useQuery<ClientContact[]>({
    queryKey: ["/api/recruiter/clients", selectedClientId, "contacts"],
    enabled: !!selectedClientId,
  });

  // Fetch client engagements
  const { data: engagements = [] } = useQuery<ClientEngagement[]>({
    queryKey: ["/api/recruiter/clients", selectedClientId, "engagements"],
    enabled: !!selectedClientId,
  });

  // Fetch client jobs
  const { data: jobs = [] } = useQuery<any[]>({
    queryKey: ["/api/recruiter/clients", selectedClientId, "jobs"],
    enabled: !!selectedClientId,
  });

  // Fetch client stats
  const { data: stats } = useQuery<any>({
    queryKey: ["/api/recruiter/clients", selectedClientId, "stats"],
    enabled: !!selectedClientId,
  });

  // Filter clients
  const filteredClients = clients.filter((client) => {
    const matchesSearch = client.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Dialog handlers
  const handleAddClient = () => {
    setEditingClient(undefined);
    setClientDialogOpen(true);
  };

  const handleEditClient = (client: CorporateClient) => {
    setEditingClient(client);
    setClientDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-muted-foreground">Loading clients...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full">
      {/* Left Panel - Client List */}
      <div className="w-96 border-r flex flex-col">
        {/* Header */}
        <div className="p-4 border-b space-y-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Corporate Clients</h1>
            <Button size="icon" onClick={handleAddClient} data-testid="button-add-client">
              <Plus className="w-4 h-4" />
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
              data-testid="input-search-clients"
            />
          </div>

          {/* Status Filters */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={statusFilter === "all" ? "default" : "outline"}
              onClick={() => setStatusFilter("all")}
              data-testid="button-filter-all"
            >
              All
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "active" ? "default" : "outline"}
              onClick={() => setStatusFilter("active")}
              data-testid="button-filter-active"
            >
              Active
            </Button>
            <Button
              size="sm"
              variant={statusFilter === "inactive" ? "default" : "outline"}
              onClick={() => setStatusFilter("inactive")}
              data-testid="button-filter-inactive"
            >
              Inactive
            </Button>
          </div>
        </div>

        {/* Client List */}
        <div className="flex-1 overflow-y-auto">
          {filteredClients.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No clients found</p>
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className={`cursor-pointer hover-elevate ${
                    selectedClientId === client.id
                      ? "ring-2 ring-primary"
                      : ""
                  }`}
                  onClick={() => setSelectedClientId(client.id)}
                  data-testid={`card-client-${client.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Avatar>
                        <AvatarFallback>
                          {getInitials(client.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {client.name}
                        </h3>
                        <p className="text-sm text-muted-foreground truncate">
                          {client.industry || "No industry specified"}
                        </p>
                        {(client.city || client.province) && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {[client.city, client.province].filter(Boolean).join(", ")}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <Badge
                            variant={
                              client.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {client.status}
                          </Badge>
                          {client.tier && (
                            <Badge variant="outline" className="capitalize">
                              {client.tier}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Panel - Client Details */}
      <div className="flex-1 overflow-y-auto">
        {!selectedClient ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6">
            <Building2 className="w-16 h-16 mb-4 text-muted-foreground opacity-50" />
            <h2 className="text-xl font-semibold mb-2">No client selected</h2>
            <p className="text-muted-foreground max-w-md">
              Select a client from the list to view their details, contacts,
              agreements, jobs, and analytics.
            </p>
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Client Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarFallback className="text-lg">
                    {getInitials(selectedClient.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-3xl font-bold">
                    {selectedClient.name}
                  </h1>
                  <p className="text-muted-foreground mt-1">
                    {selectedClient.industry || "No industry specified"}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <Badge
                      variant={
                        selectedClient.status === "active"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {selectedClient.status}
                    </Badge>
                    {selectedClient.tier && (
                      <Badge variant="outline" className="capitalize">
                        {selectedClient.tier}
                      </Badge>
                    )}
                    {selectedClient.rating && (
                      <span className="text-sm text-muted-foreground">
                        Rating: {selectedClient.rating}/5
                      </span>
                    )}
                    {(selectedClient.city || selectedClient.province) && (
                      <span className="text-sm text-muted-foreground">
                        • {[selectedClient.city, selectedClient.province].filter(Boolean).join(", ")}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <Button 
                variant="outline" 
                onClick={() => handleEditClient(selectedClient)} 
                data-testid="button-edit-client"
              >
                Edit Client
              </Button>
            </div>

            <Separator />

            {/* Stats Overview */}
            <div className="grid grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Briefcase className="w-4 h-4" />
                    Active Jobs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.activeJobs || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    Total Placements
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.totalPlacements || 0}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Revenue (YTD)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R{(stats?.totalRevenue || 0).toLocaleString()}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-3">
                  <CardDescription>Avg Days to Fill</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats?.avgDaysToFill || 0}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview" data-testid="tab-overview">
                  Overview
                </TabsTrigger>
                <TabsTrigger value="contacts" data-testid="tab-contacts">
                  Contacts ({contacts.length})
                </TabsTrigger>
                <TabsTrigger value="agreements" data-testid="tab-agreements">
                  Agreements ({engagements.length})
                </TabsTrigger>
                <TabsTrigger value="jobs" data-testid="tab-jobs">
                  Jobs ({jobs.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Company Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {selectedClient.registrationNumber && (
                      <div>
                        <h4 className="font-medium mb-2">Registration Number</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedClient.registrationNumber}
                        </p>
                      </div>
                    )}
                    {selectedClient.notes && (
                      <div>
                        <h4 className="font-medium mb-2">Internal Notes</h4>
                        <p className="text-sm text-muted-foreground">
                          {selectedClient.notes}
                        </p>
                      </div>
                    )}
                    <div>
                      <h4 className="font-medium mb-2">Added</h4>
                      <p className="text-sm text-muted-foreground">
                        {formatDistanceToNow(new Date(selectedClient.createdAt))}{" "}
                        ago
                      </p>
                    </div>
                  </CardContent>
                </Card>
                
                {(selectedClient.defaultFeePercent || selectedClient.guaranteePeriodDays || selectedClient.paymentTerms) && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Default Commercial Terms</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {selectedClient.defaultFeePercent && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Default Fee</span>
                          <span className="text-sm font-medium">{selectedClient.defaultFeePercent}%</span>
                        </div>
                      )}
                      {selectedClient.guaranteePeriodDays && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Guarantee Period</span>
                          <span className="text-sm font-medium">{selectedClient.guaranteePeriodDays} days</span>
                        </div>
                      )}
                      {selectedClient.paymentTerms && (
                        <div className="flex justify-between">
                          <span className="text-sm text-muted-foreground">Payment Terms</span>
                          <span className="text-sm font-medium">{selectedClient.paymentTerms}</span>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="contacts" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {contacts.length} contact{contacts.length !== 1 ? "s" : ""}
                  </p>
                  <Button size="sm" data-testid="button-add-contact">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Contact
                  </Button>
                </div>

                {contacts.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No contacts added yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {contacts.map((contact) => (
                      <Card key={contact.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <Avatar>
                                <AvatarFallback>
                                  {getInitials(
                                    `${contact.firstName} ${contact.lastName}`
                                  )}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <h4 className="font-semibold">
                                  {contact.firstName} {contact.lastName}
                                  {contact.isPrimary && (
                                    <Badge variant="outline" className="ml-2">
                                      Primary
                                    </Badge>
                                  )}
                                </h4>
                                {contact.jobTitle && (
                                  <p className="text-sm text-muted-foreground">
                                    {contact.jobTitle}
                                  </p>
                                )}
                                <div className="mt-2 space-y-1">
                                  <p className="text-sm">
                                    Email: {contact.email}
                                  </p>
                                  {contact.phone && (
                                    <p className="text-sm">
                                      Phone: {contact.phone}
                                    </p>
                                  )}
                                  {contact.whatsappNumber && (
                                    <p className="text-sm">
                                      WhatsApp: {contact.whatsappNumber}
                                    </p>
                                  )}
                                </div>
                                {contact.popiaConsentDate && (
                                  <p className="text-xs text-muted-foreground mt-2">
                                    POPIA consent:{" "}
                                    {new Date(
                                      contact.popiaConsentDate
                                    ).toLocaleDateString()}
                                  </p>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`button-edit-contact-${contact.id}`}
                            >
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="agreements" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {engagements.length} agreement
                    {engagements.length !== 1 ? "s" : ""}
                  </p>
                  <Button size="sm" data-testid="button-add-agreement">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Agreement
                  </Button>
                </div>

                {engagements.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No fee agreements added yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {engagements.map((engagement) => (
                      <Card key={engagement.id}>
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <h4 className="font-semibold">
                                  {engagement.feeType === "percentage"
                                    ? "Percentage-based"
                                    : engagement.feeType === "fixed"
                                    ? "Fixed Fee"
                                    : "Hybrid"}
                                </h4>
                                <Badge
                                  variant={
                                    engagement.isActive ? "default" : "secondary"
                                  }
                                >
                                  {engagement.isActive ? "Active" : "Inactive"}
                                </Badge>
                              </div>
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                {engagement.feePercentage && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Fee:
                                    </span>{" "}
                                    {engagement.feePercentage}%
                                  </div>
                                )}
                                {engagement.feeFixed && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      Fixed Fee:
                                    </span>{" "}
                                    R{engagement.feeFixed.toLocaleString()}
                                  </div>
                                )}
                                <div>
                                  <span className="text-muted-foreground">
                                    Guarantee:
                                  </span>{" "}
                                  {engagement.guaranteePeriodDays} days
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Payment Terms:
                                  </span>{" "}
                                  {engagement.paymentTermsDays} days
                                </div>
                                <div>
                                  <span className="text-muted-foreground">
                                    Start Date:
                                  </span>{" "}
                                  {new Date(
                                    engagement.startDate
                                  ).toLocaleDateString()}
                                </div>
                                {engagement.endDate && (
                                  <div>
                                    <span className="text-muted-foreground">
                                      End Date:
                                    </span>{" "}
                                    {new Date(
                                      engagement.endDate
                                    ).toLocaleDateString()}
                                  </div>
                                )}
                              </div>
                            </div>
                            <Button
                              size="sm"
                              variant="outline"
                              data-testid={`button-edit-agreement-${engagement.id}`}
                            >
                              Edit
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="jobs" className="space-y-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    {jobs.length} job{jobs.length !== 1 ? "s" : ""}
                  </p>
                  <Button
                    size="sm"
                    onClick={() => {
                      window.location.href = "/dashboard/recruiter/job-posting";
                    }}
                    data-testid="button-post-job"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Post Job
                  </Button>
                </div>

                {jobs.length === 0 ? (
                  <Card>
                    <CardContent className="p-12 text-center">
                      <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50 text-muted-foreground" />
                      <p className="text-muted-foreground">
                        No jobs posted for this client yet
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {jobs.map((job: any) => (
                      <Card
                        key={job.id}
                        className="hover-elevate cursor-pointer"
                        onClick={() => {
                          window.location.href = `/dashboard/recruiter/job-posting?id=${job.id}`;
                        }}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-semibold">{job.title}</h4>
                              <p className="text-sm text-muted-foreground mt-1">
                                {job.location}
                              </p>
                              <div className="flex items-center gap-2 mt-2">
                                <Badge>{job.status}</Badge>
                                <span className="text-xs text-muted-foreground">
                                  {job.employmentType}
                                </span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Client Dialog */}
      <ClientDialog
        open={clientDialogOpen}
        onOpenChange={setClientDialogOpen}
        client={editingClient}
      />
    </div>
  );
}
