const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
    title: String,
    description: String,
    fullDescription: String,
    imageSrc: String,
    date: Date,
    status: String
});

const Article = mongoose.model('Article', articleSchema);

module.exports = Article;