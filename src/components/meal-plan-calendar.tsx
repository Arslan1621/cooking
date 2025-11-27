import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar,
  ChevronLeft, 
  ChevronRight,
  Plus,
  Coffee,
  Sun,
  Moon,
  Cookie
} from "lucide-react";

interface MealPlanCalendarProps {
  mealPlan?: {
    id: string;
    name: string;
    startDate: string;
    endDate: string;
    meals: Array<{
      date: string;
      breakfast?: string;
      lunch?: string;
      dinner?: string;
      snacks?: string[];
    }>;
    targetCalories?: number;
  };
  onAddMeal?: (date: string, mealType: string) => void;
  onEditMeal?: (date: string, mealType: string, currentMeal?: string) => void;
}

const DAYS_OF_WEEK = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const MEAL_TYPES = [
  { key: 'breakfast', label: 'Breakfast', icon: Coffee, color: 'bg-yellow-100 text-yellow-800' },
  { key: 'lunch', label: 'Lunch', icon: Sun, color: 'bg-orange-100 text-orange-800' },
  { key: 'dinner', label: 'Dinner', icon: Moon, color: 'bg-purple-100 text-purple-800' },
  { key: 'snacks', label: 'Snacks', icon: Cookie, color: 'bg-green-100 text-green-800' },
];

export default function MealPlanCalendar({ 
  mealPlan, 
  onAddMeal, 
  onEditMeal 
}: MealPlanCalendarProps) {
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const monday = new Date(today);
    monday.setDate(today.getDate() - today.getDay() + 1);
    return monday;
  });

  // Generate week dates
  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const date = new Date(currentWeekStart);
    date.setDate(currentWeekStart.getDate() + i);
    return date;
  });

  const navigateWeek = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + (direction === 'next' ? 7 : -7));
    setCurrentWeekStart(newDate);
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getMealForDate = (date: Date, mealType: string) => {
    if (!mealPlan) return null;
    
    const dateStr = formatDate(date);
    const dayMeals = mealPlan.meals.find(m => m.date === dateStr);
    
    if (!dayMeals) return null;
    
    if (mealType === 'snacks') {
      return dayMeals.snacks?.join(', ') || null;
    }
    
    return dayMeals[mealType as keyof typeof dayMeals] || null;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  if (!mealPlan) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Meal Plan</h3>
          <p className="text-gray-600 mb-4">Create a meal plan to see your weekly schedule</p>
          <Button className="bg-chef-orange hover:bg-orange-600">
            Create Meal Plan
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2" />
                {mealPlan.name}
              </CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                {new Date(mealPlan.startDate).toLocaleDateString()} - {new Date(mealPlan.endDate).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={() => navigateWeek('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm font-medium min-w-[120px] text-center">
                {currentWeekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {
                  (() => {
                    const weekEnd = new Date(currentWeekStart);
                    weekEnd.setDate(currentWeekStart.getDate() + 6);
                    return weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                  })()
                }
              </span>
              <Button variant="outline" size="icon" onClick={() => navigateWeek('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Weekly Calendar Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-7 gap-4">
        {weekDates.map((date, dayIndex) => (
          <Card 
            key={dayIndex}
            className={`${isToday(date) ? 'ring-2 ring-chef-orange' : ''} ${
              isPastDate(date) ? 'opacity-60' : ''
            }`}
          >
            <CardHeader className="pb-3">
              <div className="text-center">
                <p className="text-sm font-medium text-gray-600">
                  {DAYS_OF_WEEK[dayIndex]}
                </p>
                <p className={`text-lg font-bold ${
                  isToday(date) ? 'text-chef-orange' : 'text-gray-900'
                }`}>
                  {date.getDate()}
                </p>
                {isToday(date) && (
                  <Badge className="bg-chef-orange text-white text-xs mt-1">
                    Today
                  </Badge>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="pt-0 space-y-3">
              {MEAL_TYPES.map((mealType) => {
                const meal = getMealForDate(date, mealType.key);
                const IconComponent = mealType.icon;
                
                return (
                  <div key={mealType.key} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <IconComponent className="h-3 w-3 mr-1" />
                        <span className="text-xs font-medium text-gray-700">
                          {mealType.label}
                        </span>
                      </div>
                      {onAddMeal && (
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-5 w-5"
                          onClick={() => onAddMeal(formatDate(date), mealType.key)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {meal ? (
                      <div
                        className={`text-xs p-2 rounded cursor-pointer hover:opacity-80 transition-opacity ${mealType.color}`}
                        onClick={() => onEditMeal?.(formatDate(date), mealType.key, meal)}
                      >
                        {meal.length > 30 ? `${meal.substring(0, 30)}...` : meal}
                      </div>
                    ) : (
                      <div 
                        className="text-xs p-2 rounded border-2 border-dashed border-gray-200 text-gray-400 cursor-pointer hover:border-chef-orange hover:text-chef-orange transition-colors"
                        onClick={() => onAddMeal?.(formatDate(date), mealType.key)}
                      >
                        + Add {mealType.label.toLowerCase()}
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Daily Calories */}
              {mealPlan.targetCalories && (
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">Target:</span>
                    <span className="font-medium">
                      {Math.round(mealPlan.targetCalories)} cal
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Legend */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-center space-x-6 text-xs">
            {MEAL_TYPES.map((mealType) => {
              const IconComponent = mealType.icon;
              return (
                <div key={mealType.key} className="flex items-center">
                  <IconComponent className="h-3 w-3 mr-1" />
                  <span className={`px-2 py-1 rounded ${mealType.color}`}>
                    {mealType.label}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
