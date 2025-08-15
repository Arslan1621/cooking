
import React from "react";
import Navigation from "@/components/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function FAQ() {
  const faqs = [
    {
      question: "How does ChefGPT work?",
      answer: "ChefGPT uses AI to help you with cooking, meal planning, and nutrition tracking. Simply describe what you want to cook or upload photos of your ingredients."
    },
    {
      question: "Is ChefGPT free to use?",
      answer: "Yes! ChefGPT offers a free tier with basic features. You can upgrade to Pro for advanced AI features and unlimited generations."
    },
    {
      question: "Can I track calories with photos?",
      answer: "Photo calorie tracking is available with our Pro plan. Simply take a photo of your meal and our AI will estimate the calories and nutritional information."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <main className="pt-20 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Frequently Asked Questions
            </h1>
            <p className="text-xl text-gray-600">
              Everything you need to know about ChefGPT
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <Card key={index}>
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
