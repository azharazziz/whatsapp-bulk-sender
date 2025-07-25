# WhatsApp Bulk Sender - ZAPIN API

![Version](https://img.shields.io/badge/version-2.0.0-green.svg)
![Status](https://img.shields.io/badge/status-stable-brightgreen.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-serverless-orange.svg)

Aplikasi modern untuk mengirim pesan WhatsApp secara massal menggunakan ZAPIN API. Dibangun dengan arsitektur serverless dan client-side storage untuk kemudahan deployment dan privasi maksimal.

## ✨ Fitur Utama

### 🚀 **Core Features**
- ✅ **ZAPIN API Integration** - Pengiriman WhatsApp menggunakan API resmi ZAPIN
- ✅ **Multi-format Upload** - Support CSV, TXT, dan vCard (.vcf) files
- ✅ **Manual Contact Entry** - Tambah kontak satu per satu
- ✅ **Smart Templates** - Variable replacement dengan `{nama}` dan `{to}`
- ✅ **localStorage Persistence** - Data tersimpan lokal di browser
- ✅ **Serverless Ready** - Deploy ke Vercel, Netlify, atau platform serverless lainnya

### 🎯 **Advanced Features**
- ✅ **Search & Filter** - Pencarian real-time dan filter status
- ✅ **Pagination System** - Menampilkan data dalam halaman (10/25/50/100 items)
- ✅ **Bulk Operations** - Kirim pesan massal dengan anti-spam protection
- ✅ **Real-time Status** - Update status pengiriman secara real-time
- ✅ **CSV Reports** - Download laporan lengkap hasil pengiriman
- ✅ **Send History** - Riwayat pengiriman dengan timestamp
- ✅ **vCard Parser** - Parse kontak dari file vCard smartphone
- ✅ **Modern UI** - Interface responsive dengan Bootstrap 5
- ✅ **Privacy First** - Tidak ada data tersimpan di server

### 🛡️ **Security & Privacy**
- ✅ **100% Client-side** - Semua data hanya tersimpan di browser Anda
- ✅ **No Server Storage** - Tidak ada data sensitif di server
- ✅ **Temporary Uploads** - File upload otomatis dibersihkan
- ✅ **Secure API** - Kredensial hanya tersimpan sementara di localStorage

## 🎯 **Prasyarat Penting**

> **⚠️ WAJIB: Registrasi ZAPIN terlebih dahulu**

Sebelum menggunakan aplikasi ini, Anda **HARUS**:

1. **📝 Registrasi di [Zapin.my.id](https://zapin.my.id)**
   - Buat akun di website resmi ZAPIN
   - Verifikasi email dan lengkapi profil
   - Hubungkan nomor WhatsApp Business Anda

2. **🔑 Dapatkan Kredensial**
   - **API Key**: Dari dashboard ZAPIN setelah registrasi
   - **Sender Number**: Nomor WhatsApp Business yang terdaftar di ZAPIN
   - **Saldo/Kuota**: Pastikan akun memiliki saldo untuk pengiriman

3. **📱 Setup WhatsApp Business**
   - Nomor harus terverifikasi sebagai WhatsApp Business
   - Nomor tersebut akan menjadi pengirim pesan
   - Pastikan nomor aktif dan bisa menerima pesan

> 💡 **Info**: API Key dan Sender Number hanya bisa didapat melalui [Zapin.my.id](https://zapin.my.id). Tidak ada alternatif lain.

## 🚀 **Quick Start**

### 1. **Clone & Install**
```bash
git clone https://github.com/azharazziz/whatsapp-bulk-sender.git
cd whatsapp-bulk-sender
npm install
```

### 2. **Run Application**
```bash
# Production mode
npm start

# Development mode (dengan nodemon)
npm run dev
```

### 3. **Access Application**
```
http://localhost:3000
```

## 📖 **Panduan Penggunaan**

### 1. **🔧 Konfigurasi Awal**

**Langkah setup kredensial:**
1. Buka aplikasi di browser
2. Masuk ke section **"Konfigurasi API ZAPIN"**
3. Masukkan **API Key** dari dashboard ZAPIN
4. Masukkan **Sender** (nomor WhatsApp Business Anda)
5. Klik **"Simpan Kredensial"**

> 📋 **Cara mendapat kredensial**: Klik tombol "Daftar di Zapin.my.id" yang tersedia di aplikasi

### 2. **💬 Buat Template Pesan**

**Template variables yang tersedia:**
- `{nama}` - Nama kontak asli (contoh: "John Doe")
- `{to}` - Nama dengan spasi diganti + (contoh: "John+Doe")

**Contoh template:**
```
Halo {nama},

Pesan ini dikirim khusus untuk {to}.
Silakan balas jika ada pertanyaan.

Terima kasih!
```

**Quick Templates tersedia:**
- 📋 **Formal** - Template bisnis profesional
- 😊 **Santai** - Template casual dan friendly
- 🎯 **Promosi** - Template marketing dan promo
- ⏰ **Reminder** - Template pengingat
- 💒 **Pernikahan** - Template undangan pernikahan

### 3. **👥 Upload Kontak**

**Format file yang didukung:**

| Format | Description | Example |
|--------|-------------|---------|
| **CSV** | Comma-separated values | `John Doe,081234567890` |
| **TXT** | Text file dengan format yang sama | `Jane Smith,082345678901` |
| **VCF** | vCard file dari kontak HP | Export dari aplikasi Kontak |

**Contoh format CSV/TXT:**
```csv
Nama,Nomor Telepon
John Doe,081234567890
Jane Smith,082345678901
Ahmad Rahman,083456789012
```

**Cara export vCard dari HP:**
1. Buka aplikasi **Kontak** di smartphone
2. Pilih kontak yang ingin diekspor
3. Tap **Share/Bagikan**
4. Pilih **vCard** atau **VCF**
5. Save file dan upload ke aplikasi

**Download sample files:**
- 📄 [sample-contacts.csv](sample-contacts.csv) - Contoh file CSV
- 📱 [sample-contacts.vcf](sample-contacts.vcf) - Contoh file vCard

### 4. **🔍 Manajemen Kontak**

**Fitur pencarian dan filter:**
- **🔍 Search**: Cari berdasarkan nama atau nomor telepon
- **📊 Filter Status**: 
  - `Semua Status` - Tampilkan semua kontak
  - `Belum Dikirim` - Kontak dengan status pending
  - `Terkirim` - Kontak yang sudah berhasil dikirim
  - `Gagal` - Kontak yang gagal dikirim
- **📄 Pagination**: Pilih 10/25/50/100 kontak per halaman
- **📱 Responsive**: Scroll dan view optimal di semua device

**Actions per kontak:**
- ✉️ **Send Individual** - Kirim pesan ke satu kontak
- 🔄 **Reset Status** - Reset status ke "pending"
- 🗑️ **Delete** - Hapus kontak dari daftar

### 5. **📤 Pengiriman Pesan**

**Bulk Messaging Features:**
- 🎯 **Smart Targeting** - Hanya kirim ke kontak status "pending"
- ⏱️ **Anti-Spam Protection** - Jeda 3-5 detik antar pengiriman
- 📊 **Real-time Progress** - Progress bar dan estimasi waktu
- 🔄 **Resume Capability** - Lanjutkan pengiriman yang terinterupsi

**Pengiriman Individual:**
- ⚡ **Quick Send** - Jeda 1 detik antar pesan
- 🎯 **Targeted** - Kirim ke kontak spesifik
- 📈 **Instant Status** - Update status real-time

### 6. **📊 Laporan & Analytics**

**Export & Reports:**
- 📥 **CSV Download** - Unduh laporan lengkap dalam format CSV
- 📈 **Send History** - Riwayat pengiriman dengan timestamp
- 📊 **Status Summary** - Ringkasan status pengiriman
- 🕒 **Time Tracking** - Waktu pengiriman setiap pesan

**Real-time Stats (Header):**
- 👥 **Total Kontak** - Jumlah kontak yang tersimpan
- ✅ **Terkirim** - Jumlah pesan berhasil dikirim
- ⏳ **Pending** - Jumlah kontak belum dikirim
- 🔄 **Status Indicator** - Status koneksi ZAPIN API

## 🛠️ **Technical Details**

### **📁 Struktur Project**
```
whatsapp-bulk-sender/
├── 📂 public/              # Frontend files
│   ├── 📄 index.html       # Main UI dengan modern design
│   └── 📄 app.js           # Frontend JavaScript dengan localStorage
├── 📂 routes/              # API routes
│   └── 📄 api.js           # RESTful API endpoints
├── 📂 uploads/             # Temporary file uploads (auto-cleanup)
├── 📄 server.js            # Express server (serverless ready)
├── 📄 package.json         # Dependencies dan scripts
├── 📄 vercel.json          # Vercel deployment config
└── 📄 README.md            # Dokumentasi lengkap
```

### **🔧 Dependencies**

| Package | Version | Purpose |
|---------|---------|---------|
| **express** | ^4.18.2 | Web framework untuk API server |
| **multer** | ^1.4.5 | File upload handling (CSV/TXT/VCF) |
| **axios** | ^1.4.0 | HTTP client untuk ZAPIN API |
| **cors** | ^2.8.5 | Cross-origin resource sharing |
| **dotenv** | ^16.0.3 | Environment variables |

### **🌐 API Endpoints**

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/upload-contacts` | Upload dan parse file kontak |
| `POST` | `/api/add-contact` | Tambah kontak manual |
| `DELETE` | `/api/contact/:id` | Hapus kontak spesifik |
| `DELETE` | `/api/contacts` | Hapus semua kontak |
| `POST` | `/api/send-messages` | Kirim pesan bulk/individual |
| `POST` | `/api/reset-contact-status/:id` | Reset status kontak |
| `POST` | `/api/reset-all-status` | Reset semua status |
| `GET` | `/api/download-report` | Download laporan CSV |
| `GET` | `/api/send-history` | Ambil riwayat pengiriman |

### **💾 Data Storage**

**Client-side localStorage:**
```javascript
// Structure data yang tersimpan
{
  apiKey: "zapin_xxx123xxx",           // API Key ZAPIN
  sender: "081234567890",              // Nomor sender
  contacts: [...],                     // Array kontak
  messageTemplate: "Template...",      // Template pesan
  sendHistory: [...]                   // Riwayat pengiriman
}
```

**Keuntungan localStorage:**
- ✅ **Privacy First** - Data tidak pernah tersimpan di server
- ✅ **Serverless Compatible** - Perfect untuk deployment serverless
- ✅ **No Database Required** - Tidak butuh setup database
- ✅ **Fast Access** - Akses data instan tanpa network request
- ✅ **Cross-session** - Data persistent antar restart browser

## 🔧 **Development**

### **🏗️ Local Development**
```bash
# Install dependencies
npm install

# Run in development mode (with nodemon)
npm run dev

# Run in production mode
npm start

# Access application
open http://localhost:3000
```

### **🚀 Deployment**

**Deploy ke Vercel:**
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Deploy to production
vercel --prod
```

**Deploy ke Netlify:**
```bash
# Install Netlify CLI
npm i -g netlify-cli

# Build and deploy
npm run build
netlify deploy --prod
```

**Environment Variables (Optional):**
```env
PORT=3000
NODE_ENV=production
```

## 🔍 **Troubleshooting**

### **🚨 Common Issues & Solutions**

#### **"API Key and Sender are required"**
**❌ Problem:** Error saat mencoba kirim pesan
**✅ Solution:**
1. Pastikan sudah registrasi di [Zapin.my.id](https://zapin.my.id)
2. Dapatkan API Key yang valid dari dashboard ZAPIN
3. Gunakan nomor WhatsApp Business yang terdaftar
4. Periksa format: API Key biasanya dimulai dengan `zapin_`

#### **"Only CSV, TXT and VCF files are allowed"**
**❌ Problem:** Error saat upload file kontak
**✅ Solution:**
1. Pastikan file berekstensi `.csv`, `.txt`, atau `.vcf`
2. Periksa format isi file sesuai contoh
3. Jangan upload file Excel (.xlsx) - convert ke CSV dulu

#### **"Failed to send messages"**
**❌ Problem:** Pesan gagal dikirim
**✅ Solution:**
1. **Cek koneksi internet** - Pastikan stabil
2. **Cek saldo ZAPIN** - Pastikan akun memiliki saldo/kuota
3. **Cek status API** - Kunjungi dashboard ZAPIN untuk status layanan
4. **Validasi nomor** - Pastikan format nomor benar (08xxx atau 628xxx)
5. **Cek status sender** - Nomor sender harus aktif di ZAPIN

#### **Kontak tidak muncul setelah upload vCard**
**❌ Problem:** File vCard tidak terparsing
**✅ Solution:**
1. Export ulang file vCard dari aplikasi kontak
2. Pastikan vCard berisi field `FN` (Full Name) dan `TEL` (Telephone)
3. Coba dengan sample file vCard yang disediakan
4. Periksa encoding file (harus UTF-8)

#### **Data hilang setelah refresh**
**❌ Problem:** Kontak atau setting hilang
**✅ Solution:**
1. Periksa apakah browser dalam mode incognito/private
2. Cek pengaturan browser - pastikan localStorage enabled
3. Clear browser cache jika terjadi conflict
4. Hindari penggunaan extension yang block localStorage

### **📞 Support & Help**

**Untuk masalah ZAPIN API:**
- 🌐 **Website**: [Zapin.my.id](https://zapin.my.id)
- 📚 **Dokumentasi**: Dashboard ZAPIN untuk panduan API
- 💬 **Support**: Hubungi customer service ZAPIN
- 📊 **Status**: Cek status layanan di website ZAPIN

**Untuk masalah aplikasi:**
- 🐛 **Bug Reports**: [GitHub Issues](https://github.com/azharazziz/whatsapp-bulk-sender/issues)
- 💡 **Feature Requests**: [GitHub Discussions](https://github.com/azharazziz/whatsapp-bulk-sender/discussions)
- 📧 **Developer**: [Azhar Azziz](https://azharazziz.github.io)

## 👨‍💻 **Developer**

**Azhar Azziz**
- 🌐 **Portfolio**: [azharazziz.github.io](https://azharazziz.github.io)
- 🐙 **GitHub**: [@azharazziz](https://github.com/azharazziz)
- 💼 **LinkedIn**: [azhar-azziz-afifi](https://www.linkedin.com/in/azhar-azziz-afifi)

## 📄 **License**

MIT License - lihat [LICENSE](LICENSE) file untuk detail.

## 🤝 **Contributing**

Kontribusi sangat diterima! Silakan:
1. Fork repository ini
2. Buat feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push ke branch (`git push origin feature/AmazingFeature`)
5. Buat Pull Request

## ⭐ **Support Project**

Jika aplikasi ini bermanfaat, berikan ⭐ di GitHub!