'use client';

import { useState, useEffect, useCallback } from 'react';
import { TourProvider, useTour } from '@reactour/tour';

const TOUR_STORAGE_KEY = 'sewervision_reacttour_customer';

// Tour steps targeting data-tour attributes on actual DOM elements
const tourSteps = [
  {
    selector: '[data-tour="customer-sidebar"]',
    content: (
      <div className="space-y-3 py-1">
        <h3 className="font-bold text-base text-gray-900">Welcome to SewerVision!</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          This is your customer portal. Let us show you around so you can get the most out of your experience.
        </p>
        <p className="text-xs text-gray-400 flex items-center gap-1">
          <span className="inline-block w-4 h-4 rounded-full bg-teal-100 text-teal-600 text-[10px] font-bold flex items-center justify-center leading-none text-center">?</span>
          Use the arrows to navigate through the tour.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-dashboard"]',
    content: (
      <div className="space-y-2 py-1">
        <h3 className="font-bold text-base text-gray-900">📊 Dashboard</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Your main overview page. See project stats, defect summaries, status breakdowns, and recent activity at a glance.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-projects"]',
    content: (
      <div className="space-y-2 py-1">
        <h3 className="font-bold text-base text-gray-900">📁 Projects</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Browse all your inspection projects. Filter by status, search by name or location, and view detailed project information.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-reports"]',
    content: (
      <div className="space-y-2 py-1">
        <h3 className="font-bold text-base text-gray-900">📄 Reports</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Access your PACP-compliant inspection reports. Download PDF reports with defect details, severity ratings, and photos.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-notifications"]',
    content: (
      <div className="space-y-2 py-1">
        <h3 className="font-bold text-base text-gray-900">🔔 Notifications</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Stay updated on project progress. Get alerts when AI processing completes, reports are ready, or project status changes.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-support"]',
    content: (
      <div className="space-y-2 py-1">
        <h3 className="font-bold text-base text-gray-900">🎧 Support</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Need help? Contact our support team, browse common issues, or submit a support ticket.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-sidebar-settings"]',
    content: (
      <div className="space-y-2 py-1">
        <h3 className="font-bold text-base text-gray-900">⚙️ Settings</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Manage your profile, update your avatar, and change your password. Keep your account information up to date.
        </p>
      </div>
    ),
    position: 'right',
  },
  {
    selector: '[data-tour="customer-stats"]',
    content: (
      <div className="space-y-2 py-1">
        <h3 className="font-bold text-base text-gray-900">📈 Project Overview</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Quick stats showing your total projects, active inspections, completed projects, and total defects detected.
        </p>
      </div>
    ),
    position: 'bottom',
  },
  {
    selector: '[data-tour="customer-projects-list"]',
    content: (
      <div className="space-y-2 py-1">
        <h3 className="font-bold text-base text-gray-900">🗂️ Your Projects</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          Click on any project to view its details including defects, snapshots, and inspection reports.
        </p>
        <div className="mt-2 px-3 py-2 bg-teal-50 rounded-lg border border-teal-100">
          <p className="text-xs text-teal-700 font-medium">
            🎉 That&apos;s it! You&apos;re all set. Enjoy using SewerVision.
          </p>
        </div>
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
          borderRadius: '16px',
          padding: '20px 24px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.12), 0 4px 16px rgba(0,0,0,0.08)',
          maxWidth: '340px',
        }),
        maskArea: (base) => ({
          ...base,
          rx: 12,
        }),
        badge: (base) => ({
          ...base,
          background: 'linear-gradient(135deg, #0d9488, #14b8a6)',
          color: '#fff',
          fontWeight: 600,
          fontSize: '11px',
          padding: '2px 8px',
          borderRadius: '20px',
        }),
        controls: (base) => ({
          ...base,
          marginTop: '16px',
        }),
        dot: (base, { current }) => ({
          ...base,
          background: current ? '#0d9488' : '#e5e7eb',
          border: 'none',
          width: current ? '24px' : '8px',
          height: '8px',
          borderRadius: '4px',
          transition: 'all 0.2s ease',
        }),
        close: (base) => ({
          ...base,
          color: '#9ca3af',
          width: '12px',
          height: '12px',
          top: '16px',
          right: '16px',
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
