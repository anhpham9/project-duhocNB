# Permission Guard System - Hướng dẫn sử dụng

## 🔧 Tổng quan

Hệ thống Permission Guard giúp bạn dễ dàng quản lý quyền truy cập cho các trang admin mà **không cần duplicate code**. Bao gồm:

- **`usePermissionGuard`** - Composable xử lý logic permission
- **`PermissionGuard`** - Component wrapper với UI states
- **Predefined roles** - Các bộ quyền được định nghĩa sẵn

## 📁 Cấu trúc Files

```
composables/
  └── usePermissionGuard.js          # Core logic
components/admin/
  └── PermissionGuard.vue            # UI wrapper component  
pages/admin/
  ├── contacts.vue                   # Ví dụ sử dụng
  └── users.vue                      # Ví dụ sử dụng
```

## 🎯 Cách sử dụng

### 1. Sử dụng PermissionGuard Component (Khuyến nghị)

```vue
<template>
  <PermissionGuard 
    :allowed-roles="[1, 2, 4]"
    :show-user-info="true"
    denied-title="Không thể truy cập"
    denied-message="Bạn không có quyền."
  >
    <template #default="{ user, userRole }">
      <!-- Nội dung trang của bạn -->
      <h1>Trang Admin</h1>
      <p>User: {{ user.username }}</p>
      <p>Role: {{ userRole }}</p>
    </template>
  </PermissionGuard>
</template>

<script setup>
definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
  ssr: false
})
</script>
```

### 2. Sử dụng Predefined Permissions

```vue
<script setup>
import { ADMIN_PERMISSIONS } from '~/composables/usePermissionGuard'

// Thay vì hardcode [1, 2]
// Dùng ADMIN_PERMISSIONS.ADMIN_MANAGER
</script>

<template>
  <PermissionGuard :allowed-roles="ADMIN_PERMISSIONS.ADMIN_MANAGER">
    <!-- Content -->
  </PermissionGuard>
</template>
```

### 3. Sử dụng trực tiếp Composable (Nâng cao)

```vue
<script setup>
const {
  isCheckingPermission,
  hasPermission, 
  currentUser,
  getUserInfo
} = usePermissionGuard([1, 2, 4])

// Tự handle UI states
</script>
```

## 🛡️ Predefined Permission Sets

| Permission Set | Role IDs | Mô tả |
|---------------|----------|--------|
| `SUPERADMIN_ONLY` | `[1]` | Chỉ Superadmin |
| `ADMIN_MANAGER` | `[1, 2]` | Superadmin + Admin/Manager |
| `CONTENT_EDITORS` | `[1, 2, 3]` | Superadmin + Admin + Editor |
| `CONTACT_HANDLERS` | `[1, 2, 4]` | Superadmin + Admin + Consultant |
| `ALL_ROLES` | `[1, 2, 3, 4, 5]` | Tất cả roles |

## ⚙️ Props của PermissionGuard

| Prop | Type | Default | Mô tả |
|------|------|---------|--------|
| `allowedRoles` | `Array` | `[]` | **Required** - Danh sách role IDs được phép |
| `redirectTo` | `String` | `'/admin'` | Trang redirect khi không có quyền |
| `redirectDelay` | `Number` | `2000` | Delay (ms) trước khi redirect |
| `autoRedirect` | `Boolean` | `true` | Tự động redirect hay không |
| `showUserInfo` | `Boolean` | `false` | Hiển thị banner thông tin user |
| `deniedTitle` | `String` | `'Truy cập bị từ chối'` | Title khi không có quyền |
| `deniedMessage` | `String` | `'Bạn không có quyền...'` | Message khi không có quyền |
| `loadingMessage` | `String` | `'Kiểm tra quyền...'` | Message loading |

## 🎨 Slot Template Data

Template slot `#default` nhận các props:

```vue
<template #default="{ user, userRole }">
  <!-- user: { id, username, role_id, role_name } -->
  <!-- userRole: string (e.g., "Superadmin") -->
</template>
```

## 📋 Role Mapping

| Role ID | Role Name | Quyền truy cập |
|---------|-----------|----------------|
| 1 | Superadmin | Tất cả |
| 2 | Admin/Manager | Users, Contacts, Content, Settings |
| 3 | Editor | Schools, News, Content |
| 4 | Consultant | Contacts |
| 5 | User | Tùy theo định nghĩa |

## ✨ Tính năng

### ✅ Ưu điểm
- 🚫 **No duplicate code** - Tái sử dụng logic cho tất cả trang admin
- 🔄 **Consistent UX** - UI states thống nhất (loading, denied, success)
- 🎛️ **Highly configurable** - Tùy chỉnh messages, delays, behaviors
- 🔒 **Multi-layer security** - Kết hợp với middleware protection
- 📱 **Responsive design** - UI responsive cho mobile
- 🔍 **Debug friendly** - Console logs và error details

### 🛡️ Security Layers
1. **Middleware level** - Route protection (primary)
2. **Component level** - Permission Guard (secondary) 
3. **UI level** - Sidebar hiding (UX)

## 🔧 Customization Examples

### Trang chỉ cho Superadmin
```vue
<PermissionGuard :allowed-roles="ADMIN_PERMISSIONS.SUPERADMIN_ONLY">
  <h1>Superadmin Only Page</h1>
</PermissionGuard>
```

### Trang cho Content Editors với custom message
```vue
<PermissionGuard 
  :allowed-roles="ADMIN_PERMISSIONS.CONTENT_EDITORS"
  denied-title="Không thể chỉnh sửa nội dung"
  denied-message="Chỉ Editor và Admin mới có thể chỉnh sửa nội dung."
  :show-user-info="true"
>
  <ContentEditor />
</PermissionGuard>
```

### Tắt auto-redirect
```vue
<PermissionGuard 
  :allowed-roles="[1, 2]"
  :auto-redirect="false"
>
  <!-- User sẽ thấy access denied nhưng không bị redirect -->
</PermissionGuard>
```

## 🚨 Lưu ý quan trọng

1. **Luôn kết hợp với middleware** - PermissionGuard chỉ là lớp bảo vệ thứ 2
2. **Đồng bộ permissions** - Đảm bảo sidebar và page permissions khớp nhau
3. **Test permissions** - Test với các roles khác nhau
4. **Handle edge cases** - Xử lý token hết hạn, không hợp lệ, etc.

## 📝 Best Practices

### ✅ Nên làm
```vue
<!-- Sử dụng predefined permissions -->
<PermissionGuard :allowed-roles="ADMIN_PERMISSIONS.ADMIN_MANAGER">

<!-- Middleware bảo vệ -->
definePageMeta({
  middleware: ["auth", "permission"]
})
```

### ❌ Không nên
```vue
<!-- Hardcode role IDs khắp nơi -->
<PermissionGuard :allowed-roles="[1, 2, 3, 4]">

<!-- Quên middleware -->
definePageMeta({
  layout: "admin" // Thiếu middleware!
})
```

---

💡 **Mẹo**: Sử dụng `ADMIN_PERMISSIONS` constants thay vì hardcode role IDs để dễ maintain và tránh lỗi typo!