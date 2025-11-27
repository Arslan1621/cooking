import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Link } from "wouter";

const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  gender: z.string().min(1, "Select your gender"),
  age: z.number().min(13, "Must be at least 13 years old").max(120, "Invalid age"),
  height: z.number().min(100, "Height must be at least 100cm").max(250, "Invalid height"),
  weight: z.number().min(30, "Weight must be at least 30kg").max(300, "Invalid weight"),
  activityLevel: z.string().min(1, "Select your activity level"),
  goal: z.string().min(1, "Select your goal"),
  dietaryRestrictions: z.array(z.string()),
});

type ProfileForm = z.infer<typeof profileSchema>;

const genderOptions = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "prefer_not_to_say", label: "Prefer not to say" }
];

const activityLevels = [
  { value: "sedentary", label: "Sedentary", description: "Little to no exercise" },
  { value: "lightly_active", label: "Lightly Active", description: "Light exercise 1-3 days/week" },
  { value: "moderately_active", label: "Moderately Active", description: "Moderate exercise 3-5 days/week" },
  { value: "very_active", label: "Very Active", description: "Hard exercise 6-7 days/week" },
  { value: "extremely_active", label: "Extremely Active", description: "Very hard exercise, physical job" }
];

const goals = [
  { value: "lose_weight", label: "Lose Weight", icon: "📉", color: "text-red-600" },
  { value: "gain_muscle", label: "Gain Muscle", icon: "💪", color: "text-blue-600" },
  { value: "maintain_weight", label: "Maintain Weight", icon: "⚖️", color: "text-green-600" },
  { value: "eat_healthy", label: "Eat Healthy", icon: "🥗", color: "text-emerald-600" },
];

const dietaryOptions = [
  "vegetarian", "vegan", "pescatarian", "keto", "paleo", "mediterranean",
  "gluten-free", "dairy-free", "low-carb", "low-sodium", "diabetic-friendly"
];

