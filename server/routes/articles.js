const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const Article = require('../models/Article');
const { protect } = require('../middleware/authMiddleware');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'server/uploads/'),
    filename: (req, file, cb) => cb(null, `article-${Date.now()}${path.extname(file.originalname)}`)
});
const upload = multer({ storage });

router.get('/', async (req, res) => res.json(await Article.find({}).sort({ createdAt: -1 })));
router.get('/:id', async (req, res) => res.json(await Article.findById(req.params.id)));

router.post('/', protect, upload.single('image'), async (req, res) => {
    const { title, content, author, published } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : undefined;
    const article = await Article.create({ title, content, author, published: published === 'true', image });
    res.status(201).json(article);
});

router.put('/:id', protect, upload.single('image'), async (req, res) => {
    const { title, content, author, published } = req.body;
    const article = await Article.findById(req.params.id);
    if (article) {
        article.title = title;
        article.content = content;
        article.author = author;
        article.published = published === 'true';
        if (req.file) article.image = `/uploads/${req.file.filename}`;
        const updatedArticle = await article.save();
        res.json(updatedArticle);
    } else {
        res.status(404).json({ message: 'Article not found' });
    }
});

router.delete('/:id', protect, async (req, res) => {
    const result = await Article.deleteOne({ _id: req.params.id });
    if (result.deletedCount > 0) res.json({ message: 'Article removed' });
    else res.status(404).json({ message: 'Article not found' });
});

module.exports = router;