const express = require('express');
const mongoose = require('mongoose');
const FreelancerProfile = require('../models/FreelancerProfile');
const router = express.Router();

//Créer un profil freelance
router.post('/', async(req, res) => {
    const { userId, bio, skills, hourlyRate, portfolioLinks, photo } = req.body;
    if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send('Invalid user ID');
    const profile = new FreelancerProfile({userId, bio, skills, hourlyRate, portfolioLinks, photo });
    try {
        await profile.save();
        res.status(201).send('Profile created');
    } catch (error) {
        res.status(400).send('Error creating profile: ' + error.message);
    }
});


//Mettre à jour un profil freelance
router.put('/:userId', async(req, res) => {
    const { userId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send('Invalid user ID');
    const { bio, skills, hourlyRate, portfolioLinks, photo } = req.body;
    try {
        const profile = await FreelancerProfile.findOneAndUpdate(
            { userId },
            { bio, skills, hourlyRate, portfolioLinks, photo },
            { new: true }
        );
        if(!profile) return res.status(404).send('Profile not found');
        res.json(profile);
    } catch (error) {
        res.status(400).send('Error updating profile: ' + error.message);
    }
});


//Récupérer un profil freelance
router.get('/:userId', async(req, res) => {
    const { userId } = req.params;
    if(!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send('Invalid user ID');
    try {
        const profile = await FreelancerProfile.findOne({ userId });
        if(!profile) return res.status(404).send('Profile not found');
        res.json(profile);
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});

module.exports = router;