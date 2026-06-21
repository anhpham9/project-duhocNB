<template>
    <header ref="header" class="header" :class="{ scrolled: isScrolled }">
        <nav class="navbar">
            <div class="container">
                <div class="nav-brand">
                    <NuxtLink to="/">
                        <img :src="logoSrc" :alt="logoAlt" class="logo" @error="handleImageError"
                            @load="handleImageLoad">
                    </NuxtLink>
                </div>
                <ul ref="navMenu" class="nav-menu" :class="{ active: mobileMenuOpen }">
                    <li>
                        <NuxtLink to="/" class="nav-link" :class="{ active: $route.path === '/' }"
                            @click="closeMobileMenu">Trang chủ</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/about" class="nav-link" :class="{ active: $route.path === '/about' }"
                            @click="closeMobileMenu">Giới thiệu</NuxtLink>
                    </li>
                    <li class="nav-dropdown" :class="{ 'dropdown-open': dropdownOpen }">
                        <a href="#" class="nav-link" :class="{ active: isSchoolsActive }"
                            @click.prevent="toggleDropdown">
                            Du học <i class="fas fa-chevron-down"></i>
                        </a>
                        <div class="dropdown-content">
                            <NuxtLink to="/schools" @click="closeMobileMenu">Trường Nhật Ngữ</NuxtLink>
                            <NuxtLink to="/conditions" @click="closeMobileMenu">Điều kiện du học</NuxtLink>
                        </div>
                    </li>
                    <li>
                        <NuxtLink to="/news" class="nav-link" :class="{ active: isNewsActive }"
                            @click="closeMobileMenu">Tin tức</NuxtLink>
                    </li>
                    <li>
                        <NuxtLink to="/contact" class="nav-link" :class="{ active: $route.path === '/contact' }"
                            @click="closeMobileMenu">Liên hệ</NuxtLink>
                    </li>
                </ul>
                <div ref="navToggle" class="nav-toggle" :class="{ active: mobileMenuOpen }" @click="toggleMobileMenu">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </nav>
    </header>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const config = useRuntimeConfig()
const route = useRoute()
const header = ref(null)
const navMenu = ref(null)
const navToggle = ref(null)
const isScrolled = ref(false)
const mobileMenuOpen = ref(false)
const dropdownOpen = ref(false)
let ticking = false

// Computed for active states
const isSchoolsActive = computed(() => {
    return route.path === '/schools' || route.path === '/conditions' || route.path.startsWith('/schools/')
})

const isNewsActive = computed(() => {
    return route.path === '/news' || route.path.startsWith('/news/')
})

const { data: footerData } = await useFetch(`${config.public.apiBase}/public/footer`, {
    key: 'public-footer-data'
})

const footer = computed(() => footerData.value?.data || {})

const logoAlt = computed(() => {
    return String(footer.value.siteName || '').trim() || 'Du Học NB'
})

// Computed logo path
const logoSrc = computed(() => {
    const logoUrl = String(footer.value.siteLogoUrl || '').trim()
    if (currentLogoIndex.value === 0 && logoUrl) {
        return logoUrl
    }

    return logoSources[currentLogoIndex.value] || '/logo01.png'
})

// Alternative logo sources
const logoSources = ['/logo01.png', '/logo02.png', 'https://via.placeholder.com/120x50?text=Logo']
const currentLogoIndex = ref(0)

// Image debugging (simplified)
const handleImageError = (event) => {
    console.error('Header Logo failed to load:', event.target.src)
    // Try next logo source
    currentLogoIndex.value++
    if (currentLogoIndex.value <= logoSources.length) {
        console.log('Trying alternative logo:', logoSrc.value)
    }
}

const handleImageLoad = (event) => {
    console.log('✅ Header Logo loaded successfully:', event.target.src)
}

// Header scroll effect
const handleScroll = () => {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop
    isScrolled.value = scrollTop > 50
    ticking = false
}

const requestTick = () => {
    if (!ticking) {
        requestAnimationFrame(handleScroll)
        ticking = true
    }
}

// Mobile menu toggle
const toggleMobileMenu = () => {
    mobileMenuOpen.value = !mobileMenuOpen.value
    dropdownOpen.value = false // Close dropdown when toggling menu
}

const closeMobileMenu = () => {
    mobileMenuOpen.value = false
    dropdownOpen.value = false
}

// Dropdown toggle
const toggleDropdown = () => {
    if (window.innerWidth <= 768) {
        dropdownOpen.value = !dropdownOpen.value
    }
}

// Close menu when clicking outside
const handleClickOutside = (event) => {
    if (navToggle.value && navMenu.value &&
        !navToggle.value.contains(event.target) &&
        !navMenu.value.contains(event.target)) {
        closeMobileMenu()
    }
}

// Keyboard navigation
const handleKeydown = (event) => {
    if (event.key === 'Escape') {
        closeMobileMenu()
    }
}

onMounted(() => {
    console.log('Header component mounted - Logo working!')

    window.addEventListener('scroll', requestTick, { passive: true })
    document.addEventListener('click', handleClickOutside)
    document.addEventListener('keydown', handleKeydown)
})

