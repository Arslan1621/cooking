import {
  users,
  recipes,
  savedRecipes,
  calorieEntries,
  mealPlans,
  pantryItems,
  shoppingLists,
  type User,
  type UpsertUser,
  type Recipe,
  type InsertRecipe,
  type SavedRecipe,
  type InsertSavedRecipe,
  type CalorieEntry,
  type InsertCalorieEntry,
  type MealPlan,
  type InsertMealPlan,
  type PantryItem,
  type InsertPantryItem,
  type ShoppingList,
  type InsertShoppingList,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserProfile(id: string, data: Partial<UpsertUser>): Promise<User>;

  // Recipe operations
  createRecipe(recipe: InsertRecipe): Promise<Recipe>;
  getRecipe(id: string): Promise<Recipe | undefined>;
  getUserRecipes(userId: string): Promise<Recipe[]>;
  updateRecipe(id: string, data: Partial<InsertRecipe>): Promise<Recipe>;
  deleteRecipe(id: string): Promise<void>;
  searchRecipes(query: string, userId?: string): Promise<Recipe[]>;

  // Saved recipes operations
  saveRecipe(data: InsertSavedRecipe): Promise<SavedRecipe>;
  getUserSavedRecipes(userId: string): Promise<(SavedRecipe & { recipe: Recipe })[]>;
  unsaveRecipe(userId: string, recipeId: string): Promise<void>;

  // Calorie tracking operations
  createCalorieEntry(entry: InsertCalorieEntry): Promise<CalorieEntry>;
  getUserCalorieEntries(userId: string, startDate?: Date, endDate?: Date): Promise<CalorieEntry[]>;
  updateCalorieEntry(id: string, data: Partial<InsertCalorieEntry>): Promise<CalorieEntry>;
  deleteCalorieEntry(id: string): Promise<void>;

  // Meal plan operations
  createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan>;
  getUserMealPlans(userId: string): Promise<MealPlan[]>;
  getMealPlan(id: string): Promise<MealPlan | undefined>;
  updateMealPlan(id: string, data: Partial<InsertMealPlan>): Promise<MealPlan>;
  deleteMealPlan(id: string): Promise<void>;

  // Pantry operations
  createPantryItem(item: InsertPantryItem): Promise<PantryItem>;
  getUserPantryItems(userId: string): Promise<PantryItem[]>;
  updatePantryItem(id: string, data: Partial<InsertPantryItem>): Promise<PantryItem>;
  deletePantryItem(id: string): Promise<void>;

  // Shopping list operations
  createShoppingList(list: InsertShoppingList): Promise<ShoppingList>;
  getUserShoppingLists(userId: string): Promise<ShoppingList[]>;
  updateShoppingList(id: string, data: Partial<InsertShoppingList>): Promise<ShoppingList>;
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

  async updateUserProfile(id: string, data: Partial<UpsertUser>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(users.id, id))
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

  async updateRecipe(id: string, data: Partial<InsertRecipe>): Promise<Recipe> {
    const [recipe] = await db
      .update(recipes)
      .set(data)
      .where(eq(recipes.id, id))
      .returning();
    return recipe;
  }

  async deleteRecipe(id: string): Promise<void> {
    await db.delete(recipes).where(eq(recipes.id, id));
  }

  async searchRecipes(query: string, userId?: string): Promise<Recipe[]> {
    const conditions = [];
    if (userId) {
      conditions.push(eq(recipes.userId, userId));
    }
    
    return await db
      .select()
      .from(recipes)
      .where(and(...conditions))
      .orderBy(desc(recipes.createdAt));
  }

  // Saved recipes operations
  async saveRecipe(data: InsertSavedRecipe): Promise<SavedRecipe> {
    const [savedRecipe] = await db.insert(savedRecipes).values(data).returning();
    return savedRecipe;
  }

  async getUserSavedRecipes(userId: string): Promise<(SavedRecipe & { recipe: Recipe })[]> {
    return await db
      .select({
        id: savedRecipes.id,
        userId: savedRecipes.userId,
        recipeId: savedRecipes.recipeId,
        collectionName: savedRecipes.collectionName,
        savedAt: savedRecipes.savedAt,
        recipe: recipes,
      })
      .from(savedRecipes)
      .innerJoin(recipes, eq(savedRecipes.recipeId, recipes.id))
      .where(eq(savedRecipes.userId, userId))
      .orderBy(desc(savedRecipes.savedAt));
  }

  async unsaveRecipe(userId: string, recipeId: string): Promise<void> {
    await db
      .delete(savedRecipes)
      .where(and(eq(savedRecipes.userId, userId), eq(savedRecipes.recipeId, recipeId)));
  }

  // Calorie tracking operations
  async createCalorieEntry(entry: InsertCalorieEntry): Promise<CalorieEntry> {
    const [calorieEntry] = await db.insert(calorieEntries).values(entry).returning();
    return calorieEntry;
  }

  async getUserCalorieEntries(
    userId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<CalorieEntry[]> {
    const conditions = [eq(calorieEntries.userId, userId)];
    
    if (startDate) {
      conditions.push(gte(calorieEntries.date, startDate));
    }
    if (endDate) {
      conditions.push(lte(calorieEntries.date, endDate));
    }

    return await db
      .select()
      .from(calorieEntries)
      .where(and(...conditions))
      .orderBy(desc(calorieEntries.date));
  }

  async updateCalorieEntry(id: string, data: Partial<InsertCalorieEntry>): Promise<CalorieEntry> {
    const [entry] = await db
      .update(calorieEntries)
      .set(data)
      .where(eq(calorieEntries.id, id))
      .returning();
    return entry;
  }

  async deleteCalorieEntry(id: string): Promise<void> {
    await db.delete(calorieEntries).where(eq(calorieEntries.id, id));
  }

  // Meal plan operations
  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const [newMealPlan] = await db.insert(mealPlans).values(mealPlan).returning();
    return newMealPlan;
  }

  async getUserMealPlans(userId: string): Promise<MealPlan[]> {
    return await db
      .select()
      .from(mealPlans)
      .where(eq(mealPlans.userId, userId))
      .orderBy(desc(mealPlans.createdAt));
  }

  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    const [mealPlan] = await db.select().from(mealPlans).where(eq(mealPlans.id, id));
    return mealPlan;
  }

  async updateMealPlan(id: string, data: Partial<InsertMealPlan>): Promise<MealPlan> {
    const [mealPlan] = await db
      .update(mealPlans)
      .set(data)
      .where(eq(mealPlans.id, id))
      .returning();
    return mealPlan;
  }

  async deleteMealPlan(id: string): Promise<void> {
    await db.delete(mealPlans).where(eq(mealPlans.id, id));
  }

  // Pantry operations
  async createPantryItem(item: InsertPantryItem): Promise<PantryItem> {
    const [pantryItem] = await db.insert(pantryItems).values(item).returning();
    return pantryItem;
  }

  async getUserPantryItems(userId: string): Promise<PantryItem[]> {
    return await db
      .select()
      .from(pantryItems)
      .where(eq(pantryItems.userId, userId))
      .orderBy(asc(pantryItems.name));
  }

  async updatePantryItem(id: string, data: Partial<InsertPantryItem>): Promise<PantryItem> {
    const [item] = await db
      .update(pantryItems)
      .set(data)
      .where(eq(pantryItems.id, id))
      .returning();
    return item;
  }

  async deletePantryItem(id: string): Promise<void> {
    await db.delete(pantryItems).where(eq(pantryItems.id, id));
  }

  // Shopping list operations
  async createShoppingList(list: InsertShoppingList): Promise<ShoppingList> {
    const [shoppingList] = await db.insert(shoppingLists).values(list).returning();
    return shoppingList;
  }

  async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    return await db
      .select()
      .from(shoppingLists)
      .where(eq(shoppingLists.userId, userId))
      .orderBy(desc(shoppingLists.createdAt));
  }

  async updateShoppingList(id: string, data: Partial<InsertShoppingList>): Promise<ShoppingList> {
    const [list] = await db
      .update(shoppingLists)
      .set(data)
      .where(eq(shoppingLists.id, id))
      .returning();
    return list;
  }

  async deleteShoppingList(id: string): Promise<void> {
    await db.delete(shoppingLists).where(eq(shoppingLists.id, id));
  }
}

