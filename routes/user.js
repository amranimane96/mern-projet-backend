const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const router = express.Router();

// Route d'inscription
router.post('/register', async (req, res) => {
    const { username, email, password, role } = req.body;
    if (!username || !email || !password || !role) {
        return res.status(400).send('All fields are required');
    }
    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) return res.status(400).send('Username or email already in use');

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = new User({ username, email, password: hashedPassword, role });
        await user.save();
        res.status(201).send('User registered');
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});

// Route de connexion
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).send('Username and password are required');

    try {
        const user = await User.findOne({ username });
        if (user && await bcrypt.compare(password, user.password)) {
            req.session.userId = user._id;
            res.json({ messgae: 'Login successful', user });
        } else {
            res.status(401).send('Invalid credentials');
        }
    } catch (error) {
        res.status(500).send('Login error: ' + error.message);
    }
});

// Route de déconnexion
router.post('/logout', async (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).send('Logout failed');
        res.send('Logout successful');
    });
});

// Route du profil utilisateur
router.get('/profile', async (req, res) => {
    const userId = req.session.userId;
    if (!userId) return res.status(401).send('Unauthorized');
    if (!mongoose.Types.ObjectId.isValid(userId)) return res.status(400).send('Invalid user ID');

    try {
        const user = await User.findById(userId).select('-password');
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (error) {
        res.status(500).send('Server error: ' + error.message);
    }
});

module.exports = router;
