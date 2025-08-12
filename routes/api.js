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
            file.mimetype === 'text/vcard' ||
            file.mimetype === 'text/x-vcard' ||
            file.originalname.endsWith('.csv') || 
            file.originalname.endsWith('.txt') ||
            file.originalname.endsWith('.vcf')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV, TXT, and VCF (vCard) files are allowed!'), false);
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Parse vCard (VCF) content
function parseVCard(vcfContent) {
    const contacts = [];
    const vcards = vcfContent.split('BEGIN:VCARD');
    
    vcards.forEach((vcard, index) => {
        if (!vcard.trim()) return;
        
        let name = '';
        let phone = '';
        
        const lines = vcard.split('\n');
        
        lines.forEach(line => {
            const trimmedLine = line.trim();
            
            // Parse Full Name (FN) or Name (N)
            if (trimmedLine.startsWith('FN:')) {
                name = trimmedLine.substring(3).trim();
            } else if (trimmedLine.startsWith('N:') && !name) {
                // N format: Family;Given;Middle;Prefix;Suffix
                const nameParts = trimmedLine.substring(2).split(';');
                const given = nameParts[1] || '';
                const family = nameParts[0] || '';
                name = `${given} ${family}`.trim();
            }
            
            // Parse Phone numbers (TEL)
            if (trimmedLine.startsWith('TEL') && !phone) {
                // Extract phone number after colon
                const colonIndex = trimmedLine.indexOf(':');
                if (colonIndex !== -1) {
                    phone = trimmedLine.substring(colonIndex + 1).trim();
                    // Clean phone number - remove spaces, dashes, parentheses
                    phone = phone.replace(/[\s\-\(\)\+]/g, '');
                }
            }
        });
        
        // Add contact if both name and phone are found
        if (name && phone) {
            contacts.push({
                id: Date.now() + index,
                name: name,
                phone: phone.replace(/\D/g, ''), // Keep only digits
                status: 'pending'
            });
        }
    });
    
    return contacts;
}

// Upload contacts file
router.post('/upload-contacts', upload.single('contactFile'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No file uploaded' });
        }

        console.log('File uploaded:', {
            originalname: req.file.originalname,
            mimetype: req.file.mimetype,
            size: req.file.size
        });

        // Read file content from memory buffer (serverless compatible)
        const fileContent = req.file.buffer.toString('utf8');
        let contacts = [];
        
        // Determine file type and parse accordingly
        const fileName = req.file.originalname.toLowerCase();
        
        if (fileName.endsWith('.vcf') || req.file.mimetype === 'text/vcard' || req.file.mimetype === 'text/x-vcard') {
            // Parse vCard format
            console.log('Parsing vCard file...');
            contacts = parseVCard(fileContent);
            
        } else {
            // Parse CSV/TXT format
            console.log('Parsing CSV/TXT file...');
            const lines = fileContent.split('\n').filter(line => line.trim() !== '');
            
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
        }
        
        console.log(`Parsed ${contacts.length} contacts from ${fileName}`);
        
        res.json({ 
            message: `${contacts.length} contacts uploaded successfully from ${req.file.originalname}`, 
            contacts: contacts,
            fileType: fileName.endsWith('.vcf') ? 'vCard' : 'CSV/TXT'
        });
        
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to process file: ' + error.message });
    }
});

// Add single contact
router.post('/add-contact', (req, res) => {
    try {
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
        
        res.json({ 
            message: 'Contact added successfully', 
            contact: contact
        });
        
    } catch (error) {
        console.error('Add contact error:', error);
        res.status(500).json({ error: 'Failed to add contact' });
    }
});

// Delete specific contact - Not needed for localStorage approach
// Client will handle contact deletion directly

// Clear all contacts - Not needed for localStorage approach  
// Client will handle clearing directly

// Update message template - Not needed for localStorage approach
// Client will handle template updates directly

// Update API credentials - Not needed for localStorage approach
// Client will handle credential saving directly

// Clear API credentials - Not needed for localStorage approach
// Client will handle credential clearing directly

// Reset contact status - Not needed for localStorage approach
// Client will handle status reset directly

// Reset all contacts status - Not needed for localStorage approach
// Client will handle bulk status reset directly

