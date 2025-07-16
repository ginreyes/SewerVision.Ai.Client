"use client";

import React, { createContext, useState, useContext, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  HelpCircle, 
  Clock,
  Shield,
  Trash2,
  LogOut,
  Upload,
  Download,
  Settings,
  User,
  Lock
} from "lucide-react";

const DialogContext = createContext({
  showConfirm: () => {},
  showSessionExpiredDialog: () => {},
  showAlert: () => {},
  showSuccess: () => {},
  showError: () => {},
  showWarning: () => {},
  showInfo: () => {},
  showDelete: () => {},
  showLogout: () => {},
  showUpload: () => {},
  showDownload: () => {},
  showSettings: () => {},
  showProfile: () => {},
  showSecurity: () => {},
  hideDialog: () => {},
});

export function useDialog() {
  return useContext(DialogContext);
}

// Beautiful Animated Icon Component
const AnimatedIcon = ({ type, className = "" }) => {
  const iconProps = {
    size: 40,
    className: `${className} transition-all duration-500`
  };

  const getIconConfig = () => {
    switch (type) {
      case "success":
        return {
          icon: <CheckCircle {...iconProps} />,
          bgColor: "bg-gradient-to-br from-green-400 to-green-600",
          iconColor: "text-white",
          animation: "animate-bounceIn"
        };
      case "error":
        return {
          icon: <XCircle {...iconProps} />,
          bgColor: "bg-gradient-to-br from-red-400 to-red-600", 
          iconColor: "text-white",
          animation: "animate-shakeX"
        };
      case "warning":
        return {
          icon: <AlertCircle {...iconProps} />,
          bgColor: "bg-gradient-to-br from-yellow-400 to-orange-500",
          iconColor: "text-white", 
          animation: "animate-pulse"
        };
      case "info":
        return {
          icon: <Info {...iconProps} />,
          bgColor: "bg-gradient-to-br from-blue-400 to-blue-600",
          iconColor: "text-white",
          animation: "animate-pulse"
        };
      case "confirm":
        return {
          icon: <HelpCircle {...iconProps} />,
          bgColor: "bg-gradient-to-br from-indigo-400 to-indigo-600",
          iconColor: "text-white",
          animation: "animate-pulse"
        };
      case "sessionExpired":
        return {
          icon: <Clock {...iconProps} />,
          bgColor: "bg-gradient-to-br from-orange-400 to-orange-600",
          iconColor: "text-white", 
          animation: "animate-spin"
        };
      case "delete":
        return {
          icon: <Trash2 {...iconProps} />,
          bgColor: "bg-gradient-to-br from-red-500 to-red-700",
          iconColor: "text-white",
          animation: "animate-bounceIn"
        };
      case "logout":
        return {
          icon: <LogOut {...iconProps} />,
          bgColor: "bg-gradient-to-br from-orange-400 to-red-500",
          iconColor: "text-white",
          animation: "animate-slideOut"
        };
      case "upload":
        return {
          icon: <Upload {...iconProps} />,
          bgColor: "bg-gradient-to-br from-blue-400 to-cyan-500",
          iconColor: "text-white",
          animation: "animate-bounceUp"
        };
      case "download":
        return {
          icon: <Download {...iconProps} />,
          bgColor: "bg-gradient-to-br from-green-400 to-teal-500",
          iconColor: "text-white", 
          animation: "animate-bounceDown"
        };
      case "settings":
        return {
          icon: <Settings {...iconProps} />,
          bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
          iconColor: "text-white",
          animation: "animate-spin"
        };
      case "profile":
        return {
          icon: <User {...iconProps} />,
          bgColor: "bg-gradient-to-br from-blue-400 to-purple-500",
          iconColor: "text-white",
          animation: "animate-pulse"
        };
      case "security":
        return {
          icon: <Shield {...iconProps} />,
          bgColor: "bg-gradient-to-br from-purple-400 to-purple-600",
          iconColor: "text-white",
          animation: "animate-pulse"
        };
      default:
        return {
          icon: <Info {...iconProps} />,
          bgColor: "bg-gradient-to-br from-gray-400 to-gray-600",
          iconColor: "text-white",
          animation: ""
        };
    }
  };

  const config = getIconConfig();

  return (
    <div className="flex justify-center items-center mb-6">
      <div className={`
        ${config.bgColor} 
        ${config.animation}
        w-20 h-20 
        rounded-full 
        flex items-center justify-center 
        shadow-lg 
        border-4 border-white
        transition-all duration-500 ease-out
        hover:scale-110
      `}>
        <div className={config.iconColor}>
          {config.icon}
        </div>
      </div>
    </div>
  );
};

