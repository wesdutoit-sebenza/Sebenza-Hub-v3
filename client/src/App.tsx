import { Switch, Route } from "wouter";
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
import NotFound from "@/pages/not-found";

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
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="min-h-screen flex flex-col">
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
