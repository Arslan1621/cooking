import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import IngredientSelector from "@/components/ingredient-selector";
import ChefModeSelector from "@/components/chef-mode-selector";
import RecipeCard from "@/components/recipe-card";
import { Package, Clock, Users, ChefHat, Loader2 } from "lucide-react";

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];
const skillLevels = ["novice", "intermediate", "expert"];
const timeOptions = [
  { value: 5, label: "⏲️ 5 minutes" },
  { value: 15, label: "⏲️ 15 minutes" },
  { value: 30, label: "⏲️ 30 minutes" },
  { value: 60, label: "⏲️ 1 hour" },
  { value: 120, label: "⏲️ 2 hours" }
];

const kitchenEquipment = [
  "Stove Top", "Oven", "Microwave", "Air Fryer", "Sous Vide Machine",
  "Blender", "Food Processor", "BBQ", "Slow Cooker", "Pressure Cooker"
];

export default function PantryChef() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [mealType, setMealType] = useState("lunch");
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [cookingTime, setCookingTime] = useState(30);
  const [skillLevel, setSkillLevel] = useState("novice");
  const [chefMode, setChefMode] = useState("gourmet");
  const [servings, setServings] = useState(2);

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

  // Get pantry items
  const { data: pantryItems } = useQuery({
    queryKey: ["/api/pantry"],
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
        title: "Recipe Generated!",
        description: "Your new recipe has been created and saved to your cookbook.",
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
        description: "Failed to generate recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleEquipment = (equipment: string) => {
    setSelectedEquipment(prev => 
      prev.includes(equipment) 
        ? prev.filter(item => item !== equipment)
        : [...prev, equipment]
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

    const params = {
      ingredients: selectedIngredients,
      mealType,
      cookingTime,
      difficulty: skillLevel,
      equipment: selectedEquipment,
      servings,
      chefMode: "pantry",
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
    <div className="min-h-screen bg-chef-gray">
      <Navbar />
      
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              🥫 PantryChef
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Where Ingredients Turn into Masterpieces!
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Have a stocked pantry but no recipe inspiration? PantryChef is the kitchen genie that transforms your basic ingredients into gourmet delights. No more dinner dilemmas, just delectable dishes!
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Ingredients */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <CardTitle>Add the ingredients you have at home</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    You can pick ingredients from the list or from your saved inventory.
                  </p>
                </CardHeader>
                <CardContent>
                  <IngredientSelector
                    selectedIngredients={selectedIngredients}
                    onIngredientsChange={setSelectedIngredients}
                    title=""
                    description=""
                  />
                </CardContent>
              </Card>

              {/* Step 2: Meal Type */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <CardTitle>Select what meal you want to cook</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    You can select Breakfast, Lunch, Snack or Dinner.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mealTypes.map((meal) => (
                      <Button
                        key={meal}
                        variant={mealType === meal ? "default" : "outline"}
                        onClick={() => setMealType(meal)}
                        className={mealType === meal 
                          ? "bg-chef-orange hover:bg-chef-orange/90" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange"
                        }
                      >
                        {meal.charAt(0).toUpperCase() + meal.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Kitchen Equipment */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <CardTitle>Select the kitchen utensils you have</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    Pick the kitchen utensils you have or you want to use.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                    {kitchenEquipment.map((equipment) => (
                      <Button
                        key={equipment}
                        variant={selectedEquipment.includes(equipment) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleEquipment(equipment)}
                        className={selectedEquipment.includes(equipment)
                          ? "bg-chef-orange hover:bg-chef-orange/90 text-xs" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange text-xs"
                        }
                      >
                        {equipment}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Cooking Time */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <CardTitle>Select how much time you have</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    Select 5 minutes if you are in a rush or longer if you have time.
                  </p>
                </CardHeader>
                <CardContent>
                  <Select value={cookingTime.toString()} onValueChange={(value) => setCookingTime(parseInt(value))}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value.toString()}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* Step 5: Skill Level */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      5
                    </div>
                    <CardTitle>Select your skill level</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    It doesn't matter if you are a Novice or a Michelin Starred Chef.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-3">
                    {skillLevels.map((skill) => (
                      <Button
                        key={skill}
                        variant={skillLevel === skill ? "default" : "outline"}
                        onClick={() => setSkillLevel(skill)}
                        className={skillLevel === skill 
                          ? "bg-chef-orange hover:bg-chef-orange/90" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange"
                        }
                      >
                        {skill.charAt(0).toUpperCase() + skill.slice(1)}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 6: Chef Mode */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      6
                    </div>
                    <CardTitle>Select the desired Chef Mode</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    PantryChef offers two modes: All-In and Gourmet.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant={chefMode === "gourmet" ? "default" : "outline"}
                      onClick={() => setChefMode("gourmet")}
                      className={`w-full justify-start h-auto p-4 ${
                        chefMode === "gourmet" 
                          ? "bg-chef-orange hover:bg-chef-orange/90" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">Gourmet Mode</div>
                        <div className="text-sm opacity-75">
                          Use only the best combination of ingredients while discarding those that don't fit - please don't waste the ingredients that are not used. ♻️
                        </div>
                      </div>
                    </Button>
                    <Button
                      variant={chefMode === "all-in" ? "default" : "outline"}
                      onClick={() => setChefMode("all-in")}
                      className={`w-full justify-start h-auto p-4 ${
                        chefMode === "all-in" 
                          ? "bg-chef-orange hover:bg-chef-orange/90" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange"
                      }`}
                    >
                      <div className="text-left">
                        <div className="font-medium">All-In Mode</div>
                        <div className="text-sm opacity-75">
                          Use ALL ingredients listed - only for those who like delightful surprises and have a strong stomach. 🙃
                        </div>
                      </div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Step 7: Generate */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      7
                    </div>
                    <CardTitle>Generate your Recipe</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    Press the Generate button and wait for the magic to happen.
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleGenerate}
                    disabled={generateRecipeMutation.isPending || selectedIngredients.length === 0}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90 py-6 text-lg font-bold"
                  >
                    {generateRecipeMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Recipe...
                      </>
                    ) : (
                      "Generate your Recipe 🧑‍🍳"
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
                    <Package className="w-5 h-5 text-chef-orange" />
                    Recipe Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Selected Ingredients ({selectedIngredients.length})</h4>
                    <div className="flex flex-wrap gap-1">
                      {selectedIngredients.length > 0 ? (
                        selectedIngredients.slice(0, 5).map((ingredient) => (
                          <Badge key={ingredient} variant="secondary" className="text-xs">
                            {ingredient}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-gray-500 text-sm">No ingredients selected</p>
                      )}
                      {selectedIngredients.length > 5 && (
                        <Badge variant="secondary" className="text-xs">
                          +{selectedIngredients.length - 5} more
                        </Badge>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Meal Type:</span>
                      <span className="font-medium">{mealType.charAt(0).toUpperCase() + mealType.slice(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Cooking Time:</span>
                      <span className="font-medium">{cookingTime} minutes</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Skill Level:</span>
                      <span className="font-medium">{skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Servings:</span>
                      <span className="font-medium">{servings}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Chef Mode:</span>
                      <span className="font-medium">{chefMode === "gourmet" ? "Gourmet" : "All-In"}</span>
                    </div>
                  </div>

                  {selectedEquipment.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Equipment ({selectedEquipment.length})</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedEquipment.slice(0, 3).map((equipment) => (
                            <Badge key={equipment} variant="outline" className="text-xs">
                              {equipment}
                            </Badge>
                          ))}
                          {selectedEquipment.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{selectedEquipment.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
