# WhatsApp Message Sender - ZAPIN API

Aplikasi pengirim pesan WhatsApp menggunakan ZAPIN API dengan fitur manajemen kontak dan template pesan.

## Fitur

- ✅ Autentikasi menggunakan API Key ZAPIN
- ✅ Upload daftar kontak dari file CSV/TXT/VCF (vCard)
- ✅ Tambah kontak manual
- ✅ Template pesan dengan parameter `{nama}` dan `{to}`
- ✅ Data persistence menggunakan localStorage browser
- ✅ Search, filter, dan pagination untuk daftar kontak
- ✅ Hapus kontak spesifik atau semua kontak
- ✅ Download laporan pengiriman dalam format CSV
- ✅ Riwayat pengiriman pesan

## Prasyarat

**Sebelum menggunakan aplikasi ini, Anda harus:**

1. **Registrasi di [Zapin.my.id](https://zapin.my.id)**
   - Buat akun di website resmi ZAPIN
   - Dapatkan **API Key** dan **Sender Number** Anda
   - Pastikan akun Anda aktif dan memiliki saldo/kuota

2. **Persiapan WhatsApp Business**
   - Pastikan nomor WhatsApp Business Anda sudah terdaftar di ZAPIN
   - Nomor tersebut akan digunakan sebagai **Sender**

> ⚠️ **Penting**: API Key dan Sender Number hanya bisa didapat melalui registrasi resmi di [Zapin.my.id](https://zapin.my.id). Tidak ada cara lain untuk mendapatkan kredensial ini.

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

> 📋 **Cara Mendapatkan API Key dan Sender:**
> 1. Kunjungi [Zapin.my.id](https://zapin.my.id)
> 2. Daftar akun baru atau login jika sudah punya
> 3. Hubungkan nomor WhatsApp Business Anda
> 4. Dapatkan API Key dari dashboard ZAPIN
> 5. Gunakan nomor WhatsApp yang terdaftar sebagai Sender

- Masukkan **API Key** dari ZAPIN (contoh: `zapin_xxx123xxx`)
- Masukkan **Sender** (nomor WhatsApp Business yang terdaftar di ZAPIN)

### 2. Buat Template Pesan
- Tulis template pesan Anda
- Gunakan `{nama}` untuk nama kontak
- Gunakan `{to}` untuk nama dengan spasi diganti tanda +
- Contoh: "Halo {nama}, pesan ini untuk {to}"

### 3. Upload Kontak

**Format file yang didukung:**
- **CSV/TXT:** Nama,Nomor Telepon
- **VCF (vCard):** File kontak dari aplikasi kontak HP

**Contoh format CSV/TXT:**
```
Nama,Nomor Telepon
John Doe,081234567890
Jane Smith,082345678901
```

**Contoh vCard:** Download sample dari aplikasi atau export dari kontak HP Anda.

Atau tambah kontak manual satu per satu.

### 4. Mengelola Kontak

**Fitur manajemen kontak:**
- **Search**: Cari kontak berdasarkan nama atau nomor telepon
- **Filter Status**: Filter kontak berdasarkan status (Pending, Terkirim, Gagal)
- **Pagination**: Tampilkan 10/25/50/100 kontak per halaman
- **Scroll**: Daftar kontak dapat di-scroll jika banyak
- **Individual Actions**: Kirim pesan, reset status, atau hapus kontak satu per satu

### 5. Kirim Pesan
- Klik "Kirim Pesan ke Semua Kontak"
- Sistem akan mengirim pesan ke semua kontak dengan status "pending"
- Lihat hasil pengiriman dan status setiap kontak

### 6. Laporan
- Download laporan pengiriman dalam format CSV
- Lihat riwayat pengiriman sebelumnya
- Status pengiriman real-time untuk setiap kontak

### 7. Sample Files
- Download sample CSV file untuk testing
- Download sample vCard file untuk testing
- Upload file sample untuk mencoba fitur aplikasi

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

## Data Persistence

- **Client-side Storage**: Data disimpan di localStorage browser
- **Session Independence**: Setiap browser/tab memiliki data terpisah  
- **Serverless Ready**: Tidak memerlukan database atau session server
- **Persistent Data**: Data tetap tersimpan meskipun server restart
- **Privacy**: Data hanya tersimpan lokal di browser pengguna

> 💾 **Catatan**: Data akan hilang jika user clear browser data atau menggunakan mode incognito.

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
- **multer** - File upload handling (CSV, TXT, VCF files)
- **axios** - HTTP client for ZAPIN API calls
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables management

## Keamanan

- **Client-side Data**: Data tersimpan lokal di browser (localStorage)
- **No Server Storage**: Tidak ada data sensitif tersimpan di server
- **File Upload Security**: Upload dibatasi hanya file CSV/TXT/VCF
- **API Key Protection**: API Key hanya tersimpan sementara di browser
- **Automatic Cleanup**: File upload temporary otomatis dibersihkan

## Troubleshooting

### Error "API Key and Sender are required"
- **Pastikan Anda sudah registrasi di [Zapin.my.id](https://zapin.my.id)**
- Dapatkan API Key yang valid dari dashboard ZAPIN
- Gunakan nomor WhatsApp Business yang sudah terdaftar di ZAPIN
- Periksa format API Key dan nomor Sender

### Error "Only CSV, TXT and VCF files are allowed"
- Pastikan file yang diupload berformat CSV, TXT, atau VCF
- Periksa ekstensi file (.csv, .txt, atau .vcf)

### Error "Failed to send messages"
- Periksa koneksi internet
- **Pastikan akun ZAPIN Anda aktif dan memiliki saldo/kuota**
- Pastikan ZAPIN API berfungsi normal
- Periksa format nomor telepon (hanya angka, dimulai dengan 08 atau 628)
- Cek status nomor Sender di dashboard ZAPIN

### Kontak tidak muncul setelah upload vCard
- Pastikan file vCard berisi nomor telepon yang valid
- File vCard harus dari aplikasi kontak yang standar
- Coba export ulang file vCard dari aplikasi kontak Anda

## Support

**Untuk dukungan teknis:**

1. **Masalah API ZAPIN:** 
   - Kunjungi [Zapin.my.id](https://zapin.my.id) untuk dokumentasi resmi
   - Hubungi support ZAPIN untuk masalah API Key, Sender, atau pengiriman pesan
   - Cek status layanan ZAPIN di website mereka

2. **Masalah Aplikasi:**
   - Periksa console browser untuk error JavaScript
   - Pastikan file upload sesuai format yang didukung
   - Refresh halaman jika terjadi masalah loading

3. **Integrasi WhatsApp Business:**
   - Pastikan nomor WhatsApp Business sudah terverifikasi
   - Cek pengaturan API di dashboard ZAPIN
   - Pastikan akun ZAPIN memiliki saldo yang cukup

> 💡 **Tips:** Selalu gunakan [Zapin.my.id](https://zapin.my.id) sebagai sumber resmi untuk mendapatkan API Key dan dokumentasi terbaru.
