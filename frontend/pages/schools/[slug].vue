<template>
    <div class="school-detail-container">
        <!-- School Hero Section -->
        <section class="school-hero">
            <div class="container">
                <div class="school-hero-content">
                    <nav class="breadcrumb">
                        <NuxtLink to="/">Trang chủ</NuxtLink>
                        <span>/</span>
                        <NuxtLink to="/schools">Trường Nhật Ngữ</NuxtLink>
                    </nav>

                    <div class="school-hero-main">
                        <div class="school-info-header">
                            <div class="school-badge featured">Nổi Bật</div>
                            <div class="school-rating">
                                <div class="rating-stars">
                                    <div class="rating-stars-fill" :style="{ width: `${ratingValue(schoolData?.rating)}%` }"></div>
                                </div>
                                <span>{{ ratingText(schoolData?.rating) }}</span>
                                <!-- <small>(148 đánh giá)</small> -->
                            </div>
                        </div>

                        <h1 class="editable-h1" data-editable="true" data-id="school-title">{{ schoolData.name }}</h1>
                        <div class="school-location">
                            <i class="fas fa-map-marker-alt"></i>
                            <span class="editable-paragraph" data-editable="true" data-id="school-location">{{ schoolData.location }}</span>
                        </div>

                        <p class="school-hero-desc editable-paragraph" data-editable="true" data-id="hero-description">
                            {{ schoolData.description }}
                        </p>

                        <div class="school-key-stats">
                            <div class="stat-item">
                                <span class="stat-number">{{ tuitionText }}</span>
                                <span class="stat-label">Học phí/năm</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number">{{ visaSuccessRateText }}</span>
                                <span class="stat-label">Tỷ lệ đỗ visa</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-number1">{{ classSizeText }}</span>
                                <span class="stat-label">Sĩ số lớp</span>
                            </div>
                        </div>

                        <div class="school-hero-actions">
                            <a href="#contact" class="btn btn-primary">Tư Vấn Miễn Phí</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- About School Section -->
        <section class="about-school">
            <div class="container">
                <div class="school-detail-content">
                    <!-- Main Content -->
                    <div class="school-detail-main">
                        <!-- About School -->
                        <div class="content-block dynamic-component" data-component-type="about" data-editable="true"
                            data-id="about-section">
                            <div class="section-header">
                                <h2 class="editable-h2">{{ schoolData.name }}</h2>
                            </div>

                            <div class="content-section" data-layout="two-column">
                                <div class="content-card">
                                    <div class="editable-section" data-type="paragraph">
                                        <p class="editable-paragraph">{{ detailIntro.shortIntro || defaultIntroText }}
                                        </p>
                                        <p v-if="detailIntro.foundingHistory" class="editable-paragraph">{{
                                            detailIntro.foundingHistory }}</p>
                                        <p v-if="detailIntro.schoolPhilosophy" class="editable-paragraph">{{
                                            detailIntro.schoolPhilosophy }}</p>
                                    </div>
                                </div>
                                <div class="editable-image">
                                    <img :src="heroImage" :alt="schoolData.name">
                                    <div class="image-caption">{{ schoolData.name }}</div>
                                </div>
                            </div>

                            <div v-if="detailIntro.schoolPhilosophy" class="quote-box editable-quote"
                                data-style="highlighted" data-editable="true" data-id="mission-quote">
                                <blockquote>
                                    "{{ detailIntro.schoolPhilosophy }}"
                                </blockquote>
                            </div>
                        </div>
                    </div>

                    <!-- Sidebar -->
                    <aside class="school-detail-sidebar">
                        <!-- Contact Info -->
                        <div class="sidebar-widget">
                            <h3>Thông Tin Liên Hệ</h3>
                            <div class="contact-details">
                                <div class="contact-item">
                                    <i class="fas fa-map-marker-alt"></i>
                                    <div>
                                        <strong>Địa chỉ</strong>
                                        <span>{{ schoolData.location || 'Japan' }}</span>
                                    </div>
                                </div>
                                <div v-if="schoolData.phone" class="contact-item">
                                    <i class="fas fa-phone"></i>
                                    <div>
                                        <strong>Điện thoại</strong>
                                        <span>{{ schoolData.phone }}</span>
                                    </div>
                                </div>
                                <div v-if="schoolData.email" class="contact-item">
                                    <i class="fas fa-envelope"></i>
                                    <div>
                                        <strong>Email</strong>
                                        <span>{{ schoolData.email }}</span>
                                    </div>
                                </div>
                                <div v-if="schoolData.website" class="contact-item">
                                    <i class="fas fa-globe"></i>
                                    <div>
                                        <strong>Website</strong>
                                        <a :href="schoolData.website" target="_blank" rel="noopener noreferrer">{{
                                            schoolData.website }}</a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- Related Schools -->
                        <div v-if="relatedSchools.length" class="sidebar-widget">
                            <h3>Trường Liên Quan</h3>
                            <div class="related-schools">
                                <div v-for="item in relatedSchools" :key="item.id" class="related-school">
                                    <div class="school-thumb">
                                        <img :src="item.thumbnail_url || item.logo_url || fallbackImage" :alt="item.name">
                                    </div>
                                    <div class="school-info">
                                        <h4><NuxtLink :to="`/schools/${item.slug}`">{{ item.name }}</NuxtLink></h4>
                                        <div class="">
                                            <div class="rating-stars">
                                                <div class="rating-stars-fill" :style="{ width: `${ratingValue(item.rating)}%` }"></div>
                                            </div>
                                            <span>{{ ratingText(item.rating) }}</span>
                                        </div>
                                        <div class="school-price">{{ formatCurrencyYen(item.tuition_per_year) }} /năm</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </section>

        <!-- Programs & Courses Section -->
        <section class="programs">
            <div class="container">
                <div class="section-header">
                    <h2 class="editable-h2">{{ detailProgram.heroTitle || 'Chương Trình Học' }}</h2>
                    <p>{{ detailProgram.heroDescription || `Programs at ${schoolData.name}` }}</p>
                </div>

                <div v-if="programCards.length" class="content-grid">
                    <div v-for="card in programCards" :key="card.id || card.courseName" class="course-item">
                        <div class="course-icon">
                            <i :class="card.icon || 'fas fa-graduation-cap'"></i>
                        </div>
                        <h3>{{ card.courseName }}</h3>
                        <div class="course-details">
                            <p>{{ card.courseDescription }}</p>
                            <div class="course-info">
                                <span class="info-item"><i class="fas fa-clock"></i> {{ card.durationText }}</span>
                                <span class="info-item"><i class="fas fa-yen-sign"></i> {{ formatCurrencyYen(card.priceText) }}/năm</span>
                                <span class="info-item"><i class="fas fa-medal"></i> {{ card.targetText }}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div v-else class="empty-block">Thông Tin Chương Trình Học Đang Được Cập Nhật.</div>

            </div>
        </section>

        <!-- Admission Requirements Section -->
        <section class="admission-requirements">
            <div class="container">
                <div class="section-header">
                    <h2 class="editable-h2">{{ detailAdmission.heroTitle || 'Điều Kiện Tuyển Sinh' }}</h2>
                    <p>{{ detailAdmission.heroDescription }}</p>
                </div>

                <div v-if="admissionCards.length" class="content-grid">
                    <div v-for="card in admissionCards" :key="card.id || card.criterionName" class="requirement-card">
                        <div class="req-icon">
                            <i :class="card.icon || 'fas fa-file-alt'"></i>
                        </div>
                        <h3>{{ card.criterionName || 'Học Vấn' }}</h3>
                        <ul>
                            <li v-for="item in card.items || []" :key="item.id || item.itemText">{{ item.itemText }}</li>
                        </ul>
                    </div>
                </div>
                <div v-else class="empty-block">Thông Tin Điều Kiện Tuyển Sinh Đang Được Cập Nhật.</div>
            </div>
        </section>

        <!-- Facilities Section -->
        <section class="facilities">
            <div class="container">
                <div class="section-header">
                    <h2 class="editable-h2">{{ detailFacility.heroTitle || 'Cơ Sở Vật Chất & Dịch Vụ' }}</h2>
                    <p>{{ detailFacility.heroDescription || 'Môi trường học tập hiện đại và đầy đủ tiện nghi' }}</p>
                </div>

                <div v-if="facilityCards.length" class="content-grid">
                    <div v-for="card in facilityCards" :key="card.id || card.serviceName" class="facility-card">
                        <div class="facility-icon">
                            <i :class="card.icon || 'fas fa-chalkboard-teacher'"></i>
                        </div>
                        <h3>{{ card.serviceName || 'Phòng Học Hiện Đại' }}</h3>
                        <p>{{ card.description || '20+ phòng học được trang bị máy chiếu, bảng thông minh và hệ thống âm thanh chất lượng cao.' }}</p>
                    </div>
                </div>
                <div v-else class="empty-block">Tin Cơ Sở Vật Chất & Dịch Vụ Đang Được Cập Nhật.</div>
            </div>
        </section>

        <!-- Testimonials Section -->
        <section class="testimonials">
            <div class="container">
                <div class="section-header">
                    <h2 class="editable-h2">Cảm Nhận Của Sinh Viên</h2>
                    <p>Những trải nghiệm thực tế từ sinh viên đã và đang học tập tại ISI Language School</p>
                </div>

                <div class="content-grid">
                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <div class="stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <p>"ISI thực sự là lựa chọn tuyệt vời! Giáo viên rất tận tâm, lớp học nhỏ nên được chú ý
                                nhiều.
                                Cơ sở vật chất hiện đại, thư viện đầy đủ tài liệu."</p>
                        </div>
                        <div class="student-info">
                            <img src="" alt="Nguyễn Minh Anh">
                            <div class="student-details">
                                <h4>Nguyễn Minh Anh</h4>
                                <span>Việt Nam | Khóa 2022</span>
                            </div>
                        </div>
                    </div>

                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <div class="stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                            </div>
                            <p>"Môi trường học tập rất tốt, bạn bè đến từ nhiều quốc gia khác nhau.
                                Nhờ ISI mà em có thể đậu vào trường đại học mơ ước."</p>
                        </div>
                        <div class="student-info">
                            <img src="" alt="Trần Văn Đức">
                            <div class="student-details">
                                <h4>Trần Văn Đức</h4>
                                <span>Việt Nam | Khóa 2021</span>
                            </div>
                        </div>
                    </div>

                    <div class="testimonial-card">
                        <div class="testimonial-content">
                            <div class="stars">
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star"></i>
                                <i class="fas fa-star-half-alt"></i>
                            </div>
                            <p>"Chương trình học rất bài bản, từ cơ bản đến nâng cao.
                                Đặc biệt là khóa luyện thi JLPT rất hiệu quả, em đã đậu N2."</p>
                        </div>
                        <div class="student-info">
                            <img src="" alt="Lê Thị Hoa">
                            <div class="student-details">
                                <h4>Lê Thị Hoa</h4>
                                <span>Việt Nam | Khóa 2023</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <!-- FAQ Section -->
        <FAQ title="FAQ" :subtitle="`Questions about ${schoolData.name}`" :faq-data="myFaqData" />
    </div>
