const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const { protect } = require('../middleware/authMiddleware');

router.get('/', async (req, res) => {
    let content = await SiteContent.findOne();
    if (!content) {
        content = await SiteContent.create({});
    }
    res.json(content);
});

router.put('/', protect, async (req, res) => {
    try {
        const updatedContent = await SiteContent.findOneAndUpdate({}, req.body, { new: true, upsert: true });
        res.json(updatedContent);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update content' });
    }
});

module.exports = router;