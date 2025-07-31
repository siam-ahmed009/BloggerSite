const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const { protect } = require('../middleware/authMiddleware'); // Corrected import

// GET site content
router.get('/', async (req, res) => {
    try {
        let content = await SiteContent.findOne();
        if (!content) {
            content = await SiteContent.create({});
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT (update) site content - This is the corrected route
router.put('/', protect, async (req, res) => {
    try {
        const updatedContent = await SiteContent.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true
        });
        res.json(updatedContent);
    } catch (error) {
        res.status(400).json({ message: 'Error updating content' });
    }
});

module.exports = router;