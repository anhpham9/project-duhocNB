# News API Documentation

Complete API documentation for the News and Categories management system with Role-Based Access Control (RBAC).

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Permission Matrix](#permission-matrix)
3. [Categories API](#categories-api)
4. [News API](#news-api)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [Testing](#testing)

## 🔐 Authentication

All endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

Get token from `/api/auth/login` endpoint.

## 🛡️ Permission Matrix

| Role | View News/Categories | Create News | Edit News | Delete News | Change Status | Create Categories |
|------|---------------------|-------------|-----------|-------------|---------------|------------------|
| **Superadmin (1)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Admin (2)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| **Manager (3)** | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ |
| **Editor (4)** | ✅ | ✅ (draft only) | ✅ | ❌ | ❌ | ❌ |
| **Consultant (5)** | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |

### Key Business Rules:
- **Editor** can only create/edit news with status `draft`
- **Editor** cannot change news status (no publishing power)
- **Manager** can approve/publish news but cannot delete
- Only **Superadmin** and **Admin** can delete news
- **Consultant** has no access to news system

## 📂 Categories API

### Base URL: `/api/categories`

### Get All Categories
```http
GET /api/categories
```

**Permission Required:** View News/Categories

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Du học Nhật Bản",
      "slug": "du-hoc-nhat-ban",
      "created_at": "2024-01-01T00:00:00.000Z",
      "news_count": 5
    }
  ]
}
```

### Get Category by ID
```http
GET /api/categories/:id
```

**Permission Required:** View News/Categories

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Du học Nhật Bản",
    "slug": "du-hoc-nhat-ban",
    "created_at": "2024-01-01T00:00:00.000Z",
    "news_count": 5
  }
}
```

### Create Category
```http
POST /api/categories
```

**Permission Required:** Superadmin, Admin, Manager

**Request Body:**
```json
{
  "name": "Du học Nhật Bản",
  "slug": "du-hoc-nhat-ban" // Optional, auto-generated if not provided
}
```

**Response:**
```json
{
  "success": true,
  "message": "Category created successfully",
  "data": {
    "id": 1,
    "name": "Du học Nhật Bản",
    "slug": "du-hoc-nhat-ban",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update Category
```http
PUT /api/categories/:id
```

**Permission Required:** Superadmin, Admin, Manager

**Request Body:**
```json
{
  "name": "Du học Nhật Bản - Updated",
  "slug": "du-hoc-nhat-ban-updated"
}
```

### Delete Category
```http
DELETE /api/categories/:id
```

**Permission Required:** Superadmin, Admin, Manager

**Note:** Cannot delete categories that have news articles. Move or delete news first.

## 📰 News API

### Base URL: `/api/news`

### Get All News
```http
GET /api/news
GET /api/news?status=published
GET /api/news?category_id=1
GET /api/news?author_id=2
GET /api/news?search=du học
```

**Permission Required:** View News/Categories

**Query Parameters:**
- `status` - Filter by status (draft, published, archived)
- `category_id` - Filter by category
- `author_id` - Filter by author
- `search` - Search in title and content

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Hướng dẫn du học Nhật Bản 2024",
      "slug": "huong-dan-du-hoc-nhat-ban-2024",
      "content": "Nội dung bài viết...",
      "excerpt": "Tóm tắt bài viết...",
      "thumbnail_url": "https://example.com/image.jpg",
      "status": "published",
      "published_at": "2024-01-01T00:00:00.000Z",
      "meta_title": "Du học Nhật Bản 2024",
      "meta_description": "Hướng dẫn chi tiết...",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z",
      "category_name": "Du học Nhật Bản",
      "category_slug": "du-hoc-nhat-ban",
      "author_name": "Admin User",
      "author_username": "admin",
      "view_count": 150
    }
  ],
  "total": 1
}
```

### Get News by ID
```http
GET /api/news/:id
```

**Permission Required:** View News/Categories

### Create News
```http
POST /api/news
```

**Permission Required:** Superadmin, Admin, Manager, Editor

**Request Body:**
```json
{
  "title": "Hướng dẫn du học Nhật Bản 2024",
  "slug": "huong-dan-du-hoc-nhat-ban-2024", // Optional
  "content": "Nội dung chi tiết về du học Nhật Bản...",
  "excerpt": "Tóm tắt bài viết...", // Optional
  "thumbnail_url": "https://example.com/image.jpg", // Optional
  "category_id": 1, // Optional
  "status": "draft", // Optional, default: draft
  "meta_title": "Du học Nhật Bản 2024", // Optional
  "meta_description": "Hướng dẫn chi tiết..." // Optional
}
```

**Business Logic:**
- **Editor** can only create with status `draft`
- **Others** can create with any valid status
- `slug` is auto-generated from title if not provided
- `author_id` is automatically set to current user

**Response:**
```json
{
  "success": true,
  "message": "News created successfully",
  "data": {
    "id": 1,
    "title": "Hướng dẫn du học Nhật Bản 2024",
    "slug": "huong-dan-du-hoc-nhat-ban-2024",
    "content": "Nội dung chi tiết về du học Nhật Bản...",
    "excerpt": "Tóm tắt bài viết...",
    "thumbnail_url": "https://example.com/image.jpg",
    "category_id": 1,
    "author_id": 1,
    "status": "draft",
    "published_at": "2024-01-01T00:00:00.000Z",
    "meta_title": "Du học Nhật Bản 2024",
    "meta_description": "Hướng dẫn chi tiết...",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z"
  }
}
```

### Update News
```http
PUT /api/news/:id
```

**Permission Required:** Superadmin, Admin, Manager, Editor

**Request Body (partial update):**
```json
{
  "title": "Updated Title",
  "status": "published" // Only if user has status change permission
}
```

