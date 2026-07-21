const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendOtpEmail(toEmail, otp) {
  await transporter.sendMail({
    from: process.env.SMTP_FROM || process.env.SMTP_USER,
    to: toEmail,
    subject: 'Your Readify verification code',
    text: `Your OTP is ${otp}. It expires in 10 minutes.`,
    html: `<p>Your Readify verification code is <b>${otp}</b>. It expires in 10 minutes.</p>`,
  });
}

module.exports = { sendOtpEmail };