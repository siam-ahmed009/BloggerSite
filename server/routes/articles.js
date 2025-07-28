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

// --- PROTECTED ADMIN ROUTES ---
// POST a new article
router.post('/', auth, async (req, res) => {
    try {
        const newArticle = new Article(req.body);
        await newArticle.save();
        res.status(201).json(newArticle);
    } catch (error) {
        res.status(400).json({ message: 'Error creating article', error });
    }
});

// PUT (update) an article by ID
router.put('/:id', auth, async (req, res) => {
    try {
        const updatedArticle = await Article.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedArticle);
    } catch (error) {
        res.status(400).json({ message: 'Error updating article', error });
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