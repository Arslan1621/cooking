import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import RecipeCard from "@/components/recipe-card";
import MealPlanCard from "@/components/meal-plan-card";
import { Search, Filter, BookOpen, Calendar, ChefHat, Heart, Clock, Users } from "lucide-react";

const cuisineFilters = [
  "Italian", "French", "Japanese", "Chinese", "Thai", "Indian", "Mexican", 
  "Mediterranean", "American", "Korean"
];

const mealTypeFilters = ["breakfast", "lunch", "dinner", "snack", "appetizer", "dessert"];
const difficultyFilters = ["easy", "medium", "hard"];
const chefModeFilters = ["pantry", "master", "macros", "mixology", "meal-plan"];

export default function Cookbook() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();

  const [searchTerm, setSearchTerm] = useState("");
  const [cuisineFilter, setCuisineFilter] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [chefModeFilter, setChefModeFilter] = useState("");

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

  // Get user's recipes
  const { data: recipes } = useQuery({
    queryKey: ["/api/recipes"],
    enabled: isAuthenticated,
  });

  // Get saved recipes
  const { data: savedRecipes } = useQuery({
    queryKey: ["/api/recipes/saved"],
    enabled: isAuthenticated,
  });

  // Get meal plans
  const { data: mealPlans } = useQuery({
    queryKey: ["/api/meal-plans"],
    enabled: isAuthenticated,
  });

  // Filter recipes
  const filterRecipes = (recipeList: any[]) => {
    return recipeList?.filter((recipe: any) => {
      const matchesSearch = recipe.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          recipe.ingredients?.some((ing: string) => 
                            ing.toLowerCase().includes(searchTerm.toLowerCase())
                          );
      
      const matchesCuisine = !cuisineFilter || recipe.cuisine === cuisineFilter.toLowerCase();
      const matchesMealType = !mealTypeFilter || recipe.mealType === mealTypeFilter;
      const matchesDifficulty = !difficultyFilter || recipe.difficulty === difficultyFilter;
      const matchesChefMode = !chefModeFilter || recipe.chefMode === chefModeFilter;
      
      return matchesSearch && matchesCuisine && matchesMealType && matchesDifficulty && matchesChefMode;
    }) || [];
  };

  const filteredMyRecipes = filterRecipes(recipes);
  const filteredSavedRecipes = filterRecipes(savedRecipes);

  // Get recipe statistics
  const getRecipeStats = (recipeList: any[]) => {
    const totalRecipes = recipeList?.length || 0;
    const avgCalories = recipeList?.length 
      ? Math.round(recipeList.reduce((acc, recipe) => acc + (recipe.calories || 0), 0) / recipeList.length)
      : 0;
    const cuisineCount = [...new Set(recipeList?.map(r => r.cuisine).filter(Boolean))].length;
    const avgCookTime = recipeList?.length
      ? Math.round(recipeList.reduce((acc, recipe) => acc + ((recipe.prepTime || 0) + (recipe.cookTime || 0)), 0) / recipeList.length)
      : 0;
    
    return { totalRecipes, avgCalories, cuisineCount, avgCookTime };
  };

  const myRecipeStats = getRecipeStats(recipes);
  const savedRecipeStats = getRecipeStats(savedRecipes);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="chef-spinner w-32 h-32"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chef-gray">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              📖 My Cookbook
            </h1>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Your personal collection of AI-generated recipes, saved favorites, and meal plans. 
              Organize, search, and discover your culinary creations.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="space-y-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search recipes by name, ingredients, or description..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filters */}
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  <Select value={cuisineFilter} onValueChange={setCuisineFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Cuisines" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Cuisines</SelectItem>
                      {cuisineFilters.map((cuisine) => (
                        <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                          {cuisine}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={mealTypeFilter} onValueChange={setMealTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Meals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Meals</SelectItem>
                      {mealTypeFilters.map((meal) => (
                        <SelectItem key={meal} value={meal}>
                          {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      {difficultyFilters.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Select value={chefModeFilter} onValueChange={setChefModeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Modes</SelectItem>
                      {chefModeFilters.map((mode) => (
                        <SelectItem key={mode} value={mode}>
                          {mode.charAt(0).toUpperCase() + mode.slice(1)}Chef
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setSearchTerm("");
                      setCuisineFilter("");
                      setMealTypeFilter("");
                      setDifficultyFilter("");
                      setChefModeFilter("");
                    }}
                    className="flex items-center gap-2"
                  >
                    <Filter className="w-4 h-4" />
                    Clear Filters
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Content Tabs */}
          <Tabs defaultValue="my-recipes" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="my-recipes" className="flex items-center gap-2">
                <ChefHat className="w-4 h-4" />
                My Recipes
              </TabsTrigger>
              <TabsTrigger value="saved-recipes" className="flex items-center gap-2">
                <Heart className="w-4 h-4" />
                Saved Recipes
              </TabsTrigger>
              <TabsTrigger value="meal-plans" className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Meal Plans
              </TabsTrigger>
            </TabsList>

            {/* My Recipes */}
            <TabsContent value="my-recipes" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{myRecipeStats.totalRecipes}</div>
                    <div className="text-sm text-gray-600">Total Recipes</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{myRecipeStats.avgCalories}</div>
                    <div className="text-sm text-gray-600">Avg Calories</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{myRecipeStats.cuisineCount}</div>
                    <div className="text-sm text-gray-600">Cuisines</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{myRecipeStats.avgCookTime}</div>
                    <div className="text-sm text-gray-600">Avg Time (min)</div>
                  </CardContent>
                </Card>
              </div>

              {/* Recipes Grid */}
              {filteredMyRecipes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {recipes?.length === 0 ? "No recipes yet" : "No recipes match your filters"}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {recipes?.length === 0 
                        ? "Start creating recipes with our AI chef assistants."
                        : "Try adjusting your search or filter criteria."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredMyRecipes.map((recipe: any) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Saved Recipes */}
            <TabsContent value="saved-recipes" className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{savedRecipeStats.totalRecipes}</div>
                    <div className="text-sm text-gray-600">Saved Recipes</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{savedRecipeStats.avgCalories}</div>
                    <div className="text-sm text-gray-600">Avg Calories</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{savedRecipeStats.cuisineCount}</div>
                    <div className="text-sm text-gray-600">Cuisines</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{savedRecipeStats.avgCookTime}</div>
                    <div className="text-sm text-gray-600">Avg Time (min)</div>
                  </CardContent>
                </Card>
              </div>

              {/* Saved Recipes Grid */}
              {filteredSavedRecipes.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Heart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {savedRecipes?.length === 0 ? "No saved recipes yet" : "No saved recipes match your filters"}
                    </h3>
                    <p className="text-gray-600">
                      {savedRecipes?.length === 0 
                        ? "Save recipes you love to build your personal collection."
                        : "Try adjusting your search or filter criteria."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSavedRecipes.map((recipe: any) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Meal Plans */}
            <TabsContent value="meal-plans" className="space-y-6">
              {/* Meal Plans Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">{mealPlans?.length || 0}</div>
                    <div className="text-sm text-gray-600">Meal Plans</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">
                      {mealPlans?.reduce((acc: number, plan: any) => {
                        const meals = plan.meals as any[];
                        return acc + (meals?.length || 0);
                      }, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Total Meals</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">
                      {mealPlans?.reduce((acc: number, plan: any) => {
                        return acc + (plan.shoppingList?.length || 0);
                      }, 0) || 0}
                    </div>
                    <div className="text-sm text-gray-600">Ingredients</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-chef-orange">
                      {mealPlans?.length 
                        ? Math.round(mealPlans.reduce((acc: number, plan: any) => {
                            const start = new Date(plan.startDate);
                            const end = new Date(plan.endDate);
                            const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
                            return acc + days;
                          }, 0) / mealPlans.length)
                        : 0
                      }
                    </div>
                    <div className="text-sm text-gray-600">Avg Days</div>
                  </CardContent>
                </Card>
              </div>

              {/* Meal Plans Grid */}
              {!mealPlans || mealPlans.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No meal plans yet</h3>
                    <p className="text-gray-600 mb-4">
                      Create personalized meal plans with MealPlanChef for organized cooking.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {mealPlans.map((mealPlan: any) => (
                    <MealPlanCard key={mealPlan.id} mealPlan={mealPlan} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      <Footer />
    </div>
  );
}
