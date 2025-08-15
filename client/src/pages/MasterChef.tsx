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
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { RecipeGenerationParams, Recipe } from "@/types/recipe";

const masterChefSchema = z.object({
  dishName: z.string().min(1, "Enter a dish name or description"),
  cuisine: z.string().optional(),
  difficulty: z.string().min(1, "Select difficulty level"),
  cookingTime: z.number().min(15, "Minimum 15 minutes").max(300, "Maximum 5 hours"),
  servings: z.number().min(1, "Minimum 1 serving").max(20, "Maximum 20 servings"),
  dietaryRestrictions: z.array(z.string()),
  specialRequests: z.string().optional(),
});

type MasterChefForm = z.infer<typeof masterChefSchema>;

const cuisineTypes = [
  "Italian", "French", "Japanese", "Chinese", "Mexican", "Indian", "Thai", 
  "Mediterranean", "American", "Spanish", "Korean", "Vietnamese", "Lebanese", 
  "Greek", "Moroccan", "Brazilian", "German", "Russian", "Ethiopian", "Fusion"
];

const difficulties = [
  { value: "novice", label: "Novice - Simple techniques" },
  { value: "intermediate", label: "Intermediate - Some skill required" },
  { value: "expert", label: "Expert - Advanced techniques" }
];

const dietaryOptions = [
  "vegetarian", "vegan", "pescatarian", "keto", "paleo", 
  "gluten-free", "dairy-free", "low-carb", "mediterranean", "halal", "kosher"
];

