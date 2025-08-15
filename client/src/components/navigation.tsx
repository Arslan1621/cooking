import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ChevronDown, Utensils, Menu, X } from "lucide-react";
import { useState } from "react";

export default function Navigation() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-b border-gray-100 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-chef-orange rounded-lg flex items-center justify-center">
                <Utensils className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">ChefGPT</span>
            </Link>
            
            {!isLoading && isAuthenticated && (
              <div className="hidden md:flex items-center space-x-6">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="text-gray-700 hover:text-chef-orange font-medium">
                      Features <ChevronDown className="ml-1 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem asChild>
                      <Link href="/pantry-chef">🥫 PantryChef</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/meal-plan-chef">📆 MealPlanChef</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/master-chef">👨‍🍳 MasterChef</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/macros-chef">💪 MacrosChef</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/mixology-maestro">🍹 MixologyMaestro</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/calorie-tracker">📊 Calorie Tracker</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/pantry">📦 Pantry Manager</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/cookbook">📚 Cookbook</Link>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                <Link href="/pricing" className="text-gray-700 hover:text-chef-orange font-medium">
                  Pricing
                </Link>
                <Link href="/blog" className="text-gray-700 hover:text-chef-orange font-medium">
                  Blog
                </Link>
                <Link href="/faq" className="text-gray-700 hover:text-chef-orange font-medium">
                  FAQ
                </Link>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-4">
            {!isLoading && (
              <>
                {!isAuthenticated ? (
                  <>
                    <Button variant="ghost" onClick={() => window.location.href = '/api/login'}>
                      Sign In
                    </Button>
                    <Button className="bg-chef-orange hover:bg-chef-orange/90" onClick={() => window.location.href = '/api/login'}>
                      Sign Up
                    </Button>
                  </>
                ) : (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={user?.profileImageUrl || ""} alt={user?.firstName || ""} />
                          <AvatarFallback>
                            {user?.firstName?.[0]}{user?.lastName?.[0]}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                      <DropdownMenuItem>
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.firstName} {user?.lastName}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = '/api/logout'}>
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </>
            )}
            
            {!isLoading && isAuthenticated && (
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            )}
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && isAuthenticated && (
          <div className="md:hidden border-t border-gray-100 py-4">
            <div className="space-y-2">
              <Link href="/pantry-chef" className="block px-3 py-2 text-gray-700 hover:text-chef-orange">
                🥫 PantryChef
              </Link>
              <Link href="/meal-plan-chef" className="block px-3 py-2 text-gray-700 hover:text-chef-orange">
                📆 MealPlanChef
              </Link>
              <Link href="/master-chef" className="block px-3 py-2 text-gray-700 hover:text-chef-orange">
                👨‍🍳 MasterChef
              </Link>
              <Link href="/macros-chef" className="block px-3 py-2 text-gray-700 hover:text-chef-orange">
                💪 MacrosChef
              </Link>
              <Link href="/mixology-maestro" className="block px-3 py-2 text-gray-700 hover:text-chef-orange">
                🍹 MixologyMaestro
              </Link>
              <Link href="/calorie-tracker" className="block px-3 py-2 text-gray-700 hover:text-chef-orange">
                📊 Calorie Tracker
              </Link>
              <Link href="/pantry" className="block px-3 py-2 text-gray-700 hover:text-chef-orange">
                📦 Pantry Manager
              </Link>
              <Link href="/cookbook" className="block px-3 py-2 text-gray-700 hover:text-chef-orange">
                📚 Cookbook
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
