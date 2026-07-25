const SibApiV3Sdk = require("sib-api-v3-sdk");

/**
 * Sends a transactional email using Brevo.
 * Includes automated retries (up to 3 attempts) with backoff delay.
 * 
 * @param {string} toEmail - The recipient's email address
 * @param {string} subject - The email subject
 * @param {string} textContent - The plain text body content
 * @param {string} [htmlContent] - The HTML body content (optional)
 */
const sendBrevoEmail = async (toEmail, subject, textContent, htmlContent) => {
  const apiKey = process.env.BREVO_API_KEY;
  const senderEmail = process.env.SENDER_EMAIL || "no-reply@pipip.com";

  if (!apiKey) {
    throw new Error("Brevo API key (BREVO_API_KEY) is not configured in environment variables.");
  }

  // Setup Brevo client
  const client = SibApiV3Sdk.ApiClient.instance;
  client.authentications["api-key"].apiKey = apiKey;

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

  const maxRetries = 3;
  let attempt = 0;
  let lastError = null;

  while (attempt < maxRetries) {
    attempt++;
    try {
      console.log(`[BREVO ENGINE] Dispatching email to ${toEmail} (Attempt ${attempt}/${maxRetries})...`);

      await apiInstance.sendTransacEmail({
        sender: {
          email: senderEmail,
          name: "Pipip Admin System",
        },
        to: [
          {
            email: toEmail,
          },
        ],
        subject: subject,
        textContent: textContent,
        htmlContent: htmlContent || textContent,
      });

      console.log(`[BREVO SUCCESS] Email successfully delivered to ${toEmail}`);
      return;
    } catch (error) {
      lastError = error;
      const errorMsg = error.response
        ? `Status: ${error.response.status}, Data: ${JSON.stringify(error.response.body || error.response.text)}`
        : error.message;
      console.error(`[BREVO FAILURE] Attempt ${attempt}/${maxRetries} to ${toEmail} failed. Reason: ${errorMsg}`);

      if (attempt < maxRetries) {
        // Wait before next retry (exponential delay: 1.5s, 3.0s)
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    }
  }

  throw new Error(`Failed to send email to ${toEmail} after ${maxRetries} attempts. Last error: ${lastError.message}`);
};

module.exports = { sendBrevoEmail };