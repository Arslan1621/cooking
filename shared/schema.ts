import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  integer,
  jsonb,
  numeric,
  pgTable,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// Users table for Replit Auth and user profiles
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  gender: varchar("gender", { length: 10 }),
  age: integer("age"),
  height: integer("height"), // in cm
  weight: numeric("weight"), // in kg
  activityLevel: varchar("activity_level", { length: 20 }),
  goal: varchar("goal", { length: 20 }), // lose_weight, gain_muscle, eat_healthy, maintain_weight
  cookingSkillLevel: varchar("cooking_skill_level", { length: 20 }), // beginner, intermediate, advanced, expert
  allergies: text("allergies").array(),
  dietaryRestrictions: text("dietary_restrictions").array(),
  goalAmount: numeric("goal_amount"), // amount to gain or lose in kg
  goalTimeline: varchar("goal_timeline", { length: 50 }), // e.g., "3 months", "6 months"
  muscleGainPerWeek: numeric("muscle_gain_per_week"), // in kg
  dailyCalorieTarget: integer("daily_calorie_target"),
  dailyMacros: jsonb("daily_macros"), // { protein, carbs, fat, fiber }
  subscriptionTier: varchar("subscription_tier", { length: 10 }).default("basic"),
  subscriptionExpiresAt: timestamp("subscription_expires_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Recipes table
export const recipes = pgTable("recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  title: text("title").notNull(),
  description: text("description"),
  ingredients: text("ingredients").array().notNull(),
  instructions: text("instructions").array().notNull(),
  prepTime: integer("prep_time"), // minutes
  cookTime: integer("cook_time"), // minutes
  servings: integer("servings"),
  calories: integer("calories"),
  macros: jsonb("macros"), // { protein, carbs, fat, fiber }
  tags: text("tags").array(),
  chefMode: varchar("chef_mode", { length: 20 }).notNull(), // pantry, master, macros, mixology, meal-plan
  difficulty: varchar("difficulty", { length: 10 }), // novice, intermediate, expert
  cuisine: varchar("cuisine", { length: 50 }),
  mealType: varchar("meal_type", { length: 20 }), // breakfast, lunch, dinner, snack
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Saved recipes (cookbook)
export const savedRecipes = pgTable("saved_recipes", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  recipeId: varchar("recipe_id").notNull().references(() => recipes.id),
  collectionName: varchar("collection_name", { length: 100 }).default("favorites"),
  savedAt: timestamp("saved_at").defaultNow(),
});

// Calorie entries
export const calorieEntries = pgTable("calorie_entries", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  date: timestamp("date").notNull(),
  mealType: varchar("meal_type", { length: 20 }).notNull(), // breakfast, lunch, dinner, snack
  foodName: text("food_name").notNull(),
  calories: integer("calories").notNull(),
  macros: jsonb("macros"), // { protein, carbs, fat, fiber }
  quantity: numeric("quantity"),
  unit: varchar("unit", { length: 20 }),
  imageUrl: text("image_url"),
  source: varchar("source", { length: 20 }).default("manual"), // manual, photo, recipe
  createdAt: timestamp("created_at").defaultNow(),
});

// Meal plans
export const mealPlans = pgTable("meal_plans", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  goal: varchar("goal", { length: 20 }),
  dietaryRestrictions: text("dietary_restrictions").array(),
  meals: jsonb("meals"), // structured meal plan data
  shoppingList: text("shopping_list").array(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Pantry items
export const pantryItems = pgTable("pantry_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  quantity: numeric("quantity"),
  unit: varchar("unit", { length: 20 }),
  category: varchar("category", { length: 30 }),
  expiryDate: timestamp("expiry_date"),
  addedAt: timestamp("added_at").defaultNow(),
});

// Shopping lists
export const shoppingLists = pgTable("shopping_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  items: text("items").array().notNull(),
  completed: boolean("completed").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  recipes: many(recipes),
  savedRecipes: many(savedRecipes),
  calorieEntries: many(calorieEntries),
  mealPlans: many(mealPlans),
  pantryItems: many(pantryItems),
  shoppingLists: many(shoppingLists),
}));

export const recipesRelations = relations(recipes, ({ one, many }) => ({
  user: one(users, {
    fields: [recipes.userId],
    references: [users.id],
  }),
  savedBy: many(savedRecipes),
}));

export const savedRecipesRelations = relations(savedRecipes, ({ one }) => ({
  user: one(users, {
    fields: [savedRecipes.userId],
    references: [users.id],
  }),
  recipe: one(recipes, {
    fields: [savedRecipes.recipeId],
    references: [recipes.id],
  }),
}));

export const calorieEntriesRelations = relations(calorieEntries, ({ one }) => ({
  user: one(users, {
    fields: [calorieEntries.userId],
    references: [users.id],
  }),
}));

export const mealPlansRelations = relations(mealPlans, ({ one }) => ({
  user: one(users, {
    fields: [mealPlans.userId],
    references: [users.id],
  }),
}));

export const pantryItemsRelations = relations(pantryItems, ({ one }) => ({
  user: one(users, {
    fields: [pantryItems.userId],
    references: [users.id],
  }),
}));

export const shoppingListsRelations = relations(shoppingLists, ({ one }) => ({
  user: one(users, {
    fields: [shoppingLists.userId],
    references: [users.id],
  }),
}));

// Schema types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;

export type InsertRecipe = typeof recipes.$inferInsert;
export type Recipe = typeof recipes.$inferSelect;

export type InsertSavedRecipe = typeof savedRecipes.$inferInsert;
export type SavedRecipe = typeof savedRecipes.$inferSelect;

export type InsertCalorieEntry = typeof calorieEntries.$inferInsert;
export type CalorieEntry = typeof calorieEntries.$inferSelect;

export type InsertMealPlan = typeof mealPlans.$inferInsert;
export type MealPlan = typeof mealPlans.$inferSelect;

export type InsertPantryItem = typeof pantryItems.$inferInsert;
export type PantryItem = typeof pantryItems.$inferSelect;

export type InsertShoppingList = typeof shoppingLists.$inferInsert;
export type ShoppingList = typeof shoppingLists.$inferSelect;

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRecipeSchema = createInsertSchema(recipes).omit({
  id: true,
  createdAt: true,
});

export const insertCalorieEntrySchema = createInsertSchema(calorieEntries).omit({
  id: true,
  createdAt: true,
});

export const insertMealPlanSchema = createInsertSchema(mealPlans).omit({
  id: true,
  createdAt: true,
});

export const insertPantryItemSchema = createInsertSchema(pantryItems).omit({
  id: true,
  addedAt: true,
});

export const insertShoppingListSchema = createInsertSchema(shoppingLists).omit({
  id: true,
  createdAt: true,
});
