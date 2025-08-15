import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { MealPlan } from "@/types/recipe";

const mealPlanSchema = z.object({
  days: z.number().min(3, "Minimum 3 days").max(30, "Maximum 30 days"),
  goal: z.string().min(1, "Select a goal"),
  activityLevel: z.string().min(1, "Select activity level"),
  dietaryRestrictions: z.array(z.string()),
});

type MealPlanForm = z.infer<typeof mealPlanSchema>;

const goals = [
  { value: "eat_healthy", label: "Eat Healthy" },
  { value: "lose_weight", label: "Lose Weight" },
  { value: "gain_muscle", label: "Gain Muscle" },
  { value: "maintain_weight", label: "Maintain Weight" }
];

const activityLevels = [
  { value: "sedentary", label: "Sedentary" },
  { value: "lightly_active", label: "Lightly Active" },
  { value: "moderately_active", label: "Moderately Active" },
  { value: "very_active", label: "Very Active" },
  { value: "extremely_active", label: "Extremely Active" }
];

const dietaryOptions = [
  "vegetarian", "vegan", "pescatarian", "keto", "paleo", 
  "gluten-free", "dairy-free", "low-carb", "mediterranean"
];

const dayOptions = [3, 7, 14, 21, 30];

export default function MealPlanChef() {
  const [generatedMealPlan, setGeneratedMealPlan] = useState<MealPlan | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const form = useForm<MealPlanForm>({
    resolver: zodResolver(mealPlanSchema),
    defaultValues: {
      days: 7,
      goal: "",
      activityLevel: "",
      dietaryRestrictions: [],
    },
  });

  const generateMealPlanMutation = useMutation({
    mutationFn: async (data: MealPlanForm) => {
      return await apiRequest("/api/meal-plans/generate", {
        method: "POST",
        body: data,
      });
    },
    onSuccess: (mealPlan: MealPlan) => {
      setGeneratedMealPlan(mealPlan);
      toast({
        title: "Meal Plan Generated! 📅",
        description: "Your personalized meal plan is ready!",
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
        title: "Meal Plan Generation Failed",
        description: "Please complete your profile first or try again later.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MealPlanForm) => {
    generateMealPlanMutation.mutate(data);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const current = form.getValues("dietaryRestrictions");
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    form.setValue("dietaryRestrictions", updated);
  };

  if (!user) {
    return (
      <div className="min-h-screen pt-20 bg-chef-gray flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="text-center py-8">
            <i className="fas fa-user-circle text-gray-300 text-6xl mb-4"></i>
            <h3 className="text-xl font-bold mb-2">Profile Required</h3>
            <p className="text-gray-600 mb-4">
              Please complete your profile to generate personalized meal plans.
            </p>
            <Button asChild>
              <a href="/profile">Complete Profile</a>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-blue-100 text-blue-800 mb-4 text-lg px-4 py-2">
            📆 MealPlanChef
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Your AI Powered <span className="text-chef-orange">Nutritionist</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Vegan? Paleo? Keto? Trying to build muscle? Trying to eat healthier? No problem. Let MealPlanChef do the heavy lifting. MealPlanChef generates meal plans for your week to help you achieve your goal or diet plan.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Meal Plan Generation Form */}
          <Card className="meal-plan-gradient text-white">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Create Your Meal Plan</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Step 1: Personal Info Display */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">1</span>
                      Your Profile
                    </h3>
                    <div className="bg-white/20 rounded-lg p-4 space-y-2">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-white/70">Gender:</span>
                          <span className="ml-2 font-medium">{user.gender || 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-white/70">Age:</span>
                          <span className="ml-2 font-medium">{user.age || 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-white/70">Height:</span>
                          <span className="ml-2 font-medium">{user.height ? `${user.height}cm` : 'Not set'}</span>
                        </div>
                        <div>
                          <span className="text-white/70">Weight:</span>
                          <span className="ml-2 font-medium">{user.weight ? `${user.weight}kg` : 'Not set'}</span>
                        </div>
                      </div>
                      {(!user.gender || !user.age || !user.height || !user.weight) && (
                        <p className="text-white/90 text-sm">
                          <a href="/profile" className="underline hover:no-underline">
                            Complete your profile
                          </a> for more accurate meal plans.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 2: Goal Selection */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">2</span>
                      Select Your Goal
                    </h3>
                    <FormField
                      control={form.control}
                      name="goal"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-2">
                            {goals.map((goal) => (
                              <button
                                key={goal.value}
                                type="button"
                                onClick={() => field.onChange(goal.value)}
                                className={`px-4 py-3 rounded-lg transition-colors ${
                                  field.value === goal.value
                                    ? "bg-white text-chef-orange"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                              >
                                {goal.label}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 3: Activity Level */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">3</span>
                      Activity Level
                    </h3>
                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <div className="space-y-2">
                            {activityLevels.map((level) => (
                              <button
                                key={level.value}
                                type="button"
                                onClick={() => field.onChange(level.value)}
                                className={`w-full px-4 py-3 rounded-lg text-left transition-colors ${
                                  field.value === level.value
                                    ? "bg-white text-chef-orange"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                              >
                                {level.label}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 4: Dietary Restrictions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">4</span>
                      Dietary Preferences
                    </h3>
                    <FormField
                      control={form.control}
                      name="dietaryRestrictions"
                      render={() => (
                        <FormItem>
                          <div className="grid grid-cols-2 gap-2">
                            {dietaryOptions.map((diet) => (
                              <button
                                key={diet}
                                type="button"
                                onClick={() => toggleDietaryRestriction(diet)}
                                className={`px-3 py-2 rounded-lg capitalize text-sm transition-colors ${
                                  form.watch("dietaryRestrictions").includes(diet)
                                    ? "bg-white text-chef-orange"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                              >
                                {diet.replace('-', ' ')}
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Step 5: Duration */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-bold flex items-center">
                      <span className="bg-white text-chef-orange w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold">5</span>
                      Plan Duration
                    </h3>
                    <FormField
                      control={form.control}
                      name="days"
                      render={({ field }) => (
                        <FormItem>
                          <div className="grid grid-cols-3 gap-2">
                            {dayOptions.map((days) => (
                              <button
                                key={days}
                                type="button"
                                onClick={() => field.onChange(days)}
                                className={`px-4 py-3 rounded-lg transition-colors ${
                                  field.value === days
                                    ? "bg-white text-chef-orange"
                                    : "bg-white/20 text-white hover:bg-white/30"
                                }`}
                              >
                                📆 {days} Days
                              </button>
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Generate Button */}
                  <Button
                    type="submit"
                    disabled={generateMealPlanMutation.isPending}
                    className="w-full bg-white text-chef-orange hover:bg-gray-100 py-6 text-lg font-bold"
                  >
                    {generateMealPlanMutation.isPending ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Generating Meal Plan...
                      </>
                    ) : (
                      "Generate your Meal Plan 📅"
                    )}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          {/* Generated Meal Plan Display */}
          <div>
            {generatedMealPlan ? (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>{generatedMealPlan.name}</span>
                    <Badge className="meal-plan-gradient text-white">📆 MealPlanChef</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Plan Overview */}
                  <div className="grid grid-cols-2 gap-4 text-center">
                    <div>
                      <div className="font-bold text-2xl text-chef-orange">
                        {generatedMealPlan.meals?.totalCalories || 2000}
                      </div>
                      <div className="text-sm text-gray-600">Daily Calories</div>
                    </div>
                    <div>
                      <div className="font-bold text-2xl text-chef-orange">
                        {new Date(generatedMealPlan.endDate).getDate() - new Date(generatedMealPlan.startDate).getDate() + 1}
                      </div>
                      <div className="text-sm text-gray-600">Days</div>
                    </div>
                  </div>

                  {/* Daily Macros */}
                  {generatedMealPlan.meals?.dailyMacros && (
                    <div>
                      <h4 className="font-bold text-lg mb-3">Daily Nutrition Targets:</h4>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <div className="font-bold text-chef-orange">{generatedMealPlan.meals.dailyMacros.protein}g</div>
                          <div className="text-sm text-gray-600">Protein</div>
                        </div>
                        <div>
                          <div className="font-bold text-green-600">{generatedMealPlan.meals.dailyMacros.carbs}g</div>
                          <div className="text-sm text-gray-600">Carbs</div>
                        </div>
                        <div>
                          <div className="font-bold text-yellow-600">{generatedMealPlan.meals.dailyMacros.fat}g</div>
                          <div className="text-sm text-gray-600">Fat</div>
                        </div>
                        <div>
                          <div className="font-bold text-blue-600">{generatedMealPlan.meals.dailyMacros.fiber}g</div>
                          <div className="text-sm text-gray-600">Fiber</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Sample Meals */}
                  {generatedMealPlan.meals?.meals && (
                    <div>
                      <h4 className="font-bold text-lg mb-3">Sample Meals:</h4>
                      <div className="space-y-4 max-h-64 overflow-y-auto">
                        {generatedMealPlan.meals.meals.slice(0, 6).map((meal: any, index: number) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-10 h-10 bg-chef-orange/10 rounded-full flex items-center justify-center">
                              <span>
                                {meal.mealType === 'breakfast' ? '🥞' :
                                 meal.mealType === 'lunch' ? '🥗' :
                                 meal.mealType === 'dinner' ? '🍽️' : '🍿'}
                              </span>
                            </div>
                            <div className="flex-1">
                              <h5 className="font-medium">{meal.recipe?.title || 'Meal'}</h5>
                              <p className="text-sm text-gray-600 capitalize">
                                Day {meal.day} • {meal.mealType} • {meal.recipe?.calories || 0} cal
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Shopping List */}
                  {generatedMealPlan.shoppingList && generatedMealPlan.shoppingList.length > 0 && (
                    <div>
                      <h4 className="font-bold text-lg mb-3">Shopping List:</h4>
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {generatedMealPlan.shoppingList.slice(0, 8).map((item, index) => (
                            <div key={index} className="flex items-center">
                              <i className="fas fa-check-square text-green-500 mr-2"></i>
                              {item}
                            </div>
                          ))}
                          {generatedMealPlan.shoppingList.length > 8 && (
                            <div className="text-gray-500">
                              +{generatedMealPlan.shoppingList.length - 8} more items
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex space-x-3">
                    <Button className="flex-1">
                      <i className="fas fa-heart mr-2"></i>
                      Save Meal Plan
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <i className="fas fa-print mr-2"></i>
                      Print Plan
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-full flex items-center justify-center">
                <CardContent className="text-center py-12">
                  <div className="text-6xl mb-4">📅</div>
                  <h3 className="text-xl font-bold mb-2">Ready to Plan?</h3>
                  <p className="text-gray-600">
                    Fill out the form to generate your personalized meal plan!
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
