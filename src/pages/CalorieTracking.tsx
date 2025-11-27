import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { CalorieEntry } from "@/types/recipe";

const calorieEntrySchema = z.object({
  foodName: z.string().min(1, "Enter food name"),
  calories: z.number().min(1, "Enter calories"),
  mealType: z.string().min(1, "Select meal type"),
  quantity: z.number().min(0.1, "Enter quantity").optional(),
  unit: z.string().optional(),
  protein: z.number().min(0, "Enter protein").optional(),
  carbs: z.number().min(0, "Enter carbs").optional(),
  fat: z.number().min(0, "Enter fat").optional(),
  fiber: z.number().min(0, "Enter fiber").optional(),
});

type CalorieEntryForm = z.infer<typeof calorieEntrySchema>;

const mealTypes = [
  { value: "breakfast", label: "🥞 Breakfast", color: "text-yellow-600" },
  { value: "lunch", label: "🥗 Lunch", color: "text-green-600" },
  { value: "dinner", label: "🍽️ Dinner", color: "text-blue-600" },
  { value: "snack", label: "🍿 Snack", color: "text-purple-600" }
];

const commonUnits = ["g", "oz", "cup", "tbsp", "tsp", "piece", "slice", "serving"];

export default function CalorieTracking() {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<CalorieEntryForm>({
    resolver: zodResolver(calorieEntrySchema),
    defaultValues: {
      foodName: "",
      calories: 0,
      mealType: "",
      quantity: 1,
      unit: "serving",
      protein: 0,
      carbs: 0,
      fat: 0,
      fiber: 0,
    },
  });

  const { data: calorieEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["/api/calories"],
  });

  const analyzePhotoMutation = useMutation({
    mutationFn: async (base64Image: string) => {
      return await apiRequest("/api/calories/analyze-photo", {
        method: "POST",
        body: { image: base64Image },
      });
    },
    onSuccess: (result) => {
      setAnalysisResult(result);
      if (result.foods && result.foods.length > 0) {
        const mainFood = result.foods[0];
        form.setValue("foodName", mainFood.name);
        form.setValue("calories", mainFood.calories);
        form.setValue("protein", mainFood.macros.protein);
        form.setValue("carbs", mainFood.macros.carbs);
        form.setValue("fat", mainFood.macros.fat);
        form.setValue("fiber", mainFood.macros.fiber);
        form.setValue("quantity", parseFloat(mainFood.quantity) || 1);
      }
      toast({
        title: "Photo Analyzed! 📷",
        description: `Detected ${result.foods?.length || 0} food items with ${Math.round(result.confidence * 100)}% confidence.`,
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
        title: "Photo Analysis Failed",
        description: "Please try a clearer photo or enter details manually.",
        variant: "destructive",
      });
    },
  });

  const createEntryMutation = useMutation({
    mutationFn: async (data: CalorieEntryForm) => {
      return await apiRequest("/api/calories", {
        method: "POST",
        body: {
          foodName: data.foodName,
          calories: data.calories,
          mealType: data.mealType,
          date: new Date().toISOString(),
          quantity: data.quantity,
          unit: data.unit,
          macros: {
            protein: data.protein || 0,
            carbs: data.carbs || 0,
            fat: data.fat || 0,
            fiber: data.fiber || 0,
          },
          source: selectedImage ? "photo" : "manual",
          imageUrl: selectedImage,
        },
      });
    },
    onSuccess: () => {
      toast({
        title: "Entry Added! ✅",
        description: "Your meal has been logged successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/calories"] });
      form.reset();
      setSelectedImage(null);
      setAnalysisResult(null);
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
        title: "Failed to Log Entry",
        description: "Please check your details and try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        const base64Data = base64.split(',')[1];
        setSelectedImage(base64);
        analyzePhotoMutation.mutate(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: CalorieEntryForm) => {
    createEntryMutation.mutate(data);
  };

  const todayEntries = calorieEntries?.filter((entry: CalorieEntry) => {
    const entryDate = new Date(entry.date).toDateString();
    const today = new Date().toDateString();
    return entryDate === today;
  }) || [];

  const todayCalories = todayEntries.reduce((sum: number, entry: CalorieEntry) => sum + entry.calories, 0);
  const todayMacros = todayEntries.reduce((acc: any, entry: CalorieEntry) => ({
    protein: acc.protein + (entry.macros?.protein || 0),
    carbs: acc.carbs + (entry.macros?.carbs || 0),
    fat: acc.fat + (entry.macros?.fat || 0),
    fiber: acc.fiber + (entry.macros?.fiber || 0),
  }), { protein: 0, carbs: 0, fat: 0, fiber: 0 });

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-800 mb-4 text-lg px-4 py-2">
            📷 Calorie Tracking
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Track Calories in a <span className="text-chef-orange">Snap</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Just snap a photo of your meal—ChefGPT's AI instantly detects ingredients, estimates nutrition, and logs everything for you. No more manual input. Just eat, shoot, and stay on track.
          </p>
        </div>

        {/* Today's Summary */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Today's Nutrition Summary</span>
              <Badge variant="outline">{new Date().toLocaleDateString()}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold text-chef-orange">{todayCalories}</div>
                <div className="text-sm text-gray-600">Calories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600">{Math.round(todayMacros.protein)}g</div>
                <div className="text-sm text-gray-600">Protein</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-green-600">{Math.round(todayMacros.carbs)}g</div>
                <div className="text-sm text-gray-600">Carbs</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-yellow-600">{Math.round(todayMacros.fat)}g</div>
                <div className="text-sm text-gray-600">Fat</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">{Math.round(todayMacros.fiber)}g</div>
                <div className="text-sm text-gray-600">Fiber</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Photo Analysis & Manual Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Log Your Meal</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="photo" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="photo">📷 Photo Analysis</TabsTrigger>
                  <TabsTrigger value="manual">✍️ Manual Entry</TabsTrigger>
                </TabsList>
                
                <TabsContent value="photo" className="space-y-4">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    {selectedImage ? (
                      <div className="space-y-4">
                        <img 
                          src={selectedImage} 
                          alt="Selected food" 
                          className="max-w-full max-h-64 mx-auto rounded-lg shadow-md"
                        />
                        {analyzePhotoMutation.isPending && (
                          <div className="flex items-center justify-center">
                            <LoadingSpinner className="mr-2" />
                            <span>Analyzing your photo...</span>
                          </div>
                        )}
                        <Button 
                          variant="outline" 
                          onClick={() => {
                            setSelectedImage(null);
                            setAnalysisResult(null);
                            form.reset();
                          }}
                        >
                          Take Another Photo
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <i className="fas fa-camera text-6xl text-gray-400"></i>
                        <div>
                          <h3 className="text-lg font-medium">Snap Your Meal</h3>
                          <p className="text-gray-600">Take a photo of your food for instant calorie analysis</p>
                        </div>
                        <Button 
                          onClick={() => fileInputRef.current?.click()}
                          className="bg-chef-orange hover:bg-chef-orange/90"
                        >
                          <i className="fas fa-camera mr-2"></i>
                          Take Photo
                        </Button>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </div>

                  {analysisResult && (
                    <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                      <h4 className="font-bold text-green-800 mb-2">
                        Analysis Results ({Math.round(analysisResult.confidence * 100)}% confidence)
                      </h4>
                      <div className="space-y-2">
                        {analysisResult.foods?.map((food: any, index: number) => (
                          <div key={index} className="flex justify-between items-center text-sm">
                            <span className="font-medium">{food.name}</span>
                            <span className="text-green-600">{food.calories} cal</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="manual">
                  <div className="text-center py-8 text-gray-500">
                    <i className="fas fa-keyboard text-4xl mb-4"></i>
                    <p>Switch to manual entry form below</p>
                  </div>
                </TabsContent>
              </Tabs>

              {/* Entry Form */}
              <div className="mt-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="foodName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Food Name</FormLabel>
                            <FormControl>
                              <Input {...field} placeholder="e.g. Grilled Chicken" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="mealType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Meal Type</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {mealTypes.map((meal) => (
                                  <SelectItem key={meal.value} value={meal.value}>
                                    {meal.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="calories"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Calories</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="quantity"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quantity</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {commonUnits.map((unit) => (
                                  <SelectItem key={unit} value={unit}>
                                    {unit}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="protein"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Protein (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="carbs"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Carbs (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fat"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fat (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="fiber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Fiber (g)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number"
                                step="0.1"
                                {...field}
                                onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button 
                      type="submit" 
                      disabled={createEntryMutation.isPending}
                      className="w-full bg-chef-orange hover:bg-chef-orange/90"
                    >
                      {createEntryMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Logging Entry...
                        </>
                      ) : (
                        <>
                          <i className="fas fa-plus mr-2"></i>
                          Add to Food Log
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </div>
            </CardContent>
          </Card>

          {/* Today's Meals */}
          <Card>
            <CardHeader>
              <CardTitle>Today's Meals</CardTitle>
            </CardHeader>
            <CardContent>
              {entriesLoading ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : todayEntries.length > 0 ? (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {todayEntries.map((entry: CalorieEntry) => {
                    const mealTypeData = mealTypes.find(m => m.value === entry.mealType);
                    return (
                      <div key={entry.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="w-12 h-12 bg-chef-orange/10 rounded-full flex items-center justify-center">
                            <span className="text-2xl">
                              {entry.mealType === 'breakfast' ? '🥞' :
                               entry.mealType === 'lunch' ? '🥗' :
                               entry.mealType === 'dinner' ? '🍽️' : '🍿'}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{entry.foodName}</h4>
                            <p className="text-sm text-gray-600 capitalize">
                              {entry.mealType} • {entry.quantity} {entry.unit}
                            </p>
                            {entry.macros && (
                              <p className="text-xs text-gray-500">
                                P: {entry.macros.protein}g • C: {entry.macros.carbs}g • F: {entry.macros.fat}g
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-chef-orange">{entry.calories}</div>
                          <div className="text-xs text-gray-500">calories</div>
                          {entry.source === 'photo' && (
                            <Badge variant="outline" className="text-xs mt-1">
                              📷 AI
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <i className="fas fa-utensils text-gray-300 text-5xl mb-4"></i>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No meals logged today</h3>
                  <p className="text-gray-600">Start by taking a photo or manually entering your first meal!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