</template>

<script setup>
import "~/assets/css/school-detail.css";

import { computed } from "vue";
import { useRoute } from "vue-router";
import { useFAQ } from "~/composables/useFAQ";

const fallbackImage = "/assets/images/school-1.jpg";
const route = useRoute();
const config = useRuntimeConfig();
const slug = computed(() => String(route.params.slug || "").trim());

const { getFAQData } = useFAQ();
const myFaqData = getFAQData("school");

const {
    data: schoolResponse,
    pending: pendingSchool,
    error: schoolError
} = await useFetch(() => `${config.public.apiBase}/public/schools/${encodeURIComponent(slug.value)}`, {
    key: () => `public-school-${slug.value}`,
    watch: [slug]
});

const {
    data: detailResponse,
    pending: pendingDetail
} = await useFetch(() => `${config.public.apiBase}/public/schools/${encodeURIComponent(slug.value)}/detail-content`, {
    key: () => `public-school-detail-content-${slug.value}`,
    watch: [slug]
});

const { data: schoolsListResponse } = await useFetch(`${config.public.apiBase}/public/schools`, {
    key: "public-school-related-list"
});

const schoolData = computed(() => schoolResponse.value?.data || null);
const isLoading = computed(() => pendingSchool.value || pendingDetail.value);
const isNotFound = computed(() => !isLoading.value && (!schoolData.value || schoolError.value));

