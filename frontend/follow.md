# Ngày 1 (nối tiếp ngày 3 backend)

## 🎯 PHẦN 1 — Tạo project Nuxt

```
duhocNB> npx nuxi init frontend
Need to install the following packages:
nuxi@3.34.0
Ok to proceed? (y) y


        .d$b.
       i$$A$$L  .d$b
     .$$F` `$$L.$$A$$.
    j$$'    `4$$:` `$$.
   j$$'     .4$:    `$$.
  j$$`     .$$:      `4$L
 :$$:____.d$$:  _____.:$$:
 `4$$$$$$$$P` .i$$$$$$$$P`

┌  Welcome to Nuxt!
│
◇  Templates loaded
│
◇  Which template would you like to use?
│  minimal – Minimal setup for Nuxt 4
│
◇  Creating project in frontend
│
◇  The directory frontend already exists. What would you like to do?
│  Override its contents
│
◇  Downloaded minimal template
│
◇  Which package manager would you like to use?
│  npm
│
◇  Initialize git repository?
│  No
│
◇  Dependencies installed
│
◇  Would you like to browse and install modules?
│  No
│
└  ✨ Nuxt project has been created with the minimal template.

╭── 👉 Next steps ───╮
│                    │
│   › cd frontend    │
│   › npm run dev    │
│                    │
╰────────────────────╯
```

### 📁 Cấu trúc sau khi tạo

```
duhocNB/
  ├── backend/
  └── frontend/
```

## 🎯 PHẦN 2 — Chạy frontend


```BASH
npm run dev
```

👉 mở:

```
http://localhost:3000
```

## 🎯 PHẦN 3 — Cấu hình gọi API backend

### 🧱 Tạo config

📁 nuxt.config.ts

```
// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },
  runtimeConfig: {
    public: {
      apiBase: "http://localhost:5000/api"
    }
  }
})
```

## 🎯 PHẦN 4 — Tạo page login

📁 pages/login.vue

```
<template>
    <div>
        <h2>Login</h2>

        <input v-model="username" placeholder="Username" />
        <br /><br />

        <input v-model="password" type="password" placeholder="Password" />
        <br /><br />

        <button @click="handleLogin">Login</button>
    </div>
</template>

<script setup>
const config = useRuntimeConfig();

const username = ref("");
const password = ref("");

const handleLogin = async () => {
    try {
        const res = await $fetch(`${config.public.apiBase}/auth/login`, {
            method: "POST",
            body: {
                username: username.value,
                password: password.value
            }
        });

        localStorage.setItem("token", res.token);

        alert("Login success!");
    } catch (err) {
        alert("Login failed");
    }
};
</script>
```

## 🎯 PHẦN 5 — Tạo app.vue

Kiểm tra xem, nếu mặc định Nuxt đang dùng 📁 app/app.vue, thì xóa đi.

tạo app.vue trực tiếp trong thư mục 📁frontend

```
<template>
    <NuxtPage />
</template>
```

## 🎯 PHẦN 6 — Test thực tế

👉 Backend chạy:

```
# npm run dev
http://localhost:5000
```

👉 Frontend:

```
# npm run dev
http://localhost:3000/login
```

## 🎯 Flow sẽ như sau

```
Frontend (Nuxt)
   ↓
POST /api/auth/login
   ↓
Backend trả JWT
   ↓
Frontend lưu localStorage
```

# Ngày 2 (nối tiếp ngày 4 backend)

## 🧱 PHẦN 3 — Frontend: Auth flow

### 🧱 Update login

📁 pages/login.vue

```
localStorage.setItem("token", res.token);
navigateTo("/admin");
```

### 🧱 Tạo page admin

📁 pages/admin/index.vue

```
<template>
    <h1>Admin Dashboard</h1>
</template>
```

### 🧱 Gửi token mỗi request

📁 composables/useApi.js

```
export const useApi = (url, options = {}) => {
    const token = localStorage.getItem("token");

    return $fetch(url, {
        ...options,
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
};
```

## 🧱 PHẦN 4 — Frontend: Route Middleware

### 🧱 Middleware

📁 middleware/auth.ts

```
export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return;

    // 👇 CHẶN LOGIN PAGE
    if (to.path === "/login") return;

    const token = localStorage.getItem("token");

    if (!token) {
        return navigateTo("/login");
    }
});
```

### 🧱 Apply vào các page cần auth

```
<script setup>
definePageMeta({
  middleware: "auth",
});
</script>
```

### 🎯 Sau bước này bạn sẽ có

```
✔ Login
✔ JWT
✔ Protected API
✔ RBAC backend
✔ Protected frontend route
```

## 🧱 PHẦN 5 — Frontend: RBAC

### 🧱 2. Decode token (lấy role)

👉 cài lib:

```
npm install jwt-decode
```

📁 utils/auth.js

```
import { jwtDecode } from "jwt-decode";

export const getUser = () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  return jwtDecode(token);
};
```

### 🧱 3. Ẩn menu theo role

📁 layouts/admin.vue

```
<script setup>
import { getUser } from "~/utils/auth";

const user = getUser();
</script>

<template>
  <div class="admin-layout">
    <aside>
      <ul>
        <li v-if="user?.role_id === 1">User Management</li>
        <li>News</li>
        <li v-if="user?.role_id !== 5">Settings</li>
      </ul>
    </aside>

    <slot />
  </div>
</template>
```

### 🧱 4. Middleware kiểm tra quyền

📁 types/user.ts

```
export interface IUser {
  id: number;
  role_id: number;
}
```

📁 middleware/permission.ts

```
import { jwtDecode } from "jwt-decode";
import type { IUser } from "~/types/user";

export default defineNuxtRouteMiddleware((to) => {
    if (import.meta.server) return;

    // 👇 CHẶN LOGIN PAGE
    if (to.path === "/login") return;

    const token = localStorage.getItem("token");

    if (!token) return navigateTo("/login");

    let user: IUser;

    try {
        user = jwtDecode(token) as IUser;
    } catch {
        return navigateTo("/login");
    }

    if (to.path.startsWith("/admin/users") && user.role_id !== 1) {
        return navigateTo("/admin");
    }
});
```

### 🧱 5. Apply vào page

📁 pages/admin/users.vue

```
<script setup>
definePageMeta({
  middleware: ["auth", "permission"],
});
</script>
```

### 🎯 Flow hoàn chỉnh

```
Frontend → gửi token
Backend → authenticate
         → checkPermission
         → cho / chặn

Frontend:
✔ ẩn menu
✔ chặn route
```

# Ngày 3

## 🎯 1. Tư duy tổng thể (rất quan trọng)

Có 3 loại UI:

```
1. Public site (index, about, schools, news...)
2. Login (riêng biệt)
3. Admin (dashboard, users...)
```

👉 tương ứng với 3 layout

## 🧱 2. Cấu trúc thư mục chuẩn

```
frontend/
├── layouts/
│   ├── default.vue      ← giao diện public
│   ├── admin.vue        ← giao diện admin
│   └── empty.vue        ← login
│
├── pages/
│   ├── index.vue
│   ├── about.vue
│   ├── login.vue
│   └── admin/
│       ├── index.vue
│       ├── users.vue
│       └── schools.vue
│
├── assets/
│   ├── css/
│   │   └── main.css
│   └── js/
│       └── main.js
```

## 🎨 3. Thêm CSS global

### 🧱 Bước 1 — tạo file

📁 assets/css/main.css

```
body {
  font-family: Arial, sans-serif;
}

.container {
  max-width: 1200px;
  margin: auto;
}

```

### 🧱 Bước 2 — import vào config

📁 nuxt.config.ts

```
export default defineNuxtConfig({
  css: ["~/assets/css/main.css"],
});
```

### 🧱 Bước 3 — CSS cho từng layout

🟢 Layout PUBLIC

📁 layouts/default.vue

```
<script setup>
import "~/assets/css/public.css";
</script>

<template>
  <div class="public-layout">
    <header>Header</header>
    <slot />
  </div>
</template>
```

## ⚡ 4. Thêm JS global

### 🧱 Cách 1 (khuyên dùng trong Nuxt)

👉 KHÔNG dùng `<script>` như `HTML`

👉 dùng plugin

📁 plugins/main.js

```
export default defineNuxtPlugin(() => {
  console.log("Global JS loaded");
});

```

### 🧱 Cách 2 (nếu là script ngoài)


```
export default defineNuxtConfig({
  app: {
    head: {
      script: [
        {
          src: "/js/custom.js",
          defer: true,
        },
      ],
    },
  },
});
```

## 🧱 5. Layout PUBLIC (default)

📁 layouts/default.vue

```
<template>
  <div>
    <header>Header Public</header>

    <main>
      <slot />
    </main>

    <footer>Footer</footer>
  </div>
</template>
```

👉 các page:

```
index.vue
about.vue
schools.vue
news.vue
```

👉 tự động dùng layout này

## 🧱 6. Layout LOGIN (riêng)

📁 layouts/empty.vue

```
<template>
  <div>
    <slot />
  </div>
</template>
```

📁 pages/login.vue

```
<script setup>
definePageMeta({
  layout: "empty",
});
</script>

<template>
  <h2>Login</h2>
</template>
```

## 🧱 7. Layout ADMIN

📁 layouts/admin.vue

```
<template>
  <div class="admin-layout">
    <aside>Sidebar</aside>

    <div class="content">
      <header>Admin Header</header>

      <main>
        <slot />
      </main>
    </div>
  </div>
</template>
```

📁 pages/admin/index.vue

```
<script setup>
definePageMeta({
  layout: "admin",
  middleware: "auth",
});
</script>

<template>
  <h1>Dashboard</h1>
</template>
```

👉 các page admin khác cũng tương tự:

```
admin/users.vue
admin/schools.vue
```

# Ngày 4 (Nối tiếp ngày 4 backend)

## Thêm xử lý RBAC cho frontend

📁 composables/usePermissionGuard.js

```
import { ref, onMounted, computed, readonly, nextTick } from "vue"
import { jwtDecode } from "jwt-decode"

/**
 * Composable for handling permission checks in admin pages
 * @param {Array} allowedRoles - Array of role IDs that can access this page
 * @param {Object} options - Additional options
 * @returns {Object} - Permission state and methods
 */
export const usePermissionGuard = (allowedRoles = [], options = {}) => {
    const {
        redirectTo = '/admin',
        redirectDelay = 2000,
        autoRedirect = true
    } = options

    const isCheckingPermission = ref(true)
    const hasPermission = ref(false)
    const currentUser = ref(null)
    const permissionError = ref(null)

    // Role mapping for display
    const roleMap = {
        1: 'Superadmin',     // Toàn quyền
        2: 'Admin',          // Admin (toàn quyền trừ tạo tài khoản admin + super admin)
        3: 'Manager',        // Quản lý
        4: 'Editor',         // Biên tập nội dung
        5: 'Consultant'      // Tư vấn
    }

    const checkPermissions = async () => {
        if (!process.client) {
            isCheckingPermission.value = false
            return
        }
        
        try {
            const token = localStorage.getItem('token')
            
            if (!token) {
                console.warn('🚫 No token found, redirecting to login')
                await navigateTo('/login')
                return
            }

            // Decode JWT token
            const user = jwtDecode(token)
            currentUser.value = user
            
            // Check permissions
            hasPermission.value = allowedRoles.includes(user.role_id)
            
            if (!hasPermission.value) {
                console.warn(`🚫 User role ${user.role_id} not allowed. Required roles: [${allowedRoles.join(', ')}]`)
                permissionError.value = {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'Bạn không có quyền truy cập trang này.',
                    userRole: user.role_id,
                    requiredRoles: allowedRoles
                }

                if (autoRedirect) {
                    setTimeout(async () => {
                        await navigateTo(redirectTo)
                    }, redirectDelay)
                }
            } else {
                console.log(`✅ Permission granted for role ${user.role_id}`)
            }
            
        } catch (error) {
            console.error('❌ Permission check error:', error)
            permissionError.value = {
                code: 'TOKEN_ERROR',
                message: 'Lỗi xác thực. Vui lòng đăng nhập lại.',
                error: error.message
            }
            
            if (autoRedirect) {
                setTimeout(async () => {
                    await navigateTo('/login')
                }, redirectDelay)
            }
        } finally {
            isCheckingPermission.value = false
        }
    }

    const getUserRoleName = () => {
        if (!currentUser.value) return 'Unknown'
        return roleMap[currentUser.value.role_id] || `Role ${currentUser.value.role_id}`
    }

    const getUserInfo = () => {
        if (!currentUser.value) return null
        return {
            id: currentUser.value.id,
            username: currentUser.value.username,
            role_id: currentUser.value.role_id,
            role_name: getUserRoleName()
        }
    }

    const retryPermissionCheck = () => {
        isCheckingPermission.value = true
        hasPermission.value = false
        permissionError.value = null
        checkPermissions()
    }

    // Auto-check permissions on mount
    onMounted(() => {
        checkPermissions()
    })

    return {
        // States
        isCheckingPermission: readonly(isCheckingPermission),
        hasPermission: readonly(hasPermission),
        currentUser: readonly(currentUser),
        permissionError: readonly(permissionError),
        
        // Methods
        checkPermissions,
        getUserRoleName,
        getUserInfo,
        retryPermissionCheck
    }
}

// Predefined permission sets for common admin pages
export const ADMIN_PERMISSIONS = {
    SUPERADMIN_ONLY: [1],              // Chỉ Superadmin
    ADMIN_LEVEL: [1, 2],               // Superadmin + Admin
    MANAGEMENT_LEVEL: [1, 2, 3],       // Superadmin + Admin + Manager
    CONTENT_EDITORS: [1, 2, 3, 4],     // Superadmin + Admin + Manager + Editor
    CONTACT_HANDLERS: [1, 2, 3, 5],    // Superadmin + Admin + Manager + Consultant
    ALL_ROLES: [1, 2, 3, 4, 5]         // Tất cả roles
}
```

📁 components/admin/PermissionGuard.vue

