import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Flame, Heart, BookOpen, ShoppingCart } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: () => void;
  showActions?: boolean;
  variant?: "default" | "compact";
}

export default function RecipeCard({ 
  recipe, 
  onSave, 
  showActions = true, 
  variant = "default" 
}: RecipeCardProps) {
  const { toast } = useToast();

  const saveToCookbook = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/cookbook', {
        recipeId: recipe.id,
        collectionName: 'favorites',
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Saved to Cookbook! 📚",
        description: "Recipe has been saved to your cookbook.",
      });
      onSave?.();
    },
    onError: (error) => {
      toast({
        title: "Save Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const saveToShoppingList = useMutation({
    mutationFn: async () => {
      const response = await apiRequest('POST', '/api/shopping-lists', {
        name: `Shopping List for ${recipe.title}`,
        items: recipe.ingredients,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Added to Shopping List! 🛒",
        description: "All ingredients have been added to your shopping list.",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to Add",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (variant === "compact") {
    return (
      <Card className="hover:shadow-md transition-shadow animate-slide-in-up">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 truncate">{recipe.title}</h4>
            <Badge variant="secondary" className="text-xs">
              {recipe.chefMode}
            </Badge>
          </div>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">{recipe.description}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center space-x-3">
              <span className="flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
              </span>
              <span className="flex items-center">
                <Flame className="h-3 w-3 mr-1" />
                {recipe.calories} cal
              </span>
            </div>
            {showActions && (
              <div className="flex space-x-1">
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => saveToCookbook.mutate()}
                  disabled={saveToCookbook.isPending}
                  className="h-6 w-6 p-0"
                >
                  <Heart className="h-3 w-3" />
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  onClick={() => saveToShoppingList.mutate()}
                  disabled={saveToShoppingList.isPending}
                  className="h-6 w-6 p-0"
                >
                  <ShoppingCart className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="hover:shadow-lg transition-shadow animate-slide-in-up">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2">{recipe.title}</CardTitle>
            <CardDescription className="mb-3">{recipe.description}</CardDescription>
          </div>
          <Badge variant="secondary" className="ml-2">
            {recipe.chefMode}
          </Badge>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-gray-500">
          <span className="flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {(recipe.prepTime || 0) + (recipe.cookTime || 0)} min
          </span>
          <span className="flex items-center">
            <Users className="h-4 w-4 mr-1" />
            {recipe.servings || 1} servings
          </span>
          <span className="flex items-center">
            <Flame className="h-4 w-4 mr-1" />
            {recipe.calories} cal
          </span>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Ingredients Preview */}
        <div>
          <h4 className="font-medium mb-2">Ingredients:</h4>
          <div className="text-sm text-gray-600 space-y-1">
            {recipe.ingredients?.slice(0, 3).map((ingredient, index) => (
              <div key={index}>• {ingredient}</div>
            ))}
            {recipe.ingredients && recipe.ingredients.length > 3 && (
              <div className="text-gray-500">+ {recipe.ingredients.length - 3} more ingredients...</div>
            )}
          </div>
        </div>

        {/* Nutrition Info */}
        {recipe.macros && (
          <div className="grid grid-cols-4 gap-2 text-xs">
            <div className="text-center">
              <div className="font-medium text-gray-900">{recipe.macros.protein || 0}g</div>
              <div className="text-gray-500">Protein</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{recipe.macros.carbs || 0}g</div>
              <div className="text-gray-500">Carbs</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{recipe.macros.fat || 0}g</div>
              <div className="text-gray-500">Fat</div>
            </div>
            <div className="text-center">
              <div className="font-medium text-gray-900">{recipe.macros.fiber || 0}g</div>
              <div className="text-gray-500">Fiber</div>
            </div>
          </div>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex space-x-2 pt-2">
            <Button 
              onClick={() => saveToCookbook.mutate()}
              disabled={saveToCookbook.isPending}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Save to Cookbook
            </Button>
            <Button 
              onClick={() => saveToShoppingList.mutate()}
              disabled={saveToShoppingList.isPending}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              Shopping List
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