**Business Logic:**
- **Editor** cannot change status field
- **Superadmin, Admin, Manager** can change status
- All roles can update content fields
- Slug uniqueness is checked within the same category

### Delete News
```http
DELETE /api/news/:id
```

**Permission Required:** Superadmin, Admin only

### Get News Statistics
```http
GET /api/news/stats
```

**Permission Required:** View News/Categories

**Response:**
```json
{
  "success": true,
  "data": {
    "byStatus": [
      { "status": "draft", "count": "5" },
      { "status": "published", "count": "12" },
      { "status": "archived", "count": "2" }
    ],
    "byCategory": [
      { "category_name": "Du học Nhật Bản", "news_count": "8" },
      { "category_name": "Học bổng", "news_count": "5" }
    ],
    "total": 19
  }
}
```

### Track News View (Public)
```http
POST /api/news/:id/view
```

**Permission Required:** None (public endpoint)

**Purpose:** Track page views for analytics

**Response:**
```json
{
  "success": true,
  "message": "View tracked successfully"
}
```

## 🚨 Error Handling

### Common Error Responses

#### 400 Bad Request
```json
{
  "success": false,
  "message": "Title and content are required"
}
```

#### 401 Unauthorized
```json
{
  "success": false,
  "message": "Invalid or expired token"
}
```

#### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. You cannot create news."
}
```

#### 404 Not Found
```json
{
  "success": false,
  "message": "News not found"
}
```

#### 409 Conflict
```json
{
  "success": false,
  "message": "Slug already exists in this category"
}
```

#### 429 Too Many Requests
```json
{
  "success": false,
  "message": "Too many requests to news API, please try again later."
}
```

#### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

## ⚡ Rate Limiting

| Endpoint Category | Limit | Window |
|------------------|--------|---------|
| **News API** | 200 requests | 15 minutes |
| **Categories API** | 50 requests | 15 minutes |
| **View Tracking** | 30 requests | 1 minute |
| **Global API** | 1000 requests | 15 minutes |

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Request limit per window
- `X-RateLimit-Remaining`: Requests remaining in current window
- `X-RateLimit-Reset`: Time when the current window resets

## 🧪 Testing

### Run Test Suite
```bash
node test-news-api.js
```

### Test Coverage
- ✅ Authentication flow
- ✅ Categories CRUD operations
- ✅ News CRUD operations
- ✅ RBAC permission validation
- ✅ Error handling scenarios
- ✅ Data validation
- ✅ Rate limiting behavior

### Sample Test Data
The test suite creates and cleans up:
- Test category: "Du học Nhật Bản"
- Test news: "Hướng dẫn du học Nhật Bản 2024"
- Validates all role permissions
- Tests error scenarios

## 📊 Database Schema

### Categories Table
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(150) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### News Table
```sql
CREATE TABLE news (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    excerpt TEXT,
    thumbnail_url TEXT,
    category_id INTEGER REFERENCES categories(id),
    author_id INTEGER REFERENCES users(id),
    status VARCHAR(20) CHECK (status IN ('draft', 'published', 'archived')) DEFAULT 'draft',
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meta_title VARCHAR(255),
    meta_description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (slug, category_id)
);
```

### Indexes for Performance
```sql
CREATE INDEX idx_news_slug ON news(slug);
CREATE INDEX idx_news_status ON news(status);
CREATE INDEX idx_news_category ON news(category_id);
CREATE INDEX idx_news_published_at ON news(published_at);
CREATE INDEX idx_news_slug_category ON news(slug, category_id);
```

### View Tracking Tables
```sql
CREATE TABLE news_views (
    id SERIAL PRIMARY KEY,
    news_id INTEGER REFERENCES news(id) ON DELETE CASCADE,
    ip_address VARCHAR(50),
    user_agent TEXT,
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE news_view_stats (
    news_id INTEGER PRIMARY KEY,
    view_count INTEGER DEFAULT 0
);
```

## 🔧 Security Features

### Input Sanitization
- XSS protection for all text inputs
- SQL injection prevention
- HTML entity escaping
- Slug validation and normalization
- URL validation for thumbnails

### Access Control
- JWT token validation
- Role-based permission enforcement
- IP-based rate limiting
- Request logging and audit trails

### Data Validation
- Required field validation
- Status enum validation
- Category existence validation
- Slug uniqueness validation
- Content length limits

---

## 📝 Usage Examples

### Creating a Complete News Article (Admin)

```javascript
// 1. First create a category
const category = await fetch('/api/categories', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    name: 'Du học Nhật Bản',
    slug: 'du-hoc-nhat-ban'
  })
});

// 2. Then create news in that category
const news = await fetch('/api/news', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    title: 'Hướng dẫn du học Nhật Bản 2024',
    content: 'Nội dung chi tiết...',
    excerpt: 'Tóm tắt...',
    category_id: category.data.id,
    status: 'published',
    meta_title: 'Du học Nhật Bản 2024',
    meta_description: 'Hướng dẫn chi tiết...'
  })
});
```

### Editor Workflow

```javascript
// Editor creates draft
const draft = await fetch('/api/news', {
  method: 'POST',
  body: JSON.stringify({
    title: 'My Article',
    content: 'Content...',
    // status defaults to 'draft' for editors
  })
});

// Editor edits content
await fetch(`/api/news/${draft.data.id}`, {
  method: 'PUT',
  body: JSON.stringify({
    title: 'Updated Title',
    content: 'Updated content...'
    // Cannot change status - will be ignored
  })
});

// Manager/Admin publishes
await fetch(`/api/news/${draft.data.id}`, {
  method: 'PUT',
  body: JSON.stringify({
    status: 'published'
  })
});
```

This completes the News API documentation with comprehensive RBAC, testing, and security features! 🚀