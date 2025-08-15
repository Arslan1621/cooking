import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import IngredientSelector from "@/components/ingredient-selector";
import RecipeCard from "@/components/recipe-card";
import { ChefHat, Award, Clock, Users, Loader2 } from "lucide-react";

const cuisines = [
  "Italian", "French", "Japanese", "Chinese", "Thai", "Indian", "Mexican", 
  "Mediterranean", "American", "Korean", "Vietnamese", "Spanish", "Greek", "Turkish"
];

const mealTypes = ["breakfast", "lunch", "dinner", "snack", "appetizer", "dessert"];
const difficulties = ["easy", "medium", "hard"];
const servingSizes = [1, 2, 4, 6, 8, 10];

export default function MasterChef() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [recipeName, setRecipeName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [cuisine, setCuisine] = useState("");
  const [mealType, setMealType] = useState("");
  const [difficulty, setDifficulty] = useState("medium");
  const [servings, setServings] = useState(4);
  const [cookingTime, setCookingTime] = useState(30);
  const [techniques, setTechniques] = useState("");

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

  // Generate recipe mutation
  const generateRecipeMutation = useMutation({
    mutationFn: async (params: any) => {
      return await apiRequest("/api/ai/generate-recipe", {
        method: "POST",
        body: JSON.stringify(params),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Masterpiece Created!",
        description: "Your professional recipe has been generated and saved to your cookbook.",
      });
      // Reset form
      setRecipeName("");
      setDescription("");
      setSelectedIngredients([]);
      setCuisine("");
      setMealType("");
      setTechniques("");
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
        title: "Error",
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    if (!recipeName.trim() && selectedIngredients.length === 0) {
      toast({
        title: "Missing Information",
        description: "Please provide either a recipe name or select ingredients.",
        variant: "destructive",
      });
      return;
    }

    const params = {
      ...(recipeName && { recipeName: recipeName.trim() }),
      ...(description && { description: description.trim() }),
      ...(selectedIngredients.length > 0 && { ingredients: selectedIngredients }),
      ...(cuisine && { cuisine }),
      ...(mealType && { mealType }),
      difficulty,
      servings,
      cookingTime,
      ...(techniques && { techniques: techniques.trim() }),
      chefMode: "master",
    };

    generateRecipeMutation.mutate(params);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="chef-spinner w-32 h-32"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              👨‍🍳 MasterChef
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Restaurant-Quality Recipes
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Create professional-grade recipes with detailed cooking techniques, precise timing, and restaurant-quality presentation. Perfect for ambitious home cooks and culinary enthusiasts.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recipe Creation Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Recipe Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ChefHat className="w-5 h-5 text-chef-orange" />
                    Recipe Details
                  </CardTitle>
                  <p className="text-gray-600">
                    Start with a recipe name or describe what you want to create.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="recipeName">Recipe Name (Optional)</Label>
                    <Input
                      id="recipeName"
                      value={recipeName}
                      onChange={(e) => setRecipeName(e.target.value)}
                      placeholder="e.g., Truffle Risotto, Beef Wellington, Chocolate Soufflé"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the style, flavor profile, or inspiration for your dish..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cuisine">Cuisine Style</Label>
                      <Select value={cuisine} onValueChange={setCuisine}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          {cuisines.map((cuisineOption) => (
                            <SelectItem key={cuisineOption} value={cuisineOption.toLowerCase()}>
                              {cuisineOption}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="mealType">Meal Type</Label>
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map((meal) => (
                            <SelectItem key={meal} value={meal}>
                              {meal.charAt(0).toUpperCase() + meal.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <IngredientSelector
                selectedIngredients={selectedIngredients}
                onIngredientsChange={setSelectedIngredients}
                title="Select Ingredients (Optional)"
                description="Choose specific ingredients or let MasterChef suggest professional combinations"
              />

              {/* Cooking Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-chef-orange" />
                    Professional Settings
                  </CardTitle>
                  <p className="text-gray-600">
                    Set the complexity and scale for your restaurant-quality dish.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="difficulty">Difficulty</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {difficulties.map((level) => (
                            <SelectItem key={level} value={level}>
                              {level.charAt(0).toUpperCase() + level.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <Select value={servings.toString()} onValueChange={(value) => setServings(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {servingSizes.map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} {size === 1 ? 'serving' : 'servings'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="cookingTime">Total Time (min)</Label>
                      <Input
                        id="cookingTime"
                        type="number"
                        value={cookingTime}
                        onChange={(e) => setCookingTime(parseInt(e.target.value) || 30)}
                        min={5}
                        max={480}
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="techniques">Specific Techniques (Optional)</Label>
                    <Textarea
                      id="techniques"
                      value={techniques}
                      onChange={(e) => setTechniques(e.target.value)}
                      placeholder="e.g., sous vide, confit, flambe, molecular gastronomy, fermentation..."
                      rows={2}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={handleGenerate}
                    disabled={generateRecipeMutation.isPending}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90 py-6 text-lg font-bold"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Creating Masterpiece...
                      </>
                    ) : (
                      "Create Professional Recipe 👨‍🍳"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Summary Panel */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-chef-orange" />
                    Recipe Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recipe:</span>
                      <span className="font-medium">
                        {recipeName || "AI Generated"}
                      </span>
                    </div>
                    {cuisine && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Cuisine:</span>
                        <span className="font-medium">{cuisine.charAt(0).toUpperCase() + cuisine.slice(1)}</span>
                      </div>
                    )}
                    {mealType && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Type:</span>
                        <span className="font-medium">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Difficulty:</span>
                      <span className="font-medium">{difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servings:</span>
                      <span className="font-medium">{servings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Time:</span>
                      <span className="font-medium">{cookingTime} min</span>
                    </div>
                  </div>

                  {selectedIngredients.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Ingredients ({selectedIngredients.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedIngredients.slice(0, 4).map((ingredient) => (
                            <span key={ingredient} className="text-xs bg-chef-orange/10 text-chef-orange px-2 py-1 rounded">
                              {ingredient}
                            </span>
                          ))}
                          {selectedIngredients.length > 4 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              +{selectedIngredients.length - 4} more
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {techniques && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Techniques</h4>
                        <p className="text-xs text-gray-600">{techniques}</p>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Professional Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">💡 MasterChef Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">Professional Techniques</p>
                    <p className="text-blue-700">MasterChef focuses on restaurant-quality methods and precise timing.</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">Detailed Instructions</p>
                    <p className="text-green-700">Get step-by-step guidance with professional tips and timing.</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900 mb-1">Presentation Focus</p>
                    <p className="text-purple-700">Learn plating techniques and garnish suggestions.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Recipes */}
          {recipes && recipes.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Recent Masterpieces</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes
                  .filter((recipe: any) => recipe.chefMode === 'master')
                  .slice(0, 6)
                  .map((recipe: any) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
