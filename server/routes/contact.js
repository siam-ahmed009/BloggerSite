const express = require('express');
const router = express.Router();
const ContactMessage = require('../models/ContactMessage');
const nodemailer = require('nodemailer');
const { protect } = require('../middleware/authMiddleware');

// Nodemailer transporter setup - replace with your email provider details
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
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

        // Email to admin
        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.ADMIN_EMAIL,
            subject: `New Message from BloggerSite: ${subject}`,
            html: `<p>You have a new contact request.</p>
                   <h3>Contact Details</h3>
                   <ul>
                     <li>Name: ${name}</li>
                     <li>Email: ${email}</li>
                   </ul>
                   <h3>Message</h3>
                   <p>${message}</p>`
        };

        await transporter.sendMail(mailOptions);
        res.status(201).json({ message: 'Message sent successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error, please try again later.' });
    }
});

// @desc    Get all contact messages
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

// @desc    Reply to a contact message
// @route   POST /api/contact/reply
// @access  Private
router.post('/reply', protect, async (req, res) => {
    const { to, subject, text, messageId } = req.body;

    try {
        const mailOptions = {
            from: process.env.ADMIN_EMAIL,
            to: to,
            subject: `Re: ${subject}`,
            text: text
        };

        await transporter.sendMail(mailOptions);
        await ContactMessage.findByIdAndUpdate(messageId, { responded: true });
        res.status(200).json({ message: 'Reply sent successfully!' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Failed to send reply' });
    }
});

module.exports = router;