require('dotenv').config();
const mongoose = require('mongoose');

const articles = [];

// --- Define the Schema and Model (must match server.js) ---
const articleSchema = new mongoose.Schema({
    title: String,
    description: String,
    fullDescription: String,
    imageSrc: String,
    date: Date,
    status: String
});
const Article = mongoose.model('Article', articleSchema);

// --- Seeder Function ---
const importData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        await Article.deleteMany(); // Clear existing articles
        await Article.insertMany(articles); // Insert new articles

        console.log('Data successfully imported to MongoDB!');
        process.exit();
    } catch (error) {
        console.error('Error with data import:', error);
        process.exit(1);
    }
};

importData();