```
<template>
    <div class="permission-guard">
        <!-- Loading state while checking permissions -->
        <div v-if="isCheckingPermission" class="loading-container">
            <div class="loading">
                <i class="fas fa-spinner fa-spin"></i>
                <p>{{ loadingMessage }}</p>
            </div>
        </div>

        <!-- Access denied -->
        <div v-else-if="!hasPermission" class="access-denied">
            <div class="denied-content">
                <i class="fas fa-ban"></i>
                <h2>{{ deniedTitle }}</h2>
                <p>{{ deniedMessage }}</p>

                <!-- Error details in development -->
                <div v-if="showErrorDetails && permissionError" class="error-details">
                    <details>
                        <summary>Chi tiết lỗi</summary>
                        <pre>{{ JSON.stringify(permissionError, null, 2) }}</pre>
                    </details>
                </div>

                <div class="denied-actions">
                    <button @click="handleBackClick" class="btn-back">
                        <i class="fas fa-arrow-left"></i>
                        {{ backButtonText }}
                    </button>

                    <button v-if="showRetry" @click="retryPermissionCheck" class="btn-retry">
                        <i class="fas fa-redo"></i>
                        Thử lại
                    </button>
                </div>
            </div>
        </div>

        <!-- Main content - only shown when permission granted -->
        <div v-else class="permission-granted">
            <!-- User info banner (optional) -->
            <div v-if="showUserInfo" class="user-info-banner">
                <small>
                    <i class="fas fa-user"></i>
                    Đăng nhập với quyền: <strong>{{ getUserRoleName() }}</strong>
                    <span v-if="currentUser"> - {{ currentUser.username }}</span>
                </small>
            </div>

            <!-- Slot for main content -->
            <slot :user="getUserInfo()" :userRole="getUserRoleName()"></slot>
        </div>
    </div>
</template>

<script setup>
// Import the composable and navigateTo
import { usePermissionGuard } from '~/composables/usePermissionGuard'

const props = defineProps({
    allowedRoles: {
        type: Array,
        required: true
    },
    redirectTo: {
        type: String,
        default: '/admin'
    },
    redirectDelay: {
        type: Number,
        default: 2000
    },
    autoRedirect: {
        type: Boolean,
        default: true
    },
    loadingMessage: {
        type: String,
        default: 'Kiểm tra quyền truy cập...'
    },
    deniedTitle: {
        type: String,
        default: 'Truy cập bị từ chối'
    },
    deniedMessage: {
        type: String,
        default: 'Bạn không có quyền truy cập trang này.'
    },
    backButtonText: {
        type: String,
        default: 'Quay lại Dashboard'
    },
    showUserInfo: {
        type: Boolean,
        default: false
    },
    showRetry: {
        type: Boolean,
        default: true
    },
    showErrorDetails: {
        type: Boolean,
        default: false // Set to true in development
    }
})

// Use the permission guard composable
const {
    isCheckingPermission,
    hasPermission,
    currentUser,
    permissionError,
    getUserRoleName,
    getUserInfo,
    retryPermissionCheck
} = usePermissionGuard(props.allowedRoles, {
    redirectTo: props.redirectTo,
    redirectDelay: props.redirectDelay,
    autoRedirect: props.autoRedirect
})

const handleBackClick = () => {
    navigateTo(props.redirectTo)
}

// Expose methods for parent components if needed
defineExpose({
    hasPermission,
    currentUser,
    getUserInfo,
    retryPermissionCheck
})
</script>
```
## Gắn xử lý RBAC cho Admin menu

📁 components/admin/AdminSidebar.vue

```
<template>
    <aside class="sidebar" id="sidebar" :class="{ collapsed: isCollapsed, active: isMobileOpen }">
        <div class="sidebar-header">
            <div class="sidebar-logo">
                <img src="/assets/images/admin/logo01.png" alt="Du Học NB" class="logo-img">
                <h3 class="logo-text">Du Học NB</h3>
            </div>
            <button class="sidebar-toggle" id="sidebarToggle" @click="handleSidebarToggle">
                <i class="fas fa-times"></i>
            </button>
        </div>

        <nav class="sidebar-nav">
            <ul class="nav-list">
                <li class="nav-item" :class="{ active: isActivePage('/admin') }">
                    <NuxtLink to="/admin" class="nav-link" @click="handleNavLinkClick">
                        <i class="fas fa-tachometer-alt"></i>
                        <span>Dashboard</span>
                    </NuxtLink>
                </li>
                <li v-if="canAccessUsers" class="nav-item" :class="{ active: isActivePage('/admin/users') }">
                    <NuxtLink to="/admin/users" class="nav-link" @click="handleNavLinkClick">
                        <i class="fas fa-users"></i>
                        <span>Người dùng</span>
                    </NuxtLink>
                </li>
                <li v-if="canAccessContacts" class="nav-item" :class="{ active: isActivePage('/admin/contacts') }">
                    <NuxtLink to="/admin/contacts" class="nav-link" @click="handleNavLinkClick">
                        <i class="fas fa-address-book"></i>
                        <span>Liên hệ</span>
                    </NuxtLink>
                </li>
                <li v-if="canAccessSchools" class="nav-item" :class="{ active: isActivePage('/admin/schools') }">
                    <NuxtLink to="/admin/schools" class="nav-link" @click="handleNavLinkClick">
                        <i class="fas fa-university"></i>
                        <span>Trường học</span>
                    </NuxtLink>
                </li>
                <li v-if="canAccessNews" class="nav-item has-submenu" :class="{ active: openSubmenus.includes('news') }">
                    <a href="#" class="nav-link" @click="toggleSubmenu('news')">
                        <i class="fas fa-newspaper"></i>
                        <span>Tin tức</span>
                        <i class="fas fa-chevron-down submenu-arrow" :class="{ 'rotated': openSubmenus.includes('news') }"></i>
                    </a>
                    <ul class="submenu" :class="{ 'open': openSubmenus.includes('news') }">
                        <li><NuxtLink to="/admin/news" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/news') }">Danh sách tin</NuxtLink></li>
                        <li><NuxtLink to="/admin/news/categories" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/news/categories') }">Danh mục</NuxtLink></li>
                    </ul>
                </li>
                <li v-if="canAccessContent" class="nav-item has-submenu" :class="{ active: openSubmenus.includes('content') }">
                    <a href="#" class="nav-link" @click="toggleSubmenu('content')">
                        <i class="fas fa-file-alt"></i>
                        <span>Nội dung</span>
                        <i class="fas fa-chevron-down submenu-arrow" :class="{ 'rotated': openSubmenus.includes('content') }"></i>
                    </a>
                    <ul class="submenu" :class="{ 'open': openSubmenus.includes('content') }">
                        <li><NuxtLink to="/admin/content/homepage" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/homepage') }">Trang chủ</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/about" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/about') }">Giới thiệu</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/schools" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/schools') }">Trường học</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/conditions" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/conditions') }">Điều kiện</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/news" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/news') }">Tin tức</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/contact" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/contact') }">Liên hệ</NuxtLink></li>
                        <li><NuxtLink to="/admin/content/faq" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/content/faq') }">FAQ</NuxtLink></li>
                    </ul>
                </li>
                <li v-if="canAccessSettings" class="nav-item has-submenu" :class="{ active: openSubmenus.includes('settings') }">
                    <a href="#" class="nav-link" @click="toggleSubmenu('settings')">
                        <i class="fas fa-cog"></i>
                        <span>Cài đặt</span>
                        <i class="fas fa-chevron-down submenu-arrow" :class="{ 'rotated': openSubmenus.includes('settings') }"></i>
                    </a>
                    <ul class="submenu" :class="{ 'open': openSubmenus.includes('settings') }">
                        <li><NuxtLink to="/admin/settings/general" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/settings/general') }">Chung</NuxtLink></li>
                        <li><NuxtLink to="/admin/settings/seo" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/settings/seo') }">SEO</NuxtLink></li>
                        <li><NuxtLink to="/admin/settings/backup" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/settings/backup') }">Sao lưu & Khôi phục</NuxtLink></li>
                    </ul>
                </li>
            </ul>
        </nav>

        <div class="sidebar-bottom">
            <button @click="handleLogout" class="logout-btn">
                <i class="fas fa-sign-out-alt"></i>
                <span>Đăng xuất</span>
            </button>
        </div>
    </aside>
</template>

<script setup>
// ========================================
// SIDEBAR NAVIGATION COMPONENT
// ========================================

import { jwtDecode } from "jwt-decode"

const route = useRoute()
const router = useRouter()

// ========================================
// REACTIVE STATE
// ========================================

const openSubmenus = ref([])
const isCollapsed = ref(false)
const isMobileOpen = ref(false)
const isMobile = ref(false)

// ========================================
// USER PERMISSIONS
// ========================================

// Get current user from JWT token
const currentUser = computed(() => {
    if (!process.client) return null
    
    const token = localStorage.getItem('token')
    if (!token) return null
    
    try {
        return jwtDecode(token)
    } catch (error) {
        console.error('Error decoding token:', error)
        return null
    }
})

// Permission checks based on role_id
const canAccessUsers = computed(() => {
    if (!currentUser.value) return false
    // Only Superadmin (1), Admin (2) and Manager (3) can access users
    return [1, 2, 3].includes(currentUser.value.role_id)
})

const canAccessContacts = computed(() => {
    if (!currentUser.value) return false
    // Superadmin (1), Admin (2), Manager (3), and Consultant (5) can access contacts
    return [1, 2, 3, 5].includes(currentUser.value.role_id)
})

const canAccessSchools = computed(() => {
    if (!currentUser.value) return false
    // Superadmin (1), Admin (2), Manager (3) can access schools
    return [1, 2, 3].includes(currentUser.value.role_id)
})

const canAccessNews = computed(() => {
    if (!currentUser.value) return false
    // Superadmin (1), Admin (2), Manager (3), and Editor (4) can access news
    return [1, 2, 3, 4].includes(currentUser.value.role_id)
})

const canAccessContent = computed(() => {
    if (!currentUser.value) return false
    // Superadmin (1), Admin (2), Manager (3) can access content
    return [1, 2, 3].includes(currentUser.value.role_id)
})

const canAccessSettings = computed(() => {
    if (!currentUser.value) return false
    // Only Superadmin (1) and Admin (2) can access settings
    return [1, 2].includes(currentUser.value.role_id)
})

// ========================================
// NAVIGATION HELPERS
// ========================================

const isActivePage = (path) => {
    if (path === '/admin') {
        return route.path === '/admin'
    }
    return route.path.startsWith(path)
}

const toggleSubmenu = (submenu) => {
    // Enhanced submenu logic: close other submenus when opening a new one
    if (openSubmenus.value.includes(submenu)) {
        openSubmenus.value = openSubmenus.value.filter(item => item !== submenu)
    } else {
        // Close all other submenus and open the selected one
        openSubmenus.value = [submenu]
    }
}

// Close all submenus
const closeAllSubmenus = () => {
    openSubmenus.value = []
}

// Check if current route belongs to any submenu
const getCurrentSubmenu = (path) => {
    if (path.startsWith('/admin/news')) return 'news'
    if (path.startsWith('/admin/content')) return 'content'
    if (path.startsWith('/admin/settings')) return 'settings'
    return null
}

// Check if a specific submenu item is active
const isSubmenuItemActive = (path) => {
    return route.path === path
}

// Auto-close sidebar and handle submenu logic
const handleNavLinkClick = () => {
    // Close all submenus when clicking on non-submenu nav items
    closeAllSubmenus()
    
    // Close mobile sidebar if needed
    if (isMobile.value && isMobileOpen.value) {
        // Delay to allow navigation to complete
        setTimeout(closeMobileSidebar, 100)
    }
}

// Handle submenu link clicks (keep submenu open)
const handleSubmenuLinkClick = () => {
    // Only close mobile sidebar, don't close submenu
    if (isMobile.value && isMobileOpen.value) {
        setTimeout(closeMobileSidebar, 100)
    }
}

// ========================================
// USER ACTIONS  
// ========================================

const handleLogout = () => {
    if (process.client) {
        localStorage.removeItem('token')
        
        // Show toast (if available globally)
        if (window.showToast) {
            window.showToast('Đang đăng xuất...', 'info')
        }
        
        setTimeout(() => {
            navigateTo('/login')
        }, 500)
    }
}

// ========================================
// SIDEBAR CONTROLS
// ========================================

const handleSidebarToggle = () => {
    if (isMobile.value) {
        // Mobile behavior: close sidebar
        closeMobileSidebar()
    } else {
        // Desktop behavior: toggle collapsed state
        isCollapsed.value = !isCollapsed.value
    }
}

const closeMobileSidebar = () => {
    isMobileOpen.value = false
    document.body.classList.remove('sidebar-open')
    // Restore page scroll when sidebar closes
    if (process.client) {
        document.body.style.overflow = ''
    }
}

const openMobileSidebar = () => {
    isMobileOpen.value = true
    document.body.classList.add('sidebar-open')
    // Prevent page scroll when mobile sidebar opens
    if (process.client) {
        document.body.style.overflow = 'hidden'
    }
}

// ========================================
// RESPONSIVE HANDLING
// ========================================

const handleResponsive = () => {
    const wasMobile = isMobile.value
    isMobile.value = process.client ? window.innerWidth <= 768 : false
    
    // If switching from mobile to desktop and sidebar is active, close sidebar
    if (wasMobile && !isMobile.value && isMobileOpen.value) {
        closeMobileSidebar()
    }
}

// ========================================
// LIFECYCLE & EVENT LISTENERS
// ========================================

onMounted(() => {
    // Initial responsive check
    handleResponsive()
    
    // Listen for window resize
    if (process.client) {
        window.addEventListener('resize', handleResponsive)
    }
    
    // Handle mobile overlay clicks from parent layout
    const mobileOverlay = document.getElementById('mobileOverlay')
    if (mobileOverlay) {
        mobileOverlay.addEventListener('click', closeMobileSidebar)
    }
    
    // Expose functions globally for mobile toggle button in header
    if (process.client) {
        window.sidebarControls = {
            openMobileSidebar,
            closeMobileSidebar,
            toggleCollapsed: () => isCollapsed.value = !isCollapsed.value
        }
    }
})

// ========================================
// ROUTE WATCHER FOR AUTO-CLOSE
// ========================================

// Watch route changes to auto-close mobile sidebar
watch(() => route.path, (newPath) => {
    // Close mobile sidebar on route change
    if (isMobile.value && isMobileOpen.value) {
        setTimeout(closeMobileSidebar, 150)
    }
    
    // Auto-manage submenus based on current route
    const currentSubmenu = getCurrentSubmenu(newPath)
    if (currentSubmenu) {
        // If navigating to a submenu area, open that submenu
        if (!openSubmenus.value.includes(currentSubmenu)) {
            openSubmenus.value = [currentSubmenu]
        }
    } else {
        // If navigating to non-submenu area, close all submenus
        closeAllSubmenus()
    }
})

onUnmounted(() => {
    // Clean up event listeners
    if (process.client) {
        window.removeEventListener('resize', handleResponsive)
        // Clean up global reference
        if (window.sidebarControls) {
            delete window.sidebarControls
        }
    }
})

// ========================================
// EXPOSE FUNCTIONS FOR PARENT COMPONENTS
// ========================================

defineExpose({
    openMobileSidebar,
    closeMobileSidebar,
    toggleCollapsed: () => isCollapsed.value = !isCollapsed.value,
    isCollapsed: readonly(isCollapsed),
    isMobileOpen: readonly(isMobileOpen)
})
</script>

<style scoped>
/* ========================================
   SUBMENU ANIMATIONS
   ======================================== */
/* .submenu-arrow {
    transition: transform 0.3s ease;
}

.submenu-arrow.rotated {
    transform: rotate(180deg);
} */

/* .submenu {
    display: none;
    opacity: 0;
    transform: translateY(-10px);
    transition: all 0.3s ease;
}

.submenu.open {
    display: block;
    opacity: 1;
    transform: translateY(0);
} */

/* ========================================
   SIDEBAR STATES
   ======================================== */
/* .sidebar {
    transition: all 0.3s ease;
}

.sidebar.collapsed {
    width: 70px;
} */
/* 
.sidebar.collapsed .logo-text,
.sidebar.collapsed .nav-link span {
    opacity: 0;
    width: 0;
    overflow: hidden;
}

.sidebar.collapsed .submenu {
    display: none !important;
} */

/* ========================================
   MOBILE RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
    /* .sidebar {
        transform: translateX(-100%);
        position: fixed;
        z-index: 1000;
    }
    
    .sidebar.active {
        transform: translateX(0);
    } */
}

/* ========================================
   SUBMENU ACTIVE STATES
   ======================================== */
/* .nav-item.has-submenu.active > .nav-link {
    background-color: rgba(255, 255, 255, 0.1);
}

.nav-item.active {
    background-color: rgba(255, 255, 255, 0.05);
} */
</style>
```

