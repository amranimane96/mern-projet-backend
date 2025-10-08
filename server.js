const express = require('express');
const session = require('express-session');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

const userRoutes = require('./routes/user');
const jobRoutes = require('./routes/job');
const applicationRoutes = require('./routes/application');
const freelancerProfileRoutes = require('./routes/freelancerProfile');

dotenv.config();

const app = express();


connectDB();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,          
        httpOnly: true,         
        sameSite: 'lax'         
    }
}));


app.use('/api/users', userRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/freelancerProfiles', freelancerProfileRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});


