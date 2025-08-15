import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import PantryChef from "@/pages/pantry-chef";
import MealPlanChef from "@/pages/meal-plan-chef";
import MasterChef from "@/pages/master-chef";
import MacrosChef from "@/pages/macros-chef";
import MixologyMaestro from "@/pages/mixology-maestro";
import CalorieTracker from "@/pages/calorie-tracker";
import PantryManager from "@/pages/pantry-manager";
import Cookbook from "@/pages/cookbook";
import Pricing from "@/pages/pricing";
import Blog from "@/pages/blog";
import FAQ from "@/pages/faq";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <>
          <Route path="/" component={Landing} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/blog" component={Blog} />
          <Route path="/faq" component={FAQ} />
        </>
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/pantry-chef" component={PantryChef} />
          <Route path="/meal-plan-chef" component={MealPlanChef} />
          <Route path="/master-chef" component={MasterChef} />
          <Route path="/macros-chef" component={MacrosChef} />
          <Route path="/mixology-maestro" component={MixologyMaestro} />
          <Route path="/calorie-tracker" component={CalorieTracker} />
          <Route path="/pantry" component={PantryManager} />
          <Route path="/cookbook" component={Cookbook} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/blog" component={Blog} />
          <Route path="/faq" component={FAQ} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
