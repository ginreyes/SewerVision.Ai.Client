"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Rocket, CheckCircle, Circle, X, ChevronRight,
  User, Eye, GraduationCap, FileText, Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCompleteOnboardingStep } from "@/hooks/useOnboarding";

const STEP_ICONS = {
  'profile-setup': User,
  'first-review': Eye,
  'training-completed': GraduationCap,
  'first-report': FileText,
  'calibration-passed': Target,
};

const STEP_LINKS = {
  'profile-setup': '/qc-technician/settings',
  'first-review': '/qc-technician/quality-control',
  'training-completed': '/qc-technician/training',
  'first-report': '/qc-technician/reports',
  'calibration-passed': '/qc-technician/training',
};

const OnboardingChecklist = ({ onboarding, userId, onDismiss }) => {
  const router = useRouter();
  const completeStep = useCompleteOnboardingStep();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const key = `onboarding-dismissed-${userId}`;
    if (typeof window !== 'undefined' && localStorage.getItem(key)) {
      setDismissed(true);
    }
  }, [userId]);

  if (!onboarding || dismissed || onboarding.overallProgress >= 100) return null;

  const steps = onboarding.steps || [];
  const progress = onboarding.overallProgress || 0;
  const completedCount = steps.filter((s) => s.completed).length;

  const handleDismiss = () => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(`onboarding-dismissed-${userId}`, 'true');
    }
    setDismissed(true);
    onDismiss?.();
  };

  const handleStepClick = (step) => {
    const link = STEP_LINKS[step.key];
    if (link) router.push(link);
  };

  return (
    <div className="bg-white rounded-2xl border border-amber-200 shadow-lg mb-6 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-700 to-amber-500 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center">
            <Rocket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold">Welcome to SewerVision.ai!</h3>
            <p className="text-[11px] text-amber-100">Complete these steps to get started</p>
          </div>
        </div>
        <button onClick={handleDismiss} className="text-white/60 hover:text-white p-1">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Steps */}
      <div className="p-5">
        <div className="space-y-2 mb-5">
          {steps.map((step, i) => {
            const Icon = STEP_ICONS[step.key] || Circle;
            const isCompleted = step.completed;
            return (
              <button
                key={step.key}
                onClick={() => !isCompleted && handleStepClick(step)}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all ${
                  isCompleted
                    ? 'bg-emerald-50 border border-emerald-100'
                    : 'bg-gray-50 hover:bg-amber-50 hover:border-amber-200 border border-transparent cursor-pointer'
                }`}
              >
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  isCompleted ? 'bg-emerald-100' : 'bg-amber-100'
                }`}>
                  {isCompleted
                    ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                    : <Icon className="w-4 h-4 text-amber-600" />
                  }
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${isCompleted ? 'text-emerald-700 line-through' : 'text-gray-800'}`}>
                    {step.label}
                  </p>
                  {step.completedAt && (
                    <p className="text-[10px] text-emerald-500">Completed {new Date(step.completedAt).toLocaleDateString()}</p>
                  )}
                </div>
                {!isCompleted && <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-red-600 to-amber-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
          </div>
          <span className="text-xs font-bold text-gray-600">{completedCount}/{steps.length}</span>
        </div>
      </div>
    </div>
  );
};

export default OnboardingChecklist;
