const mongoose = require("mongoose")

const SettingsSchema = new mongoose.Schema({
    headLimit: { type: Number, default: 3 },
    durationSeconds: { type: Number, default: 5 },
    cooldownSeconds: { type: Number, default: 5 },
    emailRecipient: { type: String, default: "" }
});

module.exports = SettingsSchema;