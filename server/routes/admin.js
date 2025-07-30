// const express = require('express');
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// const Admin = require('../models/Admin');
// const router = express.Router();

// // --- Admin Registration (Run this once to create your admin user) ---
// // NOTE: In a real application, you might make this a protected route or a setup script.
// router.post('/register', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const admin = new Admin({ username, password });
//         await admin.save();
//         res.status(201).send('Admin user created successfully!');
//     } catch (error) {
//         res.status(400).json({ message: 'Error creating admin', error });
//     }
// });

// // --- Admin Login ---
// router.post('/login', async (req, res) => {
//     try {
//         const { username, password } = req.body;
//         const admin = await Admin.findOne({ username });
//         if (!admin) {
//             return res.status(401).send('Invalid credentials');
//         }

//         const isMatch = await bcrypt.compare(password, admin.password);
//         if (!isMatch) {
//             return res.status(401).send('Invalid credentials');
//         }

//         // Create and sign a JWT
//         const token = jwt.sign(
//             { id: admin._id, username: admin.username },
//             process.env.JWT_SECRET || 'your_default_secret_key', // Add a JWT_SECRET to your .env file!
//             { expiresIn: '1h' } // Token expires in 1 hour
//         );

//         res.json({ token });

//     } catch (error) {
//         res.status(500).json({ message: 'Server error during login', error });
//     }
// });

// module.exports = router;
// document.addEventListener('DOMContentLoaded', () => {
//     // ... (your existing code to check for token)

//     const sectionSelector = document.getElementById('section-selector');
//     const siteContentSection = document.getElementById('site-content-section');
//     const articlesSection = document.getElementById('articles-section');
//     const messagesSection = document.getElementById('messages-section');
    
//     // Section visibility logic
//     sectionSelector.addEventListener('change', () => {
//         siteContentSection.classList.add('hidden');
//         articlesSection.classList.add('hidden');
//         messagesSection.classList.add('hidden');

//         const selectedSection = document.getElementById(`${sectionSelector.value}-section`);
//         if (selectedSection) {
//             selectedSection.classList.remove('hidden');
//         }
//     });

//     // Article form submission with image upload
//     const articleForm = document.getElementById('article-form');
//     articleForm.addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const id = document.getElementById('article-id').value;
//         const formData = new FormData();
//         formData.append('title', document.getElementById('article-title').value);
//         formData.append('content', document.getElementById('article-content').value);
//         formData.append('author', document.getElementById('article-author').value);
//         formData.append('published', document.getElementById('article-published').checked);
//         const imageFile = document.getElementById('article-image').files[0];
//         if (imageFile) {
//             formData.append('image', imageFile);
//         }

//         const method = id ? 'PUT' : 'POST';
//         const url = id ? `http://localhost:5000/api/articles/${id}` : 'http://localhost:5000/api/articles';

//         await fetch(url, {
//             method: method,
//             headers: { 'Authorization': `Bearer ${token}` },
//             body: formData
//         });
        
//         loadArticles();
//         articleForm.reset();
//     });

//     // Function to load articles (similar to before but with edit/delete)
//     // ...

//     // Load and display messages
//     async function loadMessages() {
//         const res = await fetch('http://localhost:5000/api/contact/messages', {
//             headers: { 'Authorization': `Bearer ${token}` }
//         });
//         const messages = await res.json();
//         const messageList = document.getElementById('message-list');
//         messageList.innerHTML = messages.map(msg => `
//             <div class="message-item" style="border: 1px solid #ccc; padding: 10px; margin-bottom: 10px;">
//                 <p><strong>From:</strong> ${msg.name} (${msg.email})</p>
//                 <p><strong>Subject:</strong> ${msg.subject}</p>
//                 <p>${msg.message}</p>
//                 <p><strong>Status:</strong> ${msg.responded ? 'Responded' : 'New'}</p>
//                 <button class="reply-btn" data-id="${msg._id}" data-email="${msg.email}" data-subject="${msg.subject}">Reply</button>
//             </div>
//         `).join('');
//     }

//     // Event delegation for reply buttons
//     document.getElementById('message-list').addEventListener('click', (e) => {
//         if (e.target.classList.contains('reply-btn')) {
//             const modal = document.getElementById('reply-modal');
//             document.getElementById('reply-message-id').value = e.target.dataset.id;
//             document.getElementById('reply-to-email').value = e.target.dataset.email;
//             document.getElementById('reply-subject').value = e.target.dataset.subject;
//             modal.style.display = 'block';
//         }
//     });

//     // Close modal
//     document.querySelector('.close-button').addEventListener('click', () => {
//         document.getElementById('reply-modal').style.display = 'none';
//     });

//     // Handle reply form submission
//     document.getElementById('reply-form').addEventListener('submit', async (e) => {
//         e.preventDefault();
//         const replyData = {
//             messageId: document.getElementById('reply-message-id').value,
//             to: document.getElementById('reply-to-email').value,
//             subject: document.getElementById('reply-subject').value,
//             text: document.getElementById('reply-text').value
//         };

//         await fetch('http://localhost:5000/api/contact/reply', {
//             method: 'POST',
//             headers: {
//                 'Content-Type': 'application/json',
//                 'Authorization': `Bearer ${token}`
//             },
//             body: JSON.stringify(replyData)
//         });

//         document.getElementById('reply-modal').style.display = 'none';
//         loadMessages();
//     });

//     // Initial loads
//     loadArticles();
//     loadMessages();
// });

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

// @desc    Authenticate admin & get token
// @route   POST /api/admin/login
// @access  Public
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    // This is a basic example. In a real application, you would
    // look up the user in a database and check their hashed password.
    const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'password123';

    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Create a token
        const token = jwt.sign({ id: 'admin_user' }, process.env.JWT_SECRET, {
            expiresIn: '1h', // Token expires in 1 hour
        });

        res.json({ token });
    } else {
        res.status(401).json({ message: 'Invalid username or password' });
    }
});

module.exports = router;