# Deployment Guide - WhatsApp Bot ZAPIN API

## Deploy ke Vercel

Aplikasi ini sudah dikonfigurasi untuk deployment ke Vercel serverless platform.

### Prerequisites
1. Account Vercel (https://vercel.com)
2. GitHub repository untuk project ini
3. Vercel CLI (optional)

### Langkah Deployment

#### Metode 1: Via Vercel Dashboard (Recommended)
1. Push code ke GitHub repository
2. Login ke Vercel dashboard
3. Klik "New Project"
4. Import GitHub repository
5. Configure project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm run vercel-build`
   - Output Directory: (leave blank)
6. Add environment variables jika diperlukan
7. Deploy

#### Metode 2: Via Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Follow the prompts:
# - Set up and deploy? [Y/n] y
# - Which scope? [Your scope]
# - Link to existing project? [y/N] n
# - What's your project's name? wa-bot
# - In which directory is your code located? ./
```

### Configuration Files

#### vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/server.js"
    }
  ]
}
```

#### .vercelignore
```
node_modules
uploads
.env
*.log
.DS_Store
```

### Important Notes

1. **File Storage**: Aplikasi menggunakan memory storage untuk uploads (serverless compatible)
2. **Session Storage**: Sessions akan reset setiap deployment (normal untuk serverless)
3. **Environment Variables**: Set di Vercel dashboard jika diperlukan
4. **CORS**: Sudah dikonfigurasi untuk production

### Post-Deployment

1. Test aplikasi di URL yang diberikan Vercel
2. Verify semua fitur bekerja:
   - Upload contacts
   - Send messages
   - Download reports
   - Template management

### Troubleshooting

#### Common Issues:
1. **Build Error**: Check package.json scripts
2. **Runtime Error**: Check Vercel function logs
3. **File Upload Issues**: Pastikan menggunakan memory storage
4. **Session Issues**: Normal behavior di serverless

#### Logs:
```bash
# View deployment logs
vercel logs [deployment-url]
```

### Production URLs
- Your app will be available at: `https://your-project-name.vercel.app`
- API endpoints: `https://your-project-name.vercel.app/api/*`

### Performance Notes
- Cold start latency: ~1-2 seconds (normal for serverless)
- File upload limit: 5MB (configured in multer)
- Session timeout: 24 hours
