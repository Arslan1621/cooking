import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Heart, BookOpen, ShoppingCart } from "lucide-react";
import type { Recipe } from "@shared/schema";

interface RecipeCardProps {
  recipe: Recipe;
  onSave?: (recipeId: string) => void;
  onAddToShopping?: (recipeId: string) => void;
  onView?: (recipeId: string) => void;
  showActions?: boolean;
}

export default function RecipeCard({ 
  recipe, 
  onSave, 
  onAddToShopping, 
  onView,
  showActions = true 
}: RecipeCardProps) {
  const totalTime = (recipe.prepTime || 0) + (recipe.cookTime || 0);
  const macros = recipe.macros as any;

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 group-hover:text-chef-orange transition-colors">
              {recipe.title}
            </CardTitle>
            {recipe.description && (
              <p className="text-sm text-gray-600 line-clamp-2">{recipe.description}</p>
            )}
          </div>
          {recipe.imageUrl && (
            <img 
              src={recipe.imageUrl} 
              alt={recipe.title}
              className="w-16 h-16 rounded-lg object-cover ml-3"
            />
          )}
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {recipe.cuisine && (
            <Badge variant="secondary" className="text-xs">
              {recipe.cuisine}
            </Badge>
          )}
          {recipe.difficulty && (
            <Badge 
              variant="outline" 
              className={`text-xs ${
                recipe.difficulty === 'easy' ? 'border-green-300 text-green-700' :
                recipe.difficulty === 'medium' ? 'border-yellow-300 text-yellow-700' :
                'border-red-300 text-red-700'
              }`}
            >
              {recipe.difficulty}
            </Badge>
          )}
          {recipe.mealType && (
            <Badge variant="outline" className="text-xs">
              {recipe.mealType}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Recipe Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4 text-gray-500" />
            <span>{totalTime || 'N/A'} min</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4 text-gray-500" />
            <span>{recipe.servings || 1} servings</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-chef-orange font-medium">
              {recipe.calories || 0} cal
            </span>
          </div>
        </div>

        {/* Macros */}
        {macros && (
          <div className="grid grid-cols-3 gap-2 text-xs">
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-medium text-chef-orange">{macros.protein || 0}g</div>
              <div className="text-gray-600">Protein</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-medium text-chef-orange">{macros.carbs || 0}g</div>
              <div className="text-gray-600">Carbs</div>
            </div>
            <div className="text-center p-2 bg-gray-50 rounded">
              <div className="font-medium text-chef-orange">{macros.fat || 0}g</div>
              <div className="text-gray-600">Fat</div>
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
            {recipe.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{recipe.tags.length - 3} more
              </Badge>
            )}
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView?.(recipe.id)}
            >
              <BookOpen className="w-4 h-4 mr-1" />
              View
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onSave?.(recipe.id)}
            >
              <Heart className="w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddToShopping?.(recipe.id)}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
