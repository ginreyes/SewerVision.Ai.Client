'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useUser } from '@/components/providers/UserContext';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
    ChevronRight,
    ChevronLeft,
    X,
    Rocket,
    HelpCircle,
    Zap,
    Star,
    Gift,
    Megaphone,
} from 'lucide-react';

import { whatsNewData } from '@/data/whatsNewData';
import { tourSteps } from './tour/steps';
import WhatsNewContent from './tour/WhatsNewContent';

const TOUR_COMPLETED_KEY = 'sewervision_tour_completed';
const TOUR_DISMISSED_KEY = 'sewervision_tour_dismissed';
const WHATS_NEW_VERSION_KEY = 'sewervision_whats_new_last_viewed_version';

export const TourGuide = ({ isOpen, onClose, role = 'admin' }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [activeTab, setActiveTab] = useState('tour'); // 'tour' or 'whats-new'
    const [isAnimating, setIsAnimating] = useState(false);
    const { userData } = useUser();

    // Filter tour steps based on user's module permissions
    const steps = useMemo(() => {
        const allSteps = tourSteps[role] || tourSteps.admin;
        const permissions = userData?.modulePermissions;

        // If no permission level assigned (full access) or no permissions data, show all steps
        if (!permissions || permissions.length === 0) return allSteps;

        return allSteps.filter((step) => {
            // Always show welcome and complete steps (moduleKeys === null)
            if (step.moduleKeys === null) return true;
            // Show step if user has ANY of the required module keys
            return step.moduleKeys.some((key) => permissions.includes(key));
        });
    }, [role, userData?.modulePermissions]);

    const currentStepData = steps[currentStep];
    const StepIcon = currentStepData?.icon || HelpCircle;

    const [unreadCount, setUnreadCount] = useState(0);

    // Initial check for unread updates
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const lastViewedVersion = localStorage.getItem(WHATS_NEW_VERSION_KEY);
            const latestVersion = whatsNewData[0];

            if (lastViewedVersion !== latestVersion.id) {
                // Calculate total new items
                const totalUpdates = Object.values(latestVersion.updates).flat().length;
                setUnreadCount(totalUpdates > 0 ? totalUpdates : 1);
            }
        }
    }, []);

    // Listen for custom events to open specific tabs
    useEffect(() => {
        const handleOpenEvent = (e) => {
            if (e.detail?.tab === 'whats-new') {
                setActiveTab('whats-new');
            }
        };
        window.addEventListener('openTourGuide', handleOpenEvent);
        return () => window.removeEventListener('openTourGuide', handleOpenEvent);
    }, []);

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setIsAnimating(true);
            setTimeout(() => { setCurrentStep(currentStep + 1); setIsAnimating(false); }, 150);
        } else {
            handleComplete();
        }
    };

    const handlePrevious = () => {
        if (currentStep > 0) {
            setIsAnimating(true);
            setTimeout(() => { setCurrentStep(currentStep - 1); setIsAnimating(false); }, 150);
        }
    };

    const handleComplete = () => {
        localStorage.setItem(TOUR_COMPLETED_KEY, 'true');
        localStorage.setItem(`${TOUR_COMPLETED_KEY}_${role}`, 'true');
        onClose?.();
    };

    const handleSkip = () => {
        localStorage.setItem(TOUR_DISMISSED_KEY, 'true');
        onClose?.();
    };

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        if (tab === 'whats-new') {
            const latestVersion = whatsNewData[0];
            localStorage.setItem(WHATS_NEW_VERSION_KEY, latestVersion.id);
            setUnreadCount(0);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // If opening specifically for Whats New (via event prop or default), dont reset to tour
            // But here we rely on the internal state activeTab which is set by the listener
            // If just opening, default to tour unless already set to whats-new
            if (activeTab !== 'whats-new') {
                setCurrentStep(0);
                setActiveTab('tour');
            }
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-2xl p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh]">
                {/* Tab Header */}
                <div className="flex border-b border-gray-200 bg-white">
                    <button onClick={() => handleTabChange('tour')} className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'tour' ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50' : 'text-gray-500'}`}>
                        <Rocket className="w-4 h-4" /> Tour Guide
                    </button>
                    <button onClick={() => handleTabChange('whats-new')} className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${activeTab === 'whats-new' ? 'text-purple-600 border-b-2 border-purple-500 bg-purple-50' : 'text-gray-500'}`}>
                        <Megaphone className="w-4 h-4" /> What's New
                        {unreadCount > 0 && (
                            <span className="px-1.5 py-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full animate-pulse">{unreadCount}</span>
                        )}
                    </button>
                </div>

                {activeTab === 'whats-new' ? (
                    <div className="p-5">
                        <div className="mb-4">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2"><Gift className="w-5 h-5 text-purple-500" /> What's New</h2>
                            <p className="text-sm text-gray-500">See the latest updates and improvements</p>
                        </div>
                        <WhatsNewContent />
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-end">
                            <Button onClick={() => handleTabChange('tour')} className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                                Back to Tour <ChevronRight className="w-4 h-4 ml-1" />
                            </Button>
                        </div>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <div className={`bg-gradient-to-r ${currentStepData?.color || 'from-blue-500 to-purple-500'} p-5 text-white relative`}>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
                            <div className="relative z-10 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                                        <StepIcon className="w-6 h-6 text-white" />
                                    </div>
                                    <span className="text-white/80 text-sm font-medium">Step {currentStep + 1} of {steps.length}</span>
                                </div>
                                <button onClick={handleSkip} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X className="w-5 h-5" /></button>
                            </div>
                            <DialogHeader className="text-left mt-3">
                                <DialogTitle className={`text-2xl font-bold text-white transition-opacity ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                                    {currentStepData?.title}
                                </DialogTitle>
                            </DialogHeader>
                        </div>

                        {/* Content Area */}
                        <div className="p-5 overflow-y-auto max-h-[50vh]">
                            {/* Illustration */}
                            <div className={`transition-opacity ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                                {currentStepData?.illustration}
                            </div>

                            {/* Description */}
                            <DialogDescription className={`text-gray-600 text-sm mt-4 leading-relaxed transition-opacity ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
                                {currentStepData?.description}
                            </DialogDescription>

                            {/* Tips */}
                            {currentStepData?.tips?.length > 0 && (
                                <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-amber-700 mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> Pro Tips:</p>
                                    <ul className="space-y-1">
                                        {currentStepData.tips.map((tip, i) => (
                                            <li key={i} className="text-xs text-amber-800 flex items-start gap-2">
                                                <Star className="w-3 h-3 mt-0.5 text-amber-500" /> {tip}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Progress Dots */}
                            <div className="flex justify-center gap-2 mt-5">
                                {steps.map((_, i) => (
                                    <button key={i} onClick={() => setCurrentStep(i)} className={`h-2 rounded-full transition-all ${i === currentStep ? 'w-8 bg-gradient-to-r from-purple-500 to-pink-500' : i < currentStep ? 'w-2 bg-green-400' : 'w-2 bg-gray-200'}`} />
                                ))}
                            </div>
                        </div>

                        {/* Footer */}
                        <DialogFooter className="px-5 py-4 bg-gray-50 border-t flex justify-between">
                            <Button variant="ghost" onClick={handleSkip} className="text-gray-500">Skip Tour</Button>
                            <div className="flex gap-2">
                                <Button variant="outline" onClick={handlePrevious} disabled={currentStep === 0}>
                                    <ChevronLeft className="w-4 h-4 mr-1" /> Back
                                </Button>
                                <Button onClick={handleNext} className={`bg-gradient-to-r ${currentStepData?.color} text-white px-6`}>
                                    {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                                    {currentStep === steps.length - 1 ? <Rocket className="w-4 h-4 ml-1" /> : <ChevronRight className="w-4 h-4 ml-1" />}
                                </Button>
                            </div>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};

export const useTourGuide = (role = 'admin') => {
    const [showTour, setShowTour] = useState(false);
    const [hasSeenTour, setHasSeenTour] = useState(true);

    useEffect(() => {
        const completed = localStorage.getItem(`${TOUR_COMPLETED_KEY}_${role}`);
        const dismissed = localStorage.getItem(TOUR_DISMISSED_KEY);
        if (!completed && !dismissed) {
            setHasSeenTour(false);
            const timer = setTimeout(() => setShowTour(true), 1500);
            return () => clearTimeout(timer);
        }
    }, [role]);

    return {
        showTour,
        openTour: () => setShowTour(true),
        closeTour: () => setShowTour(false),
        resetTour: () => {
            localStorage.removeItem(`${TOUR_COMPLETED_KEY}_${role}`);
            localStorage.removeItem(TOUR_DISMISSED_KEY);
            setShowTour(true);
        },
        hasSeenTour,
    };
};

export default TourGuide;
