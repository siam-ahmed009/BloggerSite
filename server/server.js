// // Load environment variables from .env file
// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// // Initialize Express app
// const app = express();
// const PORT = process.env.PORT || 5000;

// // Middleware
// app.use(cors()); // Enable Cross-Origin Resource Sharing
// app.use(express.json()); // Allow the server to accept JSON in the request body

// // --- Database Connection ---
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('Successfully connected to MongoDB Atlas!'))
//     .catch(error => console.error('Error connecting to MongoDB:', error));

// // --- Article Schema and Model ---
// const articleSchema = new mongoose.Schema({
//     title: String,
//     description: String,
//     fullDescription: String,
//     imageSrc: String,
//     date: Date,
//     status: String
// });

// const Article = mongoose.model('Article', articleSchema);

// // --- API Routes ---
// // Route to get all articles
// app.get('/api/articles', async (req, res) => {
//     try {
//         const articles = await Article.find().sort({ date: -1 }); // Get all articles, sorted by date
//         res.json(articles);
//     } catch (error) {
//         res.status(500).json({ message: 'Error fetching articles', error });
//     }
// });

// // --- Start the Server ---
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });



// Load environment variables from .env file
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); // To parse form data
app.set('view engine', 'ejs'); // Set EJS as the view engine
app.set('views', path.join(__dirname, 'views')); // Specify the views directory

// Session configuration
app.use(session({
    secret: 'a-very-secret-key-that-should-be-in-env', // In production, use a secret from your .env file
    resave: false,
    saveUninitialized: true,
}));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

// --- Article Schema and Model ---
const articleSchema = new mongoose.Schema({
    title: String,
    description: String,
    fullDescription: String,
    imageSrc: String,
    date: { type: Date, default: Date.now },
    status: String
});
const Article = mongoose.model('Article', articleSchema);

// A simple User model (for a real app, this would be in its own file)
const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// --- Public API Routes (for your main website) ---
app.get('/api/articles', async (req, res) => {
    try {
        const articles = await Article.find({ status: "published" }).sort({ date: -1 });
        res.json(articles);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching articles', error });
    }
});

// --- Admin Authentication Middleware ---
const isAuthenticated = (req, res, next) => {
    if (req.session.userId) {
        return next();
    }
    res.redirect('/admin/login');
};

// --- Admin Routes ---
app.get('/admin', isAuthenticated, (req, res) => {
    res.redirect('/admin/dashboard');
});

// Login Page
app.get('/admin/login', (req, res) => {
    res.render('login', { error: null });
});

// Login Logic
app.post('/admin/login', async (req, res) => {
    const { username, password } = req.body;
    // For a real app, you would find the user in the database.
    // Here we use hardcoded values for simplicity.
    if (username === 'admin' && password === 'password123') {
        req.session.userId = 'admin_user'; // Mock user ID
        return res.redirect('/admin/dashboard');
    }
    res.render('login', { error: 'Invalid username or password' });
});

// Admin Dashboard - List all articles
app.get('/admin/dashboard', isAuthenticated, async (req, res) => {
    const articles = await Article.find().sort({ date: -1 });
    // This is a new EJS file we need to create
    res.render('dashboard', { articles });
});

// Add more admin routes here for Creating, Updating, and Deleting articles later...

// --- Start the Server ---
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});