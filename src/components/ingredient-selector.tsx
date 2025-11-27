import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  title?: string;
  description?: string;
  placeholder?: string;
}

const commonIngredients = [
  "Chicken", "Beef", "Pork", "Fish", "Eggs", "Milk", "Cheese", "Butter",
  "Onion", "Garlic", "Tomato", "Potato", "Carrot", "Bell Pepper", "Spinach",
  "Rice", "Pasta", "Bread", "Flour", "Salt", "Pepper", "Olive Oil",
  "Lemon", "Avocado", "Broccoli", "Mushrooms", "Ginger", "Herbs", "Honey"
];

export default function IngredientSelector({ 
  selectedIngredients, 
  onIngredientsChange, 
  title = "Select Ingredients",
  description = "Choose from common ingredients or add your own",
  placeholder = "Add custom ingredient..."
}: IngredientSelectorProps) {
  const [customIngredient, setCustomIngredient] = useState("");

  const addIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      onIngredientsChange([...selectedIngredients, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    onIngredientsChange(selectedIngredients.filter(item => item !== ingredient));
  };

  const handleCustomAdd = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      addIngredient(customIngredient.trim());
      setCustomIngredient("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCustomAdd();
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <p className="text-sm text-gray-600">{description}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Selected Ingredients */}
        {selectedIngredients.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Selected ({selectedIngredients.length})</h4>
            <div className="flex flex-wrap gap-2">
              {selectedIngredients.map((ingredient) => (
                <Badge
                  key={ingredient}
                  variant="secondary"
                  className="bg-chef-orange/10 text-chef-orange hover:bg-chef-orange/20"
                >
                  {ingredient}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-0 ml-2 hover:bg-transparent"
                    onClick={() => removeIngredient(ingredient)}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Custom Ingredient Input */}
        <div className="flex gap-2">
          <Input
            value={customIngredient}
            onChange={(e) => setCustomIngredient(e.target.value)}
            placeholder={placeholder}
            onKeyPress={handleKeyPress}
          />
          <Button 
            onClick={handleCustomAdd}
            disabled={!customIngredient.trim()}
            size="sm"
            className="bg-chef-orange hover:bg-chef-orange/90"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Common Ingredients */}
        <div>
          <h4 className="font-medium mb-2">Common Ingredients</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {commonIngredients.map((ingredient) => (
              <Button
                key={ingredient}
                variant={selectedIngredients.includes(ingredient) ? "default" : "outline"}
                size="sm"
                onClick={() => 
                  selectedIngredients.includes(ingredient) 
                    ? removeIngredient(ingredient)
                    : addIngredient(ingredient)
                }
                className={selectedIngredients.includes(ingredient) 
                  ? "bg-chef-orange hover:bg-chef-orange/90" 
                  : "hover:bg-chef-orange/10 hover:border-chef-orange"
                }
              >
                {ingredient}
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
