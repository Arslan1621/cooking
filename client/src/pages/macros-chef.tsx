import { useState } from "react";
import Navigation from "@/components/navigation";
import RecipeCard from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
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
import { Loader2, Target, TrendingUp, Calculator } from "lucide-react";

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack", "Post-Workout"];
const dietTypes = ["Balanced", "High Protein", "Low Carb", "Keto", "Mediterranean"];
const servingOptions = [1, 2, 4, 6];

export default function MacrosChef() {
  const { toast } = useToast();
  const [macroTargets, setMacroTargets] = useState({
    calories: [500],
    protein: [30],
    carbs: [50],
    fat: [20],
  });
  const [mealType, setMealType] = useState("");
  const [dietType, setDietType] = useState("Balanced");
  const [servings, setServings] = useState(2);
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  const generateRecipe = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/recipes/generate', params);
      return response.json();
    },
    onSuccess: (recipe) => {
      setGeneratedRecipe(recipe);
      toast({
        title: "Macro-Perfect Recipe Generated! 🎯",
        description: "Your nutrition-optimized recipe is ready!",
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

  const handleGenerate = () => {
    if (!mealType) {
      toast({
        title: "Missing Meal Type",
        description: "Please select a meal type.",
        variant: "destructive",
      });
      return;
    }

    generateRecipe.mutate({
      chefMode: 'macros',
      mealType: mealType,
      servings: servings,
      macroTargets: {
        calories: macroTargets.calories[0],
        protein: macroTargets.protein[0],
        carbs: macroTargets.carbs[0],
        fat: macroTargets.fat[0],
      },
      dietType: dietType,
    });
  };

  const updateMacro = (macro: keyof typeof macroTargets, value: number[]) => {
    setMacroTargets(prev => ({ ...prev, [macro]: value }));
  };

  const setMacroPreset = (preset: string) => {
    switch (preset) {
      case "High Protein":
        setMacroTargets({
          calories: [600],
          protein: [50],
          carbs: [30],
          fat: [25],
        });
        break;
      case "Low Carb":
        setMacroTargets({
          calories: [500],
          protein: [35],
          carbs: [15],
          fat: [35],
        });
        break;
      case "Keto":
        setMacroTargets({
          calories: [600],
          protein: [25],
          carbs: [5],
          fat: [55],
        });
        break;
      default: // Balanced
        setMacroTargets({
          calories: [500],
          protein: [25],
          carbs: [50],
          fat: [20],
        });
    }
  };

  const calculateMacroCalories = () => {
    const protein = macroTargets.protein[0] * 4; // 4 cal per gram
    const carbs = macroTargets.carbs[0] * 4; // 4 cal per gram
    const fat = macroTargets.fat[0] * 9; // 9 cal per gram
    return protein + carbs + fat;
  };

  const macroCalories = calculateMacroCalories();
  const calorieMatch = Math.abs(macroCalories - macroTargets.calories[0]) < 50;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              💪 MacrosChef
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Hit Your Nutrition Targets Perfectly
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Whether you're cutting, bulking, or maintaining, MacrosChef creates delicious recipes that meet your exact macronutrient requirements.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Macro Targets Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Diet Presets */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Target className="h-5 w-5 text-chef-orange" />
                    <span>Choose Your Diet Style</span>
                  </CardTitle>
                  <CardDescription>
                    Select a preset or customize your macronutrient targets
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {dietTypes.map((diet) => (
                      <Button
                        key={diet}
                        variant={dietType === diet ? "default" : "outline"}
                        onClick={() => {
                          setDietType(diet);
                          setMacroPreset(diet);
                        }}
                        className={`${dietType === diet ? "bg-chef-orange" : ""}`}
                        size="sm"
                      >
                        {diet}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Macro Sliders */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center space-x-2">
                      <Calculator className="h-5 w-5 text-chef-orange" />
                      <span>Customize Macro Targets</span>
                    </span>
                    <div className={`text-sm px-3 py-1 rounded-full ${
                      calorieMatch ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                    }`}>
                      Macro calories: {macroCalories} cal
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Calories */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Total Calories</Label>
                      <span className="text-lg font-semibold">{macroTargets.calories[0]} cal</span>
                    </div>
                    <Slider
                      value={macroTargets.calories}
                      onValueChange={(value) => updateMacro('calories', value)}
                      min={200}
                      max={1200}
                      step={25}
                      className="w-full"
                    />
                  </div>

                  {/* Protein */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Protein</Label>
                      <span className="text-lg font-semibold">{macroTargets.protein[0]}g ({macroTargets.protein[0] * 4} cal)</span>
                    </div>
                    <Slider
                      value={macroTargets.protein}
                      onValueChange={(value) => updateMacro('protein', value)}
                      min={10}
                      max={100}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Carbs */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Carbohydrates</Label>
                      <span className="text-lg font-semibold">{macroTargets.carbs[0]}g ({macroTargets.carbs[0] * 4} cal)</span>
                    </div>
                    <Slider
                      value={macroTargets.carbs}
                      onValueChange={(value) => updateMacro('carbs', value)}
                      min={5}
                      max={150}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {/* Fat */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Fat</Label>
                      <span className="text-lg font-semibold">{macroTargets.fat[0]}g ({macroTargets.fat[0] * 9} cal)</span>
                    </div>
                    <Slider
                      value={macroTargets.fat}
                      onValueChange={(value) => updateMacro('fat', value)}
                      min={5}
                      max={80}
                      step={5}
                      className="w-full"
                    />
                  </div>

                  {!calorieMatch && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm text-orange-700">
                        <strong>Note:</strong> Your macro calories ({macroCalories}) don't match your target calories ({macroTargets.calories[0]}). 
                        Adjust the sliders for better accuracy.
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meal Configuration */}
              <Card>
                <CardHeader>
                  <CardTitle>Meal Configuration</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Meal Type</Label>
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select meal type" />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map((type) => (
                            <SelectItem key={type} value={type}>{type}</SelectItem>
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
                          {servingOptions.map((s) => (
                            <SelectItem key={s} value={s.toString()}>{s} servings</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerate}
                    disabled={generateRecipe.isPending || !mealType}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90"
                    size="lg"
                  >
                    {generateRecipe.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Calculating Perfect Recipe...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="mr-2 h-4 w-4" />
                        Generate Macro-Perfect Recipe
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Macro Summary & Generated Recipe */}
            <div className="lg:col-span-1 space-y-6">
              {/* Macro Summary */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-lg">Target Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-2xl font-bold text-gray-900">{macroTargets.calories[0]}</div>
                      <div className="text-sm text-gray-600">Calories</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{macroTargets.protein[0]}g</div>
                      <div className="text-sm text-gray-600">Protein</div>
                    </div>
                    <div className="p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{macroTargets.carbs[0]}g</div>
                      <div className="text-sm text-gray-600">Carbs</div>
                    </div>
                    <div className="p-3 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">{macroTargets.fat[0]}g</div>
                      <div className="text-sm text-gray-600">Fat</div>
                    </div>
                  </div>

                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-600">
                      Diet Style: <span className="font-medium">{dietType}</span>
                    </p>
                    {mealType && (
                      <p className="text-sm text-gray-600">
                        Meal: <span className="font-medium">{mealType}</span>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Generated Recipe */}
              {generatedRecipe && (
                <RecipeCard recipe={generatedRecipe} />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
