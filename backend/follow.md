# Ngày 1

## ✅ Bước 1: Tạo nhánh cho git

👉 Bạn đang ở develop, chạy:

```
#Bash
git checkout develop
git pull
git checkout -b feature/init-backend
```

## ✅ Bước 2: Tạo cấu trúc project

```
project-root/
│
├── frontend/   (Nuxt sau này)
├── backend/
│   ├── src/
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── app.js
│   ├── package.json
│   └── .env
│
└── README.md
```

## ✅ Bước 3: Init Node.js

```
cd backend
npm init -y
```

## ✅ Bước 4: Cài dependency cơ bản

```
npm install express cors dotenv
npm install --save-dev nodemon
```

## ✅ Bước 5: Tạo server cơ bản

```
📄 backend/src/app.js
```

```
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

## ✅ Bước 6: Sửa package.json

```
"scripts": {
  "dev": "nodemon src/app.js"
}
```

## ✅ Bước 7: Chạy thử

```
npm run dev
```

👉 Mở:

```
http://localhost:5000
```

## ✅ Bước 8: Commit

```
git add .
git commit -m "init backend with express"
git push origin feature/init-backend
```


# Ngày 2

```
feature/database-design
```

## 🎯 PHẦN 2.1 — Thiết kế bảng users (admin)

👉 Mục tiêu:

- đăng nhập admin
- phân quyền rõ ràng
- superadmin có thể:
    - tạo role
    - gán quyền chi tiết (check từng quyền)
- user login bằng username
- hệ thống linh hoạt, mở rộng dễ

### 💡 Mapping

👉 Logic sẽ nằm ở backend (Node.js), ví dụ:


|Role	|Permissions|
|--|--|
|writer	|news.*|
|consultant	|contact.*|
|manager	|user.* + news.* + contact.*|
|admin	|almost all|
|superadmin	|full + role.manage|


🔥 Role + Permission (granular control)

```
users
roles
permissions
role_permissions
```

### 🧱 1. Bảng users

```
# SQL

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,

    password TEXT NOT NULL,

    role_id INTEGER NOT NULL REFERENCES roles(id),

    is_active BOOLEAN DEFAULT TRUE,

    last_login TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🧱 2. Bảng roles

```
# SQL
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
```

### 🧱 3. Bảng permissions

```
# SQL
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);
```

### 🧱 4. Bảng role_permissions

```
# SQL
CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id) ON DELETE CASCADE,
    permission_id INTEGER REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);
```

🧠 Cách hoạt động

👉 Ví dụ:

Role: writer
- news.create
- news.update
Role: consultant
- contact.view
- contact.update

## 🎯 PHẦN 2.2 — Thiết kế bảng news

👉 Mục tiêu:

- SEO tốt (slug)
- phân loại (category)
- có tác giả (user)
- trạng thái (draft/published)
- hỗ trợ ảnh (Cloudinary)

### 🧱 1. Bảng categories

```
# SQL
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🧱 2. Bảng news

```
# SQL
CREATE TABLE news (
    id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,

    content TEXT NOT NULL,
    excerpt TEXT,

    thumbnail_url TEXT,

    category_id INTEGER REFERENCES categories(id),
    author_id INTEGER REFERENCES users(id),

    status VARCHAR(20) CHECK (
        status IN ('draft', 'published', 'archived')
    ) DEFAULT 'draft',

    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    meta_title VARCHAR(255),
    meta_description TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE (slug, category_id)
);

```

🧠 Ý nghĩa
|Status	|Ý nghĩa|
|--|--|
|draft	|đang viết|
|published	|đã public|
|archived	|đã ẩn (tạm khóa)|


### 3. Index cho SEO (rất quan trọng)

```
#SQL

CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_news_slug_category ON news(slug, category_id);
```

🎯 Giải thích
- slug → tìm bài nhanh
- status → lọc bài published
- category_id → filter theo danh mục
- published_at → sort bài mới

### 4. news_views (lượt xem)

```
# SQL

