<template>
    <div>

        <!-- Hero Section -->
        <PageHero
            :title="heroTitle"
            :subtitle="heroDescription"
            :breadcrumb-text="pageTitle"
        />


        <!-- Contact Main Section -->
        <section class="contact-main-section">
            <div class="container">
                <div class="contact-main-content">
                    <!-- Contact Info Left -->
                    <div class="contact-info-left">
                        <h2>Thông Tin Liên Hệ</h2>
                        <p>{{ contactDescription }}</p>

                        <div class="contact-info-list">
                            <div class="contact-item">
                                <div class="contact-item-icon">
                                    <i class="fas fa-map-marker-alt"></i>
                                </div>
                                <div class="contact-item-content">
                                    <h4>Địa Chỉ Văn Phòng</h4>
                                    <p>{{ contactInfo.address || '123 Đường ABC, Quận 1 TP. Hồ Chí Minh, Việt Nam' }}</p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <div class="contact-item-icon">
                                    <i class="fas fa-phone"></i>
                                </div>
                                <div class="contact-item-content">
                                    <h4>Điện Thoại</h4>
                                    <p>
                                        Hotline: {{ contactInfo.hotline || '+84 123 456 789' }}<br>Điện thoại: {{ contactInfo.phone || '+84 987 654 321' }}
                                    </p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <div class="contact-item-icon">
                                    <i class="fas fa-envelope"></i>
                                </div>
                                <div class="contact-item-content">
                                    <h4>Email</h4>
                                    <p>{{ contactInfo.contactEmail || 'info@duhocnb.com' }}</p>
                                </div>
                            </div>

                            <div class="contact-item">
                                <div class="contact-item-icon">
                                    <i class="fas fa-clock"></i>
                                </div>
                                <div class="contact-item-content">
                                    <h4>Giờ Làm Việc</h4>
                                    <p>Thứ 2 - Thứ 6: 8:00 - 18:00<br>Thứ 7 - Chủ nhật: 9:00 - 17:00</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Google Map Right -->
                    <div class="contact-map-right">
                        <div class="map-wrapper">
                            <h3>Vị Trí Văn Phòng</h3>
                            <div class="map-container">
                                <iframe
                                    :src="mapSrc"
                                    width="100%" height="100%" style="border:0;" allowfullscreen="" loading="lazy"
                                    referrerpolicy="no-referrer-when-downgrade">
                                </iframe>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <FAQ title="Câu Hỏi Thường Gặp" subtitle="Thắc mắc về dịch vụ du học" :faq-data="myFaqData" />
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useFAQ } from '~/composables/useFAQ'

const { getFAQData } = useFAQ()
const myFaqData = getFAQData('visa') // or 'school', 'visa'

const config = useRuntimeConfig()

const { data: staticPageData } = await useFetch(`${config.public.apiBase}/public/static-pages/contact`, {
    key: 'public-static-page-contact'
})

const { data } = await useFetch(`${config.public.apiBase}/public/general-settings`, {
    key: 'public-general-settings'
})

const staticPage = computed(() => staticPageData.value?.data || {})
const contactInfo = computed(() => data.value?.data || {})

console.log('Contact Info Data:', contactInfo.value)

const pageTitle = computed(() => staticPage.value.title || 'Liên Hệ')

const heroTitle = computed(() => staticPage.value.hero_title || 'Liên Hệ Với Chúng Tôi')

const heroDescription = computed(() => {
    return staticPage.value.hero_description || 'Chúng tôi luôn sẵn sàng hỗ trợ bạn trong hành trình du học'
})

useHead(() => {
    const metaTitle = staticPage.value.meta_title || pageTitle.value || 'Liên Hệ'
    const metaDescription = staticPage.value.meta_description || heroDescription.value

    return {
        title: metaTitle,
        meta: [
            { name: 'description', content: metaDescription },
            { property: 'og:title', content: metaTitle },
            { property: 'og:description', content: metaDescription }
        ]
    }
})

const contactDescription = computed(() => {
    return contactInfo.value.siteDescription || 'Chúng tôi luôn sẵn sàng lắng nghe và hỗ trợ bạn. Hãy liên hệ với chúng tôi qua các thông tin dưới đây:'
})

const mapSrc = computed(() => {
    const value = String(contactInfo.value.googleMapIframe || '').trim()

    if (!value) {
        return 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.4326043693744!2d106.69385131533472!3d10.77536259230029!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f38f9ed887b%3A0x14aded5703768989!2zUXXhuq1uIDEsIFRow6BuaCBwaOG7kSBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!5e0!3m2!1svi!2s!4v1649832458422!5m2!1svi!2s'
    }

    if (value.startsWith('http://') || value.startsWith('https://')) {
        return value
    }

    const match = value.match(/src=["']([^"']+)["']/i)
    return match?.[1] || value
})
</script>
<style scoped>
/* ==================
contact page style
===================== */


/* Contact Main Section */
.contact-main-section {
    padding: 80px 0;
    background: #fff;
}

.contact-main-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
    align-items: start;
}

.contact-info-left h2 {
    font-size: 2rem;
    color: #d32f2f;
    margin-bottom: 20px;
    font-weight: 600;
}

.contact-info-left>p {
    color: #666;
    font-size: 1.1rem;
    margin-bottom: 40px;
    line-height: 1.7;
}

.contact-info-list {
    display: flex;
    flex-direction: column;
    gap: 30px;
}

.contact-item {
    display: flex;
    align-items: flex-start;
    gap: 20px;
}

.contact-item-icon {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
}

.contact-item-icon i {
    font-size: 1.5rem;
    color: white;
}

.contact-item-content h4 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 8px;
    font-weight: 600;
}

.contact-item-content p {
    color: #666;
    font-size: 1rem;
    line-height: 1.6;
}

.contact-map-right {
    background: white;
    border-radius: 15px;
    padding: 30px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.map-wrapper h3 {
    font-size: 1.5rem;
    color: #333;
    margin-bottom: 20px;
    font-weight: 600;
}

.map-container {
    width: 100%;
    height: 400px;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.map-container iframe {
    width: 100%;
    height: 100%;
}

@media (max-width: 1024px) {
    
}

@media (max-width: 768px) {
    /* contact style */
    .contact-main-section {
        padding: 60px 0 40px;
    }

    .contact-main-content {
        grid-template-columns: 1fr;
        gap: 30px;
    }

    .contact-info-left h2 {
        font-size: 1.6rem;
        text-align: center;
    }

    .contact-info-left>p {
        font-size: 1rem;
        margin-bottom: 30px;
        text-align: center;
    }

    .contact-info-list {
        gap: 25px;
    }

    .contact-item {
        gap: 15px;
    }

    .contact-item-icon {
        width: 50px;
        height: 50px;
    }

    .contact-item-icon i {
        font-size: 1.2rem;
    }

    .contact-item-content h4 {
        font-size: 1.1rem;
    }

    .contact-map-right {
        padding: 25px 20px;
    }

    .map-wrapper h3 {
        font-size: 1.3rem;
    }

    .map-container {
        height: 300px;
    }
}

@media (max-width: 480px) {
    
}
</style>