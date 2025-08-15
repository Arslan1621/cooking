import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";

export default function Pricing() {
  const [isYearly, setIsYearly] = useState(false);
  const { isAuthenticated, user } = useAuth();

  const plans = [
    {
      name: "Basic",
      subtitle: "FREE FOREVER",
      price: { monthly: 0, yearly: 0 },
      description: "No Credit Card Required",
      features: [
        "Manual Calorie Tracking",
        "10 Monthly Generations",
        "Meal Plans up to 3 days",
        "Save 5 Recipes in the Cookbook",
        "Save 5 Items in Shopping List",
        "Basic Recipe Search",
        "Community Support"
      ],
      popular: false,
      buttonText: "Get Started",
      buttonVariant: "outline" as const,
    },
    {
      name: "Pro",
      subtitle: "3 DAYS TRIAL",
      price: { monthly: 12.99, yearly: 129.99 },
      description: "For those who need a Digital Personal Chef",
      features: [
        "Everything in Basic, plus:",
        "AI Calorie Tracking with Photo Analysis",
        "Unlimited Recipe Generations",
        "History Mode & Recipe Variations",
        "Meal Plans up to 30 days",
        "Daily Meal Plan Tracking",
        "Unlimited Cookbook & Shopping Lists",
        "Advanced Macro Tracking",
        "Export to MyFitnessPal",
        "Priority Email Support",
        "No Advertisements",
        "Early Access to New Features"
      ],
      popular: true,
      buttonText: "Start Free Trial",
      buttonVariant: "default" as const,
    }
  ];

  const faqItems = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes! You can upgrade, downgrade, or cancel your subscription at any time. Changes take effect immediately, and we'll prorate any charges."
    },
    {
      question: "What happens after my free trial ends?",
      answer: "After your 3-day free trial, you'll be charged the monthly rate. You can cancel anytime during the trial with no charges."
    },
    {
      question: "How accurate is the AI calorie tracking?",
      answer: "Our AI achieves 85-95% accuracy in identifying foods and estimating calories. Results improve with clearer photos and common foods."
    },
    {
      question: "Can I use ChefGPT offline?",
      answer: "Some features work offline, like viewing saved recipes. However, AI generation and photo analysis require an internet connection."
    },
    {
      question: "Do you offer student discounts?",
      answer: "Yes! Students get 50% off Pro plans. Contact support with valid student ID for your discount code."
    },
    {
      question: "Is my data secure?",
      answer: "Absolutely. We use bank-level encryption and never sell your personal data. Your recipes and meal logs are private and secure."
    }
  ];

  return (
    <div className="min-h-screen pt-20 bg-chef-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="text-center mb-16">
          <Badge className="bg-chef-orange/10 text-chef-orange mb-4 text-lg px-4 py-2">
            💰 Pricing
          </Badge>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Big Results, <span className="text-chef-orange">Small Price</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Explore all the core features at no cost. Upgrade to unlock advanced tools, unlimited AI recipes, and AI calorie tracking.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4">
            <span className={`font-medium ${!isYearly ? 'text-chef-orange' : 'text-gray-500'}`}>
              Monthly
            </span>
            <Switch
              checked={isYearly}
              onCheckedChange={setIsYearly}
              className="data-[state=checked]:bg-chef-orange"
            />
            <span className={`font-medium ${isYearly ? 'text-chef-orange' : 'text-gray-500'}`}>
              Yearly
            </span>
            {isYearly && (
              <Badge className="bg-green-100 text-green-800 ml-2">
                Save 2 months!
              </Badge>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {plans.map((plan, index) => (
            <Card 
              key={plan.name} 
              className={`pricing-card relative ${
                plan.popular 
                  ? 'border-2 border-chef-orange ring-2 ring-chef-orange/20' 
                  : 'border-2 border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-chef-orange text-white text-sm px-4 py-1">
                    MOST POPULAR
                  </Badge>
                </div>
              )}
              
              <CardHeader className="text-center pb-2">
                <div className="space-y-2">
                  <CardTitle className="text-2xl font-bold">{plan.name}</CardTitle>
                  <Badge 
                    variant="outline" 
                    className={plan.name === 'Basic' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-chef-orange/10 text-chef-orange border-chef-orange/20'}
                  >
                    {plan.subtitle}
                  </Badge>
                  <p className="text-gray-600 text-sm">{plan.description}</p>
                </div>
                
                <div className="py-6">
                  <div className="flex items-baseline justify-center">
                    <span className="text-5xl font-bold text-gray-900">
                      ${isYearly ? plan.price.yearly : plan.price.monthly}
                    </span>
                    <span className="text-gray-600 ml-1">
                      /{isYearly ? 'year' : 'month'}
                    </span>
                  </div>
                  {isYearly && plan.price.yearly > 0 && (
                    <p className="text-sm text-green-600 mt-1">
                      ${((plan.price.monthly * 12) - plan.price.yearly).toFixed(2)} savings per year
                    </p>
                  )}
                </div>
              </CardHeader>
              
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <i className="fas fa-check text-green-500 mr-3 mt-0.5"></i>
                      <span className={`text-gray-700 ${feature.startsWith('Everything in') ? 'font-medium' : ''}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>
                
                <Button 
                  className={`w-full py-3 text-lg font-semibold ${
                    plan.popular 
                      ? 'bg-chef-orange hover:bg-chef-orange/90 text-white' 
                      : 'border-2 border-gray-200 hover:bg-gray-50'
                  }`}
                  variant={plan.buttonVariant}
                  asChild
                >
                  <a href={isAuthenticated ? (user?.subscriptionTier === 'pro' ? '#' : '/api/login') : '/api/login'}>
                    {user?.subscriptionTier === 'pro' && plan.name === 'Pro' ? (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Current Plan
                      </>
                    ) : (
                      plan.buttonText
                    )}
                  </a>
                </Button>
                
                {plan.name === 'Pro' && (
                  <p className="text-xs text-gray-500 text-center mt-2">
                    Cancel anytime. No questions asked.
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Feature Comparison */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Compare Features
          </h2>
          
          <div className="overflow-x-auto">
            <table className="w-full bg-white rounded-lg shadow-sm border border-gray-200">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Basic</th>
                  <th className="text-center p-4 font-semibold bg-chef-orange/5">Pro</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {[
                  { feature: "Manual Calorie Tracking", basic: true, pro: true },
                  { feature: "AI Photo Calorie Analysis", basic: false, pro: true },
                  { feature: "Recipe Generations per Month", basic: "10", pro: "Unlimited" },
                  { feature: "Meal Plan Duration", basic: "3 days", pro: "30 days" },
                  { feature: "Saved Recipes", basic: "5", pro: "Unlimited" },
                  { feature: "Shopping Lists", basic: "5 items", pro: "Unlimited" },
                  { feature: "Advanced Macro Tracking", basic: false, pro: true },
                  { feature: "Export to MyFitnessPal", basic: false, pro: true },
                  { feature: "Priority Support", basic: false, pro: true },
                  { feature: "No Advertisements", basic: false, pro: true },
                ].map((row, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="p-4 font-medium">{row.feature}</td>
                    <td className="p-4 text-center">
                      {typeof row.basic === 'boolean' ? (
                        row.basic ? (
                          <i className="fas fa-check text-green-500"></i>
                        ) : (
                          <i className="fas fa-times text-gray-400"></i>
                        )
                      ) : (
                        row.basic
                      )}
                    </td>
                    <td className="p-4 text-center bg-chef-orange/5">
                      {typeof row.pro === 'boolean' ? (
                        row.pro ? (
                          <i className="fas fa-check text-chef-orange"></i>
                        ) : (
                          <i className="fas fa-times text-gray-400"></i>
                        )
                      ) : (
                        <span className="font-medium text-chef-orange">{row.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">
            Frequently Asked Questions
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {faqItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <h3 className="font-bold text-lg text-gray-900 mb-3">
                    {item.question}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {item.answer}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Money Back Guarantee */}
        <div className="text-center bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl p-8 border border-green-200 mb-16">
          <div className="max-w-3xl mx-auto">
            <div className="text-4xl mb-4">💚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              30-Day Money-Back Guarantee
            </h2>
            <p className="text-gray-600 leading-relaxed">
              Try ChefGPT Pro risk-free for 30 days. If you're not completely satisfied with your results, 
              we'll refund your money, no questions asked. We're confident you'll love cooking with AI!
            </p>
          </div>
        </div>

        {/* Final CTA */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Ready to Transform Your Cooking?
          </h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button size="lg" className="bg-chef-orange hover:bg-chef-orange/90 px-8 py-4 text-lg" asChild>
              <a href="/api/login">
                Start Free Trial
              </a>
            </Button>
            <p className="text-gray-500 text-sm">
              No credit card required • Cancel anytime
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
