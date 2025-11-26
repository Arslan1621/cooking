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
import { Badge } from "@/components/ui/badge";
import RecipeCard from "@/components/recipe-card";
import { Wine, Martini, Coffee, Clock, Loader2, Plus, X } from "lucide-react";

const spiritTypes = [
  "Vodka", "Gin", "Rum", "Whiskey", "Bourbon", "Scotch", "Tequila", 
  "Mezcal", "Brandy", "Cognac", "Liqueurs", "Aperitifs", "Bitters"
];

const mixerTypes = [
  "Fresh Citrus", "Simple Syrup", "Soda Water", "Tonic Water", "Ginger Beer",
  "Fruit Juices", "Vermouth", "Triple Sec", "Grenadine", "Bitters", "Herbs", "Spices"
];

const cocktailStyles = [
  "Classic", "Modern", "Tropical", "Sour", "Sweet", "Bitter", "Smoky", 
  "Refreshing", "Strong", "Low ABV", "Mocktail"
];

const occasions = [
  "Happy Hour", "Date Night", "Party", "Brunch", "After Dinner", 
  "Summer Cocktail", "Winter Warmer", "Celebration", "Casual"
];

export default function MixologyMaestro() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [cocktailName, setCocktailName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSpirits, setSelectedSpirits] = useState<string[]>([]);
  const [selectedMixers, setSelectedMixers] = useState<string[]>([]);
  const [customIngredients, setCustomIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");
  const [cocktailStyle, setCocktailStyle] = useState("");
  const [occasion, setOccasion] = useState("");
  const [strength, setStrength] = useState("medium");
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

  // Get user's cocktail recipes
  const { data: recipes } = useQuery({
    queryKey: ["/api/recipes"],
    enabled: isAuthenticated,
  });

  // Generate cocktail recipe mutation
  const generateCocktailMutation = useMutation({
    mutationFn: async (params: any) => {
      return await apiRequest("POST", "/api/recipes/generate", params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/recipes"] });
      toast({
        title: "Cocktail Created!",
        description: "Your signature cocktail recipe has been crafted and saved.",
      });
      // Reset form
      setCocktailName("");
      setDescription("");
      setSelectedSpirits([]);
      setSelectedMixers([]);
      setCustomIngredients([]);
      setCocktailStyle("");
      setOccasion("");
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
        description: "Failed to generate cocktail recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleSelection = (item: string, list: string[], setList: (items: string[]) => void) => {
    if (list.includes(item)) {
      setList(list.filter(i => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  const addCustomIngredient = () => {
    if (newIngredient.trim() && !customIngredients.includes(newIngredient.trim())) {
      setCustomIngredients([...customIngredients, newIngredient.trim()]);
      setNewIngredient("");
    }
  };

  const removeCustomIngredient = (ingredient: string) => {
    setCustomIngredients(customIngredients.filter(i => i !== ingredient));
  };

  const handleGenerate = () => {
    const allIngredients = [...selectedSpirits, ...selectedMixers, ...customIngredients];
    
    if (allIngredients.length === 0 && !cocktailName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide either a cocktail name or select some ingredients.",
        variant: "destructive",
      });
      return;
    }

    const params = {
      ...(cocktailName && { title: cocktailName.trim() }),
      ...(description && { description: description.trim() }),
      ingredients: allIngredients,
      ...(cocktailStyle && { tags: [cocktailStyle] }),
      ...(occasion && { mealType: occasion.toLowerCase().replace(' ', '-') }),
      difficulty: strength === "low" ? "easy" : strength === "medium" ? "medium" : "hard",
      servings,
      cookingTime: 5, // Cocktails are quick to make
      chefMode: "mixology",
    };

    generateCocktailMutation.mutate(params);
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
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              🍸 MixologyMaestro
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Craft Perfect Cocktails
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              From classic cocktails to innovative creations, MixologyMaestro helps you craft the perfect drink for any occasion. Master the art of mixology with AI-guided recipes and professional techniques.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cocktail Creation Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Cocktail Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Martini className="w-5 h-5 text-chef-orange" />
                    Cocktail Details
                  </CardTitle>
                  <p className="text-gray-600">
                    Describe your ideal cocktail or let our AI create something unique.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="cocktailName">Cocktail Name (Optional)</Label>
                    <Input
                      id="cocktailName"
                      value={cocktailName}
                      onChange={(e) => setCocktailName(e.target.value)}
                      placeholder="e.g., Sunset Spritz, Smoky Old Fashioned, Garden Gimlet"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Description (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe the flavor profile, mood, or inspiration..."
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="cocktailStyle">Style</Label>
                      <Select value={cocktailStyle} onValueChange={setCocktailStyle}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select style" />
                        </SelectTrigger>
                        <SelectContent>
                          {cocktailStyles.map((style) => (
                            <SelectItem key={style} value={style.toLowerCase()}>
                              {style}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="occasion">Occasion</Label>
                      <Select value={occasion} onValueChange={setOccasion}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occasion" />
                        </SelectTrigger>
                        <SelectContent>
                          {occasions.map((occ) => (
                            <SelectItem key={occ} value={occ.toLowerCase()}>
                              {occ}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Spirits Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Wine className="w-5 h-5 text-chef-orange" />
                    Select Base Spirits
                  </CardTitle>
                  <p className="text-gray-600">
                    Choose your preferred spirits or let MixologyMaestro suggest the perfect combination.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {spiritTypes.map((spirit) => (
                      <Button
                        key={spirit}
                        variant={selectedSpirits.includes(spirit) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSelection(spirit, selectedSpirits, setSelectedSpirits)}
                        className={selectedSpirits.includes(spirit)
                          ? "bg-chef-orange hover:bg-chef-orange/90 text-xs" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange text-xs"
                        }
                      >
                        {spirit}
                      </Button>
                    ))}
                  </div>
                  {selectedSpirits.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Selected Spirits ({selectedSpirits.length})</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedSpirits.map((spirit) => (
                          <Badge key={spirit} variant="secondary" className="bg-chef-orange/10 text-chef-orange">
                            {spirit}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Mixers & Modifiers */}
              <Card>
                <CardHeader>
                  <CardTitle>Mixers & Modifiers</CardTitle>
                  <p className="text-gray-600">
                    Add mixers, syrups, bitters, and other flavor enhancers.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {mixerTypes.map((mixer) => (
                      <Button
                        key={mixer}
                        variant={selectedMixers.includes(mixer) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleSelection(mixer, selectedMixers, setSelectedMixers)}
                        className={selectedMixers.includes(mixer)
                          ? "bg-chef-orange hover:bg-chef-orange/90 text-xs" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange text-xs"
                        }
                      >
                        {mixer}
                      </Button>
                    ))}
                  </div>
                  {selectedMixers.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Selected Mixers ({selectedMixers.length})</h4>
                      <div className="flex flex-wrap gap-1">
                        {selectedMixers.map((mixer) => (
                          <Badge key={mixer} variant="secondary" className="bg-chef-orange/10 text-chef-orange">
                            {mixer}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Custom Ingredients */}
              <Card>
                <CardHeader>
                  <CardTitle>Custom Ingredients</CardTitle>
                  <p className="text-gray-600">
                    Add specific ingredients, garnishes, or unique elements.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-4">
                    <Input
                      value={newIngredient}
                      onChange={(e) => setNewIngredient(e.target.value)}
                      placeholder="Add custom ingredient..."
                      onKeyPress={(e) => e.key === 'Enter' && addCustomIngredient()}
                    />
                    <Button 
                      onClick={addCustomIngredient}
                      disabled={!newIngredient.trim()}
                      size="sm"
                      className="bg-chef-orange hover:bg-chef-orange/90"
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                  {customIngredients.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {customIngredients.map((ingredient) => (
                        <Badge 
                          key={ingredient} 
                          variant="secondary" 
                          className="bg-chef-orange/10 text-chef-orange"
                        >
                          {ingredient}
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 ml-2 hover:bg-transparent"
                            onClick={() => removeCustomIngredient(ingredient)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Cocktail Parameters */}
              <Card>
                <CardHeader>
                  <CardTitle>Cocktail Settings</CardTitle>
                  <p className="text-gray-600">
                    Customize the strength and serving size of your cocktail.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="strength">Strength</Label>
                      <Select value={strength} onValueChange={setStrength}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="low">Low ABV</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="high">Strong</SelectItem>
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
                          {[1, 2, 4, 6, 8, 10].map((size) => (
                            <SelectItem key={size} value={size.toString()}>
                              {size} {size === 1 ? 'cocktail' : 'cocktails'}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Generate Button */}
              <Card>
                <CardContent className="pt-6">
                  <Button 
                    onClick={handleGenerate}
                    disabled={generateCocktailMutation.isPending}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90 py-6 text-lg font-bold"
                  >
                    {generateCocktailMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Crafting Your Cocktail...
                      </>
                    ) : (
                      "Craft Perfect Cocktail 🍸"
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
                    <Martini className="w-5 h-5 text-chef-orange" />
                    Cocktail Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span className="font-medium">
                        {cocktailName || "AI Generated"}
                      </span>
                    </div>
                    {cocktailStyle && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Style:</span>
                        <span className="font-medium">{cocktailStyle.charAt(0).toUpperCase() + cocktailStyle.slice(1)}</span>
                      </div>
                    )}
                    {occasion && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Occasion:</span>
                        <span className="font-medium">{occasion}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-gray-600">Strength:</span>
                      <span className="font-medium">{strength.charAt(0).toUpperCase() + strength.slice(1)} ABV</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servings:</span>
                      <span className="font-medium">{servings}</span>
                    </div>
                  </div>

                  {(selectedSpirits.length > 0 || selectedMixers.length > 0 || customIngredients.length > 0) && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Ingredients ({selectedSpirits.length + selectedMixers.length + customIngredients.length})</h4>
                        <div className="space-y-2">
                          {selectedSpirits.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Spirits:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedSpirits.slice(0, 3).map((spirit) => (
                                  <span key={spirit} className="text-xs bg-red-50 text-red-700 px-2 py-1 rounded">
                                    {spirit}
                                  </span>
                                ))}
                                {selectedSpirits.length > 3 && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    +{selectedSpirits.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {selectedMixers.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Mixers:</p>
                              <div className="flex flex-wrap gap-1">
                                {selectedMixers.slice(0, 3).map((mixer) => (
                                  <span key={mixer} className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">
                                    {mixer}
                                  </span>
                                ))}
                                {selectedMixers.length > 3 && (
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                                    +{selectedMixers.length - 3}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          {customIngredients.length > 0 && (
                            <div>
                              <p className="text-xs text-gray-500 mb-1">Custom:</p>
                              <div className="flex flex-wrap gap-1">
                                {customIngredients.map((ingredient) => (
                                  <span key={ingredient} className="text-xs bg-chef-orange/10 text-chef-orange px-2 py-1 rounded">
                                    {ingredient}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Mixology Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">🍹 Mixology Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">Balance is Key</p>
                    <p className="text-blue-700">Perfect cocktails balance sweet, sour, strong, and weak elements.</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">Fresh Ingredients</p>
                    <p className="text-green-700">Use fresh juices and quality spirits for the best results.</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900 mb-1">Proper Technique</p>
                    <p className="text-purple-700">Shaking vs stirring, proper dilution, and garnish presentation matter.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Recent Cocktail Recipes */}
          {recipes && recipes.length > 0 && (
            <div className="mt-16">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Cocktail Collection</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recipes
                  .filter((recipe: any) => recipe.chefMode === 'mixology')
                  .slice(0, 6)
                  .map((recipe: any) => (
                    <RecipeCard key={recipe.id} recipe={recipe} />
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