## Gắn xử lý RBAC cho các pages

📁 pages/admin/users.vue

```
<template>
    <PermissionGuard :allowed-roles="ADMIN_PERMISSIONS.MANAGEMENT_LEVEL" :show-user-info="false"
        denied-title="Không thể truy cập Quản lý Người dùng"
        denied-message="Chỉ Superadmin, Admin và Manager mới có thể quản lý người dùng.">
        <template #default="{ user }">
            <div class="users-page">
                <div class="page-header">
                    <h1>
                        <i class="fas fa-users"></i>
                        Quản lý Người dùng
                    </h1>
                    <p>Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
                </div>

                <div class="page-content">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-user-shield"></i>
                            <div>
                                <h3>Superadmin</h3>
                                <span>1 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-tie"></i>
                            <div>
                                <h3>Admin</h3>
                                <span>3 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-tie"></i>
                            <div>
                                <h3>Manager</h3>
                                <span>3 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-edit"></i>
                            <div>
                                <h3>Editor</h3>
                                <span>5 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-friends"></i>
                            <div>
                                <h3>Consultant</h3>
                                <span>2 người dùng</span>
                            </div>
                        </div>
                    </div>

                    <div class="placeholder-content">
                        <i class="fas fa-user-cog"></i>
                        <h3>Tính năng đang phát triển</h3>
                        <p>Giao diện quản lý người dùng sẽ có: Danh sách, Thêm/Sửa/Xóa, Phân quyền, v.v.</p>
                    </div>
                </div>
            </div>
        </template>
    </PermissionGuard>
</template>

<script setup>
// Import permission constants and PermissionGuard component
import { ADMIN_PERMISSIONS } from '~/composables/usePermissionGuard'
import PermissionGuard from '~/components/admin/PermissionGuard.vue'

definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>
```

# ABC

## Restore and Backup Feature

Đã làm xong backend end-to-end cho backup/restore để khớp với frontend trang backup.

**Đã triển khai**
1. Tạo bảng lịch sử backup (migration):
    create_backup_records_table.sql
2. Thêm service backup đầy đủ:
    backup.service.js

    - Tạo backup thủ công (json snapshot dữ liệu bảng public)
    - Upload backup file lên server
    - Download theo id
    - Restore từ file backup json
    - Lịch sử backup
    - Cấu hình auto backup daily
    - Cron chạy mỗi phút, đến đúng giờ thì chạy daily backup
    - Retention tự động xóa bản cũ, giữ tối đa 30 bản
3. Thêm controller backup:
    backup.controller.js
    - Role check cho Superadmin/Admin
    - Audit log cho create/upload/download/restore/config update
    - Xử lý lỗi chuẩn response
4. Mở rộng routes settings:
    settings.routes.js
    - GET /settings/backups/history
    - POST /settings/backups/create
    - POST /settings/backups/upload
    - GET /settings/backups/:id/download
    - POST /settings/backups/restore
    - GET /settings/backups/config
    - PUT /settings/backups/config
5. Bật scheduler khi app start:
    app.js
    - Gọi startBackupScheduler khi server listen
6. Tăng độ an toàn transaction restore:
    db.js
    - Thêm getClient để dùng transaction đúng connection
        backup.service.js
    - Restore dùng BEGIN/COMMIT/ROLLBACK trên cùng client
7. Cài dependency upload:
    package.json
    - Thêm multer
        package-lock.json
    - Lock dependency tương ứng


**Đã kiểm tra**

1. Kiểm tra lỗi file: không có lỗi ở các file backend mới/sửa.
2. Smoke-check import module backup service: thành công.

Việc bạn cần chạy để dùng ngay

1. Chạy migration:

```
psql -U <db_user> -d <db_name> -f create_backup_records_table.sql
```

2. Khởi động lại backend:
    npm run dev (trong thư mục backend)

**Lưu ý kỹ thuật*

1. Restore hiện hỗ trợ chuẩn backup json do hệ thống tạo.
2. Nếu upload file zip/sql/bak không đúng format json snapshot, endpoint restore sẽ trả lỗi định dạng không hỗ trợ. Upload vẫn lưu vào lịch sử bình thường.
3. Retention được ép cứng giữ 30 bản gần nhất theo yêu cầu.

**Response mẫu khi gọi endpoint**

```
{
  "success": true,
  "data": {
    "schedulerRunning": true,
    "startedAt": "2026-06-12T02:00:00.000Z",
    "lastRunAt": "2026-06-12T02:00:00.000Z",
    "lastRunStatus": "success",
    "lastRunBackupId": 5,
    "lastRunBackupName": "backup-auto-2026-06-12T02-00-00-000Z.json",
    "lastErrorMessage": null,
    "totalAutoRuns": 3,
    "config": { "enabled": true, "frequency": "daily", "runAt": "02:00", "retentionCount": 30 },
    "nextRunAt": "2026-06-13T02:00:00.000Z"
  }
}
```

Quyết định kiến trúc:

- Social links → Tách ra /admin/settings/social, unlimited entries với CRUD (icon, name, url, description, order) — cần thêm bảng DB
- Logo preview + upload, favicon upload, Google Maps → Giữ ở General Settings, thêm UI upload + preview tại chỗ
- Maintenance mode → Giữ ở General Settings (liên quan operational config, không liên quan backup/restore)
- SEO → Tách ra /admin/settings/seo — gom SEO fields + thêm OG image URL

# Mapping mới cho notification types:


```
'contact_submission'  → 📨 fas fa-envelope       // Liên hệ gửi
'backup_completed'    → ✅ fas fa-check-circle   // Backup xong
'account_locked'      → 🔒 fas fa-lock          // Tài khoản bị khóa
'settings_changed'    → ⚙️  fas fa-cog           // Cài đặt thay đổi
'news_published'      → 📰 fas fa-newspaper     // Tin tức phát hành
'school_updated'      → 🏫 fas fa-school        // Trường học cập nhật
'user_registered'     → 👤 fas fa-user-plus     // User đăng ký
'system_alert'        → ⚠️  fas fa-exclamation-triangle // Cảnh báo hệ thống

```

# Deploy


```
✔ Bài 1
Mua VPS

↓

✔ Bài 2
SSH vào VPS

↓

✔ Bài 3
Bảo mật server

↓

✔ Bài 4
Cài NodeJS

↓

✔ Bài 5
Cài PostgreSQL

↓

✔ Bài 6
Deploy Backend

↓

✔ Bài 7
Deploy Frontend

↓

✔ Bài 8
Cloudflare

↓

✔ Bài 9
SSL

↓

✔ Bài 10
CI/CD GitHub Actions

↓

✔ Bài 11
Backup Database

↓

✔ Bài 12
Monitoring

```

## cấu trúc tổng thể 

```Github
TTG

├── project-duhoc
│
├── project-sim
│
├── internal-admin
│
└── mobile-api
```
Mỗi website là một repository.

### Cấu trúc mình khuyên

```Github
project-duhoc/

│
├── apps/
│   │
│   ├── backend/
│   │   │
│   │   ├── src/
│   │   │
│   │   ├── package.json
│   │   │
│   │   ├── .env.example
│   │   │
│   │   └── README.md
│   │
│   └── frontend/
│       │
│       ├── app.vue
│       │
│       ├── nuxt.config.ts
│       │
│       ├── package.json
│       │
│       └──.env.example
│
├── docs/
│   │
│   ├── api.md
│   │
│   ├── database.md
│   │
│   ├── deploy.md
│   │
│   └── memo.md
│
├── database/
│   │
│   ├── schema.sql
│   │
│   ├── seed.sql
│   │
│   └── migration/
│
├── deploy/
│   │
│   ├── nginx/
│   │   │
│   │   └── duhocttg.conf
│   │
│   ├── pm2/
│   │   │
│   │   └── ecosystem.config.cjs
│   │
│   ├── systemd/
│   │   
│   └── github-actions/
│
├── scripts/
│   │
│   ├── backup-db.sh
│   │
│   ├── restore-db.sh
│   │
│   ├── deploy.sh
│   │
│   └── init-server.sh
│
├── prototype/ -- là thư mục(layouts/)
│
├── .github/
│   │
│   └── workflows/
│       │
│       └── deploy.yml
│
├── .gitignore
│
├── README.md
│
└── LICENSE
```

## Bài 1

Series Deploy TTG:

✅ Bài 1: Chọn VPS

⏳ Bài 2: Khởi tạo và bảo mật VPS ← Hôm nay

⏳ Bài 3: Cài Node.js, Git, PM2, PostgreSQL, Nginx

⏳ Bài 4: Cấu hình Domain & Cloudflare

⏳ Bài 5: Deploy Backend

⏳ Bài 6: Deploy Frontend

### Cấu hình

Cấu hình mình sẽ chốt

|Mục	|Chọn|
|--|--|
|VPS	|✅ Pro Platinum VPS - 4|
|CPU	|✅ 4 Core|
|RAM	|✅ 4GB|
|SSD	|✅ 40GB|
|IP	|✅ 1|
|OS	|✅ Ubuntu 24.04 x86_64|
|cPanel	|✅ Không|

Hostname
```
ttg-vps
```

## Bài 2 

Series Deploy TTG:

✅ Bài 1: Chọn VPS

✅ Bài 2: Khởi tạo và bảo mật VPS ← Hôm nay

⏳ Bài 3: Cài Node.js, Git, PM2, PostgreSQL, Nginx

⏳ Bài 4: Cấu hình Domain & Cloudflare

⏳ Bài 5: Deploy Backend

⏳ Bài 6: Deploy Frontend

```
Ubuntu 24.04

↓

SSH Key

↓

User deploy

↓

Firewall

↓

Server an toàn
```

### Bước 1. Đăng nhập VPS

Sau khi AZDIGI gửi email, bạn sẽ nhận được:
```
IP:
Username: root
Password: xxxxx
```

Trên máy của bạn:

Windows

Khuyên dùng

Windows Terminal hoặc PowerShell.

Mac/Linux

Terminal.

Đăng nhập
```Bash
ssh root@IP_VPS
```
Ví dụ
```Bash
ssh root@103.xxx.xxx.xxx
```
Lần đầu sẽ hỏi

```
Are you sure you want to continue connecting?
```

gõ

```
yes
```

nhập password.

Nếu thấy

```
root@ttg-prod-01:~#
```
là thành công

```Bash
C:\Users\pham-thi-anh>ssh root@180.93.3.33
The authenticity of host '180.93.3.33 (180.93.3.33)' can't be established.
RSA key fingerprint is SHA256:CrFeC8xYhB907vl1fJlqCDNiV2hOZs6vH3HN+51khrQ.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added '180.93.3.33' (RSA) to the list of known hosts.
root@180.93.3.33's password:
Welcome to Ubuntu 24.04.3 LTS (GNU/Linux 6.8.0-88-generic x86_64)

 * Documentation:  https://help.ubuntu.com
 * Management:     https://landscape.canonical.com
 * Support:        https://ubuntu.com/pro

 System information as of Sat Jun 27 02:57:40 PM +07 2026

  System load:  0.0               Processes:             124
  Usage of /:   9.0% of 41.23GB   Users logged in:       0
  Memory usage: 5%                IPv4 address for eth0: 180.93.3.33
  Swap usage:   0%

 * Strictly confined Kubernetes makes edge and IoT secure. Learn how MicroK8s
   just raised the bar for easy, resilient and secure K8s cluster deployment.

   https://ubuntu.com/engage/secure-kubernetes-at-the-edge

Expanded Security Maintenance for Applications is not enabled.

0 updates can be applied immediately.

Enable ESM Apps to receive additional future security updates.
See https://ubuntu.com/esm or run: sudo pro status


The list of available updates is more than a week old.
To check for new updates run: sudo apt update

Last login: Mon Dec  8 11:44:55 2025 from 103.221.220.224
root@tgg-vps:~#
```

### Bước 2. Update Ubuntu

```Bash
apt update
apt upgrade -y
```

Bạn vừa mới mua VPS.

Bạn chưa chỉnh sửa SSH.

=> Nên chọn:
```Bash
Install the package maintainer's version
```
(tức là dùng file cấu hình mới của Ubuntu)

Đây là lựa chọn sạch và phù hợp nhất.

Sau này thì sao?

Sau khi chúng ta làm:
```Bash
SSH Key
Tắt login root
Đổi port SSH (nếu cần)
Các cấu hình bảo mật khác
```

Nếu sau này Ubuntu lại hỏi câu này, thì không nên chọn "Install..." vì sẽ ghi đè cấu hình bạn đã chỉnh. Lúc đó thường sẽ chọn:
```Bash
Keep the local version currently installed
```


Sau đó
```Bash
reboot
```
Đợi khoảng 1 phút.

SSH lại.

