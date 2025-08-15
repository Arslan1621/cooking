import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RecipeGenerationParams, Recipe } from "@/types/recipe";

const recipeGenerationSchema = z.object({
  ingredients: z.array(z.string()).min(1, "Select at least one ingredient"),
  mealType: z.string().min(1, "Select a meal type"),
  cookingTime: z.number().min(5, "Minimum 5 minutes").max(240, "Maximum 4 hours"),
  difficulty: z.string().min(1, "Select difficulty level"),
  equipment: z.array(z.string()).min(1, "Select at least one kitchen tool"),
  allInMode: z.boolean(),
});

type RecipeGenerationForm = z.infer<typeof recipeGenerationSchema>;

const commonIngredients = [
  "Cheese", "Bread", "Avocado", "Carrot", "Butter", "Pepper", "Banana",
  "Chicken", "Rice", "Pasta", "Tomato", "Onion", "Garlic", "Eggs",
  "Milk", "Flour", "Oil", "Salt", "Sugar", "Lemon", "Spinach", "Potato"
];

const kitchenEquipment = [
  "Stove Top", "Oven", "Microwave", "Air Fryer", "Sous Vide Machine",
  "Blender", "Food Processor", "BBQ", "Slow Cooker", "Pressure Cooker"
];

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
const difficulties = ["novice", "intermediate", "expert"];
const timeOptions = [5, 15, 30, 45, 60, 90, 120];

