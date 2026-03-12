/**
 * TaskAssignmentEmail - Operator task/project assignment notification
 *
 * Sent when an operator is assigned to a new project or inspection task.
 *
 * @param {Object} props
 * @param {string} props.operatorName - Operator's full name
 * @param {string} props.projectName - Project name
 * @param {string} props.location - Inspection location
 * @param {string} props.priority - Priority level (high, medium, low)
 * @param {string} props.startDate - Scheduled start date
 * @param {string} props.description - Project description
 * @param {string} props.portalUrl - URL to the project in the portal
 * @returns {string} HTML email string
 */
export const TaskAssignmentEmail = ({
    operatorName,
    projectName,
    location,
    priority = 'medium',
    startDate,
    description,
    portalUrl = 'http://localhost:3000/operator/project',
}) => {
    const priorityColors = {
        high: { bg: '#FEE2E2', text: '#991B1B', border: '#EF4444', label: 'High Priority' },
        medium: { bg: '#FEF3C7', text: '#92400E', border: '#F59E0B', label: 'Medium Priority' },
        low: { bg: '#DCFCE7', text: '#166534', border: '#22C55E', label: 'Low Priority' },
    };
    const p = priorityColors[priority] || priorityColors.medium;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .badge { display: inline-block; background: ${p.bg}; color: ${p.text}; border: 1px solid ${p.border}; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
        .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; margin: 8px 0; }
        .detail-label { color: #6b7280; font-size: 14px; min-width: 120px; }
        .detail-value { color: #111827; font-weight: 500; }
        .button { display: inline-block; background: #D97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">New Task Assignment</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">You have been assigned to a new project</p>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hi ${operatorName},</h2>
          <p>You have been assigned to a new inspection project. Please review the details below and prepare accordingly.</p>

          <div style="margin: 15px 0;">
            <span class="badge">${p.label}</span>
          </div>

          <div class="details">
            <div class="detail-row">
              <span class="detail-label">Project:</span>
              <span class="detail-value">${projectName}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${location || 'TBD'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Start Date:</span>
              <span class="detail-value">${startDate || 'To be scheduled'}</span>
            </div>
            ${description ? `<div class="detail-row">
              <span class="detail-label">Description:</span>
              <span class="detail-value">${description}</span>
            </div>` : ''}
          </div>

          <div style="text-align: center;">
            <a href="${portalUrl}" class="button">View Project Details</a>
          </div>

          <p style="color: #6b7280; font-size: 14px;">Ensure your equipment is ready and devices are connected before the scheduled start date.</p>
        </div>
        <div class="footer">
          <p><strong>SewerVision AI</strong> - Advanced Sewer Inspection Platform</p>
          <p>&copy; ${new Date().getFullYear()} SewerVision AI. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default TaskAssignmentEmail;
