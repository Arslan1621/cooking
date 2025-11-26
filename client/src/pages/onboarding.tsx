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
import { apiRequest } from "@/lib/queryClient";
import { z } from "zod";
import { LoadingSpinner } from "@/components/LoadingSpinner";

const onboardingSchema = z.object({
  age: z.coerce.number().min(13).max(120),
  gender: z.enum(["male", "female", "other", "prefer_not_to_say"]),
  height: z.coerce.number().min(50).max(250),
  weight: z.coerce.number().min(30).max(500),
  activityLevel: z.enum(["sedentary", "lightly_active", "moderately_active", "very_active", "extremely_active"]),
  goal: z.enum(["lose_weight", "gain_muscle", "eat_healthy", "maintain_weight"]),
  dietaryRestrictions: z.array(z.string()).default([]),
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

export default function Onboarding() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDietary, setSelectedDietary] = useState<string[]>([]);

  const form = useForm<OnboardingFormData>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      age: undefined,
      gender: undefined,
      height: undefined,
      weight: undefined,
      activityLevel: undefined,
      goal: undefined,
      dietaryRestrictions: [],
    },
  });

  const onSubmit = async (data: OnboardingFormData) => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          dietaryRestrictions: selectedDietary,
        }),
      });
      
      if (!response.ok) throw new Error("Failed to save profile");
      
      toast({
        title: "Profile Created!",
        description: "Your preferences have been saved. Let's get cooking!",
      });
      
      navigate("/dashboard", { replace: true });
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
            Tell us about yourself so we can recommend the perfect recipes for you
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

                {/* Fitness Section */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Fitness & Goals</h3>

                  <FormField
                    control={form.control}
                    name="activityLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Activity Level</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select activity level" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="sedentary">Sedentary (little or no exercise)</SelectItem>
                            <SelectItem value="lightly_active">Lightly Active (1-3 days/week)</SelectItem>
                            <SelectItem value="moderately_active">Moderately Active (3-5 days/week)</SelectItem>
                            <SelectItem value="very_active">Very Active (6-7 days/week)</SelectItem>
                            <SelectItem value="extremely_active">Extremely Active (twice per day)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          How much do you exercise per week?
                        </FormDescription>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="goal"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Primary Goal</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select your goal" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="lose_weight">Lose Weight</SelectItem>
                            <SelectItem value="gain_muscle">Gain Muscle</SelectItem>
                            <SelectItem value="eat_healthy">Eat Healthier</SelectItem>
                            <SelectItem value="maintain_weight">Maintain Weight</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          What's your main health goal?
                        </FormDescription>
                      </FormItem>
                    )}
                  />
                </div>

                {/* Dietary Preferences */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900">Dietary Preferences</h3>
                  <FormDescription>
                    Select any dietary restrictions or preferences
                  </FormDescription>
                  
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
                        Saving...
                      </>
                    ) : (
                      "Complete Setup & Start Cooking"
                    )}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        <p className="text-center text-gray-600 text-sm mt-8">
          You can always update these preferences later in your profile settings
        </p>
      </div>
    </div>
  );
}