### Bước 3. Kiểm tra phiên bản Ubuntu

```Bash
lsb_release -a
```
Kết quả mong muốn
```Bash
Ubuntu 24.04 LTS
```

### Bước 4. Đặt Timezone

Hiện tại Ubuntu thường là UTC.

Kiểm tra

```Bash
timedatectl
```
Đổi sang Việt Nam
```Bash
timedatectl set-timezone Asia/Ho_Chi_Minh
```
Kiểm tra lại
```Bash
timedatectl
```
Phải thấy
```Bash
Asia/Ho_Chi_Minh
```
ket qua
```Bash
 Local time: Sat 2026-06-27 15:12:52 +07
           Universal time: Sat 2026-06-27 08:12:52 UTC
                 RTC time: Sat 2026-06-27 08:12:53
                Time zone: Asia/Ho_Chi_Minh (+07, +0700)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
```

### Bước 5. Đặt hostname

Nếu lúc mua bạn chưa đặt

Kiểm tra

```Bash
hostnamectl
```
Đổi

```Bash
hostnamectl set-hostname tgg-prod-01
```
Kiểm tra
```Bash
hostname
```
ket qua
```Bash
Static hostname: tgg-prod-01
       Icon name: computer-vm
         Chassis: vm 🖴
      Machine ID: 3f8498c7c1ad40e6b84ace8bd060ce23
         Boot ID: 5c19677885a34a22b444bf6b3df42c50
  Virtualization: kvm
Operating System: Ubuntu 24.04.3 LTS
          Kernel: Linux 6.8.0-124-generic
    Architecture: x86-64
 Hardware Vendor: Red Hat
  Hardware Model: KVM
Firmware Version: 1.16.3-2.el9_5.1
   Firmware Date: Tue 2014-04-01
    Firmware Age: 12y 2month 3w 5d
```

### Bước 6. Tạo user deploy

Không dùng root nữa.

```Bash
adduser deploy
```
Ubuntu sẽ hỏi
```Bash
Password
```
Tự đặt.

Các thông tin còn lại
```Bash
Full Name

Room Number

Phone

...
```
Có thể Enter bỏ qua.

Cuối cùng
```Bash
Y
```

### Bước 7. Cho quyền sudo

```Bash
usermod -aG sudo deploy
```
Kiểm tra
```Bash
groups deploy
```
Phải thấy
```Bash
sudo
```

### Bước 8. Đăng nhập bằng deploy

Mở cửa sổ Terminal mới

```Bash
ssh deploy@IP_VPS
## ssh deploy@180.93.3.33
```
Đăng nhập thành công.

Kiểm tra

```Bash
sudo ls
```
Nếu yêu cầu password và chạy được thì OK.

### Bước 9. Cài UFW

Cài UFW

```Bash
sudo apt update

sudo apt install ufw -y
```
Kiểm tra

```Bash

sudo ufw status
```

Lúc này sẽ thấy
```Bash
Status: inactive
```

Đây là bình thường.

**Cho phép SSH trước**

Đây là bước cực kỳ quan trọng.

Nếu bật firewall trước mà chưa mở SSH, bạn sẽ tự khóa mình khỏi VPS.

Cho phép SSH

```Bash
sudo ufw allow OpenSSH
```

Kiểm tra
```Bash
sudo ufw status
```
Có thể vẫn hiện inactive, nhưng rule đã được lưu.

**Mở HTTP**

```Bash
sudo ufw allow 80/tcp
```

**Mở HTTPS**
```Bash

sudo ufw allow 443/tcp
```

**Bật firewall**
```Bash
sudo ufw enable
```
Nó sẽ hỏi
```
Command may disrupt existing ssh connections.
Proceed with operation (y|n)?
```
Chọn
```
y
```

Kiểm tra
```Bash
sudo ufw status verbose
```

Kết quả sẽ tương tự

```Bash
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp (OpenSSH)           ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
22/tcp (OpenSSH (v6))      ALLOW IN    Anywhere (v6)
443/tcp (v6)               ALLOW IN    Anywhere (v6)
80/tcp (v6)                ALLOW IN    Anywhere (v6)
```


**Có một bước mình muốn bổ sung vào series**

Thay vì chỉ mở từng port, chúng ta sẽ dùng Application Profiles của Ubuntu. Điều này giúp dễ quản lý hơn.

Xem các profile có sẵn:

```Bash
sudo ufw app list
```

Hiện tại mới cài SSH nên chỉ thấy:

```Bash

OpenSSH
```

Sau khi cài Nginx ở Bài 3, chúng ta sẽ dùng:
```Bash
sudo ufw allow 'Nginx Full'
```
Thay vì phải mở riêng port 80 và 443.

**Trước khi sang Bài 3, mình muốn kiểm tra VPS của bạn**

Hãy gửi kết quả của các lệnh sau:

```Bash
hostnamectl
timedatectl
free -h
df -h
sudo ufw status verbose
groups
```
Lưu ý ở lệnh cuối, khi bạn đang đăng nhập bằng user deploy, chỉ cần chạy groups là đủ (không cần groups deploy).


Ket qua
```Bash
deploy@tgg-vps:~$ hostnamectl
 Static hostname: tgg-prod-01
       Icon name: computer-vm
         Chassis: vm 🖴
      Machine ID: 3f8498c7c1ad40e6b84ace8bd060ce23
         Boot ID: 5c19677885a34a22b444bf6b3df42c50
  Virtualization: kvm
Operating System: Ubuntu 24.04.3 LTS
          Kernel: Linux 6.8.0-124-generic
    Architecture: x86-64
 Hardware Vendor: Red Hat
  Hardware Model: KVM
Firmware Version: 1.16.3-2.el9_5.1
   Firmware Date: Tue 2014-04-01
    Firmware Age: 12y 2month 3w 5d
deploy@tgg-vps:~$ timedatectl
               Local time: Sat 2026-06-27 15:33:19 +07
           Universal time: Sat 2026-06-27 08:33:19 UTC
                 RTC time: Sat 2026-06-27 08:33:19
                Time zone: Asia/Ho_Chi_Minh (+07, +0700)
System clock synchronized: yes
              NTP service: active
          RTC in local TZ: no
deploy@tgg-vps:~$ free -h
               total        used        free      shared  buff/cache   available
Mem:           3.8Gi       412Mi       3.0Gi       2.5Mi       612Mi       3.4Gi
Swap:          1.0Gi          0B       1.0Gi
deploy@tgg-vps:~$ df -h
Filesystem      Size  Used Avail Use% Mounted on
tmpfs           392M  988K  391M   1% /run
/dev/vda1        42G  4.3G   35G  11% /
tmpfs           2.0G     0  2.0G   0% /dev/shm
tmpfs           5.0M     0  5.0M   0% /run/lock
tmpfs           392M   12K  392M   1% /run/user/0
tmpfs           392M   12K  392M   1% /run/user/1000
deploy@tgg-vps:~$ sudo ufw status verbose
Status: active
Logging: on (low)
Default: deny (incoming), allow (outgoing), disabled (routed)
New profiles: skip

To                         Action      From
--                         ------      ----
22/tcp (OpenSSH)           ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
22/tcp (OpenSSH (v6))      ALLOW IN    Anywhere (v6)
443/tcp (v6)               ALLOW IN    Anywhere (v6)
80/tcp (v6)                ALLOW IN    Anywhere (v6)

deploy@tgg-vps:~$ groups
deploy sudo users
```

**Tạo Swap 4GB**

Hiện tại
```Bash
RAM
3.8GB

Swap
1GB

```
Với NodeJS

Nuxt

PostgreSQL

2 website

Build Nuxt

=> mình muốn nâng Swap lên 4GB.

Đây sẽ là Bài 2.5.

Sau này build Nuxt sẽ ổn định hơn rất nhiều.

---

## Bài 2.5 - Nâng Swap từ 1GB lên 4GB

1. Tắt swap

```Bash
sudo swapoff /swapfile
```

Kiểm tra:
```Bash
swapon --show
```
Không còn dòng nào là đúng.

2. Xóa file cũ

```Bash
sudo rm /swapfile
```

3. Tạo file mới 4GB
```Bash
sudo fallocate -l 4G /swapfile
```

4. Đặt quyền
```Bash
sudo chmod 600 /swapfile
```

5. Tạo swap
```Bash
sudo mkswap /swapfile
```

6. Bật swap
```Bash
sudo swapon /swapfile
```
7. Kiểm tra

```Bash
free -h
```

Kỳ vọng:
```Bash
Swap: 4.0Gi
```

8. Tối ưu Swappiness

Kiểm tra:
```Bash
cat /proc/sys/vm/swappiness
```

Có thể sẽ là:

```Bash
60
```

Tạo file cấu hình riêng:
```Bash
sudo nano /etc/sysctl.d/99-ttg.conf
```

Nội dung:
```Bash
vm.swappiness=10
vm.vfs_cache_pressure=50
```

Lưu:
```Bash
Ctrl + O
Enter
Ctrl + X
```

Áp dụng:
```Bash
sudo sysctl --system
```

Kiểm tra:
```Bash
cat /proc/sys/vm/swappiness
cat /proc/sys/vm/vfs_cache_pressure
```

Kết quả mong muốn:
```Bash
10
50
```

---

**Bước 2. Bật tự động cập nhật bản vá bảo mật**

Cài đặt:

```Bash
sudo apt install unattended-upgrades -y
```

Kích hoạt:
```Bash
sudo dpkg-reconfigure unattended-upgrades
```

Chọn:
```Bash
Yes
```
Điều này giúp Ubuntu tự cài các bản vá bảo mật quan trọng mà không cần bạn đăng nhập thủ công.

---

**Bước 3. Cài một số công cụ quản trị**
```Bash
sudo apt install -y \
git \
curl \
wget \
zip \
unzip \
tree \
nano \
vim \
htop \
btop \
net-tools \
dnsutils \
build-essential \
software-properties-common \
ca-certificates \
gnupg \
apt-transport-https
```

Đây đều là các công cụ mình thường cài ngay từ đầu trên server production.

Ví dụ:

- git: clone source code.
- tree: xem cấu trúc thư mục.
- htop, btop: theo dõi CPU, RAM.
- dnsutils: kiểm tra DNS (dig, nslookup).
- build-essential: biên dịch các module Node.js khi cần.

---

**Cấu trúc thư mục Production**

Sau khi cài xong các công cụ trên, mình đề nghị tạo luôn cấu trúc thư mục lâu dài:

```Bash
mkdir -p ~/apps
mkdir -p ~/backups
mkdir -p ~/logs
mkdir -p ~/scripts
mkdir -p ~/ssl
mkdir -p ~/tmp
```

Sau đó:
```Bash
tree ~
```

Bạn sẽ có:
```Bash
/home/deploy
├── apps
├── backups
├── logs
├── scripts
├── ssl
└── tmp
```

**Kiến trúc Production chính thức**

Bây giờ mình muốn thống nhất luôn.

Server của bạn sẽ không còn là
```
Website Du học
```
nữa.

Mà là
```
TTG Production Server
```
để sau này thêm bao nhiêu website cũng được.

---

**Chúng ta sẽ dùng cấu trúc này**
```Bash
/home/deploy

├── apps/
│
│   ├── duhocttg/
│   │
│   ├── ttgroup/
│   │
│   └── sandbox/
│
├── backups/
│
├── logs/
│
├── scripts/
│
├── ssl/
│
└── tmp/
```

## Bài 3



Series Deploy TTG:

✅ Bài 1: Chọn VPS

✅ Bài 2: Khởi tạo và bảo mật VPS

✅ Bài 3: Cài Node.js, Git, PM2, PostgreSQL, Nginx ← Hôm nay

⏳ Bài 4: Cấu hình Domain & Cloudflare

⏳ Bài 5: Deploy Backend

⏳ Bài 6: Deploy Frontend

```Bash
Ubuntu

↓

Git

↓

Curl

↓

NodeSource

↓

NodeJS 22

↓

PM2

↓

Nginx

↓

Tree

↓

htop

↓

Cấu trúc thư mục Production
```
Chưa cài PostgreSQL. PostgreSQL sẽ là một bài riêng để chúng ta cấu hình bảo mật kỹ.

---

### Bước 1

Update

```Bash
sudo apt update
sudo apt upgrade -y
```

### Bước 2

Cài package
```Bash
sudo apt install -y \
git \
curl \
wget \
zip \
unzip \
tree \
nano \
vim \
htop \
btop \
build-essential \
software-properties-common \
ca-certificates \
gnupg \
apt-transport-https
```

Kiểm tra
```Bash
git --version

tree --version

node --version
```

Node sẽ báo
```Bash
command not found
```

đó là bình thường.

---

### Bước 3

Cài NodeJS 22 LTS

Không dùng
```Bash
apt install nodejs
```
vì Ubuntu thường khá cũ.

Thêm repository của NodeSource:

```Bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
```

Sau đó:
```Bash
sudo apt install -y nodejs
```

Kiểm tra:
```Bash
node -v

npm -v
```

Ví dụ:
```Bash
v22.xx.x

10.xx.x
```
---

### Bước 4

Cài PM2
```Bash
sudo npm install -g pm2
```

Kiểm tra
```Bash
pm2 -v
```

---

### Bước 5

PM2 Startup
```Bash
pm2 startup
```

PM2 sẽ hiện một lệnh tương tự:
```Bash
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u deploy --hp /home/deploy
```
**Bạn phải copy đúng lệnh đó và chạy.**

Sau đó:

```Bash
pm2 save
```

Hiện chưa có app nào nên không sao.

---

### Bước 6

Cài Nginx
```Bash
sudo apt install nginx -y
```

Kiểm tra
```Bash
systemctl status nginx
```

Nếu thấy:
```Bash
active (running)
```
là đúng.

---

### Bước 7

Mở Firewall cho Nginx

Kiểm tra
```Bash
sudo ufw app list
```

Lúc này sẽ thấy
```Bash
OpenSSH

Nginx Full

Nginx HTTP

Nginx HTTPS
```

Mở
```Bash
sudo ufw allow 'Nginx Full'
```

Sau đó có thể xóa các rule 80/443 cũ nếu muốn để cấu hình gọn hơn (không bắt buộc).

Kiểm tra
```Bash
sudo ufw status
```

---

### Bước 9

Website đầu tiên

```Bash
mkdir ~/apps/duhoctgg
```

Website thứ hai
```Bash
mkdir ~/apps/ttgroup
```

Website test
```Bash
mkdir ~/apps/sandbox
```
---

### Bước 10

Mình muốn thay đổi một chút.

