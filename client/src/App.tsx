import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useAuth as useClerkAuth } from "@clerk/clerk-react";
import { useAuth } from "@/hooks/useAuth";
import { setTokenGetter, queryClient } from "@/lib/queryClient";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Toaster } from "@/components/ui/toaster";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Onboarding from "@/pages/onboarding";
import PantryChef from "@/pages/pantry-chef";
import MealPlanChef from "@/pages/meal-plan-chef";
import MasterChef from "@/pages/master-chef";
import MacrosChef from "@/pages/macros-chef";
import MixologyMaestro from "@/pages/mixology-maestro";
import CalorieTracking from "@/pages/calorie-tracker";
import Pricing from "@/pages/pricing";
import Profile from "@/pages/Profile";
import Recipes from "@/pages/Recipes";
import Pantry from "@/pages/pantry";
import Cookbook from "@/pages/cookbook";
import Blog from "@/pages/blog";
import FAQ from "@/pages/faq";
import NotFound from "@/pages/not-found";
import { LoadingSpinner } from "@/components/LoadingSpinner";

function Router() {
  const { getToken } = useClerkAuth();
  
  // Set up token getter synchronously
  if (getToken) {
    setTokenGetter(getToken);
  }
  
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading ChefGPT...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navigation />
      <main className="flex-1">
        <Switch>
          {!isAuthenticated ? (
            <>
              <Route path="/" component={Landing} />
              <Route path="/pricing" component={Pricing} />
              <Route path="/blog" component={Blog} />
              <Route path="/faq" component={FAQ} />
              <Route path="/pantry-chef" component={PantryChef} />
              <Route path="/meal-plan-chef" component={MealPlanChef} />
              <Route path="/master-chef" component={MasterChef} />
              <Route path="/macros-chef" component={MacrosChef} />
              <Route path="/mixology-maestro" component={MixologyMaestro} />
            </>
          ) : (
            <>
              <Route path="/onboarding" component={Onboarding} />
              {/* Redirect to onboarding if user hasn't set a goal */}
              {user && !user.goal ? (
                <>
                  <Route path="*" component={Onboarding} />
                </>
              ) : (
                <>
                  <Route path="/" component={Dashboard} />
                  <Route path="/dashboard" component={Dashboard} />
                  <Route path="/blog" component={Blog} />
                  <Route path="/faq" component={FAQ} />
                  <Route path="/pantry-chef" component={PantryChef} />
                  <Route path="/meal-plan-chef" component={MealPlanChef} />
                  <Route path="/master-chef" component={MasterChef} />
                  <Route path="/macros-chef" component={MacrosChef} />
                  <Route path="/mixology-maestro" component={MixologyMaestro} />
                  <Route path="/calorie-tracker" component={CalorieTracking} />
                  <Route path="/recipes" component={Recipes} />
                  <Route path="/pantry" component={Pantry} />
                  <Route path="/cookbook" component={Cookbook} />
                  <Route path="/profile" component={Profile} />
                  <Route path="/pricing" component={Pricing} />
                </>
              )}
            </>
          )}
          <Route component={NotFound} />
        </Switch>
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
    </QueryClientProvider>
  );
}

export default App;
