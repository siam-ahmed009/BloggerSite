const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

dotenv.config();

// Route imports
const adminRoutes = require('./routes/admin');
const articleRoutes = require('./routes/articles');
const siteContentRoutes = require('./routes/siteContent');
const contactRoutes = require('./routes/contact');

const app = express();

// Middleware
app.use(cors());
app.use(express.json()); // Replaces bodyParser.json()
app.use(express.urlencoded({ extended: false })); // Replaces bodyParser.urlencoded()

// Serve static files from the root project folder
app.use(express.static(path.join(__dirname, '..')));
// Serve uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// DB Connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/contact', contactRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));