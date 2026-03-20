/**
 * User (Team Lead) Email Templates
 *
 * Centralized exports for all team-lead-facing email templates.
 * These templates generate HTML strings that can be sent via the backend email service.
 *
 * Usage:
 *   import { WelcomeEmail, ProjectAssignmentEmail } from '@/components/email/user';
 *   const html = WelcomeEmail({ teamLeadName: 'John', ... });
 */

export { WelcomeEmail } from './WelcomeEmail';
export { ProjectAssignmentEmail } from './ProjectAssignmentEmail';
export { TeamUpdateEmail } from './TeamUpdateEmail';
export { DeviceAlertEmail } from './DeviceAlertEmail';
