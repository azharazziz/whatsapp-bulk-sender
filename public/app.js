// Global variables
let contacts = [];
let messageTemplate = '';
let sendHistory = [];
let apiKey = '';
let sender = '';

// Pagination and search variables
let currentPage = 1;
let itemsPerPage = 25;
let filteredContacts = [];
let searchTerm = '';
let statusFilter = '';

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
    updateSaveButtonState(); // Initialize save button state
    
    // Add event listeners
    document.getElementById('messageTemplate').addEventListener('input', function() {
        updateTemplatePreview(); // Update preview and button state
    });
    
    // Add keyboard shortcuts for formatting
    document.getElementById('messageTemplate').addEventListener('keydown', handleKeyboardShortcuts);
    
    // Auto-save to localStorage when data changes (but not template - only on manual save)
    window.addEventListener('beforeunload', function(e) {
        saveToLocalStorage();
        
        // Warn user if template is not saved
        const currentTemplate = document.getElementById('messageTemplate').value;
        const isTemplateSaved = currentTemplate === messageTemplate;
        
        if (!isTemplateSaved && currentTemplate) {
            const message = 'Template pesan belum disimpan. Apakah Anda yakin ingin keluar?';
            e.preventDefault();
            e.returnValue = message;
            return message;
        }
    });
    
    // Initialize footer interactions
    initFooterInteractions();
    
    // Initialize header functionality
    initHeaderFunctionality();
});

// Handle keyboard shortcuts for formatting
function handleKeyboardShortcuts(event) {
    // Check if Ctrl/Cmd is pressed
    const isCtrlOrCmd = event.ctrlKey || event.metaKey;
    
    if (!isCtrlOrCmd) return;
    
    const textarea = event.target;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const hasSelection = start !== end;
    
    if (!hasSelection) return;
    
    let preventDefault = false;
    
    switch (event.key.toLowerCase()) {
        case 'b': // Ctrl+B for bold
            event.preventDefault();
            applyFormatting('bold');
            preventDefault = true;
            break;
        case 'i': // Ctrl+I for italic
            event.preventDefault();
            applyFormatting('italic');
            preventDefault = true;
            break;
        case 'u': // Ctrl+U for strikethrough (since there's no standard)
            event.preventDefault();
            applyFormatting('strikethrough');
            preventDefault = true;
            break;
        case 'k': // Ctrl+K for monospace
            event.preventDefault();
            applyFormatting('monospace');
            preventDefault = true;
            break;
    }
    
    return !preventDefault;
}

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
        
        // Try loading from old keys if new keys are empty (backward compatibility)
        const oldHistoryKey = 'wa_bot_send_history';
        const oldHistory = localStorage.getItem(oldHistoryKey);
        
        contacts = savedContacts ? JSON.parse(savedContacts) : [];
        messageTemplate = savedTemplate || 'Halo *{nama}*,\n\nPesan ini dikirim untuk _{nama}_.\n\nLink: undangan.com/?to={nama_url}\n\nTerima kasih!';
        sendHistory = savedHistory ? JSON.parse(savedHistory) : (oldHistory ? JSON.parse(oldHistory) : []);
        apiKey = savedApiKey || '';
        sender = savedSender || '';
        
        // If we loaded from old key, migrate to new key
        if (!savedHistory && oldHistory) {
            console.log('Migrating sendHistory from old key to new key');
            localStorage.setItem(STORAGE_KEYS.HISTORY, oldHistory);
            localStorage.removeItem(oldHistoryKey);
        }
        
        console.log('Loaded from localStorage:', {
            contacts: contacts.length,
            template: messageTemplate ? 'present' : 'empty',
            history: sendHistory.length,
            apiKey: apiKey ? 'present' : 'empty',
            sender: sender ? 'present' : 'empty'
        });
        
        document.getElementById('messageTemplate').value = messageTemplate;
        document.getElementById('apiKey').value = apiKey;
        document.getElementById('sender').value = sender;
        
        // Initialize filtered contacts
        filteredContacts = [...contacts];
        
        updateContactsList();
        updateTemplatePreview();
        
    } catch (error) {
        console.error('Error loading from localStorage:', error);
        showAlert('Error loading local data, using defaults', 'warning');
        
        // Use defaults if localStorage fails
        contacts = [];
        messageTemplate = 'Halo *{nama}*,\n\nPesan ini dikirim untuk _{nama}_.\n\nLink: undangan.com/?to={nama_url}\n\nTerima kasih!';
        sendHistory = [];
        apiKey = '';
        sender = '';
        
        document.getElementById('messageTemplate').value = messageTemplate;
        updateContactsList();
        updateTemplatePreview();
    }
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
    
    // Don't change templateSaved here - it should only be changed in specific functions
    // This function is called for preview updates, not to determine save status
    
    // Update save button state
    updateSaveButtonState();
    
    // Only auto-save if template hasn't changed much (to avoid constant saving)
    // We'll save on manual save or when leaving page
    
    if (!template) {
        document.getElementById('templatePreview').textContent = 'Template kosong...';
        return;
    }

    // Create WhatsApp formatted preview
    const preview = template
        .replace(/\r\n/g, '\n') // Normalize line breaks
        .replace(/\n{3,}/g, '\n\n') // Replace 3+ consecutive line breaks with 2
        .replace(/ {2,}/g, ' ') // Replace multiple spaces with single space
        .replace(/^\s+|\s+$/g, '') // Trim leading/trailing whitespace
        .replace(/{nama}/g, '[Nama Kontak]')
        .replace(/{nama_url}/g, '[Nama+untuk+URL]')
        .replace(/{to}/g, '[Nama+untuk+URL]'); // Keep backward compatibility
    
    // Apply WhatsApp formatting to preview
    const formattedPreview = formatWhatsAppText(preview);
    
    // Update preview with HTML formatting
    document.getElementById('templatePreview').innerHTML = formattedPreview;
}

