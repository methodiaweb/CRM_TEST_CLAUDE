# 🎯 CRM System

Modern, full-stack CRM system built with React, Node.js, Express, and PostgreSQL.

## ✨ Features

### 📊 Lead Management
- Create and manage B2B and B2C leads
- Track lead status through sales pipeline
- Assign leads to sales representatives
- Auto-assignment based on region and workload
- Rich timeline with all lead interactions
- File attachments (offers, contracts, documents)

### 👥 User Management
- Role-based access control (Admin, Manager, Sales)
- Region-based lead distribution
- Performance tracking per sales rep

### 📈 Analytics & Reporting
- Dashboard with key metrics
- Conversion rate tracking
- Sales funnel visualization
- Performance by sales representative
- Revenue tracking
- Export to CSV

### 💬 Collaboration
- Comment system with @mentions
- Timeline of all activities
- File sharing
- Notifications

### 📱 Modern UX
- Responsive design (works on mobile, tablet, desktop)
- Clean, professional interface
- Fast and intuitive

### 🔐 Security
- JWT authentication
- Password hashing with bcrypt
- Role-based permissions
- Rate limiting
- CORS protection

### 🔌 API Ready
- RESTful API
- Ready for integrations (Email, Calendar, etc.)
- Well-documented endpoints

## 🛠️ Tech Stack

### Frontend
- React 18
- Tailwind CSS
- Lucide Icons
- Modern ES6+

### Backend
- Node.js 18+
- Express.js
- PostgreSQL 14+
- JWT authentication
- bcrypt for passwords

### DevOps
- Ready for Railway/Render/Vercel
- Docker-ready (optional)
- Environment-based configuration

## 📦 Project Structure

```
crm-project/
├── backend/
│   ├── config/
│   │   └── database.js
│   ├── middleware/
│   │   └── auth.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── leads.js
│   │   ├── users.js
│   │   ├── files.js
│   │   └── notifications.js
│   ├── database/
│   │   └── schema.sql
│   ├── scripts/
│   │   └── initDb.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   └── index.js
│   ├── public/
│   ├── package.json
│   └── .env.example
│
├── DEPLOYMENT.md
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- npm or yarn

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/crm-project.git
cd crm-project
```

### 2. Setup Backend

```bash
cd backend
npm install
cp .env.example .env

# Edit .env with your database credentials
# Create PostgreSQL database
createdb crm_db

# Initialize database with sample data
npm run init-db

# Start backend server
npm run dev
```

Backend runs on http://localhost:5000

### 3. Setup Frontend

```bash
cd ../frontend
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:5000/api" > .env

# Start React app
npm start
```

Frontend runs on http://localhost:3000

### 4. Login

Default credentials:
- Email: `admin@company.com`
- Password: `password123`

**⚠️ Change these in production!**

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Complete deployment instructions
- [API Documentation](#api-endpoints) - API reference (below)

## 🔌 API Endpoints

### Authentication
```
POST   /api/auth/login      - Login user
POST   /api/auth/register   - Register new user
GET    /api/auth/me         - Get current user
```

### Leads
```
GET    /api/leads                - Get all leads (filtered by role)
GET    /api/leads/:id            - Get single lead
POST   /api/leads                - Create new lead
PATCH  /api/leads/:id/status     - Update lead status
POST   /api/leads/:id/comments   - Add comment to lead
GET    /api/leads/stats/overview - Get statistics
```

### Users
```
GET    /api/users              - Get all users (admin/manager)
GET    /api/users/performance  - Get sales performance data
```

### Files
```
POST   /api/files             - Add file metadata to lead
GET    /api/files/lead/:id    - Get files for lead
DELETE /api/files/:id         - Delete file
```

### Notifications
```
GET    /api/notifications         - Get user notifications
PATCH  /api/notifications/:id/read - Mark as read
PATCH  /api/notifications/all/read - Mark all as read
```

## 🎨 Screenshots

(Add screenshots here after deployment)

## 🧪 Testing

```bash
# Backend tests (to be implemented)
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 🔒 Security Best Practices

1. **Change default passwords** immediately
2. **Use strong JWT_SECRET** (generate with `openssl rand -base64 32`)
3. **Enable HTTPS** in production
4. **Regular updates** of dependencies
5. **Database backups** configured
6. **Environment variables** never committed to git

## 🚧 Roadmap

### Phase 1 - MVP (Current)
- ✅ Lead management
- ✅ User authentication
- ✅ Timeline & comments
- ✅ File attachments
- ✅ Basic analytics
- ✅ Mobile responsive

### Phase 2 - Enhancements
- [ ] Email integration (SendGrid)
- [ ] Calendar integration (Google Calendar)
- [ ] Advanced reporting
- [ ] Email templates
- [ ] Automated workflows
- [ ] Real-time notifications (WebSockets)

### Phase 3 - Advanced
- [ ] WhatsApp/Viber integration
- [ ] AI-powered insights
- [ ] Forecasting
- [ ] Custom fields
- [ ] Mobile app (React Native)

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

MIT License - feel free to use for personal or commercial projects

## 👨‍💻 Author

Built with ❤️ for efficient sales teams

## 🐛 Bug Reports

Found a bug? Please open an issue with:
- Description of the problem
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

## 💬 Support

Need help?
- Check [DEPLOYMENT.md](./DEPLOYMENT.md)
- Open an issue on GitHub
- Email: support@yourcompany.com

---

**Happy Selling! 🚀**
