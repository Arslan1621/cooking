import {
  users,
  recipes,
  pantryItems,
  mealPlans,
  calorieEntries,
  savedRecipes,
  shoppingLists,
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type PantryItem,
  type InsertPantryItem,
  type MealPlan,
  type InsertMealPlan,
  type CalorieEntry,
  type InsertCalorieEntry,
  type SavedRecipe,
  type InsertSavedRecipe,
  type ShoppingList,
  type InsertShoppingList,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Recipe operations
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  getUserRecipes(userId: string): Promise<Recipe[]>;
  searchRecipes(userId: string, query: string): Promise<Recipe[]>;
  
  // Pantry operations
  addPantryItem(item: InsertPantryItem): Promise<PantryItem>;
  getUserPantryItems(userId: string): Promise<PantryItem[]>;
  updatePantryItem(id: string, updates: Partial<InsertPantryItem>): Promise<PantryItem | undefined>;
  deletePantryItem(id: string): Promise<void>;
  
  // Meal plan operations
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  getUserMealPlans(userId: string): Promise<MealPlan[]>;
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  
  // Calorie tracking operations
  addCalorieEntry(entry: InsertCalorieEntry): Promise<CalorieEntry>;
  getUserCalorieEntries(userId: string, startDate: Date, endDate: Date): Promise<CalorieEntry[]>;
  
  // Saved recipes operations
  saveRecipe(savedRecipe: InsertSavedRecipe): Promise<SavedRecipe>;
  getUserSavedRecipes(userId: string): Promise<Recipe[]>;
  unsaveRecipe(userId: string, recipeId: string): Promise<void>;
  
  // Shopping list operations
  createShoppingList(shoppingList: InsertShoppingList): Promise<ShoppingList>;
  getUserShoppingLists(userId: string): Promise<ShoppingList[]>;
  updateShoppingList(id: string, updates: Partial<InsertShoppingList>): Promise<ShoppingList | undefined>;
  deleteShoppingList(id: string): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Recipe operations
  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const [newRecipe] = await db.insert(recipes).values(recipe).returning();
    return newRecipe;
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    const [recipe] = await db.select().from(recipes).where(eq(recipes.id, id));
    return recipe;
  }

  async getUserRecipes(userId: string): Promise<Recipe[]> {
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.createdAt));
  }

  async searchRecipes(userId: string, query: string): Promise<Recipe[]> {
    // Simple search implementation - in production, you might want full-text search
    return await db
      .select()
      .from(recipes)
      .where(eq(recipes.userId, userId))
      .orderBy(desc(recipes.createdAt));
  }

  // Pantry operations
  async addPantryItem(item: InsertPantryItem): Promise<PantryItem> {
    const [newItem] = await db.insert(pantryItems).values(item).returning();
    return newItem;
  }

  async getUserPantryItems(userId: string): Promise<PantryItem[]> {
    return await db
      .select()
      .from(pantryItems)
      .where(eq(pantryItems.userId, userId))
      .orderBy(desc(pantryItems.addedAt));
  }

  async updatePantryItem(id: string, updates: Partial<InsertPantryItem>): Promise<PantryItem | undefined> {
    const [updated] = await db
      .update(pantryItems)
      .set(updates)
      .where(eq(pantryItems.id, id))
      .returning();
    return updated;
  }

  async deletePantryItem(id: string): Promise<void> {
    await db.delete(pantryItems).where(eq(pantryItems.id, id));
  }

  // Meal plan operations
  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const [newPlan] = await db.insert(mealPlans).values(mealPlan).returning();
    return newPlan;
  }

  async getUserMealPlans(userId: string): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, userId))
      .orderBy(desc(mealPlans.createdAt));
  }

  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    const [plan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
    return plan;
  }

  // Calorie tracking operations
  async addCalorieEntry(entry: InsertCalorieEntry): Promise<CalorieEntry> {
    const [newEntry] = await db.insert(calorieEntries).values(entry).returning();
    return newEntry;
  }

  async getUserCalorieEntries(userId: string, startDate: Date, endDate: Date): Promise<CalorieEntry[]> {
    return await db
      .select()
      .from(calorieEntries)
      .where(
        and(
          eq(calorieEntries.userId, userId),
          gte(calorieEntries.date, startDate),
          lte(calorieEntries.date, endDate)
        )
      )
      .orderBy(desc(calorieEntries.date));
  }

  // Saved recipes operations
  async saveRecipe(savedRecipe: InsertSavedRecipe): Promise<SavedRecipe> {
    const [saved] = await db.insert(savedRecipes).values(savedRecipe).returning();
    return saved;
  }

  async getUserSavedRecipes(userId: string): Promise<Recipe[]> {
    const results = await db
      .select({ recipe: recipes })
      .from(savedRecipes)
      .innerJoin(recipes, eq(savedRecipes.recipeId, recipes.id))
      .where(eq(savedRecipes.userId, userId))
      .orderBy(desc(savedRecipes.savedAt));
    
    return results.map(r => r.recipe);
  }

  async unsaveRecipe(userId: string, recipeId: string): Promise<void> {
    await db
      .delete(savedRecipes)
      .where(
        and(
          eq(savedRecipes.userId, userId),
          eq(savedRecipes.recipeId, recipeId)
        )
      );
  }

  // Shopping list operations
  async createShoppingList(shoppingList: InsertShoppingList): Promise<ShoppingList> {
    const [newList] = await db.insert(shoppingLists).values(shoppingList).returning();
    return newList;
  }

  async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    return await db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.userId, userId))
      .orderBy(desc(shoppingLists.createdAt));
  }

  async updateShoppingList(id: string, updates: Partial<InsertShoppingList>): Promise<ShoppingList | undefined> {
    const [updated] = await db
      .update(shoppingLists)
      .set(updates)
      .where(eq(shoppingLists.id, id))
      .returning();
    return updated;
  }

  async deleteShoppingList(id: string): Promise<void> {
    await db.delete(shoppingLists).where(eq(shoppingLists.id, id));
  }
}

export const storage = new DatabaseStorage();
