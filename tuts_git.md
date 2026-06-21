
## Git branch

### Cách đặt tên

```
feature/auth (backend)
feature/news-api (backend)

feature/frontend-init (frontend)
feature/frontend-news

```

### Cách đẩy code lên repo và merge vào develop

```
git checkout develop
git merge feature/auth
git push origin develop
git checkout -b feature/frontend-init
git add .
git commit -m "Update .env file and db config"
git push origin feature/frontend-init
git checkout develop

```

## danh sách branch

```
# thay đổi cách quản lý và phân quyền.
# dùng roles.code thay vì roles.name, tương tự với permissions
# dùng roles.code để kiểm tra quyền, thay vì roles.id như trước đó
feature/rbac-code-refactor
feature/upload-cloudinary

# backend
feature/init-backend
feature/auth
feature/backend-seeds
feature/auth-middleware-backend
feature/rbac-backend
feature/users-crud-rbac
feature/news-backend
feature/users-security
feature/contacts-crud
feature/news-crud
feature/schools-crud
feature/faqs-crud


# frontend
feature/frontend-init
feature/frontend-auth
feature/frontend-rbac
feature/frontend-layouts
fix/frontend-rbac
feature/frontend-auth-rbac
feature/frontend-users-admin
fix/frontend-users-admin
feature/frontend-contacts-admin
feature/frontend-news-admin
feature/frontend-schools-admin
feature/frontend-contents-admin
feature/frontend-settings-admin
feature/frontend-contact-public
feature/frontend-news-public
feature/frontend-settings-public



```
## Các tình huống đặc biệt

### 🎯 Tình trạng 1

```
feature/frontend-init (đang đứng)
→ đã sửa:
   ✔ frontend
   ✔ backend
→ chưa commit
```

#### ✅ Cách làm CHUẨN & AN TOÀN

🔹 Bước 1 — Commit tất cả hiện tại

```
git add .
git commit -m "temp: working on frontend + backend fix"
```

👉 lúc này:

```
code của bạn đã được lưu an toàn ✅
```

🔹 Bước 2 — Tạo branch fix từ commit hiện tại

👉 bạn đang ở feature/frontend-init

```
git checkout -b fix/backend-env
```

👉 lúc này branch mới chứa:

```
✔ backend fix
✔ frontend code (tạm thời)
```

🔹 Bước 3 — Chỉ giữ backend, bỏ frontend

👉 dùng:

```
git restore --source=develop frontend/
```

👉 kết quả:

```
fix/backend-env
✔ chỉ còn backend fix
❌ frontend bị remove khỏi commit
```

🔹 Bước 4 — Commit lại

```
git add .
git commit -m "fix: load env before db connection"
```

🔹 Bước 5 — Push & merge

```
git push origin fix/backend-env
```

→ merge vào develop

🔹 Bước 6 — Quay lại frontend

```
git checkout feature/frontend-init
git pull origin develop
```

👉 lúc này:

```
✔ frontend vẫn còn nguyên
✔ backend fix đã có từ develop
```

🎯 KẾT QUẢ

```
develop
 ├── fix/backend-env ✅
 └── feature/frontend-init (clean)
```

🔹 Bước 7 — chỉnh sửa code frontend (nếu có ) sau đó push lên repo và merge với develop

```
git add .
git commit -m "feat: add login page UI and connect to auth API"
git push origin feature/frontend-init
git checkout develop
git merge feature/auth
git push origin develop
```