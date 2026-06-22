<template>
    <div class="school-detail-container">
        <section v-if="isLoading" class="loading-state">
            <div class="container">
                <div class="loading-content">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Loading school information...</p>
                </div>
            </div>
        </section>

        <section v-else-if="isNotFound" class="loading-state">
            <div class="container">
                <div class="loading-content">
                    <i class="fas fa-school"></i>
                    <p>School not found for this URL.</p>
                    <NuxtLink to="/schools" class="btn btn-primary">Back to school list</NuxtLink>
                </div>
            </div>
        </section>

        <template v-else>
            <section class="school-hero">
                <div class="container">
                    <div class="school-hero-content">
                        <nav class="breadcrumb">
                            <NuxtLink to="/">Home</NuxtLink>
                            <span>/</span>
                            <NuxtLink to="/schools">Schools</NuxtLink>
                            <span>/</span>
                            <span>{{ schoolData.name }}</span>
                        </nav>

                        <div class="school-hero-main">
                            <div class="school-info-header">
                                <div class="school-badge featured">{{ heroBadge }}</div>
                                <div class="school-rating">
                                    <div class="stars">
                                        <i
                                            v-for="i in 5"
                                            :key="`rating-star-${i}`"
                                            :class="i <= roundedRating ? 'fas fa-star' : 'far fa-star'"
                                        ></i>
                                    </div>
                                    <span>{{ ratingText }}</span>
                                    <small>({{ reviewCountText }} reviews)</small>
                                </div>
                            </div>

                            <h1 class="editable-h1">{{ schoolData.name }}</h1>
                            <div class="school-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span class="editable-paragraph">{{ schoolData.location || schoolData.region_name || 'Japan' }}</span>
                            </div>

                            <p class="school-hero-desc editable-paragraph">{{ heroDescription }}</p>

                            <div class="school-key-stats">
                                <div class="stat-item">
                                    <span class="stat-number">{{ tuitionText }}</span>
                                    <span class="stat-label">Tuition / year</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">{{ visaSuccessRateText }}</span>
                                    <span class="stat-label">Visa success rate</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number1">{{ classSizeText }}</span>
                                    <span class="stat-label">Class size</span>
                                </div>
                                <div class="stat-item">
                                    <span class="stat-number">{{ intakeMonthsText }}</span>
                                    <span class="stat-label">Intake months</span>
                                </div>
                            </div>

                            <div class="school-hero-actions">
                                <NuxtLink to="/contact" class="btn btn-primary">Free consultation</NuxtLink>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="about-school">
                <div class="container">
                    <div class="school-detail-content">
                        <div class="school-detail-main">
                            <div class="content-block dynamic-component">
                                <div class="section-header">
                                    <h2 class="editable-h2">About {{ schoolData.name }}</h2>
                                </div>

                                <div class="content-section" data-layout="two-column">
                                    <div class="content-card">
                                        <div class="editable-section" data-type="paragraph">
                                            <p class="editable-paragraph">{{ detailIntro.shortIntro || defaultIntroText }}</p>
                                            <p v-if="detailIntro.foundingHistory" class="editable-paragraph">{{ detailIntro.foundingHistory }}</p>
                                            <p v-if="detailIntro.schoolPhilosophy" class="editable-paragraph">{{ detailIntro.schoolPhilosophy }}</p>
                                        </div>
                                    </div>
                                    <div class="editable-image">
                                        <img :src="heroImage" :alt="schoolData.name">
                                        <div class="image-caption">{{ schoolData.name }}</div>
                                    </div>
                                </div>

                                <div v-if="detailIntro.schoolPhilosophy" class="quote-box editable-quote">
                                    <blockquote>"{{ detailIntro.schoolPhilosophy }}"</blockquote>
                                </div>
                            </div>
                        </div>

                        <aside class="school-detail-sidebar">
                            <div class="sidebar-widget">
                                <h3>Contact</h3>
                                <div class="contact-details">
                                    <div class="contact-item">
                                        <i class="fas fa-map-marker-alt"></i>
                                        <div>
                                            <strong>Address</strong>
                                            <span>{{ schoolData.location || 'Japan' }}</span>
                                        </div>
                                    </div>
                                    <div v-if="schoolData.phone" class="contact-item">
                                        <i class="fas fa-phone"></i>
                                        <div>
                                            <strong>Phone</strong>
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
                                            <a :href="schoolData.website" target="_blank" rel="noopener noreferrer">{{ schoolData.website }}</a>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div v-if="relatedSchools.length" class="sidebar-widget">
                                <h3>Related schools</h3>
                                <div class="related-schools">
                                    <div v-for="item in relatedSchools" :key="item.id" class="related-school">
                                        <div class="school-thumb">
                                            <img :src="item.thumbnail_url || item.logo_url || fallbackImage" :alt="item.name">
                                        </div>
                                        <div class="school-info">
                                            <h4>
                                                <NuxtLink :to="`/schools/${item.slug}`">{{ item.name }}</NuxtLink>
                                            </h4>
                                            <div class="school-rating">
                                                <div class="stars">
                                                    <i
                                                        v-for="i in 5"
                                                        :key="`related-${item.id}-star-${i}`"
                                                        :class="i <= Math.round(Number(item.rating) || 0) ? 'fas fa-star' : 'far fa-star'"
                                                    ></i>
                                                </div>
                                                <span>{{ Number(item.rating || 0).toFixed(1) }}</span>
                                            </div>
                                            <div class="school-price">{{ formatCurrencyYen(item.tuition_per_year) }} / year</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>
                    </div>
                </div>
            </section>

            <section class="programs">
                <div class="container">
                    <div class="section-header">
                        <h2 class="editable-h2">{{ detailProgram.heroTitle || 'Programs' }}</h2>
                        <p>{{ detailProgram.heroDescription || `Programs at ${schoolData.name}` }}</p>
                    </div>

                    <div v-if="programCards.length" class="content-grid">
                        <div v-for="card in programCards" :key="card.id || card.courseName" class="course-item">
                            <div class="course-icon">
                                <i :class="card.icon || 'fas fa-graduation-cap'"></i>
                            </div>
                            <h3>{{ card.courseName || 'Training program' }}</h3>
                            <div class="course-details">
                                <p>{{ card.courseDescription || 'Program detail is being updated.' }}</p>
                                <div class="course-info">
                                    <span class="info-item"><i class="fas fa-clock"></i> {{ card.durationText || 'Updating' }}</span>
                                    <span class="info-item"><i class="fas fa-yen-sign"></i> {{ card.priceText || 'Updating' }}</span>
                                    <span class="info-item"><i class="fas fa-medal"></i> {{ card.targetText || 'Updating' }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div v-else class="empty-block">Program information is being updated.</div>
                </div>
            </section>

            <section class="admission-requirements">
                <div class="container">
                    <div class="section-header">
                        <h2 class="editable-h2">{{ detailAdmission.heroTitle || 'Admission requirements' }}</h2>
                        <p>{{ detailAdmission.heroDescription || `Admission details for ${schoolData.name}` }}</p>
                    </div>

                    <div v-if="admissionCards.length" class="content-grid">
                        <div v-for="card in admissionCards" :key="card.id || card.criterionName" class="requirement-card">
                            <div class="req-icon">
                                <i :class="card.icon || 'fas fa-file-alt'"></i>
                            </div>
                            <h3>{{ card.criterionName || 'Requirement' }}</h3>
                            <ul>
                                <li v-for="item in card.items || []" :key="item.id || item.itemText">{{ item.itemText }}</li>
                            </ul>
                        </div>
                    </div>
                    <div v-else class="empty-block">Admission information is being updated.</div>
                </div>
            </section>

            <section class="facilities">
                <div class="container">
                    <div class="section-header">
                        <h2 class="editable-h2">{{ detailFacility.heroTitle || 'Facilities and services' }}</h2>
                        <p>{{ detailFacility.heroDescription || 'Facilities information is being updated.' }}</p>
                    </div>

                    <div v-if="facilityCards.length" class="content-grid">
                        <div v-for="card in facilityCards" :key="card.id || card.serviceName" class="facility-card">
                            <div class="facility-icon">
                                <i :class="card.icon || 'fas fa-building'"></i>
                            </div>
                            <h3>{{ card.serviceName || 'Service' }}</h3>
                            <p>{{ card.contentDetail || 'Service description is being updated.' }}</p>
                        </div>
                    </div>
                    <div v-else class="empty-block">Facilities information is being updated.</div>
                </div>
            </section>

            <FAQ title="FAQ" :subtitle="`Questions about ${schoolData.name}`" :faq-data="myFaqData" />
        </template>
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

const roundedRating = computed(() => Math.round(Number(schoolData.value?.rating) || 0));
const ratingText = computed(() => {
    const num = Number(schoolData.value?.rating) || 0;
    return num > 0 ? num.toFixed(1) : "N/A";
});
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
.empty-block {
    padding: 20px;
    text-align: center;
    color: #666;
    border: 1px dashed #ddd;
    border-radius: 10px;
}

.loading-content {
    text-align: center;
    padding: 60px 0;
}

.loading-content i {
    font-size: 42px;
    color: #d32f2f;
    margin-bottom: 12px;
}
</style>
