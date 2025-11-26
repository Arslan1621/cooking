import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu";
import { useAuth } from "@/hooks/useAuth";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { 
  Utensils, 
  Menu, 
  ChefHat, 
  Calendar, 
  Package, 
  Target, 
  Camera,
  User,
  LogOut
} from "lucide-react";

export default function Navbar() {
  const [location] = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href={isAuthenticated ? "/" : "/"} className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-chef-orange rounded-lg flex items-center justify-center">
                <Utensils className="text-white text-sm" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChefGPT</span>
            </Link>
            
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-gray-700 hover:text-chef-orange font-medium">
                        Features
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="p-4">
                        <div className="grid gap-3 w-80">
                          <Link href="/pantry-chef" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                            <Package className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">🥫 PantryChef</div>
                              <div className="text-sm text-gray-600">Transform ingredients into meals</div>
                            </div>
                          </Link>
                          <Link href="/meal-plan-chef" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                            <Calendar className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">📆 MealPlanChef</div>
                              <div className="text-sm text-gray-600">AI-powered meal planning</div>
                            </div>
                          </Link>
                          <Link href="/master-chef" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                            <ChefHat className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">👨‍🍳 MasterChef</div>
                              <div className="text-sm text-gray-600">Professional recipes</div>
                            </div>
                          </Link>
                          <Link href="/macros-chef" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                            <Target className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">💪 MacrosChef</div>
                              <div className="text-sm text-gray-600">Macro-focused cooking</div>
                            </div>
                          </Link>
                          <Link href="/mixology-maestro" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                            <ChefHat className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">🍸 MixologyMaestro</div>
                              <div className="text-sm text-gray-600">Craft perfect cocktails</div>
                            </div>
                          </Link>
                          <Link href="/calorie-tracker" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50">
                            <Camera className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">📸 Calorie Tracker</div>
                              <div className="text-sm text-gray-600">AI photo food logging</div>
                            </div>
                          </Link>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                
                <Link 
                  href="/cookbook" 
                  className={`font-medium ${location === '/cookbook' ? 'text-chef-orange' : 'text-gray-700 hover:text-chef-orange'}`}
                >
                  Cookbook
                </Link>
                <Link 
                  href="/pantry" 
                  className={`font-medium ${location === '/pantry' ? 'text-chef-orange' : 'text-gray-700 hover:text-chef-orange'}`}
                >
                  Pantry
                </Link>
              </div>
            )}

            {!isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6">
                <NavigationMenu>
                  <NavigationMenuList>
                    <NavigationMenuItem>
                      <NavigationMenuTrigger className="text-gray-700 hover:text-chef-orange font-medium">
                        Features
                      </NavigationMenuTrigger>
                      <NavigationMenuContent className="p-4">
                        <div className="grid gap-3 w-80">
                          <div className="flex items-center space-x-3 p-3">
                            <Package className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">🥫 PantryChef</div>
                              <div className="text-sm text-gray-600">Transform ingredients into meals</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3">
                            <Calendar className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">📆 MealPlanChef</div>
                              <div className="text-sm text-gray-600">AI-powered meal planning</div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3 p-3">
                            <ChefHat className="w-5 h-5 text-chef-orange" />
                            <div>
                              <div className="font-medium">👨‍🍳 MasterChef</div>
                              <div className="text-sm text-gray-600">Professional recipes</div>
                            </div>
                          </div>
                        </div>
                      </NavigationMenuContent>
                    </NavigationMenuItem>
                  </NavigationMenuList>
                </NavigationMenu>
                
                <Link href="/pricing" className="text-gray-700 hover:text-chef-orange font-medium">Pricing</Link>
                <Link href="/blog" className="text-gray-700 hover:text-chef-orange font-medium">Blog</Link>
                <Link href="/faq" className="text-gray-700 hover:text-chef-orange font-medium">FAQ</Link>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 hover:text-chef-orange font-medium">ChefGPT Store</span>
                  <Badge className="bg-chef-orange text-white text-xs">New</Badge>
                </div>
                <div className="flex items-center space-x-1">
                  <span className="text-gray-700 hover:text-chef-orange font-medium">Gift Cards</span>
                  <Badge className="bg-chef-orange text-white text-xs">New</Badge>
                </div>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {!isAuthenticated ? (
              <>
                <div className="hidden md:flex items-center space-x-2">
                  <span className="text-gray-600">🇬🇧 EN</span>
                </div>
                <SignInButton mode="modal">
                  <Button variant="ghost">Sign In</Button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <Button className="bg-chef-orange hover:bg-chef-orange/90">
                    Sign Up
                  </Button>
                </SignUpButton>
              </>
            ) : (
              <>
                <div className="hidden md:flex items-center space-x-4">
                  <UserButton afterSignOutUrl="/" />
                  <span className="text-sm font-medium text-gray-700">
                    {user?.firstName || 'Chef'}
                  </span>
                </div>
              </>
            )}
            
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="py-6 space-y-6">
                  {isAuthenticated ? (
                    <>
                      <div className="space-y-4">
                        <Link href="/pantry-chef" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          🥫 PantryChef
                        </Link>
                        <Link href="/meal-plan-chef" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          📆 MealPlanChef
                        </Link>
                        <Link href="/master-chef" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          👨‍🍳 MasterChef
                        </Link>
                        <Link href="/macros-chef" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          💪 MacrosChef
                        </Link>
                        <Link href="/mixology-maestro" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          🍸 MixologyMaestro
                        </Link>
                        <Link href="/calorie-tracker" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          📸 Calorie Tracker
                        </Link>
                      </div>
                      <hr />
                      <div className="space-y-4">
                        <Link href="/cookbook" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          Cookbook
                        </Link>
                        <Link href="/pantry" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          Pantry
                        </Link>
                      </div>
                      <hr />
                      <div className="flex justify-center">
                        <UserButton afterSignOutUrl="/" />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <div className="text-lg font-medium">Features</div>
                        <div className="pl-4 space-y-2 text-gray-600">
                          <div>🥫 PantryChef</div>
                          <div>📆 MealPlanChef</div>
                          <div>👨‍🍳 MasterChef</div>
                          <div>💪 MacrosChef</div>
                          <div>🍸 MixologyMaestro</div>
                        </div>
                      </div>
                      <hr />
                      <div className="space-y-4">
                        <Link href="/pricing" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          Pricing
                        </Link>
                        <Link href="/blog" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          Blog
                        </Link>
                        <Link href="/faq" onClick={() => setIsOpen(false)} className="block text-lg font-medium">
                          FAQ
                        </Link>
                      </div>
                      <hr />
                      <div className="space-y-2">
                        <SignInButton mode="modal">
                          <Button variant="outline" className="w-full">
                            Sign In
                          </Button>
                        </SignInButton>
                        <SignUpButton mode="modal">
                          <Button className="w-full bg-chef-orange hover:bg-chef-orange/90">
                            Sign Up
                          </Button>
                        </SignUpButton>
                      </div>
                    </>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
