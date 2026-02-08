const nodemailer = require('nodemailer');

// Create test account for development (Ethereal)
// In production, this would be replaced by actual SMTP credentials
let transporter;

const initEmailService = async () => {
    try {
        const testAccount = await nodemailer.createTestAccount();

        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: testAccount.user, // generated ethereal user
                pass: testAccount.pass, // generated ethereal password
            },
        });

        console.log("Email Service Initialized (Mock/Ethereal mode)");
        console.log("Mock Account User:", testAccount.user);
    } catch (err) {
        console.error("Failed to default email service", err);
    }
};

// Initialize immediately
initEmailService();

const sendEmail = async (to, subject, html) => {
    if (!transporter) {
        console.warn("Email Transporter not ready yet. Simulating send.");
        console.log(`[EMAIL SIMULATION] To: ${to} | Subject: ${subject}`);
        return;
    }

    try {
        const info = await transporter.sendMail({
            from: '"Optivon Security" <security@optivon.com>',
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        const previewUrl = nodemailer.getTestMessageUrl(info);
        console.log("Preview URL: %s", previewUrl);
        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

const sendOTP = async (email, otp) => {
    const subject = "Your Optivon Verification Code";
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Verification Code</h2>
            <p>Your verification code is:</p>
            <h1 style="color: #2962FF; letter-spacing: 5px;">${otp}</h1>
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, subject, html);
};

const sendPasswordReset = async (email, link) => {
    const subject = "Reset Your Optivon Password";
    const html = `
        <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Password Reset Request</h2>
            <p>You requested to reset your password. Click the link below to proceed:</p>
            <a href="${link}" style="background-color: #2962FF; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
            <p>If you didn't request this, please ignore this email.</p>
        </div>
    `;
    return sendEmail(email, subject, html);
};

module.exports = { sendOTP, sendPasswordReset };
