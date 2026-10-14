require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});



// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Asjad Bank" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};


async function sendRegistrationEmail(userEmail, Name) {
  const subject = "Welcome to Asjad Bank!";

  const text = `Hello ${Name},\n\nThank you for registering with Asjad Bank. We are excited to have you on board!\n\nBest regards,\nAsjad Bank Team`;

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>
  <body style="margin:0; padding:0; background-color:#f4f6f9; font-family:'Segoe UI', Arial, sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f6f9; padding:40px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
            
            <!-- Header with banner background image -->
            <tr>
              <td style="background-image:url('https://your-cdn.com/bank-header-bg.jpg'); background-color:#0b2545; background-size:cover; background-position:center; padding:40px 30px; text-align:center;">
                <h1 style="margin:0; color:#ffffff; font-size:26px; letter-spacing:0.5px;">Asjad Bank</h1>
                <p style="margin:6px 0 0; color:#cfd8e8; font-size:14px;">Trusted. Secure. Reliable.</p>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:35px 30px;">
                <h2 style="margin:0 0 15px; color:#0b2545; font-size:20px;">Welcome, ${Name}! 👋</h2>
                <p style="margin:0 0 15px; color:#444444; font-size:15px; line-height:1.6;">
                  Thank you for registering with <strong>Asjad Bank</strong>. We're excited to have you on board and look forward to helping you manage your finances with ease and confidence.
                </p>
                <p style="margin:0 0 25px; color:#444444; font-size:15px; line-height:1.6;">
                  Your account is now active. You can log in anytime to explore our services.
                </p>

                <!-- CTA Button -->
                <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                  <tr>
                    <td style="border-radius:6px; background-color:#0b2545;">
                      <a href="https://asjad-portfolio-inky.vercel.app/" style="display:inline-block; padding:12px 28px; color:#ffffff; text-decoration:none; font-size:15px; font-weight:600; border-radius:6px;">
                        Go to Dashboard
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="background-color:#f0f2f5; padding:20px 30px; text-align:center;">
                <p style="margin:0; color:#8a8f98; font-size:12px; line-height:1.5;">
                  © ${new Date().getFullYear()} Asjad Bank. All rights reserved.<br>
                  If you did not create this account, please ignore this email or contact support.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
  </html>
  `;

  await sendEmail(userEmail, subject, text, html);
}

//Sending a transaction email

async function sendTransactionEmail(userEmail, name, amount, toAccount){
  const subject = "Transaction Notification from Asjad Bank";

  const text = `Hello ${name},\n\nA transaction of $${amount} has been made from your account to account number ${toAccount}.\n\nBest regards,\nAsjad Bank Team`;
}



module.exports = { sendEmail, sendRegistrationEmail, sendTransactionEmail };