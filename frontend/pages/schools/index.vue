<template>
    <div class="schools-container">
        <!-- Page Hero with advanced breadcrumb -->
        <PageHero :title="heroTitle" :subtitle="heroDescription" :breadcrumb-text="pageTitle" />

        <!-- Schools List Section -->
        <section class="schools-section">
            <div class="container">
                <!-- <div class="section-header text-center">
                    <h2>Các Trường Nhật Ngữ Uy Tín</h2>
                    <p>Danh sách 5 trường nhật ngữ hàng đầu được Du Học NB khuyến nghị</p>
                </div> -->

                <!-- Filter và Search -->
                <div class="schools-filter">
                    <div class="filter-select-wrap">
                        <div class="filter-head">
                            <label for="region-filter" class="filter-label">Khu vực</label>
                            <span class="record-count">{{ recordCountText }}</span>
                        </div>
                        <select id="region-filter" v-model="activeRegion" class="filter-select">
                            <option v-for="tab in regionTabs" :key="tab.value" :value="tab.value">
                                {{ tab.label }}
                            </option>
                        </select>
                    </div>
                    <div class="search-box">
                        <input v-model.trim="searchTerm" type="text" placeholder="Tìm kiếm trường..."
                            class="search-input">
                        <i class="fas fa-search"></i>
                    </div>
                </div>


                <!-- Schools Grid -->
                <div v-if="pendingSchools" class="schools-loading">Đang tải danh sách trường...</div>
                <div v-else-if="schoolsError" class="schools-loading">Không thể tải danh sách trường. Vui lòng thử lại
                    sau.</div>
                <div v-else-if="!filteredSchools.length" class="schools-loading">Không tìm thấy trường phù hợp với bộ
                    lọc hiện tại.</div>
                <div v-else class="schools-grid">
                    <div class="school-card" v-for="school in paginatedSchools" :key="school.id">
                        <div class="school-image">
                            <img :src="school.image" :alt="school.name">
                            <div class="school-badge" :class="school.badgeType">{{ school.badge }}</div>
                            <div class="school-rating">
                                <div class="rating-stars">
                                    <div class="rating-stars-fill" :style="{ width: `${getRatingPercent(school.ratingValue)}%` }"></div>
                                </div>
                                <span>{{ school.ratingText }}</span>
                            </div>
                        </div>
                        <div class="school-content">
                            <div class="school-location">
                                <i class="fas fa-map-marker-alt"></i>
                                <span>{{ school.fullLocation }}</span>
                            </div>
                            <h3>{{ school.name }}</h3>
                            <p class="school-description">{{ school.description }}</p>

                            <div class="school-highlights">
                                <div class="highlight-item" v-for="highlight in school.highlights"
                                    :key="highlight.label">
                                    <i :class="highlight.icon"></i>
                                    <div>
                                        <span>{{ highlight.label }}</span>
                                        <strong>{{ highlight.value }}</strong>
                                    </div>
                                </div>
                            </div>

                            <div class="school-features">
                                <span v-for="feature in school.features" :key="feature" class="feature-tag">
                                    {{ feature }}
                                </span>
                            </div>

                            <div class="school-pricing">
                                <div class="price">
                                    <span class="price-label">Học phí/năm</span>
                                    <span class="price-amount">{{ school.tuition }}</span>
                                </div>
                                <div class="school-actions">
                                    <NuxtLink :to="`/schools/${school.slug}`" class="btn btn-primary">Chi Tiết
                                    </NuxtLink>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-if="showPagination" class="pagination-wrap">
                    <button class="pagination-btn" :disabled="currentPage === 1" @click="currentPage -= 1">
                        Trước
                    </button>
                    <button
                        v-for="page in totalPages"
                        :key="`page-${page}`"
                        class="pagination-btn"
                        :class="{ active: currentPage === page }"
                        @click="currentPage = page"
                    >
                        {{ page }}
                    </button>
                    <button class="pagination-btn" :disabled="currentPage === totalPages" @click="currentPage += 1">
                        Sau
                    </button>
                </div>

                <!-- Comparison Section -->
                <div class="comparison-section">
                    <h3>So Sánh Nhanh</h3>
                    <div class="comparison-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Trường</th>
                                    <th>Vị trí</th>
                                    <th>Học phí/năm</th>
                                    <th>Sĩ số lớp</th>
                                    <th>Tỷ lệ thành công</th>
                                    <th>Đặc điểm</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="school in comparisonSchools" :key="`comparison-${school.id}`">
                                    <td>{{ school.name }}</td>
                                    <td>{{ school.region }}</td>
                                    <td>{{ school.tuition }}</td>
                                    <td>{{ school.classSize }}</td>
                                    <td>{{ school.visaSuccessRate }}</td>
                                    <td>{{ school.featureSummary }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>

import { computed, ref, watch } from 'vue'

const config = useRuntimeConfig()
const { data: staticPageData } = await useFetch(`${config.public.apiBase}/public/static-pages/schools`, {
    key: 'public-static-page-schools'
})
const {
    data: schoolsResponse,
    pending: pendingSchools,
    error: schoolsError
} = await useFetch(`${config.public.apiBase}/public/schools`, {
    key: 'public-schools-list'
})

const staticPage = computed(() => staticPageData.value?.data || {})
const schoolsRaw = computed(() => schoolsResponse.value?.data || [])

const activeRegion = ref('all')
const searchTerm = ref('')
const currentPage = ref(1)
const PAGE_SIZE = 6

const pageTitle = computed(() => staticPage.value.title || 'Trường Nhật Ngữ')

const heroTitle = computed(() => staticPage.value.hero_title || 'Trường Nhật Ngữ Mới Nhất')

const heroDescription = computed(() => {
    return staticPage.value.hero_description || 'Cập nhật những thông tin mới nhất về các trường Nhật Ngữ'
})

// SEO
useHead(() => {
    const metaTitle = staticPage.value.meta_title || pageTitle.value || 'Trường Nhật Ngữ'
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

// Schools data
const toArray = (value) => {
    if (Array.isArray(value)) return value.filter(Boolean)
    if (!value) return []
    if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).filter(Boolean)
    }
    return []
}

const formatCurrencyYen = (value) => {
    const num = Number(value)
    if (!Number.isFinite(num) || num <= 0) return 'Liên hệ'
    return `${num.toLocaleString('vi-VN')}¥`
}

const formatPercent = (value) => {
    const num = Number(value)
    if (!Number.isFinite(num) || num <= 0) return 'Đang cập nhật'
    return `${num}%`
}

const formatClassSize = (value) => {
    if (value === null || value === undefined || value === '') return 'Đang cập nhật'
    const num = Number(value)
    if (!Number.isFinite(num)) return String(value)
    return `${num} học sinh`
}

const getRatingPercent = (ratingValue) => {
    const rating = Number(ratingValue)
    if (!Number.isFinite(rating) || rating <= 0) return 0

    return Math.max(0, Math.min(100, (rating / 5) * 100))
}

const normalizeRegionLabel = (school) => {
    return school.region_name || school.location || 'Nhật Bản'
}

const getBadgeFromRating = (rating) => {
    const value = Number(rating) || 0
    if (value >= 4.7) return { text: 'Nổi Bật', type: 'featured' }
    if (value >= 4.3) return { text: 'Phổ Biến', type: 'popular' }
    if (value >= 4.0) return { text: 'Đề Xuất', type: 'international' }
    return { text: 'Tiềm Năng', type: 'cultural' }
}

const schools = computed(() => {
    return schoolsRaw.value.map((school) => {
        const badge = getBadgeFromRating(school.rating)
        const features = toArray(school.features)
        const intakeMonths = toArray(school.intake_months)
        const ratingValue = Number(school.rating) || 0

        return {
            id: school.id,
            slug: school.slug,
            name: school.name,
            nameEn: school.name_en || '',
            location: (school.region_slug || school.location || '').toLowerCase(),
            fullLocation: school.location || normalizeRegionLabel(school),
            region: normalizeRegionLabel(school),
            description: school.name_en
                ? `${school.name_en} - ${normalizeRegionLabel(school)}`
                : `Trường Nhật ngữ tại ${normalizeRegionLabel(school)} với chương trình đào tạo thực tiễn.`,
            image: school.thumbnail_url || school.logo_url || '/assets/images/school-1.jpg',
            badge: badge.text,
            badgeType: badge.type,
            ratingText: ratingValue > 0 ? ratingValue.toFixed(1) : 'N/A',
            ratingValue,
            tuition: formatCurrencyYen(school.tuition_per_year),
            classSize: formatClassSize(school.class_size),
            visaSuccessRate: formatPercent(school.visa_success_rate),
            reviewCount: Number(school.review_count) || 0,
            highlights: [
                { icon: 'fas fa-users', label: 'Sĩ số lớp', value: formatClassSize(school.class_size) },
                { icon: 'fas fa-graduation-cap', label: 'Tỷ lệ visa', value: formatPercent(school.visa_success_rate) },
                { icon: 'fas fa-calendar-alt', label: 'Kỳ nhập học', value: intakeMonths.length ? intakeMonths.join(', ') : 'Đang cập nhật' }
            ],
            features: features.length ? features.slice(0, 5) : ['Tư vấn hồ sơ', 'Hỗ trợ visa']
        }
    })
})

const regionTabs = computed(() => {
    const dynamicTabs = schools.value
        .map((item) => ({ value: item.location, label: item.region }))
        .filter((tab) => tab.value)
        .filter((tab, index, list) => list.findIndex((item) => item.value === tab.value) === index)

    return [{ value: 'all', label: 'Tất cả' }, ...dynamicTabs]
})

const filteredSchools = computed(() => {
    const searchLower = searchTerm.value.toLowerCase()

    return schools.value.filter((school) => {
        const passRegion = activeRegion.value === 'all' || school.location === activeRegion.value
        const passSearch = !searchLower
            || school.name.toLowerCase().includes(searchLower)
            || school.nameEn.toLowerCase().includes(searchLower)
            || school.fullLocation.toLowerCase().includes(searchLower)
            || school.features.some((feature) => feature.toLowerCase().includes(searchLower))
        return passRegion && passSearch
    })
})

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredSchools.value.length / PAGE_SIZE))
})

