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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import IngredientSelector from "@/components/ingredient-selector";
import RecipeCard from "@/components/recipe-card";
import { Target, Calculator, TrendingUp, Activity, Loader2 } from "lucide-react";

const fitnessGoals = [
  { value: "weight_loss", label: "Weight Loss", calories: 1500, protein: 120, carbs: 150, fat: 50 },
  { value: "muscle_gain", label: "Muscle Gain", calories: 2500, protein: 180, carbs: 280, fat: 90 },
  { value: "maintenance", label: "Maintenance", calories: 2000, protein: 150, carbs: 200, fat: 70 },
  { value: "cutting", label: "Cutting", calories: 1800, protein: 160, carbs: 130, fat: 60 },
  { value: "bulking", label: "Bulking", calories: 3000, protein: 200, carbs: 350, fat: 110 },
];

const mealTypes = ["breakfast", "lunch", "dinner", "snack", "pre-workout", "post-workout"];
const dietaryPreferences = ["balanced", "high-protein", "low-carb", "keto", "paleo", "vegetarian"];

export default function MacrosChef() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedGoal, setSelectedGoal] = useState("maintenance");
  const [targetCalories, setTargetCalories] = useState(2000);
  const [targetProtein, setTargetProtein] = useState(150);
  const [targetCarbs, setTargetCarbs] = useState(200);
  const [targetFat, setTargetFat] = useState(70);
  const [mealType, setMealType] = useState("lunch");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [dietaryPreference, setDietaryPreference] = useState("balanced");
  const [servings, setServings] = useState(1);

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

  // Update macro targets when goal changes
  useEffect(() => {
    const goal = fitnessGoals.find(g => g.value === selectedGoal);
    if (goal) {
      setTargetCalories(goal.calories);
      setTargetProtein(goal.protein);
      setTargetCarbs(goal.carbs);
      setTargetFat(goal.fat);
    }
  }, [selectedGoal]);

  // Get user's macro-focused recipes
  const { data: recipes } = useQuery({
    queryKey: ["/api/recipes"],
    enabled: isAuthenticated,
  });

  // Generate macro recipe mutation
  const generateRecipeMutation = useMutation({
    mutationFn: async (params: any) => {
      return await apiRequest("POST", "/api/recipes/generate", params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Macro Recipe Generated!",
        description: "Your nutrition-focused recipe has been created and saved.",
      });
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
        description: "Failed to generate macro recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleGenerate = () => {
    const macroTargets = {
      calories: Math.round(targetCalories / servings),
      protein: Math.round(targetProtein / servings),
      carbs: Math.round(targetCarbs / servings),
      fat: Math.round(targetFat / servings),
    };

    const params = {
      macroTargets,
      mealType,
      servings,
      dietaryRestrictions: [dietaryPreference],
      ...(selectedIngredients.length > 0 && { ingredients: selectedIngredients }),
      chefMode: "macros",
    };

    generateRecipeMutation.mutate(params);
  };

  // Calculate macro percentages
  const totalMacroCalories = (targetProtein * 4) + (targetCarbs * 4) + (targetFat * 9);
  const proteinPercent = Math.round((targetProtein * 4 / totalMacroCalories) * 100);
  const carbsPercent = Math.round((targetCarbs * 4 / totalMacroCalories) * 100);
  const fatPercent = Math.round((targetFat * 9 / totalMacroCalories) * 100);

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
              💪 MacrosChef
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Precision Nutrition Cooking
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Hit your macro targets with delicious, perfectly balanced meals. Whether you're cutting, bulking, or maintaining, MacrosChef creates recipes that fit your exact nutritional goals.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Fitness Goal Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-chef-orange" />
                    Select Your Fitness Goal
                  </CardTitle>
                  <p className="text-gray-600">
                    Choose a pre-set goal or customize your macro targets manually.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {fitnessGoals.map((goal) => (
                      <Button
                        key={goal.value}
                        variant={selectedGoal === goal.value ? "default" : "outline"}
                        onClick={() => setSelectedGoal(goal.value)}
                        className={`h-auto p-4 text-left ${
                          selectedGoal === goal.value 
                            ? "bg-chef-orange hover:bg-chef-orange/90" 
                            : "hover:bg-chef-orange/10 hover:border-chef-orange"
                        }`}
                      >
                        <div>
                          <div className="font-medium">{goal.label}</div>
                          <div className="text-xs opacity-75">
                            {goal.calories} cal • {goal.protein}p • {goal.carbs}c • {goal.fat}f
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Custom Macro Targets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-chef-orange" />
                    Macro Targets (Daily)
                  </CardTitle>
                  <p className="text-gray-600">
                    Customize your exact macro targets or use the preset goals above.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={targetCalories}
                        onChange={(e) => setTargetCalories(parseInt(e.target.value) || 2000)}
                        min={800}
                        max={5000}
                      />
                    </div>
                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        value={targetProtein}
                        onChange={(e) => setTargetProtein(parseInt(e.target.value) || 150)}
                        min={50}
                        max={400}
                      />
                    </div>
                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        value={targetCarbs}
                        onChange={(e) => setTargetCarbs(parseInt(e.target.value) || 200)}
                        min={20}
                        max={500}
                      />
                    </div>
                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        value={targetFat}
                        onChange={(e) => setTargetFat(parseInt(e.target.value) || 70)}
                        min={20}
                        max={200}
                      />
                    </div>
                  </div>

                  {/* Macro Distribution Visualization */}
                  <div className="space-y-3">
                    <h4 className="font-medium">Macro Distribution</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Protein ({proteinPercent}%)</span>
                        <span>{targetProtein}g × 4 = {targetProtein * 4} cal</span>
                      </div>
                      <Progress value={proteinPercent} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Carbs ({carbsPercent}%)</span>
                        <span>{targetCarbs}g × 4 = {targetCarbs * 4} cal</span>
                      </div>
                      <Progress value={carbsPercent} className="h-2" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Fat ({fatPercent}%)</span>
                        <span>{targetFat}g × 9 = {targetFat * 9} cal</span>
                      </div>
                      <Progress value={fatPercent} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Meal Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Meal Configuration</CardTitle>
                  <p className="text-gray-600">
                    Specify the type of meal and dietary approach.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mealType">Meal Type</Label>
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger>
                          <SelectValue />
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

                    <div>
                      <Label htmlFor="servings">Servings</Label>
                      <Select value={servings.toString()} onValueChange={(value) => setServings(parseInt(value))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 3, 4, 5, 6].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} {size === 1 ? 'serving' : 'servings'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dietaryPreference">Dietary Approach</Label>
                    <Select value={dietaryPreference} onValueChange={setDietaryPreference}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {dietaryPreferences.map((preference) => (
                          <SelectItem key={preference} value={preference}>
                            {preference.charAt(0).toUpperCase() + preference.slice(1).replace('-', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Optional Ingredients */}
              <IngredientSelector
                selectedIngredients={selectedIngredients}
                onIngredientsChange={setSelectedIngredients}
                title="Preferred Ingredients (Optional)"
                description="Choose specific ingredients to include, or let MacrosChef select the best options for your macros"
              />

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
                        Calculating Perfect Macros...
                      </>
                    ) : (
                      "Generate Macro Recipe 💪"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Summary Panel */}
            <div className="space-y-6">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-chef-orange" />
                    Nutrition Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-chef-orange/10 rounded-lg">
                    <div className="text-2xl font-bold text-chef-orange">{targetCalories}</div>
                    <div className="text-sm text-gray-600">Daily Calories</div>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-3 bg-blue-50 rounded">
                      <div className="font-bold text-blue-600">{targetProtein}g</div>
                      <div className="text-xs text-blue-500">Protein</div>
                      <div className="text-xs text-gray-500">{proteinPercent}%</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded">
                      <div className="font-bold text-green-600">{targetCarbs}g</div>
                      <div className="text-xs text-green-500">Carbs</div>
                      <div className="text-xs text-gray-500">{carbsPercent}%</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded">
                      <div className="font-bold text-yellow-600">{targetFat}g</div>
                      <div className="text-xs text-yellow-500">Fat</div>
                      <div className="text-xs text-gray-500">{fatPercent}%</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal:</span>
                      <span className="font-medium">{fitnessGoals.find(g => g.value === selectedGoal)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meal:</span>
                      <span className="font-medium">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servings:</span>
                      <span className="font-medium">{servings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Per Serving:</span>
                      <span className="font-medium">{Math.round(targetCalories / servings)} cal</span>
                    </div>
                  </div>

                  {selectedIngredients.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Selected Ingredients</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedIngredients.slice(0, 3).map((ingredient) => (
                            <span key={ingredient} className="text-xs bg-chef-orange/10 text-chef-orange px-2 py-1 rounded">
                              {ingredient}
                            </span>
                          ))}
                          {selectedIngredients.length > 3 && (
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                              +{selectedIngredients.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Macro Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🎯 Macro Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">Protein Priority</p>
                    <p className="text-blue-700">High-quality protein sources for muscle maintenance and growth.</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">Smart Carbs</p>
                    <p className="text-green-700">Complex carbohydrates timed around your activities.</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <p className="font-medium text-yellow-900 mb-1">Healthy Fats</p>
                    <p className="text-yellow-700">Essential fatty acids for hormone production and satiety.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Macro Recipes */}
          {recipes && recipes.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Macro Recipes</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes
                  .filter((recipe: any) => recipe.chefMode === 'macros')
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
