<template>
    <div class="schools-regions-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Khong the truy cap Quan ly khu vuc</h3>
                <p>Chi Superadmin, Admin va Manager moi co the quan ly khu vuc truong hoc.</p>
                <NuxtLink to="/admin" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lai Dashboard
                </NuxtLink>
            </div>
        </div>

        <div v-else>
            <div class="page-header">
                <div class="header-content">
                    <h1>
                        <i class="fas fa-map-marked-alt"></i>
                        Quan ly khu vuc truong hoc
                    </h1>
                    <p>Tao va quan ly cac khu vuc dung de phan loai truong hoc</p>
                </div>
                <div class="header-actions">
                    <button @click="openCreateModal" class="btn btn-primary">
                        <i class="fas fa-plus"></i>
                        Them khu vuc
                    </button>
                    <button @click="fetchRegions" class="btn btn-secondary" :disabled="loading">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Lam moi
                    </button>
                </div>
            </div>

            <div class="table-controls">
                <input
                    v-model="searchQuery"
                    type="text"
                    class="form-control search-input"
                    placeholder="Tim theo ten hoac slug khu vuc..."
                >
            </div>

            <div class="regions-table">
                <div v-if="loading" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Dang tai khu vuc...</p>
                </div>

                <div v-else-if="error" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Loi: {{ error }}</p>
                    <button @click="fetchRegions" class="btn btn-primary">Thu lai</button>
                </div>

                <div v-else-if="filteredRegions.length > 0" class="table-container">
                    <table class="table">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Ten khu vuc</th>
                                <th>Slug</th>
                                <th>So truong</th>
                                <th>Thao tac</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="region in filteredRegions" :key="region.id">
                                <td>{{ region.id }}</td>
                                <td>{{ region.name }}</td>
                                <td>{{ region.slug }}</td>
                                <td>
                                    <span class="badge" :class="Number(region.schools_count || 0) > 0 ? 'badge-success' : 'badge-secondary'">
                                        {{ Number(region.schools_count || 0) }} truong
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="openEditModal(region)" :disabled="saving">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button
                                        class="btn btn-sm btn-outline-danger"
                                        :disabled="deletingId === region.id || saving"
                                        @click="handleDeleteRegion(region)"
                                    >
                                        <i class="fas" :class="deletingId === region.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <div v-else class="empty-state">
                    <i class="fas fa-map"></i>
                    <h3>Chua co khu vuc phu hop</h3>
                    <p>Hay tao khu vuc dau tien de phan loai truong hoc.</p>
                </div>
            </div>
        </div>

        <div v-if="showRegionModal" class="modal-overlay">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>{{ editingRegion ? 'Sua khu vuc' : 'Them khu vuc moi' }}</h3>
                    <button @click="closeModal" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-group">
                        <label>Ten khu vuc <span class="required">*</span></label>
                        <input
                            v-model.trim="regionForm.name"
                            @input="clearFieldError('name')"
                            @blur="handleNameBlur"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!formErrors.name }"
                            placeholder="Nhap ten khu vuc"
                        >
                        <p v-if="formErrors.name" class="field-error">{{ formErrors.name }}</p>
                    </div>
                    <div class="form-group">
                        <label>Slug</label>
                        <input
                            v-model.trim="regionForm.slug"
                            @input="clearFieldError('slug')"
                            @blur="validateField('slug')"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!formErrors.slug }"
                            placeholder="slug-khu-vuc (de trong se tu tao)"
                        >
                        <p v-if="formErrors.slug" class="field-error">{{ formErrors.slug }}</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="closeModal">Huy</button>
                    <button class="btn btn-primary" :disabled="saving" @click="saveRegion">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        {{ editingRegion ? 'Cap nhat' : 'Tao moi' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showDeleteConfirm && regionToDelete" class="modal-overlay">
            <div class="modal modal-small" @click.stop>
                <div class="modal-header">
                    <h3>Xac nhan xoa</h3>
                    <button @click="closeDeleteConfirm" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="delete-confirmation">
                        <i class="fas fa-exclamation-triangle warning-icon"></i>
                        <p>Ban co chac chan muon xoa khu vuc <strong>{{ regionToDelete.name }}</strong>?</p>
                        <p class="warning-text">Thao tac nay khong the hoan tac!</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteConfirm" type="button" class="btn btn-secondary">Huy</button>
                    <button @click="confirmDeleteRegion" type="button" class="btn btn-danger" :disabled="saving || deletingId === regionToDelete.id">
                        <i v-if="deletingId === regionToDelete.id" class="fas fa-spinner fa-spin"></i>
                        {{ deletingId === regionToDelete.id ? 'Dang xoa...' : 'Xoa khu vuc' }}
                    </button>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quan ly khu vuc truong hoc - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))