// Update save button state based on template status
function updateSaveButtonState() {
    const saveButton = document.querySelector('button[onclick="updateTemplate()"]');
    const currentTemplate = document.getElementById('messageTemplate').value;
    
    if (!saveButton) return;
    
    // Check if current template matches saved template
    const isTemplateSaved = currentTemplate === messageTemplate;
    
    if (isTemplateSaved && currentTemplate) {
        // Template is saved and not empty
        saveButton.innerHTML = '<i class="fas fa-check text-success"></i> Template Tersimpan';
        saveButton.className = 'btn btn-outline-success';
        saveButton.style.backgroundColor = '';
        saveButton.style.borderColor = '';
        saveButton.style.color = '';
        saveButton.disabled = true;
    } else if (currentTemplate) {
        // Template has changes, not saved - use orange background with white text for better contrast
        saveButton.innerHTML = '<i class="fas fa-exclamation-triangle me-1"></i><strong>Simpan Template</strong>';
        saveButton.className = 'btn btn-warning text-dark';
        saveButton.style.backgroundColor = '#ffc107';
        saveButton.style.borderColor = '#ffc107';
        saveButton.style.color = '#000';
        saveButton.disabled = false;
    } else {
        // Template is empty
        saveButton.innerHTML = '<i class="fas fa-save"></i> Simpan Template';
        saveButton.className = 'btn btn-secondary';
        saveButton.style.backgroundColor = '';
        saveButton.style.borderColor = '';
        saveButton.style.color = '';
        saveButton.disabled = true;
    }
}

// Convert WhatsApp formatting to HTML
function formatWhatsAppText(text) {
    let formatted = text;
    
    // Bold: *text* -> <span class="wa-bold">text</span>
    formatted = formatted.replace(/\*([^*\n]+)\*/g, '<span class="wa-bold">$1</span>');
    
    // Italic: _text_ -> <span class="wa-italic">text</span>
    formatted = formatted.replace(/_([^_\n]+)_/g, '<span class="wa-italic">$1</span>');
    
    // Strikethrough: ~text~ -> <span class="wa-strikethrough">text</span>
    formatted = formatted.replace(/~([^~\n]+)~/g, '<span class="wa-strikethrough">$1</span>');
    
    // Monospace: ```text``` -> <span class="wa-monospace">text</span>
    formatted = formatted.replace(/```([^`]+)```/g, '<span class="wa-monospace">$1</span>');
    
    // Convert line breaks to <br> tags
    formatted = formatted.replace(/\n/g, '<br>');
    
    return formatted;
}

// Apply formatting to selected text in textarea
function applyFormatting(type) {
    const textarea = document.getElementById('messageTemplate');
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    if (!selectedText) {
        showAlert('Pilih teks yang ingin diformat terlebih dahulu', 'warning');
        return;
    }
    
    let formattedText = '';
    
    switch (type) {
        case 'bold':
            formattedText = `*${selectedText}*`;
            break;
        case 'italic':
            formattedText = `_${selectedText}_`;
            break;
        case 'strikethrough':
            formattedText = `~${selectedText}~`;
            break;
        case 'monospace':
            formattedText = `\`\`\`${selectedText}\`\`\``;
            break;
    }
    
    // Replace selected text with formatted text
    const newValue = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
    textarea.value = newValue;
    
    // Set cursor position after the formatted text
    const newCursorPos = start + formattedText.length;
    textarea.setSelectionRange(newCursorPos, newCursorPos);
    
    // Update preview
    updateTemplatePreview();
    
    // Focus back to textarea
    textarea.focus();
    
    // Template has been modified, update preview
    updateTemplatePreview();
}

