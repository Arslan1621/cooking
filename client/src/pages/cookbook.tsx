import { useState } from "react";
import Navigation from "@/components/navigation";
import RecipeCard from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, Search, Filter, Clock, Users, Flame, ChefHat, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const chefModes = ["All", "pantry", "meal-plan", "master", "macros", "mixology"];
const difficulties = ["All", "novice", "intermediate", "expert"];
const cuisines = ["All", "Italian", "Chinese", "Mexican", "Indian", "French", "Japanese", "Thai"];

export default function Cookbook() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChefMode, setSelectedChefMode] = useState("All");
  const [selectedDifficulty, setSelectedDifficulty] = useState("All");
  const [selectedCuisine, setSelectedCuisine] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  // Redirect if not authenticated
  React.useEffect(() => {
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

  // Fetch saved recipes
  const { data: savedRecipes, isLoading: recipesLoading } = useQuery({
    queryKey: ['/api/cookbook'],
    enabled: isAuthenticated,
  });

  // Fetch user's created recipes
  const { data: createdRecipes, isLoading: createdLoading } = useQuery({
    queryKey: ['/api/recipes'],
    enabled: isAuthenticated,
  });

  // Filter and sort recipes
  const filterRecipes = (recipes: any[]) => {
    if (!recipes) return [];
    
    return recipes
      .filter((recipe) => {
        const matchesSearch = recipe.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            recipe.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesChefMode = selectedChefMode === "All" || recipe.chefMode === selectedChefMode;
        const matchesDifficulty = selectedDifficulty === "All" || recipe.difficulty === selectedDifficulty;
        const matchesCuisine = selectedCuisine === "All" || recipe.cuisine === selectedCuisine;
        
        return matchesSearch && matchesChefMode && matchesDifficulty && matchesCuisine;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case "oldest":
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case "name":
            return a.title.localeCompare(b.title);
          case "calories":
            return (a.calories || 0) - (b.calories || 0);
          case "time":
            return ((a.prepTime || 0) + (a.cookTime || 0)) - ((b.prepTime || 0) + (b.cookTime || 0));
          default:
            return 0;
        }
      });
  };

  const filteredSavedRecipes = filterRecipes(savedRecipes || []);
  const filteredCreatedRecipes = filterRecipes(createdRecipes || []);

  // Recipe statistics
  const totalRecipes = (savedRecipes?.length || 0) + (createdRecipes?.length || 0);
  const avgCalories = totalRecipes > 0 
    ? Math.round([...(savedRecipes || []), ...(createdRecipes || [])].reduce((sum, recipe) => sum + (recipe.calories || 0), 0) / totalRecipes)
    : 0;
  const chefModeStats = [...(savedRecipes || []), ...(createdRecipes || [])].reduce((acc: any, recipe) => {
    acc[recipe.chefMode] = (acc[recipe.chefMode] || 0) + 1;
    return acc;
  }, {});

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              📚 My Cookbook
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Your Personal Recipe Collection
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              All your favorite recipes in one place. Browse, organize, and cook the dishes you love most.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Recipes</p>
                    <p className="text-3xl font-bold text-gray-900">{totalRecipes}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-chef-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Avg Calories</p>
                    <p className="text-3xl font-bold text-gray-900">{avgCalories}</p>
                  </div>
                  <Flame className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saved Recipes</p>
                    <p className="text-3xl font-bold text-gray-900">{savedRecipes?.length || 0}</p>
                  </div>
                  <ChefHat className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Created Recipes</p>
                    <p className="text-3xl font-bold text-gray-900">{createdRecipes?.length || 0}</p>
                  </div>
                  <Users className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Chef Mode Breakdown */}
          {totalRecipes > 0 && (
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Recipe Breakdown by Chef Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {Object.entries(chefModeStats).map(([mode, count]) => (
                    <Badge key={mode} variant="secondary" className="px-3 py-1">
                      {mode}: {count as number}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Filter className="h-5 w-5" />
                <span>Filter & Search</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search recipes by name or description..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="name">Name A-Z</SelectItem>
                    <SelectItem value="calories">Calories Low-High</SelectItem>
                    <SelectItem value="time">Cook Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Select value={selectedChefMode} onValueChange={setSelectedChefMode}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chef Mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {chefModes.map((mode) => (
                      <SelectItem key={mode} value={mode}>
                        {mode === "All" ? "All Chef Modes" : mode}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty} value={difficulty}>
                        {difficulty === "All" ? "All Difficulties" : difficulty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedCuisine} onValueChange={setSelectedCuisine}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cuisine" />
                  </SelectTrigger>
                  <SelectContent>
                    {cuisines.map((cuisine) => (
                      <SelectItem key={cuisine} value={cuisine}>
                        {cuisine === "All" ? "All Cuisines" : cuisine}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Recipe Tabs */}
          <Tabs defaultValue="saved" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="saved" className="flex items-center space-x-2">
                <BookOpen className="h-4 w-4" />
                <span>Saved Recipes ({savedRecipes?.length || 0})</span>
              </TabsTrigger>
              <TabsTrigger value="created" className="flex items-center space-x-2">
                <ChefHat className="h-4 w-4" />
                <span>My Creations ({createdRecipes?.length || 0})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="saved" className="space-y-6">
              {recipesLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading saved recipes...</p>
                </div>
              ) : filteredSavedRecipes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredSavedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      showActions={false}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery || selectedChefMode !== "All" || selectedDifficulty !== "All" || selectedCuisine !== "All"
                        ? "No recipes match your filters"
                        : "No saved recipes yet"
                      }
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || selectedChefMode !== "All" || selectedDifficulty !== "All" || selectedCuisine !== "All"
                        ? "Try adjusting your search or filter criteria"
                        : "Start exploring our chef modes to discover and save recipes you love"
                      }
                    </p>
                    {!searchQuery && selectedChefMode === "All" && selectedDifficulty === "All" && selectedCuisine === "All" && (
                      <Button className="bg-chef-orange hover:bg-chef-orange/90" asChild>
                        <a href="/pantry-chef">Discover Recipes</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="created" className="space-y-6">
              {createdLoading ? (
                <div className="text-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading your recipes...</p>
                </div>
              ) : filteredCreatedRecipes.length > 0 ? (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredCreatedRecipes.map((recipe) => (
                    <RecipeCard
                      key={recipe.id}
                      recipe={recipe}
                      showActions={false}
                      variant="compact"
                    />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="p-12 text-center">
                    <ChefHat className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {searchQuery || selectedChefMode !== "All" || selectedDifficulty !== "All" || selectedCuisine !== "All"
                        ? "No recipes match your filters"
                        : "No created recipes yet"
                      }
                    </h3>
                    <p className="text-gray-600 mb-6">
                      {searchQuery || selectedChefMode !== "All" || selectedDifficulty !== "All" || selectedCuisine !== "All"
                        ? "Try adjusting your search or filter criteria"
                        : "Start creating recipes with our AI-powered chef modes"
                      }
                    </p>
                    {!searchQuery && selectedChefMode === "All" && selectedDifficulty === "All" && selectedCuisine === "All" && (
                      <Button className="bg-chef-orange hover:bg-chef-orange/90" asChild>
                        <a href="/pantry-chef">Create Your First Recipe</a>
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
