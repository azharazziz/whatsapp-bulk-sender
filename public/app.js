// Global variables
let contacts = [];
let messageTemplate = '';
let sendHistory = [];
let apiKey = '';
let sender = '';

// LocalStorage keys
const STORAGE_KEYS = {
    CONTACTS: 'whatsapp_bot_contacts',
    TEMPLATE: 'whatsapp_bot_template',
    HISTORY: 'whatsapp_bot_history',
    API_KEY: 'whatsapp_bot_api_key',
    SENDER: 'whatsapp_bot_sender'
};

// Initialize app
document.addEventListener('DOMContentLoaded', function() {
    loadFromLocalStorage();
    updateTemplatePreview();
    
    // Add event listeners
    document.getElementById('messageTemplate').addEventListener('input', updateTemplatePreview);
    
    // Auto-save to localStorage when data changes
    window.addEventListener('beforeunload', saveToLocalStorage);
});

// Save data to localStorage
function saveToLocalStorage() {
    try {
        localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(contacts));
        localStorage.setItem(STORAGE_KEYS.TEMPLATE, messageTemplate);
        localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(sendHistory));
        localStorage.setItem(STORAGE_KEYS.API_KEY, apiKey);
        localStorage.setItem(STORAGE_KEYS.SENDER, sender);
        
    } catch (error) {
        console.error('Error saving to localStorage:', error);
        showAlert('Error saving data locally', 'warning');
    }
}

// Load data from localStorage
function loadFromLocalStorage() {
    try {
        const savedContacts = localStorage.getItem(STORAGE_KEYS.CONTACTS);
        const savedTemplate = localStorage.getItem(STORAGE_KEYS.TEMPLATE);
        const savedHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
        const savedApiKey = localStorage.getItem(STORAGE_KEYS.API_KEY);
        const savedSender = localStorage.getItem(STORAGE_KEYS.SENDER);
        
        contacts = savedContacts ? JSON.parse(savedContacts) : [];
        messageTemplate = savedTemplate || 'Halo {nama},\n\nPesan ini dikirim untuk {to}.\n\nTerima kasih!';
        sendHistory = savedHistory ? JSON.parse(savedHistory) : [];
        apiKey = savedApiKey || '';
        sender = savedSender || '';
        
        document.getElementById('messageTemplate').value = messageTemplate;
        document.getElementById('apiKey').value = apiKey;
        document.getElementById('sender').value = sender;
        
        updateContactsList();
        updateTemplatePreview();
        
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showAlert('Error loading local data, using defaults', 'warning');
        
        // Use defaults if localStorage fails
        contacts = [];
        messageTemplate = 'Halo {nama},\n\nPesan ini dikirim untuk {to}.\n\nTerima kasih!';
        sendHistory = [];
        apiKey = '';
        sender = '';
        
        document.getElementById('messageTemplate').value = messageTemplate;
        updateContactsList();
        updateTemplatePreview();
    }
}

// Legacy function for backward compatibility (now uses localStorage)
async function loadSession() {
    loadFromLocalStorage();
}

