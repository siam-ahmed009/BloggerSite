const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  subject: { type: String }, // ✅ this should be present
  message: { type: String, required: true },
  receivedAt: { type: Date, default: Date.now },
  reply: String,
  repliedAt: Date
}, { timestamps: true });

const Message = mongoose.model('Message', messageSchema);
module.exports = Message;
