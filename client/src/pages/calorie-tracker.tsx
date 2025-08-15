import { useState } from "react";
import Navigation from "@/components/navigation";
import PhotoUpload from "@/components/photo-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { useAuth } from "@/hooks/useAuth";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Camera, Plus, Loader2, Calendar, TrendingUp, Target, Flame } from "lucide-react";
import { format, startOfWeek, endOfWeek, subWeeks } from "date-fns";

const mealTypes = ["Breakfast", "Lunch", "Dinner", "Snack"];

export default function CalorieTracker() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [selectedMealType, setSelectedMealType] = useState("Breakfast");
  const [manualEntry, setManualEntry] = useState({
    foodName: "",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    quantity: "",
    unit: "",
  });

  // Redirect if not authenticated
  React.useEffect(() => {
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

  // Fetch calorie entries for current week
  const today = new Date();
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);

  const { data: calorieEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ['/api/calories', weekStart.toISOString(), weekEnd.toISOString()],
    queryFn: async () => {
      const response = await fetch(`/api/calories?startDate=${weekStart.toISOString()}&endDate=${weekEnd.toISOString()}`);
      if (!response.ok) throw new Error('Failed to fetch calorie entries');
      return response.json();
    },
    enabled: isAuthenticated,
  });

  // Photo analysis mutation
  const analyzePhoto = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('mealType', selectedMealType);
      
      const response = await fetch('/api/calories/analyze-photo', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        const error = await response.text();
        throw new Error(error || 'Failed to analyze photo');
      }
      
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['/api/calories'] });
      toast({
        title: "Photo Analyzed! 📸",
        description: `Found ${data.analysis.foods.length} food items with ${data.analysis.totalCalories} calories`,
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
        title: "Analysis Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Manual entry mutation
  const addManualEntry = useMutation({
    mutationFn: async (entryData: any) => {
      const response = await apiRequest('POST', '/api/calories/manual', entryData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/calories'] });
      setManualEntry({
        foodName: "",
        calories: "",
        protein: "",
        carbs: "",
        fat: "",
        quantity: "",
        unit: "",
      });
      toast({
        title: "Entry Added! ✅",
        description: "Calorie entry has been logged successfully.",
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
        title: "Failed to Add Entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleManualSubmit = () => {
    if (!manualEntry.foodName || !manualEntry.calories) {
      toast({
        title: "Missing Information",
        description: "Please provide food name and calories.",
        variant: "destructive",
      });
      return;
    }

    addManualEntry.mutate({
      date: new Date(),
      mealType: selectedMealType,
      foodName: manualEntry.foodName,
      calories: parseInt(manualEntry.calories),
      macros: {
        protein: parseFloat(manualEntry.protein) || 0,
        carbs: parseFloat(manualEntry.carbs) || 0,
        fat: parseFloat(manualEntry.fat) || 0,
        fiber: 0,
      },
      quantity: parseFloat(manualEntry.quantity) || 1,
      unit: manualEntry.unit || 'serving',
      source: 'manual',
    });
  };

  // Calculate daily totals
  const dailyTotals = calorieEntries?.reduce((acc: any, entry: any) => {
    const date = format(new Date(entry.date), 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { calories: 0, protein: 0, carbs: 0, fat: 0, entries: [] };
    }
    acc[date].calories += entry.calories;
    acc[date].protein += entry.macros?.protein || 0;
    acc[date].carbs += entry.macros?.carbs || 0;
    acc[date].fat += entry.macros?.fat || 0;
    acc[date].entries.push(entry);
    return acc;
  }, {}) || {};

  const todayTotal = dailyTotals[format(today, 'yyyy-MM-dd')] || { calories: 0, protein: 0, carbs: 0, fat: 0, entries: [] };
  const weeklyAverage = Object.values(dailyTotals).reduce((sum: number, day: any) => sum + day.calories, 0) / 7;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              📊 Calorie Tracker
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Track Calories in a Snap
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Just snap a photo of your meal—ChefGPT's AI instantly detects ingredients, estimates nutrition, and logs everything for you. No more manual input required.
            </p>
          </div>

          {/* Daily Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Today's Calories</p>
                    <p className="text-3xl font-bold text-gray-900">{todayTotal.calories}</p>
                  </div>
                  <Flame className="h-8 w-8 text-chef-orange" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Weekly Average</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.round(weeklyAverage)}</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Protein Today</p>
                    <p className="text-3xl font-bold text-gray-900">{Math.round(todayTotal.protein)}g</p>
                  </div>
                  <Target className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entries Today</p>
                    <p className="text-3xl font-bold text-gray-900">{todayTotal.entries.length}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Tracking Interface */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meal Type Selection */}
              <Card>
                <CardHeader>
                  <CardTitle>Select Meal Type</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {mealTypes.map((type) => (
                      <Button
                        key={type}
                        variant={selectedMealType === type ? "default" : "outline"}
                        onClick={() => setSelectedMealType(type)}
                        className={selectedMealType === type ? "bg-chef-orange" : ""}
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Input Tabs */}
              <Tabs defaultValue="photo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="photo" className="flex items-center space-x-2">
                    <Camera className="h-4 w-4" />
                    <span>AI Photo Analysis</span>
                  </TabsTrigger>
                  <TabsTrigger value="manual" className="flex items-center space-x-2">
                    <Plus className="h-4 w-4" />
                    <span>Manual Entry</span>
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="photo" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Camera className="h-5 w-5 text-chef-orange" />
                        <span>Photo Analysis</span>
                      </CardTitle>
                      <CardDescription>
                        Take a photo of your {selectedMealType.toLowerCase()} and let AI analyze it
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <PhotoUpload
                        onPhotoCapture={(file) => analyzePhoto.mutate(file)}
                        isAnalyzing={analyzePhoto.isPending}
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="manual" className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Plus className="h-5 w-5 text-chef-orange" />
                        <span>Manual Entry</span>
                      </CardTitle>
                      <CardDescription>
                        Manually log your {selectedMealType.toLowerCase()} details
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="foodName">Food Name</Label>
                          <Input
                            id="foodName"
                            value={manualEntry.foodName}
                            onChange={(e) => setManualEntry(prev => ({ ...prev, foodName: e.target.value }))}
                            placeholder="e.g., Grilled Chicken Breast"
                          />
                        </div>
                        <div>
                          <Label htmlFor="calories">Calories</Label>
                          <Input
                            id="calories"
                            type="number"
                            value={manualEntry.calories}
                            onChange={(e) => setManualEntry(prev => ({ ...prev, calories: e.target.value }))}
                            placeholder="250"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-3 gap-4">
                        <div>
                          <Label htmlFor="protein">Protein (g)</Label>
                          <Input
                            id="protein"
                            type="number"
                            value={manualEntry.protein}
                            onChange={(e) => setManualEntry(prev => ({ ...prev, protein: e.target.value }))}
                            placeholder="25"
                          />
                        </div>
                        <div>
                          <Label htmlFor="carbs">Carbs (g)</Label>
                          <Input
                            id="carbs"
                            type="number"
                            value={manualEntry.carbs}
                            onChange={(e) => setManualEntry(prev => ({ ...prev, carbs: e.target.value }))}
                            placeholder="10"
                          />
                        </div>
                        <div>
                          <Label htmlFor="fat">Fat (g)</Label>
                          <Input
                            id="fat"
                            type="number"
                            value={manualEntry.fat}
                            onChange={(e) => setManualEntry(prev => ({ ...prev, fat: e.target.value }))}
                            placeholder="8"
                          />
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="quantity">Quantity</Label>
                          <Input
                            id="quantity"
                            type="number"
                            value={manualEntry.quantity}
                            onChange={(e) => setManualEntry(prev => ({ ...prev, quantity: e.target.value }))}
                            placeholder="1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="unit">Unit</Label>
                          <Select value={manualEntry.unit} onValueChange={(value) => setManualEntry(prev => ({ ...prev, unit: value }))}>
                            <SelectTrigger>
                              <SelectValue placeholder="Select unit" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="serving">serving</SelectItem>
                              <SelectItem value="cup">cup</SelectItem>
                              <SelectItem value="piece">piece</SelectItem>
                              <SelectItem value="gram">gram</SelectItem>
                              <SelectItem value="ounce">ounce</SelectItem>
                              <SelectItem value="tablespoon">tablespoon</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button 
                        onClick={handleManualSubmit}
                        disabled={addManualEntry.isPending}
                        className="w-full bg-chef-orange hover:bg-chef-orange/90"
                      >
                        {addManualEntry.isPending ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Adding Entry...
                          </>
                        ) : (
                          "Add to Log"
                        )}
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>

            {/* Today's Log */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>Today's Food Log</CardTitle>
                  <CardDescription>
                    {format(today, 'EEEE, MMMM d')}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {entriesLoading ? (
                    <div className="text-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Loading entries...</p>
                    </div>
                  ) : todayTotal.entries.length > 0 ? (
                    <div className="space-y-3">
                      {mealTypes.map((mealType) => {
                        const mealEntries = todayTotal.entries.filter((entry: any) => entry.mealType === mealType);
                        if (mealEntries.length === 0) return null;

                        return (
                          <div key={mealType}>
                            <h4 className="font-medium text-gray-900 mb-2">{mealType}</h4>
                            <div className="space-y-2">
                              {mealEntries.map((entry: any) => (
                                <div key={entry.id} className="p-3 bg-gray-50 rounded-lg">
                                  <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{entry.foodName}</p>
                                      <p className="text-xs text-gray-500">
                                        {entry.quantity} {entry.unit}
                                      </p>
                                    </div>
                                    <Badge variant="secondary" className="text-xs">
                                      {entry.calories} cal
                                    </Badge>
                                  </div>
                                  {entry.source === 'ai-photo' && (
                                    <Badge variant="outline" className="text-xs mt-2">
                                      📸 AI Analyzed
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Flame className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-2">No entries today</p>
                      <p className="text-sm text-gray-500">
                        Start tracking by taking a photo or adding manually
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
