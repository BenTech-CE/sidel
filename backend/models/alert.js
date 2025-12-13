const mongoose = require("mongoose")

const AlertSchema = new mongoose.Schema({
    timestamp: { type: Date, default: Date.now },
    countHeads: Number,
    image: String,
    detected: Boolean,
    objects: Array,
    summary: Object
});

module.exports = AlertSchema;