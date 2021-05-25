const mongoose = require('mongoose');

const DocumentSchema = new mongoose.Schema({

  name: {
    type: String,
    required: true
  },
  size: {
    type: Number,
    required: true
  },
  key: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true
  },
  url: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    required: true
  }
}, {
  timestamps: true
});

const Document = mongoose.model('Document', DocumentSchema);

module.exports = Document;