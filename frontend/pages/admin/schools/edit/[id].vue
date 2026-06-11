<template>
    <div class="school-form-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Khong the truy cap Chinh sua truong hoc</h3>
                <p>Chi Superadmin, Admin va Manager moi co the chinh sua truong hoc.</p>
                <NuxtLink to="/admin/schools" class="btn btn-primary"><i class="fas fa-arrow-left"></i> Quay lai danh sach</NuxtLink>
            </div>
        </div>

        <div v-else class="form-wrapper">
            <div class="page-header">
                <div>
                    <h1><i class="fas fa-edit"></i> Chinh sua truong hoc</h1>
                    <p>Cap nhat thong tin truong #{{ schoolId }}</p>
                </div>
                <div class="header-actions">
                    <NuxtLink :to="`/admin/schools/view/${schoolId}`" class="btn btn-secondary"><i class="fas fa-eye"></i> Xem chi tiet</NuxtLink>
                    <NuxtLink to="/admin/schools" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Quay lai</NuxtLink>
                </div>
            </div>

            <div v-if="loading" class="loading-box">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang tai du lieu truong hoc...</p>
            </div>

            <div v-else-if="error" class="error-box">
                <i class="fas fa-exclamation-triangle"></i>
                <p>{{ error }}</p>
                <button class="btn btn-primary" @click="fetchSchoolDetail">Thu lai</button>
            </div>

            <form v-else class="school-form" @submit.prevent="handleUpdateSchool">
                <div class="form-grid">
                    <div class="form-group full">
                        <label>Ten truong <span class="required">*</span></label>
                        <input v-model.trim="form.name" @input="clearFieldError('name')" @blur="handleNameBlur" :class="['form-control', { 'is-invalid': !!formErrors.name }]" type="text">
                        <p v-if="formErrors.name" class="field-error">{{ formErrors.name }}</p>
                    </div>

                    <div class="form-group">
                        <label>Slug</label>
                        <input v-model.trim="form.slug" @input="clearFieldError('slug')" @blur="validateField('slug')" :class="['form-control', { 'is-invalid': !!formErrors.slug }]" type="text">
                        <p v-if="formErrors.slug" class="field-error">{{ formErrors.slug }}</p>
                    </div>

                    <div class="form-group">
                        <label>Trang thai</label>
                        <select v-model="form.status" @change="clearFieldError('status')" :class="['form-control', { 'is-invalid': !!formErrors.status }]">
                            <option value="pending">Cho duyet</option>
                            <option value="partner">Doi tac</option>
                            <option value="active">Hoat dong</option>
                            <option value="paused">Tam dung</option>
                        </select>
                        <p v-if="formErrors.status" class="field-error">{{ formErrors.status }}</p>
                    </div>

                    <div class="form-group">
                        <label>Khu vuc</label>
                        <select v-model="form.region_id" @change="clearFieldError('region_id')" :class="['form-control', { 'is-invalid': !!formErrors.region_id }]">
                            <option :value="null">Chon khu vuc</option>
                            <option v-for="region in regions" :key="region.id" :value="Number(region.id)">{{ region.name }}</option>
                        </select>
                        <p v-if="formErrors.region_id" class="field-error">{{ formErrors.region_id }}</p>
                    </div>

                    <div class="form-group">
                        <label>Loai truong</label>
                        <select v-model="form.type_id" @change="clearFieldError('type_id')" :class="['form-control', { 'is-invalid': !!formErrors.type_id }]">
                            <option :value="null">Chon loai truong</option>
                            <option v-for="type in schoolTypes" :key="type.id" :value="Number(type.id)">{{ type.name }}</option>
                        </select>
                        <p v-if="formErrors.type_id" class="field-error">{{ formErrors.type_id }}</p>
                    </div>

                    <div class="form-group full">
                        <label>Dia diem</label>
                        <input v-model.trim="form.location" @input="clearFieldError('location')" @blur="validateField('location')" :class="['form-control', { 'is-invalid': !!formErrors.location }]" type="text">
                        <p v-if="formErrors.location" class="field-error">{{ formErrors.location }}</p>
                    </div>

                    <div class="form-group">
                        <label>Hoc phi/nam (VND)</label>
                        <input v-model.number="form.tuition_per_year" @input="clearFieldError('tuition_per_year')" @blur="validateField('tuition_per_year')" :class="['form-control', { 'is-invalid': !!formErrors.tuition_per_year }]" type="number" min="0" step="1000000">
                        <p v-if="formErrors.tuition_per_year" class="field-error">{{ formErrors.tuition_per_year }}</p>
                    </div>

                    <div class="form-group">
                        <label>Si so lop</label>
                        <input v-model.number="form.class_size" @input="clearFieldError('class_size')" @blur="validateField('class_size')" :class="['form-control', { 'is-invalid': !!formErrors.class_size }]" type="number" min="1" max="200">
                        <p v-if="formErrors.class_size" class="field-error">{{ formErrors.class_size }}</p>
                    </div>

                    <div class="form-group">
                        <label>Ti le visa thanh cong (%)</label>
                        <input v-model.number="form.visa_success_rate" @input="clearFieldError('visa_success_rate')" @blur="validateField('visa_success_rate')" :class="['form-control', { 'is-invalid': !!formErrors.visa_success_rate }]" type="number" min="0" max="100" step="0.1">
                        <p v-if="formErrors.visa_success_rate" class="field-error">{{ formErrors.visa_success_rate }}</p>
                    </div>

                    <div class="form-group">
                        <label>Rating</label>
                        <input v-model.number="form.rating" @input="clearFieldError('rating')" @blur="validateField('rating')" :class="['form-control', { 'is-invalid': !!formErrors.rating }]" type="number" min="0" max="5" step="0.1">
                        <p v-if="formErrors.rating" class="field-error">{{ formErrors.rating }}</p>
                    </div>

                    <div class="form-group">
                        <label>Logo URL</label>
                        <input v-model.trim="form.logo_url" @input="clearFieldError('logo_url')" @blur="validateField('logo_url')" :class="['form-control', { 'is-invalid': !!formErrors.logo_url }]" type="url">
                        <p v-if="formErrors.logo_url" class="field-error">{{ formErrors.logo_url }}</p>
                    </div>

                    <div class="form-group full">
                        <label>Thumbnail URL</label>
                        <input v-model.trim="form.thumbnail_url" @input="clearFieldError('thumbnail_url')" @blur="validateField('thumbnail_url')" :class="['form-control', { 'is-invalid': !!formErrors.thumbnail_url }]" type="url">
                        <p v-if="formErrors.thumbnail_url" class="field-error">{{ formErrors.thumbnail_url }}</p>
                    </div>

                    <div class="form-group full">
                        <div class="features-header">
                            <label>Features / Tag diem manh</label>
                            <button type="button" class="btn btn-outline-secondary btn-sm" @click="addFeature">
                                <i class="fas fa-plus"></i>
                                Them feature
                            </button>
                        </div>
                        <p class="field-hint">Moi feature la mot tag ngan mo ta diem manh cua truong.</p>

                        <div v-if="featureItems.length" class="feature-list">
                            <div v-for="(feature, index) in featureItems" :key="index" class="feature-item">
                                <input
                                    v-model.trim="featureItems[index]"
                                    @input="clearFieldError('features')"
                                    @blur="normalizeFeature(index)"
                                    :class="['form-control', 'feature-input', { 'is-invalid': !!formErrors.features }]"
                                    type="text"
                                    placeholder="Nhap feature tag"
                                >
                                <button type="button" class="btn-icon-danger" @click="removeFeature(index)" aria-label="Xoa feature">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>
                        </div>

                        <div v-else class="feature-empty-state">
                            Chua co feature nao. Bam "Them feature" de them tag moi.
                        </div>

                        <p v-if="formErrors.features" class="field-error">{{ formErrors.features }}</p>
                    </div>
                </div>

                <div class="form-actions">
                    <NuxtLink to="/admin/schools" class="btn btn-secondary">Huy</NuxtLink>
                    <button class="btn btn-primary" type="submit" :disabled="saving">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        {{ saving ? 'Dang cap nhat...' : 'Cap nhat truong hoc' }}
                    </button>
                </div>
            </form>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({ layout: 'admin', middleware: ['auth', 'permission'], ssr: false })
