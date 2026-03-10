/**
 * DeliverableReadyEmail - Notifies customer when PACP deliverables are ready
 *
 * Sent when QC review is complete and reports are available for download.
 *
 * @param {Object} props
 * @param {string} props.customerName - Customer's full name
 * @param {string} props.projectName - Name of the project
 * @param {string} props.projectId - Project ID for URL
 * @param {number} props.defectCount - Total defects found
 * @param {string} props.completionDate - When QC was completed
 * @param {string} props.reportUrl - URL to view deliverables
 * @returns {string} HTML email string
 */
export const DeliverableReadyEmail = ({
  customerName,
  projectName,
  projectId,
  defectCount = 0,
  completionDate,
  reportUrl,
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
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .highlight-box { background: #f0fdf4; border: 1px solid #bbf7d0; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .stats-grid { display: flex; gap: 16px; margin: 20px 0; }
        .stat-card { flex: 1; background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: 700; color: #111827; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: 600; }
        .button-outline { display: inline-block; background: white; color: #10b981; border: 2px solid #10b981; padding: 10px 28px; text-decoration: none; border-radius: 8px; margin: 10px 5px; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Your Report is Ready!</h1>
          <p style="opacity: 0.9; margin: 8px 0 0;">PACP Deliverables Available</p>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hello ${customerName},</h2>
          <p>Great news! The PACP-compliant inspection report for <strong>"${projectName}"</strong> is now ready for your review.</p>

          <div class="highlight-box">
            <h3 style="margin-top: 0; color: #059669;">Inspection Complete</h3>
            <p style="margin-bottom: 0;">The AI analysis has been completed and verified by our certified QC staff. Your report includes defect classifications, severity ratings, and supporting imagery.</p>
          </div>

          <table width="100%" cellpadding="0" cellspacing="0" style="margin: 20px 0;">
            <tr>
              <td style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; width: 33%;">
                <div style="font-size: 24px; font-weight: 700; color: #111827;">${defectCount}</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Defects Found</div>
              </td>
              <td style="width: 16px;"></td>
              <td style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; width: 33%;">
                <div style="font-size: 24px; font-weight: 700; color: #10b981;">PACP</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Compliant</div>
              </td>
              <td style="width: 16px;"></td>
              <td style="background: #f9fafb; padding: 16px; border-radius: 8px; text-align: center; width: 33%;">
                <div style="font-size: 24px; font-weight: 700; color: #111827;">PDF</div>
                <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Format Ready</div>
              </td>
            </tr>
          </table>

          <div style="text-align: center; margin: 24px 0;">
            ${reportUrl ? `<a href="${reportUrl}" class="button">View Report</a>` : ''}
            <a href="${reportUrl || '#'}" class="button-outline">Download PDF</a>
          </div>

          <p style="color: #6b7280;">Completed on: ${completionDate || new Date().toLocaleDateString()}</p>
          <p style="color: #6b7280;">If you have questions about your report, visit the Support section or reply to this email.</p>
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

export default DeliverableReadyEmail;
