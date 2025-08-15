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

const mixologySchema = z.object({
  baseSpirit: z.string().min(1, "Select a base spirit"),
  flavorProfile: z.string().min(1, "Select a flavor profile"),
  occasion: z.string().min(1, "Select an occasion"),
  strength: z.string().min(1, "Select drink strength"),
  garnish: z.array(z.string()),
  glassware: z.string().min(1, "Select glassware"),
  technique: z.array(z.string()),
  specialIngredients: z.string().optional(),
  dietaryRestrictions: z.array(z.string()),
});

type MixologyForm = z.infer<typeof mixologySchema>;

const baseSpirits = [
  "Vodka", "Gin", "Rum", "Whiskey", "Bourbon", "Scotch", "Tequila", "Mezcal",
  "Brandy", "Cognac", "Champagne", "Wine", "Beer", "Non-Alcoholic"
];

const flavorProfiles = [
  "Sweet & Fruity", "Sour & Citrusy", "Bitter & Herbal", "Spicy & Bold",
  "Creamy & Rich", "Fresh & Light", "Smoky & Complex", "Tropical & Exotic",
  "Classic & Timeless", "Modern & Innovative"
];

const occasions = [
  "Happy Hour", "Date Night", "Party", "Business Meeting", "Celebration",
  "Relaxation", "Brunch", "Summer BBQ", "Winter Cozy", "Sophisticated Evening"
];

const strengthLevels = [
  { value: "mocktail", label: "Mocktail (0% ABV)" },
  { value: "light", label: "Light (5-10% ABV)" },
  { value: "medium", label: "Medium (10-15% ABV)" },
  { value: "strong", label: "Strong (15-20% ABV)" },
  { value: "very_strong", label: "Very Strong (20%+ ABV)" }
];

const garnishOptions = [
  "Lemon twist", "Lime wheel", "Orange peel", "Cherry", "Olive", "Mint sprig",
  "Rosemary sprig", "Cinnamon stick", "Salt rim", "Sugar rim", "Cocktail onion"
];

const glasswareTypes = [
  "Highball", "Lowball/Old Fashioned", "Martini", "Coupe", "Wine Glass",
  "Champagne Flute", "Shot Glass", "Hurricane", "Mug", "Mason Jar"
];

const techniques = [
  "Shaken", "Stirred", "Built", "Muddled", "Layered", "Blended", "Infused", "Smoked"
];

const dietaryOptions = [
  "sugar-free", "low-calorie", "vegan", "keto-friendly", "gluten-free", "organic"
];