useHead({ title: 'Chinh sua truong hoc - Admin' })

const route = useRoute()
const schoolId = route.params.id
const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const regions = ref([])
const schoolTypes = ref([])
const loading = ref(true)
const saving = ref(false)
const error = ref('')

const form = reactive({
    name: '', slug: '', location: '', tuition_per_year: null, class_size: null, visa_success_rate: null,
    region_id: null, type_id: null, status: 'pending', logo_url: '', thumbnail_url: '', rating: null
})
const featureItems = ref([])

const formErrors = reactive({
    name: '', slug: '', location: '', tuition_per_year: '', class_size: '', visa_success_rate: '',
    region_id: '', type_id: '', status: '', logo_url: '', thumbnail_url: '', rating: '', features: ''
})

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const toSlug = (text) => String(text || '').toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')
const clearFieldError = (field) => { if (formErrors[field]) formErrors[field] = '' }
const setBackendFieldErrors = (errors = {}) => { Object.keys(formErrors).forEach((key) => { formErrors[key] = errors?.[key] || '' }) }
const isValidHttpUrl = (value) => { try { const parsed = new URL(value); return ['http:', 'https:'].includes(parsed.protocol) } catch { return false } }
const handleNameBlur = () => { validateField('name'); if (!form.slug.trim()) form.slug = toSlug(form.name); validateField('slug') }

