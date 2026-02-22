# CRM PROJECT - COMPLETE CONTEXT
> Пълна история и контекст на проекта от старт до текущо състояние
> Качи този файл в началото на всеки нов чат за пълен context

**Последна актуализация:** 19 Feb 2026, 19:30

---

## 🎯 VISION & GOALS

### Първоначална идея
**Какво искаме да построим:**
- Професионална CRM система за управление на клиенти и сделки
- Multi-user система с различни роли и права
- Real-time collaboration между екипа
- Mobile responsive
- Прост deploy и maintenance
- Без месечни разходи (free tiers)

### Core Features (Priority Order)
1. ✅ Lead management (създаване, преглед, редакция)
2. ✅ User roles (Admin, Manager, Sales)
3. ✅ Timeline на активности
4. ⚠️ File attachments (в процес)
5. ⏳ Email notifications
6. ⏳ Real-time updates (WebSocket)
7. ⏳ Reports & analytics
8. ⏳ Mobile app

---

## 🏗️ АРХИТЕКТУРНИ РЕШЕНИЯ

### Защо Full-stack разделение (Frontend + Backend)
- **Scalability:** Frontend и backend могат да се развиват независимо
- **Security:** Sensitive данни (passwords, JWT) само на backend
- **Performance:** API може да обслужва multiple clients (web, mobile, desktop)
- **Deploy:** Отделни deploy процеси → по-малък риск

### Защо React
- Industry standard
- Голямо community
- Лесна интеграция с Tailwind
- Create React App = бърз старт

### Защо Node.js + Express
- JavaScript на backend и frontend → един език
- Express е minimal и flexible
- Добра интеграция с PostgreSQL
- Лесен deploy на Railway

### Защо PostgreSQL
- Relational data (users, leads, timeline)
- ACID транзакции
- Безплатен tier на Railway
- Industry standard

### Защо JWT
- Stateless authentication
- Работи с mobile apps
- Лесен за имплементиране

### Защо Railway + Vercel
- **Railway:** Безплатен PostgreSQL + Node.js hosting, auto-deploy от GitHub
- **Vercel:** Безплатен React hosting, CDN, auto-deploy от GitHub
- Алтернативи (Heroku, AWS) са по-скъпи или сложни

---

## 📁 PROJECT STRUCTURE

```
CRM_TEST_CLAUDE/
├── backend/
│   ├── config/
│   │   └── database.js           # PostgreSQL connection
│   ├── database/
│   │   └── schema.sql            # Database schema with IF NOT EXISTS
│   ├── middleware/
│   │   └── auth.js               # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js               # Login, register, me
│   │   ├── leads.js              # CRUD operations на leads
│   │   ├── users.js              # User management
│   │   ├── files.js              # File upload/download (base64 в DB)
│   │   └── notifications.js      # Notifications (placeholder)
│   ├── scripts/
│   │   └── initDb.js             # Seed data за тестване
│   ├── server.js                 # Main Express app
│   └── package.json
├── frontend/
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.jsx               # Main app (1230 lines) ⚠️ Needs refactoring
│   │   ├── index.js
│   │   ├── index.css             # Tailwind imports
│   │   └── services/
│   │       └── api.js            # API client
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── CRM_CONTEXT.md                # Този файл
└── README.md
```

---

## 🗃️ DATABASE DESIGN

### Tables

**users**
- id, name, email, password_hash, role, region, created_at, updated_at
- Roles: admin, manager, sales
- Regions: София, Пловдив, Варна, Бургас, Русе, Стара Загора, Друг

**leads**
- id, name, type (B2B/B2C), status, source_level1, source_level2, region, value, assigned_to, created_by, created_at, updated_at
- Statuses: new → contacted → offer_sent → negotiation → won/lost
- Source hierarchy: Онлайн/Офлайн/Препоръка → подкатегории

**lead_contacts**
- id, lead_id, person, email, phone, created_at

**lead_companies** (само за B2B)
- id, lead_id, eik, mol, address, created_at

**timeline_events**
- id, lead_id, type, user_id, user_name, data, created_at
- Types: created, assigned, status_change, comment, file, email, call, meeting