export default function Profile() {
  const { toast } = useToast();
  const { user, isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();

  // Redirect to login if not authenticated
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

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      gender: "",
      age: 25,
      height: 170,
      weight: 70,
      activityLevel: "",
      goal: "",
      dietaryRestrictions: [],
    },
  });

  // Set form values when user data loads
  useEffect(() => {
    if (user) {
      form.reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        gender: user.gender || "",
        age: user.age || 25,
        height: user.height || 170,
        weight: parseFloat(user.weight?.toString() || "70"),
        activityLevel: user.activityLevel || "",
        goal: user.goal || "",
        dietaryRestrictions: user.dietaryRestrictions || [],
      });
    }
  }, [user, form]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: ProfileForm) => {
      return await apiRequest("/api/profile", {
        method: "PATCH",
        body: data,
      });
    },
    onSuccess: () => {
      toast({
        title: "Profile Updated! ✅",
        description: "Your profile has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
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
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ProfileForm) => {
    updateProfileMutation.mutate(data);
  };

  const toggleDietaryRestriction = (restriction: string) => {
    const current = form.getValues("dietaryRestrictions");
    const updated = current.includes(restriction)
      ? current.filter(r => r !== restriction)
      : [...current, restriction];
    form.setValue("dietaryRestrictions", updated);
  };

  const calculateBMR = () => {
    const weight = form.watch("weight");
    const height = form.watch("height");
    const age = form.watch("age");
    const gender = form.watch("gender");
    
    if (!weight || !height || !age || !gender) return 0;
    
    // Mifflin-St Jeor Equation
    if (gender === 'male') {
      return Math.round((10 * weight) + (6.25 * height) - (5 * age) + 5);
    } else {
      return Math.round((10 * weight) + (6.25 * height) - (5 * age) - 161);
    }
  };

  const calculateBMI = () => {
    const weight = form.watch("weight");
    const height = form.watch("height");
    
    if (!weight || !height) return 0;
    
    return parseFloat(((weight / ((height / 100) ** 2)).toFixed(1)));
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { category: "Underweight", color: "text-blue-600" };
    if (bmi < 25) return { category: "Normal", color: "text-green-600" };
    if (bmi < 30) return { category: "Overweight", color: "text-yellow-600" };
    return { category: "Obese", color: "text-red-600" };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const bmr = calculateBMR();
  const bmi = calculateBMI();
  const bmiCategory = getBMICategory(bmi);

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            My Profile
          </h1>
          <p className="text-gray-600">
            Manage your account settings and preferences
          </p>
        </div>

        <Tabs defaultValue="personal" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="personal">Personal Info</TabsTrigger>
            <TabsTrigger value="health">Health & Goals</TabsTrigger>
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="personal">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={user?.profileImageUrl || ""} />
                    <AvatarFallback>
                      {(user?.firstName?.[0] || "") + (user?.lastName?.[0] || "")}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-xl font-bold">Personal Information</div>
                    <div className="text-sm text-gray-600">Update your basic profile details</div>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" disabled />
                          </FormControl>
                          <p className="text-sm text-gray-500">Email cannot be changed</p>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gender"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Gender</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {genderOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="age"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Age</FormLabel>
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
                    </div>

                    <Button 
                      type="submit" 
                      disabled={updateProfileMutation.isPending}
                      className="bg-chef-orange hover:bg-chef-orange/90"
                    >
                      {updateProfileMutation.isPending ? (
                        <>
                          <LoadingSpinner size="sm" className="mr-2" />
                          Saving...
                        </>
                      ) : (
                        "Save Changes"
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health">
            <div className="grid gap-6">
              {/* Health Metrics */}
              <Card>
                <CardHeader>
                  <CardTitle>Health Metrics</CardTitle>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="height"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Height (cm)</FormLabel>
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
                          name="weight"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Weight (kg)</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number"
                                  step="0.1"
                                  {...field}
                                  onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      {/* Calculated Metrics */}
                      {bmi > 0 && (
                        <div className="bg-gray-50 rounded-lg p-4">
                          <h4 className="font-medium mb-3">Calculated Metrics</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">BMI:</span>
                              <span className={`ml-2 font-medium ${bmiCategory.color}`}>
                                {bmi} ({bmiCategory.category})
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">BMR:</span>
                              <span className="ml-2 font-medium">{bmr} calories/day</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="activityLevel"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Activity Level</FormLabel>
                            <Select value={field.value} onValueChange={field.onChange}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {activityLevels.map((level) => (
                                  <SelectItem key={level.value} value={level.value}>
                                    <div>
                                      <div className="font-medium">{level.label}</div>
                                      <div className="text-sm text-gray-500">{level.description}</div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="goal"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Primary Goal</FormLabel>
                            <div className="grid grid-cols-2 gap-3">
                              {goals.map((goal) => (
                                <button
                                  key={goal.value}
                                  type="button"
                                  onClick={() => field.onChange(goal.value)}
                                  className={`p-4 rounded-lg text-left transition-colors border-2 ${
                                    field.value === goal.value
                                      ? "border-chef-orange bg-chef-orange/5"
                                      : "border-gray-200 hover:border-gray-300"
                                  }`}
                                >
                                  <div className="flex items-center space-x-2">
                                    <span className="text-2xl">{goal.icon}</span>
                                    <div>
                                      <div className="font-medium">{goal.label}</div>
                                    </div>
                                  </div>
                                </button>
                              ))}
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="dietaryRestrictions"
                        render={() => (
                          <FormItem>
                            <FormLabel>Dietary Preferences & Restrictions</FormLabel>
                            <div className="grid grid-cols-3 gap-2">
                              {dietaryOptions.map((diet) => (
                                <button
                                  key={diet}
                                  type="button"
                                  onClick={() => toggleDietaryRestriction(diet)}
                                  className={`px-3 py-2 rounded-lg text-sm transition-colors ${
                                    form.watch("dietaryRestrictions").includes(diet)
                                      ? "bg-chef-orange text-white"
                                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                  }`}
                                >
                                  {diet.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                </button>
                              ))}
                            </div>
                          </FormItem>
                        )}
                      />

                      <Button 
                        type="submit" 
                        disabled={updateProfileMutation.isPending}
                        className="bg-chef-orange hover:bg-chef-orange/90"
                      >
                        {updateProfileMutation.isPending ? (
                          <>
                            <LoadingSpinner size="sm" className="mr-2" />
                            Saving...
                          </>
                        ) : (
                          "Save Health Profile"
                        )}
                      </Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="subscription">
            <Card>
              <CardHeader>
                <CardTitle>Subscription & Billing</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Current Plan */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <h3 className="font-medium text-lg">Current Plan</h3>
                    <p className="text-gray-600">
                      You are currently on the <Badge variant="outline" className="ml-1">
                        {user?.subscriptionTier === 'pro' ? 'Pro' : 'Basic'}
                      </Badge> plan
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-chef-orange">
                      {user?.subscriptionTier === 'pro' ? '$12.99' : '$0'}
                    </div>
                    <div className="text-sm text-gray-600">per month</div>
                  </div>
                </div>

                {/* Plan Features */}
                <div>
                  <h4 className="font-medium mb-3">Your Plan Includes:</h4>
                  <div className="space-y-2">
                    {user?.subscriptionTier === 'pro' ? (
                      <>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          AI Calorie Tracking with Photo Analysis
                        </div>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          Unlimited Recipe Generations
                        </div>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          Meal Plans up to 30 days
                        </div>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          Unlimited Cookbook & Shopping Lists
                        </div>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          Priority Email Support
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          Manual Calorie Tracking
                        </div>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          10 Monthly Recipe Generations
                        </div>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          Meal Plans up to 3 days
                        </div>
                        <div className="flex items-center text-green-600">
                          <i className="fas fa-check mr-2"></i>
                          Save 5 Recipes in Cookbook
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* Subscription Actions */}
                <div className="flex space-x-4 pt-4">
                  {user?.subscriptionTier === 'basic' ? (
                    <Link href="/pricing">
                      <Button className="bg-chef-orange hover:bg-chef-orange/90">
                        <i className="fas fa-crown mr-2"></i>
                        Upgrade to Pro
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Button variant="outline">
                        <i className="fas fa-credit-card mr-2"></i>
                        Update Payment Method
                      </Button>
                      <Button variant="outline">
                        <i className="fas fa-download mr-2"></i>
                        Download Invoice
                      </Button>
                    </>
                  )}
                </div>

                {user?.subscriptionTier === 'pro' && (
                  <div className="text-sm text-gray-500 pt-2">
                    <p>
                      Your subscription will renew on{" "}
                      {user.subscriptionExpiresAt 
                        ? new Date(user.subscriptionExpiresAt).toLocaleDateString()
                        : "the next billing cycle"
                      }. You can cancel anytime.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