export default function MasterChef() {
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();

  const form = useForm<MasterChefForm>({
    resolver: zodResolver(masterChefSchema),
    defaultValues: {
      dishName: "",
      cuisine: "",
      difficulty: "",
      cookingTime: 60,
      servings: 4,
      dietaryRestrictions: [],
      specialRequests: "",
    },
  });

  const generateRecipeMutation = useMutation({
    mutationFn: async (data: MasterChefForm) => {
      const params: RecipeGenerationParams = {
        ingredients: [data.dishName], // Using dish name as the main "ingredient"
        cuisine: data.cuisine,
        difficulty: data.difficulty,
        cookingTime: data.cookingTime,
        servings: data.servings,
        dietaryRestrictions: data.dietaryRestrictions,
        chefMode: 'master',
      };
      return await apiRequest("/api/recipes/generate", {
        method: "POST",
        body: params,
      });
    },
    onSuccess: (recipe: Recipe) => {
      setGeneratedRecipe(recipe);
      toast({
        title: "Recipe Created! 👨‍🍳",
        description: "Your restaurant-quality recipe is ready!",
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
        description: "Please try again with a different dish.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MasterChefForm) => {
    generateRecipeMutation.mutate(data);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const current = form.getValues("dietaryRestrictions");
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    form.setValue("dietaryRestrictions", updated);
  };

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-red-100 text-red-800 mb-4 text-lg px-4 py-2">
            👨‍🍳 MasterChef
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Create Restaurant-Quality <span className="text-chef-red">Masterpieces</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            From classic dishes to innovative creations, MasterChef helps you cook like a professional. Get detailed techniques, pro tips, and restaurant-quality results at home.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Recipe Generation Form */}
          <Card className="master-gradient text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center">What Would You Like to Cook?</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Dish Name */}
                  <FormField
                    control={form.control}
                    name="dishName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/90 text-lg font-bold">
                          What dish do you want to create?
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            placeholder="e.g., Beef Wellington, Risotto, Coq au Vin, Pasta Carbonara..."
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 text-lg p-4"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Cuisine & Difficulty */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cuisine"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Cuisine Style</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white">
                              <SelectValue placeholder="Any cuisine" />
                            </SelectTrigger>
                            <SelectContent>
                              {cuisineTypes.map((cuisine) => (
                                <SelectItem key={cuisine} value={cuisine.toLowerCase()}>
                                  {cuisine}
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
                                <SelectItem key={diff.value} value={diff.value}>
                                  {diff.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Time & Servings */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cookingTime"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Total Time (minutes)</FormLabel>
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

                  {/* Dietary Restrictions */}
                  <FormField
                    control={form.control}
                    name="dietaryRestrictions"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-white/90">Dietary Preferences (Optional)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {dietaryOptions.map((diet) => (
                            <button
                              key={diet}
                              type="button"
                              onClick={() => toggleDietaryRestriction(diet)}
                              className={`px-3 py-2 rounded-lg capitalize text-sm transition-colors ${
                                form.watch("dietaryRestrictions").includes(diet)
                                  ? "bg-white text-chef-red"
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

                  {/* Special Requests */}
                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/90">Special Requests (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any special techniques, ingredients to avoid, presentation ideas..."
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[80px]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={generateRecipeMutation.isPending}
                    className="w-full bg-white text-chef-red hover:bg-gray-100 py-6 text-lg font-bold"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating Masterpiece...
                      </>
                    ) : (
                      "Create Recipe 👨‍🍳"
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
                    <Badge className="master-gradient text-white">👨‍🍳 MasterChef</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedRecipe.description && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-700 italic">{generatedRecipe.description}</p>
                    </div>
                  )}

                  {/* Recipe Stats */}
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="font-bold text-xl text-chef-red">{generatedRecipe.prepTime}m</div>
                      <div className="text-sm text-gray-600">Prep</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-chef-red">{generatedRecipe.cookTime}m</div>
                      <div className="text-sm text-gray-600">Cook</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-chef-red">{generatedRecipe.servings}</div>
                      <div className="text-sm text-gray-600">Serves</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-chef-red capitalize">{generatedRecipe.difficulty}</div>
                      <div className="text-sm text-gray-600">Level</div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-bold text-lg mb-3 flex items-center">
                      <i className="fas fa-shopping-basket text-chef-red mr-2"></i>
                      Ingredients
                    </h4>
                    <div className="grid grid-cols-1 gap-2">
                      {generatedRecipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                          <i className="fas fa-check-circle text-green-500 mr-3"></i>
                          <span>{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Instructions */}
                  <div>
                    <h4 className="font-bold text-lg mb-3 flex items-center">
                      <i className="fas fa-list-ol text-chef-red mr-2"></i>
                      Cooking Instructions
                    </h4>
                    <div className="space-y-4">
                      {generatedRecipe.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start">
                          <span className="bg-chef-red text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-sm flex-shrink-0 mt-1">
                            {index + 1}
                          </span>
                          <div className="flex-1">
                            <p className="text-gray-700 leading-relaxed">{instruction}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Professional Tips */}
                  <div className="bg-gradient-to-r from-chef-red/5 to-pink-50 rounded-lg p-4 border-l-4 border-chef-red">
                    <h4 className="font-bold text-lg mb-2 flex items-center text-chef-red">
                      <i className="fas fa-lightbulb mr-2"></i>
                      Chef's Tips
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Use high-quality ingredients for the best results</li>
                      <li>• Let ingredients come to room temperature before cooking</li>
                      <li>• Taste and adjust seasoning throughout the cooking process</li>
                      <li>• Present beautifully - we eat with our eyes first!</li>
                    </ul>
                  </div>

                  {/* Nutrition Info */}
                  {generatedRecipe.macros && (
                    <div>
                      <h4 className="font-bold text-lg mb-3">Nutrition per Serving:</h4>
                      <div className="grid grid-cols-4 gap-4 text-center bg-gray-50 rounded-lg p-4">
                        <div>
                          <div className="font-bold text-chef-red text-xl">{generatedRecipe.calories}</div>
                          <div className="text-sm text-gray-600">Calories</div>
                        </div>
                        <div>
                          <div className="font-bold text-chef-red text-xl">{generatedRecipe.macros.protein}g</div>
                          <div className="text-sm text-gray-600">Protein</div>
                        </div>
                        <div>
                          <div className="font-bold text-chef-red text-xl">{generatedRecipe.macros.carbs}g</div>
                          <div className="text-sm text-gray-600">Carbs</div>
                        </div>
                        <div>
                          <div className="font-bold text-chef-red text-xl">{generatedRecipe.macros.fat}g</div>
                          <div className="text-sm text-gray-600">Fat</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button className="flex-1 bg-chef-red hover:bg-chef-red/90">
                      <i className="fas fa-heart mr-2"></i>
                      Save to Cookbook
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-share mr-2"></i>
                      Share Recipe
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">👨‍🍳</div>
                  <h3 className="text-xl font-bold mb-2">Ready to Cook Like a Pro?</h3>
                  <p className="text-gray-600">
                    Tell us what dish you'd like to master and we'll create a restaurant-quality recipe for you!
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
