const express = require('express');
const Article = require('../models/Article'); // This path is now correct
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// --- PUBLIC ROUTES ---
// GET all articles
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find().sort({ date: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error });
    }
});

// GET a single article by ID
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (!article) {     

            return res.status(404).json({ message: 'Article not found' });
        }
        res.json(article);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching article', error });
    }
});

router.post('/', auth, async (req, res) => {
  try {
    const article = new Article(req.body);
    const saved = await article.save();
    res.json(saved);
  } catch (err) {
    res.status(400).json({ message: 'Failed to save article', error: err });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const updated = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: 'Failed to update article', error: err });
  }
});


// DELETE an article by ID
router.delete('/:id', auth, async (req, res) => {
    try {
        await Article.findByIdAndDelete(req.params.id);
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting article', error });
    }
});



module.exports = router;