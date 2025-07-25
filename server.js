/**
 * WhatsApp Message Sender - ZAPIN API
 * 
 * A Node.js/Express application for sending WhatsApp messages using ZAPIN API
 * with contact management and message templating features.
 * 
 * @author Azhar Azziz <azharazzi13@gmail.com>
 * @version 1.0.0
 * @repository https://github.com/azharazziz/whatsapp-automate-sender
 * @license MIT
 */

const express = require('express');
const session = require('express-session');
const multer = require('multer');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

// Session configuration - Updated for serverless
app.use(session({
    secret: process.env.SESSION_SECRET || 'wa-bot-secret-key',
    resave: false,
    saveUninitialized: true,
    cookie: { 
        secure: process.env.NODE_ENV === 'production', // Use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        httpOnly: true
    },
    // For production, you might want to use a different session store
    // like connect-redis or connect-mongo for persistence across serverless functions
}));

// Multer configuration for file uploads - Updated for serverless
const storage = multer.memoryStorage(); // Use memory storage for serverless

const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: function (req, file, cb) {
        // Accept CSV and TXT files
        if (file.mimetype === 'text/csv' || 
            file.mimetype === 'text/plain' || 
            file.originalname.endsWith('.csv') || 
            file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV and TXT files are allowed!'), false);
        }
    }
});

// Routes
app.use('/api', require('./routes/api'));

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Error handling middleware
app.use((error, req, res, next) => {
    if (error instanceof multer.MulterError) {
        if (error.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ error: 'File too large' });
        }
    }
    
    if (error.message === 'Only CSV and TXT files are allowed!') {
        return res.status(400).json({ error: 'Only CSV and TXT files are allowed!' });
    }
    
    res.status(500).json({ error: 'Something went wrong!' });
});

// Start server
app.listen(PORT, () => {
    console.log(`WhatsApp Bot Server running on http://localhost:${PORT}`);
    console.log('Access the application at: http://localhost:' + PORT);
});

module.exports = app;
