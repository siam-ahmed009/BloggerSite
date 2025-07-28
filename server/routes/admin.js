const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const router = express.Router();

// --- Admin Registration (Run this once to create your admin user) ---
// NOTE: In a real application, you might make this a protected route or a setup script.
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = new Admin({ username, password });
        await admin.save();
        res.status(201).send('Admin user created successfully!');
    } catch (error) {
        res.status(400).json({ message: 'Error creating admin', error });
    }
});

// --- Admin Login ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const admin = await Admin.findOne({ username });
        if (!admin) {
            return res.status(401).send('Invalid credentials');
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return res.status(401).send('Invalid credentials');
        }

        // Create and sign a JWT
        const token = jwt.sign(
            { id: admin._id, username: admin.username },
            process.env.JWT_SECRET || 'your_default_secret_key', // Add a JWT_SECRET to your .env file!
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Server error during login', error });
    }
});

module.exports = router;