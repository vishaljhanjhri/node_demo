var mongoose = require('mongoose');

let EmailSchema = new mongoose.Schema({
    status: Boolean,
    email: String,
    subject: String,
    userId: String
}, {timestamps: true});


module.exports = mongoose.model('EmailResponse', EmailSchema);