import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { generateRecipe, generateMealPlan, analyzeFood } from "./services/openai";
import { 
  insertRecipeSchema, 
  insertPantryItemSchema, 
  insertMealPlanSchema, 
  insertCalorieEntrySchema,
  insertShoppingListSchema 
} from "@shared/schema";
import multer from "multer";

// Configure multer for file uploads
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Recipe generation routes
  app.post('/api/recipes/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const params = req.body;
      
      // Generate recipe using OpenAI
      const generatedRecipe = await generateRecipe(params);
      
      // Save recipe to database
      const recipe = await storage.createRecipe({
        ...generatedRecipe,
        userId,
        chefMode: params.chefMode,
        mealType: params.mealType,
      });
      
      res.json(recipe);
    } catch (error) {
      console.error("Recipe generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate recipe" 
      });
    }
  });

  app.get('/api/recipes', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Meal plan routes
  app.post('/api/meal-plans/generate', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const params = {
        ...req.body,
        userStats: {
          age: user.age || 30,
          gender: user.gender || 'male',
          weight: parseFloat(user.weight || '70'),
          height: user.height || 175,
        }
      };
      
      // Generate meal plan using OpenAI
      const generatedPlan = await generateMealPlan(params);
      
      // Save meal plan to database
      const mealPlan = await storage.createMealPlan({
        userId,
        name: `${params.days}-Day ${params.goal} Plan`,
        startDate: new Date(),
        endDate: new Date(Date.now() + params.days * 24 * 60 * 60 * 1000),
        goal: params.goal,
        dietaryRestrictions: params.dietaryRestrictions,
        meals: generatedPlan.meals,
        shoppingList: generatedPlan.shoppingList,
      });
      
      res.json({ ...generatedPlan, id: mealPlan.id });
    } catch (error) {
      console.error("Meal plan generation error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to generate meal plan" 
      });
    }
  });

  app.get('/api/meal-plans', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const mealPlans = await storage.getUserMealPlans(userId);
      res.json(mealPlans);
    } catch (error) {
      console.error("Error fetching meal plans:", error);
      res.status(500).json({ message: "Failed to fetch meal plans" });
    }
  });

  // Pantry management routes
  app.get('/api/pantry', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const pantryItems = await storage.getUserPantryItems(userId);
      res.json(pantryItems);
    } catch (error) {
      console.error("Error fetching pantry items:", error);
      res.status(500).json({ message: "Failed to fetch pantry items" });
    }
  });

  app.post('/api/pantry', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertPantryItemSchema.parse({ ...req.body, userId });
      const pantryItem = await storage.addPantryItem(validatedData);
      res.json(pantryItem);
    } catch (error) {
      console.error("Error adding pantry item:", error);
      res.status(500).json({ message: "Failed to add pantry item" });
    }
  });

  app.put('/api/pantry/:id', isAuthenticated, async (req, res) => {
    try {
      const validatedData = insertPantryItemSchema.partial().parse(req.body);
      const pantryItem = await storage.updatePantryItem(req.params.id, validatedData);
      if (!pantryItem) {
        return res.status(404).json({ message: "Pantry item not found" });
      }
      res.json(pantryItem);
    } catch (error) {
      console.error("Error updating pantry item:", error);
      res.status(500).json({ message: "Failed to update pantry item" });
    }
  });

  app.delete('/api/pantry/:id', isAuthenticated, async (req, res) => {
    try {
      await storage.deletePantryItem(req.params.id);
      res.json({ message: "Pantry item deleted" });
    } catch (error) {
      console.error("Error deleting pantry item:", error);
      res.status(500).json({ message: "Failed to delete pantry item" });
    }
  });

  // Calorie tracking routes
  app.post('/api/calories/analyze-photo', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No image file provided" });
      }
      
      const userId = req.user.claims.sub;
      const base64Image = req.file.buffer.toString('base64');
      
      // Analyze food using OpenAI Vision
      const analysis = await analyzeFood(base64Image);
      
      // Save calorie entries to database
      const entries = [];
      for (const food of analysis.foods) {
        const entry = await storage.addCalorieEntry({
          userId,
          date: new Date(),
          mealType: req.body.mealType || 'snack',
          foodName: food.name,
          calories: food.calories,
          macros: food.macros,
          quantity: parseFloat(food.quantity) || 1,
          unit: food.quantity.replace(/[0-9.-]/g, '').trim() || 'portion',
          source: 'ai-photo',
        });
        entries.push(entry);
      }
      
      res.json({ analysis, entries });
    } catch (error) {
      console.error("Photo analysis error:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to analyze photo" 
      });
    }
  });

  app.post('/api/calories/manual', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertCalorieEntrySchema.parse({ ...req.body, userId });
      const entry = await storage.addCalorieEntry(validatedData);
      res.json(entry);
    } catch (error) {
      console.error("Error adding calorie entry:", error);
      res.status(500).json({ message: "Failed to add calorie entry" });
    }
  });

  app.get('/api/calories', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const startDate = new Date(req.query.startDate as string);
      const endDate = new Date(req.query.endDate as string);
      
      const entries = await storage.getUserCalorieEntries(userId, startDate, endDate);
      res.json(entries);
    } catch (error) {
      console.error("Error fetching calorie entries:", error);
      res.status(500).json({ message: "Failed to fetch calorie entries" });
    }
  });

  // Cookbook routes (saved recipes)
  app.get('/api/cookbook', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const savedRecipes = await storage.getUserSavedRecipes(userId);
      res.json(savedRecipes);
    } catch (error) {
      console.error("Error fetching cookbook:", error);
      res.status(500).json({ message: "Failed to fetch cookbook" });
    }
  });

  app.post('/api/cookbook', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { recipeId, collectionName } = req.body;
      
      const savedRecipe = await storage.saveRecipe({
        userId,
        recipeId,
        collectionName: collectionName || 'favorites',
      });
      
      res.json(savedRecipe);
    } catch (error) {
      console.error("Error saving recipe:", error);
      res.status(500).json({ message: "Failed to save recipe" });
    }
  });

  app.delete('/api/cookbook/:recipeId', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.unsaveRecipe(userId, req.params.recipeId);
      res.json({ message: "Recipe removed from cookbook" });
    } catch (error) {
      console.error("Error removing recipe from cookbook:", error);
      res.status(500).json({ message: "Failed to remove recipe from cookbook" });
    }
  });

  // Shopping list routes
  app.get('/api/shopping-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shoppingLists = await storage.getUserShoppingLists(userId);
      res.json(shoppingLists);
    } catch (error) {
      console.error("Error fetching shopping lists:", error);
      res.status(500).json({ message: "Failed to fetch shopping lists" });
    }
  });

  app.post('/api/shopping-lists', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const validatedData = insertShoppingListSchema.parse({ ...req.body, userId });
      const shoppingList = await storage.createShoppingList(validatedData);
      res.json(shoppingList);
    } catch (error) {
      console.error("Error creating shopping list:", error);
      res.status(500).json({ message: "Failed to create shopping list" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