const defaultDetailContent = () => ({
    intro: {
        shortIntro: "",
        foundingHistory: "",
        schoolPhilosophy: ""
    },
    program: {
        heroTitle: "",
        heroDescription: "",
        cards: []
    },
    admission: {
        heroTitle: "",
        heroDescription: "",
        cards: []
    },
    facility: {
        heroTitle: "",
        heroDescription: "",
        cards: []
    }
});

const detailContent = computed(() => detailResponse.value?.data || defaultDetailContent());

const toArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean);
    if (!value) return [];
    if (typeof value === "string") {
        return value.split(",").map((item) => item.trim()).filter(Boolean);
    }
    return [];
};

const formatCurrencyYen = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return "Updating";
    return `${num.toLocaleString("vi-VN")} JPY`;
};

const formatPercent = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num) || num <= 0) return "Updating";
    return `${num}%`;
};

const formatClassSize = (value) => {
    if (value === null || value === undefined || value === "") return "Updating";
    const num = Number(value);
    if (!Number.isFinite(num)) return String(value);
    return `${num}`;
};

// const ratingValue = computed(() => Math.max(0, Math.min(100, (Number(schoolData.value?.rating) / 5) * 100)) || 0);
// const ratingText = computed(() => {
//     const num = Number(schoolData.value?.rating) || 0;
//     return num > 0 ? num.toFixed(1) : "N/A";
// });
const ratingValue = (value) => {
    return Math.max(0, Math.min(100, (Number(value) / 5) * 100)) || 0;
};

