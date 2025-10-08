const mongoose = require('mongoose');

const freelancerProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bio: { type: String },
    skills: [{ type: String }],
    hourlyRate: { type: Number },
    portfolioLinks: [{ type: String }],
    photo: { type: String },
    createdAt: { type: Date, default: Date.now },
    updateAt: { type: Date, default: Date.now }
});

freelancerProfileSchema.pre('save', function(next) {
    this.updateAt = Date.now();
    next();
});

module.exports = mongoose.model('FreelancerProfile', freelancerProfileSchema);