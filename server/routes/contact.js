const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/authMiddleware'); // Assuming your middleware is here

// Configure Nodemailer to send emails
const transporter = nodemailer.createTransport({
    service: 'gmail', // Or your email provider
    auth: {
        user: process.env.EMAIL_USER, // Your email from .env
        pass: process.env.EMAIL_PASS  // Your email app password from .env
    }
});

// @desc    Submit a new contact message
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
    const { name, email, subject, message } = req.body;
    if (!name || !email || !subject || !message) {
        return res.status(400).json({ message: 'Please fill out all fields.' });
    }

    try {
        const newMessage = new ContactMessage({ name, email, subject, message });
        await newMessage.save();

        // Send email notification to the admin
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.ADMIN_EMAIL, // Admin's email from .env
            subject: `New Contact Form Message: ${subject}`,
            html: `<p>You have a new message from your website's contact form.</p>
                   <h3>Details:</h3>
                   <ul>
                     <li><strong>Name:</strong> ${name}</li>
                     <li><strong>Email:</strong> ${email}</li>
                   </ul>
                   <h3>Message:</h3>
                   <p>${message}</p>`
        };
        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: 'Message sent successfully! We will get back to you soon.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});

// @desc    Get all contact messages (Admin only)
// @route   GET /api/contact/messages
// @access  Private
router.get('/messages', protect, async (req, res) => {
    try {
        const messages = await ContactMessage.find().sort({ createdAt: -1 });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// @desc    Reply to a contact message (Admin only)
// @route   POST /api/contact/reply
// @access  Private
router.post('/reply', protect, async (req, res) => {
    const { to, subject, text, messageId } = req.body;
    try {
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: to,
            subject: subject,
            text: text
        };

        await transporter.sendMail(mailOptions);
        // Mark the message as responded in the database
        await ContactMessage.findByIdAndUpdate(messageId, { responded: true });
        res.status(200).json({ message: 'Reply sent successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send reply' });
    }
});

module.exports = router;