import nodemailer from 'nodemailer';

const sendEmail = async (email, subject, message) => {
  try {
    // Create transporter using your email service
    const transporter = nodemailer.createTransport({
      service: 'gmail', // or any other email service
      auth: {
        user: process.env.EMAIL_USER, // your email
        pass: process.env.EMAIL_PASS, // your email password or app password
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: subject,
      html: message,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log(`Email sent to ${email}: ${subject}`);
    return { success: true, messageId: result.messageId };

  } catch (error) {
    console.error('Email sending failed:', error.message);
    return { success: false, error: error.message };
  }
};

const sendContactEmail = async (contactData) => {
  const { name, email, mobile, message } = contactData;

  console.log('Email configuration check:', {
    hasEmailUser: !!process.env.EMAIL_USER,
    hasEmailPass: !!process.env.EMAIL_PASS,
    adminEmail: process.env.ADMIN_EMAIL || process.env.EMAIL_USER
  });

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('Missing email configuration in environment variables');
    return { success: false, error: 'Email service not configured' };
  }

  const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  debug: true,
  logger: true,
  tls: {
    rejectUnauthorized: false
  }
});

// Test connection first
try {
  await transporter.verify();
  console.log('Gmail SMTP connection verified successfully');
} catch (verifyError) {
  console.error('Gmail SMTP connection failed:', verifyError);
  return { success: false, error: 'Gmail authentication failed: ' + verifyError.message };
}

console.log('Environment check:');
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS length:', process.env.EMAIL_PASS ? process.env.EMAIL_PASS.length : 'undefined');
console.log('ADMIN_EMAIL:', process.env.ADMIN_EMAIL);

  try {
    // Send email to admin
    const adminMailOptions = {
      from: `"IT-CCTV Support" <${process.env.EMAIL_USER}>`,
      to: process.env.ADMIN_EMAIL || process.env.EMAIL_USER,
      subject: `New Contact Inquiry from ${name}`,
      replyTo: email,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Contact Inquiry</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
    
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 30px; text-align: center; color: white;">
            <div style="font-size: 32px; margin-bottom: 10px;">📧</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">IT-CCTV Support</h1>
            <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">New Contact Inquiry Received</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            
            <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">👋 Hello Admin,</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                You have a new contact inquiry from your website visitor.
            </p>

            <!-- Customer Info Card -->
            <div style="background: #f8f9ff; border-left: 4px solid #667eea; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h3 style="color: #333; font-size: 16px; margin-bottom: 15px; font-weight: 600;">📋 Customer Details</h3>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; font-size: 14px;">
                    <div style="color: #888; font-weight: 500;">Name:</div>
                    <div style="color: #333; font-weight: 600;">${name}</div>
                    
                    <div style="color: #888; font-weight: 500;">Email:</div>
                    <div style="color: #333;">
                        <a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a>
                    </div>
                    
                    <div style="color: #888; font-weight: 500;">Mobile:</div>
                    <div style="color: #333;">
                        <a href="tel:${mobile}" style="color: #667eea; text-decoration: none;">${mobile}</a>
                    </div>
                </div>
            </div>

            <!-- Message Box -->
            <div style="background: #fff; border: 1px solid #e1e5e9; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #333; font-size: 16px; margin-bottom: 15px; font-weight: 600;">💬 Message</h3>
                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <!-- Action Button -->
            <div style="text-align: center;">
                <a href="mailto:${email}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 30px; border-radius: 25px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">
                    📩 Reply to Customer
                </a>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e1e5e9;">
            <p style="margin: 0; color: #888; font-size: 12px;">
                📅 ${new Date().toLocaleString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
            <p style="margin: 8px 0 0; color: #888; font-size: 12px;">
                © 2024 IT-CCTV Support. All rights reserved.
            </p>
        </div>

    </div>

</body>
</html>
`
    };

    // Send confirmation email to user
    const userMailOptions = {
      from: `"IT-CCTV Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: `Thank you for contacting IT-CCTV Support`,
      html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Thank You for Contacting Us</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%);">
    
    <div style="max-width: 600px; margin: 40px auto; background: white; border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.1);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%); padding: 40px 30px; text-align: center; color: white;">
            <div style="font-size: 32px; margin-bottom: 10px;">✅</div>
            <h1 style="margin: 0; font-size: 24px; font-weight: 600;">Thank You!</h1>
            <p style="margin: 8px 0 0; font-size: 14px; opacity: 0.9;">Your message has been received</p>
        </div>

        <!-- Content -->
        <div style="padding: 40px 30px;">
            
            <h2 style="color: #333; font-size: 20px; margin-bottom: 20px;">👋 Hello ${name},</h2>
            
            <p style="color: #666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                Thank you for reaching out to IT-CCTV Support! We've received your message and will get back to you shortly.
            </p>

            <!-- Your Message -->
            <div style="background: #f0f9f0; border-left: 4px solid #56ab2f; border-radius: 12px; padding: 25px; margin-bottom: 25px;">
                <h3 style="color: #333; font-size: 16px; margin-bottom: 15px; font-weight: 600;">📝 Your Message</h3>
                <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
            </div>

            <!-- Info Box -->
            <div style="background: #f8f9ff; border-radius: 12px; padding: 25px; margin-bottom: 30px;">
                <h3 style="color: #333; font-size: 16px; margin-bottom: 15px; font-weight: 600;">📋 Reference Information</h3>
                <div style="display: grid; grid-template-columns: auto 1fr; gap: 10px; font-size: 14px;">
                    <div style="color: #888; font-weight: 500;">Reference:</div>
                    <div style="color: #333; font-weight: 600;">Contact Inquiry</div>
                    
                    <div style="color: #888; font-weight: 500;">Submitted:</div>
                    <div style="color: #333;">${new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    
                    <div style="color: #888; font-weight: 500;">Contact:</div>
                    <div style="color: #333;">
                        <a href="tel:${mobile}" style="color: #56ab2f; text-decoration: none;">${mobile}</a>
                    </div>
                </div>
            </div>

            <!-- Action Buttons -->
            <div style="text-align: center;">
                <a href="mailto:${process.env.ADMIN_EMAIL || process.env.EMAIL_USER}" 
                   style="display: inline-block; background: linear-gradient(135deg, #56ab2f 0%, #a8e063 100%); color: white; text-decoration: none; padding: 15px 25px; border-radius: 25px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(86, 171, 47, 0.4); margin: 5px;">
                    📧 Contact Us Again
                </a>
                <a href="tel:${mobile}" 
                   style="display: inline-block; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; text-decoration: none; padding: 15px 25px; border-radius: 25px; font-size: 14px; font-weight: 600; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4); margin: 5px;">
                    📞 Call Us
                </a>
            </div>

        </div>

        <!-- Footer -->
        <div style="background: #f8f9fa; padding: 25px 30px; text-align: center; border-top: 1px solid #e1e5e9;">
            <p style="margin: 0; color: #888; font-size: 12px;">
                📞 For urgent support: <a href="tel:${mobile}" style="color: #56ab2f; text-decoration: none;">${mobile}</a>
            </p>
            <p style="margin: 8px 0 0; color: #888; font-size: 12px;">
                © 2024 IT-CCTV Support. All rights reserved.
            </p>
        </div>

    </div>

</body>
</html>
`
    };

    console.log('Sending emails to admin and user...');
    
    // Send both emails
    const [adminResult, userResult] = await Promise.all([
      transporter.sendMail(adminMailOptions),
      transporter.sendMail(userMailOptions)
    ]);

    console.log('Admin email sent:', adminResult.messageId);
    console.log('User email sent:', userResult.messageId);
    
    return { 
      success: true, 
      messageId: adminResult.messageId,
      userMessageId: userResult.messageId
    };
    
  } catch (error) {
    console.error('Error sending contact emails:', error);
    return { success: false, error: error.message };
  }
};

export default sendEmail;
export { sendContactEmail };
