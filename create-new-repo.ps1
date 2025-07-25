# Script untuk membuat repository baru dari branch init
# Jalankan script ini di PowerShell

Write-Host "🚀 Membuat Repository Baru dari Branch Init" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green

# Minta input nama repository baru
$repoName = Read-Host "Masukkan nama repository baru (contoh: whatsapp-sender-v2)"

if ([string]::IsNullOrWhiteSpace($repoName)) {
    Write-Host "❌ Nama repository tidak boleh kosong!" -ForegroundColor Red
    exit 1
}

Write-Host "📝 Nama repository baru: $repoName" -ForegroundColor Yellow

# Konfirmasi
$confirm = Read-Host "Lanjutkan? (y/N)"
if ($confirm -ne "y" -and $confirm -ne "Y") {
    Write-Host "❌ Dibatalkan" -ForegroundColor Red
    exit 0
}

Write-Host "🔄 Memproses..." -ForegroundColor Blue

# Pastikan kita di branch init
git checkout init

# Buat branch baru sebagai main
git checkout -b main

# Siapkan untuk push ke repository baru
Write-Host "📋 Langkah selanjutnya:" -ForegroundColor Green
Write-Host "1. Buka GitHub dan buat repository baru dengan nama: $repoName" -ForegroundColor White
Write-Host "2. Jangan initialize dengan README, .gitignore, atau license" -ForegroundColor White
Write-Host "3. Setelah repository dibuat, jalankan command berikut:" -ForegroundColor White
Write-Host ""
Write-Host "git remote add origin https://github.com/azharazziz/$repoName.git" -ForegroundColor Cyan
Write-Host "git push -u origin main" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Repository lokal sudah siap!" -ForegroundColor Green
