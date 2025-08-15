import OpenAI from "openai";

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "" 
});

export interface RecipeGenerationParams {
  ingredients: string[];
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  cookingTime: number; // in minutes
  skillLevel: "novice" | "intermediate" | "expert";
  kitchenEquipment: string[];
  dietaryRestrictions: string[];
  servings: number;
  chefMode: "all_in" | "gourmet";
}

export interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string;
  cookingTime: number;
  servings: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export async function generateRecipe(params: RecipeGenerationParams): Promise<GeneratedRecipe> {
  const prompt = `Generate a ${params.mealType} recipe using the following parameters:

Ingredients available: ${params.ingredients.join(", ")}
Cooking time: ${params.cookingTime} minutes
Skill level: ${params.skillLevel}
Kitchen equipment: ${params.kitchenEquipment.join(", ")}
Dietary restrictions: ${params.dietaryRestrictions.join(", ")}
Servings: ${params.servings}
Chef mode: ${params.chefMode === "all_in" ? "Use ALL ingredients listed" : "Use only the best combination of ingredients"}

Please provide a complete recipe with nutritional information in JSON format with the following structure:
{
  "title": "Recipe Name",
  "description": "Brief description",
  "ingredients": ["ingredient 1", "ingredient 2", ...],
  "instructions": "Step-by-step cooking instructions",
  "cookingTime": number_in_minutes,
  "servings": number_of_servings,
  "calories": estimated_calories_per_serving,
  "protein": protein_grams_per_serving,
  "carbs": carbs_grams_per_serving,
  "fat": fat_grams_per_serving
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional chef and nutritionist. Generate creative, healthy, and delicious recipes with accurate nutritional information."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Generated Recipe",
      description: result.description || "A delicious recipe",
      ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
      instructions: result.instructions || "No instructions provided",
      cookingTime: parseInt(result.cookingTime) || params.cookingTime,
      servings: parseInt(result.servings) || params.servings,
      calories: parseInt(result.calories) || 0,
      protein: parseFloat(result.protein) || 0,
      carbs: parseFloat(result.carbs) || 0,
      fat: parseFloat(result.fat) || 0,
    };
  } catch (error) {
    console.error("Error generating recipe:", error);
    throw new Error("Failed to generate recipe: " + (error as Error).message);
  }
}

export interface MealPlanParams {
  days: number;
  goal: "eat_healthy" | "lose_weight" | "gain_muscle" | "maintain_weight";
  activityLevel: "sedentary" | "lightly_active" | "moderately_active" | "very_active" | "extremely_active";
  dietaryRestrictions: string[];
  targetCalories?: number;
  gender: string;
  age: number;
  height: number; // cm
  weight: number; // kg
}

export interface MealPlanDay {
  date: string;
  breakfast: GeneratedRecipe;
  lunch: GeneratedRecipe;
  dinner: GeneratedRecipe;
  snacks: GeneratedRecipe[];
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
}

export async function generateMealPlan(params: MealPlanParams): Promise<MealPlanDay[]> {
  // Calculate BMR and daily calories if not provided
  const bmr = params.gender === "male" 
    ? (88.362 + (13.397 * params.weight) + (4.799 * params.height) - (5.677 * params.age))
    : (447.593 + (9.247 * params.weight) + (3.098 * params.height) - (4.330 * params.age));
  
  const activityMultipliers = {
    sedentary: 1.2,
    lightly_active: 1.375,
    moderately_active: 1.55,
    very_active: 1.725,
    extremely_active: 1.9
  };
  
  const dailyCalories = params.targetCalories || Math.round(bmr * activityMultipliers[params.activityLevel]);
  
  const prompt = `Generate a ${params.days}-day meal plan with the following requirements:

Goal: ${params.goal}
Daily calorie target: ${dailyCalories}
Activity level: ${params.activityLevel}
Dietary restrictions: ${params.dietaryRestrictions.join(", ") || "none"}
Person details: ${params.gender}, ${params.age} years old, ${params.height}cm, ${params.weight}kg

For each day, provide:
- Breakfast (25% of daily calories)
- Lunch (35% of daily calories) 
- Dinner (30% of daily calories)
- Snacks (10% of daily calories)

Please provide the meal plan in JSON format as an array of days with this structure:
[
  {
    "date": "Day 1",
    "breakfast": {
      "title": "Recipe Name",
      "description": "Brief description",
      "ingredients": ["ingredient 1", "ingredient 2", ...],
      "instructions": "Step-by-step instructions",
      "cookingTime": number_in_minutes,
      "servings": 1,
      "calories": calories_per_serving,
      "protein": protein_grams,
      "carbs": carbs_grams,
      "fat": fat_grams
    },
    "lunch": { /* same structure */ },
    "dinner": { /* same structure */ },
    "snacks": [{ /* same structure but smaller portions */ }],
    "totalCalories": total_for_day,
    "totalProtein": total_protein_grams,
    "totalCarbs": total_carbs_grams,
    "totalFat": total_fat_grams
  }
]`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional nutritionist and meal planning expert. Create balanced, healthy meal plans that meet specific dietary goals and restrictions."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "[]");
    return Array.isArray(result) ? result : [];
  } catch (error) {
    console.error("Error generating meal plan:", error);
    throw new Error("Failed to generate meal plan: " + (error as Error).message);
  }
}

export interface FoodAnalysisResult {
  foodName: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  servingSize: string;
  confidence: number;
}

export async function analyzeFoodPhoto(base64Image: string): Promise<FoodAnalysisResult> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image and provide detailed nutritional information. Identify the food items and estimate the portion sizes and nutritional content. Respond in JSON format with: { \"foodName\": \"name\", \"calories\": number, \"protein\": number, \"carbs\": number, \"fat\": number, \"servingSize\": \"description\", \"confidence\": number_0_to_1 }"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${base64Image}`
              }
            }
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      foodName: result.foodName || "Unknown Food",
      calories: parseInt(result.calories) || 0,
      protein: parseFloat(result.protein) || 0,
      carbs: parseFloat(result.carbs) || 0,
      fat: parseFloat(result.fat) || 0,
      servingSize: result.servingSize || "1 serving",
      confidence: parseFloat(result.confidence) || 0.5,
    };
  } catch (error) {
    console.error("Error analyzing food photo:", error);
    throw new Error("Failed to analyze food photo: " + (error as Error).message);
  }
}