const regions = ref([])
const loading = ref(false)
const saving = ref(false)
const deletingId = ref(null)
const showDeleteConfirm = ref(false)
const regionToDelete = ref(null)
const error = ref('')
const searchQuery = ref('')

const showRegionModal = ref(false)
const editingRegion = ref(null)
const regionForm = reactive({ name: '', slug: '' })
const formErrors = reactive({ name: '', slug: '' })

const filteredRegions = computed(() => {
    if (!searchQuery.value) return regions.value
    const q = searchQuery.value.toLowerCase()
    return regions.value.filter((item) => item.name?.toLowerCase().includes(q) || item.slug?.toLowerCase().includes(q))
})

const toSlug = (text) => {
    return String(text || '')
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '')
}

const handleNameBlur = () => {
    const name = (regionForm.name || '').trim()
    const slug = (regionForm.slug || '').trim()
    if (name && !slug) regionForm.slug = toSlug(name)
    validateField('name')
    validateField('slug')
}

const clearFieldError = (field) => {
    if (formErrors[field]) formErrors[field] = ''
}

const validateField = (field) => {
    const name = (regionForm.name || '').trim()
    const slug = (regionForm.slug || '').trim()

    if (field === 'name') {
        if (!name) return (formErrors.name = 'Ten khu vuc la bat buoc', false)
        if (name.length < 2) return (formErrors.name = 'Ten khu vuc phai co it nhat 2 ky tu', false)
        if (name.length > 100) return (formErrors.name = 'Ten khu vuc khong duoc vuot qua 100 ky tu', false)
        formErrors.name = ''
        return true
    }

    if (field === 'slug') {
        if (!slug) return (formErrors.slug = '', true)
        if (slug.length < 2) return (formErrors.slug = 'Slug phai co it nhat 2 ky tu', false)
        if (slug.length > 120) return (formErrors.slug = 'Slug khong duoc vuot qua 120 ky tu', false)
        if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) return (formErrors.slug = 'Slug chi gom chu thuong, so va dau gach ngang', false)
        formErrors.slug = ''
        return true
    }

    return true
}

const validateRegionForm = () => {
    const nameValid = validateField('name')
    if (!(regionForm.slug || '').trim()) {
        regionForm.slug = toSlug(regionForm.name || '')
    }
    const slugValid = validateField('slug')
    return nameValid && slugValid
}

const setBackendFieldErrors = (errors = {}) => {
    formErrors.name = errors?.name || ''
    formErrors.slug = errors?.slug || ''
}

