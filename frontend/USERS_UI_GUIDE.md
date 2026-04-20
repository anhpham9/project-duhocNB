# 🧑‍💼 Users Management UI - Testing Guide

## ✅ **Tính năng hoàn chỉnh đã sẵn sàng!**

### 📱 **UI Components đã tạo:**
1. **[pages/admin/users.vue](frontend/pages/admin/users.vue)** - Complete users management UI
2. **[composables/useUsersAPI.js](frontend/composables/useUsersAPI.js)** - API integration composable

---

## 🚀 **Cách test UI:**

### **1. Khởi động Backend:**
```bash
cd backend
npm run dev
# Server chạy tại: http://localhost:5000
```

### **2. Khởi động Frontend:**
```bash
cd frontend  
npm run dev
# App chạy tại: http://localhost:3000
```

### **3. Truy cập Users Management:**
```
http://localhost:3000/admin/users
```

---

## 🔐 **Test với các Role khác nhau:**

### **Superadmin (Full Access):**
```
Username: superadmin
Password: 123456
→ Có thể: Xem tất cả users, Tạo/Sửa/Xóa users với bất kỳ role nào
```

### **Admin (Limited Access):**
```
Username: admin  
Password: 123456
→ Có thể: Tạo Manager/Editor/Consultant, Không thể tạo Superadmin/Admin
```

### **Manager (More Limited):**
```
Username: manager
Password: 123456  
→ Có thể: Tạo Editor/Consultant, Không thể tạo Superadmin/Admin/Manager
```

### **Editor/Consultant (No Access):**
```
Username: editor hoặc consultant
Password: 123456
→ Bị chặn bởi middleware, redirect về /admin
```

---

## 🎯 **Features cần test:**

### **📊 Stats Cards:**
- ✅ Hiển thị số lượng users theo từng role
- ✅ Tự động cập nhật khi thay đổi data
- ✅ Màu sắc phân biệt theo role

### **📋 Users Table:**
- ✅ Danh sách users với thông tin đầy đủ
- ✅ Role badges với màu sắc khác nhau
- ✅ Avatar icons theo role
- ✅ Formatted date display
- ✅ Hover effects

### **➕ Create User:**
- ✅ Modal form với validation
- ✅ Dropdown roles (chỉ hiển thị roles được phép)
- ✅ Required field validation
- ✅ Username/Email uniqueness check
- ✅ Password hashing automatic
- ✅ Success/Error notifications

### **✏️ Edit User:**
- ✅ Pre-fill form với data hiện tại
- ✅ Update từng field riêng biệt
- ✅ Role change với permission check
- ✅ Username/Email duplicate check

### **🗑️ Delete User:**
- ✅ Confirmation modal
- ✅ Warning message
- ✅ Cannot delete own account
- ✅ Permission check before delete

### **🔄 Loading States:**
- ✅ Loading spinner khi fetch data
- ✅ Button disabled during operations
- ✅ Loading text trong buttons

### **⚠️ Error Handling:**
- ✅ Network error display
- ✅ API error messages
- ✅ Retry functionality
- ✅ Toast notifications

### **📱 Responsive Design:**
- ✅ Mobile-friendly layout
- ✅ Touch-friendly buttons
- ✅ Responsive table
- ✅ Modal adaptation

---

## 🧪 **Test Scenarios:**

### **Scenario 1: Happy Path (Admin role)**
1. Login với admin account
2. Xem danh sách users → Should show filtered list
3. Click "Thêm người dùng" → Modal opens
4. Fill form với role "Consultant" → Should work
5. Submit → Success notification + table refresh

### **Scenario 2: Permission Restriction (Admin)**
1. Try tạo user với role "Superadmin" 
2. Submit → Should see error: "Access denied. You cannot create users with role ID 1"

### **Scenario 3: Manager Role**
1. Login với manager account
2. Try tạo user với role "Admin"
3. Should not see Admin option trong dropdown

### **Scenario 4: Validation Errors**
1. Try tạo user với username đã tồn tại
2. Should see error: "Username already exists"
3. Try với email đã tồn tại
4. Should see error: "Email already exists"

### **Scenario 5: Self-Protection**
1. Try xóa chính account đang login
2. Should see error: "Cannot delete your own account"

---

## 🔍 **Expected API Calls:**

```javascript
// Page load
GET /api/users → Fetch users list
GET /api/users/roles → Fetch assignable roles

// Create user  
POST /api/users
Body: { name, username, email, password, role_id }

// Update user
PUT /api/users/:id
Body: { name, username, email, role_id }

// Delete user
DELETE /api/users/:id
```

---

## 🚨 **Common Issues & Solutions:**

### **Issue: "Failed to fetch"**
**Solution:** Đảm bảo backend server đang chạy port 5000

### **Issue: "401 Unauthorized"**
**Solution:** Check JWT token trong localStorage, thử login lại

### **Issue: "403 Forbidden"**  
**Solution:** Role hiện tại không có permission, expected behavior

### **Issue: "CORS Error"**
**Solution:** Đảm bảo backend có CORS config đúng

### **Issue: Empty users list**
**Solution:** Run seed scripts để tạo test users:
```bash
cd backend
node scripts/seeds/seedRoles.js
node scripts/seeds/seedUsers.js
```

---

## 💡 **UI Features:**

- **Modern Design:** Card-based layout, subtle shadows, smooth transitions
- **Color Coding:** Mỗi role có màu sắc riêng biệt
- **Interactive Elements:** Hover effects, loading states, animations
- **Accessibility:** Proper form labels, keyboard navigation
- **Mobile Optimized:** Responsive breakpoints, touch-friendly
- **User Experience:** Toast notifications, confirmations, error states

**🎉 Users Management UI hoàn toàn sẵn sàng để sử dụng!** 🚀