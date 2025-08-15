import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Navbar from "@/components/layout/navbar";
import Footer from "@/components/layout/footer";
import { 
  Utensils, 
  Camera, 
  Calendar, 
  Package, 
  Star, 
  Check, 
  CreditCard,
  Users,
  Flame,
  ChefHat
} from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-white">
      <Navbar />
      
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-chef-gray to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:pr-8">
              <div className="mb-6">
                <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange hover:bg-chef-orange/20 mb-4">
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
                  className="inline-flex items-center justify-center bg-black text-white hover:bg-gray-800 border-black"
                  asChild
                >
                  <a href="#" className="px-6 py-3">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                    </svg>
                    Download on the App Store
                  </a>
                </Button>
                <Button 
                  variant="outline" 
                  className="inline-flex items-center justify-center bg-black text-white hover:bg-gray-800 border-black"
                  asChild
                >
                  <a href="#" className="px-6 py-3">
                    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                    </svg>
                    Get it on Google Play
                  </a>
                </Button>
              </div>
              
              <div className="flex flex-col gap-2">
                <Button 
                  size="lg" 
                  className="bg-chef-orange hover:bg-chef-orange/90 w-fit"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Get Started for free
                </Button>
                <p className="text-gray-500 text-sm">No credit-card required</p>
              </div>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                alt="ChefGPT mobile app interface" 
                className="rounded-2xl shadow-2xl w-full" 
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Flame className="text-chef-orange text-2xl mr-2" />
              <span className="text-chef-orange font-semibold uppercase tracking-wide">Features</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built to help you achieve your Goals.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're tracking macros or just trying to eat better, ChefGPT brings structure to your plate, with the power of AI.
            </p>
          </div>

          <div className="grid gap-16">
            {/* Feature 1: Calorie Tracking */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <Camera className="text-chef-orange text-2xl mr-3" />
                  <h3 className="text-3xl font-bold text-gray-900">Track Calories in a Snap</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Just snap a photo of your meal—ChefGPT's AI instantly detects ingredients, estimates nutrition, and logs everything for you. No more manual input. Just eat, shoot, and stay on track.
                </p>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="AI food photo analysis interface" 
                  className="rounded-2xl shadow-lg" 
                />
              </div>
            </div>

            {/* Feature 2: Recipe Generation */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <div className="flex items-center mb-6">
                  <ChefHat className="text-chef-orange text-2xl mr-3" />
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
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Recipe generation interface" 
                  className="rounded-2xl shadow-lg" 
                />
              </div>
            </div>

            {/* Feature 3: Meal Planning */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="flex items-center mb-6">
                  <Calendar className="text-chef-orange text-2xl mr-3" />
                  <h3 className="text-3xl font-bold text-gray-900">Smart Meal Plans, Made Instantly</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed mb-8">
                  ChefGPT builds your entire week's meals based on your preferences, goals, and dietary needs—no spreadsheets or guesswork required. You'll even get a ready-to-go shopping list, so you can spend less time planning and more time living.
                </p>
                <Button className="bg-chef-orange hover:bg-chef-orange/90">
                  Discover MealPlanChef
                </Button>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1484659619207-9165d119dafe?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Weekly meal planning interface" 
                  className="rounded-2xl shadow-lg" 
                />
              </div>
            </div>

            {/* Feature 4: Pantry Tracking */}
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="lg:order-2">
                <div className="flex items-center mb-6">
                  <Package className="text-chef-orange text-2xl mr-3" />
                  <h3 className="text-3xl font-bold text-gray-900">Real-Time Pantry Tracking</h3>
                </div>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Add ingredients as you shop or cook, and ChefGPT keeps your pantry organized. It learns what you have and suggests recipes to help you use it all—before anything goes to waste.
                </p>
              </div>
              <div className="lg:order-1 relative">
                <img 
                  src="https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
                  alt="Pantry tracking interface" 
                  className="rounded-2xl shadow-lg" 
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-chef-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <Users className="text-chef-orange text-2xl mr-2" />
              <span className="text-chef-orange font-semibold uppercase tracking-wide">Testimonials</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by more than 1 Million Home Cooks
            </h2>
            <p className="text-xl text-gray-600">Hear directly from our customers.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="bg-white shadow-lg">
                <CardHeader className="pb-2">
                  <div className="flex items-center">
                    <img 
                      src={testimonial.avatar} 
                      alt={`${testimonial.name} avatar`} 
                      className="w-12 h-12 rounded-full mr-3 object-cover" 
                    />
                    <div>
                      <CardTitle className="text-base">{testimonial.name}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
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
      <section id="pricing" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <CreditCard className="text-chef-orange text-2xl mr-2" />
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
            <Card className="border-2">
              <CardHeader>
                <CardTitle className="text-2xl">Basic</CardTitle>
                <CardDescription className="text-chef-orange font-semibold">
                  FREE FOREVER
                </CardDescription>
                <p className="text-gray-600 text-sm">No Credit Card Required</p>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/Monthly</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {basicFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="text-green-500 mr-3 h-4 w-4" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            {/* Pro Plan */}
            <Card className="border-2 border-chef-orange relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-chef-orange text-white">3 DAYS TRIAL</Badge>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <CardDescription>
                  For those who need a Digital Personal Chef
                </CardDescription>
                <div className="mt-4">
                  <span className="text-5xl font-bold text-gray-900">$12.99</span>
                  <span className="text-gray-600">/Monthly</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="text-green-500 mr-3 h-4 w-4" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className="w-full bg-chef-orange hover:bg-chef-orange/90"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-chef-gray">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            The perfect companion for your Kitchen.
          </h2>
          <h3 className="text-3xl font-bold text-gray-900 mb-12">
            Sign up for free, today.
          </h3>
          
          <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
            <Button 
              variant="outline" 
              className="bg-black text-white hover:bg-gray-800 border-black"
              asChild
            >
              <a href="#">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Download on the App Store
              </a>
            </Button>
            <Button 
              variant="outline" 
              className="bg-black text-white hover:bg-gray-800 border-black"
              asChild
            >
              <a href="#">
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                </svg>
                Get it on Google Play
              </a>
            </Button>
          </div>
          
          <Button 
            size="lg" 
            className="bg-chef-orange hover:bg-chef-orange/90"
            onClick={() => window.location.href = "/api/login"}
          >
            Get Started for free
          </Button>
          <p className="text-gray-500 mt-2">No credit-card required</p>
        </div>
      </section>

      <Footer />
    </div>
  );
}

const testimonials = [
  {
    name: "Zaky M.",
    quote: "No more wasting time in the kitchen.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Gideon S.W.",
    quote: "My wife and sister in law loveeeee ChefGPT!",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Joe D.",
    quote: "Now this is a good use of AI!",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Mia T.",
    quote: "ChefGPT has revolutionized how we do meal prep at home!",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Ethan K.",
    quote: "Incredible! I've discovered so many new recipes.",
    avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  },
  {
    name: "Olivia S.",
    quote: "It's like having a personal chef in your pocket.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=100&h=100"
  }
];

const basicFeatures = [
  "Manual Calorie Tracking",
  "10 Monthly Generations",
  "Meal Plans up to 3 days",
  "Save 5 Recipes in the Cookbook",
  "Save 5 Recipes in the Shopping List"
];

const proFeatures = [
  "AI Calories Tracking",
  "Unlimited Generations",
  "History mode",
  "Meal Plans up to 30 days",
  "Daily Meal Plan Tracking",
  "Unlimited Cookbook & Shopping Lists",
  "No Ads"
];