const fetchRegions = async () => {
    loading.value = true
    error.value = ''
    try {
        const response = await fetch(`${API_BASE}/regions`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
        regions.value = data.data || []
    } catch (err) {
        error.value = err.message || 'Khong the tai khu vuc'
    } finally {
        loading.value = false
    }
}

const resetForm = () => {
    regionForm.name = ''
    regionForm.slug = ''
    formErrors.name = ''
    formErrors.slug = ''
}

const openCreateModal = () => {
    editingRegion.value = null
    resetForm()
    showRegionModal.value = true
}

const openEditModal = (region) => {
    editingRegion.value = region
    regionForm.name = region.name || ''
    regionForm.slug = region.slug || ''
    showRegionModal.value = true
}

const closeModal = () => {
    showRegionModal.value = false
    editingRegion.value = null
    resetForm()
}

const openDeleteConfirm = (region) => {
    regionToDelete.value = region
    showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
    showDeleteConfirm.value = false
    regionToDelete.value = null
}

const confirmDeleteRegion = async () => {
    if (!regionToDelete.value) return

    deletingId.value = regionToDelete.value.id
    try {
        const response = await fetch(`${API_BASE}/regions/${regionToDelete.value.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) throw new Error(data?.message || `HTTP ${response.status}`)
        showSuccess(data?.message || 'Da xoa khu vuc thanh cong')
        closeDeleteConfirm()
        await fetchRegions()
    } catch (err) {
        showError(err.message || 'Khong the xoa khu vuc')
    } finally {
        deletingId.value = null
    }
}

const saveRegion = async () => {
    if (!validateRegionForm()) {
        showError('Vui long kiem tra lai thong tin khu vuc')
        return
    }

    const name = regionForm.name.trim()
    const slug = (regionForm.slug || '').trim() || toSlug(name)

    saving.value = true
    try {
        setBackendFieldErrors({})
        const isEditing = !!editingRegion.value
        const url = isEditing ? `${API_BASE}/regions/${editingRegion.value.id}` : `${API_BASE}/regions`

        const response = await fetch(url, {
            method: isEditing ? 'PUT' : 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, slug })
        })

        const data = await response.json()
        if (!response.ok) {
            if (data?.errors) setBackendFieldErrors(data.errors)
            throw new Error(data?.message || 'Khong the luu khu vuc')
        }

        showSuccess(data?.message || 'Luu khu vuc thanh cong')
        closeModal()
        await fetchRegions()
    } catch (err) {
        showError(err.message || 'Khong the luu khu vuc')
    } finally {
        saving.value = false
    }
}

const handleDeleteRegion = (region) => {
    openDeleteConfirm(region)
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchRegions()
    }
})
</script>

<style scoped>
.permission-check {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
}

.loading-permission,
.permission-denied {
    text-align: center;
    max-width: 500px;
    padding: 3rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-permission i {
    font-size: 3rem;
    color: #2196f3;
    margin-bottom: 1rem;
}

.permission-denied i {
    font-size: 3rem;
    color: #f44336;
    margin-bottom: 1rem;
}

.permission-denied h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.permission-denied p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.5;
}

.schools-regions-page {
    padding: 0;
    min-height: 100vh;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
    padding: 1.5rem 0;
    border-bottom: 2px solid #eee;
}

.header-content h1 {
    color: #333;
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 2rem;
}

.header-content h1 i {
    color: #1976d2;
}

.header-content p {
    color: #666;
    margin: 0;
    font-size: 1.1rem;
}

.header-actions {
    display: flex;
    gap: 1rem;
}

.table-controls {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
}

.regions-table {
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    overflow: hidden;
}

.table {
    width: 100%;
    margin: 0;
    border-collapse: collapse;
}

.table-container {
    overflow-x: auto;
}

.table th,
.table td {
    padding: 1rem;
    text-align: left;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
}

.table th {
    background: #f8f9fa;
    font-weight: 600;
    white-space: nowrap;
    border-bottom: 2px solid #eee;
}

.table tbody tr:hover {
    background: #f9f9f9;
}

.badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 12px;
}

.badge-success {
    background: #d4edda;
    color: #155724;
}

.badge-secondary {
    background: #e2e3e5;
    color: #383d41;
}

.loading-state,
.error-state,
.empty-state {
    padding: 3rem 2rem;
    text-align: center;
    color: #666;
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2196f3;
}

.error-state i,
.empty-state i {
    font-size: 3rem;
    color: #ccc;
    margin-bottom: 1rem;
}

.empty-state h3 {
    margin-bottom: 0.5rem;
    color: #666;
}

.empty-state p {
    margin: 0;
    color: #999;
}

.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    text-decoration: none;
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

.btn-primary {
    background: #1976d2;
    color: white;
}

.btn-primary:hover:not(:disabled) {
    background: #1565c0;
}

.btn-secondary {
    background: #f5f5f5;
    color: #666;
}

.btn-secondary:hover:not(:disabled) {
    background: #eee;
}

.btn-sm {
    padding: 4px 8px;
    font-size: 12px;
    margin-right: 5px;
}

.btn-outline-primary {
    border: 1px solid #007bff;
    color: #007bff;
    background: transparent;
}

.btn-outline-danger {
    border: 1px solid #dc3545;
    color: #dc3545;
    background: transparent;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 1.5rem;
}

.modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    width: 100%;
    max-width: 520px;
    overflow: hidden;
}

.modal-small {
    max-width: 460px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.25rem 1.5rem;
    border-bottom: 1px solid #eee;
}

.modal-header h3 {
    margin: 0;
    color: #333;
}

.btn-close {
    background: none;
    border: none;
    font-size: 1.2rem;
    color: #666;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
}

.btn-close:hover {
    background: #f0f0f0;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
    padding: 1.25rem 1.5rem;
    border-top: 1px solid #eee;
}

.delete-confirmation {
    text-align: center;
}

.warning-icon {
    font-size: 2.5rem;
    color: #f59e0b;
    margin-bottom: 0.75rem;
}

.warning-text {
    margin-top: 0.5rem;
    color: #dc3545;
    font-weight: 600;
}

.btn-danger {
    background: #dc3545;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #bb2d3b;
}

.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-control {
    width: 100%;
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.form-control.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
}

.field-error {
    margin: 0.4rem 0 0;
    color: #dc3545;
    font-size: 0.85rem;
}

.required {
    color: #dc3545;
}

@media (max-width: 1024px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .schools-regions-page {
        padding: 0;
    }

    .page-header {
        padding: 1rem 0;
    }

    .table-controls {
        padding: 1rem;
    }

    .table th,
    .table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
    }

    .modal-overlay {
        padding: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .search-input {
        font-size: 0.9rem;
        padding: 0.6rem 0.8rem;
    }

    .table {
        font-size: 0.8rem;
    }

    .table th,
    .table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
    }

    .btn-sm {
        padding: 0.35rem 0.45rem;
    }
}
</style>
