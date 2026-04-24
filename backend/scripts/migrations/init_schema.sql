-- Bạn chạy file migration này bằng lệnh psql của PostgreSQL:

-- Đảm bảo đã tạo database và có user phù hợp.
-- Mở terminal, cd vào thư mục backend.
-- Chạy lệnh sau (thay đổi user/db nếu cần):
-- psql -U <db_user> -d <db_name> -f scripts/migrations/init_schema.sql
-- Ví dụ:
-- psql -U postgres -d duhocnb -f scripts/migrations/init_schema.sql

-- ======================== ROLES ========================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

-- ======================== PERMISSIONS ========================
CREATE TABLE IF NOT EXISTS permissions (
    id SERIAL PRIMARY KEY,
    code VARCHAR(100) UNIQUE NOT NULL,
    description TEXT
);

-- ======================== ROLE_PERMISSIONS ========================
CREATE TABLE IF NOT EXISTS role_permissions (
    role_code VARCHAR(50) REFERENCES roles(code) ON DELETE CASCADE,
    permission_code VARCHAR(100) REFERENCES permissions(code) ON DELETE CASCADE,
    PRIMARY KEY (role_code, permission_code)
);

-- ======================== USERS ========================
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
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
    created_by BIGINT REFERENCES users(id)
);

-- ======================== CATEGORIES ========================
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================== NEWS ========================
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    thumbnail_url TEXT,
    category_id INTEGER REFERENCES categories(id),
    author_id BIGINT REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (slug, category_id)
);
CREATE INDEX IF NOT EXISTS idx_news_slug ON news(slug);
CREATE INDEX IF NOT EXISTS idx_news_status ON news(status);
CREATE INDEX IF NOT EXISTS idx_news_category ON news(category_id);
CREATE INDEX IF NOT EXISTS idx_news_published_at ON news(published_at);
CREATE INDEX IF NOT EXISTS idx_news_slug_category ON news(slug, category_id);

-- ======================== NEWS_VIEWS ========================
CREATE TABLE IF NOT EXISTS news_views (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================== NEWS_VIEW_STATS ========================
CREATE TABLE IF NOT EXISTS news_view_stats (
    news_id INTEGER PRIMARY KEY REFERENCES news(id) ON DELETE CASCADE,
    view_count INTEGER DEFAULT 0
);

-- ======================== REGIONS ========================
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ======================== SCHOOL_TYPES ========================
CREATE TABLE IF NOT EXISTS school_types (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

-- ======================== SCHOOLS ========================
CREATE TABLE IF NOT EXISTS schools (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    location TEXT,
    tuition_per_year INTEGER,
    class_size INTEGER,
    visa_success_rate INTEGER,
    features JSONB,
    region_id INTEGER REFERENCES regions(id),
    type_id INTEGER REFERENCES school_types(id),
    status VARCHAR(20) CHECK (status IN ('partner', 'active', 'paused', 'pending')) DEFAULT 'pending',
    logo_url TEXT,
    thumbnail_url TEXT,
    rating DECIMAL(2,1),
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_schools_region ON schools(region_id);
CREATE INDEX IF NOT EXISTS idx_schools_status ON schools(status);

-- ======================== SCHOOL_REVIEWS ========================
CREATE TABLE IF NOT EXISTS school_reviews (
    id SERIAL PRIMARY KEY,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    student_name VARCHAR(100) NOT NULL,
    avatar_url TEXT,
    nationality VARCHAR(100),
    course_period VARCHAR(50),
    rating INTEGER CHECK (rating BETWEEN 1 AND 5),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_reviews_school ON school_reviews(school_id);

-- ======================== FAQS ========================
CREATE TABLE IF NOT EXISTS faqs (
    id SERIAL PRIMARY KEY,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    type VARCHAR(20) CHECK (type IN ('school', 'general')) NOT NULL,
    school_id INTEGER REFERENCES schools(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_faqs_school ON faqs(school_id);

-- ======================== CONTACTS ========================
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150),
    phone VARCHAR(20),
    message TEXT,
    status VARCHAR(30) CHECK (status IN ('new', 'pending', 'responded', 'closed')) DEFAULT 'new',
    contact_method VARCHAR(20) CHECK (contact_method IN ('phone', 'email', 'social')),
    social_contact VARCHAR(255),
    assigned_to BIGINT REFERENCES users(id),
    first_contacted_at TIMESTAMP,
    closed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
CREATE INDEX IF NOT EXISTS idx_contacts_assigned ON contacts(assigned_to);

-- ======================== CONTACT_NOTES ========================
CREATE TABLE IF NOT EXISTS contact_notes (
    id SERIAL PRIMARY KEY,
    contact_id INTEGER REFERENCES contacts(id) ON DELETE CASCADE,
    user_id BIGINT REFERENCES users(id),
    note TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================== STATIC_PAGES ========================
CREATE TABLE IF NOT EXISTS static_pages (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    hero_title VARCHAR(255),
    hero_description TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    type VARCHAR(20) CHECK (type IN ('static', 'dynamic')) NOT NULL,
    status VARCHAR(20) CHECK (status IN ('draft', 'published')) DEFAULT 'published',
    updated_by BIGINT REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================== PAGE_CONTENTS ========================
CREATE TABLE IF NOT EXISTS page_contents (
    page_id INTEGER PRIMARY KEY REFERENCES static_pages(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ======================== SETTINGS ========================
CREATE TABLE IF NOT EXISTS settings (
    key VARCHAR(100) PRIMARY KEY,
    value TEXT,
    description TEXT
);

-- ======================== NOTIFICATIONS ========================
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    role_code VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT,
    data JSONB,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_role ON notifications(role_code);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- ======================== NOTIFICATION_SETTINGS ========================
CREATE TABLE IF NOT EXISTS notification_settings (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    role_code VARCHAR(50),
    type VARCHAR(50) NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_notification_settings_user ON notification_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_notification_settings_role ON notification_settings(role_code);
CREATE INDEX IF NOT EXISTS idx_notification_settings_type ON notification_settings(type);

-- ======================== AUDIT_LOGS ========================
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    object_type VARCHAR(50),
    object_id BIGINT,
    data JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_object ON audit_logs(object_type, object_id);

-- ======================== PASSWORD_RESET_TOKENS ========================
CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    token VARCHAR(255) UNIQUE NOT NULL,
    expired_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_password_reset_user ON password_reset_tokens(user_id);

-- ======================== USER_SESSIONS ========================
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    refresh_token VARCHAR(255) UNIQUE NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,
    expired_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user ON user_sessions(user_id);

-- ======================== FILES ========================
CREATE TABLE IF NOT EXISTS files (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    public_id VARCHAR(255) UNIQUE NOT NULL,
    url TEXT NOT NULL,
    resource_type VARCHAR(50),
    format VARCHAR(20),
    width INTEGER,
    height INTEGER,
    bytes BIGINT,
    folder VARCHAR(255),
    tags TEXT[],
    context JSONB,
    used_in VARCHAR(50),
    used_in_id BIGINT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_files_user ON files(user_id);
CREATE INDEX IF NOT EXISTS idx_files_used_in ON files(used_in, used_in_id);

-- ======================== ACTIVITY_LOGS ========================
CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    object_type VARCHAR(50),
    object_id BIGINT,
    data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
