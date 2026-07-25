/**
 * Formats a number to Indian Rupee (INR) currency format (e.g. ₹12,100).
 * 
 * @param {number} val - The amount to format
 * @returns {string} Formatted currency string
 */
const formatCurrency = (val) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

/**
 * Returns a styled, responsive HTML email template for the Daily Business Report.
 * 
 * @param {object} reportData - The daily report data object
 * @returns {string} Full HTML email string
 */
const getReportHtmlTemplate = (reportData) => {
  const formattedDate = reportData.date.toLocaleDateString("en-GB"); // DD/MM/YYYY
  const generatedTime = new Date(reportData.generated_at || new Date()).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  const generatedDateTime =
    new Date(reportData.generated_at || new Date()).toLocaleDateString("en-GB") + " " + generatedTime;

  const expenseStr = formatCurrency(reportData.total_expense);
  const receivedStr = formatCurrency(reportData.total_amount_received);
  const depositStr = formatCurrency(reportData.deposit_amount);

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Daily Business Report - ${formattedDate}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
      background-color: #f8fafc;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
      width: 100% !important;
    }
    @media only screen and (max-width: 600px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .summary-card {
        display: block !important;
        width: 100% !important;
        box-sizing: border-box !important;
        margin-bottom: 12px !important;
      }
      .table-responsive {
        display: block !important;
        width: 100% !important;
        overflow-x: auto !important;
      }
    }
  </style>