Thay vì
```Bash
duhocttg/

frontend

backend
```
ngay từ đầu.

Mình thích
```Bash
duhocttg/

repo/

deploy/

shared/
```
Giống Laravel Forge.

Tạo:

```Bash
mkdir -p ~/apps/duhoctgg/repo
mkdir -p ~/apps/duhoctgg/deploy
mkdir -p ~/apps/duhoctgg/shared
```

Website Nhật
```Bash
mkdir -p ~/apps/ttgroup/repo
mkdir -p ~/apps/ttgroup/deploy
mkdir -p ~/apps/ttgroup/shared
```

---

Ý nghĩa
```Bash
repo
```
Clone GitHub.
```Bash
deploy
```
Build production.
```Bash
shared
```
File dùng chung.

Ví dụ
```Bash
.env

uploads

logs

backup
```
Sau này CI/CD sẽ chỉ thay thư mục deploy, còn .env và dữ liệu không bị mất.

---

### Bước 11

Kiểm tra
```Bash
tree ~/apps
```

Bạn sẽ thấy
```Bash
/home/deploy/apps

├── duhocttg
│   ├── deploy
│   ├── repo
│   └── shared

├── ttgroup
│   ├── deploy
│   ├── repo
│   └── shared

└── sandbox
```
---

**Đây là phần quan trọng nhất**

Mình không muốn clone GitHub trực tiếp vào `repo`.

Mình muốn chuyển sang mô hình mono-repo rõ ràng hơn.

Ví dụ với dự án du học:
```Bash
project-duhocNB
│
├── backend
│
├── frontend
│
└── layouts
```

Khi clone lên VPS:
```Bash
~/apps/duhocttg/repo

├── backend
│
├── frontend
│
└── layouts
```
Sau này chúng ta sẽ:

- Chạy backend từ backend/.
- Build Nuxt từ frontend/.
- Không bao giờ chạy trực tiếp từ thư mục Git.

Khi triển khai phiên bản mới, mã nguồn mới sẽ được kéo về repo, build ra thư mục deploy, rồi Nginx và PM2 sẽ chạy từ deploy. Cách này giúp việc rollback và cập nhật an toàn hơn.

---

**Mình muốn điều chỉnh lộ trình thêm một chút**

Ở các hướng dẫn thông thường, người ta thường làm:

```Bash
GitHub
↓
git clone
↓
npm install
↓
npm run build
```
Nhưng với hệ thống của bạn (2 website, sẽ còn phát triển), mình muốn áp dụng cách làm chuyên nghiệp hơn:

Bài 4: Thiết lập SSH Key giữa VPS và GitHub (không dùng Personal Access Token).
Bài 5: Cài và cấu hình PostgreSQL (tạo user, database, phân quyền).
Bài 6: Clone source từ GitHub, cài dependencies, chạy PM2.
Bài 7: Cấu hình Nginx và SSL.

Làm theo thứ tự này sẽ giúp bạn có một máy chủ dễ bảo trì, an toàn và có thể mở rộng thêm website trong tương lai mà không cần thay đổi kiến trúc.

---

## Bài 4

✅ Bài 1: Chọn VPS

✅ Bài 2: Khởi tạo và bảo mật VPS

✅ Bài 3: Cài Node.js, Git, PM2, PostgreSQL, Nginx

✅ Bài 4: Cấu hình Domain & Cloudflare ← Hôm nay

⏳ Bài 5: Deploy Backend

⏳ Bài 6: Deploy Frontend

Từ Bài 4 trở đi chúng ta sẽ bắt đầu đi vào phần DevOps.

Mình sẽ hướng dẫn theo cách mà sau này chỉ cần git pull là deploy được, không phải nhập mật khẩu GitHub.

Series Deploy TTG

```Bash
✓ Bài 1  VPS
✓ Bài 2  Ubuntu
✓ Bài 2.5 Tối ưu VPS
✓ Bài 3  Môi trường

➡ Bài 4 GitHub SSH

Bài 5 PostgreSQL

Bài 6 Clone Source

Bài 7 Backend

Bài 8 Frontend

Bài 9 Nginx

Bài 10 SSL

Bài 11 Domain

Bài 12 Backup

Bài 13 CI/CD
```
---

**Mục tiêu Bài 4**

Sau bài này

```Bash
GitHub

⇅ SSH Key

VPS

↓

git clone

↓

git pull

↓

Không cần nhập password
```

---

### Bước 1

Kiểm tra Git

```Bash
git --version
```

ví dụ
```Bash
git version 2.43.0
```

### Bước 2

Kiểm tra SSH
```Bash
ls ~/.ssh
```

Nếu chưa có
```Bash
No such file
```
thì bình thường.

---

### Bước 3

Tạo SSH Key

Đăng nhập bằng user deploy (không phải root).

```Bash
ssh-keygen -t ed25519 -C "deploy@tgg-prod-01"
```

Ubuntu hỏi
```Bash
Enter file
```

Nhấn
```Bash
Enter
```

để dùng mặc định
```Bash
~/.ssh/id_ed25519
```
---

Tiếp
```Bash
Enter passphrase
```
👉 Để trống

Nhấn Enter.
```Bash
Xác nhận
```
Enter lần nữa.

Kiểm tra
```Bash
ls ~/.ssh
```
Bạn sẽ thấy
```Bash
id_ed25519
id_ed25519.pub
```

```Bash
deploy@ttg-prod-01:~$ ssh-keygen -t ed25519 -C "deploy@tgg-prod-01"
Generating public/private ed25519 key pair.
Enter file in which to save the key (/home/deploy/.ssh/id_ed25519):
Created directory '/home/deploy/.ssh'.
Enter passphrase (empty for no passphrase):
Enter same passphrase again:
Your identification has been saved in /home/deploy/.ssh/id_ed25519
Your public key has been saved in /home/deploy/.ssh/id_ed25519.pub
The key fingerprint is:
SHA256:x3JybLszcl3RXc6xrYlCBySAC/YYFfiedV/fAV55wGk deploy@tgg-prod-01
The key's randomart image is:
+--[ED25519 256]--+
|   ooo.....  ..o.|
|  = .    ..  .E+o|
| . * .     ...o+B|
|  . + . .o. o..o*|
|   . o .SoBo o =.|
|    o    Bo.. = .|
|          .o .   |
|        . +..    |
|         o.o     |
+----[SHA256]-----+
```
---

### Bước 4

Hiển thị Public Key
```Bash
cat ~/.ssh/id_ed25519.pub
```

Ví dụ
```Bash
ssh-ed25519 AAAAC3....

deploy@ttg-prod-01
```
Copy toàn bộ.

```Bash
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAID7RKfAiu3bIV111/qfJXQqP7hj+94yqJ2GFKtonF5wWm8v111 deploy@tgg-prod-01
```
---

### Bước 5

Thêm SSH Key vào GitHub

Đăng nhập GitHub

Góc phải
```Bash
Settings
```
↓
```Bash
SSH and GPG Keys
```
↓
```Bash
New SSH Key
```
Title
```Bash
TTG VPS Production
```
Key

Dán toàn bộ
```Bash
ssh-ed25519 ....
```
↓
```Bash
Save.
```
---

### Bước 6

Kiểm tra
```Bash
ssh -T git@github.com
```
Lần đầu

Ubuntu hỏi
```Bash
Are you sure...
```
gõ
```Bash
yes
```
Nếu thành công
```Bash
Hi your-github-name!

You've successfully authenticated.
```

```Bash
deploy@ttg-prod-01:~$ ssh -T git@github.com
The authenticity of host 'github.com (20.205.243.166)' can't be established.
ED25519 key fingerprint is SHA256:+DiY3wvvV6TuJJhbpZisF/zLDA0zPMSvHdkr4UvCOqU.
This key is not known by any other names.
Are you sure you want to continue connecting (yes/no/[fingerprint])? yes
Warning: Permanently added 'github.com' (ED25519) to the list of known hosts.
Hi anhpham9! You've successfully authenticated, but GitHub does not provide shell access.
```

---

### Bước 7

Tạo thư mục Repo

Theo cấu trúc chúng ta đã thống nhất
```Bash
mkdir -p ~/apps/duhoctgg/repo
```
Kiểm tra
```Bash
tree ~/apps
```

---

### Bước 8

Clone Source

Ví dụ repo của bạn
```Bash
project-duhocNB
```
Lưu ý: Bạn phải dùng SSH URL, không dùng HTTPS.

SSH URL có dạng:
```Bash
git@github.com:<username>/<repo>.git
```
Ví dụ:
```Bash
cd ~/apps/duhoctgg/repo

git clone git@github.com:username/project-duhocNB.git .
```
Dấu . ở cuối nghĩa là clone trực tiếp vào thư mục repo, không tạo thêm một thư mục con.

Sau khi clone
```Bash
repo/

backend

frontend

layouts
```
---

### Bước 9

Kiểm tra
```Bash
git remote -v
```

Phải thấy
```Bash
git@github.com:...
```

Không phải
```Bash
https://github...
```

---

### Bước 10

Test Pull
```Bash
git pull
```

Nếu
```Bash
Already up to date.
```
là thành công.

---

### Bước 11

Kiểm tra cấu trúc
```Bash
apps

duhoctgg

repo

backend

frontend

layouts
```
---
**Mình muốn thay đổi một điểm rất quan trọng**

Đây là phần mà mình không đồng ý với hầu hết các tutorial trên YouTube.

Thông thường họ clone như sau:
```Bash
repo

backend

frontend
```

rồi:
```Bash
cd backend

npm install

cd frontend

npm install
```
Điều đó chạy được, nhưng chưa tối ưu.

---

**Mình đề xuất chuẩn Production ngay từ đầu**

Thư mục repo chỉ chứa mã nguồn từ GitHub, tuyệt đối không chứa:
```Bash
node_modules
file build
log
file upload
.env thật
```

Cấu trúc sẽ là:
```Bash
/home/deploy/apps/duhoctgg
│
├── repo/                # Source code từ GitHub
│   ├── backend/
│   ├── frontend/
│   └── layouts/
│
├── deploy/              # Phiên bản chạy thực tế
│   ├── backend/
│   └── frontend/
│
├── shared/
│   ├── backend/
│   │   ├── .env
│   │   └── logs/
│   └── frontend/
│       └── .env
```
Khi deploy:

1. `git pull` cập nhật source vào `repo`.
2. Build và cài dependencies.
3. Đồng bộ sang `deploy`.
4. Liên kết (`symlink`) file `.env` từ `shared` vào `deploy`.
5. PM2 chỉ chạy ứng dụng trong `deploy`.

Vì sao làm như vậy?

- Không vô tình commit `.env` lên GitHub.
- Có thể rollback phiên bản cũ.
- Source code luôn "sạch".
- Sau này triển khai CI/CD hoặc GitHub Actions rất dễ.
- Khi bạn có thêm website **ttgroup-global.com**, chỉ cần lặp lại đúng mô hình này.

Đây là kiến trúc mình khuyến nghị cho hệ thống của bạn vì vừa đơn giản, vừa đủ chuyên nghiệp để sử dụng lâu dài. Trong các bài tiếp theo, chúng ta sẽ dựa trên cấu trúc này để cài PostgreSQL và triển khai backend/frontend.

---

## Bài 5 - Chuẩn bị Source Code trên VPS

Mục tiêu

Sau bài này bạn sẽ có:
```Bash
/home/deploy/apps/duhoctgg

├── repo/
│   ├── backend/
│   ├── frontend/
│   └── layouts/
│
├── deploy/
│   ├── backend/
│   └── frontend/
│
└── shared/
    ├── backend/
    │   ├── .env
    │   └── logs/
    │
    └── frontend/
        └── .env
```

### Bước 1. Tạo cấu trúc thư mục

```Bash
mkdir -p ~/apps/duhoctgg/repo
mkdir -p ~/apps/duhoctgg/deploy/backend
mkdir -p ~/apps/duhoctgg/deploy/frontend

mkdir -p ~/apps/duhoctgg/shared/backend/logs
mkdir -p ~/apps/duhoctgg/shared/frontend
```

Kiểm tra:

```Bash
tree ~/apps/duhoctgg
```

Kết quả mong muốn:

```Bash
duhoctgg

├── deploy
│   ├── backend
│   └── frontend
│
├── repo
│
└── shared
    ├── backend
    │   └── logs
    └── frontend
```

---

### Bước 2. Clone GitHub

Đi vào repo
```Bash
cd ~/apps/duhoctgg/repo
```

Clone
```Bash
git clone git@github.com:USERNAME/project-duhocNB.git .
```
(dấu . ở cuối rất quan trọng)

Kiểm tra
```Bash
tree -L 2
```

Ví dụ
```Bash
repo

backend

frontend

layouts
```

---

### Bước 3. Kiểm tra Remote

```Bash
git remote -v
```

Phải là
```Bash
origin git@github.com:...
```

Không phải HTTPS.

---

### Bước 4. Kiểm tra Branch

```Bash
git branch
```

Ví dụ
```Bash
* main
```

---

### Bước 5. Tạo .gitignore (nếu chưa có)

Trong backend
```Bash
node_modules
.env
logs
```

Trong frontend
```Bash
node_modules
.output
.nuxt
.env
```

Điều này giúp không đưa các file sinh ra trong quá trình chạy lên GitHub.

---

### Bước 6. Chuẩn bị thư mục Shared

Tạo file .env trống:
```Bash
touch ~/apps/duhoctgg/shared/backend/.env
touch ~/apps/duhoctgg/shared/frontend/.env
```

Kiểm tra:
```Bash
tree ~/apps/duhoctgg/shared
```

Kết quả:
```Bash
shared

backend
├── .env
└── logs

frontend
└── .env
```

---

### Bước 7. Không tạo symlink ngay

Nhiều hướng dẫn sẽ làm ngay:
```
ln -s ...
```

Mình không muốn làm lúc này.

Lý do:

1. Chưa có nội dung .env.
2. Chưa biết backend/frontend cần biến môi trường gì.
3. Sau này dễ gây nhầm lẫn.

Chúng ta sẽ tạo symlink sau khi PostgreSQL và Cloudinary đã cấu hình xong.

---

### Bước 8. Không cài node_modules trong repo

Đây là quy tắc mình muốn bạn tuân thủ:

❌ Không làm:
```
cd repo/backend
npm install
```

❌ Không làm:
```
cd repo/frontend
npm install
```

Trong mô hình này, repo chỉ là nơi lưu source.

Việc cài dependencies và build sẽ thực hiện ở bước deploy.

---

### Mình muốn cải tiến kiến trúc thêm một chút

