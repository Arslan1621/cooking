import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Landing() {
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
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "ChefGPT has revolutionized how we do meal prep at home!"
    },
    {
      name: "Ethan K.",
      avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "Incredible! I've discovered so many new recipes."
    },
    {
      name: "Olivia S.",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b332b675?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100",
      quote: "It's like having a personal chef in your pocket."
    }
  ];

  const features = [
    {
      icon: "📷",
      title: "Track Calories in a Snap",
      description: "Just snap a photo of your meal—ChefGPT's AI instantly detects ingredients, estimates nutrition, and logs everything for you.",
      image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
      icon: "🪄",
      title: "Get Recipes in One Tap",
      description: "Open ChefGPT, list your ingredients or search any dish, and let our AI do the rest. No endless scrolling—just quick, personalized recipes.",
      image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
      icon: "📅",
      title: "Smart Meal Plans, Made Instantly", 
      description: "ChefGPT builds your entire week's meals based on your preferences, goals, and dietary needs—no spreadsheets or guesswork required.",
      image: "https://images.unsplash.com/photo-1484659619207-9165d119dafe?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    },
    {
      icon: "📦",
      title: "Real-Time Pantry Tracking",
      description: "Add ingredients as you shop or cook, and ChefGPT keeps your pantry organized. It learns what you have and suggests recipes.",
      image: "https://images.unsplash.com/photo-1586201375761-83865001e738?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="pt-24 pb-16 bg-gradient-to-br from-chef-gray to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="lg:pr-8 animate-fadeIn">
              <div className="mb-6">
                <Badge className="bg-chef-orange/10 text-chef-orange px-4 py-2 rounded-full text-sm font-medium mb-4 border-chef-orange/20">
                  Meet ChefGPT 👋
                </Badge>
                <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                  Cook Anything.<br />
                  Track Everything.<br />
                  <span className="text-chef-orange">Achieve Any Goal.</span>
                </h1>
                <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                  Achieve your health goals faster with ChefGPT. AI-powered recipes and calorie tracking help you stay on track and see results—up to 4x quicker. <strong>1,000,000+ dinners saved so far.</strong>
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 mb-8">
                <a href="#" className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <i className="fab fa-apple mr-2"></i>
                  Download on the App Store
                </a>
                <a href="#" className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
                  <i className="fab fa-google-play mr-2"></i>
                  Get it on Google Play
                </a>
              </div>
              
              <Button size="lg" className="bg-chef-orange text-white px-8 py-4 text-lg font-semibold hover:bg-chef-orange/90" asChild>
                <a href="/api/login">
                  Get Started for free
                </a>
              </Button>
              <p className="text-gray-500 mt-2">No credit-card required</p>
            </div>
            
            <div className="relative animate-fadeIn">
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
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-fire text-chef-orange text-2xl mr-2"></i>
              <Badge variant="outline" className="text-chef-orange font-semibold uppercase tracking-wide">
                Features
              </Badge>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Built to help you achieve your Goals.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you're tracking macros or just trying to eat better, ChefGPT brings structure to your plate, with the power of AI.
            </p>
          </div>

          <div className="space-y-24">
            {features.map((feature, index) => (
              <div key={index} className={`grid lg:grid-cols-2 gap-16 items-center ${index % 2 === 1 ? 'lg:grid-flow-col-dense' : ''}`}>
                <div className={index % 2 === 1 ? 'lg:col-start-2' : ''}>
                  <div className="flex items-center mb-6">
                    <span className="text-3xl mr-3">{feature.icon}</span>
                    <h3 className="text-3xl font-bold text-gray-900">{feature.title}</h3>
                  </div>
                  <p className="text-lg text-gray-600 leading-relaxed mb-8">
                    {feature.description}
                  </p>
                  {index === 1 && (
                    <div className="flex flex-wrap gap-3">
                      <Link href="/pantry-chef">
                        <Button className="bg-chef-orange hover:bg-chef-orange/90">
                          Discover PantryChef
                        </Button>
                      </Link>
                      <Link href="/master-chef">
                        <Button variant="outline">Discover MasterChef</Button>
                      </Link>
                      <Link href="/macros-chef">
                        <Button variant="outline">Discover MacrosChef</Button>
                      </Link>
                      <Link href="/mixology">
                        <Button variant="outline">Discover MixologyMaestro</Button>
                      </Link>
                    </div>
                  )}
                  {index === 2 && (
                    <Link href="/meal-plan-chef">
                      <Button className="bg-chef-orange hover:bg-chef-orange/90">
                        Discover MealPlanChef
                      </Button>
                    </Link>
                  )}
                </div>
                <div className={index % 2 === 1 ? 'lg:col-start-1' : ''}>
                  <img 
                    src={feature.image} 
                    alt={feature.title}
                    className="rounded-2xl shadow-lg w-full"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-chef-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-users text-chef-orange text-2xl mr-2"></i>
              <Badge variant="outline" className="text-chef-orange font-semibold uppercase tracking-wide">
                Testimonials
              </Badge>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Loved by more than 1 Million Home Cooks
            </h2>
            <p className="text-xl text-gray-600">Hear directly from our customers.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="testimonial-card shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    <img 
                      src={testimonial.avatar} 
                      alt={`${testimonial.name} avatar`} 
                      className="w-12 h-12 rounded-full mr-3 object-cover"
                    />
                    <div>
                      <p className="font-semibold text-gray-900">{testimonial.name}</p>
                    </div>
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

      {/* Pricing Preview */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center mb-4">
              <i className="fas fa-credit-card text-chef-orange text-2xl mr-2"></i>
              <Badge variant="outline" className="text-chef-orange font-semibold uppercase tracking-wide">
                Pricing
              </Badge>
            </div>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Big Results, Small Price
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore all the core features at no cost. Upgrade to unlock advanced tools, unlimited AI recipes, and AI calorie tracking.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="pricing-card border-2 border-gray-200">
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Basic</CardTitle>
                <Badge className="bg-green-100 text-green-800 mx-auto">FREE FOREVER</Badge>
                <p className="text-gray-600 text-sm">No Credit Card Required</p>
                <div className="py-4">
                  <span className="text-5xl font-bold text-gray-900">$0</span>
                  <span className="text-gray-600">/Monthly</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "Manual Calorie Tracking",
                    "10 Monthly Generations", 
                    "Meal Plans up to 3 days",
                    "Save 5 Recipes in the Cookbook",
                    "Save 5 Recipes in the Shopping List"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-3"></i>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full" variant="outline" asChild>
                  <a href="/api/login">Get Started</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="pricing-card border-2 border-chef-orange relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-chef-orange text-white">3 DAYS TRIAL</Badge>
              </div>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold">Pro</CardTitle>
                <p className="text-gray-600">For those who need a Digital Personal Chef</p>
                <div className="py-4">
                  <span className="text-5xl font-bold text-gray-900">$12.99</span>
                  <span className="text-gray-600">/Monthly</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {[
                    "AI Calories Tracking",
                    "Unlimited Generations",
                    "History mode", 
                    "Meal Plans up to 30 days",
                    "Daily Meal Plan Tracking",
                    "Unlimited Cookbook & Shopping Lists",
                    "No Ads"
                  ].map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <i className="fas fa-check text-green-500 mr-3"></i>
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-chef-orange hover:bg-chef-orange/90" asChild>
                  <a href="/api/login">Get Started</a>
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-12">
            <Link href="/pricing">
              <Button variant="outline" size="lg">
                View Full Pricing Details
              </Button>
            </Link>
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
            <a href="#" className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <i className="fab fa-apple mr-2"></i>
              Download on the App Store
            </a>
            <a href="#" className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors">
              <i className="fab fa-google-play mr-2"></i>
              Get it on Google Play
            </a>
          </div>
          
          <Button size="lg" className="bg-chef-orange text-white px-8 py-4 text-lg font-semibold hover:bg-chef-orange/90" asChild>
            <a href="/api/login">
              Get Started for free
            </a>
          </Button>
          <p className="text-gray-500 mt-2">No credit-card required</p>
        </div>
      </section>
    </div>
  );
}
