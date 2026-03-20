/**
 * AIProcessingCompleteEmail - Notifies customer when AI analysis finishes
 *
 * Sent when AI processing is complete for a project's inspection video.
 *
 * @param {Object} props
 * @param {string} props.customerName - Customer's full name
 * @param {string} props.projectName - Project name
 * @param {number} props.defectCount - Number of defects detected
 * @param {number} props.confidence - AI confidence score (0-100)
 * @param {string} props.projectUrl - URL to view project
 * @returns {string} HTML email string
 */
export const AIProcessingCompleteEmail = ({
  customerName,
  projectName,
  defectCount = 0,
  confidence = 0,
  projectUrl,
}) => {
  const severityLabel = defectCount > 20 ? 'High' : defectCount > 10 ? 'Medium' : 'Low';
  const severityColor = defectCount > 20 ? '#ef4444' : defectCount > 10 ? '#f59e0b' : '#10b981';

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .results-box { background: #faf5ff; border: 1px solid #e9d5ff; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .next-step { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 16px; margin: 20px 0; border-radius: 0 8px 8px 0; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">AI Analysis Complete</h1>
          <p style="opacity: 0.9; margin: 8px 0 0;">${projectName}</p>
        </div>
        <div class="content">
          <p>Hello ${customerName},</p>
          <p>The AI-powered analysis for your project <strong>"${projectName}"</strong> has been completed successfully.</p>

          <div class="results-box">
            <h3 style="margin-top: 0; color: #7c3aed;">Analysis Results</h3>
            <table width="100%" cellpadding="8" cellspacing="0">
              <tr>
                <td style="color: #6b7280;">Defects Detected</td>
                <td style="font-weight: 700; font-size: 18px; text-align: right;">${defectCount}</td>
              </tr>
              <tr>
                <td style="color: #6b7280;">AI Confidence</td>
                <td style="font-weight: 700; font-size: 18px; text-align: right;">${confidence}%</td>
              </tr>
              <tr>
                <td style="color: #6b7280;">Severity Level</td>
                <td style="text-align: right;">
                  <span style="display: inline-block; background: ${severityColor}; color: white; padding: 4px 12px; border-radius: 12px; font-size: 12px; font-weight: 600;">${severityLabel}</span>
                </td>
              </tr>
            </table>
          </div>

          <div class="next-step">
            <strong>What happens next?</strong>
            <p style="margin-bottom: 0;">Your project will now undergo quality control review by our certified QC technicians. Once verified, the final PACP-compliant report will be available for download.</p>
          </div>

          <div style="text-align: center;">
            ${projectUrl ? `<a href="${projectUrl}" class="button">View Project Details</a>` : ''}
          </div>

          <p style="color: #6b7280; font-size: 13px;">You'll receive another notification once the QC review is complete and your report is ready.</p>
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

export default AIProcessingCompleteEmail;
