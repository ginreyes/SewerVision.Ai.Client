import { User, HardDrive, Camera, Bell, Globe, Monitor } from 'lucide-react';

export const SETTINGS_TABS = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'data', label: 'Data & Sync', icon: HardDrive },
  { id: 'video', label: 'Video & AI', icon: Camera },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'preferences', label: 'Preferences', icon: Globe },
  { id: 'appearance', label: 'Appearance', icon: Monitor },
];

export const DEFAULT_PROFILE = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  department: '',
  role: 'Operator',
  avatar: null,
};

export const DEFAULT_PASSWORD = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export const DEFAULT_SETTINGS = {
  autoUpload: true,
  gpsTagging: true,
  offlineMode: false,
  autoSyncWiFi: true,
  streamQuality: '1080p',
  videoCompression: 'high',
  aiProcessing: true,
  pacpCompliance: true,
  soundEnabled: true,
  emailAlerts: true,
  pushNotifications: true,
  notifyUploadComplete: true,
  notifyProcessingError: true,
  notifyNewAssignment: true,
  theme: 'system',
  language: 'en',
  units: 'imperial',
};

export const STREAM_QUALITIES = [
  { value: '720p', label: '720p', desc: 'Low Latency' },
  { value: '1080p', label: '1080p', desc: 'Standard' },
  { value: '4K', label: '4K', desc: 'High Bandwidth' },
];

export const LANGUAGES = [
  { value: 'en', label: 'English (US)' },
  { value: 'es', label: 'Español' },
  { value: 'fr', label: 'Français' },
  { value: 'de', label: 'Deutsch' },
];

export const UNITS = [
  { value: 'imperial', label: 'Imperial (ft, in)' },
  { value: 'metric', label: 'Metric (m, cm)' },
];
