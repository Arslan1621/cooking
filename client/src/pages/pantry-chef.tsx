import { useState } from "react";
import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Plus, X, ChefHat } from "lucide-react";

const commonIngredients = [
  "Chicken breast", "Ground beef", "Salmon", "Eggs", "Rice", "Pasta", "Potatoes",
  "Onions", "Garlic", "Tomatoes", "Bell peppers", "Spinach", "Broccoli",
  "Cheese", "Milk", "Butter", "Olive oil", "Salt", "Black pepper", "Basil"
];

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];
const equipment = [
  "Stove Top", "Oven", "Microwave", "Air Fryer", "Slow Cooker",
  "Pressure Cooker", "Blender", "Food Processor", "Grill", "Sous Vide"
];
const timeOptions = ["5 minutes", "15 minutes", "30 minutes", "1 hour", "2+ hours"];
const skillLevels = ["Novice", "Intermediate", "Expert"];
const chefModes = ["Gourmet Mode", "All-In Mode"];

export default function PantryChef() {
  const { toast } = useToast();
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState("");
  const [mealType, setMealType] = useState("");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState("");
  const [skillLevel, setSkillLevel] = useState("");
  const [chefMode, setChefMode] = useState("Gourmet Mode");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  // Fetch user's pantry items
  const { data: pantryItems } = useQuery({
    queryKey: ['/api/pantry'],
  });

  const generateRecipe = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/recipes/generate', params);
      return response.json();
    },
    onSuccess: (recipe) => {
      setGeneratedRecipe(recipe);
      queryClient.invalidateQueries({ queryKey: ['/api/recipes'] });
      toast({
        title: "Recipe Generated! 🎉",
        description: "Your delicious recipe is ready to cook!",
      });
    },
    onError: (error) => {
      toast({
        title: "Generation Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveToShoppingList = useMutation({
    mutationFn: async (recipe: any) => {
      const response = await apiRequest('POST', '/api/shopping-lists', {
        name: `Shopping List for ${recipe.title}`,
        items: recipe.ingredients,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to Shopping List! 🛒",
        description: "All ingredients have been added to your shopping list.",
      });
    },
  });

  const saveToCookbook = useMutation({
    mutationFn: async (recipeId: string) => {
      const response = await apiRequest('POST', '/api/cookbook', {
        recipeId,
        collectionName: 'favorites',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved to Cookbook! 📚",
        description: "Recipe has been saved to your cookbook.",
      });
    },
  });

  const addIngredient = (ingredient: string) => {
    if (ingredient && !selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setCustomIngredient("");
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev =>
      prev.includes(item)
        ? prev.filter(i => i !== item)
        : [...prev, item]
    );
  };

  const handleGenerate = () => {
    if (selectedIngredients.length === 0) {
      toast({
        title: "No Ingredients Selected",
        description: "Please select at least one ingredient to generate a recipe.",
        variant: "destructive",
      });
      return;
    }

    generateRecipe.mutate({
      ingredients: selectedIngredients,
      mealType: mealType || undefined,
      equipment: selectedEquipment,
      cookingTime: cookingTime ? parseInt(cookingTime) : undefined,
      difficulty: skillLevel?.toLowerCase(),
      chefMode: 'pantry',
      goal: chefMode === 'All-In Mode' ? 'use-all-ingredients' : 'optimize-ingredients',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              🥫 PantryChef
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Where Ingredients Turn into Masterpieces!
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Have a stocked pantry but no recipe inspiration? PantryChef is the kitchen genie that transforms your basic ingredients into gourmet delights. No more dinner dilemmas, just delectable dishes!
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recipe Generation Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Ingredients */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-chef-orange text-white rounded-xl font-bold">
                      1
                    </div>
                    <CardTitle>Add the ingredients you have at home</CardTitle>
                  </div>
                  <CardDescription>
                    You can pick ingredients from the list or from your saved inventory.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom ingredient input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Type ingredient name..."
                      value={customIngredient}
                      onChange={(e) => setCustomIngredient(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addIngredient(customIngredient)}
                    />
                    <Button 
                      onClick={() => addIngredient(customIngredient)}
                      disabled={!customIngredient}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Common ingredients */}
                  <div>
                    <Label className="text-sm font-medium">Common Ingredients</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {commonIngredients.map((ingredient) => (
                        <Button
                          key={ingredient}
                          variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                          size="sm"
                          onClick={() => 
                            selectedIngredients.includes(ingredient) 
                              ? removeIngredient(ingredient)
                              : addIngredient(ingredient)
                          }
                        >
                          {ingredient}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Pantry ingredients */}
                  {pantryItems && pantryItems.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">From Your Pantry</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {pantryItems.map((item: any) => (
                          <Button
                            key={item.id}
                            variant={selectedIngredients.includes(item.name) ? "default" : "outline"}
                            size="sm"
                            onClick={() => 
                              selectedIngredients.includes(item.name) 
                                ? removeIngredient(item.name)
                                : addIngredient(item.name)
                            }
                          >
                            {item.name}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Selected ingredients */}
                  {selectedIngredients.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium">Selected Ingredients</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedIngredients.map((ingredient) => (
                          <Badge key={ingredient} variant="default" className="bg-chef-orange">
                            {ingredient}
                            <button
                              onClick={() => removeIngredient(ingredient)}
                              className="ml-2 hover:text-gray-200"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Step 2: Meal Type */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-chef-orange text-white rounded-xl font-bold">
                      2
                    </div>
                    <CardTitle>Select what meal you want to cook</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {mealTypes.map((type) => (
                      <Button
                        key={type}
                        variant={mealType === type ? "default" : "outline"}
                        onClick={() => setMealType(type)}
                        className={mealType === type ? "bg-chef-orange" : ""}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Equipment */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-chef-orange text-white rounded-xl font-bold">
                      3
                    </div>
                    <CardTitle>Select kitchen utensils</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {equipment.map((item) => (
                      <Button
                        key={item}
                        variant={selectedEquipment.includes(item) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleEquipment(item)}
                        className={selectedEquipment.includes(item) ? "bg-chef-orange" : ""}
                      >
                        {item}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Time & Skill */}
              <div className="grid md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-chef-orange text-white rounded-xl font-bold">
                        4
                      </div>
                      <CardTitle>Cooking Time</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Select value={cookingTime} onValueChange={setCookingTime}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select time available" />
                      </SelectTrigger>
                      <SelectContent>
                        {timeOptions.map((time) => (
                          <SelectItem key={time} value={time}>
                            ⏲️ {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-chef-orange text-white rounded-xl font-bold">
                        5
                      </div>
                      <CardTitle>Skill Level</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <Select value={skillLevel} onValueChange={setSkillLevel}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your skill level" />
                      </SelectTrigger>
                      <SelectContent>
                        {skillLevels.map((level) => (
                          <SelectItem key={level} value={level}>
                            {level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>

              {/* Step 6: Chef Mode */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-chef-orange text-white rounded-xl font-bold">
                      6
                    </div>
                    <CardTitle>Select Chef Mode</CardTitle>
                  </div>
                  <CardDescription>
                    PantryChef offers two modes: All-In and Gourmet.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {chefModes.map((mode) => (
                      <div key={mode} className="space-y-2">
                        <Button
                          variant={chefMode === mode ? "default" : "outline"}
                          className={`w-full justify-start ${chefMode === mode ? "bg-chef-orange" : ""}`}
                          onClick={() => setChefMode(mode)}
                        >
                          {mode}
                        </Button>
                        {mode === "Gourmet Mode" && (
                          <p className="text-sm text-gray-600 ml-4">
                            Use only the best combination of ingredients listed discarding those that don't fit - please don't waste the ingredients that are not used. ♻️
                          </p>
                        )}
                        {mode === "All-In Mode" && (
                          <p className="text-sm text-gray-600 ml-4">
                            Use ALL ingredients listed - only for those who like delightful surprises and have a strong stomach. 🙃
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card>
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 bg-chef-orange text-white rounded-xl font-bold">
                      7
                    </div>
                    <CardTitle>Generate your Recipe</CardTitle>
                  </div>
                  <CardDescription>
                    Press the Generate button and wait for the magic to happen.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleGenerate}
                    disabled={generateRecipe.isPending || selectedIngredients.length === 0}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90"
                    size="lg"
                  >
                    {generateRecipe.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating Recipe...
                      </>
                    ) : (
                      "Generate your Recipe 🧑‍🍳"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Generated Recipe */}
            <div className="lg:col-span-1">
              {generatedRecipe ? (
                <Card className="sticky top-24">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <ChefHat className="h-5 w-5 text-chef-orange" />
                      <CardTitle className="text-lg">Generated Recipe</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h3 className="font-bold text-lg mb-2">{generatedRecipe.title}</h3>
                      <p className="text-sm text-gray-600 mb-3">{generatedRecipe.description}</p>
                      
                      <div className="flex items-center space-x-4 text-xs text-gray-500 mb-4">
                        <span>⏱️ {generatedRecipe.prepTime + generatedRecipe.cookTime} min</span>
                        <span>🔥 {generatedRecipe.calories} cal</span>
                        <span>👥 {generatedRecipe.servings} servings</span>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-semibold mb-2">Ingredients:</h4>
                      <ul className="text-sm space-y-1">
                        {generatedRecipe.ingredients?.slice(0, 5).map((ingredient: string, index: number) => (
                          <li key={index} className="text-gray-600">• {ingredient}</li>
                        ))}
                        {generatedRecipe.ingredients?.length > 5 && (
                          <li className="text-gray-500 text-xs">+ {generatedRecipe.ingredients.length - 5} more...</li>
                        )}
                      </ul>
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <Button 
                        onClick={() => saveToCookbook.mutate(generatedRecipe.id)}
                        disabled={saveToCookbook.isPending}
                        className="w-full bg-blue-600 hover:bg-blue-700"
                        size="sm"
                      >
                        {saveToCookbook.isPending ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          "📚"
                        )}
                        Save to Cookbook
                      </Button>
                      
                      <Button 
                        onClick={() => saveToShoppingList.mutate(generatedRecipe)}
                        disabled={saveToShoppingList.isPending}
                        variant="outline"
                        className="w-full"
                        size="sm"
                      >
                        {saveToShoppingList.isPending ? (
                          <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                        ) : (
                          "🛒"
                        )}
                        Add to Shopping List
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                <Card className="sticky top-24">
                  <CardContent className="p-8 text-center">
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Recipe will appear here</p>
                    <p className="text-sm text-gray-500">
                      Select your ingredients and preferences to generate a delicious recipe!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
