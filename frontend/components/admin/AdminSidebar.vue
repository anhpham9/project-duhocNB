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
                <!-- Loading state for menu items -->
                <template v-if="loadingUser">
                    <li class="nav-item loading">
                        <div class="nav-link">
                            <i class="fas fa-spinner fa-spin"></i>
                            <span>Đang tải...</span>
                        </div>
                    </li>
                </template>
                <!-- Menu items when user data loaded -->
                <template v-else>
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
                    <li v-if="canAccessSchools" class="nav-item has-submenu" :class="{ active: openSubmenus.includes('schools') }">
                        <a href="#" class="nav-link" @click="toggleSubmenu('schools')">
                            <i class="fas fa-university"></i>
                            <span>Trường học</span>
                            <i class="fas fa-chevron-down submenu-arrow" :class="{ 'rotated': openSubmenus.includes('schools') }"></i>
                        </a>
                        <ul class="submenu" :class="{ 'open': openSubmenus.includes('schools') }">
                            <li><NuxtLink to="/admin/schools" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/schools') }">Danh sách trường</NuxtLink></li>
                            <li><NuxtLink to="/admin/schools/regions" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/schools/regions') }">Khu vực</NuxtLink></li>
                            <li><NuxtLink to="/admin/schools/types" @click="handleSubmenuLinkClick" :class="{ active: isSubmenuItemActive('/admin/schools/types') }">Loại trường</NuxtLink></li>
                        </ul>
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
                </template>
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

// Get current user from shared composable (tránh duplicate API calls)
const { 
    currentUser, 
    loadingUser, 
    fetchCurrentUser, 
    hasRole, 
    hasAnyRole,
    isSuperadmin, 
    isAdmin, 
    isManager 
} = useCurrentUser()

// Permission checks based on role_id
// Permission computed properties using composable
const canAccessUsers = computed(() => {
    return !loadingUser.value && hasAnyRole([1, 2, 3]) // Superadmin, Admin, Manager
})

const canAccessContacts = computed(() => {
    return !loadingUser.value && hasAnyRole([1, 2, 3, 5]) // Superadmin, Admin, Manager, Consultant
})

const canAccessSchools = computed(() => {
    return !loadingUser.value && hasAnyRole([1, 2, 3]) // Superadmin, Admin, Manager
})

const canAccessNews = computed(() => {
    return !loadingUser.value && hasAnyRole([1, 2, 3, 4]) // Superadmin, Admin, Manager, Editor
})

const canAccessContent = computed(() => {
    return !loadingUser.value && hasAnyRole([1, 2, 3]) // Superadmin, Admin, Manager
})

const canAccessSettings = computed(() => {
    return !loadingUser.value && hasAnyRole([1, 2]) // Superadmin, Admin only
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
    if (path.startsWith('/admin/schools')) return 'schools'
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

const handleLogout = async () => {
    if (process.client) {
        const config = useRuntimeConfig();
        
        try {
            // Show loading toast
            if (window.showToast) {
                window.showToast('Đang đăng xuất...', 'info')
            }
            
            // Call logout API to clear httpOnly cookie
            await fetch(`${config.public.apiBase}/auth/logout`, {
                method: 'POST',
                credentials: 'include' // Include cookies
            });
            
            // Clean up any localStorage data
            localStorage.removeItem('token');
            localStorage.removeItem('rememberedUsername');
            localStorage.removeItem('rememberLogin');
            
            // Show success message
            if (window.showToast) {
                window.showToast('Đã đăng xuất thành công!', 'success')
            }
            
            // Redirect to login
            setTimeout(() => {
                navigateTo('/login')
            }, 500)
            
        } catch (error) {
            console.error('Logout error:', error);
            
            // Even if API fails, still redirect to login
            if (window.showToast) {
                window.showToast('Đã đăng xuất', 'info')
            }
            
            // Clean up localStorage anyway
            localStorage.removeItem('token');
            localStorage.removeItem('rememberedUsername');  
            localStorage.removeItem('rememberLogin');
            
            setTimeout(() => {
                navigateTo('/login')
            }, 500)
        }
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
    // Fetch current user info
    fetchCurrentUser()
    
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
    fetchCurrentUser, // Allow refreshing user data from parent
    isCollapsed: readonly(isCollapsed),
    isMobileOpen: readonly(isMobileOpen),
    currentUser: readonly(currentUser),
    loadingUser: readonly(loadingUser)
})
</script>

<style scoped>
/* ========================================
   LOADING STATE
   ======================================== */
.nav-item.loading .nav-link {
    opacity: 0.6;
    pointer-events: none;
}

.nav-item.loading .fa-spin {
    animation: fa-spin 1s infinite linear;
}

@keyframes fa-spin {
    0% {
        transform: rotate(0deg);
    }
    100% {
        transform: rotate(360deg);
    }
}

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