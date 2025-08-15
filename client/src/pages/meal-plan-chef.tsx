import { useState } from "react";
import Navigation from "@/components/navigation";
import MultiStepForm from "@/components/multi-step-form";
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
import { useAuth } from "@/hooks/useAuth";
import { Calendar, Clock, Users, Flame, ChefHat } from "lucide-react";

const goals = ["Eat Healthy", "Lose Weight", "Gain Muscle"];
const activityLevels = ["Sedentary", "Lightly Active", "Moderately Active", "Very Active"];
const dietaryOptions = ["None", "Vegetarian", "Vegan", "Paleo", "Keto", "Gluten-Free", "Dairy-Free"];
const planDurations = [3, 7, 14, 21, 30];

export default function MealPlanChef() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    gender: user?.gender || "male",
    age: user?.age || 30,
    height: user?.height || 175,
    weight: user?.weight ? parseFloat(user.weight) : 70,
    goal: "Eat Healthy",
    activityLevel: "Moderately Active",
    dietaryRestrictions: [] as string[],
    days: 7,
  });
  const [generatedPlan, setGeneratedPlan] = useState<any>(null);

  const generateMealPlan = useMutation({
    mutationFn: async (params: any) => {
      const response = await apiRequest('POST', '/api/meal-plans/generate', params);
      return response.json();
    },
    onSuccess: (plan) => {
      setGeneratedPlan(plan);
      queryClient.invalidateQueries({ queryKey: ['/api/meal-plans'] });
      toast({
        title: "Meal Plan Generated! 🎉",
        description: "Your personalized meal plan is ready!",
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

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleDietaryRestriction = (restriction: string) => {
    if (restriction === "None") {
      updateFormData({ dietaryRestrictions: [] });
      return;
    }
    
    const current = formData.dietaryRestrictions.filter(r => r !== "None");
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    
    updateFormData({ dietaryRestrictions: updated });
  };

  const handleGenerate = () => {
    generateMealPlan.mutate({
      days: formData.days,
      goal: formData.goal,
      dietaryRestrictions: formData.dietaryRestrictions,
      activityLevel: formData.activityLevel,
      userStats: {
        age: formData.age,
        gender: formData.gender,
        weight: formData.weight,
        height: formData.height,
      },
    });
  };

  const steps = [
    {
      id: "personal-info",
      title: "Personal Info",
      description: "Tell us about yourself for personalized recommendations",
      content: (
        <div className="space-y-6">
          <div>
            <Label className="text-base font-medium">What is your Gender?</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              <Button
                variant={formData.gender === "male" ? "default" : "outline"}
                onClick={() => updateFormData({ gender: "male" })}
                className={formData.gender === "male" ? "bg-chef-orange" : ""}
              >
                Male
              </Button>
              <Button
                variant={formData.gender === "female" ? "default" : "outline"}
                onClick={() => updateFormData({ gender: "female" })}
                className={formData.gender === "female" ? "bg-chef-orange" : ""}
              >
                Female
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => updateFormData({ height: parseInt(e.target.value) || 0 })}
                placeholder="175"
              />
            </div>
            <div>
              <Label htmlFor="weight">Weight (kg)</Label>
              <Input
                id="weight"
                type="number"
                value={formData.weight}
                onChange={(e) => updateFormData({ weight: parseFloat(e.target.value) || 0 })}
                placeholder="70"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="age">Age (years)</Label>
            <Input
              id="age"
              type="number"
              value={formData.age}
              onChange={(e) => updateFormData({ age: parseInt(e.target.value) || 0 })}
              placeholder="30"
              className="w-full"
            />
          </div>
        </div>
      ),
      isValid: formData.gender && formData.height > 0 && formData.weight > 0 && formData.age > 0,
    },
    {
      id: "goal",
      title: "Your Goal",
      description: "What do you want to achieve with your meal plan?",
      content: (
        <div className="space-y-4">
          {goals.map((goal) => (
            <Button
              key={goal}
              variant={formData.goal === goal ? "default" : "outline"}
              onClick={() => updateFormData({ goal })}
              className={`w-full justify-start h-12 ${formData.goal === goal ? "bg-chef-orange" : ""}`}
            >
              {goal}
            </Button>
          ))}
        </div>
      ),
      isValid: !!formData.goal,
    },
    {
      id: "activity",
      title: "Activity Level",
      description: "How active are you on a typical day?",
      content: (
        <div className="space-y-4">
          {activityLevels.map((level) => (
            <Button
              key={level}
              variant={formData.activityLevel === level ? "default" : "outline"}
              onClick={() => updateFormData({ activityLevel: level })}
              className={`w-full justify-start h-12 ${formData.activityLevel === level ? "bg-chef-orange" : ""}`}
            >
              {level}
            </Button>
          ))}
        </div>
      ),
      isValid: !!formData.activityLevel,
    },
    {
      id: "dietary",
      title: "Dietary Preferences",
      description: "Select any dietary restrictions or preferences",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {dietaryOptions.map((option) => (
              <Button
                key={option}
                variant={
                  option === "None" 
                    ? (formData.dietaryRestrictions.length === 0 ? "default" : "outline")
                    : (formData.dietaryRestrictions.includes(option) ? "default" : "outline")
                }
                onClick={() => toggleDietaryRestriction(option)}
                className={
                  option === "None" 
                    ? (formData.dietaryRestrictions.length === 0 ? "bg-chef-orange" : "")
                    : (formData.dietaryRestrictions.includes(option) ? "bg-chef-orange" : "")
                }
              >
                {option}
              </Button>
            ))}
          </div>
          
          {formData.dietaryRestrictions.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Selected:</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.dietaryRestrictions.map((restriction) => (
                  <Badge key={restriction} variant="default" className="bg-chef-orange">
                    {restriction}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      ),
      isValid: true,
    },
    {
      id: "duration",
      title: "Plan Duration",
      description: "How many days should your meal plan cover?",
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {planDurations.map((days) => (
              <Button
                key={days}
                variant={formData.days === days ? "default" : "outline"}
                onClick={() => updateFormData({ days })}
                className={`${formData.days === days ? "bg-chef-orange" : ""}`}
              >
                📆 {days} Days
              </Button>
            ))}
          </div>
        </div>
      ),
      isValid: !!formData.days,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              📆 MealPlanChef
            </h1>
            <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
              Your AI Powered Nutritionist
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Vegan? Paleo? Keto? Trying to build muscle? Trying to eat healthier? No problem. Let MealPlanChef do the heavy lifting. MealPlanChef generates meal plans for your week to help you achieve your goal or diet plan.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              {!generatedPlan ? (
                <MultiStepForm
                  steps={steps}
                  onComplete={handleGenerate}
                  isSubmitting={generateMealPlan.isPending}
                  submitButtonText="Generate your Meal Plan 📅"
                />
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Calendar className="h-5 w-5 text-chef-orange" />
                      <span>Your {formData.days}-Day Meal Plan</span>
                    </CardTitle>
                    <CardDescription>
                      Personalized for {formData.goal.toLowerCase()} with {formData.dietaryRestrictions.length > 0 ? formData.dietaryRestrictions.join(", ") : "no dietary restrictions"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Daily Nutrition Summary */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{generatedPlan.totalCalories}</div>
                        <div className="text-sm text-gray-600">Daily Calories</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{generatedPlan.dailyMacros?.protein || 0}g</div>
                        <div className="text-sm text-gray-600">Protein</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{generatedPlan.dailyMacros?.carbs || 0}g</div>
                        <div className="text-sm text-gray-600">Carbs</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-gray-900">{generatedPlan.dailyMacros?.fat || 0}g</div>
                        <div className="text-sm text-gray-600">Fat</div>
                      </div>
                    </div>

                    {/* Meals by Day */}
                    <div className="space-y-6">
                      {Array.from({ length: formData.days }, (_, dayIndex) => {
                        const dayMeals = generatedPlan.meals?.filter((meal: any) => meal.day === dayIndex + 1) || [];
                        return (
                          <div key={dayIndex}>
                            <h3 className="text-lg font-semibold text-gray-900 mb-3">
                              Day {dayIndex + 1}
                            </h3>
                            <div className="grid md:grid-cols-3 gap-4">
                              {["breakfast", "lunch", "dinner"].map((mealType) => {
                                const meal = dayMeals.find((m: any) => m.mealType.toLowerCase() === mealType);
                                return (
                                  <Card key={mealType} className="border-l-4 border-l-chef-orange">
                                    <CardContent className="p-4">
                                      <h4 className="font-medium text-gray-900 capitalize mb-2">{mealType}</h4>
                                      {meal ? (
                                        <div className="space-y-2">
                                          <p className="text-sm font-medium">{meal.recipe.title}</p>
                                          <div className="flex items-center space-x-3 text-xs text-gray-500">
                                            <span className="flex items-center">
                                              <Clock className="h-3 w-3 mr-1" />
                                              {(meal.recipe.prepTime || 0) + (meal.recipe.cookTime || 0)} min
                                            </span>
                                            <span className="flex items-center">
                                              <Flame className="h-3 w-3 mr-1" />
                                              {meal.recipe.calories} cal
                                            </span>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-500">No meal planned</p>
                                      )}
                                    </CardContent>
                                  </Card>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <Separator />

                    <div className="flex space-x-3">
                      <Button 
                        onClick={() => setGeneratedPlan(null)}
                        variant="outline"
                        className="flex-1"
                      >
                        Generate New Plan
                      </Button>
                      <Button 
                        className="flex-1 bg-chef-orange hover:bg-chef-orange/90"
                        onClick={() => {
                          toast({
                            title: "Plan Saved! 📅",
                            description: "Your meal plan has been saved to your dashboard.",
                          });
                        }}
                      >
                        Save Plan
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <ChefHat className="h-5 w-5 text-chef-orange" />
                    <span>Plan Summary</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium text-gray-600">Personal Info</Label>
                    <p className="text-sm">{formData.gender}, {formData.age} years old</p>
                    <p className="text-sm">{formData.height}cm, {formData.weight}kg</p>
                  </div>

                  <Separator />

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Goal</Label>
                    <p className="text-sm">{formData.goal}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Activity Level</Label>
                    <p className="text-sm">{formData.activityLevel}</p>
                  </div>

                  <div>
                    <Label className="text-sm font-medium text-gray-600">Duration</Label>
                    <p className="text-sm">{formData.days} days</p>
                  </div>

                  {formData.dietaryRestrictions.length > 0 && (
                    <div>
                      <Label className="text-sm font-medium text-gray-600">Dietary Restrictions</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {formData.dietaryRestrictions.map((restriction) => (
                          <Badge key={restriction} variant="secondary" className="text-xs">
                            {restriction}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {!generatedPlan && (
                    <div className="text-center pt-4">
                      <p className="text-sm text-gray-500">
                        Complete the form to generate your personalized meal plan
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
