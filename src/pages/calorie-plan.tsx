import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { getQueryFn } from "@/lib/queryClient";
import { type User } from "@shared/schema";
import { Flame, Beef, Wheat, Droplet } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function CaloriePlan() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const { data: currentUser, isLoading } = useQuery<User>({
    queryKey: ["/api/auth/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    staleTime: 0,
    gcTime: 0,
  });

  if (isLoading || !currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <p className="text-gray-600">Loading your plan...</p>
        </div>
      </div>
    );
  }

  if (!currentUser.dailyCalorieTarget) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Error loading plan. Please try again.</p>
      </div>
    );
  }

  const macros = (currentUser.dailyMacros as any) || {
    protein: 0,
    carbs: 0,
    fat: 0,
    fiber: 0,
  };

  const calorieTarget = parseInt(String(currentUser.dailyCalorieTarget)) || 0;

  const calorieData = [
    { label: "Calories", value: calorieTarget, icon: Flame, color: "bg-orange-100", textColor: "text-orange-600" },
    { label: "Protein", value: `${macros.protein}g`, icon: Beef, color: "bg-red-100", textColor: "text-red-600" },
    { label: "Carbs", value: `${macros.carbs}g`, icon: Wheat, color: "bg-yellow-100", textColor: "text-yellow-600" },
    { label: "Fats", value: `${macros.fat}g`, icon: Droplet, color: "bg-blue-100", textColor: "text-blue-600" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-chef-gray to-white pt-32 pb-16">
      <div className="max-w-3xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Your Calorie Plan is Ready! 🎉
          </h1>
          <p className="text-lg text-gray-600">
            Based on your goals, we've created a personalized calorie plan for you.<br />
            This is your daily recommendation to help you achieve your goals.
          </p>
        </div>

        {/* Macro Cards Grid */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          {calorieData.map((item) => {
            const Icon = item.icon;
            return (
              <Card key={item.label} className="border-2">
                <CardContent className="pt-8 pb-8 text-center">
                  <div className={`${item.color} w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`${item.textColor} w-10 h-10`} />
                  </div>
                  <h3 className="text-gray-600 text-sm font-medium mb-2">{item.label}</h3>
                  <p className="text-3xl font-bold text-gray-900">{item.value}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Plan Details */}
        <Card className="border-2 mb-12">
          <CardHeader>
            <CardTitle>Your Plan Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {currentUser.goal && (
                <div>
                  <p className="text-sm text-gray-600">Primary Goal</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {currentUser.goal.replace(/_/g, " ")}
                  </p>
                </div>
              )}
              {currentUser.goalAmount && (
                <div>
                  <p className="text-sm text-gray-600">Target Amount</p>
                  <p className="font-semibold text-gray-900">{currentUser.goalAmount} kg</p>
                </div>
              )}
              {currentUser.goalTimeline && (
                <div>
                  <p className="text-sm text-gray-600">Timeline</p>
                  <p className="font-semibold text-gray-900">{currentUser.goalTimeline}</p>
                </div>
              )}
              {currentUser.activityLevel && (
                <div>
                  <p className="text-sm text-gray-600">Activity Level</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {currentUser.activityLevel.replace(/_/g, " ")}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-4">
          <Button
            variant="outline"
            className="text-lg py-6"
            onClick={() => navigate("/pricing")}
            data-testid="button-upgrade-pro"
          >
            Upgrade to Pro Plan
          </Button>
          <Button
            className="bg-chef-orange hover:bg-chef-orange/90 text-lg py-6"
            onClick={() => navigate("/dashboard")}
            data-testid="button-continue-free"
          >
            Continue with Free Plan
          </Button>
        </div>

        <p className="text-center text-gray-600 text-sm mt-8">
          With the Pro plan, unlock personalized meal planning, advanced nutrition tracking, and exclusive recipes
        </p>
      </div>
    </div>
  );
}
