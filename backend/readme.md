# 🚀 Backend API - Du Học Nhật Bản

Backend API cho hệ thống website giới thiệu và quản lý du học Nhật Bản.

---

## 🧱 Tech Stack

* **Node.js**
* **Express.js**
* **PostgreSQL**
* **JWT Authentication**
* **RBAC (Role-Based Access Control)**
* **Cloudinary** (upload ảnh - sẽ tích hợp)

---

## 📁 Cấu trúc thư mục

```
backend/
├── src/
│   ├── config/         # Kết nối DB, config chung
│   ├── controllers/    # Xử lý logic
│   ├── routes/         # Định nghĩa API
│   ├── middlewares/    # Auth, Permission
│   ├── utils/          # JWT, helper
│   └── app.js          # Entry point
│
├── scripts/
│   ├── createAdmin.js  # Tạo tài khoản admin
│   └── seeds/          # Seed dữ liệu
│
├── .env
├── package.json
└── README.md
```

---

## ⚙️ Cài đặt

### 1. Clone project

```
git clone <repo-url>
cd backend
```

---

### 2. Cài dependencies

```
npm install
```

---

### 3. Tạo file `.env`

```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=duhocdb
DB_PASSWORD=123456
DB_PORT=5432

JWT_SECRET=mysecretkey
PORT=5000
```

---

### 4. Chạy server

```
npm run dev
```

Server chạy tại:

```
http://localhost:5000
```

---

## 🔐 Authentication

### Login

```
POST /api/auth/login
```

Body:

```json
{
  "username": "superadmin",
  "password": "123456"
}
```

Response:

```json
{
  "token": "JWT_TOKEN"
}
```

---

## 🛡️ Middleware

### 1. Authenticate

* Kiểm tra JWT token
* Gắn thông tin user vào `req.user`

---

### 2. Permission (RBAC)

* Kiểm tra quyền theo `permission name`

Ví dụ:

```js
checkPermission("news.create")
```

---

## 🧑‍💼 Roles

* `superadmin`
* `admin`
* `manager`
* `consultant`
* `editor`

---

## 🔑 Permissions (ví dụ)

* `news.create`
* `news.update`
* `news.delete`
* `user.manage`
* `contact.manage`

---

## 💡 Mapping

|Role	|Permissions|
|--|--|
|writer	|news.*|
|consultant	|contact.*|
|manager	|user.* + news.* + contact.*|
|admin	|almost all|
|superadmin	|full + role.manage|

---

## 🗄️ Database

Sử dụng PostgreSQL với các bảng chính:

* `users`
* `roles`
* `permissions`
* `role_permissions`
* `news`
* `contacts`
* `schools`
* `static_pages`

---

## 🌱 Seed dữ liệu

### Seed roles

```
node scripts/seeds/seedRoles.js
```

### Seed permissions

```
node scripts/seeds/seedPermissions.js
```

### Seed role-permissions

```
node scripts/seeds/seedRolePermissions.js
```

---

## 👑 Tạo tài khoản Super Admin

```
node scripts/createAdmin.js
```

---

## 🧪 Test API

### Dùng curl:

```
curl http://localhost:5000/api/me \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🚀 Roadmap (Full System)

### 🧱 Phase 1 — Foundation (DONE)

* [x] Setup backend (Node.js + Express)
* [x] Kết nối PostgreSQL
* [x] Thiết kế database (users, roles, permissions)
* [x] Seed dữ liệu cơ bản

---

### 🔐 Phase 2 — Authentication & RBAC (DONE)

* [x] Login bằng username
* [x] Hash password (bcrypt)
* [x] JWT Authentication
* [x] Middleware authenticate
* [ ] RBAC (role + permission)
* [ ] Protect API theo permission

---

### 🧪 Phase 3 — Frontend Basic (IN PROGRESS)

* [x] Setup frontend (Nuxt)
* [x] Trang login
* [x] Kết nối API login
* [x] Lưu token
* [x] Route middleware (auth)
* [x] Middleware permission frontend
* [x] Ẩn menu theo role/permission

---

### 📰 Phase 4 — News Module

* [ ] CRUD News
* [ ] SEO (slug unique theo category)
* [ ] Upload ảnh (Cloudinary)
* [ ] Status (draft / published / archived)
* [ ] View count (news_views)

---

### 🏫 Phase 5 — Schools Module

* [ ] CRUD Schools
* [ ] Upload logo + ảnh
* [ ] Phân loại (khu vực, loại hình)
* [ ] Reviews học sinh
* [ ] FAQ cho trường

---

### 📞 Phase 6 — Contacts (Leads)

* [ ] Nhận form từ frontend
* [ ] Funnel trạng thái (new → pending → contacted → closed)
* [ ] Assign nhân viên
* [ ] Note nội bộ
* [ ] Tracking phương thức liên hệ

---

### 📄 Phase 7 — Static Content

* [ ] Quản lý trang (about, contact...)
* [ ] Page hero (title + description)
* [ ] SEO meta
* [ ] Settings (địa chỉ, email, phone)

---

### 🎨 Phase 8 — Frontend UI hoàn chỉnh

* [ ] Layout public
* [ ] Layout admin dashboard
* [ ] Responsive UI
* [ ] SEO frontend

---

### 📊 Phase 9 — Dashboard & Analytics

* [ ] Thống kê leads
* [ ] Thống kê bài viết
* [ ] Biểu đồ

---

### ⚡ Phase 10 — Advanced RBAC (PRO)

* [ ] Dynamic permission
* [ ] UI theo permission
* [ ] Cache permission backend

---

### 🚀 Phase 11 — Production Ready

* [ ] Logging
* [ ] Error handling
* [ ] Rate limit
* [ ] Validation
* [ ] API docs (Swagger)

---

### ☁️ Phase 12 — Deployment

* [ ] Deploy backend
* [ ] Deploy frontend
* [ ] Domain + HTTPS
* [ ] CI/CD

---

### 🔥 Phase 13 — Nâng cao

* [ ] Realtime
* [ ] Email automation
* [ ] Multi-language
* [ ] CMS editor

---
