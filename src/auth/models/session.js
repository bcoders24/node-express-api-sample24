const mongoose = require("mongoose");

const entity = {
    accessToken: String,
    refreshToken: String,
    fcmToken: String,
    deviceType: {
        type: String,
        enum: ['web', 'ios', 'android'],
        default: null
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user",
    },
    status: {
        type: String,
        enum: ["active", "expired"],
        default: "active"
    },
    accessTokenExpires: {
        type: Date,
        default: null
    },
    refreshTokenExpires: {
        type: Date,
        default: null
    }
}

module.exports = {
     entity
};