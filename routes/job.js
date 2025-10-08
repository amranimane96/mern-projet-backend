const express = require('express');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const router = express.Router();

// Créer un nouveau job
router.post('/', async (req, res) => {
    const { title, description, budget, skillsRequired } = req.body;
    const clientId = req.session.userId;

    if (!clientId) return res.status(401).send('Unauthorized');
    if (!title || !description) return res.status(400).send('Title and description are required');

    const job = new Job({ clientId, title, description, budget, skillsRequired });

    try {
        await job.save();
        res.status(201).send('Job posted');
    } catch (error) {
        res.status(400).send('Error posting job: ' + error.message);
    }
});

// Récupérer tous les jobs
router.get('/', async (req, res) => {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    try {
        const jobs = await Job.find()
            .skip((page - 1) * limit)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalJobs = await Job.countDocuments();
        res.json({
            jobs,
            currentPage: page,
            totalPages: Math.ceil(totalJobs / limit),
            totalJobs
        });
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});

// Récupérer seulement les jobs ouverts
router.get('/open', async (req, res) => {
    try {
        const jobs = await Job.find({ status: 'open' }).sort({ createdAt: -1 });
        res.json({ jobs });
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});

// Récupérer un job par ID
router.get('/:jobId', async (req, res) => {
    const { jobId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(jobId)) return res.status(400).send('Invalid job ID');
    try {
        const job = await Job.findById(jobId);
        if (!job) return res.status(404).send('Job not found');
        res.json(job);
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});

// Fermer un job 
router.patch('/:jobId/close', async (req, res) => {
    const { jobId } = req.params;
    const clientId = req.session.userId;

    try {
        const job = await Job.findOneAndUpdate(
            { _id: jobId, clientId },
            { status: 'closed' },
            { new: true }
        );
        if (!job) return res.status(404).send('Job not found or unauthorized');
        res.json(job);
    } catch (error) {
        res.status(500).send('Error closing job: ' + error.message);
    }
});

// Réouvrir un job
router.patch('/:jobId/open', async (req, res) => {
    const { jobId } = req.params;
    const clientId = req.session.userId;

    try {
        const job = await Job.findOneAndUpdate(
            { _id: jobId, clientId },
            { status: 'open' },
            { new: true }
        );
        if (!job) return res.status(404).send('Job not found or unauthorized');
        res.json(job);
    } catch (error) {
        res.status(500).send('Error reopening job: ' + error.message);
    }
});

module.exports = router;
