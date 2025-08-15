import { useState } from "react";
import Navigation from "@/components/navigation";
import RecipeCard from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Loader2, Wine, Plus, X, Sparkles } from "lucide-react";

const drinkTypes = ["Cocktail", "Mocktail", "Smoothie", "Coffee Drink", "Tea Blend", "Punch"];
const alcoholTypes = ["Vodka", "Gin", "Rum", "Whiskey", "Tequila", "Brandy", "Liqueur", "Wine", "Beer"];
const flavorProfiles = ["Sweet", "Sour", "Bitter", "Spicy", "Fruity", "Herbal", "Smoky", "Tropical"];
const occasions = ["Party", "Date Night", "Brunch", "Summer", "Winter", "Holiday", "Casual"];

const popularIngredients = [
  "Lime juice", "Lemon juice", "Simple syrup", "Angostura bitters", "Mint",
  "Orange juice", "Cranberry juice", "Pineapple juice", "Grenadine", "Club soda",
  "Ginger beer", "Coconut milk", "Honey", "Sugar", "Salt", "Ice"
];

export default function MixologyMaestro() {
  const { toast } = useToast();
  const [drinkName, setDrinkName] = useState("");
  const [drinkType, setDrinkType] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [customIngredient, setCustomIngredient] = useState("");
  const [alcoholType, setAlcoholType] = useState("");
  const [flavorProfile, setFlavorProfile] = useState("");
  const [occasion, setOccasion] = useState("");
  const [servings, setServings] = useState<number>(1);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  const generateRecipe = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/recipes/generate', params);
      return response.json();
    },
    onSuccess: (recipe) => {
      setGeneratedRecipe(recipe);
      toast({
        title: "Cocktail Recipe Generated! 🍹",
        description: "Your signature drink is ready to mix!",
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

  const addIngredient = (ingredient: string) => {
    if (ingredient && !selectedIngredients.includes(ingredient)) {
      setSelectedIngredients([...selectedIngredients, ingredient]);
    }
    setCustomIngredient("");
  };

  const removeIngredient = (ingredient: string) => {
    setSelectedIngredients(selectedIngredients.filter(i => i !== ingredient));
  };

  const handleGenerate = () => {
    if (!drinkType) {
      toast({
        title: "Missing Drink Type",
        description: "Please select what type of drink you want to create.",
        variant: "destructive",
      });
      return;
    }

    generateRecipe.mutate({
      chefMode: 'mixology',
      searchQuery: drinkName || `${drinkType} with ${selectedIngredients.join(', ')}`,
      mealType: drinkType,
      ingredients: selectedIngredients,
      servings: servings,
      tags: [alcoholType, flavorProfile, occasion].filter(Boolean),
      description: `A ${flavorProfile?.toLowerCase()} ${drinkType?.toLowerCase()} perfect for ${occasion?.toLowerCase()}`,
    });
  };

  const classicCocktails = [
    { name: "Old Fashioned", type: "Cocktail", alcohol: "Whiskey" },
    { name: "Mojito", type: "Cocktail", alcohol: "Rum" },
    { name: "Margarita", type: "Cocktail", alcohol: "Tequila" },
    { name: "Martini", type: "Cocktail", alcohol: "Gin" },
    { name: "Moscow Mule", type: "Cocktail", alcohol: "Vodka" },
    { name: "Piña Colada", type: "Cocktail", alcohol: "Rum" },
    { name: "Virgin Mary", type: "Mocktail", alcohol: "" },
    { name: "Shirley Temple", type: "Mocktail", alcohol: "" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              🍹 MixologyMaestro
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Craft Amazing Cocktails & Beverages
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              From classic cocktails to innovative mocktails, coffee creations, and smoothie blends. MixologyMaestro helps you create the perfect drink for any occasion.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Drink Creation Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Drink Type & Name */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Wine className="h-5 w-5 text-chef-orange" />
                    <span>What would you like to create?</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Drink Type</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                      {drinkTypes.map((type) => (
                        <Button
                          key={type}
                          variant={drinkType === type ? "default" : "outline"}
                          onClick={() => setDrinkType(type)}
                          className={`${drinkType === type ? "bg-chef-orange" : ""}`}
                          size="sm"
                        >
                          {type}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="drinkName">Drink Name (Optional)</Label>
                    <Input
                      id="drinkName"
                      value={drinkName}
                      onChange={(e) => setDrinkName(e.target.value)}
                      placeholder="e.g., Tropical Sunset, Spicy Margarita, Morning Boost..."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Your Ingredients</CardTitle>
                  <CardDescription>
                    Choose ingredients you have or want to use in your drink
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Custom ingredient input */}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add custom ingredient..."
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

                  {/* Popular ingredients */}
                  <div>
                    <Label className="text-sm font-medium">Common Ingredients</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {popularIngredients.map((ingredient) => (
                        <Button
                          key={ingredient}
                          variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                          size="sm"
                          onClick={() => 
                            selectedIngredients.includes(ingredient) 
                              ? removeIngredient(ingredient)
                              : addIngredient(ingredient)
                          }
                          className={selectedIngredients.includes(ingredient) ? "bg-chef-orange" : ""}
                        >
                          {ingredient}
                        </Button>
                      ))}
                    </div>
                  </div>

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

              {/* Preferences */}
              <Card>
                <CardHeader>
                  <CardTitle>Drink Preferences</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Alcohol Base (if applicable)</Label>
                      <Select value={alcoholType} onValueChange={setAlcoholType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select alcohol type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">None (Mocktail)</SelectItem>
                          {alcoholTypes.map((alcohol) => (
                            <SelectItem key={alcohol} value={alcohol}>{alcohol}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Flavor Profile</Label>
                      <Select value={flavorProfile} onValueChange={setFlavorProfile}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select flavor" />
                        </SelectTrigger>
                        <SelectContent>
                          {flavorProfiles.map((flavor) => (
                            <SelectItem key={flavor} value={flavor}>{flavor}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Occasion</Label>
                      <Select value={occasion} onValueChange={setOccasion}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasions.map((occ) => (
                            <SelectItem key={occ} value={occ}>{occ}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Servings</Label>
                      <Select value={servings.toString()} onValueChange={(v) => setServings(parseInt(v))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {[1, 2, 4, 6, 8].map((s) => (
                            <SelectItem key={s} value={s.toString()}>{s} serving{s > 1 ? 's' : ''}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerate}
                    disabled={generateRecipe.isPending || !drinkType}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90"
                    size="lg"
                  >
                    {generateRecipe.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mixing Your Drink...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Create My Drink 🍹
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Classic Cocktails */}
              <Card>
                <CardHeader>
                  <CardTitle>Try a Classic</CardTitle>
                  <CardDescription>
                    Get inspired by these timeless cocktail recipes
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {classicCocktails.map((cocktail, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 justify-start"
                        onClick={() => {
                          setDrinkName(cocktail.name);
                          setDrinkType(cocktail.type);
                          setAlcoholType(cocktail.alcohol);
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">{cocktail.name}</div>
                          <div className="text-sm text-gray-500">
                            {cocktail.type} {cocktail.alcohol && `• ${cocktail.alcohol}`}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Generated Recipe */}
            <div className="lg:col-span-1">
              {generatedRecipe ? (
                <RecipeCard recipe={generatedRecipe} />
              ) : (
                <Card className="sticky top-24">
                  <CardContent className="p-8 text-center">
                    <Wine className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Drink recipe will appear here</p>
                    <p className="text-sm text-gray-500">
                      Select your drink type and preferences to create a custom beverage recipe!
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
