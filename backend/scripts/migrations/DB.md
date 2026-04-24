### 🧱 1. Bảng roles

```SQL
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);
```

### 🧱 2. Bảng permissions

```SQL
CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);
```

### 🧱 3. Bảng role_permissions

```SQL
CREATE TABLE role_permissions (
    role_code VARCHAR(50) REFERENCES roles(code) ON DELETE CASCADE,
    permission_code VARCHAR(100) REFERENCES permissions(code) ON DELETE CASCADE,
    PRIMARY KEY (role_code, permission_code)
);
```

### 🧱 4. Bảng users

```SQL

CREATE TABLE users (
    id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password TEXT NOT NULL,

    role_code VARCHAR(50) NOT NULL REFERENCES roles(code),

    is_active BOOLEAN DEFAULT TRUE,

    last_login TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    created_by BIGINT REFERENCES users(id) -- Người tạo user này
);
```

### 🧱 5. Bảng categories

```SQL
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🧱 6. Bảng news

```SQL
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

CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_news_slug_category ON news(slug, category_id);

```

### 🧱 7. news_views (lượt xem)

```SQL

CREATE TABLE news_views (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,

    ip_address VARCHAR(50),
    user_agent TEXT,

    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 🧱 8. 👉 Tạo bảng cache:

```SQL
CREATE TABLE news_view_stats (
    news_id INTEGER PRIMARY KEY,
    view_count INTEGER DEFAULT 0
);
```

### 🧱 9. Bảng contacts

```SQL

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

### 🔥 10. Bảng contact_notes

```SQL

CREATE TABLE contact_notes (
    id SERIAL PRIMARY KEY,

    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),

    note TEXT NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_contacts_status ON contacts(status);
CREATE INDEX idx_contacts_assigned ON contacts(assigned_to);
```

### 🧱 11. Bảng regions (khu vực)

```SQL
CREATE TABLE regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);
```

### 🧱 12. Bảng school_types

```SQL
CREATE TABLE school_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);
```

### 🧱 13. Bảng schools (core)

```SQL
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

CREATE INDEX idx_schools_region ON schools(region_id);
CREATE INDEX idx_schools_status ON schools(status);
```

### 🧱 14. Bảng faqs (dùng chung)

```SQL

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
CREATE INDEX idx_faqs_school ON faqs(school_id);
```

### 🧱 15. Bảng school_reviews

```SQL
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

### 🧱 16. Bảng static_pages

```SQL

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

### 17. 🧱 Bảng riêng cho content

```SQL

CREATE TABLE page_contents (
    page_id INTEGER PRIMARY KEY REFERENCES static_pages(id) ON DELETE CASCADE,

    content TEXT NOT NULL,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 18. 🧱 Tạo bảng settings

```SQL

CREATE TABLE settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT
);
```

### 19. 🧱 Thiết kế bảng notifications

```SQL

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id),         -- người nhận (có thể NULL nếu là broadcast)
    role_code VARCHAR(50),                        -- hoặc gửi cho cả role
    type VARCHAR(50) NOT NULL,                    -- loại thông báo (news_created, contact_updated, ...)
    title VARCHAR(255) NOT NULL,                  -- tiêu đề ngắn gọn
    message TEXT,                                 -- nội dung chi tiết
    data JSONB,                                   -- dữ liệu bổ sung (id đối tượng, link, ...)
    is_read BOOLEAN DEFAULT FALSE,                -- đã đọc hay chưa
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_role ON notifications(role_code);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);

```

### 20. 🧱 Thiết kế bảng notification_settings

```SQL
CREATE TABLE notification_settings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    role_code VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX idx_notification_settings_role ON notification_settings(role_code);
CREATE INDEX idx_notification_settings_type ON notification_settings(type);
```

#### Lưu ý thiết kế

- user_id và role_code có thể NULL, nhưng không nên NULL đồng thời (ít nhất phải xác định 1 đối tượng nhận).
- type nên chuẩn hóa (ví dụ: system, event, warning, info, ...).
- notification_settings cho phép user tắt/mở từng loại thông báo, ưu tiên user > role > mặc định hệ thống.
- Có thể mở rộng thêm trường như: expires_at, priority, v.v. nếu cần.

## Bổ sung các chức năng mở rộng

### 21. 🧱  Audit Logs (Lịch sử thao tác)

Mục đích: Ghi lại mọi thao tác quan trọng để phục vụ bảo mật, truy vết.

```SQL
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,         -- ví dụ: 'create_user', 'delete_news'
    object_type VARCHAR(50),              -- ví dụ: 'user', 'news', 'contact'
    object_id BIGINT,                     -- id của đối tượng bị tác động
    data JSONB,                           -- dữ liệu chi tiết (trước/sau)
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_object ON audit_logs(object_type, object_id);
```

### 22. 🧱 Password Reset Tokens (Quên mật khẩu)

Mục đích: Lưu token reset mật khẩu, thời gian hết hạn.

```SQL
CREATE TABLE password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
```

### 23. 🧱 Session Tokens / Refresh Tokens (Nếu dùng JWT có refresh)

Mục đích: Lưu refresh token để quản lý đăng nhập, bảo mật.

```SQL
CREATE TABLE user_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
```

### 24. 🧱  Bảng files (tối ưu cho Cloudinary)

```SQL
CREATE TABLE files (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),           -- Ai upload
    public_id VARCHAR(255) UNIQUE NOT NULL,        -- Cloudinary public_id
    url TEXT NOT NULL,                             -- URL truy cập ảnh
    resource_type VARCHAR(50),                     -- image, video, raw
    format VARCHAR(20),                            -- jpg, png, mp4, ...
    width INTEGER,
    height INTEGER,
    bytes BIGINT,                                  -- Kích thước file
    folder VARCHAR(255),                           -- Thư mục Cloudinary (nếu có)
    tags TEXT[],                                   -- Tag Cloudinary
    context JSONB,                                 -- Metadata bổ sung (caption, alt, ...)
    used_in VARCHAR(50),                           -- news, user, school, ...
    used_in_id BIGINT,                             -- id đối tượng sử dụng
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_files_user ON files(user_id);
CREATE INDEX idx_files_used_in ON files(used_in, used_in_id);
```

**Giải thích:**
- `public_id`: ID duy nhất của Cloudinary, dùng để xóa/cập nhật ảnh.
- `url`: Đường dẫn truy cập ảnh.
- `resource_type`, `format`, `width`, `height`, `bytes`: Metadata kỹ thuật.
- `folder`, `tags`, `context`: Quản lý nâng cao.
- `used_in`, `used_in_id`: Liên kết file với đối tượng sử dụng (news, user, ...).

Bạn có thể mở rộng thêm trường nếu cần (ví dụ: trạng thái, version, ...).

### 25. 🧱  Activity Logs (Theo dõi hành động user)

```SQL
CREATE TABLE activity_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,         -- ví dụ: 'login', 'view_news', 'search'
    object_type VARCHAR(50),
    object_id BIGINT,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
```