// Show formatting help
function showFormattingHelp() {
    const helpElement = document.getElementById('formattingHelp');
    if (helpElement.classList.contains('show')) {
        helpElement.classList.remove('show');
    } else {
        helpElement.classList.add('show');
    }
}

// Preview message with WhatsApp formatting
function previewWhatsAppFormat() {
    const template = document.getElementById('messageTemplate').value;
    
    if (!template) {
        showAlert('Template pesan kosong', 'warning');
        return;
    }
    
    // Create a modal for full preview
    const modalHtml = `
        <div class="modal fade" id="formatPreviewModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header bg-success text-white">
                        <h5 class="modal-title">
                            <i class="fab fa-whatsapp me-2"></i>Preview Format WhatsApp
                        </h5>
                        <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6><i class="fas fa-code me-1"></i>Raw Text:</h6>
                                <pre class="bg-light p-3 rounded" style="white-space: pre-wrap; font-size: 14px;">${template.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>
                            </div>
                            <div class="col-md-6">
                                <h6><i class="fab fa-whatsapp me-1"></i>WhatsApp Preview:</h6>
                                <div class="whatsapp-preview">${formatWhatsAppText(template.replace(/{nama}/g, 'John Doe').replace(/{nama_url}/g, 'John+Doe').replace(/{to}/g, 'John+Doe'))}</div>
                            </div>
                        </div>
                        <div class="mt-3">
                            <h6><i class="fas fa-info-circle me-1"></i>Format Yang Didukung:</h6>
                            <div class="row">
                                <div class="col-md-3 mb-2">
                                    <small><strong>*Bold*</strong> → <strong>Bold</strong></small>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <small><strong>_Italic_</strong> → <em>Italic</em></small>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <small><strong>~Strike~</strong> → <del>Strike</del></small>
                                </div>
                                <div class="col-md-3 mb-2">
                                    <small><strong>\`\`\`Code\`\`\`</strong> → <code>Code</code></small>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Tutup</button>
                        <button type="button" class="btn btn-success" onclick="copyFormattedText()" data-bs-dismiss="modal">
                            <i class="fas fa-copy me-1"></i>Copy Template
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal if any
    const existingModal = document.getElementById('formatPreviewModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('formatPreviewModal'));
    modal.show();
}

// Copy formatted text to clipboard
function copyFormattedText() {
    const template = document.getElementById('messageTemplate').value;
    navigator.clipboard.writeText(template).then(() => {
        showAlert('Template berhasil disalin ke clipboard', 'success');
    }).catch(() => {
        showAlert('Gagal menyalin template', 'danger');
    });
}

// Load quick templates
function loadQuickTemplate(type) {
    let template = '';
    
    switch (type) {
        case 'formal':
            template = `Kepada Yth. *{nama}*,

Dengan hormat,

Kami mengirimkan pesan ini untuk memberikan informasi kepada _{nama}_.

Jika ada pertanyaan lebih lanjut, silakan hubungi kami.

Terima kasih atas perhatiannya.

Hormat kami,
*Tim WhatsApp Bot*`;
            break;
            
        case 'casual':
            template = `Halo *{nama}*! 👋

Apa kabar?

Kami ingin berbagi informasi menarik untuk _{nama}_.

~Jangan sampai terlewat~ informasi penting ini!

Salam hangat! 😊`;
            break;
            
        case 'promo':
            template = `🎉 *PROMO SPESIAL* untuk *{nama}*! 🎉

Dapatkan _diskon 50%_ untuk {nama}!

✅ Berlaku terbatas
✅ Hanya hari ini
✅ Syarat dan ketentuan berlaku

~Buruan, jangan sampai terlewat!~

Kode Promo: \`\`\`SAVE50\`\`\`

Info: wa.me/6281234567890`;
            break;
            
        case 'reminder':
            template = `📅 *REMINDER* untuk *{nama}*

Jangan lupa:

• Acara penting untuk _{nama}_
• Tanggal: \`\`\`[Isi tanggal]\`\`\`
• Waktu: \`\`\`[Isi waktu]\`\`\`
• Lokasi: \`\`\`[Isi lokasi]\`\`\`

~Harap konfirmasi kehadiran~

Terima kasih! 🙏`;
            break;
            
        case 'wedding':
            template = `Hai *{nama}* 👋

*Alhamdulillah*, insyaAllah kami akan melangsungkan _akad & resepsi pernikahan_ pada *[Hari, Tanggal Singkat]* di *[Kota/Daerah Singkat]* 🥰

Kami berharap _{nama}_ bisa hadir dan berbagi kebahagiaan bersama kami 💐

Detail lengkap waktu, lokasi, dan info acara bisa dilihat di sini:
🌐 *link-undangan-anda.com/?to={nama_url}*

_Doa dan kehadiranmu sangat berarti untuk kami_ 🤍

Terima kasih! ✨`;
            break;
    }
    
    document.getElementById('messageTemplate').value = template;
    updateTemplatePreview(); // This will show unsaved status
}

