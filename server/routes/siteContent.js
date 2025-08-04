// const express = require('express');
// const router = express.Router();
// const SiteContent = require('../models/SiteContent');
// const { protect } = require('../middleware/authMiddleware');

// router.get('/', async (req, res) => {
//     let content = await SiteContent.findOne();
//     if (!content) {
//         content = await SiteContent.create({});
//     }
//     res.json(content);
// });

// router.put('/', protect, async (req, res) => {
//     try {
//         const updatedContent = await SiteContent.findOneAndUpdate({}, req.body, { new: true, upsert: true });
//         res.json(updatedContent);
//     } catch (error) {
//         res.status(400).json({ message: 'Failed to update content' });
//     }
// });

// module.exports = router;

const express = require('express');
const router = express.Router();
const SiteContent = require('../models/SiteContent');
const { protect } = require('../middleware/authMiddleware');

// Get site content (Protected)
router.get('/', protect, async (req, res) => {
    try {
        const content = await SiteContent.findOne({});
        res.json(content || {});
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch site content' });
    }
});

// Update site content (Protected)
router.put('/', protect, async (req, res) => {
    try {
        const { heroTitle, heroDescription, aboutTitle, aboutDescription1, footerAboutText } = req.body;
        const updatedContent = await SiteContent.findOneAndUpdate({}, {
            heroTitle,
            heroDescription,
            aboutTitle,
            aboutDescription1,
            footerAboutText
        }, { new: true, upsert: true });

        res.json(updatedContent);
    } catch (error) {
        res.status(400).json({ message: 'Failed to update site content' });
    }
});

module.exports = router;