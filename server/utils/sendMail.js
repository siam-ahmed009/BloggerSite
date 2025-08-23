const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASS,
  },
});

async function sendAdminNotification({ name, email, subject, message }) {
  const mailOptions = {
    from: `"Website Contact Form" <${process.env.ADMIN_EMAIL}>`,
    to: process.env.ADMIN_EMAIL,
    subject: `New Contact Message - ${subject}`,
    text: `
New contact form message received:

Name: ${name}
Email: ${email}
Subject: ${subject}

Message:
${message}
    `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { sendAdminNotification };
