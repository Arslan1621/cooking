import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, Users, Target, ShoppingCart, Eye } from "lucide-react";
import type { MealPlan } from "@shared/schema";

interface MealPlanCardProps {
  mealPlan: MealPlan;
  onView?: (mealPlanId: string) => void;
  onAddToShopping?: (mealPlanId: string) => void;
  showActions?: boolean;
}

export default function MealPlanCard({ 
  mealPlan, 
  onView, 
  onAddToShopping,
  showActions = true 
}: MealPlanCardProps) {
  const startDate = new Date(mealPlan.startDate);
  const endDate = new Date(mealPlan.endDate);
  const duration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const meals = mealPlan.meals as any[];
  const totalMeals = meals?.length || 0;
  
  // Calculate total nutrition if meals data is available
  const totalCalories = meals?.reduce((acc, meal) => acc + (meal.recipe?.calories || 0), 0) || 0;
  const avgCaloriesPerDay = totalCalories / (duration || 1);

  return (
    <Card className="hover:shadow-lg transition-shadow duration-200 group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg mb-2 group-hover:text-chef-orange transition-colors">
              {mealPlan.name}
            </CardTitle>
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                <span>{startDate.toLocaleDateString()}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>{duration} days</span>
              </div>
            </div>
          </div>
          {mealPlan.goal && (
            <Badge className="bg-chef-orange/10 text-chef-orange">
              {mealPlan.goal}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-chef-orange">{totalMeals}</div>
            <div className="text-gray-600">Total Meals</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-chef-orange">{Math.round(avgCaloriesPerDay)}</div>
            <div className="text-gray-600">Cal/Day</div>
          </div>
          <div className="text-center p-2 bg-gray-50 rounded">
            <div className="font-medium text-chef-orange">{mealPlan.shoppingList?.length || 0}</div>
            <div className="text-gray-600">Ingredients</div>
          </div>
        </div>

        {/* Dietary Restrictions */}
        {mealPlan.dietaryRestrictions && mealPlan.dietaryRestrictions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Dietary Preferences</h4>
            <div className="flex flex-wrap gap-1">
              {mealPlan.dietaryRestrictions.map((restriction, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {restriction}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Sample Meals Preview */}
        {meals && meals.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Sample Meals</h4>
            <div className="space-y-1">
              {meals.slice(0, 3).map((meal, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-gray-600">
                    Day {meal.day} • {meal.mealType}
                  </span>
                  <span className="font-medium">{meal.recipe?.title}</span>
                </div>
              ))}
              {meals.length > 3 && (
                <div className="text-xs text-gray-500">
                  +{meals.length - 3} more meals...
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        {showActions && (
          <div className="flex gap-2 pt-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex-1"
              onClick={() => onView?.(mealPlan.id)}
            >
              <Eye className="w-4 h-4 mr-1" />
              View Plan
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onAddToShopping?.(mealPlan.id)}
            >
              <ShoppingCart className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Created Date */}
        <div className="text-xs text-gray-500 pt-2 border-t">
          Created {new Date(mealPlan.createdAt!).toLocaleDateString()}
        </div>
      </CardContent>
    </Card>
  );
}
