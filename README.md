# WhatsApp Message Sender - ZAPIN API

Aplikasi pengirim pesan WhatsApp menggunakan ZAPIN API dengan fitur manajemen kontak dan template pesan.

## Fitur

- ✅ Autentikasi menggunakan API Key ZAPIN
- ✅ Upload daftar kontak dari file CSV/TXT
- ✅ Tambah kontak manual
- ✅ Template pesan dengan parameter `{nama}` dan `{to}`
- ✅ Session management (data terisolasi per pengguna)
- ✅ Hapus kontak spesifik atau semua kontak
- ✅ Download laporan pengiriman dalam format CSV
- ✅ Riwayat pengiriman pesan

## Cara Penggunaan

### 1. Instalasi
```bash
npm install
```

### 2. Konfigurasi Environment
Copy file `.env` dan sesuaikan konfigurasi jika diperlukan:
```bash
cp .env.example .env
```

### 3. Jalankan Aplikasi
```bash
npm start
```

Atau untuk development:
```bash
npm run dev
```

### 4. Akses Aplikasi
Buka browser dan akses: `http://localhost:3000`

## Penggunaan Aplikasi

### 1. Konfigurasi API ZAPIN
- Masukkan **API Key** dari ZAPIN
- Masukkan **Sender** (nomor pengirim)

### 2. Buat Template Pesan
- Tulis template pesan Anda
- Gunakan `{nama}` untuk nama kontak
- Gunakan `{to}` untuk nama dengan spasi diganti tanda +
- Contoh: "Halo {nama}, pesan ini untuk {to}"

### 3. Upload Kontak
**Format file CSV/TXT:**
```
Nama,Nomor Telepon
John Doe,081234567890
Jane Smith,082345678901
```

Atau tambah kontak manual satu per satu.

### 4. Kirim Pesan
- Klik "Kirim Pesan ke Semua Kontak"
- Sistem akan mengirim pesan ke semua kontak dengan status "pending"
- Lihat hasil pengiriman dan status setiap kontak

### 5. Laporan
- Download laporan pengiriman dalam format CSV
- Lihat riwayat pengiriman sebelumnya

## API Endpoints

### Session Management
- `GET /api/session` - Get session data
- `DELETE /api/contacts` - Clear all contacts

### Contact Management
- `POST /api/upload-contacts` - Upload contacts file
- `POST /api/add-contact` - Add single contact
- `DELETE /api/contact/:id` - Delete specific contact

### API Credentials
- `POST /api/api-credentials` - Save API credentials to session
- `DELETE /api/api-credentials` - Clear API credentials

### Message Management
- `POST /api/message-template` - Update message template
- `POST /api/send-messages` - Send messages to all pending contacts or specific contact

### Contact Status Management
- `POST /api/reset-contact-status/:id` - Reset specific contact status to pending
- `POST /api/reset-all-status` - Reset all contacts status to pending

### Reports
- `GET /api/download-report` - Download CSV report
- `GET /api/send-history` - Get send history

## ZAPIN API Integration

### Anti-Spam Features
- **Individual sending**: 1 second delay between messages
- **Bulk sending**: 3-5 seconds random delay between messages
- **Progress tracking**: Real-time progress for bulk operations
- **Time estimation**: Shows estimated completion time for large batches

### Response Format
**Success Response:**
```json
{
  "status": true,
  "msg": "Message sent successfully!"
}
```

**Error Response:**
```json
{
  "status": false,
  "msg": "Error message here"
}
```

## Template Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `{nama}` | Nama kontak asli | "John Doe" |
| `{to}` | Nama dengan spasi diganti + | "John+Doe" |

## Session Management

- Data kontak dan riwayat disimpan dalam session
- Setiap pengguna memiliki data terpisah
- Session akan berakhir setelah 24 jam atau restart server
- Tidak ada data yang tersimpan permanent di database

## Struktur Project

```
wa-bot/
├── public/           # Frontend files
│   ├── index.html   # Main UI
│   └── app.js       # Frontend JavaScript
├── routes/          # API routes
│   └── api.js       # API endpoints
├── uploads/         # Temporary file uploads
├── server.js        # Main server file
├── package.json     # Dependencies
└── .env            # Environment variables
```

## Dependencies

- **express** - Web framework
- **express-session** - Session management
- **multer** - File upload handling
- **axios** - HTTP client for ZAPIN API
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

## Keamanan

- Session data terisolasi per pengguna
- File upload dibatasi hanya CSV/TXT
- API Key disimpan sementara di session (tidak di database)
- Automatic cleanup file upload temporary

## Troubleshooting

### Error "Only CSV and TXT files are allowed"
- Pastikan file yang diupload berformat CSV atau TXT
- Periksa ekstensi file (.csv atau .txt)

### Error "API Key and Sender are required"
- Pastikan API Key dan Sender sudah diisi
- Periksa kredensial ZAPIN API Anda

### Error "Failed to send messages"
- Periksa koneksi internet
- Pastikan ZAPIN API berfungsi normal
- Periksa format nomor telepon (hanya angka)

## Support

Untuk dukungan teknis, silakan hubungi tim pengembang atau lihat dokumentasi ZAPIN API di website resmi mereka.
