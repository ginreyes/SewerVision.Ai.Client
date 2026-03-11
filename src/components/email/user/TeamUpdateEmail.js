/**
 * TeamUpdateEmail - Sent to team lead when a team member completes an action
 *
 * @param {Object} props
 * @param {string} props.teamLeadName - Team lead's full name
 * @param {string} props.memberName - Team member who completed the action
 * @param {string} props.memberRole - Role of the team member (Operator/QC Technician)
 * @param {string} props.action - Description of what was completed
 * @param {string} props.projectName - Related project name
 * @param {string} props.dashboardUrl - URL to team lead dashboard
 * @returns {string} HTML email string
 */
export const TeamUpdateEmail = ({
    teamLeadName,
    memberName,
    memberRole = 'Operator',
    action = 'completed a task',
    projectName = '',
    dashboardUrl = 'http://localhost:3000/user/dashboard',
}) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #059669 0%, #10B981 100%); color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .update-card { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Team Activity Update</h1>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hello ${teamLeadName},</h2>

          <div class="update-card">
            <p style="margin: 0; font-size: 15px;">
              <strong>${memberName}</strong> (${memberRole}) ${action}${projectName ? ` on project <strong>${projectName}</strong>` : ''}.
            </p>
          </div>

          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">View Dashboard</a>
          </div>
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

export default TeamUpdateEmail;
