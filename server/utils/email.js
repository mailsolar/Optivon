const nodemailer = require('nodemailer');

// Create test account for development (Ethereal)
// In production, this would be replaced by actual SMTP credentials
let transporter;

// Create transport based on service or host
const createTransporter = () => {
    // 1. Check if using Gmail Service explicitly (simplifies config)
    if (process.env.EMAIL_HOST && process.env.EMAIL_HOST.includes('gmail')) {
        return nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '', // Remove spaces
            },
        });
    }

    // 2. Generic SMTP
    return nodemailer.createTransport({
        host: process.env.EMAIL_HOST || "smtp.gmail.com",
        port: Number(process.env.EMAIL_PORT) || 587,
        secure: process.env.EMAIL_SECURE === 'true', // true for 465, false for others
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS ? process.env.EMAIL_PASS.replace(/\s+/g, '') : '', // Remove spaces
        },
    });
};

const initEmailService = async () => {
    try {
        // Use environment variables if available
        if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
            transporter = createTransporter();

            // Verify connection configuration
            await transporter.verify();
            console.log("Email Service Initialized (Production Mode) - Connection Verified");
        } else {
            console.log("Email Service Initialized (Dev/Mock Mode - Check Server Logs for OTP)");
        }
    } catch (err) {
        console.error("Failed to initialize email service:", err.message);
        console.error("Check your EMAIL_USER and EMAIL_PASS in .env");
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
            from: `"Optivon Security" <${process.env.EMAIL_USER}>`, // Use authenticated email
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
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