export async function generateCocktailRecipe(ingredients: string[], preferences: string[]): Promise<GeneratedRecipe> {
  const prompt = `Generate a cocktail recipe using these ingredients: ${ingredients.join(", ")}
Preferences: ${preferences.join(", ")}

Create an innovative and balanced cocktail recipe in JSON format:
{
  "title": "Cocktail Name",
  "description": "Brief description of taste and style",
  "ingredients": ["ingredient with measurements", "ingredient 2", ...],
  "instructions": "Step-by-step mixing instructions",
  "cookingTime": preparation_time_in_minutes,
  "servings": 1,
  "calories": estimated_calories,
  "protein": 0,
  "carbs": carbs_from_mixers_sugars,
  "fat": 0
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are a professional mixologist and bartender. Create innovative, balanced cocktail recipes with proper proportions and techniques."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    
    return {
      title: result.title || "Custom Cocktail",
      description: result.description || "A delicious cocktail",
      ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
      instructions: result.instructions || "Mix and serve",
      cookingTime: parseInt(result.cookingTime) || 5,
      servings: parseInt(result.servings) || 1,
      calories: parseInt(result.calories) || 0,
      protein: 0,
      carbs: parseFloat(result.carbs) || 0,
      fat: 0,
    };
  } catch (error) {
    console.error("Error generating cocktail recipe:", error);
    throw new Error("Failed to generate cocktail recipe: " + (error as Error).message);
  }
}