const paginatedSchools = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return filteredSchools.value.slice(start, start + PAGE_SIZE)
})

const showPagination = computed(() => filteredSchools.value.length > PAGE_SIZE)

const recordCountText = computed(() => {
    const total = filteredSchools.value.length
    if (total <= PAGE_SIZE) {
        return `${total} bản ghi`
    }

    const start = (currentPage.value - 1) * PAGE_SIZE + 1
    const end = Math.min(currentPage.value * PAGE_SIZE, total)
    return `${start}~${end}/${total} bản ghi`
})

watch([activeRegion, searchTerm], () => {
    currentPage.value = 1
})

watch(totalPages, (newTotalPages) => {
    if (currentPage.value > newTotalPages) {
        currentPage.value = newTotalPages
    }
})

const comparisonSchools = computed(() => {
    return filteredSchools.value.slice(0, 6).map((school) => ({
        id: school.id,
        name: school.name,
        region: school.region,
        tuition: school.tuition,
        classSize: school.classSize,
        visaSuccessRate: school.visaSuccessRate,
        featureSummary: school.features.slice(0, 2).join(', ')
    }))
})
</script>
<style scoped>
/* ========== JAPANESE SCHOOLS PAGE ========== */

/* Schools Section */
.schools-section {
    padding: 80px 0;
    background: #fff;
}

