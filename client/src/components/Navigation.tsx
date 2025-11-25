import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { SignInButton, SignUpButton, UserButton } from "@clerk/clerk-react";
import { useSignIn, useSignUp } from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [location] = useLocation();
  const { isAuthenticated, user, isLoading } = useAuth();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { label: "Features", href: "/#features", hasDropdown: true },
    { label: "Pricing", href: "/pricing" },
    { label: "Blog", href: "/blog" },
    { label: "FAQ", href: "/faq" },
  ];

  const featureItems = [
    { label: "PantryChef", href: "/pantry-chef", icon: "🥫" },
    { label: "MealPlanChef", href: "/meal-plan-chef", icon: "📆" },
    { label: "MasterChef", href: "/master-chef", icon: "👨‍🍳" },
    { label: "MacrosChef", href: "/macros-chef", icon: "📊" },
    { label: "MixologyMaestro", href: "/mixology", icon: "🍸" },
  ];

  const dashboardItems = [
    { label: "Dashboard", href: "/dashboard", icon: "📊" },
    { label: "Recipes", href: "/recipes", icon: "📖" },
    { label: "Calorie Tracking", href: "/calories", icon: "📷" },
    { label: "Pantry", href: "/pantry", icon: "🥫" },
    { label: "Profile", href: "/profile", icon: "👤" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "nav-scrolled" : "bg-white/95"
      } backdrop-blur-sm border-b border-gray-100`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-chef-orange rounded-lg flex items-center justify-center">
              <i className="fas fa-utensils text-white text-sm"></i>
            </div>
            <span className="text-xl font-bold text-gray-900">ChefGPT</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {!isAuthenticated ? (
              <>
                {navItems.map((item) =>
                  item.hasDropdown ? (
                    <DropdownMenu key={item.label}>
                      <DropdownMenuTrigger className="text-gray-700 hover:text-chef-orange font-medium flex items-center space-x-1">
                        <span>{item.label}</span>
                        <i className="fas fa-chevron-down text-xs"></i>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-56">
                        {featureItems.map((feature) => (
                          <DropdownMenuItem key={feature.href} asChild>
                            <Link
                              href={feature.href}
                              className="flex items-center space-x-2 w-full px-2 py-1"
                            >
                              <span>{feature.icon}</span>
                              <span>{feature.label}</span>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="text-gray-700 hover:text-chef-orange font-medium"
                    >
                      {item.label}
                    </Link>
                  )
                )}
              </>
            ) : (
              <>
                {dashboardItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`text-gray-700 hover:text-chef-orange font-medium flex items-center space-x-1 ${
                      location === item.href ? "text-chef-orange" : ""
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}
              </>
            )}

            <div className="flex items-center space-x-2">
              <span className="text-gray-600">🇬🇧 EN</span>
            </div>

            <Badge variant="secondary" className="bg-chef-orange text-white">
              ChefGPT Store
            </Badge>

            <Badge variant="secondary" className="bg-chef-orange text-white">
              Gift Cards
            </Badge>
          </div>

          {/* Auth Section */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
            ) : isAuthenticated ? (
              <div data-testid="button-user-menu">
                <UserButton 
                  afterSignOutUrl="/"
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8"
                    }
                  }}
                />
              </div>
            ) : (
              <>
                <Button variant="ghost" data-testid="button-sign-in" onClick={() => signIn?.({ redirectUrl: "/" })}>
                  Sign In
                </Button>
                <Button data-testid="button-sign-up" onClick={() => signUp?.({ redirectUrl: "/" })}>
                  Sign Up
                </Button>
              </>
            )}

            {/* Mobile Menu */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <i className="fas fa-bars"></i>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-chef-orange rounded-md flex items-center justify-center">
                      <i className="fas fa-utensils text-white text-xs"></i>
                    </div>
                    <span>ChefGPT</span>
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-4">
                  {(isAuthenticated ? dashboardItems : featureItems).map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className="flex items-center space-x-3 text-gray-700 hover:text-chef-orange font-medium p-2 rounded-lg hover:bg-gray-50"
                    >
                      <span>{item.icon}</span>
                      <span>{item.label}</span>
                    </Link>
                  ))}
                  {!isAuthenticated && (
                    <>
                      <Link href="/pricing" className="flex items-center space-x-3 text-gray-700 hover:text-chef-orange font-medium p-2 rounded-lg hover:bg-gray-50">
                        <span>💰</span>
                        <span>Pricing</span>
                      </Link>
                      <div className="pt-4 space-y-2">
                        <Button variant="outline" className="w-full" data-testid="button-sign-in-mobile" onClick={() => signIn?.({ redirectUrl: "/" })}>
                          Sign In
                        </Button>
                        <Button className="w-full" data-testid="button-sign-up-mobile" onClick={() => signUp?.({ redirectUrl: "/" })}>
                          Sign Up
                        </Button>
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