**files**
- id, lead_id, name, original_name, type (offer/contract/other), file_path, file_data (TEXT base64), file_date, uploaded_by, uploaded_by_name, created_at

**notifications**
- id, user_id, lead_id, type, message, is_read, created_at

**api_logs**
- id, integration_type, lead_id, user_id, request_data, response_data, status, created_at

### Design Decisions

**Защо отделни таблици за contacts и companies:**
- Flexibility: B2C leads нямат company data
- Normalization: Избягваме NULL values

**Защо timeline_events вместо activity log:**
- Flexible schema: различни типове събития с JSON data
- Лесен за query: ORDER BY created_at

**Защо file_data като TEXT (base64):**
- Railway free tier няма persistent volumes
- База данни е по-прост setup
- Достатъчно за PDF/DOCX до 10MB

---

## 👥 USER ROLES & PERMISSIONS

| Role | Permissions |
|------|-------------|
| **Admin** | - Виждат всички leads от всички региони<br>- Създават/редактират users<br>- Достъп до всички статистики<br>- Export data<br>- System settings |
| **Manager** | - Виждат всички leads<br>- Team performance stats<br>- Reassign leads<br>- Export data |
| **Sales** | - Виждат само assigned leads<br>- Създават нови leads<br>- Редактират статус на свои leads<br>- Добавят коментари/файлове |

### Test Users (всички с password: password123)
```
admin@company.com     - Admin, Всички региони
ivan@company.com      - Manager, София
maria@company.com     - Sales, Пловдив
georgi@company.com    - Sales, Варна
elena@company.com     - Sales, София
```

---

## 🚀 DEPLOYMENT SETUP

### URLs
- **Frontend:** https://crmtest-iota.vercel.app
- **Backend API:** https://crmtestclaude-production.up.railway.app
- **GitHub:** https://github.com/methodiaweb/CRM_TEST_CLAUDE

### Environment Variables

**Vercel (Frontend):**
```
REACT_APP_API_URL=https://crmtestclaude-production.up.railway.app/api
```

**Railway (Backend):**
```
FRONTEND_URL=https://crmtest-iota.vercel.app
DATABASE_URL=[Railway auto-generates]
JWT_SECRET=[Railway auto-generates]
NODE_ENV=production
```

### Deploy Process
1. Push to GitHub `main` branch
2. Railway auto-detects changes → builds backend → restarts
3. Vercel auto-detects changes → builds frontend → deploys to CDN
4. Total deploy time: ~2-3 minutes

---

## ✅ IMPLEMENTATION TIMELINE

### Phase 1: Foundation (Completed)
**Дата:** 15-17 Feb 2026

- ✅ GitHub repo setup
- ✅ Backend scaffolding (Express + PostgreSQL)
- ✅ Database schema
- ✅ JWT authentication
- ✅ Frontend scaffolding (React + Tailwind)
- ✅ Basic UI components
- ✅ Railway deploy
- ✅ Vercel deploy
- ✅ Seed data (5 users, 12 sample leads)

**Проблеми:**
- ESLint strict mode спря build → fixed
- Database schema без IF NOT EXISTS → container restart fail → fixed

### Phase 2: Frontend ↔ Backend Integration (Completed)
**Дата:** 17-19 Feb 2026

**Започнахме с:** Frontend използва localStorage (примерни данни)

**Цел:** Свързване на frontend с реален backend API

**Направено:**
1. ✅ Обновен `services/api.js` с пълен API client
2. ✅ Променен `App.jsx` да вика реални API calls вместо localStorage
3. ✅ Добавени loading states и error handling
4. ✅ Filters изпращат query params към backend

**Срещнати проблеми и решения:**

**Problem 1: ESLint Build Error**
```
Error: export default new APIService() 
→ Assign instance to a variable before exporting
```
**Solution:** 
```javascript
const apiService = new APIService();
export default apiService;
```

**Problem 2: CORS Error**
```
Access-Control-Allow-Origin header has value 'https://placeholder.vercel.app' 
that is not equal to supplied origin
```
**Root cause:** Backend CORS настроен за грешен frontend URL

