/**
 * WelcomeEmail - Team Lead welcome email template
 *
 * Sent when a new Team Lead account is created.
 * Includes login credentials and role-specific getting-started steps.
 *
 * @param {Object} props
 * @param {string} props.teamLeadName - Team lead's full name
 * @param {string} props.username - Login username
 * @param {string} props.email - Team lead email
 * @param {string} props.temporaryPassword - Temp password for first login
 * @param {string} props.loginUrl - URL to login page
 * @returns {string} HTML email string
 */
export const WelcomeEmail = ({
    teamLeadName,
    username,
    email,
    temporaryPassword,
    loginUrl = 'http://localhost:3000/login',
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
        .header { background: linear-gradient(135deg, #4F46E5 0%, #6366F1 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 28px; }
        .header p { margin: 10px 0 0 0; opacity: 0.9; font-size: 14px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .credentials { background: #f9fafb; border-left: 4px solid #4F46E5; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .credentials h3 { margin-top: 0; color: #4F46E5; }
        .credential-item { margin: 10px 0; }
        .credential-label { color: #6b7280; font-size: 14px; }
        .credential-value { font-size: 16px; font-weight: 600; color: #111827; font-family: monospace; background: white; padding: 8px 12px; border-radius: 6px; display: inline-block; margin-top: 4px; }
        .warning { background: #fef3c7; border: 1px solid #fbbf24; color: #92400e; padding: 15px; border-radius: 8px; margin: 20px 0; font-size: 14px; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .steps { color: #4b5563; padding-left: 20px; }
        .steps li { margin: 8px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to SewerVision AI</h1>
          <p>Your Team Lead portal is ready</p>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hello ${teamLeadName},</h2>
          <p>Your <strong>Team Lead</strong> account has been created. You can now manage your team of operators and QC technicians, oversee inspection projects, assign devices, and track progress.</p>

          <div class="credentials">
            <h3>Your Login Credentials</h3>
            <div class="credential-item">
              <div class="credential-label">Username</div>
              <div class="credential-value">${username}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">Email</div>
              <div class="credential-value">${email}</div>
            </div>
            <div class="credential-item">
              <div class="credential-label">Temporary Password</div>
              <div class="credential-value">${temporaryPassword}</div>
            </div>
          </div>

          <div class="warning">
            <strong>Important:</strong> Please change your password immediately after your first login. This temporary password is for initial access only.
          </div>

          <div style="text-align: center;">
            <a href="${loginUrl}" class="button">Login to Your Portal</a>
          </div>

          <h3 style="color: #111827;">Getting Started:</h3>
          <ol class="steps">
            <li>Click the button above to access the login page</li>
            <li>Enter your username and temporary password</li>
            <li>Change your password when prompted</li>
            <li>View your team dashboard to see operators and QC technicians</li>
            <li>Manage device assignments for your team</li>
            <li>Create and monitor inspection projects</li>
          </ol>

          <p style="color: #6b7280; margin-top: 30px;">If you need help, visit the <strong>Support</strong> section in your portal or email us at support@sewervision.ai</p>
        </div>
        <div class="footer">
          <p><strong>SewerVision AI</strong> - Advanced Sewer Inspection Platform</p>
          <p>&copy; ${new Date().getFullYear()} SewerVision AI. All rights reserved.</p>
          <p style="font-size: 11px;">This is an automated message. Please do not reply.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

export default WelcomeEmail;
