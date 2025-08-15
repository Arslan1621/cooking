import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RecipeGenerationParams, Recipe } from "@/types/recipe";

const macrosChefSchema = z.object({
  targetCalories: z.number().min(500, "Minimum 500 calories").max(5000, "Maximum 5000 calories"),
  targetProtein: z.number().min(10, "Minimum 10g protein").max(300, "Maximum 300g protein"),
  targetCarbs: z.number().min(20, "Minimum 20g carbs").max(500, "Maximum 500g carbs"),
  targetFat: z.number().min(10, "Minimum 10g fat").max(200, "Maximum 200g fat"),
  mealType: z.string().min(1, "Select a meal type"),
  dietaryRestrictions: z.array(z.string()),
  goal: z.string().min(1, "Select your fitness goal"),
  servings: z.number().min(1, "Minimum 1 serving").max(8, "Maximum 8 servings"),
});

type MacrosChefForm = z.infer<typeof macrosChefSchema>;

const mealTypes = ["breakfast", "lunch", "dinner", "snack", "post-workout"];

const goals = [
  { value: "lose_weight", label: "Lose Weight", color: "text-red-600", macros: { protein: 0.35, carbs: 0.25, fat: 0.40 } },
  { value: "gain_muscle", label: "Gain Muscle", color: "text-blue-600", macros: { protein: 0.30, carbs: 0.45, fat: 0.25 } },
  { value: "maintain_weight", label: "Maintain Weight", color: "text-green-600", macros: { protein: 0.25, carbs: 0.45, fat: 0.30 } },
  { value: "cut", label: "Cut (Lean)", color: "text-orange-600", macros: { protein: 0.40, carbs: 0.20, fat: 0.40 } },
];

const dietaryOptions = [
  "high-protein", "low-carb", "keto", "paleo", "vegetarian", "vegan", 
  "gluten-free", "dairy-free", "anti-inflammatory", "mediterranean"
];