/* Filter and Search */
.schools-filter {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin: 40px 0 50px;
    gap: 20px;
}

.filter-select-wrap {
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-width: 240px;
}

.filter-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: #666;
}

.filter-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
}

.record-count {
    font-size: 0.8rem;
    color: #999;
    white-space: nowrap;
}

.filter-select {
    padding: 10px 40px 10px 14px;
    background: white;
    border: 2px solid #e9ecef;
    border-radius: 12px;
    color: #666;
    appearance: none;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    background-image: linear-gradient(45deg, transparent 50%, #666 50%), linear-gradient(135deg, #666 50%, transparent 50%);
    background-position: calc(100% - 16px) calc(50% - 3px), calc(100% - 10px) calc(50% - 3px);
    background-size: 6px 6px, 6px 6px;
    background-repeat: no-repeat;
}

.filter-select:hover,
.filter-select:focus {
    border-color: #d32f2f;
    outline: none;
}

.search-box {
    position: relative;
    max-width: 300px;
}

.search-input {
    width: 100%;
    padding: 10px 40px 10px 15px;
    border: 2px solid #e9ecef;
    border-radius: 25px;
    outline: none;
    transition: all 0.3s ease;
}

.search-input:focus {
    border-color: #d32f2f;
}

.search-box i {
    position: absolute;
    right: 15px;
    top: 50%;
    transform: translateY(-50%);
    color: #999;
}

/* Schools Grid */
.schools-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 30px;
    margin-bottom: 60px;
}

