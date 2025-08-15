import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { Camera, Upload, Plus, TrendingUp, Target, Zap, Loader2, Calendar } from "lucide-react";

const mealTypes = ["breakfast", "lunch", "dinner", "snack"];

export default function CalorieTracker() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [mealType, setMealType] = useState("lunch");
  const [foodName, setFoodName] = useState("");
  const [calories, setCalories] = useState("");
  const [protein, setProtein] = useState("");
  const [carbs, setCarbs] = useState("");
  const [fat, setFat] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [unit, setUnit] = useState("serving");
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Daily calorie goals (could be from user profile)
  const dailyCalorieGoal = 2000;
  const dailyProteinGoal = 150;
  const dailyCarbsGoal = 200;
  const dailyFatGoal = 70;

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

  // Get calorie entries for selected date
  const { data: calorieEntries } = useQuery({
    queryKey: ["/api/calories", selectedDate],
    queryFn: () => apiRequest(`/api/calories?date=${selectedDate}`),
    enabled: isAuthenticated,
  });

  // Analyze food photo mutation
  const analyzeFoodMutation = useMutation({
    mutationFn: async (imageBase64: string) => {
      return await apiRequest("/api/ai/analyze-food", {
        method: "POST",
        body: JSON.stringify({ imageBase64 }),
      });
    },
    onSuccess: (data) => {
      if (data.foods && data.foods.length > 0) {
        const food = data.foods[0]; // Use the first detected food
        setFoodName(food.name);
        setCalories(food.calories.toString());
        setProtein(food.macros.protein.toString());
        setCarbs(food.macros.carbs.toString());
        setFat(food.macros.fat.toString());
        setQuantity(food.quantity || "1");
        setUnit("serving");
        
        toast({
          title: "Food Analyzed!",
          description: `Detected ${food.name} with ${food.calories} calories.`,
        });
      }
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
        description: "Failed to analyze food image. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Add calorie entry mutation
  const addCalorieEntryMutation = useMutation({
    mutationFn: async (entryData: any) => {
      return await apiRequest("/api/calories", {
        method: "POST",
        body: JSON.stringify(entryData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/calories"] });
      toast({
        title: "Entry Added!",
        description: "Your calorie entry has been logged successfully.",
      });
      // Reset form
      setFoodName("");
      setCalories("");
      setProtein("");
      setCarbs("");
      setFat("");
      setQuantity("1");
      setSelectedImage(null);
      setImagePreview(null);
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
        description: "Failed to add calorie entry. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setImagePreview(result);
        
        // Convert to base64 for API
        const base64 = result.split(',')[1];
        analyzeFoodMutation.mutate(base64);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleManualEntry = () => {
    if (!foodName.trim() || !calories) {
      toast({
        title: "Missing Information",
        description: "Please provide at least food name and calories.",
        variant: "destructive",
      });
      return;
    }

    const entryData = {
      date: new Date(selectedDate),
      mealType,
      foodName: foodName.trim(),
      calories: parseInt(calories),
      macros: {
        protein: parseFloat(protein) || 0,
        carbs: parseFloat(carbs) || 0,
        fat: parseFloat(fat) || 0,
      },
      quantity: parseFloat(quantity) || 1,
      unit,
      source: selectedImage ? "photo" : "manual",
    };

    addCalorieEntryMutation.mutate(entryData);
  };

  // Calculate daily totals
  const dailyTotals = calorieEntries?.reduce(
    (acc: any, entry: any) => {
      acc.calories += entry.calories || 0;
      acc.protein += entry.macros?.protein || 0;
      acc.carbs += entry.macros?.carbs || 0;
      acc.fat += entry.macros?.fat || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  ) || { calories: 0, protein: 0, carbs: 0, fat: 0 };

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
              📸 Calorie Tracker
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              AI-Powered Food Logging
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Track your nutrition effortlessly with AI photo analysis. Just snap a photo of your meal and get instant calorie and macro estimates, or log entries manually with precision.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Food Entry Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Date Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-chef-orange" />
                    Select Date
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </CardContent>
              </Card>

              {/* Photo Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Camera className="w-5 h-5 text-chef-orange" />
                    AI Photo Analysis
                  </CardTitle>
                  <p className="text-gray-600">
                    Take a photo of your food for instant calorie and nutrition analysis.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      onClick={() => fileInputRef.current?.click()}
                      variant="outline"
                      className="h-32 flex flex-col space-y-2 border-dashed border-2 hover:border-chef-orange hover:bg-chef-orange/5"
                    >
                      <Upload className="w-8 h-8 text-gray-400" />
                      <span>Upload Photo</span>
                    </Button>
                    
                    <Button
                      variant="outline"
                      className="h-32 flex flex-col space-y-2 border-dashed border-2 hover:border-chef-orange hover:bg-chef-orange/5"
                      disabled
                    >
                      <Camera className="w-8 h-8 text-gray-400" />
                      <span>Take Photo</span>
                      <span className="text-xs text-gray-400">(Coming Soon)</span>
                    </Button>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />

                  {imagePreview && (
                    <div className="mt-4">
                      <img 
                        src={imagePreview} 
                        alt="Food preview" 
                        className="w-full max-w-md mx-auto rounded-lg"
                      />
                      {analyzeFoodMutation.isPending && (
                        <div className="mt-2 flex items-center justify-center text-chef-orange">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analyzing food...
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Manual Entry */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-chef-orange" />
                    Manual Entry
                  </CardTitle>
                  <p className="text-gray-600">
                    Log food entries manually or edit AI-detected values.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="mealType">Meal Type</Label>
                      <Select value={mealType} onValueChange={setMealType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {mealTypes.map((meal) => (
                            <SelectItem key={meal} value={meal}>
                              {meal.charAt(0).toUpperCase() + meal.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="foodName">Food Name</Label>
                      <Input
                        id="foodName"
                        value={foodName}
                        onChange={(e) => setFoodName(e.target.value)}
                        placeholder="e.g., Grilled Chicken Breast"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity">Quantity</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        placeholder="1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="unit">Unit</Label>
                      <Select value={unit} onValueChange={setUnit}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="serving">serving</SelectItem>
                          <SelectItem value="cup">cup</SelectItem>
                          <SelectItem value="gram">gram</SelectItem>
                          <SelectItem value="oz">oz</SelectItem>
                          <SelectItem value="piece">piece</SelectItem>
                          <SelectItem value="slice">slice</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <Label htmlFor="calories">Calories</Label>
                      <Input
                        id="calories"
                        type="number"
                        value={calories}
                        onChange={(e) => setCalories(e.target.value)}
                        placeholder="250"
                      />
                    </div>

                    <div>
                      <Label htmlFor="protein">Protein (g)</Label>
                      <Input
                        id="protein"
                        type="number"
                        step="0.1"
                        value={protein}
                        onChange={(e) => setProtein(e.target.value)}
                        placeholder="25"
                      />
                    </div>

                    <div>
                      <Label htmlFor="carbs">Carbs (g)</Label>
                      <Input
                        id="carbs"
                        type="number"
                        step="0.1"
                        value={carbs}
                        onChange={(e) => setCarbs(e.target.value)}
                        placeholder="10"
                      />
                    </div>

                    <div>
                      <Label htmlFor="fat">Fat (g)</Label>
                      <Input
                        id="fat"
                        type="number"
                        step="0.1"
                        value={fat}
                        onChange={(e) => setFat(e.target.value)}
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <Button 
                    onClick={handleManualEntry}
                    disabled={addCalorieEntryMutation.isPending}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90"
                  >
                    {addCalorieEntryMutation.isPending ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Adding Entry...
                      </>
                    ) : (
                      "Add Food Entry"
                    )}
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Daily Summary & Progress */}
            <div className="space-y-6">
              {/* Daily Progress */}
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-chef-orange" />
                    Daily Progress
                  </CardTitle>
                  <p className="text-sm text-gray-600">
                    {new Date(selectedDate).toLocaleDateString()}
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Calories */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Calories</span>
                      <span className="text-sm text-gray-600">
                        {dailyTotals.calories} / {dailyCalorieGoal}
                      </span>
                    </div>
                    <Progress 
                      value={(dailyTotals.calories / dailyCalorieGoal) * 100} 
                      className="h-3"
                    />
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center p-3 bg-blue-50 rounded">
                      <div className="text-lg font-bold text-blue-600">
                        {Math.round(dailyTotals.protein)}g
                      </div>
                      <div className="text-xs text-blue-500">Protein</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((dailyTotals.protein / dailyProteinGoal) * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded">
                      <div className="text-lg font-bold text-green-600">
                        {Math.round(dailyTotals.carbs)}g
                      </div>
                      <div className="text-xs text-green-500">Carbs</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((dailyTotals.carbs / dailyCarbsGoal) * 100)}%
                      </div>
                    </div>
                    <div className="text-center p-3 bg-yellow-50 rounded">
                      <div className="text-lg font-bold text-yellow-600">
                        {Math.round(dailyTotals.fat)}g
                      </div>
                      <div className="text-xs text-yellow-500">Fat</div>
                      <div className="text-xs text-gray-500">
                        {Math.round((dailyTotals.fat / dailyFatGoal) * 100)}%
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="text-center">
                    <div className="text-2xl font-bold text-chef-orange">
                      {dailyCalorieGoal - dailyTotals.calories}
                    </div>
                    <div className="text-sm text-gray-600">Calories Remaining</div>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Entries */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-chef-orange" />
                    Today's Entries
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {calorieEntries && calorieEntries.length > 0 ? (
                      calorieEntries.map((entry: any) => (
                        <div key={entry.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="font-medium">{entry.foodName}</div>
                            <div className="text-sm text-gray-600">
                              {entry.mealType} • {entry.quantity} {entry.unit}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-chef-orange">{entry.calories} cal</div>
                            {entry.source === 'photo' && (
                              <Badge variant="outline" className="text-xs">
                                <Camera className="w-3 h-3 mr-1" />
                                AI
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center text-gray-500 py-6">
                        No entries for this date
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* AI Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">💡 Tracking Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="font-medium text-blue-900 mb-1">Photo Quality</p>
                    <p className="text-blue-700">Take clear, well-lit photos for better AI analysis accuracy.</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="font-medium text-green-900 mb-1">Portion Size</p>
                    <p className="text-green-700">Include reference objects for better portion estimation.</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <p className="font-medium text-purple-900 mb-1">Consistency</p>
                    <p className="text-purple-700">Log meals regularly for better habit tracking.</p>
                  </div>
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
