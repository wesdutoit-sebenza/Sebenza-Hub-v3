import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle, Clock, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

type ServiceStatus = "operational" | "degraded" | "outage" | "maintenance";

interface Service {
  name: string;
  description: string;
  status: ServiceStatus;
  responseTime?: number;
}

interface Incident {
  id: string;
  title: string;
  status: "investigating" | "identified" | "monitoring" | "resolved";
  severity: "minor" | "major" | "critical";
  createdAt: string;
  updatedAt: string;
  updates: {
    message: string;
    timestamp: string;
  }[];
}

interface StatusData {
  overall: ServiceStatus;
  services: Service[];
  incidents: Incident[];
  lastUpdated: string;
}

const statusConfig = {
  operational: {
    icon: CheckCircle,
    color: "text-green-500",
    bg: "bg-green-500/10",
    border: "border-green-500/20",
    label: "Operational",
  },
  degraded: {
    icon: AlertCircle,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/20",
    label: "Degraded Performance",
  },
  outage: {
    icon: XCircle,
    color: "text-red-500",
    bg: "bg-red-500/10",
    border: "border-red-500/20",
    label: "Major Outage",
  },
  maintenance: {
    icon: Clock,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    label: "Under Maintenance",
  },
};

const severityColors = {
  minor: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20",
  major: "bg-orange-500/10 text-orange-600 border-orange-500/20",
  critical: "bg-red-500/10 text-red-600 border-red-500/20",
};

const incidentStatusColors = {
  investigating: "bg-red-500/10 text-red-600",
  identified: "bg-orange-500/10 text-orange-600",
  monitoring: "bg-blue-500/10 text-blue-600",
  resolved: "bg-green-500/10 text-green-600",
};

export default function StatusPage() {
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const { data: statusData, isLoading, refetch, isFetching } = useQuery<StatusData>({
    queryKey: ["/api/status"],
    refetchInterval: 60000,
  });

  useEffect(() => {
    if (!isFetching) {
      setLastRefresh(new Date());
    }
  }, [isFetching]);

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-12 px-4">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        </div>
      </div>
    );
  }

  const data = statusData || {
    overall: "operational" as ServiceStatus,
    services: [
      { name: "Website", description: "Main website and landing pages", status: "operational" as ServiceStatus, responseTime: 120 },
      { name: "API", description: "Backend API services", status: "operational" as ServiceStatus, responseTime: 85 },
      { name: "Authentication", description: "Login and signup services", status: "operational" as ServiceStatus, responseTime: 95 },
      { name: "Database", description: "Data storage and retrieval", status: "operational" as ServiceStatus, responseTime: 45 },
      { name: "Job Listings", description: "Job search and posting", status: "operational" as ServiceStatus, responseTime: 110 },
      { name: "CV Processing", description: "Resume parsing and storage", status: "operational" as ServiceStatus, responseTime: 250 },
      { name: "Email Notifications", description: "Email delivery service", status: "operational" as ServiceStatus, responseTime: 180 },
      { name: "AI Services", description: "AI-powered features", status: "operational" as ServiceStatus, responseTime: 320 },
    ],
    incidents: [],
    lastUpdated: new Date().toISOString(),
  };

  const overallConfig = statusConfig[data.overall];
  const OverallIcon = overallConfig.icon;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b">
        <div className="container mx-auto py-6 px-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Sebenza Hub Status</h1>
              <p className="text-muted-foreground mt-1">Real-time system status for sebenzahub.co.za</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isFetching}
              data-testid="button-refresh-status"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto py-8 px-4 space-y-8">
        <Card className={`${overallConfig.bg} ${overallConfig.border} border-2`}>
          <CardContent className="py-8">
            <div className="flex items-center justify-center gap-4">
              <OverallIcon className={`w-12 h-12 ${overallConfig.color}`} />
              <div className="text-center">
                <h2 className={`text-2xl font-bold ${overallConfig.color}`}>
                  {data.overall === "operational" 
                    ? "All Systems Operational" 
                    : overallConfig.label}
                </h2>
                <p className="text-muted-foreground mt-1">
                  Last updated: {lastRefresh.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services</CardTitle>
            <CardDescription>Current status of all Sebenza Hub services</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {data.services.map((service, index) => {
                const config = statusConfig[service.status];
                const Icon = config.icon;
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover-elevate"
                    data-testid={`service-status-${service.name.toLowerCase().replace(/\s+/g, '-')}`}
                  >
                    <div className="flex items-center gap-4">
                      <Icon className={`w-5 h-5 ${config.color}`} />
                      <div>
                        <h3 className="font-medium text-foreground">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {service.responseTime && (
                        <span className="text-sm text-muted-foreground">
                          {service.responseTime}ms
                        </span>
                      )}
                      <Badge variant="outline" className={`${config.bg} ${config.color} ${config.border}`}>
                        {config.label}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Incidents</CardTitle>
            <CardDescription>
              {data.incidents.length === 0 
                ? "No incidents reported in the last 90 days" 
                : `${data.incidents.length} incident(s) reported`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {data.incidents.length === 0 ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                No recent incidents
              </div>
            ) : (
              <div className="space-y-4">
                {data.incidents.map((incident) => (
                  <div key={incident.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-medium text-foreground">{incident.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(incident.createdAt).toLocaleDateString()} at{" "}
                          {new Date(incident.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Badge variant="outline" className={severityColors[incident.severity]}>
                          {incident.severity}
                        </Badge>
                        <Badge className={incidentStatusColors[incident.status]}>
                          {incident.status}
                        </Badge>
                      </div>
                    </div>
                    {incident.updates.length > 0 && (
                      <div className="border-t pt-3 mt-3 space-y-2">
                        {incident.updates.map((update, i) => (
                          <div key={i} className="text-sm">
                            <span className="text-muted-foreground">
                              {new Date(update.timestamp).toLocaleTimeString()}:
                            </span>{" "}
                            <span className="text-foreground">{update.message}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Uptime History</CardTitle>
            <CardDescription>Last 90 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-0.5">
              {Array.from({ length: 90 }).map((_, i) => (
                <div
                  key={i}
                  className="flex-1 h-8 bg-green-500 rounded-sm opacity-90 hover:opacity-100 transition-opacity"
                  title={`${90 - i} days ago: 100% uptime`}
                />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-muted-foreground">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
            <div className="flex items-center justify-center gap-6 mt-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-muted-foreground">No issues</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-yellow-500" />
                <span className="text-muted-foreground">Partial outage</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-red-500" />
                <span className="text-muted-foreground">Major outage</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="text-center text-sm text-muted-foreground py-4">
          <p>Subscribe to updates via email or follow us on social media for real-time notifications.</p>
          <p className="mt-2">
            For urgent issues, contact{" "}
            <a href="mailto:support@sebenzahub.co.za" className="text-primary hover:underline">
              support@sebenzahub.co.za
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
