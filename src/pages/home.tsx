import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { 
  ChefHat, 
  Calendar, 
  Camera, 
  Package, 
  BookOpen,
  TrendingUp,
  Clock,
  Utensils
} from "lucide-react";

export default function Home() {
  const { user } = useAuth();

  // Fetch user's recent data
  const { data: recentRecipes } = useQuery({
    queryKey: ['/api/recipes'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });

  const { data: mealPlans } = useQuery({
    queryKey: ['/api/meal-plans'],
    staleTime: 1000 * 60 * 5,
  });

  const { data: calorieData } = useQuery({
    queryKey: ['/api/calories'],
    queryFn: async () => {
      const today = new Date();
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      return fetch(`/api/calories?startDate=${weekAgo.toISOString()}&endDate=${today.toISOString()}`).then(res => res.json());
    },
    staleTime: 1000 * 60 * 5,
  });

  const features = [
    {
      icon: <ChefHat className="h-6 w-6" />,
      title: "🥫 PantryChef",
      description: "Transform your ingredients into delicious recipes",
      href: "/pantry-chef",
      color: "bg-orange-100 text-orange-700"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      title: "📆 MealPlanChef",
      description: "AI-powered personalized meal planning",
      href: "/meal-plan-chef",
      color: "bg-blue-100 text-blue-700"
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: "👨‍🍳 MasterChef",
      description: "Discover restaurant-quality recipes",
      href: "/master-chef",
      color: "bg-purple-100 text-purple-700"
    },
    {
      icon: <TrendingUp className="h-6 w-6" />,
      title: "💪 MacrosChef",
      description: "Hit your nutrition targets perfectly",
      href: "/macros-chef",
      color: "bg-green-100 text-green-700"
    },
    {
      icon: <Utensils className="h-6 w-6" />,
      title: "🍹 MixologyMaestro",
      description: "Craft amazing cocktails and beverages",
      href: "/mixology-maestro",
      color: "bg-pink-100 text-pink-700"
    },
    {
      icon: <Camera className="h-6 w-6" />,
      title: "📊 Calorie Tracker",
      description: "Track calories with AI photo analysis",
      href: "/calorie-tracker",
      color: "bg-yellow-100 text-yellow-700"
    }
  ];

  const quickActions = [
    {
      icon: <Package className="h-5 w-5" />,
      title: "Manage Pantry",
      description: "Add or update your ingredients",
      href: "/pantry",
      color: "text-chef-orange"
    },
    {
      icon: <BookOpen className="h-5 w-5" />,
      title: "My Cookbook",
      description: "View your saved recipes",
      href: "/cookbook",
      color: "text-blue-600"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || "Chef"}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to create something delicious today?
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Recipes Created</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {recentRecipes?.length || 0}
                    </p>
                  </div>
                  <ChefHat className="h-8 w-8 text-chef-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Meal Plans</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {mealPlans?.length || 0}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Calories This Week</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {calorieData?.reduce((sum: number, entry: any) => sum + entry.calories, 0) || 0}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Subscription</p>
                    <p className="text-lg font-semibold text-gray-900 capitalize">
                      {user?.subscriptionTier || "Basic"}
                    </p>
                  </div>
                  <Badge variant={user?.subscriptionTier === 'pro' ? 'default' : 'secondary'}>
                    {user?.subscriptionTier === 'pro' ? 'Pro' : 'Free'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chef Modes */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Chef Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((feature, index) => (
                <Link href={feature.href} key={index}>
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow h-full">
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${feature.color}`}>
                          {feature.icon}
                        </div>
                        <CardTitle className="text-lg">{feature.title}</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>

          {/* Quick Actions & Recent Activity */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Quick Actions */}
            <div>
              <h3 className="text-xl font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                {quickActions.map((action, index) => (
                  <Link href={action.href} key={index}>
                    <Card className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className={`${action.color}`}>
                            {action.icon}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">{action.title}</p>
                            <p className="text-sm text-gray-600">{action.description}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>

            {/* Recent Recipes */}
            <div className="lg:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-gray-900">Recent Recipes</h3>
                <Link href="/cookbook">
                  <Button variant="outline" size="sm">View All</Button>
                </Link>
              </div>
              
              {recentRecipes && recentRecipes.length > 0 ? (
                <div className="space-y-4">
                  {recentRecipes.slice(0, 3).map((recipe: any) => (
                    <Card key={recipe.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 mb-1">{recipe.title}</h4>
                            <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                            <div className="flex items-center space-x-4 text-xs text-gray-500">
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {recipe.prepTime + recipe.cookTime} min
                              </span>
                              <span>{recipe.calories} cal</span>
                              <Badge variant="secondary" className="text-xs">
                                {recipe.chefMode}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-8 text-center">
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No recipes yet!</p>
                    <p className="text-sm text-gray-500 mb-4">
                      Start by choosing a chef mode above to create your first recipe.
                    </p>
                    <Link href="/pantry-chef">
                      <Button className="bg-chef-orange hover:bg-chef-orange/90">
                        Create Your First Recipe
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
