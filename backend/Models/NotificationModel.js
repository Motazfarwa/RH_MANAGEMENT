const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users', // Reference to the User model
    required: true
  },
  message: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  type: { // Add this field
    type: String,
    enum: ['creation', 'approval'], // Add possible values
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const NotificationModel = mongoose.model('Notification', notificationSchema);

module.exports = NotificationModel;
