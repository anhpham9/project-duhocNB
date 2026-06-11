<template>
    <div class="schools-management-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Dang kiem tra quyen truy cap...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Khong the truy cap Quan ly truong hoc</h3>
                <p>Chi Superadmin, Admin va Manager moi co the quan ly truong hoc.</p>
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
                        <i class="fas fa-school"></i>
                        Quan ly truong hoc
                    </h1>
                    <p>Danh sach va quan ly thong tin cac truong doi tac</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" @click="createSchool">
                        <i class="fas fa-plus"></i>
                        Them truong
                    </button>
                    <button class="btn btn-secondary" @click="fetchSchools" :disabled="loading">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Lam moi
                    </button>
                </div>
            </div>

            <div class="table-section">
                <div class="table-header">
                    <h2>Danh sach truong hoc ({{ filteredSchools.length }})</h2>
                    <div class="table-actions">
                        <button class="btn btn-secondary" @click="fetchSchools" :disabled="loading">
                            <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                            Lam moi
                        </button>
                    </div>
                </div>

                <div class="table-controls">
                    <div class="controls-row">
                        <div class="search-box">
                            <i class="fas fa-search"></i>
                            <input
                                v-model="searchTerm"
                                type="search"
                                class="search-input"
                                placeholder="Tim theo ten truong hoac dia diem..."
                            >
                            <button v-if="searchTerm" @click="searchTerm = ''" class="clear-search">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <div class="filter-group">
                            <label>Loc theo khu vuc:</label>
                            <select v-model="selectedRegion" class="filter-select">
                                <option value="">Tat ca khu vuc</option>
                                <option v-for="region in regions" :key="region.id" :value="region.slug">
                                    {{ region.name }}
                                </option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label>Loc theo loai:</label>
                            <select v-model="selectedType" class="filter-select">
                                <option value="">Tat ca loai truong</option>
                                <option v-for="type in schoolTypes" :key="type.id" :value="type.slug">
                                    {{ type.name }}
                                </option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label>Loc theo trang thai:</label>
                            <select v-model="selectedStatus" class="filter-select">
                                <option value="">Tat ca trang thai</option>
                                <option value="partner">Doi tac</option>
                                <option value="active">Hoat dong</option>
                                <option value="paused">Tam dung</option>
                                <option value="pending">Cho duyet</option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <label>Hien thi:</label>
                            <select :value="perPage" @change="setItemsPerPage(parseInt($event.target.value))" class="filter-select">
                                <option v-for="option in itemsPerPageOptions" :key="option.value" :value="option.value">
                                    {{ option.label }}
                                </option>
                            </select>
                        </div>

                        <div class="filter-group">
                            <button class="btn btn-outline-secondary" @click="clearAllFilters" style="margin-top: 24px;">
                                <i class="fas fa-eraser"></i> Xoa bo loc
                            </button>
                        </div>
                    </div>
                </div>

                <div v-if="loading" class="loading-state">
                    <i class="fas fa-spinner fa-spin"></i>
                    <p>Dang tai du lieu truong hoc...</p>
                </div>

                <div v-else-if="error" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Loi: {{ error }}</p>
                    <button class="btn btn-primary" @click="fetchSchools">Thu lai</button>
                </div>

                <div v-else class="table-container">
                    <table class="schools-table-list">
                        <thead>
                            <tr>
                                <th>Ten truong</th>
                                <th>Khu vuc</th>
                                <th>Loai truong</th>
                                <th>Hoc phi/nam</th>
                                <th>Rating</th>
                                <th>Trang thai</th>
                                <th>Thao tac</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr v-for="school in paginatedSchools" :key="school.id">
                                <td>
                                    <div class="school-title">
                                        <strong>{{ school.name }}</strong>
                                        <p>{{ school.location || '-' }}</p>
                                    </div>
                                </td>
                                <td>{{ school.region_name || '-' }}</td>
                                <td>{{ school.type_name || '-' }}</td>
                                <td>{{ formatCurrency(school.tuition_per_year) }}</td>
                                <td>{{ Number(school.rating || 0).toFixed(1) }}</td>
                                <td>
                                    <span class="badge" :class="getStatusClass(school.status)">
                                        {{ getStatusText(school.status) }}
                                    </span>
                                </td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" @click="editSchool(school.id)">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn btn-sm btn-outline-success" @click="viewSchool(school.id)">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button
                                        class="btn btn-sm btn-outline-danger"
                                        :disabled="deletingId === school.id || !canDelete"
                                        @click="deleteSchool(school.id, school.name)"
                                    >
                                        <i class="fas" :class="deletingId === school.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                                    </button>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <div v-if="filteredSchools.length === 0" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Khong tim thay ket qua</h3>
                        <p v-if="searchTerm || selectedRegion || selectedType || selectedStatus">
                            Khong co truong hoc nao phu hop voi bo loc hien tai.
                        </p>
                        <p v-else>
                            Chua co truong hoc nao trong he thong.
                        </p>
                    </div>

                    <div v-if="totalPages > 1" class="pagination">
                        <div class="pagination-info">
                            Hien thi {{ ((currentPage - 1) * perPage) + 1 }} -
                            {{ Math.min(currentPage * perPage, filteredSchools.length) }}
                            trong tong so {{ filteredSchools.length }} truong hoc
                        </div>
                        <div class="pagination-controls">
                            <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn-page btn-page-first">
                                <i class="fas fa-angle-double-left"></i>
                            </button>
                            <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page btn-page-prev">
                                <i class="fas fa-angle-left"></i>
                            </button>

                            <template v-for="page in visiblePages" :key="page">
                                <button v-if="page === '...'" class="btn-page btn-page-dots" disabled>
                                    ...
                                </button>
                                <button v-else @click="goToPage(page)" :class="['btn-page', { 'btn-page-active': page === currentPage }]">
                                    {{ page }}
                                </button>
                            </template>

                            <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page btn-page-next">
                                <i class="fas fa-angle-right"></i>
                            </button>
                            <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn-page btn-page-last">
                                <i class="fas fa-angle-double-right"></i>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showDeleteConfirm && schoolToDelete" class="modal-overlay">
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
                        <p>Ban co chac chan muon xoa truong <strong>{{ schoolToDelete.name }}</strong>?</p>
                        <p class="warning-text">Thao tac nay khong the hoan tac!</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button @click="closeDeleteConfirm" type="button" class="btn btn-secondary">Huy</button>
                    <button @click="confirmDeleteSchool" type="button" class="btn btn-danger" :disabled="deletingId === schoolToDelete.id">
                        <i v-if="deletingId === schoolToDelete.id" class="fas fa-spinner fa-spin"></i>
                        {{ deletingId === schoolToDelete.id ? 'Dang xoa...' : 'Xoa truong' }}
                    </button>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'