export function DialogProvider({ children }) {
  const [dialog, setDialog] = useState({
    open: false,
    type: null,
    title: "",
    description: "",
    onConfirm: null,
    onCancel: null,
    confirmText: "Confirm",
    cancelText: "Cancel",
    variant: "rose", // "destructive", "secondary", "outline", "rose"
  });

  const showConfirm = useCallback(({ 
    title, 
    description, 
    onConfirm, 
    onCancel,
    confirmText = "Confirm",
    cancelText = "Cancel",
    variant = "rose"
  }) => {
    setDialog({
      open: true,
      type: "confirm",
      title,
      description,
      onConfirm,
      onCancel,
      confirmText,
      cancelText,
      variant,
    });
  }, []);

  const showSuccess = useCallback((message, title = "Success") => {
    setDialog({
      open: true,
      type: "success",
      title,
      description: message,
      confirmText: "Great!",
    });
  }, []);

  const showError = useCallback((message, title = "Error") => {
    setDialog({
      open: true,
      type: "error",
      title,
      description: message,
      confirmText: "Try Again",
    });
  }, []);

  const showWarning = useCallback((message, title = "Warning") => {
    setDialog({
      open: true,
      type: "warning",
      title,
      description: message,
      confirmText: "I Understand",
    });
  }, []);

  const showInfo = useCallback((message, title = "Information") => {
    setDialog({
      open: true,
      type: "info",
      title,
      description: message,
      confirmText: "Got it",
    });
  }, []);

  const showDelete = useCallback(({ 
    title = "Delete Item", 
    description = "Are you sure you want to delete this item? This action cannot be undone.", 
    onConfirm,
    onCancel 
  }) => {
    setDialog({
      open: true,
      type: "delete",
      title,
      description,
      onConfirm,
      onCancel,
      confirmText: "Delete",
      cancelText: "Keep",
      variant: "destructive",
    });
  }, []);

  const showLogout = useCallback(({ onConfirm, onCancel }) => {
    setDialog({
      open: true,
      type: "logout",
      title: "Sign Out",
      description: "Are you sure you want to sign out of your account?",
      onConfirm,
      onCancel,
      confirmText: "Sign Out",
      cancelText: "Stay",
      variant: "secondary",
    });
  }, []);

  const showUpload = useCallback(({ 
    title = "Upload Complete", 
    description = "Your files have been uploaded successfully.",
    onConfirm 
  }) => {
    setDialog({
      open: true,
      type: "upload",
      title,
      description,
      onConfirm,
      confirmText: "View Files",
    });
  }, []);

  const showDownload = useCallback(({ 
    title = "Download Ready", 
    description = "Your download is ready. Click below to start downloading.",
    onConfirm 
  }) => {
    setDialog({
      open: true,
      type: "download",
      title,
      description,
      onConfirm,
      confirmText: "Download",
    });
  }, []);

  const showSettings = useCallback(({ 
    title = "Settings Updated", 
    description = "Your settings have been saved successfully.",
    onConfirm 
  }) => {
    setDialog({
      open: true,
      type: "settings",
      title,
      description,
      onConfirm,
      confirmText: "Continue",
    });
  }, []);

  const showProfile = useCallback(({ 
    title = "Profile Update", 
    description = "Do you want to save the changes to your profile?",
    onConfirm,
    onCancel 
  }) => {
    setDialog({
      open: true,
      type: "profile",
      title,
      description,
      onConfirm,
      onCancel,
      confirmText: "Save Changes",
      cancelText: "Discard",
    });
  }, []);

  const showSecurity = useCallback(({ 
    title = "Security Update", 
    description = "This action requires additional security verification.",
    onConfirm,
    onCancel 
  }) => {
    setDialog({
      open: true,
      type: "security",
      title,
      description,
      onConfirm,
      onCancel,
      confirmText: "Verify",
      cancelText: "Cancel",
    });
  }, []);

  const showAlert = useCallback((message, type = "info") => {
    const alertMethods = {
      success: showSuccess,
      error: showError,
      warning: showWarning,
      info: showInfo,
    };
    
    const method = alertMethods[type] || showInfo;
    method(message);
  }, [showSuccess, showError, showWarning, showInfo]);

  const showSessionExpiredDialog = useCallback(() => {
    setDialog({
      open: true,
      type: "sessionExpired",
      title: "Session Expired",
      description: "Your session has expired. Please log in again to continue.",
      onConfirm: () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("username");
        window.location.href = "/login";
      },
      onCancel: () => {
        setDialog((prev) => ({ ...prev, open: false }));
      },
      confirmText: "Re-login",
      cancelText: "Cancel",
    });
  }, []);

  const hideDialog = useCallback(() => {
    setDialog((prev) => ({ ...prev, open: false }));
  }, []);

  const handleConfirm = () => {
    if (dialog.onConfirm) dialog.onConfirm();
    hideDialog();
  };

  const handleCancel = () => {
    if (dialog.onCancel) dialog.onCancel();
    hideDialog();
  };

  const getTitleColor = () => {
    switch (dialog.type) {
      case "success":
        return "text-green-600";
      case "error":
        return "text-red-600";
      case "warning":
        return "text-yellow-600";
      case "info":
        return "text-blue-600";
      case "confirm":
        return "text-blue-700";
      case "sessionExpired":
        return "text-orange-600";
      case "delete":
        return "text-red-700";
      case "logout":
        return "text-orange-500";
      case "upload":
        return "text-blue-600";
      case "download":
        return "text-green-600";
      case "settings":
        return "text-gray-700";
      case "profile":
        return "text-blue-700";
      case "security":
        return "text-purple-700";
      default:
        return "text-gray-800";
    }
  };

  const getButtonVariant = () => {
    switch (dialog.variant) {
      case "destructive":
        return "destructive";
      case "secondary":
        return "secondary";
      case "outline":
        return "outline";
      case "rose":
        return "rose";
      default:
        return "rose"; // Default to rose as in original
    }
  };

  const needsConfirmation = [
    "confirm", 
    "sessionExpired", 
    "delete", 
    "logout", 
    "profile", 
    "security"
  ].includes(dialog.type);

  const hasCustomAction = ["upload", "download"].includes(dialog.type) && dialog.onConfirm;

  return (
    <DialogContext.Provider
      value={{
        showConfirm,
        showAlert,
        showSuccess,
        showError,
        showWarning,
        showInfo,
        showSessionExpiredDialog,
        showDelete,
        showLogout,
        showUpload,
        showDownload,
        showSettings,
        showProfile,
        showSecurity,
        hideDialog,
      }}
    >
      {children}

      <Dialog open={dialog.open} onOpenChange={handleCancel} className='z-20'>
        <DialogContent className="sm:max-w-md overflow-hidden bg-white border shadow-2xl">
          <div className="relative">
            {/* Background decoration - now solid */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-br from-gray-50 to-gray-100 rounded-t-lg -mx-6 -mt-6"></div>
            
            {/* Icon positioned better */}
            <div className="relative pt-4">
              <AnimatedIcon type={dialog.type} />
            </div>
            
            {/* Content */}
            <DialogHeader className="text-center relative z-10 space-y-3">
              <DialogTitle className={`text-2xl font-bold ${getTitleColor()} tracking-tight`}>
                {dialog.title}
              </DialogTitle>
              <DialogDescription className="text-base text-gray-600 leading-relaxed px-2">
                {dialog.description}
              </DialogDescription>
            </DialogHeader>

            {/* Beautiful button section */}
            <DialogFooter className="flex-col sm:flex-row gap-3 mt-8 pt-6 border-t border-gray-200">
              {needsConfirmation || hasCustomAction ? (
                <>
                  <Button 
                    variant={getButtonVariant()} 
                    onClick={handleConfirm}
                    className="w-full sm:w-auto min-w-[120px] font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    {dialog.confirmText}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    className="w-full sm:w-auto min-w-[120px] font-medium hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                  >
                    {dialog.cancelText}
                  </Button>
                </>
              ) : (
                <Button 
                  onClick={hideDialog} 
                  variant="rose"
                  className="w-full sm:w-auto min-w-[120px] font-medium shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  {dialog.confirmText}
                </Button>
              )}
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        @keyframes bounceIn {
          0% { transform: scale(0.3); opacity: 0; }
          50% { transform: scale(1.05); opacity: 0.8; }
          70% { transform: scale(0.9); opacity: 0.9; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes shakeX {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-3px); }
          20%, 40%, 60%, 80% { transform: translateX(3px); }
        }
        
        @keyframes bounceUp {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        
        @keyframes bounceDown {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(8px); }
        }
        
        @keyframes slideOut {
          0% { transform: translateX(0); opacity: 1; }
          50% { transform: translateX(10px); opacity: 0.7; }
          100% { transform: translateX(0); opacity: 1; }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out;
        }
        
        .animate-bounceIn {
          animation: bounceIn 0.6s ease-out;
        }
        
        .animate-shakeX {
          animation: shakeX 0.8s ease-in-out;
        }
        
        .animate-bounceUp {
          animation: bounceUp 1s ease-in-out infinite;
        }
        
        .animate-bounceDown {
          animation: bounceDown 1s ease-in-out infinite;
        }
        
        .animate-slideOut {
          animation: slideOut 2s ease-in-out infinite;
        }
      `}</style>
    </DialogContext.Provider>
  );
}