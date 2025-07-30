// require('dotenv').config();
// const express = require('express');
// const mongoose = require('mongoose');
// const cors = require('cors');

// const app = express();
// const PORT = process.env.PORT || 5000;

// // Import Routes
// const adminRoutes = require('./routes/admin');
// const articleRoutes = require('./routes/articles');
// const siteContentRoutes = require('./routes/siteContent');

// // Middleware
// app.use(cors());
// app.use(express.json());

// // Database Connection
// mongoose.connect(process.env.MONGO_URI)
//     .then(() => console.log('Successfully connected to MongoDB Atlas!'))
//     .catch(error => console.error('Error connecting to MongoDB:', error));

// // --- The Article model definition is now REMOVED from this file ---

// // API Routes
// app.use('/api/admin', adminRoutes);
// app.use('/api/articles', articleRoutes);
// app.use('/api/content', siteContentRoutes);

// // Start Server
// app.listen(PORT, () => {
//     console.log(`Server is running on http://localhost:${PORT}`);
// });

const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Make sure this is imported
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');

dotenv.config();

const adminRoutes = require('./routes/admin');
const articleRoutes = require('./routes/articles');
const siteContentRoutes = require('./routes/siteContent');
const contactRoutes = require('./routes/contact'); // Add this line

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, '..')));

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log(err));

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/site-content', siteContentRoutes);
app.use('/api/contact', contactRoutes); // Add this line

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));