import { Recipe } from "@/types/recipe";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";

interface RecipeCardProps {
  recipe: Recipe;
}

export function RecipeCard({ recipe }: RecipeCardProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const saveRecipeMutation = useMutation({
    mutationFn: async () => {
      await apiRequest(`/api/recipes/${recipe.id}/save`, {
        method: "POST",
        body: { collectionName: "favorites" },
      });
    },
    onSuccess: () => {
      toast({
        title: "Recipe Saved!",
        description: "Added to your cookbook successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/saved-recipes"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save recipe. Please try again.",
        variant: "destructive",
      });
    },
  });

  const getChefModeIcon = (chefMode: string) => {
    switch (chefMode) {
      case 'pantry':
        return '🥫';
      case 'master':
        return '👨‍🍳';
      case 'macros':
        return '📊';
      case 'mixology':
        return '🍸';
      case 'meal-plan':
        return '📆';
      default:
        return '🍽️';
    }
  };

  const getChefModeColor = (chefMode: string) => {
    switch (chefMode) {
      case 'pantry':
        return 'pantry-gradient';
      case 'master':
        return 'master-gradient';
      case 'macros':
        return 'macros-gradient';
      case 'mixology':
        return 'mixology-gradient';
      case 'meal-plan':
        return 'meal-plan-gradient';
      default:
        return 'chef-gradient';
    }
  };

  return (
    <Card className="recipe-card overflow-hidden group">
      {recipe.imageUrl ? (
        <div className="relative">
          <img
            src={recipe.imageUrl}
            alt={recipe.title}
            className="w-full h-48 object-cover"
          />
          <div className="absolute top-2 right-2">
            <Badge className={`${getChefModeColor(recipe.chefMode)} text-white border-0`}>
              {getChefModeIcon(recipe.chefMode)} {recipe.chefMode}
            </Badge>
          </div>
        </div>
      ) : (
        <div className={`w-full h-48 bg-gradient-to-br ${getChefModeColor(recipe.chefMode)} flex items-center justify-center`}>
          <span className="text-6xl opacity-75">
            {getChefModeIcon(recipe.chefMode)}
          </span>
          <div className="absolute top-2 right-2">
            <Badge className="bg-black/20 text-white border-0">
              {recipe.chefMode}
            </Badge>
          </div>
        </div>
      )}

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-xl font-bold text-gray-900 line-clamp-2">
            {recipe.title}
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => saveRecipeMutation.mutate()}
            disabled={saveRecipeMutation.isPending}
            className="text-chef-orange hover:text-chef-red ml-2"
          >
            <i className={`far fa-heart ${saveRecipeMutation.isPending ? 'fas fa-spinner fa-spin' : ''}`}></i>
          </Button>
        </div>
        {recipe.description && (
          <p className="text-gray-600 text-sm line-clamp-2">{recipe.description}</p>
        )}
      </CardHeader>

      <CardContent className="pt-0 space-y-4">
        {/* Recipe Stats */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {recipe.prepTime && (
              <div className="flex items-center space-x-1">
                <i className="far fa-clock"></i>
                <span>{recipe.prepTime + (recipe.cookTime || 0)}m</span>
              </div>
            )}
            {recipe.servings && (
              <div className="flex items-center space-x-1">
                <i className="fas fa-users"></i>
                <span>{recipe.servings}</span>
              </div>
            )}
            {recipe.calories && (
              <div className="flex items-center space-x-1">
                <i className="fas fa-fire"></i>
                <span>{recipe.calories} cal</span>
              </div>
            )}
          </div>
          {recipe.difficulty && (
            <Badge variant="outline" className="text-xs">
              {recipe.difficulty}
            </Badge>
          )}
        </div>

        {/* Macros */}
        {recipe.macros && (
          <div className="grid grid-cols-4 gap-1 text-xs text-center">
            <div>
              <div className="font-semibold text-chef-orange">{recipe.macros.protein}g</div>
              <div className="text-gray-500">Protein</div>
            </div>
            <div>
              <div className="font-semibold text-green-600">{recipe.macros.carbs}g</div>
              <div className="text-gray-500">Carbs</div>
            </div>
            <div>
              <div className="font-semibold text-yellow-600">{recipe.macros.fat}g</div>
              <div className="text-gray-500">Fat</div>
            </div>
            <div>
              <div className="font-semibold text-blue-600">{recipe.macros.fiber}g</div>
              <div className="text-gray-500">Fiber</div>
            </div>
          </div>
        )}

        {/* Tags */}
        {recipe.tags && recipe.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
            {recipe.tags.length > 3 && (
              <Badge variant="secondary" className="text-xs">
                +{recipe.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-2 pt-2">
          <Button size="sm" className="flex-1" asChild>
            <a href={`/recipes/${recipe.id}`}>
              <i className="fas fa-eye mr-2"></i>
              View Recipe
            </a>
          </Button>
          <Button variant="outline" size="sm" className="flex-1">
            <i className="fas fa-shopping-cart mr-2"></i>
            Add to List
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
