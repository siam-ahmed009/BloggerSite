const express = require('express');
const SiteContent = require('../models/SiteContent');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// --- GET SITE CONTENT (Public) ---
router.get('/', async (req, res) => {
  try {
    let content = await SiteContent.findOne();

    if (!content) {
      // Create default site content document if it doesn't exist
      content = await new SiteContent({
        heroTitle: 'Welcome to Our Website!',
        heroDescription: 'This is the default hero description.',
        aboutTitle: 'About Us',
        aboutDescription1: 'We are passionate about...',
        aboutDescription2: 'Our mission is to...',
        footerAboutImage: '',
        footerAboutText: 'Default footer message.',
        heroImage: '' // Optional default value
      }).save();
    }

    res.json(content);
  } catch (error) {
    console.error('Error fetching site content:', error);
    res.status(500).json({ message: 'Error fetching site content' });
  }
});

// --- UPDATE SITE CONTENT (Admin Only) ---
router.put('/', auth, async (req, res) => {
  try {
    let content = await SiteContent.findOne();

    if (!content) {
      content = new SiteContent(req.body);
    } else {
      // Merge updates into existing document
      Object.assign(content, req.body);
    }

    const saved = await content.save();
    console.log('Content saved:', saved);
    res.status(200).json(saved);

  } catch (error) {
    console.error('Error saving site content:', error);
    res.status(400).json({ message: 'Error updating site content', error });
  }
});

module.exports = router;
