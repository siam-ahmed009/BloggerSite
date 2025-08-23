const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const authenticateAdmin = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
require('dotenv').config();

// Configure SMTP transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: parseInt(process.env.SMTP_PORT) === 465, // true for 465
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

/**
 * GET - Fetch all messages (Admin only)
 */
router.get('/', authenticateAdmin, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

/**
 * POST - Save message & send email notification
 */
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Save message to DB
    const newMessage = new Message({ name, email, subject, message });
    await newMessage.save();
    console.log('✅ Message saved to DB');

    // Send email to admin
    const mailOptions = {
      from: `"Website Contact" <${process.env.SMTP_USER}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `📩 New Contact Form Message: ${subject}`,
      html: `
        <h3>New Contact Form Message</h3>
        <p><b>Name:</b> ${name}</p>
        <p><b>Email:</b> ${email}</p>
        <p><b>Subject:</b> ${subject}</p>
        <p><b>Message:</b></p>
        <p>${message}</p>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Email send error:', error);
        return res.status(500).json({ message: 'Message saved but failed to send email' });
      }
      console.log('✅ Email sent:', info.response);
      res.status(201).json({ message: 'Message saved and email sent!' });
    });

  } catch (err) {
    console.error('❌ Error saving/sending message:', err);
    res.status(500).json({ message: 'Failed to save/send message' });
  }
});

router.post('/:id/reply', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ message: 'Reply content is required' });
  }

  try {
    const message = await Message.findById(id);
    if (!message) {
      return res.status(404).json({ message: 'Message not found' });
    }

    // Save reply in DB
    message.reply = reply;
    message.repliedAt = new Date();
    await message.save();

    // Send reply email to the original user
    const mailOptions = {
      from: `"Admin" <${process.env.SMTP_USER}>`,
      to: message.email, // send back to the sender
      subject: `Re: ${message.subject}`,
      html: `
        <p>Hi ${message.name},</p>
        <p>${reply}</p>
        <hr>
        <small>This reply is regarding your message sent on our website.</small>
      `
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error('❌ Error sending reply email:', error);
        return res.status(500).json({ message: 'Reply saved but failed to send email' });
      }
      console.log('✅ Reply email sent:', info.response);
      res.json({ message: 'Reply saved and email sent to user successfully!' });
    });

  } catch (err) {
    console.error('❌ Error saving/sending reply:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/**
 * PUT - Reply to a message & update
 */
router.put('/:id/reply', authenticateAdmin, async (req, res) => {
  const { reply } = req.body;

  if (!reply) {
    return res.status(400).json({ error: 'Reply text is required' });
  }

  try {
    const updatedMessage = await Message.findByIdAndUpdate(
      req.params.id,
      { reply, repliedAt: new Date() },
      { new: true }
    );

    if (!updatedMessage) {
      return res.status(404).json({ error: 'Message not found' });
    }

    res.json({ message: 'Reply saved successfully!', updatedMessage });
  } catch (err) {
    console.error('❌ Error updating reply:', err);
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

module.exports = router;




// import express from 'express';
// import Message from '../models/Message.js'; //changed messageModel to Message.js
// import authenticateAdmin from '../middleware/authMiddleware.js'; //changed authMiddleware to authMiddleware.js
// import nodemailer from 'nodemailer';
// import dotenv from 'dotenv';

// dotenv.config();


// // const express = require('express'); //two of them are commented out
// const router = express.Router();
// // const Message = require('../models/Message');
// const nodemailer = require('nodemailer');



// // const transporter = nodemailer.createTransport({
// //     service: 'gmail',
// //     auth: {
// //         user: 'ahmedsiam.aliexpress@gmail.com', 
// //         pass: 'dmlr akms eyol nnuy'                
// //     }
// // }); //comented out


// const transporter = nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port: process.env.SMTP_PORT,
//   secure: process.env.SMTP_PORT == 465, // true for 465, false for 587
//   auth: {
//     user: process.env.SMTP_USER,
//     pass: process.env.SMTP_PASS
//   }
// });

// router.get('/', async (req, res) => {
//   try {
//     const messages = await Message.find().sort({ receivedAt: -1 });
//     res.json(messages);
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to fetch messages' });
//   }
// });

// // router.post('/', async (req, res) => {
// //   try {
// //     const { name, email, subject, message } = req.body;
// //     const newMsg = new Message({ name, email, subject, message });
// //     await newMsg.save();
// //     res.status(201).json({ message: 'Message saved successfully' });
// //   } catch (err) {
// //     res.status(400).json({ error: 'Failed to submit message' });
// //   }
// // }); //commented out

// // POST - Save message & send email
// router.post('/', async (req, res) => {
//   try {
//     const { name, email, subject, message } = req.body;

//     // Save to database
//     const newMsg = new Message({ name, email, subject, message });
//     await newMsg.save();

//     // Send email to admin
//     await transporter.sendMail({
//       from: `"Website Contact" <${process.env.SMTP_USER}>`,
//       to: process.env.ADMIN_EMAIL,
//       subject: `New Contact Form Message: ${subject}`,
//       html: `
//         <h3>New Contact Form Message</h3>
//         <p><strong>Name:</strong> ${name}</p>
//         <p><strong>Email:</strong> ${email}</p>
//         <p><strong>Subject:</strong> ${subject}</p>
//         <p><strong>Message:</strong></p>
//         <p>${message}</p>
//       `
//     });

//     res.status(201).json({ message: 'Message saved and email sent!' });

//   } catch (err) {
//     console.error('Error sending message:', err);
//     res.status(500).json({ message: 'Failed to save/send message' });
//   }
// });

// export default router;



// // POST /api/messages/:id/reply
// router.post('/:id/reply', async (req, res) => {
//   const { id } = req.params;
//   const { reply } = req.body;

//   if (!reply) {
//     return res.status(400).json({ message: 'Reply content is required' });
//   }

//   try {
//     const message = await Message.findById(id);
//     if (!message) {
//       return res.status(404).json({ message: 'Message not found' });
//     }

//     // Save reply
//     message.reply = reply;
//     message.repliedAt = new Date();
//     await message.save();

//     // Optional: send email to user
//     // await sendEmail(message.email, 'Reply from Admin', reply);

//     res.json({ message: 'Reply saved successfully' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Server error' });
//   }
// });





// //  3. Reply to a message (updates existing message with reply text)
// router.put('/:id/reply', async (req, res) => {
//   const { reply } = req.body;

//   if (!reply) {
//     return res.status(400).json({ error: 'Reply text is required' });
//   }

//   try {
//     const updatedMessage = await Message.findByIdAndUpdate(
//       req.params.id,
//       { reply, repliedAt: new Date() },
//       { new: true }
//     );

//     if (!updatedMessage) {
//       return res.status(404).json({ error: 'Message not found' });
//     }

//     res.json({ message: 'Reply saved successfully!', updatedMessage });
//   } catch (err) {
//     res.status(500).json({ error: 'Failed to send reply' });
//   }
// });

// module.exports = router;





