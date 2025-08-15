import { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Link } from "wouter";
import { Recipe, CalorieEntry, MealPlan } from "@/types/recipe";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  const { data: recipes, isLoading: recipesLoading } = useQuery({
    queryKey: ["/api/recipes"],
    enabled: isAuthenticated,
  });

  const { data: calorieEntries, isLoading: caloriesLoading } = useQuery({
    queryKey: ["/api/calories"],
    enabled: isAuthenticated,
  });

  const { data: mealPlans, isLoading: mealPlansLoading } = useQuery({
    queryKey: ["/api/meal-plans"],
    enabled: isAuthenticated,
  });

  const todayEntries = calorieEntries?.filter((entry: CalorieEntry) => {
    const entryDate = new Date(entry.date).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  }) || [];

  const totalCaloriesToday = todayEntries.reduce((sum: number, entry: CalorieEntry) => sum + entry.calories, 0);

  const quickActions = [
    {
      title: "Generate Recipe",
      description: "Create recipes from your pantry",
      icon: "🧑‍🍳",
      href: "/pantry-chef",
      color: "pantry-gradient"
    },
    {
      title: "Track Calories",
      description: "Snap a photo to log your meal",
      icon: "📷",
      href: "/calories",
      color: "chef-gradient"
    },
    {
      title: "Plan Meals",
      description: "AI-powered weekly meal planning",
      icon: "📅",
      href: "/meal-plan-chef",
      color: "meal-plan-gradient"
    },
    {
      title: "Manage Pantry",
      description: "Keep track of your ingredients",
      icon: "🥫",
      href: "/pantry",
      color: "pantry-gradient"
    }
  ];

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Chef'}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to cook something amazing today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Calories</CardTitle>
              <i className="fas fa-fire text-chef-orange"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCaloriesToday}</div>
              <p className="text-xs text-muted-foreground">
                {todayEntries.length} entries logged
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recipes Created</CardTitle>
              <i className="fas fa-book text-chef-orange"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recipes?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                All time recipes
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Meal Plans</CardTitle>
              <i className="fas fa-calendar text-chef-orange"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{mealPlans?.length || 0}</div>
              <p className="text-xs text-muted-foreground">
                Active meal plans
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Subscription</CardTitle>
              <i className="fas fa-crown text-chef-orange"></i>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                <Badge variant={user?.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                  {user?.subscriptionTier || 'Basic'}
                </Badge>
              </div>
              {user?.subscriptionTier === 'basic' && (
                <p className="text-xs text-muted-foreground">
                  <Link href="/pricing" className="text-chef-orange hover:underline">
                    Upgrade to Pro
                  </Link>
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} href={action.href}>
                <Card className="recipe-card cursor-pointer h-full">
                  <CardContent className="p-6 text-center">
                    <div className={`w-16 h-16 rounded-full bg-gradient-to-r ${action.color} flex items-center justify-center mx-auto mb-4 text-2xl`}>
                      {action.icon}
                    </div>
                    <h3 className="font-bold text-lg mb-2">{action.title}</h3>
                    <p className="text-gray-600 text-sm">{action.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Recent Recipes */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Recent Recipes</span>
                <Link href="/recipes">
                  <Button variant="outline" size="sm">
                    View All
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recipesLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : recipes?.length ? (
                <div className="space-y-4">
                  {recipes.slice(0, 3).map((recipe: Recipe) => (
                    <div key={recipe.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50">
                      <div className="w-12 h-12 bg-chef-orange/10 rounded-lg flex items-center justify-center">
                        <span className="text-chef-orange">
                          {recipe.chefMode === 'pantry' ? '🥫' :
                           recipe.chefMode === 'master' ? '👨‍🍳' :
                           recipe.chefMode === 'macros' ? '📊' :
                           recipe.chefMode === 'mixology' ? '🍸' : '🍽️'}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium line-clamp-1">{recipe.title}</h4>
                        <p className="text-sm text-gray-600">
                          {recipe.calories} cal • {recipe.servings} servings
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-book text-gray-300 text-4xl mb-4"></i>
                  <p className="text-gray-500">No recipes yet</p>
                  <Link href="/pantry-chef">
                    <Button size="sm" className="mt-2">
                      Create Your First Recipe
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Today's Meals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Today's Meals</span>
                <Link href="/calories">
                  <Button variant="outline" size="sm">
                    Log Meal
                  </Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {caloriesLoading ? (
                <div className="flex justify-center py-4">
                  <LoadingSpinner />
                </div>
              ) : todayEntries?.length ? (
                <div className="space-y-4">
                  {todayEntries.slice(0, 4).map((entry: CalorieEntry) => (
                    <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-chef-orange/10 rounded-full flex items-center justify-center">
                          <span>
                            {entry.mealType === 'breakfast' ? '🥞' :
                             entry.mealType === 'lunch' ? '🥗' :
                             entry.mealType === 'dinner' ? '🍽️' : '🍿'}
                          </span>
                        </div>
                        <div>
                          <h4 className="font-medium">{entry.foodName}</h4>
                          <p className="text-sm text-gray-600 capitalize">{entry.mealType}</p>
                        </div>
                      </div>
                      <span className="font-medium text-chef-orange">{entry.calories} cal</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <i className="fas fa-utensils text-gray-300 text-4xl mb-4"></i>
                  <p className="text-gray-500">No meals logged today</p>
                  <Link href="/calories">
                    <Button size="sm" className="mt-2">
                      Log Your First Meal
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
