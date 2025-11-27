export interface Recipe {
  id: string;
  userId: string;
  title: string;
  description?: string;
  ingredients: string[];
  instructions: string[];
  prepTime?: number;
  cookTime?: number;
  servings?: number;
  calories?: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  tags?: string[];
  chefMode: string;
  difficulty?: string;
  cuisine?: string;
  mealType?: string;
  imageUrl?: string;
  createdAt?: string;
}

export interface RecipeGenerationParams {
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
  allInMode?: boolean;
}

export interface CalorieEntry {
  id: string;
  userId: string;
  date: string;
  mealType: string;
  foodName: string;
  calories: number;
  macros?: {
    protein: number;
    carbs: number;
    fat: number;
    fiber: number;
  };
  quantity?: number;
  unit?: string;
  imageUrl?: string;
  source?: string;
  createdAt?: string;
}

export interface MealPlan {
  id: string;
  userId: string;
  name: string;
  startDate: string;
  endDate: string;
  goal?: string;
  dietaryRestrictions?: string[];
  meals: any;
  shoppingList?: string[];
  createdAt?: string;
}

export interface PantryItem {
  id: string;
  userId: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  expiryDate?: string;
  addedAt?: string;
}
