const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Article = require('../models/Article'); // Make sure this path is correct
const { protect } = require('../middleware/authMiddleware'); // Make sure this path is correct

// Multer storage configuration for file uploads
const storage = multer.diskStorage({
    destination(req, file, cb) {
        // This saves files to 'server/uploads/'
        cb(null, 'server/uploads/');
    },
    filename(req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});

const upload = multer({ storage });

// --- API ROUTES ---

// @desc    Get all articles
// @route   GET /api/articles
// @access  Public
router.get('/', async (req, res) => {
    try {
        const articles = await Article.find({}).sort({ createdAt: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Get a single article by ID
// @route   GET /api/articles/:id
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (article) {
            res.json(article);
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});


// @desc    Create a new article (Admin Only)
// @route   POST /api/articles
// @access  Private
router.post('/', protect, upload.single('image'), async (req, res) => {
    const { title, content, author, published } = req.body;
    // Create a server-relative path for the image
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '/img/default.jpg';

    const article = new Article({
        title,
        content,
        author,
        image: imagePath,
        published: published === 'true'
    });

    try {
        const createdArticle = await article.save();
        res.status(201).json(createdArticle);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Error creating article' });
    }
});

// @desc    Update an article (Admin Only)
// @route   PUT /api/articles/:id
// @access  Private
router.put('/:id', protect, upload.single('image'), async (req, res) => {
    const { title, content, author, published } = req.body;
    
    try {
        const article = await Article.findById(req.params.id);

        if (article) {
            article.title = title || article.title;
            article.content = content || article.content;
            article.author = author || article.author;
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
        console.error(error);
        res.status(400).json({ message: 'Error updating article' });
    }
});


// @desc    Delete an article (Admin Only)
// @route   DELETE /api/articles/:id
// @access  Private
router.delete('/:id', protect, async (req, res) => {
    try {
        const article = await Article.findById(req.params.id);
        if (article) {
            await article.deleteOne();
            res.json({ message: 'Article removed' });
        } else {
            res.status(404).json({ message: 'Article not found' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;