const express = require('express');
const mongoose = require('mongoose');
const Application = require('../models/Application');
const Job = require('../models/Job');
const router = express.Router();

// créer une nouvelle candidature
router.post('/', async (req, res) => {
    const { jobId, coverLetter } = req.body;
    const freelancerId = req.session.userId;
        if (!freelancerId) return res.status(401).send('Unauthorized');
        if (!mongoose.Types.ObjectId.isValid(jobId) || !mongoose.Types.ObjectId.isValid(freelancerId)) {
    return res.status(400).send('Invalid ID format');
        }
    const application = new Application({ jobId, freelancerId, coverLetter, status: 'pending' });
        try {
        await application.save();
    res.status(201).send('Application submitted');
        } catch (error) {
    res.status(400).send('Error submitting application: ' + error.message);
        }
});

// récupérer toutes les candidatures d’un job
router.get('/job/:jobId', async (req, res) => {
    const { jobId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    if (!mongoose.Types.ObjectId.isValid(jobId)) {
    return res.status(400).send('Invalid job ID');
    }
    try {
    const applications = await Application.find({ jobId })
        .populate('freelancerId', 'username email')
      .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    const totalApplications = await Application.countDocuments({ jobId });
    res.json({
        applications,
        currentPage: page,
        totalPages: Math.ceil(totalApplications / limit),
        totalApplications
    });
    } catch (error) {
    res.status(500).send('Server error: ' + error.message);
    }
});

// récupérer une candidature par ID
router.get('/:applicationId', async (req, res) => {
    const { applicationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return res.status(400).send('Invalid application ID');
    }
    try {
    const application = await Application.findById(applicationId);
    if (!application) return res.status(404).send('Application not found');
    res.json(application);
    } catch (error) {
    res.status(500).send('Server error: ' + error.message);
    }
});

// accepter une candidature
router.patch('/:applicationId/accept', async (req, res) => {
    const { applicationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return res.status(400).send('Invalid application ID');
    }
    try {
    const application = await Application.findByIdAndUpdate(
        applicationId,
        { status: 'accepted' },
        { new: true }
    );
    if (!application) return res.status(404).send('Application not found');

    await Application.updateMany(
        { jobId: application.jobId, _id: { $ne: application._id } },
        { status: 'rejected' }
    );

    res.json(application);
    } catch (error) {
    res.status(500).send('Error accepting application: ' + error.message);
    }
});

// rejeter une candidature
router.patch('/:applicationId/reject', async (req, res) => {
    const { applicationId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(applicationId)) {
    return res.status(400).send('Invalid application ID');
    }
    try {
    const application = await Application.findByIdAndUpdate(
        applicationId,
        { status: 'rejected' },
        { new: true }
    );
    if (!application) return res.status(404).send('Application not found');
    res.json(application);
    } catch (error) {
    res.status(500).send('Error rejecting application: ' + error.message);
    }
});


// récupérer toutes les candidatures du freelancer connecté
router.get('/apps/:freelancerId', async (req, res) => {
    const freelancerId = req.session.userId;
    console.log('Freelancer ID:', freelancerId);
    if (!freelancerId) return res.status(401).send('Unauthorized');
    try {
    const applications = await Application.find({ freelancerId }).populate("jobId");
    res.json({ applications });
    } catch (error) {
    res.status(500).send('Server error: ' + error.message);
    }
});


module.exports = router;


