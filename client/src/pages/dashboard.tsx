import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { 
  Utensils, 
  Camera, 
  Calendar, 
  Package, 
  BookOpen,
  Target,
  TrendingUp,
  Clock
} from "lucide-react";
import { Link } from "wouter";

interface DashboardStats {
  totalRecipes: number;
  favoritesCount: number;
  pantryItemsCount: number;
  weeklyMealPlan: boolean;
  todayCalories: number;
  weeklyProgress: number;
}

export default function Dashboard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();

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

  const { data: recipes = [] } = useQuery({
    queryKey: ["/api/recipes"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: pantryItems = [] } = useQuery({
    queryKey: ["/api/pantry"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: mealPlans = [] } = useQuery({
    queryKey: ["/api/meal-plans"],
    enabled: isAuthenticated,
    retry: false,
  });

  const { data: todayEntries = [] } = useQuery({
    queryKey: ["/api/calories", new Date().toISOString().split('T')[0]],
    enabled: isAuthenticated,
    retry: false,
  });

  if (isLoading || !isAuthenticated) {
    return <div className="min-h-screen bg-white">Loading...</div>;
  }

  const todayCalories = todayEntries.reduce((total: number, entry: any) => total + (entry.calories || 0), 0);
  const favoritesCount = recipes.filter((recipe: any) => recipe.isFavorite).length;
  
  const quickActions = [
    {
      title: "PantryChef",
      description: "Generate recipes from your pantry",
      icon: <Package className="h-6 w-6" />,
      color: "bg-blue-500",
      href: "/pantry-chef"
    },
    {
      title: "MealPlanChef", 
      description: "Create personalized meal plans",
      icon: <Calendar className="h-6 w-6" />,
      color: "bg-green-500",
      href: "/meal-plan-chef"
    },
    {
      title: "Calorie Tracker",
      description: "Track your daily nutrition",
      icon: <Camera className="h-6 w-6" />,
      color: "bg-purple-500",
      href: "/calorie-tracker"
    },
    {
      title: "MasterChef",
      description: "Search & generate any recipe",
      icon: <Utensils className="h-6 w-6" />,
      color: "bg-chef-orange",
      href: "/master-chef"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || user?.email?.split('@')[0] || 'Chef'}! 👋
            </h1>
            <p className="text-gray-600">Ready to cook something amazing today?</p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                    <p className="text-2xl font-bold text-gray-900">{recipes.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-chef-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Favorites</p>
                    <p className="text-2xl font-bold text-gray-900">{favoritesCount}</p>
                  </div>
                  <Target className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Pantry Items</p>
                    <p className="text-2xl font-bold text-gray-900">{pantryItems.length}</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Calories</p>
                    <p className="text-2xl font-bold text-gray-900">{todayCalories}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quickActions.map((action, index) => (
                <Link key={index} href={action.href}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white mb-4`}>
                        {action.icon}
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{action.title}</h3>
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
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Recent Recipes
                </CardTitle>
                <CardDescription>Your latest culinary creations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recipes.slice(0, 5).map((recipe: any) => (
                    <div key={recipe.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium text-gray-900">{recipe.title}</p>
                        <p className="text-sm text-gray-600">
                          <Clock className="h-4 w-4 inline mr-1" />
                          {recipe.cookingTime || 0} mins
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {recipe.isFavorite && (
                          <Badge variant="secondary">Favorite</Badge>
                        )}
                        <Badge>{recipe.mealType || 'Recipe'}</Badge>
                      </div>
                    </div>
                  ))}
                  {recipes.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Utensils className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No recipes yet. Create your first recipe!</p>
                      <Button className="mt-4 bg-chef-orange hover:bg-orange-600" asChild>
                        <Link href="/pantry-chef">Get Started</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Meal Plans */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Meal Plans
                </CardTitle>
                <CardDescription>Your upcoming meal schedules</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {mealPlans.slice(0, 3).map((plan: any) => (
                    <div key={plan.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{plan.name}</h4>
                        <Badge>{plan.goal}</Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(plan.startDate).toLocaleDateString()} - {new Date(plan.endDate).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {plan.meals.length} days planned
                      </p>
                    </div>
                  ))}
                  {mealPlans.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No meal plans yet. Create your first plan!</p>
                      <Button className="mt-4 bg-chef-orange hover:bg-orange-600" asChild>
                        <Link href="/meal-plan-chef">Create Meal Plan</Link>
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