Hiện tại bạn dự định:
```
shared/

backend/

.env

logs
```

Mình muốn bổ sung:
```
shared

backend
│
├── .env
│
├── logs
│
├── uploads
│
└── tmp
```

Mặc dù hiện tại bạn dùng Cloudinary, nhưng:
```
file upload tạm,
export Excel,
import dữ liệu,
cache,
```

vẫn có thể cần thư mục riêng.

Tạo luôn:
```
mkdir -p ~/apps/duhoctgg/shared/backend/uploads
mkdir -p ~/apps/duhoctgg/shared/backend/tmp
```

---

### Kế hoạch các bài tiếp theo

Sau khi hoàn thành Bài 5, chúng ta sẽ đi theo thứ tự:

- Bài 6: Cài PostgreSQL 16, tạo user duhoctgg_app, tạo database duhoctgg_prod, phân quyền và cấu hình kết nối.
- Bài 7: Chuẩn bị backend (cài dependencies, tạo .env, kiểm tra kết nối PostgreSQL và Cloudinary, chạy bằng PM2).
- Bài 8: Build và chạy Nuxt 4.
- Bài 9: Cấu hình Nginx cho duhoctgg.edu.vn.
- Bài 10: Cài SSL bằng Let's Encrypt.

**Mình muốn thay đổi một điểm quan trọng**

Trong suốt các bài tiếp theo, mình sẽ không bao giờ chạy ứng dụng trực tiếp trong repo.

Luồng deploy sẽ luôn là:
```
GitHub
    │
    ▼
repo/        (source)
    │
    ▼
deploy/      (build & chạy)
    │
    ▼
PM2 + Nginx
```

Đây là kiến trúc giúp bạn:

- rollback dễ,
- không làm bẩn source,
- chuẩn bị sẵn cho CI/CD trong tương lai.

---

## Bài 6: Cài PostgreSQL 16, tạo user duhoctgg_app, tạo database duhoctgg_prod, phân quyền và cấu hình kết nối.

**Mình sẽ không hướng dẫn theo các tutorial trên mạng (thường dùng user postgres cho ứng dụng), mà sẽ cấu hình theo nguyên tắc:**

- PostgreSQL chạy bằng user hệ thống postgres.
- Mỗi website có database riêng.
- Mỗi website có user database riêng.
- User ứng dụng chỉ có quyền trên database của mình.

Đây là cách nên dùng nếu sau này VPS của bạn có cả:

- duhoctgg.edu.vn
- ttgroup-global.com
- sandbox

**Series**
```Bash
✓ Bài 1 VPS
✓ Bài 2 Ubuntu
✓ Bài 2.5 Optimize
✓ Bài 3 Environment
✓ Bài 4 GitHub
✓ Bài 5 Source

➡ Bài 6 PostgreSQL
```

**Mục tiêu**

Sau bài này bạn sẽ có
```Bash
PostgreSQL 16

↓

Role

duhoctgg_app

↓

Database

duhoctgg_prod

↓

Schema

public

↓

Ready
```

---

### Bước 1. Kiểm tra đã cài PostgreSQL chưa

```Bash
psql --version
```

Nếu báo:
```Bash
command not found
```

thì chưa cài.

---

### Bước 2. Cài PostgreSQL 16

Ubuntu 24.04 mặc định cung cấp PostgreSQL 16, vì vậy bạn chỉ cần:

```Bash
sudo apt update

sudo apt install postgresql postgresql-contrib -y
```

Không cần thêm repository của PostgreSQL Global Development Group (PGDG), trừ khi sau này bạn muốn dùng phiên bản mới hơn 16.

---

### Bước 3. Kiểm tra service

```Bash
systemctl status postgresql
```

Kỳ vọng
```Bash
active (running)
```
---

### Bước 4. Kiểm tra version

```Bash
sudo -u postgres psql
```

Trong PostgreSQL
```Bash
SELECT version();
```

Ví dụ
```Bash
PostgreSQL 16.x
```

Thoát
```Bash
\q
```
---

### Bước 5. Đăng nhập postgres

Nếu đang ở:
```Bash
postgres=#
```

thì bỏ qua bước này.

```Bash
sudo -u postgres psql
```

Bạn sẽ thấy
```Bash
postgres=#
```

---

### Bước 6. Tạo Role

Mình khuyên đặt tên

```Bash
duhoctgg_app
```

không phải

```Bash
duhoctgg
```

để nhìn là biết đây là application user.

```Bash
CREATE ROLE duhoctgg_app
LOGIN
PASSWORD 'MậtKhẩuRấtMạnh';
```

Ví dụ
```Bash
CREATE ROLE duhoctgg_app
LOGIN
PASSWORD 'YourStrongPasswordHere';
```

'TGGgroup@2026#Cloud';

Lưu ý: Hãy dùng một mật khẩu mạnh và lưu lại cẩn thận. Sau này mật khẩu này sẽ được đặt trong file shared/backend/.env.

---

### Bước 8. Kết nối sang database

```Bash
\c duhoctgg_prod
```

---

### Bước 9. Kiểm tra owner

```Bash
SELECT current_database();
SELECT current_user;
```

Kết quả
```Bash
duhoctgg_prod

postgres
```

Đừng ngạc nhiên.

Bạn vẫn đang login bằng postgres.

---

### Bước 10. Kiểm tra quyền

```Bash
\l
```

Bạn sẽ thấy
```Bash
duhoctgg_prod
```

Owner
```Bash
duhoctgg_app
```

Đó mới là điều quan trọng.

---

### Bước 11. Thoát

```Bash
\q
```

mong muốn con trỏ đứng ở vị trí 
```Bash
deploy@tgg-prod-01:~/apps/duhoctgg/repo$
```

nếu vẫn ở 
```Bash
duhoctgg_prod-#
```

thì hãy nhấn `\q` thêm 1 lần nữa.

---

### Bước 12. Test login bằng user ứng dụng

```Bash
psql \
-h localhost \
-U duhoctgg_app \
-d duhoctgg_prod
```

Ubuntu hỏi password.

Nhập password vừa tạo.

Nếu vào được
```Bash
duhoctgg_prod=>
```

là thành công.

Thoát
```Bash
\q
```

---

### Bước 13. Kiểm tra cổng

```Bash
sudo ss -ltnp | grep 5432
```

Kỳ vọng
```Bash
127.0.0.1:5432
```

Đây là cấu hình an toàn vì PostgreSQL chỉ lắng nghe trên localhost.

---

### Bước 14. Kiểm tra cấu hình

```Bash
sudo -u postgres psql
SHOW listen_addresses;
```

Kỳ vọng
```Bash
localhost
```

Nếu là
```Bash
*
```

thì không nên với trường hợp của bạn.

---

### Bước 15. Tạo file .env

Backend
```Bash
nano ~/apps/duhoctgg/shared/backend/.env
```

Ví dụ:
```Bash
NODE_ENV=production

PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=duhoctgg_prod
DB_USER=duhoctgg_app
DB_PASSWORD=YourStrongPasswordHere

JWT_SECRET=...

CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Hiện tại chỉ cần tạo file và điền các giá trị bạn đã có (Cloudinary, JWT...). Chúng ta sẽ sử dụng file này ở Bài 7.


```Bash
NODE_ENV=production

PORT=3001

DB_HOST=localhost
DB_PORT=5432
DB_NAME=duhoctgg_prod
DB_USER=duhoctgg_app
DB_PASSWORD=TGGgroup@2026#Cloud111

JWT_SECRET=TGGgroup@2026#Cloud111

CLOUDINARY_CLOUD_NAME=dfzr7lsxr
CLOUDINARY_API_KEY=855544569111575111
CLOUDINARY_API_SECRET=RTzwevpVueTmOWDHrisqzyJ3jfM111
CLOUDINARY_FOLDER=duhoctgg
CLOUDINARY_MAX_FILE_SIZE=5242880
CLOUDINARY_FAVICON_MAX_FILE_SIZE=524288
CLOUDINARY_ALLOWED_MIME=image/jpeg,image/png,image/webp,image/gif,image/x-icon,image/vnd.microsoft.icon
ALLOWED_ORIGINS=https://duhoctgg.edu.vn
```

Ghi chú, nếu password có ký  tự đặc biệt là # thì phải để trong dấu '' để tránh bị hiểu nhầm phần sau dấu # là comment

---

**Kiến trúc Database sau này**

Khi website Nhật ra đời

PostgreSQL
```Bash
duhoctgg_prod

↓

Owner

duhoctgg_app

-----------------------

ttgroup_prod

↓

Owner

ttgroup_app

-----------------------

sandbox

↓

sandbox_app
```

Không dùng chung user.

Không dùng chung database.

Không dùng user postgres.

Đây là cấu hình production.

Mình đề xuất thêm một cải tiến

Mặc dù PostgreSQL tạo schema public mặc định, mình khuyên bạn tạo schema riêng cho ứng dụng để tách biệt dữ liệu.

Ví dụ:
```Bash
CREATE SCHEMA duhoctgg AUTHORIZATION duhoctgg_app;
```

Sau đó:
```Bash
ALTER ROLE duhoctgg_app SET search_path TO duhoctgg;
```

Lợi ích:

- Mọi bảng của ứng dụng sẽ nằm trong schema duhoctgg thay vì public.
- Sau này nếu cần mở rộng, quản lý hoặc backup từng schema sẽ thuận tiện hơn.
- Đây là cách nhiều hệ thống production sử dụng.

Nếu dự án của bạn còn đang ở giai đoạn đầu và chưa có nhiều dữ liệu, mình khuyến nghị áp dụng ngay từ bây giờ vì sẽ tránh phải thay đổi sau này.

---

## Bài 7

### Bài 7.1

Chuẩn bị Environment Production

Đầu tiên, trong VPS:
```Bash
/home/deploy/apps/duhoctgg/shared/backend
```

ta sẽ có
```Bash
.env
logs/
tmp/
uploads/
```

Kiểm tra:
```Bash
tree ~/apps/duhoctgg/shared/backend
```

Kỳ vọng
```Bash
backend

.env

logs

tmp

uploads
```

Nếu chưa có:
```Bash
mkdir -p ~/apps/duhoctgg/shared/backend/uploads
mkdir -p ~/apps/duhoctgg/shared/backend/tmp
mkdir -p ~/apps/duhoctgg/shared/backend/logs
```

---

### Bài 7.2

Symlink

Trong thư mục backend
```Bash
repo/backend
```

không lưu .env

Thay vào đó
```Bash
cd ~/apps/duhoctgg/repo/backend

ln -s ../../shared/backend/.env .env
```

Kiểm tra
```Bash
ls -la
```

Kỳ vọng
```Bash
.env -> ../../shared/backend/.env
```

Sau này dù:
```Bash
git pull
```

hay
```Bash
git reset
```

thì .env vẫn không mất.

---

**Kiểm tra dotenv**

Trong
```Bash
src/config/env.js
```

nếu bạn đang có
```Bash
import dotenv from "dotenv";

dotenv.config();
```

thì giữ nguyên.

Không cần sửa.

---

### Bài 7.3 - Hoàn thiện Database Pool

Sau đó mình sẽ sửa
```Bash
config/db.js
```

thành production.

Hiện tại
```Bash
new Pool({
...
});
```

vẫn chạy tốt.

Nhưng mình muốn sửa thành
```Bash
import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";
const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

