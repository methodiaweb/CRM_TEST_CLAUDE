# CRM System - Deployment Guide

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 18+ installed
- PostgreSQL 14+ installed
- Git installed

### Step 1: Clone/Setup Project

```bash
# Create project directories
mkdir crm-project
cd crm-project
```

### Step 2: Setup Backend

```bash
# Navigate to backend
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://yourusername:yourpassword@localhost:5432/crm_db
```

### Step 3: Create Database

```bash
# Create PostgreSQL database
createdb crm_db

# Or using psql:
# psql -U postgres
# CREATE DATABASE crm_db;
```

### Step 4: Initialize Database

```bash
# Run database initialization script
npm run init-db
```

This will:
- Create all tables
- Insert sample users (password: password123)
- Insert sample leads with timeline

### Step 5: Start Backend

```bash
# Start development server
npm run dev

# Backend will run on http://localhost:5000
```

### Step 6: Setup Frontend

```bash
# In new terminal, navigate to frontend
cd ../frontend

# Install dependencies
npm install

# Start React development server
npm start

# Frontend will run on http://localhost:3000
```

### Step 7: Login

Open http://localhost:3000 and login with:
- **Email:** admin@company.com
- **Password:** password123

---

## 🌐 Production Deployment

### Option 1: Railway (Recommended - Easiest)

#### Backend + Database on Railway

1. **Create Railway Account**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository

3. **Add PostgreSQL Database**
   - Click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway automatically creates database

4. **Configure Backend Service**
   - Add environment variables:
     ```
     DATABASE_URL=${{Postgres.DATABASE_URL}}
     JWT_SECRET=your-random-secret-key-generate-strong-one
     NODE_ENV=production
     FRONTEND_URL=https://your-frontend-url.vercel.app
     ```

5. **Deploy Backend**
   - Railway auto-deploys on git push
   - Note your backend URL (e.g., https://crm-backend-production.up.railway.app)

6. **Initialize Database**
   - In Railway dashboard, open backend service
   - Go to "Settings" → "Service"
   - Click "Run Custom Command"
   - Run: `npm run init-db`

#### Frontend on Vercel

1. **Create Vercel Account**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select `frontend` folder as root directory

3. **Configure Build Settings**
   - Framework Preset: Create React App
   - Build Command: `npm run build`
   - Output Directory: `build`

4. **Add Environment Variables**
   ```
   REACT_APP_API_URL=https://your-railway-backend-url.up.railway.app/api
   ```

5. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy
   - You'll get a URL like: https://crm-project.vercel.app

---

### Option 2: Render

#### Backend + Database on Render

1. **Create Account** at https://render.com

2. **Create PostgreSQL Database**
   - New → PostgreSQL
   - Free tier available
   - Note the Internal Database URL

3. **Create Web Service**
   - New → Web Service
   - Connect GitHub repository
   - Root Directory: `backend`
   - Build Command: `npm install`
   - Start Command: `npm start`

4. **Environment Variables**
   ```
   DATABASE_URL=<your-render-postgres-url>
   JWT_SECRET=<generate-strong-random-key>
   NODE_ENV=production
   FRONTEND_URL=https://your-frontend-url.vercel.app
   ```

5. **Initialize Database**
   - After first deploy, use Render Shell:
   - `npm run init-db`

6. **Deploy Frontend** on Vercel (same as Option 1)

---

### Option 3: Full Manual VPS (Advanced)

#### Requirements
- Ubuntu 22.04 server
- Domain name (optional)
- SSH access

#### Setup Script

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 for process management
sudo npm install -g pm2

# Setup PostgreSQL
sudo -u postgres createdb crm_db
sudo -u postgres psql -c "CREATE USER crmuser WITH PASSWORD 'yourpassword';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE crm_db TO crmuser;"

# Clone your repository
git clone https://github.com/yourusername/crm-project.git
cd crm-project

# Setup backend
cd backend
npm install
cp .env.example .env
# Edit .env with your settings
npm run init-db
pm2 start server.js --name crm-backend

# Setup frontend
cd ../frontend
npm install
npm run build

# Configure Nginx
sudo nano /etc/nginx/sites-available/crm

# Add this configuration:
# server {
#     listen 80;
#     server_name your-domain.com;
#
#     location / {
#         root /path/to/crm-project/frontend/build;
#         try_files $uri /index.html;
#     }
#
#     location /api {
#         proxy_pass http://localhost:5000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_cache_bypass $http_upgrade;
#     }
# }

sudo ln -s /etc/nginx/sites-available/crm /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# Setup SSL with Let's Encrypt (optional)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## 🔐 Security Checklist

### Before Going Live:

- [ ] Change all default passwords
- [ ] Generate strong JWT_SECRET (use: `openssl rand -base64 32`)
- [ ] Enable HTTPS/SSL
- [ ] Set NODE_ENV=production
- [ ] Configure proper CORS origins
- [ ] Enable rate limiting (already in code)
- [ ] Regular database backups
- [ ] Keep dependencies updated

---

## 📊 Environment Variables Reference

### Backend (.env)

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Security
JWT_SECRET=generate-strong-random-key-here
NODE_ENV=production

# Server
PORT=5000

# CORS
FRONTEND_URL=https://your-frontend-domain.com

# Future API Integrations (optional)
SENDGRID_API_KEY=
GOOGLE_CALENDAR_CLIENT_ID=
GOOGLE_CALENDAR_CLIENT_SECRET=
```

### Frontend (.env)

```bash
REACT_APP_API_URL=https://your-backend-url.com/api
```

---

## 🧪 Testing the Deployment

1. **Health Check**
   ```bash
   curl https://your-backend-url.com/health
   # Should return: {"status":"ok","timestamp":"..."}
   ```

2. **Login Test**
   - Go to your frontend URL
   - Login with: admin@company.com / password123
   - Create a test lead
   - Verify timeline updates

3. **API Test**
   ```bash
   # Login
   curl -X POST https://your-backend-url.com/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@company.com","password":"password123"}'
   
   # Should return token
   ```

---

## 📞 Support & Troubleshooting

### Common Issues

**Database connection fails:**
- Check DATABASE_URL format
- Verify PostgreSQL is running
- Check firewall rules

**CORS errors:**
- Verify FRONTEND_URL in backend .env
- Check backend is running
- Verify API_URL in frontend

**Login fails:**
- Run `npm run init-db` to reset database
- Check JWT_SECRET is set
- Verify backend logs for errors

---

## 🎯 Next Steps

After successful deployment:

1. **Change default passwords** for all users
2. **Setup email integration** (SendGrid, etc.)
3. **Configure automatic backups**
4. **Setup monitoring** (optional: Sentry, LogRocket)
5. **Add your domain** and SSL certificate
6. **Invite your team** and create real users

---

## 📝 Quick Command Reference

```bash
# Backend
npm run dev          # Start development server
npm start           # Start production server
npm run init-db     # Initialize database

# Frontend
npm start           # Start development server
npm run build       # Build for production

# Database
npm run init-db     # Reset and seed database
```

---

Good luck with your deployment! 🚀
