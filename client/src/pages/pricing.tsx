import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Check, Star, Zap, Crown } from "lucide-react";

const basicFeatures = [
  "Manual Calorie Tracking",
  "10 Monthly AI Recipe Generations",
  "Meal Plans up to 3 days",
  "Save 5 Recipes in the Cookbook",
  "Save 5 Items in Shopping Lists",
  "Basic Recipe Search",
  "Community Support"
];

const proFeatures = [
  "AI-Powered Photo Calorie Tracking",
  "Unlimited AI Recipe Generations",
  "Unlimited Meal Plans (up to 30 days)",
  "Recipe History & Analytics",
  "Daily Meal Plan Tracking",
  "Unlimited Cookbook & Shopping Lists",
  "Advanced Recipe Filters",
  "Priority Customer Support",
  "Export Recipes & Meal Plans",
  "No Advertisements",
  "Early Access to New Features"
];

const monthlyPricing = {
  basic: { price: 0, period: "forever" },
  pro: { price: 12.99, period: "monthly" }
};

const yearlyPricing = {
  basic: { price: 0, period: "forever" },
  pro: { price: 8.99, period: "monthly", originalPrice: 12.99, savings: "Save 31%" }
};

export default function Pricing() {
  return (
    <div className="min-h-screen bg-white">
      <div className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="bg-chef-orange/10 text-chef-orange hover:bg-chef-orange/20 mb-4">
              💳 Pricing
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Big Results, Small Price
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore all the core features at no cost. Upgrade to unlock advanced tools, unlimited AI recipes, and AI calorie tracking.
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center mb-12">
            <Tabs defaultValue="monthly" className="w-full max-w-md">
              <TabsList className="grid w-full grid-cols-2 bg-chef-gray">
                <TabsTrigger value="monthly" className="data-[state=active]:bg-chef-orange data-[state=active]:text-white">
                  Monthly
                </TabsTrigger>
                <TabsTrigger value="yearly" className="data-[state=active]:bg-chef-orange data-[state=active]:text-white">
                  Yearly
                  <Badge className="ml-2 bg-green-500 text-white text-xs">Save 31%</Badge>
                </TabsTrigger>
              </TabsList>

              {/* Monthly Pricing */}
              <TabsContent value="monthly" className="mt-8">
                <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Basic Plan */}
                  <Card className="border-2 border-gray-200 relative h-full flex flex-col">
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                        <Star className="w-8 h-8 text-gray-600" />
                      </div>
                      <CardTitle className="text-2xl">Basic</CardTitle>
                      <CardDescription className="text-chef-orange font-semibold">
                        FREE FOREVER
                      </CardDescription>
                      <p className="text-gray-600 text-sm">No Credit Card Required</p>
                      <div className="mt-4">
                        <span className="text-5xl font-bold text-gray-900">${monthlyPricing.basic.price}</span>
                        <span className="text-gray-600 ml-2">/Monthly</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-8 flex-1">
                        {basicFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="text-green-500 mr-3 h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-chef-orange hover:text-white hover:border-chef-orange mt-auto"
                        onClick={() => window.location.href = "/api/login"}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pro Plan */}
                  <Card className="border-2 border-chef-orange relative h-full flex flex-col pt-6">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-chef-orange text-white px-4 py-1">
                        3 DAYS FREE TRIAL
                      </Badge>
                    </div>
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-chef-orange/10 rounded-full">
                        <Crown className="w-8 h-8 text-chef-orange" />
                      </div>
                      <CardTitle className="text-2xl">Pro</CardTitle>
                      <CardDescription>
                        For those who need a Digital Personal Chef
                      </CardDescription>
                      <div className="mt-4">
                        <span className="text-5xl font-bold text-gray-900">${monthlyPricing.pro.price}</span>
                        <span className="text-gray-600 ml-2">/Monthly</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-8 flex-1">
                        {proFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="text-green-500 mr-3 h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full bg-chef-orange hover:bg-chef-orange/90 mt-auto"
                        onClick={() => window.location.href = "/api/login"}
                      >
                        Start Free Trial
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Yearly Pricing */}
              <TabsContent value="yearly" className="mt-8">
                <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                  {/* Basic Plan */}
                  <Card className="border-2 border-gray-200 relative h-full flex flex-col">
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full">
                        <Star className="w-8 h-8 text-gray-600" />
                      </div>
                      <CardTitle className="text-2xl">Basic</CardTitle>
                      <CardDescription className="text-chef-orange font-semibold">
                        FREE FOREVER
                      </CardDescription>
                      <p className="text-gray-600 text-sm">No Credit Card Required</p>
                      <div className="mt-4">
                        <span className="text-5xl font-bold text-gray-900">${yearlyPricing.basic.price}</span>
                        <span className="text-gray-600 ml-2">/Monthly</span>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-8 flex-1">
                        {basicFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="text-green-500 mr-3 h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        variant="outline" 
                        className="w-full hover:bg-chef-orange hover:text-white hover:border-chef-orange mt-auto"
                        onClick={() => window.location.href = "/api/login"}
                      >
                        Get Started
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Pro Plan */}
                  <Card className="border-2 border-chef-orange relative h-full flex flex-col pt-6">
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500 text-white px-4 py-1">
                        {yearlyPricing.pro.savings}
                      </Badge>
                    </div>
                    <CardHeader className="text-center">
                      <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-chef-orange/10 rounded-full">
                        <Crown className="w-8 h-8 text-chef-orange" />
                      </div>
                      <CardTitle className="text-2xl">Pro</CardTitle>
                      <CardDescription>
                        For those who need a Digital Personal Chef
                      </CardDescription>
                      <div className="mt-4">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-5xl font-bold text-gray-900">${yearlyPricing.pro.price}</span>
                          <div className="text-left">
                            <div className="text-gray-600">/Monthly</div>
                            <div className="text-sm text-gray-500 line-through">${yearlyPricing.pro.originalPrice}</div>
                          </div>
                        </div>
                        <p className="text-sm text-green-600 mt-2">Billed annually ($107.88/year)</p>
                      </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col">
                      <ul className="space-y-3 mb-8 flex-1">
                        {proFeatures.map((feature, index) => (
                          <li key={index} className="flex items-start">
                            <Check className="text-green-500 mr-3 h-4 w-4 mt-0.5 flex-shrink-0" />
                            <span className="text-gray-700 text-sm">{feature}</span>
                          </li>
                        ))}
                      </ul>
                      <Button 
                        className="w-full bg-chef-orange hover:bg-chef-orange/90 mt-auto"
                        onClick={() => window.location.href = "/api/login"}
                      >
                        Start Free Trial
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Feature Comparison */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Feature Comparison
            </h2>
            
            <Card className="max-w-4xl mx-auto">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-chef-gray">
                      <tr>
                        <th className="text-left p-4 font-semibold">Features</th>
                        <th className="text-center p-4 font-semibold">Basic</th>
                        <th className="text-center p-4 font-semibold">Pro</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      <tr>
                        <td className="p-4">AI Recipe Generations</td>
                        <td className="text-center p-4">10/month</td>
                        <td className="text-center p-4">
                          <span className="text-green-600 font-semibold">Unlimited</span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4">Meal Plan Duration</td>
                        <td className="text-center p-4">3 days</td>
                        <td className="text-center p-4">
                          <span className="text-green-600 font-semibold">Up to 30 days</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">Saved Recipes</td>
                        <td className="text-center p-4">5 recipes</td>
                        <td className="text-center p-4">
                          <span className="text-green-600 font-semibold">Unlimited</span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4">AI Photo Calorie Tracking</td>
                        <td className="text-center p-4">
                          <span className="text-red-500">✗</span>
                        </td>
                        <td className="text-center p-4">
                          <span className="text-green-600">✓</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">Recipe Analytics</td>
                        <td className="text-center p-4">
                          <span className="text-red-500">✗</span>
                        </td>
                        <td className="text-center p-4">
                          <span className="text-green-600">✓</span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4">Priority Support</td>
                        <td className="text-center p-4">
                          <span className="text-red-500">✗</span>
                        </td>
                        <td className="text-center p-4">
                          <span className="text-green-600">✓</span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-4">Export Functionality</td>
                        <td className="text-center p-4">
                          <span className="text-red-500">✗</span>
                        </td>
                        <td className="text-center p-4">
                          <span className="text-green-600">✓</span>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="p-4">Advertisements</td>
                        <td className="text-center p-4">
                          <span className="text-red-500">Yes</span>
                        </td>
                        <td className="text-center p-4">
                          <span className="text-green-600">Ad-free</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mt-20">
            <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
              Frequently Asked Questions
            </h2>
            
            <div className="max-w-3xl mx-auto space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Is the free plan really free forever?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes! Our Basic plan is completely free with no time limits. You can use core features like manual calorie tracking and limited AI recipe generation forever without any charges.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What happens during the 3-day free trial?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    You get full access to all Pro features including unlimited AI recipe generation, photo calorie tracking, and extended meal plans. No payment required upfront, and you can cancel anytime.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Can I cancel my subscription anytime?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Absolutely! You can cancel your Pro subscription at any time. Your access will continue until the end of your billing period, and you can always downgrade to the free Basic plan.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do you offer student discounts?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">
                    Yes! We offer a 50% discount for students with valid educational email addresses. Contact our support team to get your student discount activated.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Final CTA */}
          <div className="mt-20 text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-chef-orange to-chef-red text-white">
              <CardContent className="p-8">
                <h3 className="text-2xl font-bold mb-4">Ready to start cooking smarter?</h3>
                <p className="text-lg mb-6 opacity-90">
                  Join over 1 million home cooks who are already using ChefGPT to create amazing meals.
                </p>
                <Button 
                  size="lg" 
                  variant="secondary"
                  className="bg-white text-chef-orange hover:bg-gray-100"
                  onClick={() => window.location.href = "/api/login"}
                >
                  Start Your Free Trial
                </Button>
                <p className="text-sm mt-4 opacity-75">No credit card required</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