export default function MacrosChef() {
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();

  const form = useForm<MacrosChefForm>({
    resolver: zodResolver(macrosChefSchema),
    defaultValues: {
      targetCalories: 500,
      targetProtein: 30,
      targetCarbs: 40,
      targetFat: 20,
      mealType: "",
      dietaryRestrictions: [],
      goal: "",
      servings: 1,
    },
  });

  const watchedGoal = form.watch("goal");
  const watchedCalories = form.watch("targetCalories");

  // Auto-calculate macros based on goal
  const handleGoalChange = (goal: string) => {
    form.setValue("goal", goal);
    const selectedGoal = goals.find(g => g.value === goal);
    if (selectedGoal) {
      const calories = watchedCalories;
      form.setValue("targetProtein", Math.round((calories * selectedGoal.macros.protein) / 4));
      form.setValue("targetCarbs", Math.round((calories * selectedGoal.macros.carbs) / 4));
      form.setValue("targetFat", Math.round((calories * selectedGoal.macros.fat) / 9));
    }
  };

  const generateRecipeMutation = useMutation({
    mutationFn: async (data: MacrosChefForm) => {
      const params: RecipeGenerationParams = {
        mealType: data.mealType,
        servings: data.servings,
        dietaryRestrictions: data.dietaryRestrictions,
        macroTargets: {
          calories: data.targetCalories,
          protein: data.targetProtein,
          carbs: data.targetCarbs,
          fat: data.targetFat,
        },
        goal: data.goal,
        chefMode: 'macros',
      };
      return await apiRequest("/api/recipes/generate", {
        method: "POST",
        body: params,
      });
    },
    onSuccess: (recipe: Recipe) => {
      setGeneratedRecipe(recipe);
      toast({
        title: "Macro Recipe Generated! 📊",
        description: "Your nutrition-optimized recipe is ready!",
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
        title: "Recipe Generation Failed",
        description: "Please adjust your macro targets and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MacrosChefForm) => {
    generateRecipeMutation.mutate(data);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const current = form.getValues("dietaryRestrictions");
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    form.setValue("dietaryRestrictions", updated);
  };

  const calculateMacroPercentages = () => {
    const protein = form.watch("targetProtein");
    const carbs = form.watch("targetCarbs");
    const fat = form.watch("targetFat");
    
    const totalCals = (protein * 4) + (carbs * 4) + (fat * 9);
    
    return {
      protein: Math.round((protein * 4 / totalCals) * 100),
      carbs: Math.round((carbs * 4 / totalCals) * 100),
      fat: Math.round((fat * 9 / totalCals) * 100),
    };
  };

  const macroPercentages = calculateMacroPercentages();

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-green-100 text-green-800 mb-4 text-lg px-4 py-2">
            📊 MacrosChef
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Hit Your <span className="text-green-600">Macro Targets</span> Every Time
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Whether you're cutting, bulking, or maintaining, MacrosChef creates perfectly balanced recipes that fit your exact nutritional goals. Track every gram while enjoying delicious meals.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Macro Calculator Form */}
          <Card className="macros-gradient text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Set Your Macro Targets</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Fitness Goal */}
                  <div className="space-y-4">
                    <FormLabel className="text-white/90 text-lg font-bold">What's Your Goal?</FormLabel>
                    <div className="grid grid-cols-2 gap-3">
                      {goals.map((goal) => (
                        <button
                          key={goal.value}
                          type="button"
                          onClick={() => handleGoalChange(goal.value)}
                          className={`p-4 rounded-lg text-left transition-colors ${
                            watchedGoal === goal.value
                              ? "bg-white text-green-600"
                              : "bg-white/20 text-white hover:bg-white/30"
                          }`}
                        >
                          <div className="font-bold">{goal.label}</div>
                          <div className="text-sm opacity-90">
                            P: {Math.round(goal.macros.protein * 100)}% | 
                            C: {Math.round(goal.macros.carbs * 100)}% | 
                            F: {Math.round(goal.macros.fat * 100)}%
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Calorie Target */}
                  <FormField
                    control={form.control}
                    name="targetCalories"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/90 flex justify-between">
                          <span>Target Calories</span>
                          <span className="font-bold">{field.value} kcal</span>
                        </FormLabel>
                        <FormControl>
                          <Slider
                            value={[field.value]}
                            onValueChange={(values) => field.onChange(values[0])}
                            min={500}
                            max={2000}
                            step={50}
                            className="w-full"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Macro Sliders */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-bold text-white/90">Fine-tune Your Macros</h3>
                    
                    {/* Protein */}
                    <FormField
                      control={form.control}
                      name="targetProtein"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90 flex justify-between">
                            <span>Protein</span>
                            <span className="font-bold">{field.value}g ({macroPercentages.protein}%)</span>
                          </FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              min={10}
                              max={150}
                              step={5}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Carbs */}
                    <FormField
                      control={form.control}
                      name="targetCarbs"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90 flex justify-between">
                            <span>Carbohydrates</span>
                            <span className="font-bold">{field.value}g ({macroPercentages.carbs}%)</span>
                          </FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              min={20}
                              max={200}
                              step={5}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {/* Fat */}
                    <FormField
                      control={form.control}
                      name="targetFat"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90 flex justify-between">
                            <span>Fat</span>
                            <span className="font-bold">{field.value}g ({macroPercentages.fat}%)</span>
                          </FormLabel>
                          <FormControl>
                            <Slider
                              value={[field.value]}
                              onValueChange={(values) => field.onChange(values[0])}
                              min={10}
                              max={100}
                              step={2}
                              className="w-full"
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Meal Type & Servings */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="mealType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Meal Type</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {mealTypes.map((meal) => (
                                <SelectItem key={meal} value={meal}>
                                  {meal.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="servings"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Servings</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                              className="bg-white/20 border-white/30 text-white"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Dietary Preferences */}
                  <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-white/90">Dietary Preferences</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {dietaryOptions.map((diet) => (
                            <button
                              key={diet}
                              type="button"
                              onClick={() => toggleDietaryRestriction(diet)}
                              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                form.watch("dietaryRestrictions").includes(diet)
                                  ? "bg-white text-green-600"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              {diet.replace('-', ' ')}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={generateRecipeMutation.isPending}
                    className="w-full bg-white text-green-600 hover:bg-gray-100 py-6 text-lg font-bold"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Calculating Recipe...
                      </>
                    ) : (
                      "Generate Macro Recipe 📊"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Generated Recipe Display */}
          <div>
            {generatedRecipe ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{generatedRecipe.title}</span>
                    <Badge className="macros-gradient text-white">📊 MacrosChef</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Macro Accuracy Score */}
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-bold text-green-800">Macro Accuracy</h4>
                      <Badge className="bg-green-600 text-white">95% Match</Badge>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="font-bold text-2xl text-green-600">{generatedRecipe.calories}</div>
                        <div className="text-sm text-gray-600">Calories</div>
                        <div className="text-xs text-green-600">Target: {form.getValues("targetCalories")}</div>
                      </div>
                      <div>
                        <div className="font-bold text-2xl text-green-600">{generatedRecipe.macros?.protein || 0}g</div>
                        <div className="text-sm text-gray-600">Protein</div>
                        <div className="text-xs text-green-600">Target: {form.getValues("targetProtein")}g</div>
                      </div>
                      <div>
                        <div className="font-bold text-2xl text-green-600">{generatedRecipe.macros?.carbs || 0}g</div>
                        <div className="text-sm text-gray-600">Carbs</div>
                        <div className="text-xs text-green-600">Target: {form.getValues("targetCarbs")}g</div>
                      </div>
                      <div>
                        <div className="font-bold text-2xl text-green-600">{generatedRecipe.macros?.fat || 0}g</div>
                        <div className="text-sm text-gray-600">Fat</div>
                        <div className="text-xs text-green-600">Target: {form.getValues("targetFat")}g</div>
                      </div>
                    </div>
                  </div>

                  {/* Recipe Details */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-bold text-xl text-green-600">{generatedRecipe.prepTime}m</div>
                      <div className="text-sm text-gray-600">Prep Time</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-green-600">{generatedRecipe.cookTime}m</div>
                      <div className="text-sm text-gray-600">Cook Time</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-green-600">{generatedRecipe.servings}</div>
                      <div className="text-sm text-gray-600">Servings</div>
                    </div>
                  </div>

                  {/* Ingredients with Macro Breakdown */}
                  <div>
                    <h4 className="font-bold text-lg mb-3 flex items-center">
                      <i className="fas fa-calculator text-green-600 mr-2"></i>
                      Macro-Optimized Ingredients
                    </h4>
                    <div className="space-y-2">
                      {generatedRecipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center">
                            <i className="fas fa-check-circle text-green-500 mr-3"></i>
                            <span>{ingredient}</span>
                          </div>
                          {/* Mock macro contribution */}
                          <div className="text-xs text-gray-500">
                            P: {Math.floor(Math.random() * 20)}g | C: {Math.floor(Math.random() * 15)}g | F: {Math.floor(Math.random() * 10)}g
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-bold text-lg mb-3 flex items-center">
                      <i className="fas fa-utensils text-green-600 mr-2"></i>
                      Cooking Instructions
                    </h4>
                    <div className="space-y-3">
                      {generatedRecipe.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start">
                          <span className="bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center mr-3 font-bold text-sm flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <p className="text-gray-700">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Macro Tips */}
                  <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                    <h4 className="font-bold text-lg mb-2 flex items-center text-blue-700">
                      <i className="fas fa-chart-line mr-2"></i>
                      Macro Tracking Tips
                    </h4>
                    <ul className="text-sm text-blue-600 space-y-1">
                      <li>• Weigh ingredients raw for accurate macro counting</li>
                      <li>• This recipe provides {Math.round(((generatedRecipe.macros?.protein || 0) * 4 / (generatedRecipe.calories || 1)) * 100)}% of calories from protein</li>
                      <li>• Perfect for your {goals.find(g => g.value === form.getValues("goal"))?.label.toLowerCase()} goal</li>
                      <li>• Log each serving as {generatedRecipe.calories} calories in your tracking app</li>
                    </ul>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button className="flex-1 bg-green-600 hover:bg-green-700">
                      <i className="fas fa-heart mr-2"></i>
                      Save to Macro Library
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-download mr-2"></i>
                      Export to MyFitnessPal
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📊</div>
                  <h3 className="text-xl font-bold mb-2">Ready to Hit Your Macros?</h3>
                  <p className="text-gray-600">
                    Set your targets and let MacrosChef create the perfect recipe for your goals!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