// Update message template
async function updateTemplate() {
    const template = document.getElementById('messageTemplate').value.trim();
    
    if (!template) {
        showAlert('Template pesan tidak boleh kosong', 'warning');
        return;
    }
    
    try {
        messageTemplate = template; // Save to global variable
        saveToLocalStorage();
        showAlert('Template pesan berhasil disimpan', 'success');
        updateTemplatePreview(); // This will update the button state
        
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
        
        // Update API status after saving credentials
        updateApiStatus();
        
        showAlert('Kredensial API berhasil disimpan', 'success');
        
    } catch (error) {
        showAlert('Error saving credentials', 'danger');
        console.error('Save credentials error:', error);
    }
}

// Upload contacts file (uses server API for vCard support)
async function uploadContacts() {
    const fileInput = document.getElementById('contactFile');
    const file = fileInput.files[0];
    
    if (!file) {
        showAlert('Pilih file terlebih dahulu', 'warning');
        return;
    }
    
    // Show loading
    const uploadButton = document.querySelector('button[onclick="uploadContacts()"]');
    const originalText = uploadButton.innerHTML;
    uploadButton.disabled = true;
    uploadButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
    
    try {
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('contactFile', file);
        
        console.log('Uploading file:', {
            name: file.name,
            type: file.type,
            size: file.size
        });
        
        const response = await fetch('/api/upload-contacts', {
            method: 'POST',
            body: formData // No Content-Type header needed with FormData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Replace current contacts with uploaded ones
            contacts = data.contacts || [];
            saveToLocalStorage();
            updateContactsList();
            
            const fileType = data.fileType ? ` (${data.fileType})` : '';
            showAlert(`${data.message}${fileType}`, 'success');
            fileInput.value = ''; // Clear file input
            
            console.log('Upload successful:', {
                contactsCount: contacts.length,
                fileType: data.fileType
            });
            
        } else {
            showAlert(data.error || 'Gagal upload file', 'danger');
            console.error('Upload failed:', data);
        }
        
    } catch (error) {
        showAlert('Error uploading file', 'danger');
        console.error('Upload error:', error);
    } finally {
        // Reset button
        uploadButton.disabled = false;
        uploadButton.innerHTML = originalText;
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
    // Apply search and filter first
    applySearchAndFilter();
    
    const contactsList = document.getElementById('contactsList');
    const contactCount = document.getElementById('contactCount');
    
    contactCount.textContent = contacts.length;
    
    // Update header stats as well
    updateHeaderStats();
    
    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="text-muted">Belum ada kontak. Upload file atau tambah manual.</p>';
        updatePaginationInfo(0, 0, 0);
        document.getElementById('pagination').innerHTML = '';
        return;
    }
    
    // Calculate pagination
    const totalItems = filteredContacts.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
    const currentContacts = filteredContacts.slice(startIndex, endIndex);
    
    if (currentContacts.length === 0 && currentPage > 1) {
        currentPage = 1;
        updateContactsList();
        return;
    }
    
    // Generate contacts HTML
    const contactsHTML = currentContacts.map(contact => {
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
        
        // Highlight search terms
        const highlightedName = highlightSearchTerm(contact.name, searchTerm);
        const highlightedPhone = highlightSearchTerm(contact.phone, searchTerm);
        
        return `
            <div class="contact-item card mb-2">
                <div class="card-body py-2">
                    <div class="row align-items-center">
                        <div class="col-md-3">
                            <strong>${highlightedName}</strong>
                        </div>
                        <div class="col-md-2">
                            ${highlightedPhone}
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
    
    // Update pagination info and controls
    updatePaginationInfo(startIndex + 1, endIndex, totalItems);
    updatePaginationControls(currentPage, totalPages);
}

// Send messages to all contacts
async function sendMessages() {
    // Get current values from form (in case user hasn't saved them yet)
    const currentApiKey = document.getElementById('apiKey').value.trim();
    const currentSender = document.getElementById('sender').value.trim();
    
    // Use stored values as fallback, but prefer current form values
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
    
    // Check if template is saved
    const currentTemplate = document.getElementById('messageTemplate').value;
    const isTemplateSaved = currentTemplate === messageTemplate;
    
    if (!isTemplateSaved) {
        showAlert('Template pesan belum disimpan! Silakan simpan template terlebih dahulu.', 'warning');
        // Highlight save button
        const saveButton = document.querySelector('button[onclick="updateTemplate()"]');
        if (saveButton) {
            saveButton.classList.add('btn-pulse');
            setTimeout(() => saveButton.classList.remove('btn-pulse'), 2000);
        }
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
    let batchResults = []; // Collect all results for history
    
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
                
                if (response.ok && data.results && data.results.length > 0) {
                    // Add results to batch
                    batchResults.push(...data.results);
                    
                    if (data.summary.success > 0) {
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
                } else {
                    failedCount++;
                    // Update local contact status and add to batch results
                    const localContact = contacts.find(c => c.id === contact.id);
                    if (localContact) {
                        localContact.status = 'failed';
                        localContact.error = data.error || 'Unknown error';
                    }
                    // Add failed result to batch
                    batchResults.push({
                        contact: contact,
                        status: 'failed',
                        error: data.error || 'Unknown error',
                        message: messageTemplate
                            .replace(/{nama}/g, contact.name)
                            .replace(/{nama_url}/g, contact.name.replace(/\s+/g, '+'))
                            .replace(/{to}/g, contact.name.replace(/\s+/g, '+')) // Keep backward compatibility
                    });
                }
                
                // Save contacts status to localStorage after each update
                saveToLocalStorage();
                
            } catch (error) {
                console.error(`Error sending to ${contact.name}:`, error);
                failedCount++;
                // Update local contact status
                const localContact = contacts.find(c => c.id === contact.id);
                if (localContact) {
                    localContact.status = 'failed';
                    localContact.error = 'Network error';
                }
                // Add failed result to batch
                batchResults.push({
                    contact: contact,
                    status: 'failed',
                    error: 'Network error',
                    message: messageTemplate
                        .replace(/{nama}/g, contact.name)
                        .replace(/{nama_url}/g, contact.name.replace(/\s+/g, '+'))
                        .replace(/{to}/g, contact.name.replace(/\s+/g, '+')) // Keep backward compatibility
                });
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
        
        // Save batch results to send history
        if (batchResults.length > 0) {
            const historyEntry = {
                id: Date.now(),
                timestamp: new Date().toISOString(),
                template: messageTemplate,
                results: batchResults,
                totalContacts: processedCount,
                successCount: successCount,
                failedCount: failedCount
            };
            sendHistory.push(historyEntry);
            saveToLocalStorage();
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
            
            // Save to send history for individual contact
            if (data.results && data.results.length > 0) {
                const historyEntry = {
                    id: Date.now(),
                    timestamp: new Date().toISOString(),
                    template: messageTemplate,
                    results: data.results,
                    totalContacts: 1,
                    successCount: data.summary?.success || 0,
                    failedCount: data.summary?.failed || 0
                };
                sendHistory.push(historyEntry);
                saveToLocalStorage();
            }
            
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
        const contact = contacts.find(c => c.id === parseInt(contactId));
        
        if (!contact) {
            showAlert('Kontak tidak ditemukan', 'danger');
            return;
        }
        
        contact.status = 'pending';
        delete contact.sentAt;
        delete contact.error;
        delete contact.response;
        
        saveToLocalStorage();
        updateContactsList();
        showAlert('Status kontak berhasil direset', 'success');
        
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
        console.log('=== DOWNLOAD REPORT DEBUG ===');
        console.log('sendHistory:', sendHistory);
        console.log('sendHistory type:', typeof sendHistory);
        console.log('sendHistory length:', sendHistory.length);
        console.log('sendHistory is array:', Array.isArray(sendHistory));
        
        // Try to get from localStorage directly if empty
        if (!sendHistory || sendHistory.length === 0) {
            console.log('sendHistory empty, checking localStorage directly...');
            const directHistory = localStorage.getItem(STORAGE_KEYS.HISTORY);
            const oldHistory = localStorage.getItem('wa_bot_send_history');
            console.log('Direct localStorage HISTORY:', directHistory);
            console.log('Old localStorage key:', oldHistory);
            
            if (directHistory) {
                sendHistory = JSON.parse(directHistory);
                console.log('Loaded from direct localStorage:', sendHistory.length, 'entries');
            } else if (oldHistory) {
                sendHistory = JSON.parse(oldHistory);
                console.log('Loaded from old localStorage key:', sendHistory.length, 'entries');
                // Migrate to new key
                localStorage.setItem(STORAGE_KEYS.HISTORY, oldHistory);
                localStorage.removeItem('wa_bot_send_history');
            }
        }
        
        if (!sendHistory || sendHistory.length === 0) {
            showAlert('Tidak ada riwayat pengiriman untuk diunduh. Silakan kirim pesan terlebih dahulu.', 'warning');
            return;
        }
        
        console.log('Final sendHistory for download:', sendHistory);
        console.log('sendHistory length for API:', sendHistory.length);
        
        const response = await fetch('/api/download-report', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sendHistory })
        });
        
        console.log('Download response status:', response.status);
        console.log('Download response ok:', response.ok);
        
        if (response.ok) {
            const blob = await response.blob();
            console.log('Blob size:', blob.size);
            console.log('Blob type:', blob.type);
            
            if (blob.size === 0) {
                showAlert('File laporan kosong. Mungkin tidak ada data yang valid.', 'warning');
                return;
            }
            
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
            let errorText = '';
            try {
                const data = await response.json();
                errorText = data.error || 'Unknown error';
                console.error('Download failed with JSON error:', data);
            } catch (jsonError) {
                errorText = await response.text();
                console.error('Download failed with text error:', errorText);
            }
            showAlert(`Gagal mengunduh laporan: ${errorText}`, 'danger');
        }
        
    } catch (error) {
        showAlert('Error downloading report', 'danger');
        console.error('Download error:', error);
    }
}

// Load send history
async function loadSendHistory() {
    try {
        console.log('Loading send history, current sendHistory:', sendHistory);
        // History is already loaded from localStorage, just display it
        displaySendHistory();
        
    } catch (error) {
        showAlert('Error loading send history', 'danger');
        console.error('Load history error:', error);
    }
}

// Display send history
function displaySendHistory() {
    const historyDiv = document.getElementById('sendHistory');
    
    console.log('Displaying send history, sendHistory array:', sendHistory);
    console.log('sendHistory length:', sendHistory.length);
    
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
            messageTemplate = 'Halo *{nama}*,\n\nPesan ini dikirim untuk _{nama}_.\n\nLink: undangan.com/?to={nama_url}\n\nTerima kasih!';
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
            // Template is now saved since it matches default
            
        } catch (error) {
            console.error('Clear data error:', error);
            showAlert('Error clearing data', 'danger');
        }
    }
}

// ========== Search, Filter, and Pagination Functions ==========

// Apply search and filter to contacts
function applySearchAndFilter() {
    filteredContacts = contacts.filter(contact => {
        // Apply search filter
        let matchesSearch = true;
        if (searchTerm) {
            const searchLower = searchTerm.toLowerCase();
            matchesSearch = contact.name.toLowerCase().includes(searchLower) || 
                           contact.phone.toLowerCase().includes(searchLower);
        }
        
        // Apply status filter
        let matchesStatus = true;
        if (statusFilter) {
            matchesStatus = contact.status === statusFilter;
        }
        
        return matchesSearch && matchesStatus;
    });
}

// Search contacts function called from HTML
function searchContacts() {
    searchTerm = document.getElementById('searchContacts').value.trim();
    currentPage = 1; // Reset to first page
    updateContactsList();
}

// Filter contacts by status
function filterContacts() {
    statusFilter = document.getElementById('statusFilter').value;
    currentPage = 1; // Reset to first page
    updateContactsList();
}

// Change items per page
function changeItemsPerPage() {
    itemsPerPage = parseInt(document.getElementById('itemsPerPage').value);
    currentPage = 1; // Reset to first page
    updateContactsList();
}

// Highlight search terms in text
function highlightSearchTerm(text, term) {
    if (!term) return text;
    
    const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<span class="search-highlight">$1</span>');
}

// Update pagination info
function updatePaginationInfo(from, to, total) {
    document.getElementById('showingFrom').textContent = from;
    document.getElementById('showingTo').textContent = to;
    document.getElementById('totalContacts').textContent = total;
}

// Update pagination controls
function updatePaginationControls(currentPage, totalPages) {
    const pagination = document.getElementById('pagination');
    
    if (totalPages <= 1) {
        pagination.innerHTML = '';
        return;
    }
    
    let paginationHTML = '';
    
    // Previous button
    if (currentPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${currentPage - 1}); return false;">
                    <i class="fas fa-chevron-left"></i>
                </a>
            </li>
        `;
    }
    
    // Page numbers
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(1); return false;">1</a>
            </li>
        `;
        if (startPage > 2) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <li class="page-item ${i === currentPage ? 'active' : ''}">
                <a class="page-link" href="#" onclick="goToPage(${i}); return false;">${i}</a>
            </li>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<li class="page-item disabled"><span class="page-link">...</span></li>`;
        }
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${totalPages}); return false;">${totalPages}</a>
            </li>
        `;
    }
    
    // Next button
    if (currentPage < totalPages) {
        paginationHTML += `
            <li class="page-item">
                <a class="page-link" href="#" onclick="goToPage(${currentPage + 1}); return false;">
                    <i class="fas fa-chevron-right"></i>
                </a>
            </li>
        `;
    }
    
    pagination.innerHTML = paginationHTML;
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    updateContactsList();
    
    // Scroll to top of contacts list
    document.getElementById('contactsListContainer').scrollTop = 0;
}

// ========== Footer Interactions ==========

// Initialize footer interactions
function initFooterInteractions() {
    // Add hover effects to tech stack items
    const techItems = document.querySelectorAll('.tech-item');
    techItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
            this.style.transition = 'transform 0.3s ease';
        });
        
        item.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Add click effect to version badge
    const versionBadge = document.querySelector('.version-info .badge');
    if (versionBadge) {
        versionBadge.addEventListener('click', function() {
            showAlert('WhatsApp Bulk Sender v2.0.0 - Stable Release', 'info');
        });
    }
    
    // Add stats counter animation when footer is visible
    const footer = document.querySelector('footer');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateStatsCounters();
            }
        });
    }, { threshold: 0.1 });
    
    if (footer) {
        observer.observe(footer);
    }
}

// Animate stats counters (if we had any)
function animateStatsCounters() {
    // This could be expanded to show app statistics
    // For now, just add a subtle animation to the heart
    const heart = document.querySelector('.fa-heart');
    if (heart) {
        heart.style.animation = 'heartbeat 1.5s ease-in-out infinite';
    }
}

// Easter egg: Console message for developers
console.log(
    '%c🚀 WhatsApp Bulk Sender v2.0.0 🚀', 
    'color: #25D366; font-size: 16px; font-weight: bold;'
);
console.log(
    '%cDeveloped by Azhar Azziz | GitHub: @azharazziz', 
    'color: #128C7E; font-size: 12px;'
);
console.log(
    '%cFeatures: CSV/TXT/VCF Upload, Search, Pagination, ZAPIN API Integration', 
    'color: #075E54; font-size: 10px;'
);

// ========== Header Navigation Functions ==========

// Initialize header functionality
function initHeaderFunctionality() {
    updateHeaderStats();
    updateApiStatus();
    
    // Update stats periodically
    setInterval(updateHeaderStats, 5000);
    
    // Update API status when credentials change with debouncing
    const apiKeyInput = document.getElementById('apiKey');
    const senderInput = document.getElementById('sender');
    
    let updateTimeout;
    const debouncedUpdate = () => {
        clearTimeout(updateTimeout);
        updateTimeout = setTimeout(updateApiStatus, 300);
    };
    
    if (apiKeyInput) {
        apiKeyInput.addEventListener('input', debouncedUpdate);
        apiKeyInput.addEventListener('blur', updateApiStatus);
    }
    if (senderInput) {
        senderInput.addEventListener('input', debouncedUpdate);
        senderInput.addEventListener('blur', updateApiStatus);
    }
}

// Update header statistics
function updateHeaderStats() {
    const totalContacts = contacts.length;
    const sentCount = contacts.filter(c => c.status === 'sent').length;
    const pendingCount = contacts.filter(c => c.status === 'pending').length;
    
    // Update header counters
    const headerContactCount = document.getElementById('headerContactCount');
    const headerSentCount = document.getElementById('headerSentCount');
    const headerPendingCount = document.getElementById('headerPendingCount');
    
    if (headerContactCount) headerContactCount.textContent = totalContacts;
    if (headerSentCount) headerSentCount.textContent = sentCount;
    if (headerPendingCount) headerPendingCount.textContent = pendingCount;
}

// Update API status indicator
function updateApiStatus() {
    const apiStatusDot = document.getElementById('apiStatus');
    const apiStatusText = document.getElementById('apiStatusText');
    
    // Get current values from inputs or use stored values
    const currentApiKey = document.getElementById('apiKey')?.value.trim() || apiKey;
    const currentSender = document.getElementById('sender')?.value.trim() || sender;
    
    const hasApiKey = currentApiKey && currentApiKey.length > 0;
    const hasSender = currentSender && currentSender.length > 0;
    
    if (hasApiKey && hasSender) {
        if (apiStatusDot) {
            apiStatusDot.className = 'status-dot online';
        }
        if (apiStatusText) {
            apiStatusText.textContent = 'ZAPIN Ready';
        }
    } else {
        if (apiStatusDot) {
            apiStatusDot.className = 'status-dot offline';
        }
        if (apiStatusText) {
            apiStatusText.textContent = 'Setup Required';
        }
    }
}

// Smooth scroll to section
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const headerHeight = document.querySelector('.custom-navbar').offsetHeight;
        const elementPosition = element.offsetTop - headerHeight - 20;
        
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
        
        // Update active nav link
        updateActiveNavLink(sectionId);
    }
}

// Scroll to top
function scrollToTop() {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
    updateActiveNavLink('api-config');
}

// Update active navigation link
function updateActiveNavLink(activeSection) {
    // Remove active class from all nav links
    document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
        link.classList.remove('active');
    });
    
    // Add active class to current section link
    const sectionMap = {
        'api-config': 0,
        'contacts': 1,
        'messaging': 2,
        'reports': 3
    };
    
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    const linkIndex = sectionMap[activeSection];
    if (navLinks[linkIndex]) {
        navLinks[linkIndex].classList.add('active');
    }
}

// Scroll spy to update active navigation
window.addEventListener('scroll', function() {
    const sections = ['api-config', 'contacts', 'messaging', 'reports'];
    const headerHeight = document.querySelector('.custom-navbar').offsetHeight;
    
    let currentSection = 'api-config';
    
    sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
            const elementTop = element.offsetTop - headerHeight - 50;
            const elementBottom = elementTop + element.offsetHeight;
            
            if (window.scrollY >= elementTop && window.scrollY < elementBottom) {
                currentSection = sectionId;
            }
        }
    });
    
    updateActiveNavLink(currentSection);
});
