/**
 * DefectAlertEmail - Alerts customer about critical defects found
 *
 * Sent when high-severity defects are detected that may require urgent attention.
 *
 * @param {Object} props
 * @param {string} props.customerName - Customer's full name
 * @param {string} props.projectName - Project name
 * @param {number} props.criticalCount - Number of critical defects
 * @param {Array} props.defects - Array of { type, severity, location }
 * @param {string} props.projectUrl - URL to view project
 * @returns {string} HTML email string
 */
export const DefectAlertEmail = ({
  customerName,
  projectName,
  criticalCount = 0,
  defects = [],
  projectUrl,
}) => {
  const defectRows = defects.slice(0, 5).map(d => `
    <tr style="border-bottom: 1px solid #f3f4f6;">
      <td style="padding: 10px 8px; font-weight: 500;">${d.type}</td>
      <td style="padding: 10px 8px; text-align: center;">
        <span style="display: inline-block; background: ${d.severity === 'high' ? '#fef2f2' : d.severity === 'medium' ? '#fffbeb' : '#f0fdf4'}; color: ${d.severity === 'high' ? '#dc2626' : d.severity === 'medium' ? '#d97706' : '#16a34a'}; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600;">${d.severity}</span>
      </td>
      <td style="padding: 10px 8px; color: #6b7280; text-align: right;">${d.location || 'N/A'}</td>
    </tr>
  `).join('');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .alert-banner { background: #fef2f2; border: 1px solid #fecaca; padding: 16px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #ef4444; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Defect Alert</h1>
          <p style="opacity: 0.9; margin: 8px 0 0;">${criticalCount} critical issue${criticalCount !== 1 ? 's' : ''} detected</p>
        </div>
        <div class="content">
          <p>Hello ${customerName},</p>

          <div class="alert-banner">
            <strong style="color: #dc2626;">Attention Required</strong>
            <p style="margin-bottom: 0;">Our AI analysis of <strong>"${projectName}"</strong> has identified <strong>${criticalCount} high-severity defect${criticalCount !== 1 ? 's' : ''}</strong> that may require your attention.</p>
          </div>

          ${defects.length > 0 ? `
          <h3 style="color: #111827;">Defect Summary</h3>
          <table width="100%" cellpadding="0" cellspacing="0" style="font-size: 14px;">
            <thead>
              <tr style="border-bottom: 2px solid #e5e7eb;">
                <th style="padding: 10px 8px; text-align: left; color: #6b7280; font-weight: 600;">Type</th>
                <th style="padding: 10px 8px; text-align: center; color: #6b7280; font-weight: 600;">Severity</th>
                <th style="padding: 10px 8px; text-align: right; color: #6b7280; font-weight: 600;">Location</th>
              </tr>
            </thead>
            <tbody>
              ${defectRows}
            </tbody>
          </table>
          ${defects.length > 5 ? `<p style="color: #6b7280; font-size: 13px;">...and ${defects.length - 5} more. View full details in your portal.</p>` : ''}
          ` : ''}

          <div style="text-align: center;">
            ${projectUrl ? `<a href="${projectUrl}" class="button">View Full Report</a>` : ''}
          </div>

          <p style="color: #6b7280; font-size: 13px;">Our QC team will verify these findings. You'll be notified once the review is complete.</p>
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

export default DefectAlertEmail;