.schools-loading {
    padding: 30px;
    text-align: center;
    border: 1px dashed #ddd;
    border-radius: 12px;
    color: #666;
    margin-bottom: 30px;
}

.pagination-wrap {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    margin-top: 10px;
    margin-bottom: 35px;
    flex-wrap: wrap;
}

.pagination-btn {
    min-width: 42px;
    height: 38px;
    padding: 0 12px;
    border: 1px solid #e4e4e4;
    background: #fff;
    color: #555;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
    border-color: #d32f2f;
    color: #d32f2f;
}

.pagination-btn.active {
    background: #d32f2f;
    border-color: #d32f2f;
    color: #fff;
}

.pagination-btn:disabled {
    opacity: 0.45;
    cursor: not-allowed;
}

/* School Card */
.school-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    border: 1px solid #f0f0f0;
}

.school-card:hover {
    transform: translateY(-8px);
    box-shadow: 0 15px 40px rgba(0, 0, 0, 0.15);
}

/* School Image */
.school-image {
    position: relative;
    height: 220px;
    overflow: hidden;
}

.school-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.3s ease;
}

.school-card:hover .school-image img {
    transform: scale(1.05);
}

/* School Badges */
.school-badge {
    position: absolute;
    top: 15px;
    left: 15px;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.school-badge.featured {
    background: linear-gradient(135deg, #ff6b6b, #ff5252);
    color: white;
}

.school-badge.popular {
    background: linear-gradient(135deg, #4facfe, #00f2fe);
    color: white;
}

.school-badge.cultural {
    background: linear-gradient(135deg, #43e97b, #38f9d7);
    color: white;
}

.school-badge.international {
    background: linear-gradient(135deg, #fa709a, #fee140);
    color: white;
}

.school-badge.affordable {
    background: linear-gradient(135deg, #a8edea, #fed6e3);
    color: #333;
}

/* School Rating */
.school-rating {
    position: absolute;
    top: 15px;
    right: 15px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 20px;
    display: flex;
    align-items: center;
    gap: 8px;
}

.stars {
    display: flex;
    gap: 2px;
}

.stars i {
    font-size: 0.8rem;
    color: #ffd700;
}

.school-rating span {
    font-weight: 700;
    font-size: 0.9rem;
}

/* School Content */
.school-content {
    padding: 25px;
}

.school-location {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 15px;
    color: #666;
    font-size: 0.9rem;
}

.school-location i {
    color: #d32f2f;
}

.school-content h3 {
    color: #333;
    font-size: 1.4rem;
    margin-bottom: 12px;
    font-weight: 700;
    line-height: 1.3;
}

.school-description {
    color: #666;
    line-height: 1.6;
    margin-bottom: 20px;
    font-size: 0.95rem;
}

/* School Highlights */
.school-highlights {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
    margin-bottom: 20px;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 10px;
}

.highlight-item {
    display: flex;
    align-items: center;
    gap: 10px;
}

.highlight-item i {
    width: 35px;
    height: 35px;
    background: linear-gradient(135deg, #d32f2f, #b71c1c);
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.9rem;
    flex-shrink: 0;
}

.highlight-item div span {
    display: block;
    color: #999;
    font-size: 0.8rem;
    margin-bottom: 2px;
}

.highlight-item div strong {
    color: #333;
    font-size: 0.9rem;
    font-weight: 600;
}

/* School Features */
.school-features {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
}

.feature-tag {
    padding: 5px 12px;
    background: #e3f2fd;
    color: #1976d2;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
}

/* School Pricing */
.school-pricing {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-top: 20px;
    border-top: 1px solid #f0f0f0;
}

.price {
    display: flex;
    flex-direction: column;
}

.price-label {
    color: #999;
    font-size: 0.8rem;
    margin-bottom: 4px;
}

.price-amount {
    color: #d32f2f;
    font-size: 1.2rem;
    font-weight: 700;
}

.school-actions {
    display: flex;
    gap: 10px;
}

/* Comparison Section */
.comparison-section {
    margin-top: 60px;
    padding: 40px;
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0, 0, 0, 0.08);
}

.comparison-section h3 {
    color: #333;
    font-size: 1.5rem;
    margin-bottom: 30px;
    text-align: center;
}

.comparison-table {
    overflow-x: auto;
}

.comparison-table table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.9rem;
}

.comparison-table th,
.comparison-table td {
    padding: 12px 15px;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
}

.comparison-table th {
    background: #f8f9fa;
    color: #333;
    font-weight: 600;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.comparison-table td {
    color: #666;
}

.comparison-table tr:hover {
    background: #fafafa;
}

@media (max-width: 1024px) {

    /* Japanese Schools - Tablet */
    .schools-filter {
        flex-direction: column;
        gap: 15px;
        align-items: stretch;
    }

    .filter-select-wrap {
        min-width: 100%;
    }

    .filter-head {
        width: 100%;
    }

    .schools-grid {
        grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
        gap: 25px;
    }

    .school-highlights {
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
        padding: 18px;
    }

    .highlight-item div span,
    .highlight-item div strong {
        font-size: 0.85rem;
    }

    .school-content h3 {
        font-size: 1.2rem;
    }

    .school-description {
        font-size: 0.9rem;
    }

    .comparison-section {
        padding: 30px 20px;
    }

    .comparison-table th,
    .comparison-table td {
        padding: 10px 12px;
        font-size: 0.85rem;
    }
}

@media (max-width: 768px) {

    /* Japanese Schools - Mobile */
    .schools-filter {
        flex-direction: column;
        align-items: stretch;
        gap: 20px;
    }

    .filter-select {
        width: 100%;
    }

    .search-box {
        max-width: 100%;
    }

    .schools-grid {
        grid-template-columns: 1fr;
        gap: 20px;
    }

    .school-card {
        margin: 0 10px;
    }

    .school-highlights {
        grid-template-columns: 1fr;
        gap: 12px;
        padding: 15px;
    }

    .highlight-item {
        justify-content: center;
        text-align: center;
        flex-direction: row;
        gap: 8px;
    }

    .highlight-item i {
        margin-bottom: 5px;
    }

    .school-features {
        justify-content: center;
    }

    .feature-tag {
        font-size: 0.75rem;
        padding: 4px 10px;
    }

    .school-pricing {
        flex-direction: column;
        gap: 15px;
        align-items: center;
    }

    .school-actions {
        justify-content: center;
    }

    .comparison-section {
        padding: 20px 15px;
        margin: 40px 10px 0;
    }

    .comparison-table {
        font-size: 0.8rem;
    }

    .comparison-table th,
    .comparison-table td {
        padding: 8px 6px;
        font-size: 0.75rem;
    }
}

@media (max-width: 480px) {}

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
</style>