const ratingText  = (value) => {
    const num = Number(value) || 0;
    return num > 0 ? num.toFixed(1) : "N/A";
};

const reviewCountText = computed(() => Number(schoolData.value?.review_count) || 0);

const tuitionText = computed(() => formatCurrencyYen(schoolData.value?.tuition_per_year));
const visaSuccessRateText = computed(() => formatPercent(schoolData.value?.visa_success_rate));
const classSizeText = computed(() => formatClassSize(schoolData.value?.class_size));
const intakeMonthsText = computed(() => {
    const months = toArray(schoolData.value?.intake_months);
    return months.length ? months.join(", ") : "Updating";
});

const detailIntro = computed(() => detailContent.value.intro || {});
const detailProgram = computed(() => detailContent.value.program || { cards: [] });
const detailAdmission = computed(() => detailContent.value.admission || { cards: [] });
const detailFacility = computed(() => detailContent.value.facility || { cards: [] });

const programCards = computed(() => (detailProgram.value.cards || []).filter((card) => card.isActive !== false));
const admissionCards = computed(() => (detailAdmission.value.cards || []).filter((card) => card.isActive !== false));
const facilityCards = computed(() => (detailFacility.value.cards || []).filter((card) => card.isActive !== false));

const heroImage = computed(() => schoolData.value?.thumbnail_url || schoolData.value?.logo_url || fallbackImage);

const heroBadge = computed(() => {
    const rating = Number(schoolData.value?.rating) || 0;
    if (rating >= 4.7) return "Featured";
    if (rating >= 4.3) return "Popular";
    if (rating >= 4.0) return "Recommended";
    return "Potential";
});

const defaultIntroText = computed(() => {
    if (!schoolData.value) return "School details are being updated.";
    return `${schoolData.value.name} is a Japanese language school in ${schoolData.value.location || "Japan"} for international students.`;
});

const heroDescription = computed(() => detailIntro.value.shortIntro || defaultIntroText.value);

const relatedSchools = computed(() => {
    const data = schoolsListResponse.value?.data || [];
    const currentId = schoolData.value?.id;
    return data.filter((item) => item.id !== currentId).slice(0, 3);
});

useHead(() => {
    const title = schoolData.value
        ? `${schoolData.value.name} - Du Hoc NB`
        : "School details - Du Hoc NB";
    const description = heroDescription.value || "School detail information";

    return {
        title,
        meta: [
            { name: "description", content: description },
            { property: "og:title", content: title },
            { property: "og:description", content: description }
        ]
    };
});
</script>

