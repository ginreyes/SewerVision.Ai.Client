'use client';

import { useState, useEffect, useCallback } from 'react';
import { TourProvider, useTour } from '@reactour/tour';

const TOUR_STORAGE_KEY = 'sewervision_reacttour_customer';

// Tour steps targeting data-tour attributes on actual DOM elements
const tourSteps = [
  {
    selector: '[data-tour="customer-sidebar"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-lg">Welcome to SewerVision!</h3>
        <p className="text-sm text-gray-600">
          This is your customer portal. Let us show you around so you can get the most out of your experience.
        </p>
        <p className="text-xs text-gray-400">Use the arrows to navigate through the tour.</p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-dashboard"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-base">Dashboard</h3>
        <p className="text-sm text-gray-600">
          Your main overview page. See all your projects at a glance with stats, search, and filters.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-projects"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-base">Projects</h3>
        <p className="text-sm text-gray-600">
          Browse all your inspection projects. Filter by status, search by name or location, and view detailed project information.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-reports"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-base">Reports</h3>
        <p className="text-sm text-gray-600">
          Access your PACP-compliant inspection reports. Download PDF reports with defect details, severity ratings, and photos.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-notifications"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-base">Notifications</h3>
        <p className="text-sm text-gray-600">
          Stay updated on project progress. Get alerts when AI processing completes, reports are ready, or project status changes.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-support"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-base">Support</h3>
        <p className="text-sm text-gray-600">
          Need help? Contact our support team, browse common issues, or submit a support ticket.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-stats"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-base">Project Overview</h3>
        <p className="text-sm text-gray-600">
          Quick stats showing your total projects, completed inspections, and projects currently in review.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="customer-projects-list"]',
    content: (
      <div className="space-y-2">
        <h3 className="font-bold text-base">Your Projects</h3>
        <p className="text-sm text-gray-600">
          Click on any project to view its details including defects, snapshots, and inspection reports.
        </p>
        <p className="text-xs text-gray-400 mt-2">
          That's it! You're all set. Enjoy using SewerVision.
        </p>
      </div>
    ),
    position: 'top',
  },
];

// Inner component that uses the tour context
const TourAutoStarter = () => {
  const { setIsOpen } = useTour();

  useEffect(() => {
    const hasSeenTour = localStorage.getItem(TOUR_STORAGE_KEY);
    if (!hasSeenTour) {
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [setIsOpen]);

  return null;
};

// Hook for external tour control
export const useCustomerReactTour = () => {
  const [shouldOpen, setShouldOpen] = useState(false);

  const openTour = useCallback(() => {
    setShouldOpen(true);
  }, []);

  const resetTour = useCallback(() => {
    localStorage.removeItem(TOUR_STORAGE_KEY);
  }, []);

  return { shouldOpen, setShouldOpen, openTour, resetTour };
};

// Tour opener component that responds to external triggers
const TourOpener = ({ shouldOpen, onOpened }) => {
  const { setIsOpen } = useTour();

  useEffect(() => {
    if (shouldOpen) {
      setIsOpen(true);
      onOpened();
    }
  }, [shouldOpen, setIsOpen, onOpened]);

  return null;
};

// Main provider wrapper
const CustomerReactTour = ({ children, shouldOpen, onOpened }) => {
  const handleClose = () => {
    localStorage.setItem(TOUR_STORAGE_KEY, 'true');
  };

  return (
    <TourProvider
      steps={tourSteps}
      onClickClose={({ setIsOpen }) => {
        setIsOpen(false);
        handleClose();
      }}
      afterOpen={() => {}}
      beforeClose={handleClose}
      styles={{
        popover: (base) => ({
          ...base,
          borderRadius: '12px',
          padding: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
        }),
        maskArea: (base) => ({
          ...base,
          rx: 8,
        }),
        badge: (base) => ({
          ...base,
          background: 'linear-gradient(135deg, #D76A84, #ec4899)',
          color: '#fff',
          fontWeight: 600,
        }),
        controls: (base) => ({
          ...base,
          marginTop: '16px',
        }),
        dot: (base, { current }) => ({
          ...base,
          background: current ? '#D76A84' : '#e5e7eb',
          border: 'none',
        }),
      }}
      padding={{ mask: 8, popover: [8, 12] }}
      showBadge={true}
      showDots={true}
      showNavigation={true}
      showCloseButton={true}
    >
      <TourAutoStarter />
      <TourOpener shouldOpen={shouldOpen} onOpened={onOpened} />
      {children}
    </TourProvider>
  );
};

export default CustomerReactTour;