const normalizeFeatureItems = (source) => {
    const rawItems = Array.isArray(source)
        ? source
        : source && typeof source === 'object'
            ? Object.entries(source).every(([key]) => /^\d+$/.test(key))
                ? Object.values(source)
                : Object.keys(source)
            : typeof source === 'string'
                ? source.split(/[,\n;]/)
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

const addFeature = () => { featureItems.value.push('') }
const removeFeature = (index) => { featureItems.value.splice(index, 1) }
const normalizeFeature = (index) => {
    if (index < 0 || index >= featureItems.value.length) return
    featureItems.value[index] = String(featureItems.value[index] || '').trim()
}

const validateField = (field) => {
    const name = form.name.trim()
    const slug = form.slug.trim()
    const location = form.location.trim()
    const logo = form.logo_url.trim()
    const thumbnail = form.thumbnail_url.trim()

    if (field === 'name') {
        if (!name) return (formErrors.name = 'Ten truong la bat buoc', false)
        if (name.length < 3) return (formErrors.name = 'Ten truong phai co it nhat 3 ky tu', false)
        if (name.length > 200) return (formErrors.name = 'Ten truong khong duoc vuot qua 200 ky tu', false)
        formErrors.name = ''
        return true
    }
    if (field === 'slug') {
        if (!slug) return (formErrors.slug = '', true)
        if (slug.length < 2) return (formErrors.slug = 'Slug phai co it nhat 2 ky tu', false)
        if (slug.length > 200) return (formErrors.slug = 'Slug khong duoc vuot qua 200 ky tu', false)
        if (!slugPattern.test(slug)) return (formErrors.slug = 'Slug chi gom chu thuong, so va dau gach ngang', false)
        formErrors.slug = ''
        return true
    }
    if (field === 'location') {
        if (location.length > 500) return (formErrors.location = 'Dia diem khong duoc vuot qua 500 ky tu', false)
        formErrors.location = ''
        return true
    }
    if (field === 'tuition_per_year') {
        if (form.tuition_per_year === null || form.tuition_per_year === undefined || form.tuition_per_year === '') return (formErrors.tuition_per_year = '', true)
        const value = Number(form.tuition_per_year)
        if (!Number.isFinite(value) || value < 0 || value > 10000000) return (formErrors.tuition_per_year = 'Hoc phi phai trong khoang 0 - 10000000', false)
        formErrors.tuition_per_year = ''
        return true
    }
    if (field === 'class_size') {
        if (form.class_size === null || form.class_size === undefined || form.class_size === '') return (formErrors.class_size = '', true)
        const value = Number(form.class_size)
        if (!Number.isInteger(value) || value < 1 || value > 200) return (formErrors.class_size = 'Si so lop phai trong khoang 1 - 200', false)
        formErrors.class_size = ''
        return true
    }
    if (field === 'visa_success_rate') {
        if (form.visa_success_rate === null || form.visa_success_rate === undefined || form.visa_success_rate === '') return (formErrors.visa_success_rate = '', true)
        const value = Number(form.visa_success_rate)
        if (!Number.isFinite(value) || value < 0 || value > 100) return (formErrors.visa_success_rate = 'Ti le visa phai trong khoang 0 - 100', false)
        formErrors.visa_success_rate = ''
        return true
    }
    if (field === 'rating') {
        if (form.rating === null || form.rating === undefined || form.rating === '') return (formErrors.rating = '', true)
        const value = Number(form.rating)
        if (!Number.isFinite(value) || value < 0 || value > 5) return (formErrors.rating = 'Rating phai trong khoang 0 - 5', false)
        formErrors.rating = ''
        return true
    }
    if (field === 'region_id') {
        if (form.region_id !== null && form.region_id !== undefined && (!Number.isInteger(Number(form.region_id)) || Number(form.region_id) < 1)) return (formErrors.region_id = 'Khu vuc khong hop le', false)
        formErrors.region_id = ''
        return true
    }
    if (field === 'type_id') {
        if (form.type_id !== null && form.type_id !== undefined && (!Number.isInteger(Number(form.type_id)) || Number(form.type_id) < 1)) return (formErrors.type_id = 'Loai truong khong hop le', false)
        formErrors.type_id = ''
        return true
    }
    if (field === 'status') {
        if (!['partner', 'active', 'paused', 'pending'].includes(form.status)) return (formErrors.status = 'Trang thai khong hop le', false)
        formErrors.status = ''
        return true
    }
    if (field === 'logo_url') {
        if (!logo) return (formErrors.logo_url = '', true)
        if (!isValidHttpUrl(logo)) return (formErrors.logo_url = 'Logo URL khong hop le (http/https)', false)
        formErrors.logo_url = ''
        return true
    }
    if (field === 'thumbnail_url') {
        if (!thumbnail) return (formErrors.thumbnail_url = '', true)
        if (!isValidHttpUrl(thumbnail)) return (formErrors.thumbnail_url = 'Thumbnail URL khong hop le (http/https)', false)
        formErrors.thumbnail_url = ''
        return true
    }
    if (field === 'features') {
        featureItems.value = normalizeFeatureItems(featureItems.value)
        formErrors.features = ''
        return true
    }
    return true
}

const validateForm = () => ['name','slug','location','tuition_per_year','class_size','visa_success_rate','rating','region_id','type_id','status','logo_url','thumbnail_url','features'].every((f) => validateField(f))

const fetchRegions = async () => {
    try {
        const response = await fetch(`${API_BASE}/regions`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
        const data = await response.json()
        if (response.ok) regions.value = data.data || []
    } catch { regions.value = [] }
}

const fetchSchoolTypes = async () => {
    try {
        const response = await fetch(`${API_BASE}/school-types`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
        const data = await response.json()
        if (response.ok) schoolTypes.value = data.data || []
    } catch { schoolTypes.value = [] }
}

const fetchSchoolDetail = async () => {
    loading.value = true
    error.value = ''
    try {
        const response = await fetch(`${API_BASE}/schools/${schoolId}`, { method: 'GET', credentials: 'include', headers: { 'Content-Type': 'application/json' } })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)

        const item = data.data || {}
        form.name = item.name || ''
        form.slug = item.slug || ''
        form.location = item.location || ''
        form.tuition_per_year = item.tuition_per_year ? Number(item.tuition_per_year) : null
        form.class_size = item.class_size ? Number(item.class_size) : null
        form.visa_success_rate = item.visa_success_rate ? Number(item.visa_success_rate) : null
        form.region_id = item.region_id ? Number(item.region_id) : null
        form.type_id = item.type_id ? Number(item.type_id) : null
        form.status = item.status || 'pending'
        form.logo_url = item.logo_url || ''
        form.thumbnail_url = item.thumbnail_url || ''
        form.rating = item.rating ? Number(item.rating) : null
        featureItems.value = normalizeFeatureItems(item.features)
    } catch (err) {
        error.value = err.message || 'Khong the tai truong hoc'
    } finally {
        loading.value = false
    }
}

const buildPayload = () => {
    const payload = {
        name: form.name,
        slug: form.slug || undefined,
        location: form.location || undefined,
        tuition_per_year: form.tuition_per_year || undefined,
        class_size: form.class_size || undefined,
        visa_success_rate: form.visa_success_rate || undefined,
        region_id: form.region_id || undefined,
        type_id: form.type_id || undefined,
        status: form.status,
        logo_url: form.logo_url || undefined,
        thumbnail_url: form.thumbnail_url || undefined,
        rating: form.rating || undefined
    }

    const features = normalizeFeatureItems(featureItems.value)
    if (features.length) {
        payload.features = features.reduce((accumulator, feature) => {
            accumulator[feature] = true
            return accumulator
        }, {})
    }
    return payload
}

const handleUpdateSchool = async () => {
    setBackendFieldErrors({})
    if (!validateForm()) {
        showError('Vui long kiem tra lai thong tin truong hoc')
        return
    }

    saving.value = true
    try {
        const response = await fetch(`${API_BASE}/schools/${schoolId}`, {
            method: 'PUT',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(buildPayload())
        })
        const data = await response.json()
        if (!response.ok) {
            if (data?.errors) setBackendFieldErrors(data.errors)
            throw new Error(data?.message || `HTTP ${response.status}`)
        }
        showSuccess(data?.message || 'Cap nhat truong hoc thanh cong')
        await navigateTo('/admin/schools')
    } catch (err) {
        showError(err.message || 'Khong the cap nhat truong hoc')
    } finally {
        saving.value = false
    }
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await Promise.all([fetchRegions(), fetchSchoolTypes(), fetchSchoolDetail()])
    }
})
</script>