// In-memory storage implementation for development
class MemoryStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private recipes: Map<string, Recipe> = new Map();
  private savedRecipes: Map<string, SavedRecipe> = new Map();
  private calorieEntries: Map<string, CalorieEntry> = new Map();
  private mealPlans: Map<string, MealPlan> = new Map();
  private pantryItems: Map<string, PantryItem> = new Map();
  private shoppingLists: Map<string, ShoppingList> = new Map();

  private generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const id = userData.id || this.generateId();
    const user: User = {
      id,
      email: userData.email || null,
      firstName: userData.firstName || null,
      lastName: userData.lastName || null,
      profileImageUrl: userData.profileImageUrl || null,
      gender: userData.gender || null,
      age: userData.age || null,
      height: userData.height || null,
      weight: userData.weight || null,
      activityLevel: userData.activityLevel || null,
      goal: userData.goal || null,
      dietaryRestrictions: userData.dietaryRestrictions || null,
      subscriptionTier: userData.subscriptionTier || "basic",
      subscriptionExpiresAt: userData.subscriptionExpiresAt || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserProfile(id: string, data: Partial<UpsertUser>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updated = { ...user, ...data, updatedAt: new Date() };
    this.users.set(id, updated);
    return updated;
  }

  async createRecipe(recipe: InsertRecipe): Promise<Recipe> {
    const id = this.generateId();
    const newRecipe: Recipe = { ...recipe, id, createdAt: new Date() } as Recipe;
    this.recipes.set(id, newRecipe);
    return newRecipe;
  }

  async getRecipe(id: string): Promise<Recipe | undefined> {
    return this.recipes.get(id);
  }

  async getUserRecipes(userId: string): Promise<Recipe[]> {
    return Array.from(this.recipes.values())
      .filter(r => r.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateRecipe(id: string, data: Partial<InsertRecipe>): Promise<Recipe> {
    const recipe = this.recipes.get(id);
    if (!recipe) throw new Error("Recipe not found");
    const updated = { ...recipe, ...data };
    this.recipes.set(id, updated);
    return updated;
  }

  async deleteRecipe(id: string): Promise<void> {
    this.recipes.delete(id);
  }

  async searchRecipes(query: string, userId?: string): Promise<Recipe[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.recipes.values())
      .filter(r => 
        (!userId || r.userId === userId) &&
        (r.title.toLowerCase().includes(lowerQuery) || 
         r.description?.toLowerCase().includes(lowerQuery))
      );
  }

  async saveRecipe(data: InsertSavedRecipe): Promise<SavedRecipe> {
    const id = this.generateId();
    const saved: SavedRecipe = { ...data, id, savedAt: new Date() } as SavedRecipe;
    this.savedRecipes.set(id, saved);
    return saved;
  }

  async getUserSavedRecipes(userId: string): Promise<(SavedRecipe & { recipe: Recipe })[]> {
    return Array.from(this.savedRecipes.values())
      .filter(sr => sr.userId === userId)
      .map(sr => {
        const recipe = this.recipes.get(sr.recipeId);
        return recipe ? { ...sr, recipe } : null;
      })
      .filter((item): item is SavedRecipe & { recipe: Recipe } => item !== null);
  }

  async unsaveRecipe(userId: string, recipeId: string): Promise<void> {
    for (const [id, saved] of this.savedRecipes.entries()) {
      if (saved.userId === userId && saved.recipeId === recipeId) {
        this.savedRecipes.delete(id);
        break;
      }
    }
  }

  async createCalorieEntry(entry: InsertCalorieEntry): Promise<CalorieEntry> {
    const id = this.generateId();
    const newEntry: CalorieEntry = { ...entry, id, createdAt: new Date() } as CalorieEntry;
    this.calorieEntries.set(id, newEntry);
    return newEntry;
  }

  async getUserCalorieEntries(userId: string, startDate?: Date, endDate?: Date): Promise<CalorieEntry[]> {
    return Array.from(this.calorieEntries.values())
      .filter(e => {
        if (e.userId !== userId) return false;
        if (startDate && e.date < startDate) return false;
        if (endDate && e.date > endDate) return false;
        return true;
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  async updateCalorieEntry(id: string, data: Partial<InsertCalorieEntry>): Promise<CalorieEntry> {
    const entry = this.calorieEntries.get(id);
    if (!entry) throw new Error("Calorie entry not found");
    const updated = { ...entry, ...data };
    this.calorieEntries.set(id, updated);
    return updated;
  }

  async deleteCalorieEntry(id: string): Promise<void> {
    this.calorieEntries.delete(id);
  }

  async createMealPlan(mealPlan: InsertMealPlan): Promise<MealPlan> {
    const id = this.generateId();
    const newPlan: MealPlan = { ...mealPlan, id, createdAt: new Date() } as MealPlan;
    this.mealPlans.set(id, newPlan);
    return newPlan;
  }

  async getUserMealPlans(userId: string): Promise<MealPlan[]> {
    return Array.from(this.mealPlans.values())
      .filter(mp => mp.userId === userId)
      .sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
  }

  async getMealPlan(id: string): Promise<MealPlan | undefined> {
    return this.mealPlans.get(id);
  }

  async updateMealPlan(id: string, data: Partial<InsertMealPlan>): Promise<MealPlan> {
    const plan = this.mealPlans.get(id);
    if (!plan) throw new Error("Meal plan not found");
    const updated = { ...plan, ...data };
    this.mealPlans.set(id, updated);
    return updated;
  }

  async deleteMealPlan(id: string): Promise<void> {
    this.mealPlans.delete(id);
  }

  async createPantryItem(item: InsertPantryItem): Promise<PantryItem> {
    const id = this.generateId();
    const newItem: PantryItem = { ...item, id, addedAt: new Date() } as PantryItem;
    this.pantryItems.set(id, newItem);
    return newItem;
  }

  async getUserPantryItems(userId: string): Promise<PantryItem[]> {
    return Array.from(this.pantryItems.values())
      .filter(item => item.userId === userId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async updatePantryItem(id: string, data: Partial<InsertPantryItem>): Promise<PantryItem> {
    const item = this.pantryItems.get(id);
    if (!item) throw new Error("Pantry item not found");
    const updated = { ...item, ...data };
    this.pantryItems.set(id, updated);
    return updated;
  }

  async deletePantryItem(id: string): Promise<void> {
    this.pantryItems.delete(id);
  }

  async createShoppingList(list: InsertShoppingList): Promise<ShoppingList> {
    const id = this.generateId();
    const newList: ShoppingList = { ...list, id, createdAt: new Date() } as ShoppingList;
    this.shoppingLists.set(id, newList);
    return newList;
  }

  async getUserShoppingLists(userId: string): Promise<ShoppingList[]> {
    return Array.from(this.shoppingLists.values())
      .filter(list => list.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async updateShoppingList(id: string, data: Partial<InsertShoppingList>): Promise<ShoppingList> {
    const list = this.shoppingLists.get(id);
    if (!list) throw new Error("Shopping list not found");
    const updated = { ...list, ...data };
    this.shoppingLists.set(id, updated);
    return updated;
  }

  async deleteShoppingList(id: string): Promise<void> {
    this.shoppingLists.delete(id);
  }
}

// Use in-memory storage temporarily due to database auth issues
// Will switch to DatabaseStorage once Clerk is integrated
export const storage = new MemoryStorage();
