<template>
    <div class="school-view-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Khong the truy cap Chi tiet truong hoc</h3>
                <p>Chi Superadmin, Admin va Manager moi co the xem chi tiet truong hoc.</p>
                <NuxtLink to="/admin/schools" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Quay lai danh sach</NuxtLink>
            </div>
        </div>

        <div v-else class="content-wrapper">
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-school"></i> Chi tiet truong hoc</h1>
                    <p v-if="school.id">ID: #{{ school.id }} - {{ school.name }}</p>
                </div>
                <div class="header-actions">
                    <NuxtLink :to="`/admin/schools/edit/${schoolId}`" class="btn btn-primary"><i class="fas fa-edit"></i> Chinh sua</NuxtLink>
                    <NuxtLink to="/admin/schools" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Quay lai</NuxtLink>
                </div>
            </div>

            <div v-if="loading" class="loading-box">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang tai chi tiet truong hoc...</p>
            </div>

            <div v-else-if="error" class="error-box">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button class="btn btn-primary" @click="fetchSchoolDetail">Thu lai</button>
            </div>

            <div v-else class="school-detail">
                <div class="meta-grid">
                    <div class="meta-item"><span class="label">Ten truong:</span><span class="value">{{ school.name || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Slug:</span><span class="value">{{ school.slug || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Khu vuc:</span><span class="value">{{ school.region_name || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Loai truong:</span><span class="value">{{ school.type_name || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Dia diem:</span><span class="value">{{ school.location || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Trang thai:</span><span class="value"><span class="badge" :class="getStatusClass(school.status)">{{ getStatusText(school.status) }}</span></span></div>
                    <div class="meta-item"><span class="label">Hoc phi/nam:</span><span class="value">{{ formatCurrency(school.tuition_per_year) }}</span></div>
                    <div class="meta-item"><span class="label">Si so lop:</span><span class="value">{{ school.class_size || '-' }}</span></div>
                    <div class="meta-item"><span class="label">Ti le visa:</span><span class="value">{{ school.visa_success_rate !== null && school.visa_success_rate !== undefined ? school.visa_success_rate + '%' : '-' }}</span></div>
                    <div class="meta-item"><span class="label">Rating:</span><span class="value">{{ Number(school.rating || 0).toFixed(1) }}</span></div>
                    <div class="meta-item"><span class="label">So review:</span><span class="value">{{ Number(school.review_count || 0) }}</span></div>
                    <div class="meta-item"><span class="label">Ngay tao:</span><span class="value">{{ formatDate(school.created_at) }}</span></div>
                    <div class="meta-item"><span class="label">Cap nhat:</span><span class="value">{{ formatDate(school.updated_at) }}</span></div>
                    <div class="meta-item full"><span class="label">Logo URL:</span><span class="value">{{ school.logo_url || '-' }}</span></div>
                    <div class="meta-item full"><span class="label">Thumbnail URL:</span><span class="value">{{ school.thumbnail_url || '-' }}</span></div>
                </div>

                <div class="content-block">
                    <h3>Features / Tag diem manh</h3>
                    <div v-if="featureTags.length" class="feature-tags">
                        <span v-for="tag in featureTags" :key="tag" class="feature-tag">{{ tag }}</span>
                    </div>
                    <div v-else class="feature-empty-state">
                        Chua co feature nao.
                    </div>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'

const route = useRoute()
const schoolId = route.params.id

definePageMeta({ layout: 'admin', middleware: ['auth', 'permission'], ssr: false })
useHead({ title: 'Chi tiet truong hoc - Admin' })

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const school = ref({})
const loading = ref(true)
const error = ref('')

const fetchSchoolDetail = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(`${API_BASE}/schools/${schoolId}`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
        school.value = data.data || {}
    } catch (err) {
        error.value = err.message || 'Khong the tai chi tiet truong hoc'
    } finally {
        loading.value = false
    }
}

const formatDate = (date) => {
    if (!date) return '-'
    return new Date(date).toLocaleString('vi-VN')
}

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '-'
    return Number(value).toLocaleString('vi-VN') + ' VND'
}

const normalizeFeatureTags = (features) => {
    const rawItems = Array.isArray(features)
        ? features
        : features && typeof features === 'object'
            ? Object.entries(features).every(([key]) => /^\d+$/.test(key))
                ? Object.values(features)
                : Object.keys(features)
            : typeof features === 'string'
                ? features.split(/[,\n;]/)
                : []

    const normalized = []
    const seen = new Set()

    for (const item of rawItems) {
        const value = String(item || '').trim()
        if (!value) continue

        const key = value.toLowerCase()
        if (seen.has(key)) continue
        seen.add(key)
        normalized.push(value)
    }

    return normalized
}

const featureTags = computed(() => normalizeFeatureTags(school.value.features))

const getStatusClass = (status) => {
    const classes = {
        partner: 'badge-primary',
        active: 'badge-success',
        paused: 'badge-warning',
        pending: 'badge-secondary'
    }
    return classes[status] || 'badge-secondary'
}

const getStatusText = (status) => {
    const texts = {
        partner: 'Doi tac',
        active: 'Hoat dong',
        paused: 'Tam dung',
        pending: 'Cho duyet'
    }
    return texts[status] || status || '-'
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) await fetchSchoolDetail()
})
</script>

<style scoped>
.school-view-page { padding: 0; min-height: 100vh; }
.content-wrapper { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eee; }
.page-header h1 { margin: 0 0 0.5rem 0; color: #333; display: flex; align-items: center; gap: 10px; }
.page-header p { margin: 0; color: #666; }
.header-actions { display: flex; gap: 0.75rem; }
.loading-box, .error-box { text-align: center; padding: 2rem; color: #666; }
.loading-box i { font-size: 2rem; color: #2196f3; margin-bottom: 1rem; }
.error-box i { font-size: 2rem; color: #f44336; margin-bottom: 1rem; }
.school-detail { margin-top: 1rem; }
.meta-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem 1rem; margin-bottom: 1.5rem; }
.meta-item { display: flex; gap: 0.5rem; align-items: flex-start; }
.meta-item.full { grid-column: 1 / -1; }
.label { min-width: 130px; color: #666; font-weight: 600; }
.value { color: #222; word-break: break-word; }
.content-block { border-top: 1px solid #eee; padding-top: 1rem; }
.content-block h3 { margin: 0 0 0.75rem 0; color: #333; }
.feature-tags { display: flex; flex-wrap: wrap; gap: 0.75rem; }
.feature-tag { display: inline-flex; align-items: center; padding: 0.5rem 0.85rem; border-radius: 999px; background: #e0f2fe; color: #075985; font-weight: 600; font-size: 0.92rem; }
.feature-empty-state { padding: 0.85rem 1rem; border: 1px dashed #cbd5e1; border-radius: 10px; background: #f8fafc; color: #64748b; font-size: 0.92rem; }
.badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
.badge-primary { background: #dbeafe; color: #1d4ed8; }
.badge-success { background: #d4edda; color: #155724; }
.badge-warning { background: #fff3cd; color: #856404; }
.badge-secondary { background: #e2e3e5; color: #383d41; }
.btn { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #f5f5f5; color: #666; }
.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied { text-align: center; max-width: 500px; padding: 3rem 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.loading-permission i { font-size: 3rem; color: #2196f3; margin-bottom: 1rem; }
.permission-denied i { font-size: 3rem; color: #f44336; margin-bottom: 1rem; }
@media (max-width: 768px) {
    .content-wrapper { padding: 1rem; }
    .page-header { flex-direction: column; gap: 1rem; }
    .header-actions { width: 100%; display: grid; grid-template-columns: 1fr; }
    .meta-grid { grid-template-columns: 1fr; }
    .label { min-width: 110px; }
}
</style>