onBeforeUnmount(() => {
    window.removeEventListener('scroll', requestTick)
    document.removeEventListener('click', handleClickOutside)
    document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* Header */
.header {
    background: white;
    position: fixed;
    top: 40px;
    left: 0;
    width: 100%;
    z-index: 1002;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.header.scrolled {
    top: 0;
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(10px);
    box-shadow: 0 2px 15px rgba(0, 0, 0, 0.2);
}

.nav-brand>a {
    display: flex;
    align-items: center;
}

.navbar {
    padding: 5px 0;
    transition: all 0.3s ease;
}

.header.scrolled .navbar {
    padding: 0;
}

.nav-brand .logo {
    height: 60px;
    width: auto;
    transition: all 0.3s ease;
}

/* .header.scrolled .nav-brand .logo {
    height: 35px;
} */

.navbar .container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    /* padding: 10px 20px; */
}

.nav-menu {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 10px 0;
    transition: all 0.3s ease;
}

.nav-menu li {
    margin-left: 30px;
}

.nav-link {
    color: #333;
    text-decoration: none;
    font-weight: 500;
    padding: 10px 0;
    position: relative;
    transition: all 0.3s ease;
}

.nav-link:hover,
.nav-link.active {
    color: #d32f2f;
}

.nav-link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 2px;
    background: #d32f2f;
    transition: width 0.3s ease;
}

.nav-link:hover::after,
.nav-link.active::after {
    width: 100%;
}

/* Navigation Dropdown */
.nav-dropdown {
    position: relative;
}

.nav-dropdown .nav-link i {
    margin-left: 5px;
    font-size: 0.8rem;
    transition: transform 0.3s ease;
}

.nav-dropdown:hover .nav-link i {
    transform: rotate(180deg);
}

.dropdown-content {
    position: absolute;
    top: 100%;
    left: 0;
    background: white;
    min-width: 200px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    border-radius: 8px;
    padding: 10px 0;
    opacity: 0;
    visibility: hidden;
    transform: translateY(-10px);
    transition: all 0.3s ease;
    z-index: 1000;
}

.nav-dropdown:hover .dropdown-content {
    opacity: 1;
    visibility: visible;
    transform: translateY(0);
}

.dropdown-content a {
    display: block;
    padding: 12px 20px;
    color: #333;
    text-decoration: none;
    transition: all 0.3s ease;
    border-radius: 0;
}

.dropdown-content a:hover,
.dropdown-content a.active {
    background: #f8f9fa;
    color: #d32f2f;
    padding-left: 25px;
}

.dropdown-content a::after {
    display: none;
}

.nav-toggle {
    display: none;
    flex-direction: column;
    cursor: pointer;
}

.nav-toggle span {
    width: 25px;
    height: 3px;
    background: #333;
    margin: 3px 0;
    transition: 0.3s;
}

@media (max-width: 1024px) {}

@media (max-width: 768px) {

    /* Navigation */
    .nav-menu {
        position: fixed;
        top: 110px;
        left: -100%;
        width: 100%;
        height: calc(100vh - 110px);
        background: rgb(255, 255, 255);
        flex-direction: column;
        align-items: center;
        justify-content: flex-start;
        padding-top: 50px;
        transition: left 0.3s ease;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    }

    .header.scrolled .nav-menu {
        top: 60px;
        height: calc(100vh - 60px);
    }

    .nav-menu.active {
        left: 0;
    }

    .nav-menu li {
        margin: 0 0 30px 0;
    }

    .nav-dropdown>.nav-link {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    .nav-toggle {
        display: flex;
    }

    .nav-toggle.active span:nth-child(1) {
        transform: rotate(-45deg) translate(-5px, 6px);
    }

    .nav-toggle.active span:nth-child(2) {
        opacity: 0;
    }

    .nav-toggle.active span:nth-child(3) {
        transform: rotate(45deg) translate(-5px, -6px);
    }

    /* Navigation Dropdown - Mobile */
    .nav-dropdown .dropdown-content {
        position: static;
        opacity: 1;
        visibility: visible;
        transform: none;
        box-shadow: none;
        /* background: #f8f9fa; */
        border-radius: 8px;
        /* margin: 10px 0; */
        padding: 0;
        max-height: 0;
        overflow: hidden;
        transition: max-height 0.3s ease;
        min-width: auto;
    }

    /* Mobile dropdown open state - triggered by JavaScript */
    .nav-dropdown.dropdown-open .dropdown-content {
        max-height: 200px;
        padding: 10px 0;
    }

    .nav-dropdown.dropdown-open .nav-link i,
    .nav-dropdown.dropdown-open>a i {
        transform: rotate(180deg) !important;
        transition: transform 0.3s ease !important;
    }

    /* Ensure default state on mobile */
    .nav-dropdown .nav-link i,
    .nav-dropdown>a i {
        transform: rotate(0deg);
        transition: transform 0.3s ease;
    }

    /* Disable desktop hover on mobile */
    .nav-dropdown:hover .nav-link i {
        transform: none;
    }

    .dropdown-content a {
        padding: 10px 20px;
        font-size: 0.9rem;
        border-bottom: 1px solid #e9ecef;
        text-align: center;
    }

    .dropdown-content a.active {
        background-color: transparent;
    }

    .dropdown-content a:last-child {
        border-bottom: none;
    }

    .nav-dropdown .nav-link i {
        float: right;
        margin-top: 2px;
    }
}

@media (max-width: 480px) {}

@media (max-width: 768px) and (orientation: landscape) {
    .nav-menu {
        height: calc(100vh - 125px);
        padding-top: 30px;
    }

    .header.scrolled .nav-menu {
        height: calc(100vh - 70px);
    }

    .nav-menu li {
        margin: 0 0 20px 0;
    }
}
</style>