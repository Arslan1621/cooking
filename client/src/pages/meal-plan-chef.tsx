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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import MealPlanCard from "@/components/meal-plan-card";
import { Calendar, Target, Activity, Clock, Loader2 } from "lucide-react";

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

const dietaryRestrictions = [
  "Vegetarian", "Vegan", "Pescatarian", "Keto", "Paleo", 
  "Gluten-Free", "Dairy-Free", "Nut-Free", "Low-Carb", "Mediterranean"
];

const planDurations = [
  { value: 3, label: "3 Days" },
  { value: 7, label: "📆 7 Days" },
  { value: 14, label: "14 Days" },
  { value: 21, label: "21 Days" },
  { value: 30, label: "30 Days" }
];

export default function MealPlanChef() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading, user } = useAuth();
  const queryClient = useQueryClient();

  const [gender, setGender] = useState("male");
  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [age, setAge] = useState(30);
  const [goal, setGoal] = useState("lose_weight");
  const [activityLevel, setActivityLevel] = useState("sedentary");
  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [duration, setDuration] = useState(7);

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

  // Pre-fill user data if available
  useEffect(() => {
    if (user) {
      if (user.gender) setGender(user.gender);
      if (user.height) setHeight(user.height);
      if (user.weight) setWeight(Number(user.weight));
      if (user.age) setAge(user.age);
      if (user.goal) setGoal(user.goal);
      if (user.activityLevel) setActivityLevel(user.activityLevel);
      if (user.dietaryRestrictions) setSelectedRestrictions(user.dietaryRestrictions);
    }
  }, [user]);

  // Get existing meal plans
  const { data: mealPlans } = useQuery({
    queryKey: ["/api/meal-plans"],
    enabled: isAuthenticated,
  });

  // Generate meal plan mutation
  const generateMealPlanMutation = useMutation({
    mutationFn: async (params: any) => {
      return await apiRequest("POST", "/api/meal-plans/generate", params);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans"] });
      toast({
        title: "Meal Plan Generated!",
        description: "Your personalized meal plan has been created successfully.",
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
        description: "Failed to generate meal plan. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleRestriction = (restriction: string) => {
    setSelectedRestrictions(prev => 
      prev.includes(restriction) 
        ? prev.filter(item => item !== restriction)
        : [...prev, restriction]
    );
  };

  const handleGenerate = () => {
    const params = {
      days: duration,
      goal,
      dietaryRestrictions: selectedRestrictions,
      activityLevel,
      userStats: {
        age,
        gender,
        weight,
        height,
      },
    };

    generateMealPlanMutation.mutate(params);
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
              📆 MealPlanChef
            </h1>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Your AI Powered Nutritionist
            </h2>
            <p className="text-xl text-gray-600 max-w-4xl mx-auto">
              Vegan? Paleo? Keto? Trying to build muscle? Trying to eat healthier? No problem. Let MealPlanChef do the heavy lifting. MealPlanChef generates meal plans for your week to help you achieve your goal or diet plan.
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Configuration Panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Step 1: Personal Information */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </div>
                    <CardTitle>Make your Meal Plan personal</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    MealPlanChef is not a cookie-cutter solution. Each Meal Plan is personalized on your Gender, Age and Body Measurements.
                  </p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="gender">What is your Gender?</Label>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <Button
                        variant={gender === "male" ? "default" : "outline"}
                        onClick={() => setGender("male")}
                        className={gender === "male" 
                          ? "bg-chef-orange hover:bg-chef-orange/90" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange"
                        }
                      >
                        Male
                      </Button>
                      <Button
                        variant={gender === "female" ? "default" : "outline"}
                        onClick={() => setGender("female")}
                        className={gender === "female" 
                          ? "bg-chef-orange hover:bg-chef-orange/90" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange"
                        }
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
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value) || 175)}
                        placeholder="175"
                      />
                    </div>
                    <div>
                      <Label htmlFor="weight">Weight (kg)</Label>
                      <Input
                        id="weight"
                        type="number"
                        value={weight}
                        onChange={(e) => setWeight(parseInt(e.target.value) || 70)}
                        placeholder="70"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="age">Age (years)</Label>
                    <Input
                      id="age"
                      type="number"
                      value={age}
                      onChange={(e) => setAge(parseInt(e.target.value) || 30)}
                      placeholder="30"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Step 2: Goal Selection */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </div>
                    <CardTitle>Select Your Goal</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    You can select Eat Healthy, Gain Muscles, or Lose Weight.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {goals.map((goalOption) => (
                      <Button
                        key={goalOption.value}
                        variant={goal === goalOption.value ? "default" : "outline"}
                        onClick={() => setGoal(goalOption.value)}
                        className={`w-full justify-start ${
                          goal === goalOption.value 
                            ? "bg-chef-orange hover:bg-chef-orange/90" 
                            : "hover:bg-chef-orange/10 hover:border-chef-orange"
                        }`}
                      >
                        {goalOption.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 3: Activity Level */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </div>
                    <CardTitle>Select your Daily Activity Level</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    Pick the option that is most suitable to your current lifestyle.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {activityLevels.map((level) => (
                      <Button
                        key={level.value}
                        variant={activityLevel === level.value ? "default" : "outline"}
                        onClick={() => setActivityLevel(level.value)}
                        className={`w-full justify-start ${
                          activityLevel === level.value 
                            ? "bg-chef-orange hover:bg-chef-orange/90" 
                            : "hover:bg-chef-orange/10 hover:border-chef-orange"
                        }`}
                      >
                        {level.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 4: Dietary Requirements */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      4
                    </div>
                    <CardTitle>Select your dietary requirements</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    You can select among Vegetarian, Pescatarian, Vegan, Gluten-Free, Dairy-Free, Keto, and Paleo.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {dietaryRestrictions.map((restriction) => (
                      <Button
                        key={restriction}
                        variant={selectedRestrictions.includes(restriction) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleRestriction(restriction)}
                        className={selectedRestrictions.includes(restriction)
                          ? "bg-chef-orange hover:bg-chef-orange/90 text-xs" 
                          : "hover:bg-chef-orange/10 hover:border-chef-orange text-xs"
                        }
                      >
                        {restriction}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 5: Duration */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      5
                    </div>
                    <CardTitle>Select the Meal Plan duration</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    Do you need a quick detox weekend or a full week plan?
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {planDurations.map((planDuration) => (
                      <Button
                        key={planDuration.value}
                        variant={duration === planDuration.value ? "default" : "outline"}
                        onClick={() => setDuration(planDuration.value)}
                        className={`w-full justify-start ${
                          duration === planDuration.value 
                            ? "bg-chef-orange hover:bg-chef-orange/90" 
                            : "hover:bg-chef-orange/10 hover:border-chef-orange"
                        }`}
                      >
                        {planDuration.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Step 6: Generate */}
              <Card>
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-chef-orange text-white rounded-full flex items-center justify-center font-bold">
                      6
                    </div>
                    <CardTitle>Generate your Meal Plan</CardTitle>
                  </div>
                  <p className="text-gray-600">
                    Press the Generate button and wait for the magic to happen.
                  </p>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={handleGenerate}
                    disabled={generateMealPlanMutation.isPending}
                    className="w-full bg-chef-orange hover:bg-chef-orange/90 py-6 text-lg font-bold"
                  >
                    {generateMealPlanMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generating Meal Plan...
                      </>
                    ) : (
                      "Generate your Meal Plan 📅"
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
                    <Target className="w-5 h-5 text-chef-orange" />
                    Plan Summary
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gender:</span>
                      <span className="font-medium">{gender.charAt(0).toUpperCase() + gender.slice(1)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Age:</span>
                      <span className="font-medium">{age} years</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Height:</span>
                      <span className="font-medium">{height} cm</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Weight:</span>
                      <span className="font-medium">{weight} kg</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Goal:</span>
                      <span className="font-medium">{goals.find(g => g.value === goal)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Activity:</span>
                      <span className="font-medium">{activityLevels.find(a => a.value === activityLevel)?.label}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Duration:</span>
                      <span className="font-medium">{duration} days</span>
                    </div>
                  </div>

                  {selectedRestrictions.length > 0 && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-medium mb-2">Dietary Restrictions</h4>
                        <div className="flex flex-wrap gap-1">
                          {selectedRestrictions.map((restriction) => (
                            <span key={restriction} className="text-xs bg-chef-orange/10 text-chef-orange px-2 py-1 rounded">
                              {restriction}
                            </span>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Recent Meal Plans */}
              {mealPlans && mealPlans.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-chef-orange" />
                      Recent Plans
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mealPlans.slice(0, 2).map((plan: any) => (
                        <MealPlanCard key={plan.id} mealPlan={plan} showActions={false} />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
