import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  integer,
  decimal,
  boolean,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (mandatory for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (mandatory for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  
  // User profile data
  gender: varchar("gender", { length: 10 }),
  age: integer("age"),
  height: integer("height"), // in cm
  weight: decimal("weight"), // in kg
  activityLevel: varchar("activity_level", { length: 20 }),
  goal: varchar("goal", { length: 20 }),
  dietaryRestrictions: text("dietary_restrictions").array(),
  
  // Subscription
  subscriptionTier: varchar("subscription_tier", { length: 10 }).default("basic"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recipes table
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").array().notNull(),
  prepTime: integer("prep_time"), // in minutes
  cookTime: integer("cook_time"), // in minutes
  servings: integer("servings"),
  calories: integer("calories"),
  macros: jsonb("macros"), // { protein, carbs, fat, fiber }
  tags: text("tags").array(),
  chefMode: varchar("chef_mode", { length: 20 }).notNull(), // pantry, meal-plan, master, macros, mixology
  difficulty: varchar("difficulty", { length: 10 }),
  cuisine: varchar("cuisine", { length: 50 }),
  mealType: varchar("meal_type", { length: 20 }),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pantry items
export const pantryItems = pgTable("pantry_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  quantity: decimal("quantity"),
  unit: varchar("unit", { length: 20 }),
  category: varchar("category", { length: 30 }),
  expiryDate: timestamp("expiry_date"),
  addedAt: timestamp("added_at").defaultNow(),
});

// Meal plans
export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: varchar("goal", { length: 20 }),
  dietaryRestrictions: text("dietary_restrictions").array(),
  meals: jsonb("meals"), // Array of { day, meal_type, recipe_id }
  shoppingList: text("shopping_list").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Calorie tracking entries
export const calorieEntries = pgTable("calorie_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  date: timestamp("date").notNull(),
  mealType: varchar("meal_type", { length: 20 }).notNull(),
  foodName: text("food_name").notNull(),
  calories: integer("calories").notNull(),
  macros: jsonb("macros"), // { protein, carbs, fat, fiber }
  quantity: decimal("quantity"),
  unit: varchar("unit", { length: 20 }),
  imageUrl: text("image_url"), // For AI-analyzed photos
  source: varchar("source", { length: 20 }).default("manual"), // manual, ai-photo, recipe
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved recipes (cookbook)
export const savedRecipes = pgTable("saved_recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  recipeId: varchar("recipe_id").references(() => recipes.id).notNull(),
  collectionName: varchar("collection_name", { length: 100 }).default("favorites"),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Shopping lists
export const shoppingLists = pgTable("shopping_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  name: text("name").notNull(),
  items: text("items").array().notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertPantryItemSchema = createInsertSchema(pantryItems).omit({
  id: true,
  addedAt: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertCalorieEntrySchema = createInsertSchema(calorieEntries).omit({
  id: true,
  createdAt: true,
});

export const insertSavedRecipeSchema = createInsertSchema(savedRecipes).omit({
  id: true,
  savedAt: true,
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertRecipe = z.infer<typeof insertRecipeSchema>;
export type Recipe = typeof recipes.$inferSelect;
export type InsertPantryItem = z.infer<typeof insertPantryItemSchema>;
export type PantryItem = typeof pantryItems.$inferSelect;
export type InsertMealPlan = z.infer<typeof insertMealPlanSchema>;
export type MealPlan = typeof mealPlans.$inferSelect;
export type InsertCalorieEntry = z.infer<typeof insertCalorieEntrySchema>;
export type CalorieEntry = typeof calorieEntries.$inferSelect;
export type InsertSavedRecipe = z.infer<typeof insertSavedRecipeSchema>;
export type SavedRecipe = typeof savedRecipes.$inferSelect;
export type InsertShoppingList = z.infer<typeof insertShoppingListSchema>;
export type ShoppingList = typeof shoppingLists.$inferSelect;
