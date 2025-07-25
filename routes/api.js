const express = require('express');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const router = express.Router();

// Multer configuration for file uploads - Updated for serverless
const storage = multer.memoryStorage(); // Use memory storage for serverless

const upload = multer({ 
    storage: storage,
    fileFilter: function (req, file, cb) {
        if (file.mimetype === 'text/csv' || 
            file.mimetype === 'text/plain' || 
            file.originalname.endsWith('.csv') || 
            file.originalname.endsWith('.txt')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV and TXT files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Initialize session data
function initSession(req) {
    if (!req.session.contacts) {
        req.session.contacts = [];
    }
    if (!req.session.messageTemplate) {
        req.session.messageTemplate = 'Halo {nama},\n\nPesan ini dikirim untuk {to}.\n\nTerima kasih!';
    }
    if (!req.session.sendHistory) {
        req.session.sendHistory = [];
    }
    if (!req.session.apiKey) {
        req.session.apiKey = '';
    }
    if (!req.session.sender) {
        req.session.sender = '';
    }
}

// Get session data
router.get('/session', (req, res) => {
    initSession(req);
    res.json({
        contacts: req.session.contacts,
        messageTemplate: req.session.messageTemplate,
        sendHistory: req.session.sendHistory,
        apiKey: req.session.apiKey,
        sender: req.session.sender,
        sessionId: req.session.id
    });
});

// Upload contacts file
router.post('/upload-contacts', upload.single('contactFile'), (req, res) => {
    try {
        initSession(req);
        
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        // Read file content from memory buffer (serverless compatible)
        const fileContent = req.file.buffer.toString('utf8');
        
        // Parse CSV/TXT file
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        const contacts = [];
        
        lines.forEach((line, index) => {
            const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
            if (parts.length >= 2) {
                const [name, phone] = parts;
                if (name && phone) {
                    contacts.push({
                        id: Date.now() + index,
                        name: name,
                        phone: phone.replace(/\D/g, ''), // Remove non-digits
                        status: 'pending'
                    });
                }
            }
        });

        req.session.contacts = contacts;
        
        // No file cleanup needed with memory storage
        
        res.json({ 
            message: `${contacts.length} contacts uploaded successfully`, 
            contacts: contacts 
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to process file' });
    }
});

// Add single contact
router.post('/add-contact', (req, res) => {
    try {
        initSession(req);
        
        const { name, phone } = req.body;
        
        if (!name || !phone) {
            return res.status(400).json({ error: 'Name and phone are required' });
        }
        
        const contact = {
            id: Date.now(),
            name: name.trim(),
            phone: phone.replace(/\D/g, ''),
            status: 'pending'
        };
        
        req.session.contacts.push(contact);
        
        res.json({ 
            message: 'Contact added successfully', 
            contact: contact,
            contacts: req.session.contacts 
        });
        
    } catch (error) {
        console.error('Add contact error:', error);
        res.status(500).json({ error: 'Failed to add contact' });
    }
});

// Delete specific contact
router.delete('/contact/:id', (req, res) => {
    try {
        initSession(req);
        
        const contactId = parseInt(req.params.id);
        const initialLength = req.session.contacts.length;
        
        req.session.contacts = req.session.contacts.filter(contact => contact.id !== contactId);
        
        if (req.session.contacts.length < initialLength) {
            res.json({ 
                message: 'Contact deleted successfully',
                contacts: req.session.contacts 
            });
        } else {
            res.status(404).json({ error: 'Contact not found' });
        }
        
    } catch (error) {
        console.error('Delete contact error:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

// Clear all contacts
router.delete('/contacts', (req, res) => {
    try {
        initSession(req);
        req.session.contacts = [];
        req.session.sendHistory = [];
        // Keep API credentials when clearing contacts
        
        res.json({ message: 'All contacts cleared successfully' });
        
    } catch (error) {
        console.error('Clear contacts error:', error);
        res.status(500).json({ error: 'Failed to clear contacts' });
    }
});

// Update message template
router.post('/message-template', (req, res) => {
    try {
        initSession(req);
        
        const { template } = req.body;
        
        if (!template) {
            return res.status(400).json({ error: 'Template is required' });
        }
        
        req.session.messageTemplate = template;
        
        res.json({ 
            message: 'Message template updated successfully',
            template: template 
        });
        
    } catch (error) {
        console.error('Update template error:', error);
        res.status(500).json({ error: 'Failed to update template' });
    }
});

// Update API credentials
router.post('/api-credentials', (req, res) => {
    try {
        initSession(req);
        
        const { apiKey, sender } = req.body;
        
        if (!apiKey || !sender) {
            return res.status(400).json({ error: 'API Key and Sender are required' });
        }
        
        req.session.apiKey = apiKey;
        req.session.sender = sender;
        
        res.json({ 
            message: 'API credentials saved successfully',
            apiKey: apiKey,
            sender: sender
        });
        
    } catch (error) {
        console.error('Update credentials error:', error);
        res.status(500).json({ error: 'Failed to save credentials' });
    }
});

// Clear API credentials
router.delete('/api-credentials', (req, res) => {
    try {
        initSession(req);
        
        req.session.apiKey = '';
        req.session.sender = '';
        
        res.json({ message: 'API credentials cleared successfully' });
        
    } catch (error) {
        console.error('Clear credentials error:', error);
        res.status(500).json({ error: 'Failed to clear credentials' });
    }
});

// Reset contact status
router.post('/reset-contact-status/:id', (req, res) => {
    try {
        initSession(req);
        
        const contactId = parseInt(req.params.id);
        const contact = req.session.contacts.find(c => c.id === contactId);
        
        if (!contact) {
            return res.status(404).json({ error: 'Contact not found' });
        }
        
        contact.status = 'pending';
        delete contact.sentAt;
        delete contact.error;
        delete contact.response;
        
        res.json({ 
            message: 'Contact status reset successfully',
            contact: contact,
            contacts: req.session.contacts 
        });
        
    } catch (error) {
        console.error('Reset contact status error:', error);
        res.status(500).json({ error: 'Failed to reset contact status' });
    }
});

// Reset all contacts status
router.post('/reset-all-status', (req, res) => {
    try {
        initSession(req);
        
        req.session.contacts.forEach(contact => {
            contact.status = 'pending';
            delete contact.sentAt;
            delete contact.error;
            delete contact.response;
        });
        
        res.json({ 
            message: 'All contacts status reset successfully',
            contacts: req.session.contacts 
        });
        
    } catch (error) {
        console.error('Reset all status error:', error);
        res.status(500).json({ error: 'Failed to reset all contacts status' });
    }
});

// Send messages using ZAPIN API
router.post('/send-messages', async (req, res) => {
    try {
        initSession(req);
        
        // Use credentials from session, fallback to request body for backward compatibility
        const { apiKey: bodyApiKey, sender: bodySender, contactId } = req.body;
        const apiKey = req.session.apiKey || bodyApiKey;
        const sender = req.session.sender || bodySender;
        
        if (!apiKey || !sender) {
            return res.status(400).json({ error: 'API Key and Sender are required. Please save them first.' });
        }
        
        // Update session with current credentials if provided in body
        if (bodyApiKey && bodySender) {
            req.session.apiKey = bodyApiKey;
            req.session.sender = bodySender;
        }
        
        if (req.session.contacts.length === 0) {
            return res.status(400).json({ error: 'No contacts available to send messages' });
        }
        
        const results = [];
        const template = req.session.messageTemplate;
        let contactsToSend = [];
        
        // Determine which contacts to send messages to
        if (contactId) {
            // Send to specific contact
            const specificContact = req.session.contacts.find(c => c.id === parseInt(contactId));
            if (!specificContact) {
                return res.status(404).json({ error: 'Contact not found' });
            }
            contactsToSend = [specificContact];
        } else {
            // Send to all pending contacts (not sent yet)
            contactsToSend = req.session.contacts.filter(contact => contact.status === 'pending');
        }
        
        if (contactsToSend.length === 0) {
            return res.status(400).json({ 
                error: contactId ? 'Contact already sent or failed' : 'No pending contacts to send messages to' 
            });
        }
        
        for (let i = 0; i < contactsToSend.length; i++) {
            const contact = contactsToSend[i];
            try {
                // Log progress for bulk sending
                if (!contactId && contactsToSend.length > 1) {
                    console.log(`Sending message ${i + 1}/${contactsToSend.length} to ${contact.name} (${contact.phone})`);
                }
                
                // Replace template variables
                const nameParam = contact.name;
                const toParam = contact.name.replace(/\s+/g, '+');
                const message = template
                    .replace(/{nama}/g, nameParam)
                    .replace(/{to}/g, toParam);
                
                // ZAPIN API call
                const response = await axios.post('https://zapin.my.id/send-message', {
                    api_key: apiKey,
                    sender: sender,
                    number: contact.phone,
                    message: message
                }, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    timeout: 10000 // 10 seconds timeout
                });
                
                console.log('ZAPIN API Response:', response.data); // Debug log
                
                // Check ZAPIN specific response format: { "status": true, "msg": "Message sent successfully!" }
                if (response.data && response.data.status === true) {
                    contact.status = 'sent';
                    contact.sentAt = new Date().toISOString();
                    contact.response = response.data;
                    
                    results.push({
                        contact: contact,
                        status: 'success',
                        message: message,
                        apiResponse: response.data
                    });
                } else {
                    contact.status = 'failed';
                    contact.error = response.data?.msg || response.data?.message || response.data?.error || JSON.stringify(response.data) || 'Unknown error';
                    
                    results.push({
                        contact: contact,
                        status: 'failed',
                        error: contact.error,
                        message: message,
                        apiResponse: response.data
                    });
                }
                
            } catch (error) {
                contact.status = 'failed';
                console.error('Send message error:', error.response?.data || error.message);
                
                // Better error handling for ZAPIN format
                if (error.response?.data) {
                    contact.error = error.response.data.msg || error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
                } else {
                    contact.error = error.message || 'Network error';
                }
                
                results.push({
                    contact: contact,
                    status: 'failed',
                    error: contact.error,
                    message: template.replace(/{nama}/g, contact.name).replace(/{to}/g, contact.name.replace(/\s+/g, '+'))
                });
            }
            
            // Add delay between requests to avoid rate limiting and spam detection
            if (i < contactsToSend.length - 1) { // Don't delay after the last message
                let delayTime;
                if (contactId) {
                    // Individual sending: shorter delay
                    delayTime = 1000; 
                } else {
                    // Bulk sending: longer delay with some randomization
                    const baseDelay = 3000; // 3 seconds base
                    const randomDelay = Math.floor(Math.random() * 2000); // 0-2 seconds random
                    delayTime = baseDelay + randomDelay; // 3-5 seconds total
                }
                
                console.log(`Waiting ${delayTime}ms before next message...`);
                await new Promise(resolve => setTimeout(resolve, delayTime));
            }
        }
        
        // Save to send history
        const historyEntry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            template: template,
            results: results,
            totalContacts: req.session.contacts.length,
            successCount: results.filter(r => r.status === 'success').length,
            failedCount: results.filter(r => r.status === 'failed').length
        };
        
        req.session.sendHistory.push(historyEntry);
        
        res.json({
            message: contactId ? 'Message sent to individual contact' : 'Messages sent to all pending contacts',
            results: results,
            summary: {
                total: results.length,
                success: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status === 'failed').length
            },
            contacts: req.session.contacts,
            isIndividual: !!contactId
        });
        
    } catch (error) {
        console.error('Send messages error:', error);
        res.status(500).json({ error: 'Failed to send messages' });
    }
});

// Download report
router.get('/download-report', (req, res) => {
    try {
        initSession(req);
        
        if (req.session.sendHistory.length === 0) {
            return res.status(400).json({ error: 'No send history available' });
        }
        
        // Generate CSV report
        let csvContent = 'Timestamp,Template,Contact Name,Phone,Status,Message,Error\n';
        
        req.session.sendHistory.forEach(history => {
            history.results.forEach(result => {
                const contact = result.contact;
                // Escape newlines for CSV format
                const escapedTemplate = history.template.replace(/\n/g, '\\n').replace(/"/g, '""');
                const escapedMessage = result.message.replace(/\n/g, '\\n').replace(/"/g, '""');
                const escapedError = (result.error || '').replace(/\n/g, '\\n').replace(/"/g, '""');
                
                const row = [
                    history.timestamp,
                    `"${escapedTemplate}"`,
                    `"${contact.name.replace(/"/g, '""')}"`,
                    contact.phone,
                    result.status,
                    `"${escapedMessage}"`,
                    `"${escapedError}"`
                ].join(',');
                csvContent += row + '\n';
            });
        });
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="whatsapp-report-${Date.now()}.csv"`);
        res.send(csvContent);
        
    } catch (error) {
        console.error('Download report error:', error);
        res.status(500).json({ error: 'Failed to generate report' });
    }
});

// Test ZAPIN API response format
router.post('/test-zapin', async (req, res) => {
    try {
        const { apiKey, sender, testNumber } = req.body;
        
        if (!apiKey || !sender || !testNumber) {
            return res.status(400).json({ error: 'API Key, Sender, and Test Number are required' });
        }
        
        const testMessage = 'Test message from WhatsApp Bot';
        
        const response = await axios.post('https://zapin.my.id/send-message', {
            api_key: apiKey,
            sender: sender,
            number: testNumber,
            message: testMessage
        }, {
            headers: {
                'Content-Type': 'application/json'
            },
            timeout: 10000
        });
        
        res.json({
            message: 'Test API call completed',
            zapinResponse: response.data,
            httpStatus: response.status,
            headers: response.headers
        });
        
    } catch (error) {
        res.status(500).json({
            error: 'Test API call failed',
            details: error.response?.data || error.message,
            httpStatus: error.response?.status
        });
    }
});

// Get send history
router.get('/send-history', (req, res) => {
    try {
        initSession(req);
        res.json({ history: req.session.sendHistory });
    } catch (error) {
        console.error('Get history error:', error);
        res.status(500).json({ error: 'Failed to get send history' });
    }
});

module.exports = router;
