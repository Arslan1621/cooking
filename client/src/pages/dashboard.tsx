import { useEffect } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  ChefHat, 
  Calendar, 
  Camera, 
  Package, 
  Book, 
  Target,
  TrendingUp,
  Clock,
  Award
} from "lucide-react";

export default function Dashboard() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-chef-orange"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Welcome back, {user?.firstName || 'Chef'}! 👋
            </h1>
            <p className="text-gray-600">
              Ready to cook something amazing today? Let's get started with AI-powered cooking.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-chef-orange">12</CardTitle>
                <CardDescription className="text-sm">Recipes Created</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-chef-orange">3</CardTitle>
                <CardDescription className="text-sm">Meal Plans</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-chef-orange">24</CardTitle>
                <CardDescription className="text-sm">Pantry Items</CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-2xl font-bold text-chef-orange">1,247</CardTitle>
                <CardDescription className="text-sm">Calories Today</CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Chef Modes */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Choose Your Chef Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* PantryChef */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" asChild>
                <Link href="/pantry-chef">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-chef-orange/10 rounded-full flex items-center justify-center group-hover:bg-chef-orange/20 transition-colors">
                      <Package className="w-8 h-8 text-chef-orange" />
                    </div>
                    <CardTitle className="text-xl">🥫 PantryChef</CardTitle>
                    <CardDescription className="text-center">
                      Transform your pantry ingredients into delicious meals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange">
                      Use Available Ingredients
                    </Badge>
                  </CardContent>
                </Link>
              </Card>

              {/* MealPlanChef */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" asChild>
                <Link href="/meal-plan-chef">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-chef-orange/10 rounded-full flex items-center justify-center group-hover:bg-chef-orange/20 transition-colors">
                      <Calendar className="w-8 h-8 text-chef-orange" />
                    </div>
                    <CardTitle className="text-xl">📆 MealPlanChef</CardTitle>
                    <CardDescription className="text-center">
                      AI-powered weekly meal plans for your goals
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange">
                      Personalized Nutrition
                    </Badge>
                  </CardContent>
                </Link>
              </Card>

              {/* MasterChef */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" asChild>
                <Link href="/master-chef">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-chef-orange/10 rounded-full flex items-center justify-center group-hover:bg-chef-orange/20 transition-colors">
                      <Award className="w-8 h-8 text-chef-orange" />
                    </div>
                    <CardTitle className="text-xl">👨‍🍳 MasterChef</CardTitle>
                    <CardDescription className="text-center">
                      Restaurant-quality recipes and cooking techniques
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange">
                      Professional Recipes
                    </Badge>
                  </CardContent>
                </Link>
              </Card>

              {/* MacrosChef */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" asChild>
                <Link href="/macros-chef">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-chef-orange/10 rounded-full flex items-center justify-center group-hover:bg-chef-orange/20 transition-colors">
                      <Target className="w-8 h-8 text-chef-orange" />
                    </div>
                    <CardTitle className="text-xl">💪 MacrosChef</CardTitle>
                    <CardDescription className="text-center">
                      Hit your macro targets with precision cooking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange">
                      Macro Tracking
                    </Badge>
                  </CardContent>
                </Link>
              </Card>

              {/* MixologyMaestro */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" asChild>
                <Link href="/mixology-maestro">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-chef-orange/10 rounded-full flex items-center justify-center group-hover:bg-chef-orange/20 transition-colors">
                      <ChefHat className="w-8 h-8 text-chef-orange" />
                    </div>
                    <CardTitle className="text-xl">🍸 MixologyMaestro</CardTitle>
                    <CardDescription className="text-center">
                      Craft perfect cocktails and beverages
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange">
                      Cocktail Creation
                    </Badge>
                  </CardContent>
                </Link>
              </Card>

              {/* Calorie Tracker */}
              <Card className="hover:shadow-lg transition-shadow cursor-pointer group" asChild>
                <Link href="/calorie-tracker">
                  <CardHeader className="text-center pb-4">
                    <div className="w-16 h-16 mx-auto mb-4 bg-chef-orange/10 rounded-full flex items-center justify-center group-hover:bg-chef-orange/20 transition-colors">
                      <Camera className="w-8 h-8 text-chef-orange" />
                    </div>
                    <CardTitle className="text-xl">📸 Calorie Tracker</CardTitle>
                    <CardDescription className="text-center">
                      AI-powered photo food logging and tracking
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange">
                      Photo Analysis
                    </Badge>
                  </CardContent>
                </Link>
              </Card>
            </div>
          </div>

          {/* Quick Access Tools */}
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Access</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/pantry">
                  <Package className="w-6 h-6" />
                  <span>My Pantry</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/cookbook">
                  <Book className="w-6 h-6" />
                  <span>Cookbook</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/calorie-tracker">
                  <TrendingUp className="w-6 h-6" />
                  <span>Progress</span>
                </Link>
              </Button>
              <Button variant="outline" className="h-20 flex flex-col space-y-2" asChild>
                <Link href="/meal-plan-chef">
                  <Clock className="w-6 h-6" />
                  <span>Quick Meal</span>
                </Link>
              </Button>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
            <div className="space-y-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <ChefHat className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">Created "Spicy Thai Basil Chicken"</p>
                        <p className="text-sm text-gray-500">2 hours ago</p>
                      </div>
                    </div>
                    <Badge variant="secondary">New Recipe</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">Generated 7-day meal plan</p>
                        <p className="text-sm text-gray-500">Yesterday</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Meal Plan</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                        <Package className="w-5 h-5 text-purple-600" />
                      </div>
                      <div>
                        <p className="font-medium">Added 5 items to pantry</p>
                        <p className="text-sm text-gray-500">2 days ago</p>
                      </div>
                    </div>
                    <Badge variant="secondary">Pantry Update</Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
