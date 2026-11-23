const mongoose = require('mongoose');
const resourceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  url: { type: String, required: true },
  language: { type: String, required: true },
  topic: { type: String, default: 'General' },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  type: { type: String, enum: ['Article', 'Video', 'Course', 'Documentation', 'Practice'], default: 'Article' },
  tags: [{ type: String }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });
module.exports = mongoose.model('Resource', resourceSchema);
