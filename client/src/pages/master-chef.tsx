import { useState } from "react";
import Navigation from "@/components/navigation";
import RecipeCard from "@/components/recipe-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { Loader2, ChefHat, Search, Sparkles } from "lucide-react";

const cuisines = [
  "Italian", "Chinese", "Mexican", "Indian", "French", "Japanese", 
  "Thai", "Mediterranean", "American", "Greek", "Korean", "Vietnamese"
];

const difficulties = ["Novice", "Intermediate", "Expert"];
const servingOptions = [1, 2, 4, 6, 8];
const timeOptions = ["15 minutes", "30 minutes", "1 hour", "2+ hours"];

export default function MasterChef() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [cuisine, setCuisine] = useState("");
  const [difficulty, setDifficulty] = useState("");
  const [servings, setServings] = useState<number>(4);
  const [cookingTime, setCookingTime] = useState("");
  const [description, setDescription] = useState("");
  const [generatedRecipe, setGeneratedRecipe] = useState<any>(null);

  const generateRecipe = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/recipes/generate', params);
      return response.json();
    },
    onSuccess: (recipe) => {
      setGeneratedRecipe(recipe);
      toast({
        title: "Recipe Generated! 🎉",
        description: "Your gourmet recipe is ready to cook!",
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
    if (!searchQuery.trim()) {
      toast({
        title: "Missing Recipe Name",
        description: "Please enter what you'd like to cook.",
        variant: "destructive",
      });
      return;
    }

    generateRecipe.mutate({
      chefMode: 'master',
      searchQuery: searchQuery,
      cuisine: cuisine || undefined,
      difficulty: difficulty?.toLowerCase() || undefined,
      servings: servings,
      cookingTime: cookingTime ? parseInt(cookingTime) : undefined,
      description: description || undefined,
    });
  };

  const popularRecipes = [
    { name: "Beef Wellington", cuisine: "French", difficulty: "Expert" },
    { name: "Coq au Vin", cuisine: "French", difficulty: "Intermediate" },
    { name: "Risotto alla Milanese", cuisine: "Italian", difficulty: "Intermediate" },
    { name: "Pad Thai", cuisine: "Thai", difficulty: "Novice" },
    { name: "Ramen Bowl", cuisine: "Japanese", difficulty: "Intermediate" },
    { name: "Paella Valenciana", cuisine: "Spanish", difficulty: "Expert" },
    { name: "Tandoori Chicken", cuisine: "Indian", difficulty: "Intermediate" },
    { name: "Duck Confit", cuisine: "French", difficulty: "Expert" },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              👨‍🍳 MasterChef
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Discover Restaurant-Quality Recipes
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              From classic comfort food to gourmet masterpieces, MasterChef helps you create extraordinary dishes with detailed techniques and professional tips.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recipe Search Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Search className="h-5 w-5 text-chef-orange" />
                    <span>What would you like to cook?</span>
                  </CardTitle>
                  <CardDescription>
                    Enter a dish name, ingredient, or cooking style to get started
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label htmlFor="search">Recipe or Dish Name</Label>
                    <Input
                      id="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="e.g., Beef Wellington, Chocolate Soufflé, Pasta Carbonara..."
                      className="text-lg"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description">Additional Details (Optional)</Label>
                    <Textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Any special requirements, cooking techniques, or preferences..."
                      rows={3}
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Cuisine Type</Label>
                      <Select value={cuisine} onValueChange={setCuisine}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select cuisine" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Cuisine</SelectItem>
                          {cuisines.map((c) => (
                            <SelectItem key={c} value={c}>{c}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Difficulty Level</Label>
                      <Select value={difficulty} onValueChange={setDifficulty}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Level</SelectItem>
                          {difficulties.map((d) => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
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

                    <div>
                      <Label>Cooking Time</Label>
                      <Select value={cookingTime} onValueChange={setCookingTime}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Any Time</SelectItem>
                          {timeOptions.map((t) => (
                            <SelectItem key={t} value={t}>{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button 
                    onClick={handleGenerate}
                    disabled={generateRecipe.isPending || !searchQuery.trim()}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90"
                    size="lg"
                  >
                    {generateRecipe.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating Masterpiece...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Recipe
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Popular Recipes */}
              <Card>
                <CardHeader>
                  <CardTitle>Popular Gourmet Recipes</CardTitle>
                  <CardDescription>
                    Try these chef-favorite dishes for an exceptional culinary experience
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-3">
                    {popularRecipes.map((recipe, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="h-auto p-4 justify-start"
                        onClick={() => {
                          setSearchQuery(recipe.name);
                          setCuisine(recipe.cuisine);
                          setDifficulty(recipe.difficulty);
                        }}
                      >
                        <div className="text-left">
                          <div className="font-medium">{recipe.name}</div>
                          <div className="text-sm text-gray-500">
                            {recipe.cuisine} • {recipe.difficulty}
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
                    <ChefHat className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-2">Recipe will appear here</p>
                    <p className="text-sm text-gray-500">
                      Enter a dish name to generate a detailed, restaurant-quality recipe with professional techniques!
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
