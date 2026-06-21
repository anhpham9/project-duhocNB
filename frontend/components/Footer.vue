<template>
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>{{ footerBrandName }}</h3>
                    <p>{{ footerDescription }}</p>
                    <div class="social-links">
                        <a
                            v-for="item in socialLinks"
                            :key="item.id"
                            :href="item.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            :title="item.description || item.name"
                            :aria-label="item.name"
                        >
                            <i :class="item.icon || 'fas fa-link'"></i>
                        </a>
                    </div>
                </div>
                <div class="footer-section">
                    <h4>Dịch vụ</h4>
                    <ul>
                        <li v-for="item in serviceLinks" :key="item.to">
                            <NuxtLink :to="item.to">{{ item.label }}</NuxtLink>
                        </li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h4>Liên hệ</h4>
                    <ul>
                        <li v-if="displayHotline"><i class="fas fa-phone-volume"></i> {{ displayHotline }}</li>
                        <li v-if="displayPhone"><i class="fas fa-phone"></i> {{ displayPhone }}</li>
                        <li v-if="displayEmail"><i class="fas fa-envelope"></i> {{ displayEmail }}</li>
                        <li v-if="displayAddress"><i class="fas fa-map-marker-alt"></i> {{ displayAddress }}</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <p>{{ footerCopyright }}</p>
            </div>
        </div>
    </footer>
</template>

<script setup>
const config = useRuntimeConfig()

const FALLBACK_FOOTER = {
    siteName: 'Du Học NB',
    siteDescription: 'Đồng hành cùng bạn trên hành trình chinh phục ước mơ du học.',
    siteCopyright: '',
    companyShortName: 'Du Học NB',
    contactEmail: '',
    phone: '',
    hotline: '',
    address: '123 Đường ABC, Q1, HCM',
    socialLinks: [
        { id: 'fallback-facebook', name: 'Facebook', icon: 'fab fa-facebook', url: '#' },
        { id: 'fallback-tiktok', name: 'TikTok', icon: 'fab fa-tiktok', url: '#' },
        { id: 'fallback-youtube', name: 'YouTube', icon: 'fab fa-youtube', url: '#' },
        { id: 'fallback-instagram', name: 'Instagram', icon: 'fab fa-instagram', url: '#' }
    ]
}

const serviceLinks = [
    { to: '/schools', label: 'Tư vấn chọn trường' },
    { to: '/conditions', label: 'Hỗ trợ hồ sơ' },
    { to: '/faq-demo', label: 'Visa & Thủ tục' },
    { to: '/contact', label: 'Hỗ trợ lưu trú' }
]

const { data } = await useFetch(`${config.public.apiBase}/public/footer`, {
    key: 'public-footer-data'
})

const footer = computed(() => {
    const apiData = data.value?.data || {}
    return {
        ...FALLBACK_FOOTER,
        ...apiData
    }
})

const socialLinks = computed(() => {
    const list = Array.isArray(footer.value.socialLinks) ? footer.value.socialLinks : []
    const valid = list.filter((item) => String(item?.url || '').trim())
    return valid.length > 0 ? valid : FALLBACK_FOOTER.socialLinks
})

const footerBrandName = computed(() => {
    return footer.value.siteName || footer.value.companyShortName || FALLBACK_FOOTER.siteName
})

const footerDescription = computed(() => {
    return footer.value.siteDescription || FALLBACK_FOOTER.siteDescription
})

const displayHotline = computed(() => {
    return footer.value.hotline || FALLBACK_FOOTER.hotline
})

const displayPhone = computed(() => {
    return footer.value.phone || FALLBACK_FOOTER.phone
})

const displayEmail = computed(() => {
    return footer.value.contactEmail || FALLBACK_FOOTER.contactEmail
})

const displayAddress = computed(() => {
    return footer.value.address || FALLBACK_FOOTER.address
})

const footerCopyright = computed(() => {
    const custom = String(footer.value.siteCopyright || '').trim()
    if (custom) return custom

    const year = new Date().getFullYear()
    return `© ${year} ${footerBrandName.value}. All rights reserved.`
})

</script>

<style scoped>
/* Footer */
.footer {
    /* background: #d32f2f; */
    color: white;
    padding: 180px 0 20px;
    background-image:
        linear-gradient(rgba(211, 47, 47, 0.8), rgba(211, 47, 47, 0.8)),
        url('/footer-bg.jpg');

    background-size: cover;
    /* ảnh phủ full chiều rộng */
    background-position: bottom;
    /* căn giữa ảnh */
    background-repeat: no-repeat;
    /* không lặp ảnh */

    width: 100%;
}

.footer-content {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 40px;
    margin-bottom: 40px;
}

.footer-section h3,
.footer-section h4 {
    margin-bottom: 20px;
    color: #ffeb3b;
}

.footer-section ul {
    list-style: none;
}

.footer-section ul li {
    margin-bottom: 10px;
}

.footer-section ul li a {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
    transition: color 0.3s ease;
}

.footer-section ul li a:hover {
    color: #ffeb3b;
}

.social-links {
    display: flex;
    gap: 15px;
    margin-top: 20px;
}

.social-links a {
    width: 40px;
    height: 40px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    transition: all 0.3s ease;
}

.social-links a .fa-zalo {
    display: inline-block !important;
    width: 1.15em;
    height: 1.15em;
    background-color: white;
    background-image: url(/assets/icons/zalo.svg);
    background-size: contain;
    background-position: center;
    background-repeat: no-repeat;
}

.social-links a:hover {
    background: #ffeb3b;
    color: #d32f2f;
}

.footer-bottom {
    text-align: center;
    padding-top: 20px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.footer-bottom p {
    color: rgba(255, 255, 255, 0.7);
}

@media (max-width: 1024px) {
    
    /* Footer */
    .footer-content {
        grid-template-columns: 1fr 1fr;
        gap: 30px;
    }

    .footer-section:nth-child(1) {
        grid-column: 1 / -1;
    }

    .footer-section:nth-child(3) {
        text-align: right;
    }
}

@media (max-width: 768px) {

    .footer {
        padding: 300px 0 15px;
    }
}

@media (max-width: 480px) {
    .footer-content {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .footer-section:nth-child(3) {
        text-align: left;
    }
}
</style>