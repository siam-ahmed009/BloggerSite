const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Article = require('../models/Article');
const { protect } = require('../middleware/authMiddleware');

// Multer configuration for handling file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'server/uploads/'),
    filename: (req, file, cb) => cb(null, `article-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// GET all articles (Public)
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({}).sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch articles' });
    }
});

// GET a single article by ID (Public)
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (article) {
            res.json(article);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});

// POST (create) a new article (Protected)
router.post('/', protect, upload.single('image'), async (req, res) => {
    try {
        const { title, content, author, published } = req.body;
        const image = req.file ? `/uploads/${req.file.filename}` : undefined;
        const article = await Article.create({ title, content, author, published: published === 'true', image });
        res.status(201).json(article);
    } catch (error) {
        res.status(400).json({ message: 'Failed to create article' });
    }
});

// PUT (update) an article (Protected)
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    try {
        const { title, content, author, published } = req.body;
        const article = await Article.findById(req.params.id);

        if (article) {
            article.title = title;
            article.content = content;
            article.author = author;
            article.published = published === 'true';
            if (req.file) {
                article.image = `/uploads/${req.file.filename}`;
            }
            const updatedArticle = await article.save();
            res.json(updatedArticle);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(400).json({ message: 'Failed to update article' });
    }
});

// DELETE an article (Protected)
router.delete('/:id', protect, async (req, res) => {
    try {
        const result = await Article.deleteOne({ _id: req.params.id });
        if (result.deletedCount > 0) {
            res.json({ message: 'Article removed' });
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete article' });
    }
});

module.exports = router;