// Show alert messages
function showAlert(message, type = 'info') {
    const alertContainer = document.getElementById('alertContainer');
    const alertId = 'alert-' + Date.now();
    
    const alertHTML = `
        <div id="${alertId}" class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
    
    alertContainer.insertAdjacentHTML('beforeend', alertHTML);
    
    // Auto dismiss after 5 seconds
    setTimeout(() => {
        const alertElement = document.getElementById(alertId);
        if (alertElement) {
            const alert = new bootstrap.Alert(alertElement);
            alert.close();
        }
    }, 5000);
}

// Update template preview and save to localStorage
function updateTemplatePreview() {
    const template = document.getElementById('messageTemplate').value;
    messageTemplate = template; // Update global variable
    saveToLocalStorage(); // Auto-save to localStorage
    
    if (!template) {
        document.getElementById('templatePreview').textContent = 'Template kosong...';
        return;
    }
    
    // Clean up excessive whitespace and replace template variables
    const preview = template
        .replace(/\r\n/g, '\n') // Normalize line breaks
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive line breaks with 2
        .replace(/ {2,}/g, ' ') // Replace multiple spaces with single space
        .replace(/^\s+|\s+$/g, '') // Trim leading/trailing whitespace
        .replace(/{nama}/g, '[Nama Kontak]')
        .replace(/{to}/g, '[Nama+dengan+plus]');
    
    // Use textContent to preserve line breaks and prevent HTML injection
    document.getElementById('templatePreview').textContent = preview;
}

// Load quick templates
function loadQuickTemplate(type) {
    let template = '';
    
    switch (type) {
        case 'formal':
            template = `Kepada Yth. {nama},

Dengan hormat,

Kami mengirimkan pesan ini untuk memberikan informasi kepada {to}.

Jika ada pertanyaan lebih lanjut, silakan hubungi kami.

Terima kasih atas perhatiannya.

Hormat kami,
Tim WhatsApp Bot`;
            break;
            
        case 'casual':
            template = `Halo {nama}! 👋

Apa kabar?

Kami ingin berbagi informasi menarik untuk {to}.

Semoga bermanfaat ya!

Salam hangat! 😊`;
            break;
            
        case 'promo':
            template = `🎉 PROMO SPESIAL untuk {nama}! 🎉

Dapatkan diskon 50% untuk {to}!

✅ Berlaku terbatas
✅ Hanya hari ini
✅ Syarat dan ketentuan berlaku

Buruan, jangan sampai terlewat!

Info: wa.me/6281234567890`;
            break;
            
        case 'reminder':
            template = `📅 REMINDER untuk {nama}

Jangan lupa:

• Acara penting untuk {to}
• Tanggal: [Isi tanggal]
• Waktu: [Isi waktu]
• Lokasi: [Isi lokasi]

Terima kasih! 🙏`;
            break;
            
        case 'wedding':
            template = `💒 UNDANGAN PERNIKAHAN 💒

Bismillahirrahmanirrahim

Assalamu'alaikum Wr. Wb.

Dengan memohon rahmat dan ridho Allah SWT, kami mengundang {nama} untuk hadir dalam acara pernikahan:

👰🤵 PENGANTIN:
[Nama Mempelai Wanita] & [Nama Mempelai Pria]

📅 AKAD NIKAH:
Hari: [Hari, Tanggal]
Waktu: [Waktu] WIB
Tempat: [Alamat Akad]

🎉 RESEPSI:
Hari: [Hari, Tanggal]
Waktu: [Waktu] WIB
Tempat: [Alamat Resepsi]

Untuk detail lainnya dapat mengakses tautan berikut:
[Link ke undangan online]/?to={to}

Merupakan kehormatan bagi kami apabila {nama} berkenan hadir memberikan doa restu.

Jazakumullahu khairan katsiiran
Wassalamu'alaikum Wr. Wb.

❤️ Keluarga [Nama Keluarga]`;
            break;
    }
    
    document.getElementById('messageTemplate').value = template;
    updateTemplatePreview();
}

// Update message template
async function updateTemplate() {
    const template = document.getElementById('messageTemplate').value.trim();
    
    if (!template) {
        showAlert('Template pesan tidak boleh kosong', 'warning');
        return;
    }
    
    try {
        const response = await fetch('/api/message-template', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ template })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            messageTemplate = template;
            showAlert('Template pesan berhasil disimpan', 'success');
            updateTemplatePreview();
        } else {
            showAlert(data.error || 'Gagal menyimpan template', 'danger');
        }
        
    } catch (error) {
        showAlert('Error updating template', 'danger');
        console.error('Update template error:', error);
    }
}

// Save API credentials (now saves locally)
async function saveCredentials() {
    const newApiKey = document.getElementById('apiKey').value.trim();
    const newSender = document.getElementById('sender').value.trim();
    
    if (!newApiKey || !newSender) {
        showAlert('API Key dan Sender harus diisi', 'warning');
        return;
    }
    
    try {
        apiKey = newApiKey;
        sender = newSender;
        saveToLocalStorage();
        showAlert('Kredensial API berhasil disimpan', 'success');
        
    } catch (error) {
        showAlert('Error saving credentials', 'danger');
        console.error('Save credentials error:', error);
    }
}

// Upload contacts file (now processes locally)
async function uploadContacts() {
    const fileInput = document.getElementById('contactFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Pilih file terlebih dahulu', 'warning');
        return;
    }
    
    try {
        const fileContent = await file.text();
        
        // Parse CSV/TXT file locally
        const lines = fileContent.split('\n').filter(line => line.trim() !== '');
        const newContacts = [];
        
        lines.forEach((line, index) => {
            const parts = line.split(',').map(part => part.trim().replace(/"/g, ''));
            if (parts.length >= 2) {
                const [name, phone] = parts;
                if (name && phone) {
                    newContacts.push({
                        id: Date.now() + index,
                        name: name,
                        phone: phone.replace(/\D/g, ''), // Remove non-digits
                        status: 'pending'
                    });
                }
            }
        });
        
        contacts = newContacts;
        saveToLocalStorage();
        updateContactsList();
        showAlert(`${newContacts.length} contacts uploaded successfully`, 'success');
        fileInput.value = ''; // Clear file input
        
    } catch (error) {
        showAlert('Error reading file', 'danger');
        console.error('Upload error:', error);
    }
}

// Add single contact (now saves locally)
async function addContact() {
    const name = document.getElementById('contactName').value.trim();
    const phone = document.getElementById('contactPhone').value.trim();
    
    if (!name || !phone) {
        showAlert('Nama dan nomor telepon harus diisi', 'warning');
        return;
    }
    
    try {
        const contact = {
            id: Date.now(),
            name: name,
            phone: phone.replace(/\D/g, ''),
            status: 'pending'
        };
        
        contacts.push(contact);
        saveToLocalStorage();
        updateContactsList();
        showAlert('Contact added successfully', 'success');
        
        // Clear inputs
        document.getElementById('contactName').value = '';
        document.getElementById('contactPhone').value = '';
        
    } catch (error) {
        showAlert('Error adding contact', 'danger');
        console.error('Add contact error:', error);
    }
}

// Delete specific contact (now removes locally)
async function deleteContact(contactId) {
    if (!confirm('Hapus kontak ini?')) {
        return;
    }
    
    try {
        const initialLength = contacts.length;
        contacts = contacts.filter(contact => contact.id !== contactId);
        
        if (contacts.length < initialLength) {
            saveToLocalStorage();
            updateContactsList();
            showAlert('Contact deleted successfully', 'success');
        } else {
            showAlert('Contact not found', 'danger');
        }
        
    } catch (error) {
        showAlert('Error deleting contact', 'danger');
        console.error('Delete contact error:', error);
    }
}

// Clear all contacts (now clears locally)
async function clearAllContacts() {
    if (!confirm('Hapus semua kontak dan riwayat pengiriman?')) {
        return;
    }
    
    try {
        contacts = [];
        sendHistory = [];
        saveToLocalStorage();
        updateContactsList();
        document.getElementById('sendHistory').innerHTML = '';
        showAlert('All contacts and history cleared successfully', 'success');
        
    } catch (error) {
        showAlert('Error clearing contacts', 'danger');
        console.error('Clear contacts error:', error);
    }
}

// Update contacts list display
function updateContactsList() {
    const contactsList = document.getElementById('contactsList');
    const contactCount = document.getElementById('contactCount');
    
    contactCount.textContent = contacts.length;
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="text-muted">Belum ada kontak. Upload file atau tambah manual.</p>';
        return;
    }
    
    const contactsHTML = contacts.map(contact => {
        let statusBadge = '';
        let actionButtons = '';
        
        switch (contact.status) {
            case 'pending':
                statusBadge = '<span class="badge bg-secondary status-badge">Pending</span>';
                actionButtons = `
                    <button class="btn btn-sm btn-success me-1" onclick="sendMessageToContact(${contact.id})" title="Kirim pesan">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                `;
                break;
            case 'sent':
                statusBadge = '<span class="badge bg-success status-badge">Terkirim</span>';
                actionButtons = `
                    <button class="btn btn-sm btn-warning me-1" onclick="resetContactStatus(${contact.id})" title="Reset status">
                        <i class="fas fa-redo"></i>
                    </button>
                `;
                break;
            case 'failed':
                statusBadge = '<span class="badge bg-danger status-badge">Gagal</span>';
                actionButtons = `
                    <button class="btn btn-sm btn-success me-1" onclick="sendMessageToContact(${contact.id})" title="Kirim ulang">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button class="btn btn-sm btn-warning me-1" onclick="resetContactStatus(${contact.id})" title="Reset status">
                        <i class="fas fa-redo"></i>
                    </button>
                `;
                break;
        }
        
        return `
            <div class="contact-item card mb-2">
                <div class="card-body py-2">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <strong>${contact.name}</strong>
                        </div>
                        <div class="col-md-2">
                            ${contact.phone}
                        </div>
                        <div class="col-md-3">
                            ${statusBadge}
                            ${contact.sentAt ? `<br><small class="text-muted">${new Date(contact.sentAt).toLocaleString('id-ID')}</small>` : ''}
                        </div>
                        <div class="col-md-4 text-end">
                            ${actionButtons}
                            <button class="btn btn-sm btn-danger" onclick="deleteContact(${contact.id})" title="Hapus kontak">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    ${contact.error ? `<div class="mt-1"><small class="text-danger">Error: ${contact.error}</small></div>` : ''}
                </div>
            </div>
        `;
    }).join('');
    
    contactsList.innerHTML = contactsHTML;
}

// Send messages to all contacts
async function sendMessages() {
    // Get current values from form (in case user hasn't saved them yet)
    const currentApiKey = document.getElementById('apiKey').value.trim();
    const currentSender = document.getElementById('sender').value.trim();
    
    // Use session values as fallback, but prefer current form values
    const useApiKey = currentApiKey || apiKey;
    const useSender = currentSender || sender;
    
    if (!useApiKey || !useSender) {
        showAlert('API Key dan Sender harus diisi dan disimpan terlebih dahulu', 'warning');
        return;
    }
    
    if (contacts.length === 0) {
        showAlert('Tidak ada kontak untuk dikirim pesan. Silakan tambah kontak terlebih dahulu.', 'warning');
        return;
    }
    
    if (!messageTemplate) {
        showAlert('Template pesan harus diisi dan disimpan terlebih dahulu', 'warning');
        return;
    }
    
    // Count pending contacts
    const pendingContacts = contacts.filter(c => c.status === 'pending');
    
    if (pendingContacts.length === 0) {
        showAlert('Tidak ada kontak dengan status pending untuk dikirim pesan', 'info');
        return;
    }
    
    // Estimate time
    const estimatedTimeMinutes = Math.ceil((pendingContacts.length * 4) / 60); // Average 4 seconds per message
    if (pendingContacts.length > 5) {
        const confirmMessage = `Akan mengirim pesan ke ${pendingContacts.length} kontak.\n\nEstimasi waktu: ${estimatedTimeMinutes} menit\n(dengan jeda 3-5 detik antar pesan untuk menghindari spam)\n\nLanjutkan?`;
        if (!confirm(confirmMessage)) {
            return;
        }
    }
    
    // Show loading
    const loadingDiv = document.querySelector('.loading');
    const sendButton = document.querySelector('button[onclick="sendMessages()"]');
    const progressSpan = document.getElementById('sendProgress');
    
    loadingDiv.style.display = 'block';
    sendButton.disabled = true;
    
    let processedCount = 0;
    let successCount = 0;
    let failedCount = 0;
    
    // Update progress display
    function updateProgress() {
        progressSpan.textContent = `${processedCount}/${pendingContacts.length} (Berhasil: ${successCount}, Gagal: ${failedCount})`;
    }
    
    updateProgress();
    
    try {
        // Process contacts one by one to show real-time progress
        for (let i = 0; i < pendingContacts.length; i++) {
            const contact = pendingContacts[i];
            
            try {
                // Send message to individual contact
                const response = await fetch('/api/send-messages', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ 
                        apiKey: useApiKey, 
                        sender: useSender,
                        contactId: contact.id,
                        contacts: contacts,
                        messageTemplate: messageTemplate
                    })
                });
                
                const data = await response.json();
                
                if (response.ok && data.summary.success > 0) {
                    successCount++;
                    // Update local contact status
                    const localContact = contacts.find(c => c.id === contact.id);
                    if (localContact) {
                        localContact.status = 'sent';
                        localContact.sentAt = new Date().toISOString();
                    }
                } else {
                    failedCount++;
                    // Update local contact status
                    const localContact = contacts.find(c => c.id === contact.id);
                    if (localContact) {
                        localContact.status = 'failed';
                        localContact.error = data.error || 'Unknown error';
                    }
                }
                
                // Save contacts status to localStorage after each update
                saveToLocalStorage();
                
                // Save to send history if this is the last contact or an error occurred
                if (response.ok && data.results) {
                    // Add to send history
                    const historyEntry = {
                        id: Date.now() + i,
                        timestamp: new Date().toISOString(),
                        template: messageTemplate,
                        results: data.results,
                        totalContacts: contacts.length,
                        successCount: data.summary?.success || 0,
                        failedCount: data.summary?.failed || 0
                    };
                    sendHistory.push(historyEntry);
                    saveToLocalStorage();
                }
                
            } catch (error) {
                console.error(`Error sending to ${contact.name}:`, error);
                failedCount++;
                // Update local contact status
                const localContact = contacts.find(c => c.id === contact.id);
                if (localContact) {
                    localContact.status = 'failed';
                    localContact.error = 'Network error';
                }
                // Save contacts status to localStorage after each update
                saveToLocalStorage();
            }
            
            processedCount++;
            updateProgress();
            updateContactsList(); // Update UI immediately
            
            // Add delay between messages (except for the last one)
            if (i < pendingContacts.length - 1) {
                const baseDelay = 3000; // 3 seconds base
                const randomDelay = Math.floor(Math.random() * 2000); // 0-2 seconds random
                const delayTime = baseDelay + randomDelay; // 3-5 seconds total
                
                // Show countdown for next message
                let countdown = Math.ceil(delayTime / 1000);
                const countdownInterval = setInterval(() => {
                    progressSpan.textContent = `${processedCount}/${pendingContacts.length} (Berhasil: ${successCount}, Gagal: ${failedCount}) - Menunggu ${countdown}s`;
                    countdown--;
                    if (countdown <= 0) {
                        clearInterval(countdownInterval);
                        updateProgress();
                    }
                }, 1000);
                
                await new Promise(resolve => setTimeout(resolve, delayTime));
                clearInterval(countdownInterval);
            }
        }
        
        // Show final results
        const resultsHTML = `
            <div class="alert alert-info">
                <h6>Hasil Pengiriman:</h6>
                <ul class="mb-0">
                    <li>Total diproses: ${processedCount}</li>
                    <li>Berhasil: <span class="text-success">${successCount}</span></li>
                    <li>Gagal: <span class="text-danger">${failedCount}</span></li>
                </ul>
                <small class="text-muted">Pengiriman dilakukan dengan jeda 3-5 detik untuk menghindari spam.</small>
            </div>
        `;
        document.getElementById('sendResults').innerHTML = resultsHTML;
        
        const alertType = failedCount > 0 ? 'warning' : 'success';
        const alertMessage = `Pengiriman selesai! ${successCount} berhasil, ${failedCount} gagal dari ${processedCount} kontak.`;
        showAlert(alertMessage, alertType);
        
    } catch (error) {
        showAlert('Error during bulk sending process', 'danger');
        console.error('Bulk send error:', error);
    } finally {
        // Hide loading
        loadingDiv.style.display = 'none';
        sendButton.disabled = false;
        progressSpan.textContent = '';
    }
}

// Send message to individual contact
async function sendMessageToContact(contactId) {
    const currentApiKey = document.getElementById('apiKey').value.trim();
    const currentSender = document.getElementById('sender').value.trim();
    
    const useApiKey = currentApiKey || apiKey;
    const useSender = currentSender || sender;
    
    if (!useApiKey || !useSender) {
        showAlert('API Key dan Sender harus diisi dan disimpan terlebih dahulu', 'warning');
        return;
    }
    
    if (!messageTemplate) {
        showAlert('Template pesan harus diisi dan disimpan terlebih dahulu', 'warning');
        return;
    }
    
    // Show loading for this specific contact
    const contactButton = document.querySelector(`button[onclick="sendMessageToContact(${contactId})"]`);
    const originalText = contactButton.innerHTML;
    contactButton.disabled = true;
    contactButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Mengirim...';
    
    try {
        const response = await fetch('/api/send-messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                apiKey: useApiKey, 
                sender: useSender,
                contactId: contactId,
                contacts: contacts,
                messageTemplate: messageTemplate
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Update contacts with response from server
            contacts = data.updatedContacts || contacts;
            saveToLocalStorage();
            updateContactsList();
            
            const contact = contacts.find(c => c.id === contactId);
            const statusText = data.summary.success > 0 ? 'berhasil' : 'gagal';
            showAlert(`Pesan ke ${contact.name} ${statusText} dikirim`, data.summary.success > 0 ? 'success' : 'danger');
        } else {
            showAlert(data.error || 'Gagal mengirim pesan', 'danger');
        }
        
    } catch (error) {
        showAlert('Error sending message', 'danger');
        console.error('Send message error:', error);
    } finally {
        // Reset button
        contactButton.disabled = false;
        contactButton.innerHTML = originalText;
    }
}

// Reset contact status
async function resetContactStatus(contactId) {
    if (!confirm('Reset status kontak ini ke pending?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/reset-contact-status/${contactId}`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (response.ok) {
            contacts = data.contacts;
            updateContactsList();
            showAlert(data.message, 'success');
        } else {
            showAlert(data.error || 'Gagal reset status kontak', 'danger');
        }
        
    } catch (error) {
        showAlert('Error resetting contact status', 'danger');
        console.error('Reset contact status error:', error);
    }
}

