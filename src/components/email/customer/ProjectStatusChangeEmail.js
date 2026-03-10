/**
 * ProjectStatusChangeEmail - Notifies customer when project status changes
 *
 * Sent when a project transitions between workflow stages.
 *
 * @param {Object} props
 * @param {string} props.customerName - Customer's full name
 * @param {string} props.projectName - Project name
 * @param {string} props.oldStatus - Previous status key
 * @param {string} props.newStatus - New status key
 * @param {string} props.projectUrl - URL to view project
 * @param {string} props.updatedBy - Who made the change
 * @returns {string} HTML email string
 */

const STATUS_LABELS = {
  'planning': 'Planning',
  'field-capture': 'Field Capture',
  'uploading': 'Uploading',
  'ai-processing': 'AI Processing',
  'qc-review': 'QC Review',
  'completed': 'Ready for Review',
  'customer-notified': 'Completed',
  'on-hold': 'On Hold',
};

const STATUS_COLORS = {
  'planning': '#94a3b8',
  'field-capture': '#6b7280',
  'uploading': '#3b82f6',
  'ai-processing': '#8b5cf6',
  'qc-review': '#f59e0b',
  'completed': '#10b981',
  'customer-notified': '#7c3aed',
  'on-hold': '#ef4444',
};

export const ProjectStatusChangeEmail = ({
  customerName,
  projectName,
  oldStatus,
  newStatus,
  projectUrl,
  updatedBy,
}) => {
  const oldLabel = STATUS_LABELS[oldStatus] || oldStatus;
  const newLabel = STATUS_LABELS[newStatus] || newStatus;
  const newColor = STATUS_COLORS[newStatus] || '#3b82f6';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .status-change { background: #f9fafb; padding: 24px; border-radius: 8px; margin: 20px 0; text-align: center; }
        .old-badge { display: inline-block; background: #e5e7eb; color: #374151; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .arrow { margin: 0 12px; color: #9ca3af; font-size: 18px; }
        .new-badge { display: inline-block; background: ${newColor}; color: white; padding: 6px 16px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .button { display: inline-block; background: #3b82f6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .info-row { padding: 8px 0; border-bottom: 1px solid #f3f4f6; display: flex; justify-content: space-between; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Project Status Updated</h1>
          <p style="opacity: 0.9; margin: 8px 0 0;">${projectName}</p>
        </div>
        <div class="content">
          <p>Hello ${customerName},</p>
          <p>The status of your project <strong>"${projectName}"</strong> has been updated:</p>

          <div class="status-change">
            <span class="old-badge">${oldLabel}</span>
            <span class="arrow">&rarr;</span>
            <span class="new-badge">${newLabel}</span>
          </div>

          <table width="100%" cellpadding="8" cellspacing="0" style="margin: 20px 0; font-size: 14px;">
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="color: #6b7280;">Project</td>
              <td style="font-weight: 600; text-align: right;">${projectName}</td>
            </tr>
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="color: #6b7280;">New Status</td>
              <td style="font-weight: 600; text-align: right; color: ${newColor};">${newLabel}</td>
            </tr>
            ${updatedBy ? `
            <tr style="border-bottom: 1px solid #f3f4f6;">
              <td style="color: #6b7280;">Updated By</td>
              <td style="font-weight: 600; text-align: right;">${updatedBy}</td>
            </tr>
            ` : ''}
            <tr>
              <td style="color: #6b7280;">Date</td>
              <td style="font-weight: 600; text-align: right;">${new Date().toLocaleDateString()}</td>
            </tr>
          </table>

          <div style="text-align: center;">
            ${projectUrl ? `<a href="${projectUrl}" class="button">View Project</a>` : ''}
          </div>

          <p style="color: #6b7280; font-size: 13px;">You will continue to receive updates as your project progresses through each stage.</p>
        </div>
        <div class="footer">
          <p><strong>SewerVision AI</strong></p>
          <p>&copy; ${new Date().getFullYear()} SewerVision AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default ProjectStatusChangeEmail;