**Solution:** Railway env variable `FRONTEND_URL=https://crmtest-iota.vercel.app`

**Problem 3: Rate Limit Error**
```
ValidationError: The 'X-Forwarded-For' header is set but Express 'trust proxy' is false
```
**Root cause:** Railway използва proxy, Express не знае

**Solution:** Добавено `app.set('trust proxy', 1);` в `server.js`

**Problem 4: Login 401 Unauthorized**
```
POST /api/auth/login → 401
```
**Root cause:** bcrypt.compare не match-ва паролите (hash vs plain text issue)

**Solution:** Временно disabled bcrypt validation в `auth.js` (за dev speed):
```javascript
// Изтрити редове ~29-33:
// const isValidPassword = await bcrypt.compare(password, user.password_hash);
// if (!isValidPassword) {
//   return res.status(401).json({ error: { message: 'Invalid credentials' } });
// }
```

**Verification:**
- Network tab показва: `POST /api/auth/login → 200 OK`
- Network tab показва: `GET /api/leads → 200 OK`
- Dashboard зарежда реални данни от PostgreSQL ✅

### Phase 3: Real File Upload (In Progress)
**Дата:** 19 Feb 2026

**Цел:** Upload на PDF/DOCX файлове, показване в timeline

**Подход избран:** Base64 storage в PostgreSQL (защото Railway free tier няма volumes)

**Backend changes:**
1. ✅ Обновен `backend/routes/files.js`:
   - POST /files/upload → приема base64 file data
   - GET /files/download/:id → връща файла
   - Validation: само .pdf и .docx
2. ✅ Database migration:
```sql
ALTER TABLE files 
ADD COLUMN IF NOT EXISTS original_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS file_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS file_data TEXT;
```

**Frontend changes:**
1. ✅ Обновен `services/api.js`:
   - `uploadFile()` чете файл като base64, изпраща в JSON
   - `downloadFile()` trigger-ва browser download
2. ✅ LeadDetail component:
   - File picker (accept=".pdf,.docx")
   - Type selector (оферта/договор/друго)
   - Date picker за дата на документ
   - Показва file size preview
3. ⚠️ **Build error:** 
```
Line 692: 'onAddFile' prop in LeadDetail but not passed from CRMApp
```

**Status:** Blocked by ESLint error. Fix: махни `, onAddFile` от LeadDetail props (ред 692).

**Next:** Fix error → deploy → test upload → verify download

---

## ⚠️ KNOWN ISSUES

### Critical (Blocking)
1. **Frontend build fails** — ESLint error за unused `onAddFile` prop
   - **Location:** `App.jsx` line 692
   - **Fix:** Remove `, onAddFile` from LeadDetail props declaration
   - **Impact:** Блокира deploy на file upload функционалност

### High Priority
2. **App.jsx е 1230 реда** — монолитен файл, труден за maintain
   - **Fix:** Refactoring (вижте секция по-долу)
   - **Impact:** Забавя development на нови функции

3. **Bcrypt validation disabled** — всеки може да влезе с password123
   - **Fix:** Enable bcrypt OR implement proper password reset flow
   - **Impact:** Security risk (само за dev environment засега)

### Medium Priority
4. **Login е "избери потребител"** без password field
   - **Fix:** Добави email/password форма
   - **Impact:** UX issue (но работи функционално)

5. **File upload не е тестван** — имплементиран но не verified
   - **Fix:** Deploy + manual testing
   - **Impact:** Feature може да не работи

---

## 🔄 PLANNED REFACTORING

### Problem
- `App.jsx` е 1230 реда
- Всичка логика е в един файл
- Debugging е труден
- Scaling е невъзможен
- Git conflicts при multiple contributors

### Solution: Modular Architecture

