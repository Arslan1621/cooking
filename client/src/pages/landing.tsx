import Navigation from "@/components/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Utensils, 
  Camera, 
  Calendar, 
  Package, 
  Sparkles,
  Users,
  CreditCard,
  Check,
  Flame
} from "lucide-react";

export default function Landing() {
  const handleSignUp = () => {
    window.location.href = '/api/login';
  };

  const testimonials = [
    {
      name: "Zaky M.",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "No more wasting time in the kitchen."
    },
    {
      name: "Gideon S.W.",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "My wife and sister in law loveeeee ChefGPT!"
    },
    {
      name: "Joe D.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "Now this is a good use of AI!"
    },
    {
      name: "Mia T.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b5bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "ChefGPT has revolutionized how we do meal prep at home!"
    },
    {
      name: "Ethan K.",
      avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "Incredible! I've discovered so many new recipes."
    },
    {
      name: "Olivia S.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "It's like having a personal chef in your pocket."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-gray-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:pr-8">
              <div className="mb-6">
                <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange hover:bg-chef-orange/10 mb-4">
                  Meet ChefGPT 👋
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Cook Anything.<br />
                  Track Everything.<br />
                  Achieve Any Goal.
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Achieve your health goals faster with ChefGPT. AI-powered recipes and calorie tracking help you stay on track and see results—up to 4x quicker. <strong>1,000,000+ dinners saved so far.</strong>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 border-black"
                >
                  📱 Download on the App Store
                </Button>
                <Button 
                  variant="outline" 
                  size="lg"
                  className="bg-black text-white hover:bg-gray-800 border-black"
                >
                  📱 Get it on Google Play
                </Button>
              </div>
              
              <div className="space-y-2">
                <Button size="lg" className="bg-chef-orange hover:bg-chef-orange/90" onClick={handleSignUp}>
                  Get Started for free
                </Button>
                <p className="text-gray-500 text-sm">No credit-card required</p>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="ChefGPT mobile app interface" 
                className="rounded-2xl shadow-2xl w-full" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Flame className="h-6 w-6 text-chef-orange mr-2" />
              <span className="text-chef-orange font-semibold uppercase tracking-wide">Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built to help you achieve your Goals.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're tracking macros or just trying to eat better, ChefGPT brings structure to your plate, with the power of AI.
            </p>
          </div>

          {/* Feature 1: Calorie Tracking */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="flex items-center mb-6">
                <Camera className="h-8 w-8 text-chef-orange mr-3" />
                <h3 className="text-3xl font-bold text-gray-900">Track Calories in a Snap</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Just snap a photo of your meal—ChefGPT's AI instantly detects ingredients, estimates nutrition, and logs everything for you. No more manual input. Just eat, shoot, and stay on track.
              </p>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="AI food photo analysis interface" 
                className="rounded-2xl shadow-lg" 
              />
            </div>
          </div>

          {/* Feature 2: Recipe Generation */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div className="lg:order-2">
              <div className="flex items-center mb-6">
                <Sparkles className="h-8 w-8 text-chef-orange mr-3" />
                <h3 className="text-3xl font-bold text-gray-900">Get Recipes in One Tap</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Open ChefGPT, list your ingredients or search any dish, and let our AI do the rest. No endless scrolling—just quick, personalized recipes you'll actually want to cook.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button className="bg-chef-orange hover:bg-chef-orange/90">
                  Discover PantryChef
                </Button>
                <Button variant="outline">
                  Discover MasterChef
                </Button>
                <Button variant="outline">
                  Discover MacrosChef
                </Button>
                <Button variant="outline">
                  Discover MixologyMaestro
                </Button>
              </div>
            </div>
            <div className="lg:order-1 relative">
              <img 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Recipe generation interface" 
                className="rounded-2xl shadow-lg" 
              />
            </div>
          </div>

          {/* Feature 3: Meal Planning */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-24">
            <div>
              <div className="flex items-center mb-6">
                <Calendar className="h-8 w-8 text-chef-orange mr-3" />
                <h3 className="text-3xl font-bold text-gray-900">Smart Meal Plans, Made Instantly</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                ChefGPT builds your entire week's meals based on your preferences, goals, and dietary needs—no spreadsheets or guesswork required. You'll even get a ready-to-go shopping list.
              </p>
              <Button className="bg-chef-orange hover:bg-chef-orange/90">
                Discover MealPlanChef
              </Button>
            </div>
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1484659619207-9165d119dafe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Weekly meal planning interface" 
                className="rounded-2xl shadow-lg" 
              />
            </div>
          </div>

          {/* Feature 4: Pantry Tracking */}
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="lg:order-2">
              <div className="flex items-center mb-6">
                <Package className="h-8 w-8 text-chef-orange mr-3" />
                <h3 className="text-3xl font-bold text-gray-900">Real-Time Pantry Tracking</h3>
              </div>
              <p className="text-lg text-gray-600 leading-relaxed">
                Add ingredients as you shop or cook, and ChefGPT keeps your pantry organized. It learns what you have and suggests recipes to help you use it all—before anything goes to waste.
              </p>
            </div>
            <div className="lg:order-1 relative">
              <img 
                src="https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
                alt="Pantry tracking interface" 
                className="rounded-2xl shadow-lg" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-6 w-6 text-chef-orange mr-2" />
              <span className="text-chef-orange font-semibold uppercase tracking-wide">Testimonials</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by more than 1 Million Home Cooks
            </h2>
            <p className="text-xl text-gray-600">Hear directly from our customers.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <Avatar className="h-12 w-12 mr-3">
                      <AvatarImage src={testimonial.avatar} alt={testimonial.name} />
                      <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <p className="font-semibold text-gray-900">{testimonial.name}</p>
                  </div>
                  <blockquote className="text-gray-600 italic">
                    "{testimonial.quote}"
                  </blockquote>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="h-6 w-6 text-chef-orange mr-2" />
              <span className="text-chef-orange font-semibold uppercase tracking-wide">Pricing</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Big Results, Small Price
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore all the core features at no cost. Upgrade to unlock advanced tools, unlimited AI recipes, and AI calorie tracking.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Basic Plan */}
            <Card className="border-2 border-gray-200">
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Basic</h3>
                  <p className="text-chef-orange font-semibold">FREE FOREVER</p>
                  <p className="text-gray-600 text-sm">No Credit Card Required</p>
                </div>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/Monthly</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Manual Calorie Tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">10 Monthly Generations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Meal Plans up to 3 days</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Save 5 Recipes in the Cookbook</span>
                  </li>
                </ul>
                
                <Button variant="outline" size="lg" className="w-full" onClick={handleSignUp}>
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-chef-orange relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-chef-orange">3 DAYS TRIAL</Badge>
              </div>
              
              <CardContent className="p-8">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">Pro</h3>
                  <p className="text-gray-600">For those who need a Digital Personal Chef</p>
                </div>
                
                <div className="mb-6">
                  <span className="text-5xl font-bold text-gray-900">$12.99</span>
                  <span className="text-gray-600">/Monthly</span>
                </div>
                
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">AI Calories Tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited Generations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">History mode</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Meal Plans up to 30 days</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">Unlimited Cookbook & Shopping Lists</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span className="text-gray-700">No Ads</span>
                  </li>
                </ul>
                
                <Button size="lg" className="w-full bg-chef-orange hover:bg-chef-orange/90" onClick={handleSignUp}>
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            The perfect companion for your Kitchen.
          </h2>
          <h3 className="text-3xl font-bold text-gray-900 mb-12">
            Sign up for free, today.
          </h3>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button variant="outline" size="lg" className="bg-black text-white hover:bg-gray-800 border-black">
              📱 Download on the App Store
            </Button>
            <Button variant="outline" size="lg" className="bg-black text-white hover:bg-gray-800 border-black">
              📱 Get it on Google Play
            </Button>
          </div>
          
          <div className="space-y-2">
            <Button size="lg" className="bg-chef-orange hover:bg-chef-orange/90" onClick={handleSignUp}>
              Get Started for free
            </Button>
            <p className="text-gray-500">No credit-card required</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-chef-orange rounded-lg flex items-center justify-center">
                  <Utensils className="h-4 w-4 text-white" />
                </div>
                <span className="text-xl font-bold">ChefGPT</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered cooking companion that helps you create delicious meals and achieve your health goals faster.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>PantryChef</li>
                <li>MealPlanChef</li>
                <li>MasterChef</li>
                <li>MacrosChef</li>
                <li>MixologyMaestro</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li>About</li>
                <li>Blog</li>
                <li>FAQ</li>
                <li>Support</li>
                <li>Privacy Policy</li>
              </ul>
            </div>
          </div>
          
          <Separator className="my-8 bg-gray-800" />
          <div className="text-center text-gray-400">
            <p>&copy; 2024 ChefGPT. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
