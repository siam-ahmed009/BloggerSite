const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
    // Hero Section
    heroTitle: String,
    heroDescription: String,
    heroImage: String, // Path to image, e.g., 'img/image.png'

    // About Section (on index.html)
    aboutTitle: String,
    aboutDescription1: String,
    aboutDescription2: String,

    // Footer Section
    footerAboutImage: String,
    footerAboutText: String
});

// This model will only ever have one document
const SiteContent = mongoose.model('SiteContent', siteContentSchema);
module.exports = SiteContent;