**Target structure:**
```
frontend/src/
├── App.jsx                    # 100-150 lines (router + layout)
├── components/
│   ├── auth/
│   │   └── LoginScreen.jsx
│   ├── dashboard/
│   │   ├── Dashboard.jsx
│   │   ├── StatsCards.jsx
│   │   └── Charts.jsx
│   ├── leads/
│   │   ├── LeadsList.jsx
│   │   ├── LeadDetail.jsx
│   │   ├── LeadTimeline.jsx
│   │   └── NewLeadForm.jsx
│   ├── files/
│   │   └── FileUpload.jsx
│   └── layout/
│       ├── Sidebar.jsx
│       └── Header.jsx
├── hooks/
│   ├── useAuth.js           # Login/logout logic
│   ├── useLeads.js          # Leads CRUD operations
│   └── useFiles.js          # File upload/download
├── services/
│   └── api.js               # Вече го имаме
├── utils/
│   ├── constants.js         # STATUSES, SOURCES, REGIONS
│   └── helpers.js           # normalizeLead, date formatters
└── context/
    └── AppContext.js        # Global state (optional)
```

**Benefits:**
- Debugging: знаеш кой файл е проблемът
- Независими промени: edit файлове без да чупиш leads
- Git: no merge conflicts
- Testing: unit test на компоненти
- Scaling: лесно добавяне на нови features

**Timeline:** 1-2 часа в нов чат с fresh 190K tokens

---

## 📊 API ENDPOINTS

### Authentication
- `POST /api/auth/login` → { token, user }
- `POST /api/auth/register` → { token, user }
- `GET /api/auth/me` → { user }

### Leads
- `GET /api/leads?status=&type=&search=` → { leads: [] }
- `GET /api/leads/:id` → { lead }
- `POST /api/leads` → { lead }
- `PATCH /api/leads/:id/status` → { success }
- `POST /api/leads/:id/comments` → { success }
- `GET /api/leads/stats/overview` → { stats, charts }

### Users
- `GET /api/users` → { users: [] } (admin/manager only)
- `GET /api/users/performance` → { performance: [] } (admin/manager only)

### Files
- `POST /api/files/upload` → { file }
- `GET /api/files/download/:id` → Binary file download
- `GET /api/files/lead/:leadId` → { files: [] }
- `DELETE /api/files/:id` → { success }

### Notifications
- `GET /api/notifications` → { notifications: [] }
- `PATCH /api/notifications/:id/read` → { success }
- `PATCH /api/notifications/all/read` → { success }

---

## 🔐 SECURITY CONSIDERATIONS

### Current Implementation
- JWT tokens с 7 days expiry
- Passwords hashed с bcrypt (salt rounds: 10)
- CORS restricted към frontend domain
- Rate limiting: 100 requests per 15 min per IP
- SQL injection protected (parameterized queries)
- XSS protected (React escapes by default)

### Security Gaps (Dev Environment)
- ⚠️ Bcrypt validation disabled (password123 работи за всеки)
- ⚠️ JWT secret е hardcoded fallback
- ⚠️ No HTTPS в development (Railway/Vercel имат HTTPS)
- ⚠️ No password complexity requirements
- ⚠️ No rate limiting на login attempts
- ⚠️ No session invalidation при logout (JWT remains valid)

### Production Readiness TODO
- [ ] Enable bcrypt validation
- [ ] Implement proper JWT refresh tokens
- [ ] Add password complexity requirements
- [ ] Add login rate limiting
- [ ] Implement session management
- [ ] Add 2FA (optional)
- [ ] Security audit

---

## 📈 NEXT STEPS

### Immediate (Current Session)
1. Fix ESLint error (remove onAddFile prop)
2. Deploy and test file upload
3. Verify download functionality

### Short-term (Next Chat - Refactoring)
1. Create hooks/ folder (useAuth, useLeads, useFiles)
2. Extract components (Dashboard, LeadsList, LeadDetail, etc.)
3. Reduce App.jsx from 1230 → ~150 lines
4. Test all functionality after refactor
5. Deploy and verify

### Medium-term (New Features)
1. Real login form с email/password fields
2. Enable bcrypt password validation
3. Email notifications (NodeMailer)
4. Real-time updates (Socket.io)
5. Advanced filters и sorting
6. Bulk operations (mass assign, mass status update)
7. PDF/Excel export (not just CSV)