// Reset all contacts status (now resets locally)
async function resetAllStatus() {
    if (!confirm('Reset status semua kontak ke pending?')) {
        return;
    }
    
    try {
        contacts.forEach(contact => {
            contact.status = 'pending';
            delete contact.sentAt;
            delete contact.error;
            delete contact.response;
        });
        
        saveToLocalStorage();
        updateContactsList();
        showAlert('Status semua kontak berhasil direset ke pending', 'success');
        
    } catch (error) {
        showAlert('Error resetting all status', 'danger');
        console.error('Reset all status error:', error);
    }
}

// Download report
async function downloadReport() {
    try {
        const response = await fetch('/api/download-report');
        
        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `whatsapp-report-${Date.now()}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
            
            showAlert('Laporan berhasil diunduh', 'success');
        } else {
            const data = await response.json();
            showAlert(data.error || 'Gagal mengunduh laporan', 'danger');
        }
        
    } catch (error) {
        showAlert('Error downloading report', 'danger');
        console.error('Download error:', error);
    }
}

// Load send history
async function loadSendHistory() {
    try {
        const response = await fetch('/api/send-history');
        const data = await response.json();
        
        if (response.ok) {
            sendHistory = data.history;
            displaySendHistory();
        } else {
            showAlert(data.error || 'Gagal memuat riwayat', 'danger');
        }
        
    } catch (error) {
        showAlert('Error loading send history', 'danger');
        console.error('Load history error:', error);
    }
}

// Display send history
function displaySendHistory() {
    const historyDiv = document.getElementById('sendHistory');
    
    if (sendHistory.length === 0) {
        historyDiv.innerHTML = '<p class="text-muted">Belum ada riwayat pengiriman.</p>';
        return;
    }
    
    const historyHTML = sendHistory.map(history => {
        // Escape HTML and preserve line breaks for template display
        const templateDisplay = history.template
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/\n/g, '<br>');
            
        return `
            <div class="card mb-3">
                <div class="card-header">
                    <div class="row">
                        <div class="col-md-6">
                            <strong>${new Date(history.timestamp).toLocaleString('id-ID')}</strong>
                        </div>
                        <div class="col-md-6 text-end">
                            Total: ${history.totalContacts} | 
                            Berhasil: <span class="text-success">${history.successCount}</span> | 
                            Gagal: <span class="text-danger">${history.failedCount}</span>
                        </div>
                    </div>
                </div>
                <div class="card-body">
                    <div class="mb-3">
                        <strong>Template:</strong>
                        <div class="template-preview mt-1">${templateDisplay}</div>
                    </div>
                    <div class="row">
                        ${history.results.map(result => `
                            <div class="col-md-6 mb-2">
                                <div class="border p-2 rounded">
                                    <strong>${result.contact.name}</strong> (${result.contact.phone})<br>
                                    <span class="badge ${result.status === 'success' ? 'bg-success' : 'bg-danger'}">${result.status}</span>
                                    ${result.error ? `<br><small class="text-danger">${result.error}</small>` : ''}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;
    }).reverse().join('');
    
    historyDiv.innerHTML = historyHTML;
}

// ========== LocalStorage Management Functions ==========

// Clear all localStorage data
function clearAllData() {
    if (confirm('Hapus semua data termasuk kontak, template, dan riwayat?\n\nTindakan ini tidak dapat dibatalkan!')) {
        try {
            // Clear localStorage
            Object.values(STORAGE_KEYS).forEach(key => {
                localStorage.removeItem(key);
            });
            
            // Reset all variables
            contacts = [];
            messageTemplate = 'Halo {nama},\n\nPesan ini dikirim untuk {to}.\n\nTerima kasih!';
            sendHistory = [];
            apiKey = '';
            sender = '';
            
            // Update UI
            document.getElementById('messageTemplate').value = messageTemplate;
            document.getElementById('apiKey').value = '';
            document.getElementById('sender').value = '';
            
            updateContactsList();
            updateTemplatePreview();
            
            showAlert('Semua data berhasil dihapus', 'success');
            
        } catch (error) {
            console.error('Clear data error:', error);
            showAlert('Error clearing data', 'danger');
        }
    }
}