</head>
<body style="background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; width: 100% !important;">

  <!-- Outer Centering Table Wrapper -->
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="table-layout: fixed; width: 100%; border-collapse: collapse; margin: 0; padding: 0; background-color: #f8fafc;">
    <tr>
      <td align="center" valign="top" style="padding: 24px 10px;">
        
        <!-- Main Centered Container (600px max width) -->
        <table border="0" cellpadding="0" cellspacing="0" width="600" class="container" style="max-width: 600px; width: 100%; border-collapse: collapse; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 12px rgba(15, 23, 42, 0.05); border: 1px solid #e2e8f0; margin: 0 auto;">
          
          <!-- HEADER -->
          <tr>
            <td style="background-color: #0f172a; padding: 32px 24px; text-align: center;">
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse;">
                <tr>
                  <td align="center" style="padding-bottom: 12px;">
                    <span style="font-size: 28px; font-weight: bold; color: #fbbf24; letter-spacing: 1px;">PIPIP</span>
                    <span style="font-size: 14px; font-weight: 500; color: #94a3b8; display: block; margin-top: 4px; text-transform: uppercase; letter-spacing: 2px;">Bike Rentals</span>
                  </td>
                </tr>
                <tr>
                  <td align="center">
                    <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #ffffff; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Daily Business Report</h1>
                    <p style="margin: 6px 0 0 0; font-size: 13px; color: #94a3b8;">Date: ${formattedDate}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CONTENT BODY -->
          <tr>
            <td style="padding: 24px;">
              
              <!-- SUMMARY CARDS GRID -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; margin-bottom: 12px;">
                <tr>
                  <td valign="top" style="padding: 0;">
                    
                    <!-- Left Summary Card -->
                    <table border="0" cellpadding="0" cellspacing="0" width="31%" align="left" class="summary-card" style="border-collapse: collapse; background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 16px; text-align: left;">
                          <div style="font-size: 20px; margin-bottom: 8px;">💸</div>
                          <div style="font-size: 11px; font-weight: 600; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Total Expense</div>
                          <div style="font-size: 18px; font-weight: 800; color: #7f1d1d; margin-top: 4px; white-space: nowrap;">${expenseStr}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Middle Spacer / Card (Margin workaround for tables) -->
                    <table border="0" cellpadding="0" cellspacing="0" width="3%" align="left" style="border-collapse: collapse; height: 1px;">
                      <tr><td></td></tr>
                    </table>

                    <!-- Middle Summary Card -->
                    <table border="0" cellpadding="0" cellspacing="0" width="31%" align="left" class="summary-card" style="border-collapse: collapse; background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 16px; text-align: left;">
                          <div style="font-size: 20px; margin-bottom: 8px;">💰</div>
                          <div style="font-size: 11px; font-weight: 600; color: #166534; text-transform: uppercase; letter-spacing: 0.5px;">Received Today</div>
                          <div style="font-size: 18px; font-weight: 800; color: #14532d; margin-top: 4px; white-space: nowrap;">${receivedStr}</div>
                        </td>
                      </tr>
                    </table>

                    <!-- Right Spacer -->
                    <table border="0" cellpadding="0" cellspacing="0" width="3%" align="left" style="border-collapse: collapse; height: 1px;">
                      <tr><td></td></tr>
                    </table>

                    <!-- Right Summary Card -->
                    <table border="0" cellpadding="0" cellspacing="0" width="31%" align="left" class="summary-card" style="border-collapse: collapse; background-color: #fef3c7; border: 1px solid #fde68a; border-radius: 12px; margin-bottom: 12px;">
                      <tr>
                        <td style="padding: 16px; text-align: left;">
                          <div style="font-size: 20px; margin-bottom: 8px;">🏦</div>
                          <div style="font-size: 11px; font-weight: 600; color: #92400e; text-transform: uppercase; letter-spacing: 0.5px;">Deposit Float</div>
                          <div style="font-size: 18px; font-weight: 800; color: #78350f; margin-top: 4px; white-space: nowrap;">${depositStr}</div>
                        </td>
                      </tr>
                    </table>

                  </td>
                </tr>
              </table>

              <!-- Spacer Clearfix to avoid layout float collapse issues -->
              <div style="clear: both; height: 12px; line-height: 12px; font-size: 1px;">&nbsp;</div>

              <!-- REPORT DATA DETAILS TABLE -->
              <h3 style="font-size: 14px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 0.5px; margin: 24px 0 12px 4px;">Detailed Report Metrics</h3>
              <div class="table-responsive">
                <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-collapse: collapse; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; width: 100%;">
                  <thead>
                    <tr style="background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
                      <th style="padding: 12px 16px; font-size: 11px; font-weight: bold; color: #475569; text-align: left; text-transform: uppercase;">Date</th>
                      <th style="padding: 12px 16px; font-size: 11px; font-weight: bold; color: #475569; text-align: right; text-transform: uppercase;">Expense</th>
                      <th style="padding: 12px 16px; font-size: 11px; font-weight: bold; color: #475569; text-align: right; text-transform: uppercase;">Received</th>
                      <th style="padding: 12px 16px; font-size: 11px; font-weight: bold; color: #475569; text-align: right; text-transform: uppercase;">Float</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style="border-bottom: 1px solid #f1f5f9;">
                      <td style="padding: 14px 16px; font-size: 13px; color: #0f172a; font-weight: 600;">${formattedDate}</td>
                      <td style="padding: 14px 16px; font-size: 13px; color: #b91c1c; text-align: right; font-weight: 600;">${expenseStr}</td>
                      <td style="padding: 14px 16px; font-size: 13px; color: #15803d; text-align: right; font-weight: 600;">${receivedStr}</td>
                      <td style="padding: 14px 16px; font-size: 13px; color: #b45309; text-align: right; font-weight: 600;">${depositStr}</td>
                    </tr>
                    <tr style="background-color: #f8fafc;">
                      <td colspan="4" style="padding: 10px 16px; font-size: 11px; color: #64748b; text-align: right;">
                        Generated Time: <strong>${generatedDateTime}</strong>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background-color: #f8fafc; padding: 24px; text-align: center; border-top: 1px solid #e2e8f0;">
              <p style="margin: 0 0 4px 0; font-size: 11px; color: #64748b; line-height: 1.5;">This is an automated email generated by the Pipip Admin System.</p>
              <p style="margin: 0 0 12px 0; font-size: 11px; color: #64748b;">Please do not reply to this email.</p>
              <p style="margin: 0; font-size: 11px; font-weight: 700; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">© Pipip Bike Rentals</p>
            </td>
          </tr>

        </table>
        
      </td>
    </tr>
  </table>

</body>
</html>`;
};

module.exports = { getReportHtmlTemplate, formatCurrency };