CREATE TABLE news_views (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,

    ip_address VARCHAR(50),
    user_agent TEXT,

    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

👉 rồi:

- count bằng query
- hoặc cache Redis

- ✔ chuẩn production
- ✔ thống kê theo ngày/tháng

🎯 Vì sao thêm mấy field này?
|Field	|Mục đích|
|--|--|
|ip_address	|chống spam|
|user_agent	|phân tích device|
|viewed_at	|thống kê theo thời gian|

### 5. 👉 Tạo bảng cache:

```
# SQL
CREATE TABLE news_view_stats (
    news_id INTEGER PRIMARY KEY,
    view_count INTEGER DEFAULT 0
);
```

👉 Cron job:

cập nhật mỗi 5 phút

- ✔ nhanh
- ✔ không nặng DB

## 🎯 PHẦN 2.3 — Bảng contacts (lead khách hàng)

👉 Mục tiêu:

- lưu thông tin khách hàng
- quản lý trạng thái (funnel)
- assign nhân viên xử lý
- lưu lịch sử + ghi chú

### 🧱 1. Bảng contacts (core)

```
# SQL

CREATE TABLE contacts (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),

    message TEXT,

    status VARCHAR(30) CHECK (
        status IN ('new', 'pending', 'responded', 'closed')
    ) DEFAULT 'new',

    contact_method VARCHAR(20) CHECK (
        contact_method IN ('phone', 'email', 'social')
    ),

    social_contact VARCHAR(255),

    assigned_to INTEGER REFERENCES users(id),

    first_contacted_at TIMESTAMP,
    closed_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

🧠 Mapping

|Funnel	|DB|
|--|--|
|Thư mới	|new|
|chờ phản hồi	|pending|
|đã phản hồi	|responded|
|close	|closed|

### 🔥 2. Bảng contact_notes (rất quan trọng)

👉 vì:

- 1 khách → nhiều note
- nhiều nhân viên có thể ghi chú

```
# SQL

CREATE TABLE contact_notes (
    id SERIAL PRIMARY KEY,

    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),

    note TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### ⚡ 3. Nâng cấp (rất nên làm)

```
# SQL

CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to);
```

## 🎯 PHẦN 2.4 — Bảng schools (trường Nhật ngữ)

### 🧱 1. Bảng regions (khu vực)

```
# SQL
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);
```

### 🧱 2. Bảng school_types

```
# SQL
CREATE TABLE school_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);
```

### 🧱 3. Bảng schools (core)

```
# SQL
CREATE TABLE schools (
    id SERIAL PRIMARY KEY,

    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,

    location TEXT, -- địa chỉ chi tiết

    tuition_per_year INTEGER, -- học phí
    class_size INTEGER,       -- sĩ số lớp
    visa_success_rate INTEGER, -- %

    features JSONB, -- đặc điểm

    region_id INTEGER REFERENCES regions(id),
    type_id INTEGER REFERENCES school_types(id),

    status VARCHAR(20) CHECK (
        status IN ('partner', 'active', 'paused', 'pending')
    ) DEFAULT 'pending',

    logo_url TEXT,
    thumbnail_url TEXT, -- ảnh chính

    rating DECIMAL(2,1), -- ví dụ 4.5
    review_count INTEGER DEFAULT 0,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

🧠 Mapping status
|Ý nghĩa	|DB|
|--|--|
|đối tác	|partner|
|hoạt động	|active|
|tạm dừng	|paused|
|chờ duyệt	|pending|

### 🧱 4. Bảng faqs (dùng chung)

```
# SQL

CREATE TABLE faqs (
    id SERIAL PRIMARY KEY,

    question TEXT NOT NULL,
    answer TEXT NOT NULL,

    -- loại FAQ
    type VARCHAR(20) CHECK (
        type IN ('school', 'general')
    ) NOT NULL,

    -- nếu là FAQ của trường
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🔥 5. Nâng cấp (rất nên làm)

1. Index

```
# SQL

CREATE INDEX idx_schools_region ON schools(region_id);
CREATE INDEX idx_schools_status ON schools(status);
CREATE INDEX idx_faqs_school ON faqs(school_id);
```

2. Slug SEO

```
# URL

/schools/tokyo/abc-school
```

3. Features nên dùng JSON

```
# JSON
[
  "Quốc tế",
  "Học phí hợp lý",
  "Hỗ trợ việc làm"
]
```

### 🧱 6. Bảng school_reviews

```
# SQL
CREATE TABLE school_reviews (
    id SERIAL PRIMARY KEY,

    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,

    student_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    nationality VARCHAR(100),

    course_period VARCHAR(50), -- ví dụ: 2023-2025

    rating INTEGER CHECK (rating BETWEEN 1 AND 5),

    content TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_reviews_school ON school_reviews(school_id);
```

## 🎯 PHẦN 2.5 — Static Content (About, Điều kiện, Liên hệ…)

❗ Vấn đề cần giải quyết

👉 Các trang:

- Giới thiệu công ty (About)
- Điều kiện du học
- Thông tin liên hệ
- Có thể thêm sau (FAQ chung, chính sách…)

👉 Yêu cầu:

- admin / manager sửa được
- không phải viết code lại

### 🧱 1. Bảng static_pages

```
# SQL

CREATE TABLE static_pages (
    id SERIAL PRIMARY KEY,

    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,

    hero_title VARCHAR(255),
    hero_description TEXT,

    meta_title VARCHAR(255),
    meta_description TEXT,

    type VARCHAR(20) CHECK (
        type IN ('static', 'dynamic')
    ) NOT NULL,

    status VARCHAR(20) CHECK (
        status IN ('draft', 'published')
    ) DEFAULT 'published',

    updated_by INTEGER REFERENCES users(id),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2. 🧱 Bảng riêng cho content

```
# SQL

CREATE TABLE page_contents (
    page_id INTEGER PRIMARY KEY REFERENCES static_pages(id) ON DELETE CASCADE,

    content TEXT NOT NULL,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

🎯 Ý nghĩa

|Table	|Vai trò|
|--|--|
|static_pages	|config page|
|page_contents	|nội dung (chỉ khi cần)|

### 3. 🧱 Tạo bảng settings

```
# SQL

CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT
);
```

🎯 Ví dụ

```
INSERT INTO settings (key, value) VALUES
('company_name', 'Du học NB'),
('address', 'Tokyo...'),
('email', 'contact@abc.com'),
('phone', '090-xxxx'),
('working_hours', '9:00 - 18:00'),
('google_map_iframe', '<iframe ...>');
```

## Đẩy code lên github

```
# BASH

git add .
git commit -m "feat: initialize backend with database schema"
git push origin feature/init-backend

git checkout develop
git merge feature/init-backend
git push -u origin develop
```

# Ngày 3

```
git checkout develop
git checkout -b feature/auth
```

## 🎯 PHẦN 3.1 — Chuẩn bị

👉 Mục tiêu:

- login bằng username
- mã hóa password bằng bcrypt
- trả về JWT

### 🧱 Bước 1: Cài thư viện

```
npm install bcrypt jsonwebtoken pg

npm install nodemon --save-dev

```

### 🧱 Bước 2: Cấu trúc thư mục (chuẩn thực tế)

```
src/
  ├── app.js
  ├── routes/
  │     └── auth.routes.js
  ├── controllers/
  │     └── auth.controller.js
  ├── services/
  │     └── auth.service.js
  ├── middlewares/
  │     └── auth.middleware.js
  ├── utils/
  │     └── jwt.js
  └── config/
        └── db.js
```

📁 Tạo file backend/.env


```
DB_USER=postgres
DB_HOST=localhost
DB_NAME=your_db
DB_PASSWORD=your_password
DB_PORT=5432

JWT_SECRET=mysecretkey
PORT=5000
```

### 🧱 Bước 3: Kết nối DB


📁 src/config/db.js

```
import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

export default {
  query: (text, params) => pool.query(text, params),
};
```

### 🧱 Bước 4: Hash password (tạo user)

Tạo role_id = 1 cho Super Admin nếu chưa có

👉 kiểm tra:

```
# SQL

SELECT * FROM roles;
```

👉 nếu chưa có → phải insert trước:

```
# SQL

INSERT INTO roles (id, name, description) VALUES (1, 'superadmin', 'Day la nguoi co quyen cao nhat');
```

📁 script tạo user admin (chạy 1 lần)

```
// scripts/createAdmin.js
import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcrypt";
import db from "../src/config/db.js";

const run = async () => {
    try {
        const hash = await bcrypt.hash("123456", 10);

        await db.query(
            `
      INSERT INTO users 
      (name, username, email, phone, password, role_id)
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (username) DO NOTHING
      `,
            [
                "Super Admin",          // name
                "superadmin",                // username
                "superadmin@example.com",    // email
                null,                   // phone (có thể null)
                hash,                   // password đã hash
                1                       // role_id (phải tồn tại trong roles)
            ]
        );

        console.log("✅ Admin created");
    } catch (err) {
        console.error("❌ Error:", err.message);
    }
};

run();
```

👉 chạy:

```
node scripts/createAdmin.js
```

## 🎯 PHẦN 3.2 — Setup Auth cơ bản (Login + JWT)

### 🧱 Bước 5: JWT

📁 src/utils/jwt.js

```
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            role_id: user.role_id,
        },
        SECRET,
        { expiresIn: "1d" }
    );
};

export const verifyToken = (token) => {
    return jwt.verify(token, SECRET);
};
```

### 🧱 Bước 6: Login API

📁 src/controllers/auth.controller.js

```
import bcrypt from "bcrypt";
import db from "../config/db.js";
import { generateToken } from "../utils/jwt.js";

export const login = async (req, res) => {
    const { username, password } = req.body;

    const result = await db.query(
        "SELECT * FROM users WHERE username = $1",
        [username]
    );

    if (result.rows.length === 0) {
        return res.status(400).json({ message: "User not found" });
    }

    const user = result.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        return res.status(400).json({ message: "Wrong password" });
    }

    const token = generateToken(user);

    res.json({ token });
};
```

📁 src/routes/auth.routes.js

```
import express from "express";
import { login } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);

export default router;
```

## 🎯 PHẦN 3.2 — Middleware kiểm tra đăng nhập

### 🧱 Bước 7: Middleware auth

📁 src/middlewares/auth.middleware.js

```
import { verifyToken } from "../utils/jwt.js";

export const authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({ message: "No token" });
    }

    const token = authHeader.split(" ")[1];

    try {
        const user = verifyToken(token);
        req.user = user;
        next();
    } catch {
        return res.status(401).json({ message: "Invalid token" });
    }
};
```

## 🎯 PHẦN 3.3 — RBAC (phân quyền)

### 🧱 Bước 8: RBAC (permission)

📁 src/middlewares/permission.middleware.js

```
import db from "../config/db.js";

export const authorize = (permissionName) => {
    return async (req, res, next) => {
        const user = req.user;

        const result = await db.query(
            `
      SELECT p.name FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = $1
      `,
            [user.role_id]
        );

        const permissions = result.rows.map((p) => p.name);

        if (!permissions.includes(permissionName)) {
            return res.status(403).json({ message: "Forbidden" });
        }

        next();
    };
};
```

### 🧱 Bước 9: Gắn vào app.js

```
import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";

dotenv.config(); // load .env file

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// auth routes
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

🧪 TEST

```
POST http://localhost:5000/api/auth/login
```


```
{
  "username": "admin",
  "password": "123456"
}
```

## 🎯 Flow hoàn chỉnh

```
Login → nhận token
   ↓
Lưu localStorage
   ↓
Gọi API kèm:
Authorization: Bearer TOKEN
   ↓
Backend check:
authenticate → authorize
```

## 🎯 Đẩy code lên github

```
```
```
```
```
```
```
```
```
```





