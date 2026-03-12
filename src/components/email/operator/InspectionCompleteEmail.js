/**
 * InspectionCompleteEmail - Notification when an inspection recording is complete
 *
 * Sent when footage upload and/or AI processing finishes for a project.
 *
 * @param {Object} props
 * @param {string} props.operatorName - Operator's full name
 * @param {string} props.projectName - Project name
 * @param {string} props.location - Inspection location
 * @param {number} props.footageCount - Number of footage files uploaded
 * @param {string} props.totalDuration - Total recording duration
 * @param {string} props.aiStatus - AI processing status (completed, processing, pending)
 * @param {number} props.detectionsFound - Number of AI detections found
 * @param {string} props.portalUrl - URL to the project
 * @returns {string} HTML email string
 */
export const InspectionCompleteEmail = ({
    operatorName,
    projectName,
    location,
    footageCount = 0,
    totalDuration,
    aiStatus = 'pending',
    detectionsFound = 0,
    portalUrl = 'http://localhost:3000/operator/project',
}) => {
    const aiStatusConfig = {
        completed: { bg: '#DCFCE7', text: '#166534', label: 'AI Analysis Complete' },
        processing: { bg: '#DBEAFE', text: '#1E40AF', label: 'AI Processing...' },
        pending: { bg: '#F3F4F6', text: '#374151', label: 'Awaiting AI Analysis' },
    };
    const ai = aiStatusConfig[aiStatus] || aiStatusConfig.pending;

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #10B981 0%, #059669 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .stats { display: flex; gap: 15px; margin: 20px 0; }
        .stat-box { flex: 1; background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
        .stat-value { font-size: 24px; font-weight: 700; color: #111827; }
        .stat-label { font-size: 12px; color: #6b7280; margin-top: 4px; }
        .ai-badge { display: inline-block; background: ${ai.bg}; color: ${ai.text}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .button { display: inline-block; background: #059669; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Inspection Complete</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">${projectName}</p>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hi ${operatorName},</h2>
          <p>Your inspection recording for <strong>${projectName}</strong> at <strong>${location || 'the project site'}</strong> has been uploaded successfully.</p>

          <div class="stats">
            <div class="stat-box">
              <div class="stat-value">${footageCount}</div>
              <div class="stat-label">Footage Files</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${totalDuration || '—'}</div>
              <div class="stat-label">Total Duration</div>
            </div>
            <div class="stat-box">
              <div class="stat-value">${detectionsFound}</div>
              <div class="stat-label">Detections</div>
            </div>
          </div>

          <p><strong>AI Status:</strong> <span class="ai-badge">${ai.label}</span></p>

          <div style="text-align: center;">
            <a href="${portalUrl}" class="button">View Project</a>
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

export default InspectionCompleteEmail;