export default function PantryChef() {
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();

  const { data: pantryItems } = useQuery({
    queryKey: ["/api/pantry"],
  });

  const form = useForm<RecipeGenerationForm>({
    resolver: zodResolver(recipeGenerationSchema),
    defaultValues: {
      ingredients: [],
      mealType: "",
      cookingTime: 30,
      difficulty: "novice",
      equipment: ["Stove Top"],
      allInMode: false,
    },
  });

  const generateRecipeMutation = useMutation({
    mutationFn: async (data: RecipeGenerationForm) => {
      const params: RecipeGenerationParams = {
        ...data,
        chefMode: 'pantry',
      };
      return await apiRequest("/api/recipes/generate", {
        method: "POST",
        body: params,
      });
    },
    onSuccess: (recipe: Recipe) => {
      setGeneratedRecipe(recipe);
      toast({
        title: "Recipe Generated! 🧑‍🍳",
        description: "Your delicious recipe is ready to cook!",
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
        description: "Please try again with different ingredients.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: RecipeGenerationForm) => {
    generateRecipeMutation.mutate(data);
  };

  const toggleIngredient = (ingredient: string) => {
    const current = form.getValues("ingredients");
    const updated = current.includes(ingredient)
      ? current.filter(i => i !== ingredient)
      : [...current, ingredient];
    form.setValue("ingredients", updated);
  };

  const toggleEquipment = (equipment: string) => {
    const current = form.getValues("equipment");
    const updated = current.includes(equipment)
      ? current.filter(e => e !== equipment)
      : [...current, equipment];
    form.setValue("equipment", updated);
  };

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-yellow-100 text-yellow-800 mb-4 text-lg px-4 py-2">
            🥫 PantryChef
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Where Ingredients Turn into <span className="text-chef-orange">Masterpieces!</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Have a stocked pantry but no recipe inspiration? PantryChef is the kitchen genie that transforms your basic ingredients into gourmet delights. No more dinner dilemmas, just delectable dishes!
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Recipe Generation Form */}
          <Card className="pantry-gradient text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Your Recipe</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Ingredients */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">1</span>
                      Add Ingredients
                    </h3>
                    <FormField
                      control={form.control}
                      name="ingredients"
                      render={() => (
                        <FormItem>
                          <FormLabel className="text-white/90">Pick ingredients from your pantry:</FormLabel>
                          <div className="grid grid-cols-3 gap-2">
                            {commonIngredients.map((ingredient) => (
                              <button
                                key={ingredient}
                                type="button"
                                onClick={() => toggleIngredient(ingredient)}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                  form.watch("ingredients").includes(ingredient)
                                    ? "bg-white text-chef-orange"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                              >
                                {ingredient}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 2: Meal Type */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">2</span>
                      Select Meal Type
                    </h3>
                    <FormField
                      control={form.control}
                      name="mealType"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-2">
                            {mealTypes.map((meal) => (
                              <button
                                key={meal}
                                type="button"
                                onClick={() => field.onChange(meal)}
                                className={`px-4 py-3 rounded-lg capitalize transition-colors ${
                                  field.value === meal
                                    ? "bg-white text-chef-orange"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                              >
                                {meal}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 3: Kitchen Equipment */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">3</span>
                      Kitchen Tools
                    </h3>
                    <FormField
                      control={form.control}
                      name="equipment"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-2">
                            {kitchenEquipment.map((equip) => (
                              <button
                                key={equip}
                                type="button"
                                onClick={() => toggleEquipment(equip)}
                                className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                  form.watch("equipment").includes(equip)
                                    ? "bg-white text-chef-orange"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                              >
                                {equip}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 4: Time & Difficulty */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cookingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Cooking Time</FormLabel>
                          <Select value={field.value.toString()} onValueChange={(value) => field.onChange(parseInt(value))}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {timeOptions.map((time) => (
                                <SelectItem key={time} value={time.toString()}>
                                  ⏲️ {time} minutes
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="difficulty"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Skill Level</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {difficulties.map((diff) => (
                                <SelectItem key={diff} value={diff}>
                                  {diff.charAt(0).toUpperCase() + diff.slice(1)}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 5: Chef Mode */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">5</span>
                      Chef Mode
                    </h3>
                    <FormField
                      control={form.control}
                      name="allInMode"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-3">
                            <button
                              type="button"
                              onClick={() => field.onChange(false)}
                              className={`w-full p-4 rounded-lg text-left transition-colors ${
                                !field.value
                                  ? "bg-white text-chef-orange"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              <div className="font-bold mb-1">Gourmet Mode</div>
                              <div className="text-sm">Use only the best combination of ingredients ♻️</div>
                            </button>
                            <button
                              type="button"
                              onClick={() => field.onChange(true)}
                              className={`w-full p-4 rounded-lg text-left transition-colors ${
                                field.value
                                  ? "bg-white text-chef-orange"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              <div className="font-bold mb-1">All-In Mode</div>
                              <div className="text-sm">Use ALL ingredients listed 🙃</div>
                            </button>
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={generateRecipeMutation.isPending}
                    className="w-full bg-white text-chef-orange hover:bg-gray-100 py-6 text-lg font-bold"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generating Recipe...
                      </>
                    ) : (
                      "Generate your Recipe 🧑‍🍳"
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
                    <Badge className="pantry-gradient text-white">🥫 PantryChef</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedRecipe.description && (
                    <p className="text-gray-600">{generatedRecipe.description}</p>
                  )}

                  {/* Recipe Stats */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="font-bold text-xl text-chef-orange">{generatedRecipe.prepTime}m</div>
                      <div className="text-sm text-gray-600">Prep Time</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-chef-orange">{generatedRecipe.cookTime}m</div>
                      <div className="text-sm text-gray-600">Cook Time</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-chef-orange">{generatedRecipe.servings}</div>
                      <div className="text-sm text-gray-600">Servings</div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-bold text-lg mb-3">Ingredients:</h4>
                    <ul className="space-y-2">
                      {generatedRecipe.ingredients.map((ingredient, index) => (
                        <li key={index} className="flex items-center">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          {ingredient}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-bold text-lg mb-3">Instructions:</h4>
                    <ol className="space-y-3">
                      {generatedRecipe.instructions.map((instruction, index) => (
                        <li key={index} className="flex">
                          <span className="bg-chef-orange text-white w-6 h-6 rounded-full flex items-center justify-center mr-3 font-bold text-sm flex-shrink-0 mt-0.5">
                            {index + 1}
                          </span>
                          <span>{instruction}</span>
                        </li>
                      ))}
                    </ol>
                  </div>

                  {/* Nutrition Info */}
                  {generatedRecipe.macros && (
                    <div>
                      <h4 className="font-bold text-lg mb-3">Nutrition (per serving):</h4>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="font-bold text-chef-orange">{generatedRecipe.calories}</div>
                          <div className="text-sm text-gray-600">Calories</div>
                        </div>
                        <div>
                          <div className="font-bold text-chef-orange">{generatedRecipe.macros.protein}g</div>
                          <div className="text-sm text-gray-600">Protein</div>
                        </div>
                        <div>
                          <div className="font-bold text-chef-orange">{generatedRecipe.macros.carbs}g</div>
                          <div className="text-sm text-gray-600">Carbs</div>
                        </div>
                        <div>
                          <div className="font-bold text-chef-orange">{generatedRecipe.macros.fat}g</div>
                          <div className="text-sm text-gray-600">Fat</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button className="flex-1">
                      <i className="fas fa-heart mr-2"></i>
                      Save to Cookbook
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-shopping-cart mr-2"></i>
                      Add to Shopping List
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">🥫</div>
                  <h3 className="text-xl font-bold mb-2">Ready to Cook?</h3>
                  <p className="text-gray-600">
                    Fill out the form to generate your personalized recipe!
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
