/**
 * DeviceAlertEmail - Sent to team lead when a device status changes
 *
 * @param {Object} props
 * @param {string} props.teamLeadName - Team lead's full name
 * @param {string} props.deviceName - Name of the device
 * @param {string} props.serialNumber - Device serial number
 * @param {string} props.previousStatus - Previous device status
 * @param {string} props.newStatus - New device status
 * @param {string} props.dashboardUrl - URL to device assignments page
 * @returns {string} HTML email string
 */
export const DeviceAlertEmail = ({
    teamLeadName,
    deviceName,
    serialNumber = '',
    previousStatus = 'online',
    newStatus = 'offline',
    dashboardUrl = 'http://localhost:3000/user/device-assignments',
}) => {
    const statusColors = {
        online: '#10B981',
        offline: '#6B7280',
        maintenance: '#F59E0B',
        decommissioned: '#EF4444',
    };
    const isAlert = newStatus === 'offline' || newStatus === 'maintenance' || newStatus === 'decommissioned';
    const headerBg = isAlert
        ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)'
        : 'linear-gradient(135deg, #059669 0%, #10B981 100%)';

    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { color: white; padding: 25px; text-align: center; border-radius: 12px 12px 0 0; }
        .header h1 { margin: 0; font-size: 22px; }
        .content { background: white; padding: 30px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 12px 12px; }
        .device-card { background: #f9fafb; border: 1px solid #e5e7eb; padding: 20px; border-radius: 12px; margin: 20px 0; }
        .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; color: white; }
        .button { display: inline-block; background: #4F46E5; color: white; padding: 12px 30px; text-decoration: none; border-radius: 8px; margin: 20px 0; font-weight: 600; }
        .footer { text-align: center; color: #6b7280; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background: ${headerBg};">
          <h1>Device Status ${isAlert ? 'Alert' : 'Update'}</h1>
        </div>
        <div class="content">
          <h2 style="color: #111827; margin-top: 0;">Hello ${teamLeadName},</h2>
          <p>A device assigned to your team has changed status.</p>

          <div class="device-card">
            <h3 style="margin-top: 0; color: #111827;">${deviceName}</h3>
            ${serialNumber ? `<p style="color: #6b7280; font-size: 14px; margin: 4px 0;">Serial: ${serialNumber}</p>` : ''}
            <div style="margin-top: 12px; display: flex; align-items: center; gap: 8px;">
              <span class="status-badge" style="background-color: ${statusColors[previousStatus] || '#6B7280'};">${previousStatus}</span>
              <span style="color: #9CA3AF; font-size: 18px;">&rarr;</span>
              <span class="status-badge" style="background-color: ${statusColors[newStatus] || '#6B7280'};">${newStatus}</span>
            </div>
          </div>

          <div style="text-align: center;">
            <a href="${dashboardUrl}" class="button">View Device Assignments</a>
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

export default DeviceAlertEmail;