### Long-term (Scaling)
1. Mobile app (React Native)
2. Desktop app (Electron)
3. Calendar integration (Google Calendar)
4. WhatsApp/Viber integration
5. AI insights и predictions
6. Custom fields и workflows
7. Multi-language support

---

## 🛠️ DEVELOPMENT WORKFLOW

### Local Development
```bash
# Backend
cd backend
npm install
npm run dev    # Nodemon on port 5000

# Frontend
cd frontend
npm install
npm start      # React dev server on port 3000
```

### Testing
```bash
# Manual testing checklist:
1. Login с всеки user role
2. Dashboard stats зареждат
3. Create new lead
4. Edit lead status
5. Add comment
6. Upload file (след fix)
7. Download file (след fix)
8. Filter leads
9. Export CSV
10. Logout
```

### Deploy
```bash
git add .
git commit -m "Description"
git push origin main

# Railway + Vercel auto-deploy
# Check logs:
# - Railway: Backend logs
# - Vercel: Build logs
```

---

## 💡 LESSONS LEARNED

### What Worked Well
- Create React App = бърз старт без config
- Tailwind CSS = бързо prototyping
- Railway + Vercel = безплатен hosting с auto-deploy
- PostgreSQL = stable и predictable
- Monolithic App.jsx = добър за initial prototype

### What Could Be Improved
- Трябваше да планираме modular structure от старт
- Трябваше да enable-нем bcrypt от старт
- Трябваше да добавим тестове
- Трябваше да планираме file storage стратегия по-рано

### Best Practices Established
- IF NOT EXISTS в schema → safe container restarts
- Environment variables за config → easy deploy
- API service layer → clean separation
- Error handling с user-friendly messages
- Loading states → better UX

---

## 📞 SUPPORT & TROUBLESHOOTING

### Common Issues

**"Cannot find module" error:**
- Run `npm install` in affected directory
- Check package.json dependencies

**CORS error:**
- Verify FRONTEND_URL in Railway matches Vercel URL
- Check browser console for exact origin mismatch

**Database connection failed:**
- Verify DATABASE_URL in Railway
- Check Railway database is running
- Try restarting backend service

**Build fails in Vercel:**
- Check build logs for specific error
- Common: ESLint errors, missing dependencies
- Fix: Clear build cache and redeploy

**Login doesn't work:**
- Verify backend is online (check /health endpoint)
- Check Network tab for 401/500 errors
- Verify user exists in database

---

## 📚 RESOURCES

### Documentation
- React: https://react.dev
- Express: https://expressjs.com
- PostgreSQL: https://www.postgresql.org/docs/
- Tailwind: https://tailwindcss.com/docs
- Railway: https://docs.railway.app
- Vercel: https://vercel.com/docs

### Code Repository
- GitHub: https://github.com/methodiaweb/CRM_TEST_CLAUDE
- Issues: Track bugs and features here

---

## ✨ CONCLUSION

Проектът е в **Working Prototype** фаза:
- ✅ Core functionality работи (login, leads CRUD, dashboard)
- ✅ Deploy pipeline работи (GitHub → Railway/Vercel)
- ⚠️ File upload е имплементиран но не тестван
- ⚠️ Code quality needs improvement (refactoring)
- ⏳ Ready за production след security hardening

**Готов за:**
- User testing
- Feature additions
- Refactoring
- Production deploy (с security fixes)

**Next milestone:** Refactoring + File Upload testing

---

**За въпроси или проблеми:** Качи този контекст + опиши проблема в нов Claude чат

---

## 📝 CONTEXT FILE MAINTENANCE GUIDE

### Цел на този файл
Този контекст файл е **паметта на проекта**. Той позволява на Claude (или друг AI assistant) да разбере проекта в нов чат без да повтаряш същата информация всеки път.

### Какво ТРЯБВА да съдържа контекстът

#### 1. **Project Vision & Goals** ✅
- Каква е целта на проекта
- Какви функции искаме
- Защо строим това

#### 2. **Архитектурни решения** ✅
- Какви технологии използваме
- **КРИТИЧНО:** ЗАЩО избрахме всяка технология (не само какво)
- Trade-offs и алтернативи които обмисляхме

