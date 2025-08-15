
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface RecipeGenerationParams {
  ingredients?: string[];
  mealType?: string;
  cuisine?: string;
  dietaryRestrictions?: string[];
  cookingTime?: number;
  servings?: number;
  difficulty?: string;
  equipment?: string[];
  chefMode: 'pantry' | 'master' | 'macros' | 'mixology' | 'meal-plan';
  goal?: string;
  macroTargets?: {
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
  };
}

interface GeneratedRecipe {
  title: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  prepTime: number;
  cookTime: number;
  servings: number;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags: string[];
  difficulty: string;
  cuisine: string;
  tips?: string[];
}

interface MealPlanParams {
  days: number;
  goal: string;
  dietaryRestrictions: string[];
  activityLevel: string;
  userStats: {
    age: number;
    gender: string;
    weight: number;
    height: number;
  };
  preferences?: {
    cuisines?: string[];
    excludeIngredients?: string[];
  };
}

interface MealPlan {
  totalCalories: number;
  dailyMacros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  meals: Array<{
    day: number;
    mealType: string;
    recipe: GeneratedRecipe;
  }>;
  shoppingList: string[];
  tips: string[];
}

interface CalorieAnalysis {
  foods: Array<{
    name: string;
    quantity: string;
    calories: number;
    macros: {
      protein: number;
      carbs: number;
      fat: number;
      fiber: number;
    };
  }>;
  totalCalories: number;
  totalMacros: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  confidence: number;
}

