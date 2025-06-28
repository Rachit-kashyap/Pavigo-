const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  vibeScore: {
    type: Number,
    default: 0
  },
  socketId: {
    type: String,
    default: null
  },
  isActive: {
    type: Boolean,
    default: false
  },
  yourVibeScoreFriends: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  yourVibeScoreFriendPendingRequest: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  offlineNotification: [{
    type: {
      type: String,
      required: true
    },
    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    message: {
      type: String,
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }]
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;