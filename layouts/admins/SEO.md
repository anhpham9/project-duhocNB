## 🎯 Tư duy thiết kế SEO DB

Bạn có 2 loại:

1. SEO cho trang tĩnh
- trang chủ
- giới thiệu
- liên hệ

👉 nên có form nhập SEO riêng:
```
Title
Meta description
Meta keywords
```

Bảng SEO cho page tĩnh
```
pages:
- slug (home, about, contact...)
- seo_title
- seo_description
- seo_keywords
```

2. SEO cho nội dung động
- bài viết
- trường học
- danh mục

👉 SEO sẽ lấy từ database:
```
title = tên bài viết / tên trường
description = mô tả ngắn
```

Bài viết / trường

```
posts:
- title
- slug
- seo_title (optional)
- seo_description
```

#### 💡 Pro tip (rất quan trọng)

**Nếu không nhập SEO riêng**

👉 fallback:
```
seo_title = title bài viết
seo_description = excerpt
```

### 👉 Mỗi trang = 1 bộ SEO riêng

|Trang	|Title	|Mô tả	|Keyword|
|--|--|--|--|
|Trang chủ	|Du học Nhật Bản uy tín	|Tư vấn du học Nhật	|du học nhật|
|Giới thiệu	|Giới thiệu công ty	|Thông tin về chúng tôi	|công ty du học|
|Danh sách trường	|Trường Nhật ngữ tại Tokyo	|Danh sách trường Nhật	|trường nhật|
|Chi tiết trường	|Trường ABC Tokyo	|Học phí, điều kiện	|trường ABC|
|Tin tức	|Tin tức du học Nhật	|Cập nhật mới nhất	|tin du học|
|Chi tiết tin	|Học bổng 2026	|Thông tin học bổng	|học bổng nhật|

👉 Mỗi trang target keyword khác nhau

## ✅ Cấu trúc DB chuẩn (khuyên dùng)

### 🧩 1. Bảng seo_meta (trung tâm)

👉 Dùng chung cho toàn hệ thống

```
# SQL
CREATE TABLE seo_meta (
  id INT PRIMARY KEY AUTO_INCREMENT,
  ref_type VARCHAR(50),   -- 'page', 'post', 'school'
  ref_id INT,             -- id của object
  slug VARCHAR(255),      -- dùng cho page tĩnh
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  og_title VARCHAR(255),
  og_description TEXT,
  og_image VARCHAR(255),
  canonical_url VARCHAR(255),
  robots VARCHAR(50),     -- index, noindex
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

### 🎯 Ý nghĩa

|field	|ý nghĩa|
|--|--|
|ref_type	|loại (page, post, school)|
|ref_id	|id bài viết|
|slug	|dùng cho page tĩnh|
|meta_*	|SEO Google|
|og_*	|share Facebook|
|canonical_url	|chống duplicate|
|robots	|index/noindex|

### 🧩 2. Trang tĩnh (pages)

```
# SQL
CREATE TABLE pages (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  slug VARCHAR(255),
  content TEXT
);
```
👉 SEO map qua:
```
seo_meta.slug = pages.slug
ref_type = 'page'
```
### 🧩 3. Bài viết (posts)

```
# SQL
CREATE TABLE posts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  title VARCHAR(255),
  slug VARCHAR(255),
  content TEXT,
  excerpt TEXT,
  created_at TIMESTAMP
);
```
👉 SEO:
```
seo_meta.ref_type = 'post'
seo_meta.ref_id = posts.id
```

### 🧩 4. Trường học (schools)

```
# SQL
CREATE TABLE schools (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255),
  slug VARCHAR(255),
  description TEXT
);
```
👉 SEO:
```
ref_type = 'school'
ref_id = schools.id
```

## 🚀 Cách dùng trong Node.js

Ví dụ lấy SEO cho bài viết:
```
# Javascript
const seo = await db('seo_meta')
  .where({
    ref_type: 'post',
    ref_id: post.id
  })
  .first();
```

Fallback nếu không có SEO

```
# Javascript
const metaTitle = seo?.meta_title || post.title;
const metaDesc = seo?.meta_description || post.excerpt;
```

### 🔥 Ưu điểm cấu trúc này

- ✔️ Dùng chung cho toàn hệ thống
- ✔️ Không duplicate cột SEO ở nhiều bảng
- ✔️ Dễ mở rộng (category, tag, landing page)
- ✔️ Chuẩn như CMS (WordPress, Strapi)