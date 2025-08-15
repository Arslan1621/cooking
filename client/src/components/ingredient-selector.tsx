import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { X, Plus, Search } from "lucide-react";

interface IngredientSelectorProps {
  selectedIngredients: string[];
  onIngredientsChange: (ingredients: string[]) => void;
  availableIngredients?: string[];
}

const COMMON_INGREDIENTS = [
  "Chicken Breast", "Beef", "Salmon", "Shrimp", "Eggs", "Milk", "Cheese", "Butter",
  "Rice", "Pasta", "Bread", "Potatoes", "Onions", "Garlic", "Tomatoes", "Bell Peppers",
  "Carrots", "Broccoli", "Spinach", "Mushrooms", "Avocado", "Banana", "Apples", "Lemons",
  "Olive Oil", "Salt", "Black Pepper", "Oregano", "Basil", "Thyme", "Paprika", "Cumin"
];

export default function IngredientSelector({ 
  selectedIngredients, 
  onIngredientsChange,
  availableIngredients = []
}: IngredientSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [customIngredient, setCustomIngredient] = useState("");

  const allIngredients = Array.from(new Set([...availableIngredients, ...COMMON_INGREDIENTS]));
  
  const filteredIngredients = allIngredients.filter(ingredient =>
    ingredient.toLowerCase().includes(searchTerm.toLowerCase()) &&
    !selectedIngredients.includes(ingredient)
  );

  const addIngredient = (ingredient: string) => {
    if (!selectedIngredients.includes(ingredient)) {
      onIngredientsChange([...selectedIngredients, ingredient]);
    }
  };

  const removeIngredient = (ingredient: string) => {
    onIngredientsChange(selectedIngredients.filter(item => item !== ingredient));
  };

  const addCustomIngredient = () => {
    if (customIngredient.trim() && !selectedIngredients.includes(customIngredient.trim())) {
      addIngredient(customIngredient.trim());
      setCustomIngredient("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addCustomIngredient();
    }
  };

  return (
    <div className="space-y-4">
      {/* Selected Ingredients */}
      {selectedIngredients.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Selected Ingredients ({selectedIngredients.length})</h4>
          <div className="flex flex-wrap gap-2">
            {selectedIngredients.map((ingredient) => (
              <Badge
                key={ingredient}
                className="bg-chef-orange/10 text-chef-orange hover:bg-chef-orange/20 cursor-pointer"
                onClick={() => removeIngredient(ingredient)}
              >
                {ingredient}
                <X className="h-3 w-3 ml-1" />
              </Badge>
            ))}
          </div>
        </div>
      )}

      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search ingredients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Add Custom Ingredient */}
      <div className="flex gap-2">
        <Input
          placeholder="Add custom ingredient..."
          value={customIngredient}
          onChange={(e) => setCustomIngredient(e.target.value)}
          onKeyPress={handleKeyPress}
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={addCustomIngredient}
          disabled={!customIngredient.trim()}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Pantry Ingredients */}
      {availableIngredients.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">From Your Pantry</h4>
          <div className="flex flex-wrap gap-2">
            {availableIngredients
              .filter(ingredient => !selectedIngredients.includes(ingredient))
              .slice(0, 10)
              .map((ingredient) => (
                <Button
                  key={ingredient}
                  variant="outline"
                  size="sm"
                  onClick={() => addIngredient(ingredient)}
                  className="h-8 text-xs border-chef-orange text-chef-orange hover:bg-chef-orange hover:text-white"
                >
                  {ingredient}
                </Button>
              ))}
          </div>
        </div>
      )}

      {/* Available Ingredients Grid */}
      <div>
        <h4 className="text-sm font-medium mb-2">
          {searchTerm ? 'Search Results' : 'Common Ingredients'}
        </h4>
        <div className="max-h-48 overflow-y-auto">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {filteredIngredients.slice(0, 24).map((ingredient) => (
              <Button
                key={ingredient}
                variant="outline"
                size="sm"
                onClick={() => addIngredient(ingredient)}
                className="h-8 text-xs justify-start hover:bg-chef-orange hover:text-white hover:border-chef-orange"
              >
                <Plus className="h-3 w-3 mr-1" />
                {ingredient}
              </Button>
            ))}
          </div>
        </div>
        
        {filteredIngredients.length === 0 && searchTerm && (
          <Card>
            <CardContent className="p-4 text-center text-gray-500">
              <p>No ingredients found for "{searchTerm}"</p>
              <p className="text-sm">Try adding it as a custom ingredient above</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