export default function MixologyMaestro() {
  const [generatedRecipe, setGeneratedRecipe] = useState<Recipe | null>(null);
  const { toast } = useToast();

  const form = useForm<MixologyForm>({
    resolver: zodResolver(mixologySchema),
    defaultValues: {
      baseSpirit: "",
      flavorProfile: "",
      occasion: "",
      strength: "",
      garnish: [],
      glassware: "",
      technique: [],
      specialIngredients: "",
      dietaryRestrictions: [],
    },
  });

  const generateRecipeMutation = useMutation({
    mutationFn: async (data: MixologyForm) => {
      const ingredients = [
        data.baseSpirit,
        `${data.flavorProfile} profile`,
        ...data.garnish,
        ...(data.specialIngredients ? [data.specialIngredients] : [])
      ];

      const params: RecipeGenerationParams = {
        ingredients,
        mealType: "drink",
        cookingTime: 5, // Most cocktails take 5 minutes
        servings: 1,
        difficulty: "novice",
        dietaryRestrictions: data.dietaryRestrictions,
        chefMode: 'mixology',
      };
      return await apiRequest("/api/recipes/generate", {
        method: "POST",
        body: params,
      });
    },
    onSuccess: (recipe: Recipe) => {
      setGeneratedRecipe(recipe);
      toast({
        title: "Cocktail Recipe Created! 🍸",
        description: "Your perfect drink recipe is ready to mix!",
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
        description: "Please try different ingredients and try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MixologyForm) => {
    generateRecipeMutation.mutate(data);
  };

  const toggleArrayField = (fieldName: keyof Pick<MixologyForm, "garnish" | "technique" | "dietaryRestrictions">, value: string) => {
    const current = form.getValues(fieldName);
    const updated = current.includes(value)
      ? current.filter(item => item !== value)
      : [...current, value];
    form.setValue(fieldName, updated);
  };

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-purple-100 text-purple-800 mb-4 text-lg px-4 py-2">
            🍸 MixologyMaestro
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Craft Perfect <span className="text-purple-600">Cocktails</span> Every Time
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            From classic cocktails to innovative creations, MixologyMaestro helps you become your own bartender. Create perfectly balanced drinks with professional techniques and premium ingredients.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Cocktail Creation Form */}
          <Card className="mixology-gradient text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Design Your Perfect Drink</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Base Spirit */}
                  <FormField
                    control={form.control}
                    name="baseSpirit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/90 text-lg font-bold">Choose Your Base Spirit</FormLabel>
                        <div className="grid grid-cols-3 gap-2">
                          {baseSpirits.map((spirit) => (
                            <button
                              key={spirit}
                              type="button"
                              onClick={() => field.onChange(spirit)}
                              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                field.value === spirit
                                  ? "bg-white text-purple-600"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              {spirit}
                            </button>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Flavor Profile & Occasion */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="flavorProfile"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Flavor Profile</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {flavorProfiles.map((profile) => (
                                <SelectItem key={profile} value={profile.toLowerCase().replace(/ & /g, '_')}>
                                  {profile}
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
                      name="occasion"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Occasion</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {occasions.map((occasion) => (
                                <SelectItem key={occasion} value={occasion.toLowerCase().replace(/ /g, '_')}>
                                  {occasion}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Strength & Glassware */}
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="strength"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Drink Strength</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {strengthLevels.map((strength) => (
                                <SelectItem key={strength.value} value={strength.value}>
                                  {strength.label}
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
                      name="glassware"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white/90">Glassware</FormLabel>
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="bg-white/20 border-white/30 text-white">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {glasswareTypes.map((glass) => (
                                <SelectItem key={glass} value={glass.toLowerCase().replace(/ /g, '_')}>
                                  {glass}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Garnish Options */}
                  <FormField
                    control={form.control}
                    name="garnish"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-white/90">Garnish (Optional)</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {garnishOptions.map((garnish) => (
                            <button
                              key={garnish}
                              type="button"
                              onClick={() => toggleArrayField("garnish", garnish)}
                              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                form.watch("garnish").includes(garnish)
                                  ? "bg-white text-purple-600"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              {garnish}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Mixing Techniques */}
                  <FormField
                    control={form.control}
                    name="technique"
                    render={() => (
                      <FormItem>
                        <FormLabel className="text-white/90">Preferred Techniques</FormLabel>
                        <div className="grid grid-cols-2 gap-2">
                          {techniques.map((technique) => (
                            <button
                              key={technique}
                              type="button"
                              onClick={() => toggleArrayField("technique", technique)}
                              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                form.watch("technique").includes(technique)
                                  ? "bg-white text-purple-600"
                                  : "bg-white/20 text-white hover:bg-white/30"
                              }`}
                            >
                              {technique}
                            </button>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />

                  {/* Special Ingredients */}
                  <FormField
                    control={form.control}
                    name="specialIngredients"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-white/90">Special Ingredients (Optional)</FormLabel>
                        <FormControl>
                          <Textarea
                            {...field}
                            placeholder="Any specific bitters, syrups, liqueurs, or unique ingredients you want to include..."
                            className="bg-white/20 border-white/30 text-white placeholder:text-white/70 min-h-[60px]"
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

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
                              onClick={() => toggleArrayField("dietaryRestrictions", diet)}
                              className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                form.watch("dietaryRestrictions").includes(diet)
                                  ? "bg-white text-purple-600"
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
                    className="w-full bg-white text-purple-600 hover:bg-gray-100 py-6 text-lg font-bold"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Mixing Your Cocktail...
                      </>
                    ) : (
                      "Create Cocktail Recipe 🍸"
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
                    <Badge className="mixology-gradient text-white">🍸 MixologyMaestro</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {generatedRecipe.description && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-purple-500">
                      <p className="text-gray-700 italic">{generatedRecipe.description}</p>
                    </div>
                  )}

                  {/* Drink Stats */}
                  <div className="grid grid-cols-4 gap-4 text-center bg-gray-50 rounded-lg p-4">
                    <div>
                      <div className="font-bold text-xl text-purple-600">{generatedRecipe.prepTime}m</div>
                      <div className="text-sm text-gray-600">Prep Time</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-purple-600">{generatedRecipe.servings}</div>
                      <div className="text-sm text-gray-600">Serves</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-purple-600">{generatedRecipe.calories || 150}</div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                    <div>
                      <div className="font-bold text-xl text-purple-600">Easy</div>
                      <div className="text-sm text-gray-600">Skill</div>
                    </div>
                  </div>

                  {/* Ingredients */}
                  <div>
                    <h4 className="font-bold text-lg mb-3 flex items-center">
                      <i className="fas fa-glass-martini text-purple-600 mr-2"></i>
                      Ingredients & Measurements
                    </h4>
                    <div className="space-y-2">
                      {generatedRecipe.ingredients.map((ingredient, index) => (
                        <div key={index} className="flex items-center p-3 bg-purple-50 rounded-lg">
                          <i className="fas fa-circle text-purple-500 mr-3 text-xs"></i>
                          <span className="font-medium">{ingredient}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mixing Instructions */}
                  <div>
                    <h4 className="font-bold text-lg mb-3 flex items-center">
                      <i className="fas fa-cocktail text-purple-600 mr-2"></i>
                      Mixing Instructions
                    </h4>
                    <div className="space-y-4">
                      {generatedRecipe.instructions.map((instruction, index) => (
                        <div key={index} className="flex items-start">
                          <span className="bg-purple-600 text-white w-8 h-8 rounded-full flex items-center justify-center mr-4 font-bold text-sm flex-shrink-0 mt-1">
                            {index + 1}
                          </span>
                          <p className="text-gray-700 leading-relaxed">{instruction}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bartender Tips */}
                  <div className="bg-gradient-to-r from-purple-600/5 to-pink-500/5 rounded-lg p-4 border-l-4 border-purple-600">
                    <h4 className="font-bold text-lg mb-2 flex items-center text-purple-600">
                      <i className="fas fa-magic mr-2"></i>
                      Pro Bartender Tips
                    </h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Always use fresh ice for the best flavor and presentation</li>
                      <li>• Chill your glassware in the freezer for 10-15 minutes before serving</li>
                      <li>• Double-strain cocktails when using fresh citrus to remove pulp</li>
                      <li>• Express citrus oils over the drink by gently twisting the peel</li>
                      <li>• Taste as you go and adjust the balance to your preference</li>
                    </ul>
                  </div>

                  {/* Serving Suggestions */}
                  <div className="bg-amber-50 rounded-lg p-4 border-l-4 border-amber-500">
                    <h4 className="font-bold text-lg mb-2 flex items-center text-amber-700">
                      <i className="fas fa-utensils mr-2"></i>
                      Perfect Pairings
                    </h4>
                    <p className="text-sm text-amber-600">
                      This cocktail pairs beautifully with light appetizers, cheese boards, or as an aperitif before dinner. 
                      Serve with small bowls of mixed nuts or olives for a sophisticated touch.
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button className="flex-1 bg-purple-600 hover:bg-purple-700">
                      <i className="fas fa-heart mr-2"></i>
                      Save to Bar Collection
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
                  <div className="text-6xl mb-4">🍸</div>
                  <h3 className="text-xl font-bold mb-2">Ready to Mix?</h3>
                  <p className="text-gray-600">
                    Choose your preferences and let MixologyMaestro create the perfect cocktail recipe for you!
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
