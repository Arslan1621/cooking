import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description?: string;
  content: ReactNode;
  isValid?: boolean;
}

interface MultiStepFormProps {
  steps: Step[];
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
  isSubmitting?: boolean;
  submitButtonText?: string;
  className?: string;
}

export default function MultiStepForm({
  steps,
  onComplete,
  onStepChange,
  isSubmitting = false,
  submitButtonText = "Complete",
  className = ""
}: MultiStepFormProps) {
  const [currentStep, setCurrentStep] = useState(0);

  const progress = ((currentStep + 1) / steps.length) * 100;
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;
  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (isLastStep) {
      onComplete();
    } else {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
      onStepChange?.(nextStep);
    }
  };

  const handlePrevious = () => {
    if (!isFirstStep) {
      const prevStep = currentStep - 1;
      setCurrentStep(prevStep);
      onStepChange?.(prevStep);
    }
  };

  const handleStepClick = (stepIndex: number) => {
    setCurrentStep(stepIndex);
    onStepChange?.(stepIndex);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Step {currentStep + 1} of {steps.length}</span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {steps.map((step, index) => (
          <button
            key={step.id}
            onClick={() => handleStepClick(index)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
              index === currentStep
                ? "bg-chef-orange text-white"
                : index < currentStep
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <div className={`flex items-center justify-center w-6 h-6 rounded-full text-xs font-bold ${
              index === currentStep
                ? "bg-white text-chef-orange"
                : index < currentStep
                ? "bg-green-500 text-white"
                : "bg-gray-300 text-gray-600"
            }`}>
              {index + 1}
            </div>
            <span>{step.title}</span>
          </button>
        ))}
      </div>

      {/* Current Step Content */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 bg-chef-orange text-white rounded-xl font-bold text-lg">
              {currentStep + 1}
            </div>
            <span>{currentStepData.title}</span>
          </CardTitle>
          {currentStepData.description && (
            <CardDescription>{currentStepData.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          {currentStepData.content}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={isFirstStep || isSubmitting}
        >
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous
        </Button>
        
        <Button
          onClick={handleNext}
          disabled={currentStepData.isValid === false || isSubmitting}
          className="bg-chef-orange hover:bg-chef-orange/90"
        >
          {isLastStep ? submitButtonText : "Next"}
          {!isLastStep && <ChevronRight className="h-4 w-4 ml-2" />}
        </Button>
      </div>
    </div>
  );
}
