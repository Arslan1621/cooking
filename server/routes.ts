import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupClerkAuth, isAuthenticated, getUserId } from "./clerkAuth";
import { generateRecipe, generateMealPlan, analyzeFood, type RecipeGenerationParams, type MealPlanParams } from "./services/ai";
import { insertRecipeSchema, insertCalorieEntrySchema, insertMealPlanSchema, insertPantryItemSchema, insertShoppingListSchema } from "@shared/schema";
import { z } from "zod";
import { clerkClient } from '@clerk/express';

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  setupClerkAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      
      // Get user from storage, create if doesn't exist
      let user = await storage.getUser(userId);
      
      if (!user) {
        if (!process.env.CLERK_PUBLISHABLE_KEY || !process.env.CLERK_SECRET_KEY) {
          // Development mode - create a default user
          user = await storage.upsertUser({
            id: userId,
            email: 'dev@example.com',
            firstName: 'Dev',
            lastName: 'User',
            profileImageUrl: null,
          });
        } else {
          // Fetch user details from Clerk
          const clerkUser = await clerkClient.users.getUser(userId);
          
          // Create user in our storage
          user = await storage.upsertUser({
            id: userId,
            email: clerkUser.emailAddresses[0]?.emailAddress || null,
            firstName: clerkUser.firstName || null,
            lastName: clerkUser.lastName || null,
            profileImageUrl: clerkUser.imageUrl || null,
          });
        }
      }
      
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // User profile routes
  app.patch('/api/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.updateUserProfile(userId, req.body);
      res.json(user);
    } catch (error) {
      console.error("Error updating profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Recipe routes
  app.post('/api/recipes/generate', isAuthenticated, async (req: any, res) => {
    try {
      const params: RecipeGenerationParams = req.body;
      const generatedRecipe = await generateRecipe(params);
      
      // Save recipe to database
      const userId = getUserId(req);
      const recipe = await storage.createRecipe({
        userId,
        title: generatedRecipe.title,
        description: generatedRecipe.description,
        ingredients: generatedRecipe.ingredients,
        instructions: generatedRecipe.instructions,
        prepTime: generatedRecipe.prepTime,
        cookTime: generatedRecipe.cookTime,
        servings: generatedRecipe.servings,
        calories: generatedRecipe.calories,
        macros: generatedRecipe.macros,
        tags: generatedRecipe.tags,
        chefMode: params.chefMode,
        difficulty: generatedRecipe.difficulty,
        cuisine: generatedRecipe.cuisine,
        mealType: params.mealType || null,
      });
      
      res.json(recipe);
    } catch (error) {
      console.error("Error generating recipe:", error);
      res.status(500).json({ message: "Failed to generate recipe" });
    }
  });

  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const recipes = await storage.getUserRecipes(userId);
      res.json(recipes);
    } catch (error) {
      console.error("Error fetching recipes:", error);
      res.status(500).json({ message: "Failed to fetch recipes" });
    }
  });

  app.get('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      const recipe = await storage.getRecipe(req.params.id);
      if (!recipe) {
        return res.status(404).json({ message: "Recipe not found" });
      }
      res.json(recipe);
    } catch (error) {
      console.error("Error fetching recipe:", error);
      res.status(500).json({ message: "Failed to fetch recipe" });
    }
  });

  app.delete('/api/recipes/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteRecipe(req.params.id);
      res.json({ message: "Recipe deleted successfully" });
    } catch (error) {
      console.error("Error deleting recipe:", error);
      res.status(500).json({ message: "Failed to delete recipe" });
    }
  });

  // Saved recipes routes
  app.post('/api/recipes/:id/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const recipeId = req.params.id;
      const { collectionName } = req.body;
      
      const savedRecipe = await storage.saveRecipe({
        userId,
        recipeId,
        collectionName: collectionName || "favorites",
      });
      
      res.json(savedRecipe);
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Failed to save recipe" });
    }
  });

  app.get('/api/saved-recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const savedRecipes = await storage.getUserSavedRecipes(userId);
      res.json(savedRecipes);
    } catch (error) {
      console.error("Error fetching saved recipes:", error);
      res.status(500).json({ message: "Failed to fetch saved recipes" });
    }
  });

  app.delete('/api/recipes/:id/save', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const recipeId = req.params.id;
      await storage.unsaveRecipe(userId, recipeId);
      res.json({ message: "Recipe unsaved successfully" });
    } catch (error) {
      console.error("Error unsaving recipe:", error);
      res.status(500).json({ message: "Failed to unsave recipe" });
    }
  });

  // Meal plan routes
  app.post('/api/meal-plans/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(400).json({ message: "User profile not found. Please complete your profile first." });
      }

      const params: MealPlanParams = {
        ...req.body,
        userStats: {
          age: user.age || 30,
          gender: user.gender || 'male',
          weight: parseFloat(user.weight?.toString() || '70'),
          height: user.height || 175,
        },
      };
      
      const generatedMealPlan = await generateMealPlan(params);
      
      // Save meal plan to database
      const mealPlan = await storage.createMealPlan({
        userId,
        name: `${params.days}-Day ${params.goal} Plan`,
        startDate: new Date(),
        endDate: new Date(Date.now() + params.days * 24 * 60 * 60 * 1000),
        goal: params.goal,
        dietaryRestrictions: params.dietaryRestrictions,
        meals: generatedMealPlan,
        shoppingList: generatedMealPlan.shoppingList,
      });
      
      res.json(mealPlan);
    } catch (error) {
      console.error("Error generating meal plan:", error);
      res.status(500).json({ message: "Failed to generate meal plan" });
    }
  });

  app.get('/api/meal-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const mealPlans = await storage.getUserMealPlans(userId);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  app.get('/api/meal-plans/:id', isAuthenticated, async (req, res) => {
    try {
      const mealPlan = await storage.getMealPlan(req.params.id);
      if (!mealPlan) {
        return res.status(404).json({ message: "Meal plan not found" });
      }
      res.json(mealPlan);
    } catch (error) {
      console.error("Error fetching meal plan:", error);
      res.status(500).json({ message: "Failed to fetch meal plan" });
    }
  });

  // Calorie tracking routes
  app.post('/api/calories/analyze-photo', isAuthenticated, async (req: any, res) => {
    try {
      const { image } = req.body;
      const analysis = await analyzeFood(image);
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing food photo:", error);
      res.status(500).json({ message: "Failed to analyze food photo" });
    }
  });

  app.post('/api/calories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const entryData = insertCalorieEntrySchema.parse({
        ...req.body,
        userId,
      });
      
      const entry = await storage.createCalorieEntry(entryData);
      res.json(entry);
    } catch (error) {
      console.error("Error creating calorie entry:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create calorie entry" });
    }
  });

  app.get('/api/calories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const { startDate, endDate } = req.query;
      
      const entries = await storage.getUserCalorieEntries(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );
      
      res.json(entries);
    } catch (error) {
      console.error("Error fetching calorie entries:", error);
      res.status(500).json({ message: "Failed to fetch calorie entries" });
    }
  });

  app.delete('/api/calories/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteCalorieEntry(req.params.id);
      res.json({ message: "Calorie entry deleted successfully" });
    } catch (error) {
      console.error("Error deleting calorie entry:", error);
      res.status(500).json({ message: "Failed to delete calorie entry" });
    }
  });

  // Pantry routes
  app.post('/api/pantry', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const itemData = insertPantryItemSchema.parse({
        ...req.body,
        userId,
      });
      
      const item = await storage.createPantryItem(itemData);
      res.json(item);
    } catch (error) {
      console.error("Error creating pantry item:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create pantry item" });
    }
  });

  app.get('/api/pantry', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const items = await storage.getUserPantryItems(userId);
      res.json(items);
    } catch (error) {
      console.error("Error fetching pantry items:", error);
      res.status(500).json({ message: "Failed to fetch pantry items" });
    }
  });

  app.patch('/api/pantry/:id', isAuthenticated, async (req, res) => {
    try {
      const item = await storage.updatePantryItem(req.params.id, req.body);
      res.json(item);
    } catch (error) {
      console.error("Error updating pantry item:", error);
      res.status(500).json({ message: "Failed to update pantry item" });
    }
  });

  app.delete('/api/pantry/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deletePantryItem(req.params.id);
      res.json({ message: "Pantry item deleted successfully" });
    } catch (error) {
      console.error("Error deleting pantry item:", error);
      res.status(500).json({ message: "Failed to delete pantry item" });
    }
  });

  // Shopping list routes
  app.post('/api/shopping-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const listData = insertShoppingListSchema.parse({
        ...req.body,
        userId,
      });
      
      const list = await storage.createShoppingList(listData);
      res.json(list);
    } catch (error) {
      console.error("Error creating shopping list:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create shopping list" });
    }
  });

  app.get('/api/shopping-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = getUserId(req);
      const lists = await storage.getUserShoppingLists(userId);
      res.json(lists);
    } catch (error) {
      console.error("Error fetching shopping lists:", error);
      res.status(500).json({ message: "Failed to fetch shopping lists" });
    }
  });

  app.patch('/api/shopping-lists/:id', isAuthenticated, async (req, res) => {
    try {
      const list = await storage.updateShoppingList(req.params.id, req.body);
      res.json(list);
    } catch (error) {
      console.error("Error updating shopping list:", error);
      res.status(500).json({ message: "Failed to update shopping list" });
    }
  });

  app.delete('/api/shopping-lists/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deleteShoppingList(req.params.id);
      res.json({ message: "Shopping list deleted successfully" });
    } catch (error) {
      console.error("Error deleting shopping list:", error);
      res.status(500).json({ message: "Failed to delete shopping list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
