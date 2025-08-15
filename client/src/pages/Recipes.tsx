import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RecipeCard } from "@/components/RecipeCard";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Recipe } from "@/types/recipe";
import { Link } from "wouter";

export default function Recipes() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterChefMode, setFilterChefMode] = useState<string>("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("");
  const [filterMealType, setFilterMealType] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: recipes, isLoading: recipesLoading } = useQuery({
    queryKey: ["/api/recipes"],
  });

  const { data: savedRecipes, isLoading: savedLoading } = useQuery({
    queryKey: ["/api/saved-recipes"],
  });

  const deleteRecipeMutation = useMutation({
    mutationFn: async (recipeId: string) => {
      await apiRequest(`/api/recipes/${recipeId}`, {
        method: "DELETE",
      });
    },
    onSuccess: () => {
      toast({
        title: "Recipe Deleted",
        description: "Recipe has been removed from your collection.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
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
      toast({
        title: "Delete Failed",
        description: "Failed to delete recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Filter recipes based on search and filters
  const filteredRecipes = recipes?.filter((recipe: Recipe) => {
    const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          recipe.ingredients.some(ingredient => 
                            ingredient.toLowerCase().includes(searchQuery.toLowerCase())
                          );
    
    const matchesChefMode = !filterChefMode || recipe.chefMode === filterChefMode;
    const matchesDifficulty = !filterDifficulty || recipe.difficulty === filterDifficulty;
    const matchesMealType = !filterMealType || recipe.mealType === filterMealType;
    
    return matchesSearch && matchesChefMode && matchesDifficulty && matchesMealType;
  }) || [];

  const chefModes = [
    { value: "pantry", label: "🥫 PantryChef", color: "bg-yellow-100 text-yellow-800" },
    { value: "master", label: "👨‍🍳 MasterChef", color: "bg-red-100 text-red-800" },
    { value: "macros", label: "📊 MacrosChef", color: "bg-green-100 text-green-800" },
    { value: "mixology", label: "🍸 MixologyMaestro", color: "bg-purple-100 text-purple-800" },
    { value: "meal-plan", label: "📅 MealPlanChef", color: "bg-blue-100 text-blue-800" },
  ];

  const difficulties = ["novice", "intermediate", "expert"];
  const mealTypes = ["breakfast", "lunch", "dinner", "snack", "drink"];

  const getChefModeStats = () => {
    const stats = chefModes.map(mode => ({
      ...mode,
      count: recipes?.filter((r: Recipe) => r.chefMode === mode.value).length || 0
    }));
    return stats;
  };

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            My Recipe <span className="text-chef-orange">Cookbook</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Your personal collection of AI-generated recipes. Organize, search, and cook your way to delicious meals.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {getChefModeStats().map((mode) => (
            <Card key={mode.value} className="recipe-card cursor-pointer hover:shadow-md">
              <CardContent className="p-4 text-center">
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium mb-2 ${mode.color}`}>
                  {mode.label.split(' ')[0]} {mode.count}
                </div>
                <div className="text-xs text-gray-500">{mode.label.split(' ')[1]}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <Tabs defaultValue="my-recipes" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="my-recipes">My Recipes</TabsTrigger>
            <TabsTrigger value="saved">Saved Recipes</TabsTrigger>
          </TabsList>

          <TabsContent value="my-recipes">
            {/* Search and Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                  <div className="lg:col-span-2">
                    <Input
                      placeholder="Search recipes, ingredients..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  
                  <Select value={filterChefMode} onValueChange={setFilterChefMode}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Chef Modes" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Chef Modes</SelectItem>
                      {chefModes.map((mode) => (
                        <SelectItem key={mode.value} value={mode.value}>
                          {mode.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterDifficulty} onValueChange={setFilterDifficulty}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Levels" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Levels</SelectItem>
                      {difficulties.map((difficulty) => (
                        <SelectItem key={difficulty} value={difficulty}>
                          {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  <Select value={filterMealType} onValueChange={setFilterMealType}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Meals" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Meals</SelectItem>
                      {mealTypes.map((meal) => (
                        <SelectItem key={meal} value={meal}>
                          {meal.charAt(0).toUpperCase() + meal.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                {(searchQuery || filterChefMode || filterDifficulty || filterMealType) && (
                  <div className="mt-4 flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Active filters:</span>
                    {searchQuery && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setSearchQuery("")}>
                        Search: "{searchQuery}" ✕
                      </Badge>
                    )}
                    {filterChefMode && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setFilterChefMode("")}>
                        Mode: {chefModes.find(m => m.value === filterChefMode)?.label} ✕
                      </Badge>
                    )}
                    {filterDifficulty && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setFilterDifficulty("")}>
                        Level: {filterDifficulty} ✕
                      </Badge>
                    )}
                    {filterMealType && (
                      <Badge variant="outline" className="cursor-pointer" onClick={() => setFilterMealType("")}>
                        Meal: {filterMealType} ✕
                      </Badge>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => {
                        setSearchQuery("");
                        setFilterChefMode("");
                        setFilterDifficulty("");
                        setFilterMealType("");
                      }}
                    >
                      Clear All
                    </Button>
                  </div>
                )}
                
                <div className="mt-2 text-sm text-gray-600">
                  Showing {filteredRecipes.length} of {recipes?.length || 0} recipes
                </div>
              </CardContent>
            </Card>

            {/* Recipe Grid */}
            {recipesLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : filteredRecipes.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe: Recipe) => (
                  <div key={recipe.id} className="relative">
                    <RecipeCard recipe={recipe} />
                    {/* Recipe Actions Overlay */}
                    <div className="absolute top-2 left-2 flex space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="bg-white/90 hover:bg-white text-red-600 hover:text-red-700 w-8 h-8 p-0"
                        onClick={() => deleteRecipeMutation.mutate(recipe.id)}
                        disabled={deleteRecipeMutation.isPending}
                      >
                        {deleteRecipeMutation.isPending ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <i className="fas fa-trash text-xs"></i>
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : recipes?.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">👨‍🍳</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Recipes Yet</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Start creating delicious recipes with our AI chefs. Each recipe you generate will appear here in your personal cookbook.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Link href="/pantry-chef">
                    <Button className="bg-yellow-500 hover:bg-yellow-600 text-white">
                      🥫 Try PantryChef
                    </Button>
                  </Link>
                  <Link href="/master-chef">
                    <Button className="bg-red-500 hover:bg-red-600 text-white">
                      👨‍🍳 Try MasterChef
                    </Button>
                  </Link>
                  <Link href="/macros-chef">
                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                      📊 Try MacrosChef
                    </Button>
                  </Link>
                  <Link href="/mixology">
                    <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                      🍸 Try MixologyMaestro
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-4xl mb-4">🔍</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">No Recipes Found</h3>
                <p className="text-gray-600">
                  Try adjusting your search terms or filters to find more recipes.
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="saved">
            {/* Saved Recipes */}
            {savedLoading ? (
              <div className="flex justify-center py-12">
                <LoadingSpinner size="lg" />
              </div>
            ) : savedRecipes?.length > 0 ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {savedRecipes.map((saved: any) => (
                  <RecipeCard key={saved.id} recipe={saved.recipe} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="text-6xl mb-6">❤️</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Saved Recipes</h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  When you save recipes you love, they'll appear here. Start by creating or finding recipes to save to your favorites.
                </p>
                <Link href="/recipes">
                  <Button>
                    <i className="fas fa-heart mr-2"></i>
                    Browse My Recipes
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
