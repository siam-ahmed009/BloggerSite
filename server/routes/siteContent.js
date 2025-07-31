const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent'); // Make sure this model exists
const { protect } = require('../middleware/authMiddleware'); // Correctly import the 'protect' function

// @desc    Get site content
// @route   GET /api/site-content
// @access  Public
router.get('/', async (req, res) => {
    try {
        // Find the one and only content document, or create it if it doesn't exist
        let content = await SiteContent.findOne();
        if (!content) {
            content = await SiteContent.create({});
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Update site content
// @route   PUT /api/site-content
// @access  Private (Admin Only)
router.put('/', protect, async (req, res) => { // Use 'protect' as middleware here
    try {
        const updatedContent = await SiteContent.findOneAndUpdate({}, req.body, {
            new: true,
            upsert: true // Creates the document if it doesn't exist
        });
        res.json(updatedContent);
    } catch (error) {
        res.status(400).json({ message: 'Error updating content' });
    }
});

module.exports = router;