const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, unique: true, required: true},
    email: { type: String, unique: true, required: true},
    password: {type: String, required: true},
    role: { type: String, enum: ['freelancer', 'client'], required: true},
    createdAt: { type: Date, default: Date.now},
    updatedAt: { type: Date, default: Date.now}
});

userSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('User', userSchema);