import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Home from "@/pages/Home";
import Recruiters from "@/pages/Recruiters";
import Businesses from "@/pages/Businesses";
import Individuals from "@/pages/Individuals";
import Screening from "@/pages/screening";
import Login from "@/pages/login";
import Onboarding from "@/pages/onboarding";
import OnboardingIndividual from "@/pages/onboarding-individual";
import OnboardingBusiness from "@/pages/onboarding-business";
import OnboardingRecruiter from "@/pages/onboarding-recruiter";
import Candidates from "@/pages/candidates";
import CandidateProfile from "@/pages/candidate-profile";
import CandidateAdd from "@/pages/candidate-add";
import Roles from "@/pages/roles";
import RoleScreening from "@/pages/role-screening";
import RecruiterSettings from "@/pages/RecruiterSettings";
import BusinessSettings from "@/pages/BusinessSettings";
import IndividualSettings from "@/pages/IndividualSettings";
import IndividualProfile from "@/pages/IndividualProfile";
import IndividualProfileEdit from "@/pages/IndividualProfileEdit";
import TestCoach from "@/pages/TestCoach";
import NotFound from "@/pages/not-found";

// Admin pages
import { AdminLayout } from "@/components/admin/AdminLayout";
import AdminOverview from "@/pages/admin/Overview";
import AdminRecruiters from "@/pages/admin/Recruiters";
import AdminBusinesses from "@/pages/admin/Businesses";
import AdminIndividuals from "@/pages/admin/Individuals";
import AdminCandidates from "@/pages/admin/Candidates";
import AdminRoles from "@/pages/admin/Roles";
import AdminCVs from "@/pages/admin/CVs";
import AdminFraudDetection from "@/pages/admin/FraudDetection";

function AdminRouter() {
  return (
    <AdminLayout>
      <Switch>
        <Route path="/admin/overview" component={AdminOverview} />
        <Route path="/admin/recruiters" component={AdminRecruiters} />
        <Route path="/admin/businesses" component={AdminBusinesses} />
        <Route path="/admin/individuals" component={AdminIndividuals} />
        <Route path="/admin/candidates" component={AdminCandidates} />
        <Route path="/admin/roles" component={AdminRoles} />
        <Route path="/admin/cvs" component={AdminCVs} />
        <Route path="/admin/fraud" component={AdminFraudDetection} />
        <Route path="/admin" component={() => {
          const [, navigate] = useLocation();
          navigate("/admin/overview");
          return null;
        }} />
      </Switch>
    </AdminLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/onboarding/individual" component={OnboardingIndividual} />
      <Route path="/onboarding/business" component={OnboardingBusiness} />
      <Route path="/onboarding/recruiter" component={OnboardingRecruiter} />
      <Route path="/recruiters" component={Recruiters} />
      <Route path="/businesses" component={Businesses} />
      <Route path="/individuals" component={Individuals} />
      <Route path="/screening" component={Screening} />
      <Route path="/candidates" component={Candidates} />
      <Route path="/candidates/new" component={CandidateAdd} />
      <Route path="/candidates/:id" component={CandidateProfile} />
      <Route path="/roles" component={Roles} />
      <Route path="/roles/:roleId/screen" component={RoleScreening} />
      <Route path="/settings/recruiter" component={RecruiterSettings} />
      <Route path="/settings/business" component={BusinessSettings} />
      <Route path="/settings/individual" component={IndividualSettings} />
      <Route path="/individuals/profile" component={IndividualProfile} />
      <Route path="/individuals/edit" component={IndividualProfileEdit} />
      <Route path="/test-coach" component={TestCoach} />
      <Route path="/admin/:rest*" component={AdminRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col bg-charcoal">
          <Header />
          <div className="flex-1">
            <Router />
          </div>
          <Footer />
        </div>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