import { usePaginationSettings } from '~/composables/usePaginationSettings'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quan ly truong hoc - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))
const canDelete = computed(() => hasAnyRole([1]))

const searchTerm = ref('')
const selectedRegion = ref('')
const selectedType = ref('')
const selectedStatus = ref('')
const currentPage = ref(1)
const { itemsPerPage: perPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()
const loading = ref(false)
const error = ref('')
const deletingId = ref(null)
const showDeleteConfirm = ref(false)
const schoolToDelete = ref(null)

const schools = ref([])
const regions = ref([])
const schoolTypes = ref([])

const fetchRegions = async () => {
    try {
        const response = await fetch(`${API_BASE}/regions`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (response.ok) regions.value = data.data || []
    } catch {
        regions.value = []
    }
}

const fetchSchoolTypes = async () => {
    try {
        const response = await fetch(`${API_BASE}/school-types`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (response.ok) schoolTypes.value = data.data || []
    } catch {
        schoolTypes.value = []
    }
}

const fetchSchools = async () => {
    loading.value = true
    error.value = ''

    try {
        const response = await fetch(`${API_BASE}/schools`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }
        schools.value = data.data || []
    } catch (err) {
        error.value = err.message || 'Khong the tai du lieu truong hoc'
    } finally {
        loading.value = false
    }
}

const filteredSchools = computed(() => {
    let filtered = schools.value

    if (searchTerm.value) {
        const q = searchTerm.value.toLowerCase()
        filtered = filtered.filter((item) => {
            return (item.name || '').toLowerCase().includes(q) || (item.location || '').toLowerCase().includes(q)
        })
    }

    if (selectedRegion.value) {
        filtered = filtered.filter((item) => item.region_slug === selectedRegion.value)
    }

    if (selectedType.value) {
        filtered = filtered.filter((item) => item.type_slug === selectedType.value)
    }

    if (selectedStatus.value) {
        filtered = filtered.filter((item) => item.status === selectedStatus.value)
    }

    return filtered
})

const totalPages = computed(() => {
    if (perPage.value === -1) return 1
    return Math.max(1, Math.ceil(filteredSchools.value.length / perPage.value))
})

const paginatedSchools = computed(() => {
    if (perPage.value === -1) return filteredSchools.value
    const start = (currentPage.value - 1) * perPage.value
    const end = start + perPage.value
    return filteredSchools.value.slice(start, end)
})

const visiblePages = computed(() => {
    const total = totalPages.value
    const current = currentPage.value
    if (total <= 7) {
        return Array.from({ length: total }, (_, i) => i + 1)
    }
    if (current <= 4) {
        return [1, 2, 3, 4, 5, '...', total]
    }
    if (current >= total - 3) {
        return [1, '...', total - 4, total - 3, total - 2, total - 1, total]
    }
    return [1, '...', current - 1, current, current + 1, '...', total]
})

watch([searchTerm, selectedRegion, selectedType, selectedStatus], () => {
    currentPage.value = 1
})

watch(perPage, () => {
    currentPage.value = 1
})

watch(totalPages, (pages) => {
    if (currentPage.value > pages) currentPage.value = pages
})

const goToPage = (page) => {
    if (typeof page !== 'number') return
    if (page < 1 || page > totalPages.value) return
    currentPage.value = page
}

const clearAllFilters = () => {
    searchTerm.value = ''
    selectedRegion.value = ''
    selectedType.value = ''
    selectedStatus.value = ''
}

const createSchool = () => navigateTo('/admin/schools/create')
const editSchool = (id) => navigateTo(`/admin/schools/edit/${id}`)
const viewSchool = (id) => navigateTo(`/admin/schools/view/${id}`)

const deleteSchool = (id, name) => {
    if (!canDelete.value) {
        showError('Ban khong co quyen xoa truong hoc.')
        return
    }
    schoolToDelete.value = { id, name }
    showDeleteConfirm.value = true
}

const closeDeleteConfirm = () => {
    showDeleteConfirm.value = false
    schoolToDelete.value = null
}

const confirmDeleteSchool = async () => {
    if (!schoolToDelete.value) return

    deletingId.value = schoolToDelete.value.id
    try {
        const response = await fetch(`${API_BASE}/schools/${schoolToDelete.value.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }
        showSuccess(data?.message || 'Da xoa truong hoc thanh cong!')
        closeDeleteConfirm()
        await fetchSchools()
    } catch (err) {
        showError(err.message || 'Khong the xoa truong hoc')
    } finally {
        deletingId.value = null
    }
}

const formatCurrency = (value) => {
    if (value === null || value === undefined || value === '') return '-'
    return Number(value).toLocaleString('vi-VN') + ' VND'
}

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
    return texts[status] || status
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await Promise.all([fetchSchools(), fetchRegions(), fetchSchoolTypes()])
    }
})
</script>

<style scoped>
.schools-management-page { padding: 0; min-height: 100vh; }
.page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 1rem; padding: 1.5rem 0; border-bottom: 2px solid #eee; }
.header-content h1 { color: #333; margin: 0 0 0.5rem 0; display: flex; align-items: center; gap: 12px; font-size: 2rem; }
.header-content h1 i { color: #1976d2; }
.header-content p { color: #666; margin: 0; font-size: 1.1rem; }
.header-actions { display: flex; gap: 1rem; }
.table-section {
    background: white;
    border-radius: 16px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.12);
    overflow: hidden;
    margin-bottom: 2rem;
}

.table-header {
    padding: 1.5rem 2rem;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
}

.table-actions {
    display: flex;
    gap: 0.75rem;
}

.table-controls {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
}

.controls-row {
    display: grid;
    grid-template-columns: 2fr repeat(5, 1fr);
    gap: 1rem;
    align-items: end;
}

.search-box {
    position: relative;
    display: flex;
    align-items: center;
}

.search-box i {
    position: absolute;
    left: 12px;
    color: #999;
    z-index: 2;
}

.search-input {
    width: 100%;
    padding: 0.75rem 2.5rem 0.75rem 2.5rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 0.95rem;
    transition: border-color 0.2s;
}

.search-input:focus {
    outline: none;
    border-color: #1976d2;
}

.clear-search {
    position: absolute;
    right: 8px;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
}

.clear-search:hover {
    background: #f0f0f0;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.4rem;
}

.filter-group label {
    font-size: 0.85rem;
    color: #666;
    font-weight: 600;
}

.filter-select {
    padding: 0.6rem 0.75rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 0.9rem;
    background: white;
}

.filter-select:focus {
    outline: none;
    border-color: #1976d2;
}

.table-container { overflow-x: auto; }
.schools-table-list { width: 100%; border-collapse: collapse; }
.schools-table-list th,
.schools-table-list td { padding: 1rem 0.75rem; text-align: left; border-bottom: 1px solid #f0f0f0; vertical-align: middle; }
.schools-table-list th { background: #f8f9fa; font-weight: 600; color: #333; position: sticky; top: 0; z-index: 10; }
.schools-table-list tr:hover { background: #f8f9fa; }
.school-title strong { display: block; margin-bottom: 0.25rem; }
.school-title p { margin: 0; color: #666; font-size: 0.875rem; }
.badge { padding: 4px 8px; border-radius: 12px; font-size: 12px; }
.badge-primary { background: #dbeafe; color: #1d4ed8; }
.badge-success { background: #d4edda; color: #155724; }
.badge-warning { background: #fff3cd; color: #856404; }
.badge-secondary { background: #e2e3e5; color: #383d41; }
.loading-state, .error-state, .empty-state { padding: 3rem 2rem; text-align: center; color: #666; }
.loading-state i { font-size: 2rem; margin-bottom: 1rem; color: #2196f3; }
.error-state i, .empty-state i { font-size: 3rem; margin-bottom: 1rem; color: #ccc; }
.btn { padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; text-decoration: none; display: inline-flex; align-items: center; gap: 0.5rem; transition: all 0.2s ease; font-size: 0.9rem; }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }
.btn-sm { padding: 4px 8px; font-size: 12px; margin-right: 5px; }
.btn-primary { background: #1976d2; color: white; }
.btn-primary:hover:not(:disabled) { background: #1565c0; }
.btn-secondary { background: #f5f5f5; color: #666; }
.btn-secondary:hover:not(:disabled) { background: #eee; }
.btn-danger { background: #dc3545; color: white; }
.btn-danger:hover:not(:disabled) { background: #bb2d3b; }
.btn-outline-primary { border: 1px solid #007bff; color: #007bff; background: transparent; }
.btn-outline-success { border: 1px solid #28a745; color: #28a745; background: transparent; }
.btn-outline-danger { border: 1px solid #dc3545; color: #dc3545; background: transparent; }
.btn-outline-secondary { border: 1px solid #6c757d; color: #6c757d; background: transparent; }
.form-control { padding: 0.75rem; border: 2px solid #ddd; border-radius: 8px; font-size: 0.95rem; }
.form-control:focus { outline: none; border-color: #1976d2; }
.pagination { display: flex; justify-content: space-between; align-items: center; padding: 1.5rem 2rem; background: #f8f9fa; border-top: 1px solid #eee; }

.pagination-info { color: #666; font-size: 0.9rem; }

.pagination-controls { display: flex; gap: 0.25rem; }

.btn-page {
    min-width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
    transition: all 0.2s ease;
}

.btn-page:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #1976d2;
}

.btn-page-active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}
.modal-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 1.5rem; }
.modal { background: white; border-radius: 12px; box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3); width: 100%; max-width: 520px; overflow: hidden; }
.modal-small { max-width: 460px; }
.modal-header { display: flex; justify-content: space-between; align-items: center; padding: 1.25rem 1.5rem; border-bottom: 1px solid #eee; }
.modal-header h3 { margin: 0; color: #333; }
.btn-close { background: none; border: none; font-size: 1.2rem; color: #666; cursor: pointer; padding: 0.25rem; border-radius: 4px; }
.btn-close:hover { background: #f0f0f0; }
.modal-body { padding: 1.5rem; }
.modal-footer { display: flex; justify-content: flex-end; gap: 0.75rem; padding: 1.25rem 1.5rem; border-top: 1px solid #eee; }
.delete-confirmation { text-align: center; }
.warning-icon { font-size: 2.5rem; color: #f59e0b; margin-bottom: 0.75rem; }
.warning-text { margin-top: 0.5rem; color: #dc3545; font-weight: 600; }
.permission-check { display: flex; align-items: center; justify-content: center; min-height: 60vh; padding: 2rem; }
.loading-permission, .permission-denied { text-align: center; max-width: 500px; padding: 3rem 2rem; background: white; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1); }
.loading-permission i { font-size: 3rem; color: #2196f3; margin-bottom: 1rem; }
.permission-denied i { font-size: 3rem; color: #f44336; margin-bottom: 1rem; }
@media (max-width: 1024px) { .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; } }
@media (max-width: 768px) {
    .schools-management-page { padding: 0; }
    .page-header { padding: 1rem 0; }
    .table-header { flex-direction: column; gap: 1rem; align-items: flex-start; padding: 1rem; }
    .table-controls { padding: 1rem; }
    .controls-row { grid-template-columns: 1fr; }
    .schools-table-list th, .schools-table-list td { padding: 0.75rem 0.5rem; font-size: 0.9rem; }
    .pagination { flex-direction: column; gap: 1rem; padding: 1rem; }
}
@media (max-width: 480px) {
    .header-content h1 { font-size: 1.5rem; }
    .table { font-size: 0.8rem; }
    .btn-sm { padding: 0.35rem 0.45rem; }
    .modal-overlay { padding: 1rem; }
    .modal-header, .modal-body, .modal-footer { padding: 1rem; }
}
</style>