<style scoped>
.rating-stars {
    position: relative;

    display: inline-block;

    font-size: 20px;
    line-height: 1;

    color: #ddd;
}

.rating-stars::before {
    content: "★★★★★";
}

.rating-stars-fill {
    position: absolute;

    top: 0;
    left: 0;

    overflow: hidden;

    color: #ffd700;
}

.rating-stars-fill::before {
    content: "★★★★★";
}
/* .school-quick-info {
    display: flex;
    gap: 30px;
    margin-top: 20px;
    flex-wrap: wrap;
    color: rgba(255, 255, 255, 0.9);
}

.school-quick-info span {
    display: flex;
    align-items: center;
    gap: 8px;
}

.school-overview {
    padding: 80px 0;
}

.overview-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 60px;
    align-items: start;
}

.overview-content h2 {
    margin-bottom: 25px;
    color: #333;
}

.overview-content p {
    line-height: 1.8;
    margin-bottom: 30px;
    color: #666;
}

.school-features-detailed ul {
    list-style: none;
    padding: 0;
}

.school-features-detailed li {
    display: flex;
    align-items: start;
    gap: 15px;
    margin-bottom: 15px;
    padding: 15px;
    background: #f8f9fa;
    border-radius: 8px;
}

.school-features-detailed i {
    color: #4caf50;
    margin-top: 2px;
}

.overview-image {
    position: relative;
}

.overview-image img {
    width: 100%;
    border-radius: 15px;
}

.school-badges {
    position: absolute;
    top: 20px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.badge {
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: 600;
    color: white;
}

.badge.featured {
    background: #ff6b35;
}

.badge.popular {
    background: #4caf50;
}

.badge.accredited {
    background: #2196f3;
}

.school-stats {
    background: #f8f9fa;
    padding: 60px 0;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 30px;
}

.stat-item {
    background: white;
    padding: 30px;
    border-radius: 15px;
    text-align: center;
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.stat-icon {
    width: 60px;
    height: 60px;
    background: #d32f2f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 20px;
    color: white;
    font-size: 24px;
}

.stat-number {
    font-size: 36px;
    font-weight: 700;
    color: #333;
    margin-bottom: 5px;
}

.stat-label {
    color: #666;
    font-size: 16px;
}

.school-programs {
    padding: 80px 0;
}

.programs-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 30px;
    margin-top: 40px;
}

.program-card {
    background: white;
    padding: 30px;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
    text-align: center;
}

.program-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #d32f2f, #ff6b35);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 25px;
    color: white;
    font-size: 30px;
}

.program-card h3 {
    margin-bottom: 15px;
    color: #333;
}

.program-details {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    font-size: 14px;
    color: #666;
}

.school-gallery {
    background: #f8f9fa;
    padding: 80px 0;
}

.gallery-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 20px;
    margin-top: 40px;
}

.gallery-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 10px;
}

.school-contact {
    padding: 80px 0;
}

.contact-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 60px;
}

.contact-details {
    display: flex;
    flex-direction: column;
    gap: 25px;
}

.contact-item {
    display: flex;
    gap: 20px;
    align-items: start;
}

.contact-item i {
    width: 40px;
    height: 40px;
    background: #d32f2f;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.contact-form {
    background: #f8f9fa;
    padding: 40px;
    border-radius: 15px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 15px;
    border: 2px solid #eee;
    border-radius: 8px;
    font-size: 16px;
}

.form-group textarea {
    height: 120px;
    resize: vertical;
}

.btn {
    width: 100%;
    padding: 15px;
    background: #d32f2f;
    color: white;
    border: none;
    border-radius: 25px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: background 0.3s ease;
}

.btn:hover {
    background: #b71c1c;
}

.loading-state {
    padding: 100px 0;
    text-align: center;
}

.loading-content i {
    font-size: 48px;
    color: #d32f2f;
    margin-bottom: 20px;
}

@media (max-width: 768px) {

    .overview-grid,
    .contact-grid {
        grid-template-columns: 1fr;
        gap: 40px;
    }

    .school-quick-info {
        flex-direction: column;
        gap: 15px;
    }

    .programs-grid,
    .gallery-grid {
        grid-template-columns: 1fr;
    }
} */
</style>