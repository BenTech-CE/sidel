const mongoose = require("mongoose")

const AlertSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    detected: Boolean,
    count: Number,
    objects: Array,
    summary: Object
});

module.exports = AlertSchema;