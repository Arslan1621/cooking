import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface ChefMode {
  id: string;
  name: string;
  emoji: string;
  title: string;
  description: string;
  features: string[];
}

interface ChefModeSelectorProps {
  selectedMode: string;
  onModeChange: (mode: string) => void;
  availableModes?: string[];
}

const chefModes: ChefMode[] = [
  {
    id: "pantry",
    name: "PantryChef",
    emoji: "🥫",
    title: "Gourmet Mode",
    description: "Use only the best combination of ingredients while discarding those that don't fit - please don't waste the ingredients that are not used. ♻️",
    features: ["Minimize waste", "Best combinations", "Eco-friendly"]
  },
  {
    id: "master",
    name: "MasterChef",
    emoji: "👨‍🍳",
    title: "Professional Mode",
    description: "Restaurant-quality recipes with detailed techniques and professional cooking methods.",
    features: ["Professional techniques", "Restaurant quality", "Detailed instructions"]
  },
  {
    id: "macros",
    name: "MacrosChef",
    emoji: "💪",
    title: "Nutrition Mode",
    description: "Hit your macro targets with precision while maintaining amazing flavors and satisfaction.",
    features: ["Macro tracking", "Nutritional balance", "Health focused"]
  },
  {
    id: "mixology",
    name: "MixologyMaestro",
    emoji: "🍸",
    title: "Cocktail Mode",
    description: "Craft perfect cocktails and beverages with proper mixing techniques and flavor profiles.",
    features: ["Cocktail recipes", "Mixing techniques", "Flavor profiles"]
  },
  {
    id: "meal-plan",
    name: "MealPlanChef",
    emoji: "📆",
    title: "Planning Mode",
    description: "Create balanced, nutritious meals that fit into broader meal planning goals and dietary needs.",
    features: ["Meal planning", "Balanced nutrition", "Dietary goals"]
  }
];

export default function ChefModeSelector({ 
  selectedMode, 
  onModeChange, 
  availableModes 
}: ChefModeSelectorProps) {
  const modes = availableModes 
    ? chefModes.filter(mode => availableModes.includes(mode.id))
    : chefModes;

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold mb-2">Select Chef Mode</h3>
        <p className="text-sm text-gray-600">
          Choose the cooking style that best fits your needs.
        </p>
      </div>

      <div className="grid gap-4">
        {modes.map((mode) => (
          <Card 
            key={mode.id}
            className={`cursor-pointer transition-all ${
              selectedMode === mode.id 
                ? 'border-chef-orange bg-chef-orange/5' 
                : 'hover:border-chef-orange/50'
            }`}
            onClick={() => onModeChange(mode.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <span className="text-lg">{mode.emoji}</span>
                  {mode.name}
                </CardTitle>
                {selectedMode === mode.id && (
                  <Badge className="bg-chef-orange text-white">Selected</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <h4 className="font-medium mb-2">{mode.title}</h4>
              <p className="text-sm text-gray-600 mb-3">{mode.description}</p>
              <div className="flex flex-wrap gap-1">
                {mode.features.map((feature, index) => (
                  <Badge 
                    key={index} 
                    variant="secondary" 
                    className="text-xs bg-gray-100 text-gray-600"
                  >
                    {feature}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedMode === "pantry" && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="space-y-3">
              <h4 className="font-medium">Advanced PantryChef Options</h4>
              <div className="grid gap-2">
                <Button
                  variant="outline"
                  className="justify-start h-auto p-3 border-chef-orange text-chef-orange hover:bg-chef-orange hover:text-white"
                >
                  <div className="text-left">
                    <div className="font-medium">Gourmet Mode</div>
                    <div className="text-xs opacity-75">
                      Use only the best combination of ingredients ♻️
                    </div>
                  </div>
                </Button>
                <Button
                  variant="outline"
                  className="justify-start h-auto p-3 hover:border-chef-orange hover:text-chef-orange"
                >
                  <div className="text-left">
                    <div className="font-medium">All-In Mode</div>
                    <div className="text-xs opacity-75">
                      Use ALL ingredients listed - for adventurous cooks! 🙃
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