export async function generateRecipe(params: RecipeGenerationParams): Promise<GeneratedRecipe> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemPrompt = getRecipeSystemPrompt(params.chefMode);
  const userPrompt = buildRecipeUserPrompt(params);
  
  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const jsonResult = JSON.parse(jsonMatch[0]);
    return validateAndFormatRecipe(jsonResult);
  } catch (error) {
    throw new Error(`Failed to generate recipe: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateMealPlan(params: MealPlanParams): Promise<MealPlan> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemPrompt = `You are MealPlanChef, an AI nutritionist and meal planning expert. Create personalized meal plans based on user goals, dietary restrictions, and nutritional needs. Always respond with valid JSON.`;
  
  const userPrompt = `Create a ${params.days}-day meal plan for:
    - Goal: ${params.goal}
    - Dietary restrictions: ${params.dietaryRestrictions.join(', ') || 'None'}
    - Activity level: ${params.activityLevel}
    - User stats: ${params.userStats.gender}, ${params.userStats.age} years, ${params.userStats.weight}kg, ${params.userStats.height}cm
    
    Include breakfast, lunch, and dinner for each day. Provide detailed recipes with ingredients, instructions, prep/cook times, and accurate nutritional information.
    
    Respond with JSON in this format:
    {
      "totalCalories": number,
      "dailyMacros": { "protein": number, "carbs": number, "fat": number, "fiber": number },
      "meals": [
        {
          "day": number,
          "mealType": string,
          "recipe": {
            "title": string,
            "description": string,
            "ingredients": string[],
            "instructions": string[],
            "prepTime": number,
            "cookTime": number,
            "servings": number,
            "calories": number,
            "macros": { "protein": number, "carbs": number, "fat": number, "fiber": number },
            "tags": string[],
            "difficulty": string,
            "cuisine": string
          }
        }
      ],
      "shoppingList": string[],
      "tips": string[]
    }`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const jsonResult = JSON.parse(jsonMatch[0]);
    return jsonResult as MealPlan;
  } catch (error) {
    throw new Error(`Failed to generate meal plan: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function analyzeFood(base64Image: string): Promise<CalorieAnalysis> {
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  
  const systemPrompt = `You are an expert nutritionist and food analyst. Analyze food images to identify ingredients, estimate portions, and calculate nutritional information. Be as accurate as possible with calorie and macro estimations.`;

  const userPrompt = `Analyze this food image and provide detailed nutritional information. Identify all visible foods, estimate portion sizes, and calculate calories and macronutrients.

  Respond with JSON in this format:
  {
    "foods": [
      {
        "name": string,
        "quantity": string,
        "calories": number,
        "macros": { "protein": number, "carbs": number, "fat": number, "fiber": number }
      }
    ],
    "totalCalories": number,
    "totalMacros": { "protein": number, "carbs": number, "fat": number, "fiber": number },
    "confidence": number (0-1)
  }`;

  const fullPrompt = `${systemPrompt}\n\n${userPrompt}`;

  try {
    const result = await model.generateContent([
      fullPrompt,
      {
        inlineData: {
          data: base64Image,
          mimeType: "image/jpeg"
        }
      }
    ]);
    
    const response = await result.response;
    const text = response.text();
    
    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No valid JSON found in response');
    }
    
    const jsonResult = JSON.parse(jsonMatch[0]);
    return jsonResult as CalorieAnalysis;
  } catch (error) {
    throw new Error(`Failed to analyze food image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

function getRecipeSystemPrompt(chefMode: string): string {
  const basePrompt = "You are a professional chef AI assistant. Create detailed, accurate recipes with proper nutritional information. Always respond with valid JSON.";
  
  switch (chefMode) {
    case 'pantry':
      return `${basePrompt} You are PantryChef - focus on using available ingredients efficiently to minimize waste.`;
    case 'master':
      return `${basePrompt} You are MasterChef - create restaurant-quality recipes with detailed techniques.`;
    case 'macros':
      return `${basePrompt} You are MacrosChef - focus on hitting specific macronutrient targets while maintaining flavor.`;
    case 'mixology':
      return `${basePrompt} You are MixologyMaestro - create creative cocktails and beverages with proper mixing techniques.`;
    case 'meal-plan':
      return `${basePrompt} You are MealPlanChef - create balanced, nutritious meals that fit into broader meal planning goals.`;
    default:
      return basePrompt;
  }
}

function buildRecipeUserPrompt(params: RecipeGenerationParams): string {
  let prompt = `Create a recipe with the following requirements:`;
  
  if (params.ingredients?.length) {
    prompt += `\n- Use these ingredients: ${params.ingredients.join(', ')}`;
  }
  
  if (params.mealType) {
    prompt += `\n- Meal type: ${params.mealType}`;
  }
  
  if (params.cuisine) {
    prompt += `\n- Cuisine: ${params.cuisine}`;
  }
  
  if (params.dietaryRestrictions?.length) {
    prompt += `\n- Dietary restrictions: ${params.dietaryRestrictions.join(', ')}`;
  }
  
  if (params.cookingTime) {
    prompt += `\n- Maximum cooking time: ${params.cookingTime} minutes`;
  }
  
  if (params.servings) {
    prompt += `\n- Servings: ${params.servings}`;
  }
  
  if (params.difficulty) {
    prompt += `\n- Difficulty level: ${params.difficulty}`;
  }
  
  if (params.equipment?.length) {
    prompt += `\n- Available equipment: ${params.equipment.join(', ')}`;
  }
  
  if (params.macroTargets) {
    prompt += `\n- Target nutrition per serving:`;
    if (params.macroTargets.calories) prompt += ` ${params.macroTargets.calories} calories`;
    if (params.macroTargets.protein) prompt += ` ${params.macroTargets.protein}g protein`;
    if (params.macroTargets.carbs) prompt += ` ${params.macroTargets.carbs}g carbs`;
    if (params.macroTargets.fat) prompt += ` ${params.macroTargets.fat}g fat`;
  }
  
  prompt += `\n\nRespond with JSON in this exact format:
  {
    "title": string,
    "description": string,
    "ingredients": string[],
    "instructions": string[],
    "prepTime": number,
    "cookTime": number,
    "servings": number,
    "calories": number,
    "macros": { "protein": number, "carbs": number, "fat": number, "fiber": number },
    "tags": string[],
    "difficulty": string,
    "cuisine": string,
    "tips": string[]
  }`;
  
  return prompt;
}

function validateAndFormatRecipe(result: any): GeneratedRecipe {
  // Ensure all required fields are present with defaults
  return {
    title: result.title || "Untitled Recipe",
    description: result.description || "",
    ingredients: Array.isArray(result.ingredients) ? result.ingredients : [],
    instructions: Array.isArray(result.instructions) ? result.instructions : [],
    prepTime: Number(result.prepTime) || 0,
    cookTime: Number(result.cookTime) || 0,
    servings: Number(result.servings) || 1,
    calories: Number(result.calories) || 0,
    macros: {
      protein: Number(result.macros?.protein) || 0,
      carbs: Number(result.macros?.carbs) || 0,
      fat: Number(result.macros?.fat) || 0,
      fiber: Number(result.macros?.fiber) || 0,
    },
    tags: Array.isArray(result.tags) ? result.tags : [],
    difficulty: result.difficulty || "medium",
    cuisine: result.cuisine || "international",
    tips: Array.isArray(result.tips) ? result.tips : [],
  };
}
