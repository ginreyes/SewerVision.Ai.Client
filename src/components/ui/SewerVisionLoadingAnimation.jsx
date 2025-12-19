import React, { useState, useEffect } from 'react';
import { 
  Upload, 
  Database, 
  Video, 
  Cpu, 
  Search, 
  CheckCircle, 
  Cloud, 
  Users, 
  Bell,
  ArrowRight,
  Zap,
  FileText,
  Calendar,
  Settings,
  BarChart3,
  Loader2
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Simplified Module Loading Component
const ModuleLoading = ({ isVisible = true, moduleName = "Module", onOpenChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState([]);

  // Generic workflow steps that work for any module
  const workflowSteps = [
    {
      id: 1,
      title: "Initializing",
      subtitle: `Loading ${moduleName}`,
      icon: Loader2,
      color: "text-blue-500",
      bgColor: "bg-blue-50",
      description: `Setting up ${moduleName} environment`
    },
    {
      id: 2,
      title: "Fetching Data",
      subtitle: "Retrieving Information",
      icon: Database,
      color: "text-purple-500",
      bgColor: "bg-purple-50",
      description: `Loading ${moduleName} data from database`
    },
    {
      id: 3,
      title: "Processing",
      subtitle: "Organizing Content",
      icon: Cpu,
      color: "text-orange-500",
      bgColor: "bg-orange-50",
      description: `Processing and organizing ${moduleName} content`
    },
    {
      id: 4,
      title: "Ready",
      subtitle: "Module Loaded",
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-50",
      description: `${moduleName} is ready to use`
    }
  ];

  useEffect(() => {
    if (!isVisible) {
      setCurrentStep(0);
      setCompletedSteps([]);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStep((prev) => {
        const nextStep = prev + 1;
        
        setTimeout(() => {
          setCompletedSteps((completed) => {
            if (!completed.includes(prev)) {
              return [...completed, prev];
            }
            return completed;
          });
        }, 600);

        // Close modal when all steps are complete
        if (nextStep >= workflowSteps.length) {
          setTimeout(() => {
            onOpenChange?.(false);
          }, 1000);
          return prev;
        }

        return nextStep;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isVisible, workflowSteps.length, onOpenChange]);

  return (
    <Dialog open={isVisible} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white border-0 shadow-2xl">
        <div className="p-6">
          {/* Header */}
          <DialogHeader className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Zap className="w-6 h-6 text-blue-600" />
              <DialogTitle className="text-xl font-bold text-gray-800">
                Loading {moduleName}
              </DialogTitle>
            </div>
            <DialogDescription className="text-sm text-gray-500">
              Please wait while we prepare your module
            </DialogDescription>
          </DialogHeader>

          {/* Workflow Steps */}
          <div className="space-y-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = completedSteps.includes(index);

              return (
                <div
                  key={step.id}
                  className={`relative flex items-center p-3 rounded-xl transition-all duration-500 transform ${
                    isActive 
                      ? `${step.bgColor} scale-105 shadow-md` 
                      : isCompleted
                      ? 'bg-green-50 scale-100'
                      : 'bg-gray-50 opacity-50 scale-95'
                  }`}
                >
                  {/* Step Icon */}
                  <div className={`relative flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                    isActive ? step.bgColor : isCompleted ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle className="w-5 h-5 text-green-500" />
                    ) : (
                      <Icon className={`w-5 h-5 ${isActive ? step.color : 'text-gray-400'} ${
                        isActive && step.icon === Loader2 ? 'animate-spin' : isActive ? 'animate-pulse' : ''
                      }`} />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-semibold text-sm ${
                        isActive ? 'text-gray-800' : isCompleted ? 'text-gray-600' : 'text-gray-400'
                      }`}>
                        {step.title}
                      </h3>
                      {isActive && (
                        <ArrowRight className="w-4 h-4 text-blue-500 animate-bounce-x" />
                      )}
                    </div>
                    <p className={`text-xs ${
                      isActive ? 'text-gray-600' : isCompleted ? 'text-gray-500' : 'text-gray-400'
                    }`}>
                      {step.subtitle}
                    </p>
                    
                    {/* Active step description */}
                    {isActive && (
                      <p className="text-xs text-gray-500 mt-1 animate-fade-in">
                        {step.description}
                      </p>
                    )}
                  </div>

                  {/* Progress indicator */}
                  <div className="flex-shrink-0">
                    {isCompleted && (
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    )}
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex justify-between text-xs text-gray-500 mb-2">
              <span>Loading {moduleName}...</span>
              <span>{Math.round(((currentStep + 1) / workflowSteps.length) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-[#D76A84] via-rose-500 to-pink-600 h-2 rounded-full transition-all duration-500 ease-out relative"
                style={{ width: `${((currentStep + 1) / workflowSteps.length) * 100}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-shimmer rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        <style jsx>{`
          @keyframes bounce-x {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(4px); }
          }
          
          @keyframes fade-in {
            from { opacity: 0; transform: translateY(-5px); }
            to { opacity: 1; transform: translateY(0); }
          }
          
          @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
          }
          
          .animate-bounce-x {
            animation: bounce-x 1s infinite;
          }
          
          .animate-fade-in {
            animation: fade-in 0.3s ease-out;
          }
          
          .animate-shimmer {
            animation: shimmer 2s infinite;
          }
        `}</style>
      </DialogContent>
    </Dialog>
  );
};




export default ModuleLoading;