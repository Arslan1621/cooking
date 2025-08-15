
import React from "react";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Simple Pricing
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose the plan that works best for you
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="border-2 border-gray-200">
              <CardHeader>
                <CardTitle className="text-2xl">Basic</CardTitle>
                <div className="text-chef-orange font-semibold">FREE FOREVER</div>
                <div className="text-5xl font-bold">$0<span className="text-lg text-gray-600">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Manual Calorie Tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>10 Monthly Generations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Meal Plans up to 3 days</span>
                  </li>
                </ul>
                <Button className="w-full">Get Started Free</Button>
              </CardContent>
            </Card>

            <Card className="border-2 border-chef-orange">
              <CardHeader>
                <CardTitle className="text-2xl">Pro</CardTitle>
                <div className="text-chef-orange font-semibold">MOST POPULAR</div>
                <div className="text-5xl font-bold">$9<span className="text-lg text-gray-600">/month</span></div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>AI Photo Calorie Tracking</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Unlimited AI Generations</span>
                  </li>
                  <li className="flex items-center">
                    <Check className="h-5 w-5 text-green-500 mr-3" />
                    <span>Advanced Meal Planning</span>
                  </li>
                </ul>
                <Button className="w-full bg-chef-orange hover:bg-chef-orange/90">Upgrade to Pro</Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
