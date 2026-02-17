# CRM PROJECT CONTEXT
> Този файл се дава на Claude в началото на всеки нов чат.
> Claude го поддържа и обновява. Живее в GitHub.
> При нов чат: качи този файл + опиши какво искаш.

---

## 🚀 DEPLOY СТАТУС
**Последен update:** 17 Feb 2026
- **Backend:** Railway (Node.js + PostgreSQL) ✅ Online
- **Frontend:** Vercel (React) ✅ Online
- **Repo:** CRM_TEST_CLAUDE на GitHub

---

## 🛠️ TECH STACK
- **Frontend:** React 18, Tailwind CSS, Lucide Icons — всичко в `frontend/src/App.jsx` (един файл)
- **Backend:** Node.js, Express.js — `backend/server.js` + `backend/routes/`
- **Database:** PostgreSQL на Railway
- **Auth:** JWT + bcrypt
- **Deploy:** push to GitHub → автоматичен deploy (Railway + Vercel)

---

## 📁 СТРУКТУРА НА ПРОЕКТА
```
crm-package/
├── backend/
│   ├── config/database.js
│   ├── database/schema.sql
│   ├── middleware/auth.js
│   ├── routes/ (auth.js, leads.js, users.js, files.js, notifications.js)
│   ├── scripts/initDb.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── App.jsx          ← Целият frontend е тук
│   │   ├── index.js
│   │   ├── index.css
│   │   └── services/api.js  ← API комуникация с backend
│   └── package.json
└── CRM_CONTEXT.md           ← Този файл
```

---

## 👥 РОЛИ И ПОТРЕБИТЕЛИ
| Роля | Достъп |
|------|--------|
| Admin | Всичко — всички лийдове, всички региони, пълни статистики |
| Manager | Всичко — overview на екипа |
| Sales | Само своите лийдове (филтрирано по регион) |

**Потребители в системата:**
- admin@company.com / password123 (Admin, Всички региони)
- ivan@company.com / password123 (Manager, София)
- maria@company.com / password123 (Sales, Пловдив)
- georgi@company.com / password123 (Sales, Варна)
- elena@company.com / password123 (Sales, София)

---

## 🗃️ DATABASE SCHEMA
**Таблици:** `users`, `leads`, `lead_contacts`, `lead_companies`, `timeline_events`, `files`, `notifications`, `api_logs`

**Lead статуси (в ред):** `new` → `contacted` → `offer_sent` → `negotiation` → `won` / `lost`

**Lead типове:** B2B (има фирмени данни: ЕИК, МОЛ, адрес) | B2C (само контакт)

**Източници (2 нива):**
- Онлайн → Уебсайт / Facebook / Google Ads / LinkedIn / Instagram
- Офлайн → Телефон / Изложение / Директна среща / Пощенска кампания
- Препоръка → Клиент / Партньор / Служител / Друго

**Региони:** София, Пловдив, Варна, Бургас, Русе, Стара Загора, Друг

**Важни детайли за API response структурата:**
- `leads` от GET /api/leads имат поле `assigned_to` (snake_case) и `assigned_to_name`
- `source` се съхранява като `source_level1` / `source_level2` в DB, но се изпраща към backend като обект `{ level1, level2 }` при POST
- `timeline_events` имат поле `user_name` (не `user`) и `created_at` (не `timestamp`)
- `files` имат `original_name` и `uploaded_by_name` и `created_at`

---

## ✅ КАКВО Е НАПРАВЕНО

### Frontend (App.jsx) — v2 (17 Feb 2026)
- ✅ **Свързан с реалния Backend API** — App.jsx вече НЕ използва localStorage за данни
- ✅ Login вика реален `POST /api/auth/login` с email + password123
- ✅ JWT token се пази в localStorage (`crm_token`) — session persist при refresh
- ✅ Leads, stats, users, performance — всичко от API
- ✅ Добавяне на коментар → реален API call
- ✅ Промяна на статус → реален API call
- ✅ Качване на файл (метадата) → реален API call
- ✅ Нов лийд → реален API call
- ✅ Loading states (spinner) навсякъде
- ✅ Error handling с banner (dismiss-able)
- ✅ Filters (status, type, search) — изпращат се като query params към backend
- ✅ Dashboard статистики от `/api/leads/stats/overview`
- ✅ Charts за Admin/Manager от performance endpoint
- ✅ Normalization helper (`normalizeLead`) за различни field names от API
- ✅ Export to CSV (от заредените данни)
- ✅ Responsive (mobile hamburger menu, card view)

### Backend (API)
- POST /api/auth/login
- GET/POST /api/leads
- GET /api/leads/:id
- PATCH /api/leads/:id/status
- POST /api/leads/:id/comments
- GET /api/leads/stats/overview
- GET /api/users + /api/users/performance
- POST/GET/DELETE /api/files
- GET/PATCH /api/notifications

### Database
- schema.sql с IF NOT EXISTS (safe за container restart)
- initDb.js сийдва данни при първи deploy

---

## ❌ ПЛАНИРАНО НО НЕ НАПРАВЕНО

### Висок приоритет
- [ ] **Реален file upload** — записва се само името, без истински файл (следваща стъпка)
- [ ] **Реален login с email/парола форма** — сега е "избери потребител" но вика реален API с password123

### Среден приоритет
- [ ] Email нотификации (при нов лийд, смяна на статус)
- [ ] Real-time нотификации — WebSockets (Bell иконата е placeholder)
- [ ] Google Calendar интеграция
- [ ] PDF/Excel export (сега е само CSV)
- [ ] Bulk actions (масово преназначаване/промяна на статус)

### Нисък приоритет
- [ ] 2FA автентикация
- [ ] WhatsApp/Viber интеграция
- [ ] AI insights
- [ ] Custom fields

---

## ⚠️ ИЗВЕСТНИ ПРОБЛЕМИ
- При първи deploy трябва да се провери дали `REACT_APP_API_URL` env variable е зададен в Vercel (трябва да сочи към Railway URL)
- Ако backend е offline, frontend показва error banner

---

## 🔧 ВАЖНИ ТЕХНИЧЕСКИ БЕЛЕЖКИ
- ESLint в Vercel спира build при unused imports — внимавай при добавяне на нови lucide-react icons
- schema.sql е оправен с IF NOT EXISTS — safe за container restart
- Frontend е **един голям файл** (App.jsx) — при рефакториране внимавай за imports
- `services/api.js` е готов и **App.jsx вече го използва**
- `normalizeLead()` helper в App.jsx нормализира разликите между API response полета
- Backend очаква `source` като обект `{ level1, level2 }` при POST /api/leads

---

## 🔄 НЕЗАВЪРШЕНО В ПОСЛЕДНАТА СЕСИЯ
*17 Feb 2026*

Направено: Свързване на Frontend с Backend API (localStorage → реален API).
Файл заменен: `frontend/src/App.jsx`

**Следваща стъпка:** Real file upload (стъпка 2 от плана).
