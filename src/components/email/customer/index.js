/**
 * Customer Email Templates
 *
 * Centralized exports for all customer-facing email templates.
 * These templates generate HTML strings that can be sent via the backend email service.
 *
 * Usage:
 *   import { WelcomeEmail, DeliverableReadyEmail } from '@/components/email/customer';
 *   const html = WelcomeEmail({ customerName: 'John', ... });
 */

export { WelcomeEmail } from './WelcomeEmail';
export { DeliverableReadyEmail } from './DeliverableReadyEmail';
export { ProjectStatusChangeEmail } from './ProjectStatusChangeEmail';
export { AIProcessingCompleteEmail } from './AIProcessingCompleteEmail';
export { DefectAlertEmail } from './DefectAlertEmail';