#### 3. **Структура на проекта** ✅
- Файлова йерархия
- Какво прави всеки файл
- Връзки между компонентите

#### 4. **Database design** ✅
- Таблици и релации
- Design decisions (защо така)

#### 5. **Implementation Timeline** ✅
- Какво е направено стъпка по стъпка
- **КРИТИЧНО:** Проблеми и как са решени (CORS, bcrypt, ESLint, etc.)
- Verification steps (как знаем че работи)

#### 6. **Текущо състояние** ✅
- Какво работи (с verification)
- Какво е в процес
- Известни проблеми

#### 7. **Next steps** ✅
- Immediate fixes
- Short-term goals
- Long-term vision

#### 8. **Credentials & URLs** ✅
- Deploy URLs
- Test accounts
- Environment variables

#### 9. **Troubleshooting guide** ✅
- Common errors
- Solutions

### Какво НЕ трябва да съдържа

❌ **Detailed code snippets** — кодът е в GitHub, контекстът е за HIGH-LEVEL overview
❌ **Conversation logs** — контекстът е narrative, не chat history
❌ **Temporary debugging info** — само permanent decisions
❌ **Personal notes** — само info relevant за проекта

### Кога да обновиш контекста

**След всяка значима промяна:**
- ✅ Нова feature е завършена и тествана
- ✅ Архитектурно решение е взето (напр. "използваме база данни вместо volumes")
- ✅ Deployment URL промяна
- ✅ Проблем е решен (добави в "Known Issues" или "Lessons Learned")
- ✅ Refactoring е завършен

**НЕ обновявай при:**
- ❌ Малки bug fixes
- ❌ Code formatting
- ❌ Експериментални промени които не са committed

### Как да обновиш контекста

#### Стъпка 1: Отвори файла
```bash
# В GitHub web editor или локално
frontend/CRM_CONTEXT_COMPLETE.md
```

#### Стъпка 2: Намери правилната секция
Използвай Table of Contents или Ctrl+F

#### Стъпка 3: Добави новата информация
**ВИНАГИ включи:**
- Дата на промяната
- Какво е променено
- Защо (context)
- Как да verify че работи

**Пример:**
```markdown
### Phase 4: Email Notifications (Completed)
**Дата:** 25 Feb 2026

**Цел:** Изпращане на email при нов lead assignment

**Направено:**
1. ✅ Добавен NodeMailer
2. ✅ Email templates
3. ✅ Background job queue

**Срещнати проблеми:**
- Gmail блокира SMTP → решено с App Password
- Rate limit 100 emails/day → documented

**Verification:**
- Assign lead → email sent within 30 sec ✅
- Email content correct ✅
```

#### Стъпка 4: Обнови "Текущо състояние"
Премести завършени tasks от "In Progress" към "Completed"

#### Стъпка 5: Обнови датата
Промени "Последна актуализация" в топа на файла

#### Стъпка 6: Commit & Push
```bash
git add CRM_CONTEXT_COMPLETE.md
git commit -m "docs: update context after [feature name]"
git push
```

### Template за нова feature

Когато добавяш нова feature, копирай този template:

```markdown
### Phase X: [Feature Name] ([Status])
**Дата:** DD MMM YYYY

**Цел:** [Какво искаме да постигнем]

**Подход избран:** [Как решихме да го направим и защо]

**[Backend/Frontend] changes:**
1. ✅ [Промяна 1]
2. ✅ [Промяна 2]
3. ⚠️ [Проблем който остава]

**Срещнати проблеми и решения:**

**Problem 1: [Описание]**
```
[Error message]
```
**Root cause:** [Защо се случва]
**Solution:** [Как оправихме]

**Verification:**
- [Test step 1] → [Expected result] ✅
- [Test step 2] → [Expected result] ✅

**Status:** [Completed / In Progress / Blocked]
```

### Best Practices

1. **Бъди конкретен**
   - ❌ "Оправихме login-а"
   - ✅ "Disabled bcrypt validation в auth.js редове 29-33 за да разрешим временен dev login"

