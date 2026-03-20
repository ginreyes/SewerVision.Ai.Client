/**
 * ProjectAssignmentEmail - Sent to team lead when a project is assigned
 *
 * @param {Object} props
 * @param {string} props.teamLeadName - Team lead's full name
 * @param {string} props.projectName - Name of the assigned project
 * @param {string} props.client - Client/customer name
 * @param {string} props.location - Project location
 * @param {string} props.priority - Project priority level
 * @param {string} props.dashboardUrl - URL to team lead dashboard
 * @returns {string} HTML email string
 */
export const ProjectAssignmentEmail = ({
    teamLeadName,
    projectName,
    client = '',
    location = '',
    priority = 'Normal',
    dashboardUrl = 'http://localhost:3000/user/project',
}) => {
    const priorityColors = {
        High: '#EF4444',
        Medium: '#F59E0B',
        Normal: '#3B82F6',
        Low: '#6B7280',
    };
    const priorityColor = priorityColors[priority] || priorityColors.Normal;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .project-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .detail-row { display: flex; margin: 8px 0; font-size: 14px; }
        .detail-label { color: #6b7280; min-width: 100px; }
        .detail-value { font-weight: 600; color: #111827; }
        .priority-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: white; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>New Project Assigned</h1>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hello ${teamLeadName},</h2>
          <p>A new inspection project has been assigned to your team. Please review the details below and coordinate with your operators and QC technicians.</p>

          <div class="project-card">
            <h3 style="margin-top: 0; color: #111827;">${projectName}</h3>
            <div class="detail-row">
              <span class="detail-label">Client:</span>
              <span class="detail-value">${client || 'Not specified'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Location:</span>
              <span class="detail-value">${location || 'Not specified'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Priority:</span>
              <span class="detail-value">
                <span class="priority-badge" style="background-color: ${priorityColor};">${priority}</span>
              </span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">View Project Details</a>
          </div>

          <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
            <strong>Next steps:</strong> Assign an operator and QC technician to this project, schedule the inspection, and ensure devices are ready.
          </p>
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

export default ProjectAssignmentEmail;