pool.on("connect", () => {
    console.log("PostgreSQL connected.");
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

export default {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool
};
```

Ý nghĩa

|Thuộc tính	|Ý nghĩa|
|--|--|
|max	|tối đa 20 connection|
|idleTimeoutMillis	|tự đóng connection rảnh|
|connectionTimeoutMillis	|nếu DB chết thì sau 5 giây báo lỗi|

Đây là cấu hình production khá chuẩn.

---

### Bài 7.4 - Chạy thử Backend (chưa dùng PM2)

SĐây là bước rất nhiều người bỏ qua.

#### Bước 1

Vào backend
```Bash
cd ~/apps/duhoctgg/repo/backend
```
---

#### Bước 2

Cài package
```Bash
npm install
```

Nếu sau này clone lại chỉ cần
```Bash
npm ci
```

---

#### Bước 3

Kiểm tra Node
```Bash
node -v
```

Nếu chưa có Node 22 thì chưa chạy, vì mình muốn cài Node LTS trước.

👉 Hãy chạy:
```Bash
node -v
npm -v
```

và gửi mình kết quả trước khi npm install.

---

#### Bước 4

Kiểm tra .env
```Bash
ls -la
```

Bạn phải thấy
```Bash
.env -> ../../shared/backend/.env
```

Nếu chưa có symlink thì tạo:
```Bash
ln -s ../../shared/backend/.env .env
```

---

#### Bước 5

Chạy backend
```Bash
npm run dev
```

hoặc
```Bash
node src/app.js
```

Tùy script của bạn.

---

#### Bước 6

Kiểm tra backend

Trong VPS
```Bash
curl http://localhost:3001
```

hoặc
```Bash
curl http://127.0.0.1:3001
```

Nếu có API:
```Bash
404
```

cũng là thành công.

Nếu
```Bash
Connection refused
```

thì backend chưa chạy.

---

### Bài 7.5 - Cài PM2

Chỉ thực hiện sau khi backend chạy ổn bằng node.

#### Bước 1

Cài Node LTS (nếu chưa có)

Mình sẽ hướng dẫn riêng nếu VPS chưa có Node 22.

---

#### Bước 2

Cài PM2
```Bash
sudo npm install -g pm2
```

Kiểm tra
```Bash
pm2 -v
```

---

#### Bước 3

Khởi động backend
```Bash
cd ~/apps/duhoctgg/repo/backend
pm2 start src/app.js --name duhoctgg-api
```

Kiểm tra
```Bash
pm2 list
```

Kết quả mong muốn:
```Bash
┌────┬───────────────┬────────┬────────┐
│ id │ name          │ status │ cpu    │
├────┼───────────────┼────────┼────────┤
│ 0  │ duhoctgg-api  │ online │ 0%     │
└────┴───────────────┴────────┴────────┘
```

---

#### Bước 4

Xem log
```Bash
pm2 logs duhoctgg-api
```

Nếu thấy:
```Bash
PostgreSQL connected.
```

là rất tốt.

---

#### Bước 5

Lưu cấu hình
```Bash
pm2 save
```

---

#### Bước 6

Cho PM2 tự khởi động
```Bash
pm2 startup
```

PM2 sẽ hiện một lệnh kiểu:
```Bash
sudo env PATH=... pm2 startup systemd -u deploy --hp /home/deploy
```

Bạn phải copy đúng lệnh đó và chạy.

Sau đó:
```Bash
pm2 save
```

---

### Bài 7.6- Dùng ecosystem.config.cjs

Sau khi mọi thứ hoạt động ổn, không nên dùng:
```Bash
pm2 start src/app.js --name duhoctgg-api
```

nữa.

Thay vào đó, trong backend tạo file:
```Bash
ecosystem.config.cjs

module.exports = {
  apps: [
    {
      name: "duhoctgg-api",
      script: "./src/app.js",
      cwd: "/home/deploy/apps/duhoctgg/repo/backend",

      instances: 1,
      exec_mode: "fork",

      watch: false,

      autorestart: true,

      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

Khởi động:
```Bash
pm2 start ecosystem.config.cjs
```

Từ nay mọi thao tác chỉ cần:
```Bash
pm2 restart duhoctgg-api
pm2 stop duhoctgg-api
pm2 logs duhoctgg-api
pm2 delete duhoctgg-api
```

---

**Mình có một đề xuất nhỏ cho project của bạn**

Mình thấy bạn đang có:
```Bash
config

cloudinary.js

db.js

env.js

security.config.js
```

Mình khuyên chỉ đổi đúng một tên file:
```Bash
db.js

↓

database.js
```

Lý do:

- database.js rõ nghĩa hơn db.js.
- Khi dự án lớn lên, rất dễ phân biệt với các file khác như redis.js, cache.js, queue.js.
- Đây cũng là cách đặt tên phổ biến trong các dự án Node.js production.

Ngoài thay đổi nhỏ này, mình không khuyến khích refactor mạnh. Cấu trúc hiện tại của bạn đã đủ tốt để tiếp tục phát triển và triển khai. Chúng ta sẽ tập trung vào việc hoàn thiện hạ tầng production (PM2, Nginx, SSL, deploy script, backup...) thay vì thay đổi kiến trúc đang hoạt động ổn định.

---

**Mình đề xuất một thay đổi cho kiến trúc**

Hiện tại bạn đang chạy ứng dụng trong:
```
repo/backend
```

Trong ngắn hạn điều này ổn để kiểm thử.

Nhưng khi chuyển sang production hoàn chỉnh (sau Bài 8 và Bài 9), mình sẽ hướng dẫn chuyển sang:
```
/home/deploy/apps/duhoctgg/deploy/backend
```

PM2 sẽ chạy từ thư mục deploy/backend, còn repo/backend chỉ dùng để git pull và build. Điều này giúp:

- cập nhật mã nguồn mà không ảnh hưởng ứng dụng đang chạy;
- dễ rollback nếu bản mới gặp lỗi;
- chuẩn bị sẵn cho quy trình CI/CD sau này.

Đó là mô hình mình khuyến nghị cho hệ thống của bạn khi hoàn thành toàn bộ series.

---

### 7.7 - Nâng cao

Kiểm tra đăng nhập PostgreSQL bằng chính thông tin trong .env

Chạy:
```Bash
psql \
-h 127.0.0.1 \
-U duhoctgg_app \
-d duhoctgg_prod
```

Nó sẽ hỏi password.

👉 Nhập đúng password đang ghi trong `.env`.

Đăng nhập được
```Bash
duhoctgg_prod=>
```

=> Password đúng.

---

**Đổi password của PostgreSQL**

Đăng nhập postgres:

tại `deploy@tgg-prod-01:~/apps/duhoctgg/repo/backend$` hoặc `deploy@tgg-prod-01:~/apps/duhoctgg/repo$` nhập 

```Bash
sudo -u postgres psql
```

Sau đó:
```Bash
ALTER USER duhoctgg_app
WITH PASSWORD 'MatKhauMoi';
```

Ví dụ:
```Bash
ALTER USER duhoctgg_app
WITH PASSWORD 'Abc@123456';
```

Thoát:
```Bash
\q
```

---

Cách pull code từ github sau khi có chỉnh sửa được push lên branch `master` của github

```Bash
cd ~/apps/duhoctgg/repo
git clone git@github.com:USERNAME/project-duhocNB.git .
```

thì thư mục `repo` chính là `working tree` của **Git**.

Trước tiên nên kiểm tra đang ở branch nào

```Bash
cd ~/apps/duhoctgg/repo

git branch
```

Kết quả ví dụ:
```
* master
  develop
```

Dấu `*` là branch hiện tại.


```Bash
git pull origin <branch>
```

Ví dụ nếu branch chính là master:

```Bash
git pull origin master

```

---

**Mình khuyên**

Trước khi git pull, luôn chạy:
```Bash
git status
```

Nếu kết quả là:
```Bash
nothing to commit, working tree clean
```

thì có thể yên tâm:
```Bash
git pull
```

---

### 7.8 - - Khởi tạo Database bằng init_schema.sql

#### Bước 1. Kiểm tra file đã có trên VPS

Đứng trong thư mục backend:
```Bash
cd ~/apps/duhoctgg/repo/backend
```

Kiểm tra:
```Bash
ls -lh scripts/migrations
```

Kỳ vọng:
```Bash
-rw-r--r-- 1 deploy deploy 45K init_schema.sql
```

Nếu chưa có thì push GitHub rồi:
```Bash
git pull origin main
```

#### Bước 2. Xóa database cũ (vì đang là môi trường mới)

Lưu ý: Chỉ làm trên VPS mới. Không dùng trên production đang có dữ liệu.

Thoát khỏi psql nếu còn đang ở trong đó:
```Bash
\q
```

Đăng nhập postgres:
```Bash
sudo -u postgres psql
```

Xóa database:
```Bash
DROP DATABASE duhoctgg_prod;
```

Nếu báo:
```Bash
database is being accessed by other users
```

thì chạy:
```Bash
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'duhoctgg_prod';
```

Sau đó:
```Bash
DROP DATABASE duhoctgg_prod;
```

---

#### Bước 3. Tạo lại database

Vẫn trong psql:
```Bash
CREATE DATABASE duhoctgg_prod
OWNER duhoctgg_app
ENCODING 'UTF8'
LC_COLLATE 'en_US.UTF-8'
LC_CTYPE 'en_US.UTF-8'
TEMPLATE template0;
```

Thoát:
```Bash
\q
```

---

#### Bước 4. Import schema

Đứng trong backend:
```Bash
cd ~/apps/duhoctgg/repo/backend
```

Chạy:
```Bash
psql \
-h 127.0.0.1 \
-U duhoctgg_app \
-d duhoctgg_prod \
-f scripts/migrations/init_schema.sql
```

Nó sẽ hỏi password.

Nhập password của:
```Bash
duhoctgg_app
```

Nếu thành công sẽ hiện rất nhiều dòng:
```Bash
CREATE TABLE
CREATE INDEX
ALTER TABLE
INSERT 0 1
...
```

Không được có:
```Bash
ERROR:
```

---

#### Bước 5. Kiểm tra

Đăng nhập:
```Bash
psql \
-h 127.0.0.1 \
-U duhoctgg_app \
-d duhoctgg_prod
```

Sau đó:
```Bash
\dt
```

Ví dụ:
```Bash
users
news
schools
settings
media_asset_refs
...
```

Tiếp theo:
```Bash
SELECT COUNT(*)
FROM users;
```

Nếu bảng tồn tại thì sẽ không báo lỗi.

Thoát:
```Bash
\q
```

---

#### Bước 6. Tạm thời bỏ các ensure

Trong app.js hiện tại có:
```Bash
await ensureMediaAssetTableExists();
await ensureSettingsKeysExist();
await ensureAboutMissionsTableExists();
await ensureAboutContentTableExists();
await ensureHomepageSectionsTableExists();
await ensurePopupCampaignsTableExists();
```

Tạm thời comment lại:
```Bash
// await ensureMediaAssetTableExists();
// await ensureSettingsKeysExist();
// await ensureAboutMissionsTableExists();
// await ensureAboutContentTableExists();
// await ensureHomepageSectionsTableExists();
// await ensurePopupCampaignsTableExists();
```

Sau khi hệ thống chạy ổn, chúng ta sẽ xem xét giữ lại những hàm nào thực sự cần thiết (ví dụ để chèn dữ liệu mặc định), còn các hàm tạo bảng sẽ không cần nữa.

Bước 7. Chạy thử
```Bash
npm run dev
```

Nếu schema đã import đúng thì backend sẽ chạy mà không còn lỗi:
```Bash
Server started successfully
```

---

## Bài 8: Deploy Frontend Nuxt 4

Chúng ta sẽ làm theo đúng chuẩn production:
```Bash
repo/frontend
        │
        │ npm install
        │
        ▼
npm run build
        │
        ▼
.output/
        │
        ▼
PM2
        │
        ▼
Port 3000
        │
        ▼
Nginx
        │
        ▼
https://duhoctgg.edu.vn

```

Trong bài này mình sẽ hướng dẫn:

- Cài Node cho frontend (nếu cần)
- npm install
- Tạo .env.production
- Build Nuxt 4
- Chạy bằng PM2
- Kiểm tra hoạt động trên cổng 3000

Đây là roadmap tiếp theo của series:
```Bash
Bài 8.1  Cài PM2
Bài 8.2  Deploy Backend bằng PM2
Bài 8.3  Deploy Frontend Nuxt4
Bài 8.4  Reverse Proxy bằng Nginx
Bài 8.5  HTTPS (Let's Encrypt)
Bài 8.6  Auto Deploy từ Github
```

---

### Bài 8.1 - Cài PM2

Hiện tại backend của bạn đang chạy bằng
```Bash
npm run dev
```

Đây là chế độ development.

Production phải chạy kiểu này:
```Bash
PM2
    ↓
Node
    ↓
Express
```

PM2 sẽ có các chức năng:

- tự restart nếu app crash
- tự khởi động khi VPS reboot
- xem log
- restart/update dễ dàng

---

#### Bước 1. Dừng nodemon

Ở cửa sổ đang chạy backend
```Bash
Ctrl + C
```

Kiểm tra
```Bash
sudo ss -ltnp | grep 3001
```

Nếu không còn gì trả về là đúng.

#### Bước 2. Cài PM2

```Bash
sudo npm install -g pm2
```

Kiểm tra
```Bash
pm2 -v
```

Ví dụ
```Bash
6.x.x
```

---

#### Bước 3. Kiểm tra Node

```Bash
which node
```

Ví dụ
```Bash
/usr/bin/node
```

và
```Bash
which npm
```

Ví dụ
```Bash
/usr/bin/npm
```

---

### Bài 8.2 - Chuẩn bị Backend Production

Hiện tại project của bạn

```Bash
~/apps/duhoctgg/repo/backend
```

đã chạy ổn.

Ta sẽ chưa dùng thư mục deploy/.

Ta chạy trực tiếp từ repo trước.

Sau khi Auto Deploy xong mới chuyển sang deploy/.

---

#### Bước 4. Tạo ecosystem.config.cjs

Trong
```Bash
~/apps/duhoctgg/repo/backend
```

tạo file
```Bash
ecosystem.config.cjs
```

Nội dung

```Bash
module.exports = {
  apps: [
    {
      name: "duhoctgg-backend",

      script: "./src/app.js",

      cwd: "/home/deploy/apps/duhoctgg/repo/backend",

      interpreter: "node",

      instances: 1,

      exec_mode: "fork",

      autorestart: true,

      watch: false,

      max_memory_restart: "500M",

      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
```

Sau này có website thứ hai chỉ cần thêm app.

---

#### Bước 5. Khởi động bằng PM2

```Bash
cd ~/apps/duhoctgg/repo/backend
pm2 start ecosystem.config.cjs
```

---

#### Bước 6. Kiểm tra

```Bash
pm2 status
```

Kỳ vọng
```Bash
┌────┬─────────────────────┬────────┬────────┐
│ id │ name                │ status │ cpu    │
├────┼─────────────────────┼────────┼────────┤
│ 0  │ duhoctgg-backend    │ online │ 0%     │
└────┴─────────────────────┴────────┴────────┘
```

---

#### Bước 7. Xem log

```Bash
pm2 logs duhoctgg-backend
```

Nếu thành công sẽ thấy
```Bash
Đã kết nối với PostgreSQL
```

hoặc
```Bash
Server started successfully
```

---

#### Bước 8. Kiểm tra API

Mở terminal khác
```Bash
curl http://127.0.0.1:3001
```

phải trả về
```Bash
API is running...
```

---

#### Bước 9. PM2 tự khởi động sau reboot

Đây là bước nhiều người quên.

Chạy
```Bash
pm2 startup
```

Nó sẽ hiện đại loại như
```Bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

Không tự gõ lại.

👉 Copy đúng dòng mà PM2 in ra và chạy.

Sau đó
```Bash
pm2 save
```

Kiểm tra
```Bash
pm2 list

```

Lúc này VPS của bạn sẽ có:
```Bash
Internet
      │
      ▼
PM2
      │
      ▼
Backend (Express)
      │
Port 3001
```

---

#### Bước 10 - Dọn db.js

Xóa toàn bộ đoạn debug này:
```Bash
const client = await pool.connect();

const result = await client.query(`
SELECT
    current_user,
    current_schema(),
    current_setting('search_path')
`);

console.log(result.rows);

client.release();

console.log("=================");
```

Chỉ giữ:
```Bash
import dotenv from "dotenv";
dotenv.config();

import pkg from "pg";

const { Pool } = pkg;

const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,

    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 5000,
});

let logged = false;

pool.on("connect", () => {
    if (!logged) {
        console.log("PostgreSQL connected.");
        logged = true;
    }
});

pool.on("error", (err) => {
    console.error("Unexpected PostgreSQL error:", err);
});

export default {
    query: (text, params) => pool.query(text, params),
    getClient: () => pool.connect(),
    pool
};

```

Như vậy log sẽ chỉ hiện 1 lần.

---

#### Bước 11 - Restart PM2

```Bash
pm2 restart duhoctgg-backend
```

Kiểm tra
```Bash
pm2 logs duhoctgg-backend --lines 20
```

Lúc này log đẹp sẽ kiểu:
```Bash
PostgreSQL connected.
```

Không còn mấy dòng debug nữa.

---

#### Bước 12 - PM2 tự khởi động khi reboot

Đây là bước cực kỳ quan trọng.

Chạy
```Bash
pm2 startup
```

PM2 sẽ in ra một dòng lệnh rất dài.

Ví dụ
```Bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u deploy --hp /home/deploy
```

Không tự gõ.

👉 Copy nguyên dòng PM2 sinh ra rồi chạy.

Sau đó
```Bash
pm2 save
```

Kiểm tra
```Bash
pm2 list
```

---

#### Bước 13 - Sau đó thử reboot VPS

Đây là bài test production.
```Bash
sudo reboot
```

Đợi khoảng 30–60 giây.

SSH lại.

Kiểm tra:
```Bash
pm2 list
```

Kỳ vọng
```Bash
duhoctgg-backend online
```

Kiểm tra tiếp
```Bash
curl http://127.0.0.1:3001
```

Nếu trả về
```Bash
API is running...
```

=> Backend production đã hoàn thiện 100%.

---

## Bài 9: Deploy Nuxt4 Production

Roadmap hiện tại
```Bash
✓ Bài 1  Chuẩn bị VPS
✓ Bài 2  Bảo mật VPS
✓ Bài 3  Cấu trúc thư mục
✓ Bài 4  Git
✓ Bài 5  Shared Config
✓ Bài 6  PostgreSQL
✓ Bài 7  Backend chạy thành công
✓ Bài 8  PM2 Backend

↓

Bài 9   Deploy Nuxt4 Production
Bài 10  Nginx Reverse Proxy
Bài 11  HTTPS (Let's Encrypt)
Bài 12  Deploy Script
Bài 13  Backup
Bài 14  Monitoring
```

---

**Mục tiêu**

Đến cuối bài này sẽ có
```Bash
PM2
 │
 ├── duhoctgg-backend
 │       Port 3001
 │
 └── duhoctgg-frontend
         Port 3000
```

Nginx sẽ làm ở bài sau.

---

### Bước 1. Kiểm tra frontend

Đi tới frontend
```Bash
cd ~/apps/duhoctgg/repo/frontend
```

Kiểm tra
```Bash
ls
```

Bạn sẽ thấy
```Bash
app.vue
nuxt.config.ts
package.json
pages/
components/
...
```

---

### Bước 2. Cài package

```Bash
npm install
```

Chọn No nếu được hỏi:
```Bash
ℹ Nuxt collects completely anonymous data about usage.                                                     7:41:59 PM
  This will help us improve Nuxt developer experience over time.
  Read more on https://github.com/nuxt/telemetry


❯ Are you interested in participating?
○ Yes / ● No
```


Kiểm tra
```Bash
npm ls
```

Không cần quan tâm warning.

---

### Bước 3. Kiểm tra package.json

Mình muốn xác nhận script.

Chạy
```Bash
cat package.json
```

Mình muốn thấy
```Bash
{
  "scripts": {
    "dev": "...",
    "build": "...",
    "preview": "..."
  }
}
```

---

### Bước 4. Tạo shared frontend

Ta không để `.env` trong `repo`.

Tạo thư mục
```Bash
mkdir -p ~/apps/duhoctgg/shared/frontend
```

---

### Bước 5. Tạo .env

```
nano ~/apps/duhoctgg/shared/frontend/.env
```

Ví dụ
```Bash
NODE_ENV=production

NUXT_PUBLIC_SITE_URL=https://duhoctgg.edu.vn

NUXT_PUBLIC_API_BASE=http://127.0.0.1:3001
```

Sau này khi có HTTPS ta sẽ đổi thành
```Bash
https://duhoctgg.edu.vn/api
```

Hiện tại cứ để localhost.

Lưu
```Bash
Ctrl+O

Enter

Ctrl+X
```

---

### Bước 6. Link .env

Đi tới frontend
```Bash
cd ~/apps/duhoctgg/repo/frontend
```

Xóa nếu có
```Bash
rm -f .env
```

Tạo symlink
```Bash
ln -s ~/apps/duhoctgg/shared/frontend/.env .env
```

Kiểm tra
```Bash
ls -l
```

Kỳ vọng
```Bash
.env -> /home/deploy/apps/duhoctgg/shared/frontend/.env

```

---

### Bước 7. Kiểm tra nuxt.config

Đây là bước rất quan trọng.

Mình muốn xem file
```Bash
nuxt.config.ts
```

đặc biệt phần
```Bash
runtimeConfig
```

Ví dụ
```Bash
runtimeConfig:{
    ...
    public:{
        ...
    }
}
```

Nếu chưa có thì mình sẽ hướng dẫn sửa theo chuẩn production.

---

### Bước 8. Build thử

```Bash
npm run build
```

Nếu thành công sẽ sinh
```Bash
.output/
```

Kiểm tra
```Bash
ls .output
```

Kỳ vọng
```Bash
public

server

nitro.json
```

---

### Bước 9. Test Production

Không dùng
```Bash
npm run dev
```

Mà dùng
```Bash
node .output/server/index.mjs
```

Mở terminal khác
```Bash
curl http://127.0.0.1:3000
```

Nếu trả HTML là build thành công.

---

### Bước 10. Chạy bằng PM2

Tạo file
```Bash
ecosystem.config.cjs
```

Mình sẽ hướng dẫn sau khi build thành công.

Đến đây mình cần xem 2 file

Để tránh phải sửa đi sửa lại sau này, bạn hãy gửi mình:

1.
```Bash
frontend/package.json
```

2.
```Bash
frontend/nuxt.config.ts
```

Sau khi xem hai file này, mình sẽ hướng dẫn cấu hình đúng chuẩn Nuxt 4 production, tránh việc phải sửa lại khi cấu hình Nginx và website thứ hai sau này. Đây cũng là lúc mình sẽ giúp bạn thiết kế để hai website có thể dùng chung một quy trình deploy trên cùng VPS.

---

### Bước 11 - Trước tiên, sửa nuxt.config.ts

Hiện tại bạn có:
```Bash
ssr: false,
```
nên đổi thành

```Bash
ssr: true
```

#### 1. Tắt devtools

Hiện tại
```Bash
devtools: {
    enabled: true
}
```

Production nên đổi thành
```Bash
devtools: {
    enabled: false
}
```

---

#### 2. Xóa vite.server.proxy

Hiện tại
```Bash
vite: {
  optimizeDeps: {...},
  server:{
      proxy:{
          '/api':{
              target:'http://localhost:5000'
          }
      }
  }
}
```

Đây chỉ hoạt động khi chạy
```Bash
npm run dev
```

Production không dùng.

Xóa toàn bộ
```Bash
server:{
    proxy:{...}
}
```

chỉ giữ
```Bash
vite:{
    optimizeDeps:{
        include:[
            "jwt-decode"
        ]
    }
}
```

---

#### 3. RuntimeConfig

Hiện tại
```Bash
runtimeConfig:{
    public:{
        apiBase:"http://localhost:5000/api"
    }
}
```

Đổi thành
```Bash
runtimeConfig: {
    public: {
        apiBase: process.env.NUXT_PUBLIC_API_BASE || "/api"
    }
}
```

Đây là cách Nuxt khuyến nghị sử dụng biến môi trường thay vì hard-code.

---

#### 4. Sửa file .env

Hiện tại bạn đang để:
```Bash
NUXT_PUBLIC_API_BASE=http://127.0.0.1:3001
```

Đổi thành
```Bash
NODE_ENV=production

NUXT_PUBLIC_SITE_URL=https://duhoctgg.edu.vn

NUXT_PUBLIC_API_BASE=/api
```

Lý do:

Sau này Nginx sẽ chuyển tiếp:
```Bash
Browser

https://duhoctgg.edu.vn/api

↓

Nginx

↓

127.0.0.1:3001
```

Frontend sẽ không cần biết backend chạy cổng nào.

Đây là kiến trúc chuẩn production.

#### Sau khi sửa

push code len git va pull code vao VPS

Chạy
```Bash
npm run build
```

Nếu build thành công

Bạn sẽ thấy
```Bash
.output/
```

Kiểm tra
```Bash
ls .output
```

kỳ vọng
```Bash
nitro.json

public/

server/
```

---

**Hiện tại mục tiêu của chúng ta là:**
```Bash
Internet
      │
      ▼
Nginx (Bài 10)
      │
      ├──────────────► Nuxt4 SSR (Port 3000)
      │
      └──────────────► Express API (Port 3001)
```

Backend đã chạy bằng PM2.

Giờ bắt đầu frontend.

---

### Bước 12 - Tạo ecosystem cho Frontend

Trong frontend

```Bash
nano ecosystem.config.cjs
```

Nội dung
```Bash
module.exports = {
  apps: [
    {
      name: "duhoctgg-frontend",

      script: ".output/server/index.mjs",

      cwd: "/home/deploy/apps/duhoctgg/repo/frontend",

      interpreter: "/usr/bin/node",

      instances: 1,

      exec_mode: "fork",

      autorestart: true,

      watch: false,

      max_memory_restart: "800M",

      env: {
        NODE_ENV: "production",
        PORT: 3000
      }
    }
  ]
}
```

---

### Bước 13 - Khởi động PM2

```Bash
pm2 start ecosystem.config.cjs
```

Kiểm tra
```Bash
pm2 list
```

Kỳ vọng
```Bash
┌──────────────────────┐
duhoctgg-backend

online
──────────────────────

duhoctgg-frontend

online
└──────────────────────┘
```

---

### Bước 14 -  Kiểm tra log

```Bash
pm2 logs duhoctgg-frontend
```

Kỳ vọng
```Bash
Listening on http://0.0.0.0:3000
```

Không có Error.

---

### Bước 15 -  Kiểm tra Port

```Bash
sudo ss -ltnp | grep 3000
```

Kỳ vọng
```Bash
LISTEN

*:3000
Bước 9.8 Test
curl http://127.0.0.1:3000
```

Nếu ra HTML là frontend production đã hoạt động.

---

### Bước 16 -  Test

```Bash
curl http://127.0.0.1:3000
```

Nếu ra HTML là frontend production đã hoạt động.

---

### Bước 17 - Lưu PM2

Sau khi frontend chạy
```Bash
pm2 save
```

Kiểm tra
```Bash
pm2 list
```

Bạn sẽ có
```Bash
Backend
↓

PM2

↓

Port 3001

Frontend
↓

PM2

↓

Port 3000

```

---

## Bài 10 - Cài Nginx Reverse Proxy

Kiến trúc cuối cùng sẽ là:
```Bash
Internet
      │
      ▼
    Nginx :80 / :443
      │
      ├────────────► Nuxt4 SSR (127.0.0.1:3000)
      │
      └────────────► Express API (127.0.0.1:3001)
```

Từ giờ trở đi:
```Bash
https://duhoctgg.edu.vn/
```

không truy cập trực tiếp vào NodeJS nữa.

---

### Bước 10.1 Cài nginx

```Bash
sudo apt update

sudo apt install nginx -y
```

Kiểm tra
```Bash
nginx -v
```

Ví dụ
```Bash
nginx version: nginx/1.24.x
```

--- 

### Bước 10.2 Khởi động nginx

```Bash
sudo systemctl enable nginx

sudo systemctl start nginx
```

Kiểm tra
```Bash
sudo systemctl status nginx
```

phải thấy
```Bash
active (running)
```

---

### Bước 10.3 Firewall

Bạn đã mở
```Bash
80

443
```

từ trước.

Kiểm tra lại
```Bash
sudo ufw status
```

phải có
```Bash
80
443
```

---

### Bước 10.4 Xóa site mặc định

```Bash
sudo rm -f /etc/nginx/sites-enabled/default

sudo rm -f /etc/nginx/sites-available/default
```

---

### Bước 10.5 Tạo Virtual Host

```Bash
sudo nano /etc/nginx/sites-available/duhoctgg
```

Dán toàn bộ nội dung sau:
```Bash
server {

    listen 80;

    server_name duhoctgg.edu.vn www.duhoctgg.edu.vn;

    client_max_body_size 25M;

    location / {

        proxy_pass http://127.0.0.1:3000;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /api/ {

        proxy_pass http://127.0.0.1:3001/api/;

        proxy_http_version 1.1;

        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

    }

}
```

Lưu:
```Bash
Ctrl+O

Enter

Ctrl+X
```

---

### Giải thích

```Bash
Trang chủ

/

↓

Nuxt4
```

API
```Bash
/api

↓

Express
```

Sau này frontend chỉ gọi
```Bash
fetch("/api/news")
```

không cần biết backend chạy cổng bao nhiêu.

---

### Bước 10.6 Enable site

```Bash
sudo ln -s /etc/nginx/sites-available/duhoctgg \
/etc/nginx/sites-enabled/
```

Kiểm tra
```Bash
ls /etc/nginx/sites-enabled
```

kỳ vọng
```Bash
duhoctgg
```

---

### Bước 10.7 Kiểm tra cấu hình

```Bash
sudo nginx -t
```

Nếu đúng sẽ thấy
```Bash
syntax is ok

test is successful
```


---

### Bước 10.8 Reload nginx

```Bash
sudo systemctl reload nginx
```

---

### Bước 10.9 Kiểm tra port

```Bash
sudo ss -ltnp | grep nginx
```

kỳ vọng
```Bash
*:80
```

---

### Bước 10.10 Test nội bộ

Ngay trên VPS
```Bash
curl http://127.0.0.1
```

Nếu cấu hình đúng, bạn sẽ thấy HTML của Nuxt (bắt đầu bằng <!DOCTYPE html>).

Tiếp theo:
```Bash
curl http://127.0.0.1/api
```

hoặc một API public của bạn, ví dụ:
```Bash
curl http://127.0.0.1/api/public/settings
```

(nếu route đó tồn tại).

---

### Bước 10.11 Trỏ DNS (nếu chưa)

Đây là điều kiện để tên miền hoạt động.

Tại nơi bạn quản lý DNS của `duhoctgg.edu.vn`, tạo:

|Type	|Name	|Value|
|--|--|
|A	|@	|IP VPS|
|A	|www	|IP VPS|


Ví dụ:
```Bash
@ → 103.xxx.xxx.xxx

www → 103.xxx.xxx.xxx
```

Không cần AAAA nếu VPS chưa có IPv6.

--- 

### Dừng lại ở đây

Đừng cài SSL ngay.

Mình muốn bạn gửi kết quả của các lệnh sau:
```Bash
sudo nginx -t
sudo systemctl status nginx
curl http://127.0.0.1
curl http://127.0.0.1/api
```

và cho biết DNS của duhoctgg.edu.vn đã trỏ về IP VPS chưa.

Mình cũng muốn chỉnh một chút cấu hình Nginx (gzip, cache header, security header...) trước khi cài HTTPS ở Bài 11 để đạt chuẩn production ngay từ đầu.





```Bash

```


```Bash

```


```Bash

```


```Bash

```


```Bash

```


```Bash

```


```Bash

```


```Bash

```


```Bash

```


```Bash

```

```
```
