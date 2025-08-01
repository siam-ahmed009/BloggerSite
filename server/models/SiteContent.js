const mongoose = require('mongoose');

const siteContentSchema = new mongoose.Schema({
    heroTitle: { type: String, default: '' },
    heroDescription: { type: String, default: '' },
    aboutTitle: { type: String, default: '' },
    aboutDescription1: { type: String, default: '' },
    footerAboutText: { type: String, default: '' }
});

module.exports = mongoose.model('SiteContent', siteContentSchema);