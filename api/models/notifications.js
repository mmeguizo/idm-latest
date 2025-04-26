const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    title: {
        type: String,
    },
    message: {
        type: String,
    },
    type: {
        type: String,
    },
    isRead: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        type: Object,
        default: {},
    },
});

module.exports = mongoose.model('Notification', NotificationSchema);