<style scoped>
.school-form-page { padding: 0; min-height: 100vh; }
.form-wrapper { background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding-bottom: 1rem; border-bottom: 2px solid #eee; }
.page-header h1 { margin: 0 0 0.5rem 0; color: #333; display: flex; align-items: center; gap: 10px; }
.page-header p { margin: 0; color: #666; }
.header-actions { display: flex; gap: 0.75rem; }
.loading-box, .error-box { text-align: center; padding: 2rem; color: #666; }
.loading-box i { font-size: 2rem; color: #2196f3; margin-bottom: 1rem; }
.error-box i { font-size: 2rem; color: #f44336; margin-bottom: 1rem; }
.school-form { margin-top: 1rem; }
.form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.form-group.full { grid-column: 1 / -1; }
.form-group label { display: block; margin-bottom: 0.5rem; color: #333; font-weight: 500; }
.form-control { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem; }
.form-control:focus { outline: none; border-color: #1976d2; }
.form-control.is-invalid { border-color: #dc3545; box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15); }
.field-error { margin: 0.4rem 0 0; color: #dc3545; font-size: 0.85rem; }
textarea.form-control { resize: vertical; }
.required { color: #dc3545; }
.form-actions { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 1.5rem; }
.btn { padding: 0.75rem 1.25rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; display: inline-flex; align-items: center; gap: 0.5rem; text-decoration: none; }
.btn-primary { background: #1976d2; color: white; }
.btn-secondary { background: #f5f5f5; color: #666; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.features-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 0.5rem; }
.field-hint { margin: 0 0 0.75rem; color: #6b7280; font-size: 0.875rem; }
.feature-list { display: grid; gap: 0.75rem; }
.feature-item { display: grid; grid-template-columns: 1fr auto; gap: 0.5rem; align-items: center; }
.feature-input { min-width: 0; }
.feature-empty-state { padding: 0.85rem 1rem; border: 1px dashed #cbd5e1; border-radius: 10px; background: #f8fafc; color: #64748b; font-size: 0.92rem; }
.btn-icon-danger { width: 40px; height: 40px; border: 1px solid #f1b4b8; background: #fff5f5; color: #dc3545; border-radius: 10px; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; }
.btn-icon-danger:hover { background: #ffe3e6; }
.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied { text-align: center; max-width: 500px; padding: 3rem 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
.loading-permission i { font-size: 3rem; color: #2196f3; margin-bottom: 1rem; }
.permission-denied i { font-size: 3rem; color: #f44336; margin-bottom: 1rem; }
@media (max-width: 768px) {
    .form-grid { grid-template-columns: 1fr; }
    .form-wrapper { padding: 1rem; }
    .page-header { flex-direction: column; gap: 1rem; }
    .header-actions { width: 100%; display: grid; grid-template-columns: 1fr; }
    .features-header { align-items: flex-start; flex-direction: column; }
}
</style>
