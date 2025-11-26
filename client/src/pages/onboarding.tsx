import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const onboardingSchema = z.object({
  age: z.coerce.number().min(13).max(120),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  height: z.coerce.number().min(50).max(250),
  weight: z.coerce.number().min(30).max(500),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]),
  cookingSkillLevel: z.enum(["beginner", "intermediate", "advanced", "expert"]),
  goal: z.enum(["lose_weight", "gain_muscle", "eat_healthy", "maintain_weight"]),
  goalAmount: z.coerce.number().min(0.5).max(100).optional(),
  goalTimeline: z.string().min(1),
  muscleGainPerWeek: z.coerce.number().min(0).max(5).optional(),
  dietaryRestrictions: z.array(z.string()).default([]),
  allergies: z.array(z.string()).default([]),
});

type OnboardingFormData = z.infer<typeof onboardingSchema>;

const dietaryOptions = [
  { id: "vegetarian", label: "Vegetarian" },
  { id: "vegan", label: "Vegan" },
  { id: "gluten_free", label: "Gluten Free" },
  { id: "dairy_free", label: "Dairy Free" },
  { id: "nut_free", label: "Nut Free" },
  { id: "keto", label: "Keto" },
  { id: "paleo", label: "Paleo" },
  { id: "low_sodium", label: "Low Sodium" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
];

const allergyOptions = [
  { id: "peanuts", label: "Peanuts" },
  { id: "tree_nuts", label: "Tree Nuts" },
  { id: "shellfish", label: "Shellfish" },
  { id: "fish", label: "Fish" },
  { id: "milk", label: "Milk" },
  { id: "eggs", label: "Eggs" },
  { id: "soy", label: "Soy" },
  { id: "wheat", label: "Wheat" },
  { id: "sesame", label: "Sesame" },
];

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);
  const [selectedAllergies, setSelectedAllergies] = useState<string[]>([]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      height: undefined,
      weight: undefined,
      activityLevel: undefined,
      cookingSkillLevel: undefined,
      goal: undefined,
      goalAmount: undefined,
      goalTimeline: "",
      muscleGainPerWeek: undefined,
      dietaryRestrictions: [],
      allergies: [],
    },
  });

  const selectedGoal = form.watch("goal");

  const calculateMacros = (goal: string, weight: number, activityLevel: string, dailyCalories: number) => {
    const activityMultipliers = {
      sedentary: 1.2,
      lightly_active: 1.375,
      moderately_active: 1.55,
      very_active: 1.725,
      extremely_active: 1.9
    };

    let proteinRatio = 0.25;
    let carbsRatio = 0.45;
    let fatRatio = 0.30;

    if (goal === "gain_muscle") {
      proteinRatio = 0.30;
      carbsRatio = 0.45;
      fatRatio = 0.25;
    } else if (goal === "lose_weight") {
      proteinRatio = 0.35;
      carbsRatio = 0.40;
      fatRatio = 0.25;
    }

    return {
      protein: Math.round(dailyCalories * proteinRatio / 4),
      carbs: Math.round(dailyCalories * carbsRatio / 4),
      fat: Math.round(dailyCalories * fatRatio / 9),
      fiber: 25,
    };
  };

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      // Calculate BMR and daily calories
      const bmr = data.gender === "male"
        ? (88.362 + (13.397 * data.weight) + (4.799 * data.height) - (5.677 * data.age))
        : (447.593 + (9.247 * data.weight) + (3.098 * data.height) - (4.330 * data.age));

      const activityMultipliers = {
        sedentary: 1.2,
        lightly_active: 1.375,
        moderately_active: 1.55,
        very_active: 1.725,
        extremely_active: 1.9
      };

      const dailyCalories = Math.round(bmr * (activityMultipliers[data.activityLevel as keyof typeof activityMultipliers] || 1.375));

      // Adjust calories based on goal
      let adjustedCalories = dailyCalories;
      if (data.goal === "lose_weight") {
        adjustedCalories = Math.round(dailyCalories * 0.85); // 15% deficit
      } else if (data.goal === "gain_muscle") {
        adjustedCalories = Math.round(dailyCalories * 1.10); // 10% surplus
      }

      const macros = calculateMacros(data.goal, data.weight, data.activityLevel, adjustedCalories);

      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          age: data.age,
          gender: data.gender,
          height: data.height,
          weight: data.weight,
          activityLevel: data.activityLevel,
          cookingSkillLevel: data.cookingSkillLevel,
          goal: data.goal,
          goalAmount: data.goalAmount || null,
          goalTimeline: data.goalTimeline,
          muscleGainPerWeek: data.muscleGainPerWeek || null,
          dietaryRestrictions: selectedDietary,
          allergies: selectedAllergies,
          dailyCalorieTarget: adjustedCalories,
          dailyMacros: macros,
        }),
      });

      if (!response.ok) throw new Error("Failed to save profile");

      toast({
        title: "Profile Created!",
        description: "Your personalized plan is ready.",
      });

      navigate("/calorie-plan", { replace: true });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save your preferences. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-chef-gray to-white pt-24 pb-16">
      <div className="max-w-2xl mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Personalize Your ChefGPT Experience
          </h1>
          <p className="text-lg text-gray-600">
            Tell us about yourself so we can recommend the perfect recipes and plan for you
          </p>
        </div>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>
              This helps us personalize recipe recommendations based on your preferences and goals
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                {/* Basic Info Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Basic Information</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="25" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                              <SelectItem value="other">Other</SelectItem>
                              <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="170" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="70" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Cooking & Fitness Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Cooking & Fitness</h3>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="cookingSkillLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cooking Skill Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select level" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="beginner">Beginner</SelectItem>
                              <SelectItem value="intermediate">Intermediate</SelectItem>
                              <SelectItem value="advanced">Advanced</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="activityLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Activity Level</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select activity" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="sedentary">Sedentary</SelectItem>
                              <SelectItem value="lightly_active">Lightly Active</SelectItem>
                              <SelectItem value="moderately_active">Moderately Active</SelectItem>
                              <SelectItem value="very_active">Very Active</SelectItem>
                              <SelectItem value="extremely_active">Extremely Active</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Goals Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Your Goals</h3>

                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Goal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lose_weight">Lose Weight</SelectItem>
                            <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                            <SelectItem value="eat_healthy">Eat Healthier</SelectItem>
                            <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormItem>
                    )}
                  />

                  {selectedGoal && selectedGoal !== "eat_healthy" && (
                    <>
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="goalAmount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                How much to {selectedGoal === "lose_weight" ? "lose" : "gain"}? (kg)
                              </FormLabel>
                              <FormControl>
                                <Input type="number" step="0.5" placeholder="5" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="goalTimeline"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timeline</FormLabel>
                              <FormControl>
                                <Input placeholder="e.g., 3 months" {...field} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      {selectedGoal === "gain_muscle" && (
                        <FormField
                          control={form.control}
                          name="muscleGainPerWeek"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Target Muscle Gain per Week (kg)</FormLabel>
                              <FormControl>
                                <Input type="number" step="0.1" placeholder="0.5" {...field} />
                              </FormControl>
                              <FormDescription>
                                Realistic: 0.25-0.5 kg per week
                              </FormDescription>
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                </div>

                {/* Dietary Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dietary Preferences</h3>
                  <FormDescription>Select any dietary restrictions</FormDescription>

                  <div className="grid grid-cols-2 gap-4">
                    {dietaryOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={option.id}
                          checked={selectedDietary.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedDietary([...selectedDietary, option.id]);
                            } else {
                              setSelectedDietary(selectedDietary.filter(d => d !== option.id));
                            }
                          }}
                        />
                        <label htmlFor={option.id} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Allergies */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Allergies & Intolerances</h3>
                  <FormDescription>What are you allergic to?</FormDescription>

                  <div className="grid grid-cols-2 gap-4">
                    {allergyOptions.map((option) => (
                      <div key={option.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`allergy-${option.id}`}
                          checked={selectedAllergies.includes(option.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedAllergies([...selectedAllergies, option.id]);
                            } else {
                              setSelectedAllergies(selectedAllergies.filter(a => a !== option.id));
                            }
                          }}
                        />
                        <label htmlFor={`allergy-${option.id}`} className="text-sm cursor-pointer">
                          {option.label}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex gap-4 pt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-chef-orange hover:bg-chef-orange/90"
                    disabled={isLoading}
                    data-testid="button-complete-onboarding"
                  >
                    {isLoading ? (
                      <>
                        <LoadingSpinner size="sm" className="mr-2" />
                        Creating Your Plan...
                      </>
                    ) : (
                      "Create My Plan"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
