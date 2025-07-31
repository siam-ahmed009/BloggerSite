const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Article = require('../models/Article');
const { protect } = require('../middleware/authMiddleware'); // This path is now valid

// Multer configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'server/uploads/'),
    filename: (req, file, cb) => cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

// Routes
router.get('/', async (req, res) => {
    const articles = await Article.find({}).sort({ createdAt: -1 });
    res.json(articles);
});

router.post('/', protect, upload.single('image'), async (req, res) => {
    const { title, content, author, published } = req.body;
    const imagePath = req.file ? `/uploads/${req.file.filename}` : '/img/default.jpg';
    const article = new Article({ title, content, author, image: imagePath, published: published === 'true' });
    const createdArticle = await article.save();
    res.status(201).json(createdArticle);
});

router.put('/:id', protect, upload.single('image'), async (req, res) => {
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
        res.status(404).send('Article not found');
    }
});

router.delete('/:id', protect, async (req, res) => {
    const article = await Article.findById(req.params.id);
    if (article) {
        await article.deleteOne();
        res.json({ message: 'Article removed' });
    } else {
        res.status(404).send('Article not found');
    }
});

module.exports = router;