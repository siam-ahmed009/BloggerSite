const express = require('express');
const SiteContent = require('../models/SiteContent');
const auth = require('../middleware/authMiddleware'); // Our authentication gatekeeper
const router = express.Router();

// GET: Fetch the site content (Public)
// We use findOne() because there will only ever be one document
router.get('/', async (req, res) => {
    try {
        let content = await SiteContent.findOne();
        if (!content) {
            // If no content exists, create a default one to avoid errors
            content = await new SiteContent({
                heroTitle: 'Default Title',
                heroDescription: 'Default Description.'
            }).save();
        }
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching site content' });
    }
});

router.put('/', auth, async (req, res) => {
    try {
        // Find the single document for site content
        let content = await SiteContent.findOne();

        if (content) {
            // If it exists, update it with the data from the form
            Object.assign(content, req.body);
        } else {
            // If it doesn't exist for some reason, create a new one
            content = new SiteContent(req.body);
        }

        const updatedContent = await content.save();
        res.json(updatedContent);

    } catch (error) {
        // Log the full error on the server for debugging
        console.error("Error saving site content:", error); 
        res.status(400).json({ message: 'Error updating site content' });
    }
});
module.exports = router;