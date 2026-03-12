/**
 * EquipmentAlertEmail - Equipment/device status alert for operators
 *
 * Sent when a device changes status (offline, maintenance needed, etc.)
 *
 * @param {Object} props
 * @param {string} props.operatorName - Operator's full name
 * @param {string} props.deviceName - Device name
 * @param {string} props.deviceId - Device identifier
 * @param {string} props.previousStatus - Previous device status
 * @param {string} props.newStatus - New device status
 * @param {string} props.timestamp - When the status changed
 * @param {string} props.portalUrl - URL to equipment page
 * @returns {string} HTML email string
 */
export const EquipmentAlertEmail = ({
    operatorName,
    deviceName,
    deviceId,
    previousStatus,
    newStatus,
    timestamp,
    portalUrl = 'http://localhost:3000/operator/equipement',
}) => {
    const statusColors = {
        online: { bg: '#DCFCE7', text: '#166534', dot: '#22C55E' },
        offline: { bg: '#FEE2E2', text: '#991B1B', dot: '#EF4444' },
        maintenance: { bg: '#FEF3C7', text: '#92400E', dot: '#F59E0B' },
        recording: { bg: '#DBEAFE', text: '#1E40AF', dot: '#3B82F6' },
    };
    const sc = statusColors[newStatus] || statusColors.offline;

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
        .status-badge { display: inline-block; background: ${sc.bg}; color: ${sc.text}; padding: 6px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; }
        .details { background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .button { display: inline-block; background: #D97706; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 style="margin: 0; font-size: 24px;">Equipment Status Alert</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">A device assigned to you has changed status</p>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hi ${operatorName},</h2>
          <p>One of your assigned devices has changed its status:</p>

          <div class="details">
            <p style="margin: 8px 0;"><strong>Device:</strong> ${deviceName || deviceId}</p>
            <p style="margin: 8px 0;"><strong>Previous Status:</strong> ${previousStatus || 'Unknown'}</p>
            <p style="margin: 8px 0;"><strong>New Status:</strong> <span class="status-badge">${newStatus}</span></p>
            <p style="margin: 8px 0;"><strong>Time:</strong> ${timestamp || new Date().toLocaleString()}</p>
          </div>

          <div style="text-align: center;">
            <a href="${portalUrl}" class="button">View Equipment</a>
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

export default EquipmentAlertEmail;