// Send messages using ZAPIN API
router.post('/send-messages', async (req, res) => {
    try {
        // Get data from request body (client-side storage)
        const { 
            apiKey, 
            sender, 
            contactId, 
            contacts = [], 
            messageTemplate = 'Halo {nama},\n\nPesan ini dikirim untuk {to}.\n\nTerima kasih!' 
        } = req.body;
        
        if (!apiKey || !sender) {
            return res.status(400).json({ error: 'API Key and Sender are required. Please save them first.' });
        }
        
        if (!contacts || contacts.length === 0) {
            return res.status(400).json({ error: 'No contacts available to send messages' });
        }
        
        if (!messageTemplate) {
            return res.status(400).json({ error: 'Message template is required' });
        }
        
        const results = [];
        let contactsToSend = [];
        
        // Determine which contacts to send messages to
        if (contactId) {
            // Send to specific contact
            const specificContact = contacts.find(c => c.id === parseInt(contactId));
            if (!specificContact) {
                return res.status(404).json({ error: 'Contact not found' });
            }
            contactsToSend = [specificContact];
        } else {
            // Send to all pending contacts (not sent yet)
            contactsToSend = contacts.filter(contact => contact.status === 'pending');
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
                const message = messageTemplate
                    .replace(/{nama}/g, nameParam)
                    .replace(/{nama_url}/g, toParam)
                    .replace(/{to}/g, toParam); // Keep backward compatibility
                
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
                    message: messageTemplate
                        .replace(/{nama}/g, contact.name)
                        .replace(/{nama_url}/g, contact.name.replace(/\s+/g, '+'))
                        .replace(/{to}/g, contact.name.replace(/\s+/g, '+')) // Keep backward compatibility
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
        
        // Return response (history will be managed by client-side)
        res.json({
            message: contactId ? 'Message sent to individual contact' : 'Messages sent to all pending contacts',
            results: results,
            summary: {
                total: results.length,
                success: results.filter(r => r.status === 'success').length,
                failed: results.filter(r => r.status === 'failed').length
            },
            // Return updated contacts so client can update their localStorage
            updatedContacts: contacts,
            isIndividual: !!contactId
        });
        
    } catch (error) {
        console.error('Send messages error:', error);
        res.status(500).json({ error: 'Failed to send messages' });
    }
});

// Download report
router.post('/download-report', (req, res) => {
    try {
        console.log('=== DOWNLOAD REPORT SERVER DEBUG ===');
        console.log('Request received');
        console.log('Request body keys:', Object.keys(req.body));
        console.log('Request body:', JSON.stringify(req.body, null, 2));
        
        const { sendHistory = [] } = req.body;
        
        console.log('Send history type:', typeof sendHistory);
        console.log('Send history is array:', Array.isArray(sendHistory));
        console.log('Send history length:', sendHistory.length);
        
        if (!Array.isArray(sendHistory) || sendHistory.length === 0) {
            console.log('No valid send history available');
            return res.status(400).json({ error: 'No send history available. Please send some messages first.' });
        }
        
        // Generate CSV report
        let csvContent = 'Timestamp,Template,Contact Name,Phone,Status,Message,Error\n';
        let processedRows = 0;
        
        sendHistory.forEach((history, historyIndex) => {
            console.log(`Processing history ${historyIndex + 1}:`, {
                timestamp: history.timestamp,
                hasResults: !!history.results,
                resultsType: typeof history.results,
                resultsIsArray: Array.isArray(history.results),
                resultsCount: history.results?.length || 0
            });
            
            if (!history.results || !Array.isArray(history.results)) {
                console.warn(`History ${historyIndex} has no valid results array`);
                return;
            }
            
            history.results.forEach((result, resultIndex) => {
                try {
                    const contact = result.contact;
                    if (!contact) {
                        console.warn(`Missing contact in result ${resultIndex} of history ${historyIndex}`);
                        return;
                    }
                    
                    // Escape newlines and quotes for CSV format
                    const escapedTemplate = (history.template || '').replace(/\n/g, '\\n').replace(/"/g, '""');
                    const escapedMessage = (result.message || '').replace(/\n/g, '\\n').replace(/"/g, '""');
                    const escapedError = (result.error || '').replace(/\n/g, '\\n').replace(/"/g, '""');
                    const escapedName = (contact.name || '').replace(/"/g, '""');
                    
                    const row = [
                        history.timestamp || '',
                        `"${escapedTemplate}"`,
                        `"${escapedName}"`,
                        contact.phone || '',
                        result.status || '',
                        `"${escapedMessage}"`,
                        `"${escapedError}"`
                    ].join(',');
                    
                    csvContent += row + '\n';
                    processedRows++;
                    
                } catch (rowError) {
                    console.error(`Error processing row ${resultIndex} in history ${historyIndex}:`, rowError);
                }
            });
        });
        
        console.log('CSV processing complete:');
        console.log('- Processed rows:', processedRows);
        console.log('- CSV content length:', csvContent.length);
        console.log('- First 200 chars:', csvContent.substring(0, 200));
        
        if (processedRows === 0) {
            console.log('No valid data to export');
            return res.status(400).json({ error: 'No valid data found in send history.' });
        }
        
        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="whatsapp-report-${Date.now()}.csv"`);
        res.setHeader('Content-Length', Buffer.byteLength(csvContent, 'utf8'));
        res.send(csvContent);
        
        console.log('CSV report sent successfully');
        
    } catch (error) {
        console.error('Download report error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({ error: 'Failed to generate report: ' + error.message });
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

// Get send history - Not needed for localStorage approach
// Client will handle history display directly

module.exports = router;
