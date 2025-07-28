require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Import Routes
const adminRoutes = require('./routes/admin');
const articleRoutes = require('./routes/articles');
const siteContentRoutes = require('./routes/siteContent');

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(error => console.error('Error connecting to MongoDB:', error));

// --- The Article model definition is now REMOVED from this file ---

// API Routes
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/content', siteContentRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});