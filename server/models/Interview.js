const mongoose = require('mongoose');

const interviewSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  userName: String,
  userEmail: String,
  date: {
    type: Date,
    default: Date.now
  },
  questions: Array,
  answers: Array,
  evaluation: {
    overallScore: Number,
    skills: {
      confidence: Number,
      communication: Number,
      correctness: Number
    },
    breakdown: Array
  }
});

module.exports = mongoose.model('Interview', interviewSchema);
