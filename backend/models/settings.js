const mongoose = require("mongoose")

const SettingsSchema = new mongoose.Schema({
    headLimit: { type: Number, default: 3 },
    durationSeconds: { type: Number, default: 5 },
});

module.exports = SettingsSchema;