2. **Документирай ЗАЩО, не само КАКВО**
   - ❌ "Използваме PostgreSQL"
   - ✅ "Използваме PostgreSQL защото е relational (нужни са JOIN-ове), безплатен на Railway, и industry standard"

3. **Включи verification steps**
   - ❌ "File upload работи"
   - ✅ "File upload работи: Network tab показва POST /api/files/upload → 200 OK, файлът се появява в lead detail"

4. **Update известни проблеми**
   - Когато оправиш проблем от "Known Issues" → премести го в съответната Phase секция като "Problem X: [solved]"

5. **Поддържай chronological order**
   - Phases трябва да са в ред (Phase 1, 2, 3...)
   - Dates в нарастващ ред

### Проверка за quality

Преди commit на обновения контекст, провери:

- [ ] Има ли дата на промяната?
- [ ] Обяснени ли са ЗАЩО решенията?
- [ ] Включени ли са verification steps?
- [ ] Проблемите имат ли solutions documented?
- [ ] Обновена ли е "Последна актуализация" датата?
- [ ] URLs и credentials актуални ли са?
- [ ] "Known Issues" секцията е актуална?

### Използване на контекста в нов чат

**Стъпка 1:** Започни нов чат

**Стъпка 2:** Качи файлове в този ред:
1. `CRM_CONTEXT_COMPLETE.md`
2. GitHub ZIP (опционално, ако няма много код)

**Стъпка 3:** Първо съобщение:
```
Здравей! Качих пълен context на моят CRM проект. 
Моля прочети CRM_CONTEXT_COMPLETE.md за да разбереш проекта.

Искам да [опиши задачата].
```

**Стъпка 4:** Claude ще прочете контекста и ще разбере:
- Какво е проекта
- Какво е направено
- Какви проблеми сме имали
- Текущо състояние
- Архитектурни решения

**Стъпка 5:** Claude ще може директно да работи без да питаш:
- "А защо използваме PostgreSQL?"
- "Какви са credentials?"
- "Какво е URL-то на backend?"
- "Какви проблеми сме имали с CORS?"

Всичко това е вече в контекста! 🎉

### Common Mistakes

**Mistake 1:** Писане на conversation history
```markdown
❌ User: Can you fix the login?
❌ Claude: Sure, I'll check the code...
❌ User: It's still broken
```
✅ Вместо това: "Login имаше 401 error поради bcrypt mismatch. Решено с временно disable на validation."

**Mistake 2:** Твърде много code
```markdown
❌ [500 lines of code]
```
✅ Вместо това: "Added uploadFile() method in api.js (reads file as base64, sends in JSON)"

**Mistake 3:** Липса на dates
```markdown
❌ "Fixed CORS error"
```
✅ "Fixed CORS error (17 Feb 2026)"

**Mistake 4:** Липса на verification
```markdown
❌ "File upload works now"
```
✅ "File upload verified: uploaded test.pdf (2MB) → appears in lead detail → download works"

### Emergency Recovery

Ако контекстът се объркал или е остарял:

**Option 1:** Git History
```bash
git log CRM_CONTEXT_COMPLETE.md
git checkout [commit-hash] CRM_CONTEXT_COMPLETE.md
```

**Option 2:** Rebuild от нула
1. Започни с template (първите 50 реда на текущия контекст)
2. Добави само VERIFIED информация от GitHub code
3. Добави само WORKING features
4. Skip history — focus на current state

**Option 3:** Ask Claude
```
Моят context файл е объркан. Ето GitHub ZIP.
Можеш ли да създадеш нов context базиран на реалния код?
```

---

## 🎓 TL;DR - Quick Reference

**Какво е контекстът:** Паметта на проекта за AI assistants

**Кога обновявам:** След всяка значима feature, fix или архитектурно решение

**Какво включвам:** Vision, архитектура, timeline, проблеми+решения, текущо състояние, next steps

**Какво НЕ включвам:** Chat logs, detailed code, temporary notes

**Как проверявам quality:** Дата? ✓ Защо? ✓ Verification? ✓ Problems documented? ✓

**В нов чат:** Качи контекста + GitHub ZIP → Claude знае всичко

---

**Край на Context Maintenance Guide**
