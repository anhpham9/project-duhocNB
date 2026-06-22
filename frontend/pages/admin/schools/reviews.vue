<template>
    <div class="school-reviews-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý đánh giá trường</h3>
                <p>Chỉ Superadmin, Admin và Manager mới có thể quản lý school reviews.</p>
                <NuxtLink to="/admin" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lại Dashboard
                </NuxtLink>
            </div>
        </div>

        <div v-else>
            <div class="page-header">
                <div class="header-content">
                    <h1>
                        <i class="fas fa-star"></i>
                        Quản lý school reviews
                    </h1>
                    <p>CRUD đánh giá trường học do admin quản lý (không phải người dùng tạo)</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-primary" @click="openCreateModal">
                        <i class="fas fa-plus"></i>
                        Thêm review
                    </button>
                    <button class="btn btn-secondary" @click="fetchData" :disabled="loading">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                        Làm mới
                    </button>
                </div>
            </div>

            <div class="table-controls">
                <div class="controls-row">
                    <div class="search-box">
                        <i class="fas fa-search"></i>
                        <input
                            v-model.trim="searchTerm"
                            type="search"
                            class="search-input"
                            placeholder="Tìm theo tên học viên, tên trường, quốc tịch, nội dung..."
                        >
                    </div>

                    <div class="filter-group">
                        <label>Trường:</label>
                        <select v-model="selectedSchoolId" class="filter-select">
                            <option value="">Tất cả trường</option>
                            <option v-for="school in schools" :key="school.id" :value="String(school.id)">
                                {{ school.name }}
                            </option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Rating:</label>
                        <select v-model="selectedRating" class="filter-select">
                            <option value="">Tất cả rating</option>
                            <option v-for="n in 5" :key="n" :value="String(n)">{{ n }} sao</option>
                        </select>
                    </div>

                    <div class="filter-group">
                        <label>Hiển thị:</label>
                        <select :value="perPage" @change="setItemsPerPage(parseInt($event.target.value))" class="filter-select">
                            <option v-for="option in itemsPerPageOptions" :key="option.value" :value="option.value">
                                {{ option.label }}
                            </option>
                        </select>
                    </div>

                    <div class="filter-group actions-group">
                        <button class="btn btn-outline-secondary" @click="clearFilters">
                            <i class="fas fa-eraser"></i>
                            Xóa lọc
                        </button>
                    </div>
                </div>
            </div>

            <div v-if="loading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải school reviews...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: {{ error }}</p>
                <button class="btn btn-primary" @click="fetchData">Thử lại</button>
            </div>

            <div v-else class="table-container">
                <table class="reviews-table">
                    <thead>
                        <tr>
                            <th>ID</th>
                            <th>Học viên</th>
                            <th>Trường</th>
                            <th>Rating</th>
                            <th>Quốc tịch</th>
                            <th>Khóa học</th>
                            <th>Nội dung</th>
                            <th>Tạo lúc</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="review in paginatedReviews" :key="review.id">
                            <td>{{ review.id }}</td>
                            <td>
                                <div class="student-cell">
                                    <img
                                        v-if="review.avatar_url"
                                        :src="review.avatar_url"
                                        alt="avatar"
                                        class="avatar"
                                    >
                                    <div>
                                        <strong>{{ review.student_name || '-' }}</strong>
                                    </div>
                                </div>
                            </td>
                            <td>{{ review.school_name || '-' }}</td>
                            <td>
                                <span class="rating-badge">{{ review.rating || 0 }}/5</span>
                            </td>
                            <td>{{ review.nationality || '-' }}</td>
                            <td>{{ review.course_period || '-' }}</td>
                            <td>
                                <p class="content-preview">{{ review.content || '-' }}</p>
                            </td>
                            <td>{{ formatDateTime(review.created_at) }}</td>
                            <td>
                                <button class="btn btn-sm btn-outline-primary" @click="openEditModal(review)">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button
                                    class="btn btn-sm btn-outline-danger"
                                    :disabled="deletingId === review.id || !canDelete"
                                    @click="openDeleteConfirm(review)"
                                >
                                    <i class="fas" :class="deletingId === review.id ? 'fa-spinner fa-spin' : 'fa-trash'"></i>
                                </button>
                            </td>
                        </tr>
                    </tbody>
                </table>

                <div v-if="filteredReviews.length === 0" class="empty-state">
                    <i class="fas fa-star-half-alt"></i>
                    <h3>Không tìm thấy review phù hợp</h3>
                    <p>Thử điều chỉnh bộ lọc hoặc tạo review mới.</p>
                </div>

                <div v-if="totalPages > 1" class="pagination">
                    <div class="pagination-info">
                        Hiển thị {{ ((currentPage - 1) * perPage) + 1 }} - {{ Math.min(currentPage * perPage, filteredReviews.length) }}
                        trong tổng số {{ filteredReviews.length }} review
                    </div>
                    <div class="pagination-controls">
                        <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn-page">
                            <i class="fas fa-angle-double-left"></i>
                        </button>
                        <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1" class="btn-page">
                            <i class="fas fa-angle-left"></i>
                        </button>

                        <template v-for="page in visiblePages" :key="`page-${page}`">
                            <button v-if="page === '...'" disabled class="btn-page btn-page-dots">...</button>
                            <button
                                v-else
                                class="btn-page"
                                :class="{ 'btn-page-active': page === currentPage }"
                                @click="goToPage(page)"
                            >
                                {{ page }}
                            </button>
                        </template>

                        <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages" class="btn-page">
                            <i class="fas fa-angle-right"></i>
                        </button>
                        <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages" class="btn-page">
                            <i class="fas fa-angle-double-right"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div v-if="showModal" class="modal-overlay">
            <div class="modal" @click.stop>
                <div class="modal-header">
                    <h3>{{ editingReview ? 'Sửa school review' : 'Thêm school review' }}</h3>
                    <button @click="closeModal" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Trường <span class="required">*</span></label>
                            <select v-model="reviewForm.school_id" class="form-control" :class="{ 'is-invalid': !!formErrors.school_id }">
                                <option value="">Chọn trường</option>
                                <option v-for="school in schools" :key="`modal-school-${school.id}`" :value="String(school.id)">
                                    {{ school.name }}
                                </option>
                            </select>
                            <p v-if="formErrors.school_id" class="field-error">{{ formErrors.school_id }}</p>
                        </div>

                        <div class="form-group">
                            <label>Học viên <span class="required">*</span></label>
                            <input v-model.trim="reviewForm.student_name" type="text" class="form-control" :class="{ 'is-invalid': !!formErrors.student_name }" placeholder="Nhập tên học viên">
                            <p v-if="formErrors.student_name" class="field-error">{{ formErrors.student_name }}</p>
                        </div>

                        <div class="form-group">
                            <label>Rating <span class="required">*</span></label>
                            <select v-model="reviewForm.rating" class="form-control" :class="{ 'is-invalid': !!formErrors.rating }">
                                <option value="">Chon rating</option>
                                <option v-for="n in 5" :key="`rating-${n}`" :value="String(n)">{{ n }} sao</option>
                            </select>
                            <p v-if="formErrors.rating" class="field-error">{{ formErrors.rating }}</p>
                        </div>

                        <div class="form-group">
                            <label>Quốc tịch</label>
                            <input v-model.trim="reviewForm.nationality" type="text" class="form-control" placeholder="VD: Việt Nam">
                        </div>

                        <div class="form-group">
                            <label>Khóa học</label>
                            <input v-model.trim="reviewForm.course_period" type="text" class="form-control" placeholder="VD: 04/2026 - 03/2028">
                        </div>

                        <div class="form-group">
                            <label>Avatar URL</label>
                            <div class="input-mode-switch" role="group" aria-label="Avatar input mode">
                                <button
                                    type="button"
                                    class="mode-btn"
                                    :class="{ active: avatarInputMode === 'url' }"
                                    @click="setAvatarInputMode('url')"
                                >
                                    Nhập link ảnh
                                </button>
                                <button
                                    type="button"
                                    class="mode-btn"
                                    :class="{ active: avatarInputMode === 'upload' }"
                                    @click="setAvatarInputMode('upload')"
                                >
                                    Upload lên Cloudinary
                                </button>
                            </div>

                            <div class="avatar-action-row">
                                <button
                                    type="button"
                                    class="btn btn-outline-danger btn-clear-avatar"
                                    :disabled="saving || avatarUploading || !hasAvatarValue"
                                    @click="clearAvatarInForm"
                                >
                                    <i class="fas fa-trash-alt"></i>
                                    Xóa avatar
                                </button>
                            </div>

                            <input
                                v-if="avatarInputMode === 'url'"
                                v-model.trim="reviewForm.avatar_url"
                                type="url"
                                class="form-control"
                                placeholder="https://..."
                            >

                            <div v-else class="upload-inline-actions">
                                <input
                                    ref="avatarFileInput"
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp,image/gif"
                                    class="hidden-file-input"
                                    @change="onAvatarFileChange"
                                >
                                <button
                                    class="btn btn-secondary btn-upload-inline"
                                    type="button"
                                    :disabled="avatarUploading || saving"
                                    @click="triggerAvatarPicker"
                                >
                                    <i class="fas" :class="avatarUploading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'"></i>
                                    {{ avatarUploading ? 'Đang upload avatar...' : 'Upload avatar' }}
                                </button>
                                <span v-if="pendingAvatarFile" class="upload-inline-selected">
                                    Đã chọn: {{ pendingAvatarFile.name }}
                                </span>
                                <div v-if="avatarUploading" class="upload-progress-wrap" role="status" aria-live="polite">
                                    <div class="upload-progress-bar">
                                        <span class="upload-progress-fill" :style="{ width: `${avatarUploadProgress}%` }"></span>
                                    </div>
                                    <span class="upload-progress-text">Đang upload: {{ avatarUploadProgress }}%</span>
                                </div>
                                <span class="upload-inline-hint">PNG/JPG/WEBP/GIF, tối đa 1MB. Ảnh chỉ upload khi bấm Lưu.</span>
                            </div>
                        </div>
                    </div>

                    <div class="form-group full-width-preview">
                        <div class="image-preview-card">
                            <p class="image-preview-title">Xem trước avatar</p>
                            <div class="image-preview-surface avatar-preview-surface">
                                <img v-if="avatarPreviewSrc" :src="avatarPreviewSrc" alt="Avatar preview" class="image-preview avatar-image-preview">
                                <p v-else class="image-preview-empty">Chưa có ảnh avatar để xem trước</p>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label>Nội dung review</label>
                        <textarea v-model.trim="reviewForm.content" rows="4" class="form-control" placeholder="Nhập nội dung đánh giá..."></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn btn-secondary" @click="closeModal">Hủy</button>
                    <button class="btn btn-primary" :disabled="saving" @click="saveReview">
                        <i v-if="saving" class="fas fa-spinner fa-spin"></i>
                        {{ editingReview ? 'Cập nhật' : 'Tạo mới' }}
                    </button>
                </div>
            </div>
        </div>

        <div v-if="showDeleteModal && reviewToDelete" class="modal-overlay">
            <div class="modal modal-small" @click.stop>
                <div class="modal-header">
                    <h3>Xác nhận xóa</h3>
                    <button @click="closeDeleteConfirm" class="btn-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="delete-confirmation">
                        <i class="fas fa-exclamation-triangle warning-icon"></i>
                        <p>Bạn có chắc chắn muốn xóa review của <strong>{{ reviewToDelete.student_name }}</strong>?</p>
                        <p class="warning-text">Thao tác này không thể hoàn tác.</p>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" @click="closeDeleteConfirm">Hủy</button>
                    <button type="button" class="btn btn-danger" :disabled="deletingId === reviewToDelete.id" @click="confirmDeleteReview">
                        <i v-if="deletingId === reviewToDelete.id" class="fas fa-spinner fa-spin"></i>
                        {{ deletingId === reviewToDelete.id ? 'Đang xóa...' : 'Xóa review' }}
                    </button>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'
import { useVisiblePages } from '~/composables/usePaginationHelper'
import { usePaginationSettings } from '~/composables/usePaginationSettings'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Quản lý school reviews - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2, 3]))
const canDelete = computed(() => hasAnyRole([1, 2, 3]))

const loading = ref(false)
const saving = ref(false)
const error = ref('')
const deletingId = ref(null)

const reviews = ref([])
const schools = ref([])

const searchTerm = ref('')
const selectedSchoolId = ref('')
const selectedRating = ref('')
const currentPage = ref(1)

const { itemsPerPage: perPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()

const showModal = ref(false)
const editingReview = ref(null)
const avatarInputMode = ref('url')
const avatarUploading = ref(false)
const avatarUploadProgress = ref(0)
const pendingAvatarFile = ref(null)
const avatarPreviewTempUrl = ref('')
const avatarFileInput = ref(null)

const showDeleteModal = ref(false)
const reviewToDelete = ref(null)

const reviewForm = reactive({
    school_id: '',
    student_name: '',
    avatar_url: '',
    nationality: '',
    course_period: '',
    rating: '',
    content: ''
})

const formErrors = reactive({
    school_id: '',
    student_name: '',
    rating: ''
})

const clearFormErrors = () => {
    formErrors.school_id = ''
    formErrors.student_name = ''
    formErrors.rating = ''
}

const resetPreviewObjectUrl = (previewRef) => {
    if (previewRef.value) {
        URL.revokeObjectURL(previewRef.value)
        previewRef.value = ''
    }
}

const clearPendingAvatarSelection = () => {
    pendingAvatarFile.value = null
    avatarUploadProgress.value = 0
    resetPreviewObjectUrl(avatarPreviewTempUrl)
}

const avatarPreviewSrc = computed(() => {
    if (avatarPreviewTempUrl.value) return avatarPreviewTempUrl.value
    return String(reviewForm.avatar_url || '').trim()
})

const hasAvatarValue = computed(() => {
    return !!pendingAvatarFile.value || !!String(reviewForm.avatar_url || '').trim()
})

const resetForm = () => {
    reviewForm.school_id = ''
    reviewForm.student_name = ''
    reviewForm.avatar_url = ''
    reviewForm.nationality = ''
    reviewForm.course_period = ''
    reviewForm.rating = ''
    reviewForm.content = ''
    avatarInputMode.value = 'url'
    clearPendingAvatarSelection()
    clearFormErrors()
}

const setAvatarInputMode = (mode) => {
    if (!['url', 'upload'].includes(mode)) return
    avatarInputMode.value = mode

    if (mode === 'url') {
        clearPendingAvatarSelection()
    }
}

const triggerAvatarPicker = () => {
    avatarFileInput.value?.click()
}

const clearAvatarInForm = () => {
    reviewForm.avatar_url = ''
    clearPendingAvatarSelection()
    showInfo('Đã xóa avatar khỏi biểu mẫu. Ảnh sẽ được cập nhật khi bạn bấm Lưu.')
}

const uploadReviewAvatarFile = async (file, onProgress) => {
    const fileType = String(file?.type || '').toLowerCase()
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

    if (!allowedTypes.includes(fileType)) {
        throw new Error('Định dạng file avatar không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
    }

    if (file.size > 1 * 1024 * 1024) {
        throw new Error('File avatar vượt quá 1MB')
    }

    const formData = new FormData()
    formData.append('image', file)
    formData.append('type', 'avatar')

    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', `${API_BASE}/school-reviews/upload-avatar`, true)
        xhr.withCredentials = true

        xhr.upload.onprogress = (event) => {
            if (!event.lengthComputable) return
            const percent = Math.max(0, Math.min(100, Math.round((event.loaded / event.total) * 100)))
            if (typeof onProgress === 'function') {
                onProgress(percent)
            }
        }

        xhr.onerror = () => {
            reject(new Error('Upload avatar thất bại do lỗi mạng'))
        }

        xhr.onabort = () => {
            reject(new Error('Upload avatar đã bị hủy'))
        }

        xhr.onload = () => {
            let data = null
            try {
                data = xhr.responseText ? JSON.parse(xhr.responseText) : null
            } catch {
                reject(new Error('Phản hồi upload avatar không hợp lệ'))
                return
            }

            if (xhr.status < 200 || xhr.status >= 300) {
                reject(new Error(data?.message || 'Upload avatar thất bại'))
                return
            }

            const uploadedUrl = String(data?.data?.url || '').trim()
            if (!uploadedUrl) {
                reject(new Error('Không nhận được URL avatar từ server'))
                return
            }

            resolve({
                uploadedUrl,
                uploadedPublicId: String(data?.data?.publicId || '').trim()
            })
        }

        xhr.send(formData)
    })
}

const rollbackUploadedReviewImages = async (publicIds = []) => {
    const validPublicIds = publicIds.filter(Boolean)
    await Promise.all(validPublicIds.map((publicId) => fetch(`${API_BASE}/school-reviews/upload-avatar`, {
        method: 'DELETE',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId })
    }).catch(() => null)))
}

const onAvatarFileChange = async (event) => {
    const file = event?.target?.files?.[0]
    event.target.value = ''

    if (!file) return

    const fileType = String(file?.type || '').toLowerCase()
    const allowedTypes = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

    if (!allowedTypes.includes(fileType)) {
        showError('Định dạng file avatar không hợp lệ (chỉ nhận PNG/JPG/WEBP/GIF)')
        return
    }

    if (file.size > 1 * 1024 * 1024) {
        showError('File avatar vượt quá 1MB')
        return
    }

    resetPreviewObjectUrl(avatarPreviewTempUrl)
    avatarPreviewTempUrl.value = URL.createObjectURL(file)
    pendingAvatarFile.value = file
    showInfo('Avatar đã được chọn. Ảnh sẽ chỉ upload khi bạn bấm Lưu.')
}

const formatDateTime = (value) => {
    if (!value) return '-'
    const date = new Date(value)
    if (Number.isNaN(date.getTime())) return '-'
    return date.toLocaleString('vi-VN')
}

const validateForm = () => {
    clearFormErrors()
    let valid = true

    if (!reviewForm.school_id) {
        formErrors.school_id = 'Vui lòng chọn trường'
        valid = false
    }

    if (!reviewForm.student_name || reviewForm.student_name.trim().length < 2) {
        formErrors.student_name = 'Tên học viên tối thiểu 2 ký tự'
        valid = false
    }

    const rating = Number(reviewForm.rating)
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
        formErrors.rating = 'Rating phải trong khoảng 1-5'
        valid = false
    }

    return valid
}

const filteredReviews = computed(() => {
    const q = searchTerm.value.toLowerCase()

    return reviews.value.filter((item) => {
        const passSchool = !selectedSchoolId.value || String(item.school_id) === selectedSchoolId.value
        const passRating = !selectedRating.value || String(item.rating) === selectedRating.value

        const passSearch = !q
            || String(item.student_name || '').toLowerCase().includes(q)
            || String(item.school_name || '').toLowerCase().includes(q)
            || String(item.nationality || '').toLowerCase().includes(q)
            || String(item.content || '').toLowerCase().includes(q)

        return passSchool && passRating && passSearch
    })
})

const totalPages = computed(() => {
    return Math.max(1, Math.ceil(filteredReviews.value.length / perPage.value))
})

const visiblePages = useVisiblePages(totalPages, currentPage)

const paginatedReviews = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    return filteredReviews.value.slice(start, start + perPage.value)
})

const goToPage = (page) => {
    const target = Number(page)
    if (!Number.isFinite(target)) return
    if (target < 1 || target > totalPages.value) return
    currentPage.value = target
}

const clearFilters = () => {
    searchTerm.value = ''
    selectedSchoolId.value = ''
    selectedRating.value = ''
    currentPage.value = 1
}

const fetchReviews = async () => {
    const response = await fetch(`${API_BASE}/school-reviews`, {
        method: 'GET',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
    })

    const data = await response.json()
    if (!response.ok) {
        throw new Error(data?.message || `HTTP ${response.status}`)
    }

    reviews.value = data.data || []
}

const fetchSchools = async () => {
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
}

const fetchData = async () => {
    loading.value = true
    error.value = ''

    try {
        await Promise.all([fetchReviews(), fetchSchools()])
    } catch (err) {
        error.value = err.message || 'Không thể tải dữ liệu school reviews'
    } finally {
        loading.value = false
    }
}

const openCreateModal = () => {
    editingReview.value = null
    resetForm()
    showModal.value = true
}

const openEditModal = (review) => {
    editingReview.value = review
    reviewForm.school_id = String(review.school_id || '')
    reviewForm.student_name = review.student_name || ''
    reviewForm.avatar_url = review.avatar_url || ''
    reviewForm.nationality = review.nationality || ''
    reviewForm.course_period = review.course_period || ''
    reviewForm.rating = String(review.rating || '')
    reviewForm.content = review.content || ''
    avatarInputMode.value = review.avatar_url ? 'url' : 'upload'
    clearPendingAvatarSelection()
    clearFormErrors()
    showModal.value = true
}

const closeModal = () => {
    showModal.value = false
    editingReview.value = null
    resetForm()
}

const saveReview = async () => {
    if (!validateForm()) {
        showError('Vui lòng kiểm tra lại dữ liệu school review')
        return
    }

    const uploadedPublicIds = []

    saving.value = true
    try {
        const payload = {
            school_id: Number(reviewForm.school_id),
            student_name: reviewForm.student_name.trim(),
            avatar_url: reviewForm.avatar_url?.trim() || '',
            nationality: reviewForm.nationality?.trim() || '',
            course_period: reviewForm.course_period?.trim() || '',
            rating: Number(reviewForm.rating),
            content: reviewForm.content?.trim() || ''
        }

        if (avatarInputMode.value === 'upload') {
            payload.avatar_url = pendingAvatarFile.value
                ? payload.avatar_url
                : String(reviewForm.avatar_url || '').trim()
        }

        if (pendingAvatarFile.value) {
            avatarUploading.value = true
            avatarUploadProgress.value = 0
            const { uploadedUrl, uploadedPublicId } = await uploadReviewAvatarFile(pendingAvatarFile.value, (percent) => {
                avatarUploadProgress.value = percent
            })
            payload.avatar_url = uploadedUrl
            payload.avatarAssetPublicId = uploadedPublicId || ''
            if (uploadedPublicId) uploadedPublicIds.push(uploadedPublicId)
            avatarUploadProgress.value = 100
        }

        const isEditing = !!editingReview.value
        const targetUrl = isEditing
            ? `${API_BASE}/school-reviews/${editingReview.value.id}`
            : `${API_BASE}/school-reviews`

        const response = await fetch(targetUrl, {
            method: isEditing ? 'PUT' : 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || 'Không thể lưu school review')
        }

        showSuccess(data?.message || 'Lưu school review thành công')
        closeModal()
        await fetchReviews()
    } catch (err) {
        await rollbackUploadedReviewImages(uploadedPublicIds)
        showError(err.message || 'Không thể lưu school review')
    } finally {
        avatarUploading.value = false
        avatarUploadProgress.value = 0
        saving.value = false
    }
}

const openDeleteConfirm = (review) => {
    reviewToDelete.value = review
    showDeleteModal.value = true
}

const closeDeleteConfirm = () => {
    reviewToDelete.value = null
    showDeleteModal.value = false
}

const confirmDeleteReview = async () => {
    if (!reviewToDelete.value) return

    deletingId.value = reviewToDelete.value.id
    try {
        const response = await fetch(`${API_BASE}/school-reviews/${reviewToDelete.value.id}`, {
            method: 'DELETE',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })

        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || 'Không thể xóa school review')
        }

        showSuccess(data?.message || 'Đã xóa school review thành công')
        closeDeleteConfirm()
        await fetchReviews()
    } catch (err) {
        showError(err.message || 'Không thể xóa school review')
    } finally {
        deletingId.value = null
    }
}

watch([searchTerm, selectedSchoolId, selectedRating, perPage], () => {
    currentPage.value = 1
})

watch(totalPages, (newTotal) => {
    if (currentPage.value > newTotal) {
        currentPage.value = newTotal
    }
})

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchData()
    }
})

onBeforeUnmount(() => {
    clearPendingAvatarSelection()
})
</script>

<style scoped>
.permission-check {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
}

.loading-permission,
.permission-denied {
    text-align: center;
    background: white;
    padding: 40px;
    border-radius: 12px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.permission-denied i,
.loading-permission i {
    font-size: 2.2rem;
    color: #d32f2f;
    margin-bottom: 12px;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 20px;
}

.header-content h1 {
    margin: 0;
    font-size: 1.6rem;
    color: #333;
}

.header-content p {
    margin-top: 8px;
    color: #666;
}

.header-actions {
    display: flex;
    gap: 10px;
}

.table-controls {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    padding: 14px;
    margin-bottom: 16px;
}

.controls-row {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    align-items: end;
}

.search-box {
    position: relative;
    min-width: 320px;
    flex: 1;
}

.search-box i {
    position: absolute;
    top: 50%;
    left: 12px;
    transform: translateY(-50%);
    color: #999;
}

.search-input {
    width: 100%;
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0 12px 0 34px;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.filter-group label {
    font-size: 0.85rem;
    color: #666;
}

.filter-select {
    min-width: 170px;
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0 10px;
}

.actions-group {
    justify-content: flex-end;
}

.loading-state,
.error-state,
.empty-state {
    text-align: center;
    padding: 36px;
    background: #fff;
    border: 1px dashed #ddd;
    border-radius: 12px;
}

.loading-state i,
.error-state i,
.empty-state i {
    font-size: 2rem;
    color: #d32f2f;
    margin-bottom: 10px;
}

.table-container {
    background: #fff;
    border: 1px solid #eee;
    border-radius: 12px;
    overflow-x: auto;
}

.reviews-table {
    width: 100%;
    border-collapse: collapse;
}

.reviews-table th,
.reviews-table td {
    border-bottom: 1px solid #f2f2f2;
    padding: 12px;
    text-align: left;
    vertical-align: top;
    font-size: 0.92rem;
}

.reviews-table th {
    background: #fafafa;
    font-weight: 600;
    color: #444;
    white-space: nowrap;
}

.student-cell {
    display: flex;
    align-items: center;
    gap: 10px;
}

.avatar {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    object-fit: cover;
}

.rating-badge {
    display: inline-block;
    border-radius: 12px;
    background: #fff8e1;
    color: #ad7b00;
    border: 1px solid #f2d38d;
    padding: 3px 8px;
    font-weight: 600;
}

.content-preview {
    max-width: 320px;
    margin: 0;
    color: #555;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 10px;
    padding: 14px;
}

.pagination-info {
    color: #666;
    font-size: 0.9rem;
}

.pagination-controls {
    display: flex;
    gap: 6px;
    align-items: center;
}

.btn-page {
    min-width: 34px;
    height: 34px;
    border: 1px solid #ddd;
    background: #fff;
    color: #444;
    border-radius: 6px;
    cursor: pointer;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-page-active {
    background: #d32f2f;
    border-color: #d32f2f;
    color: #fff;
}

.modal-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.45);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 16px;
}

.modal {
    width: min(760px, 100%);
    background: #fff;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
}

.modal-small {
    width: min(500px, 100%);
}

.modal-header,
.modal-footer {
    padding: 14px 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-footer {
    border-bottom: 0;
    border-top: 1px solid #eee;
    justify-content: flex-end;
    gap: 10px;
}

.modal-body {
    padding: 16px;
}

.btn-close {
    background: transparent;
    border: 0;
    font-size: 1rem;
    color: #666;
    cursor: pointer;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 6px;
    margin-bottom: 10px;
}

.input-mode-switch {
    display: inline-flex;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    overflow: hidden;
    margin-bottom: 8px;
}

.mode-btn {
    border: 0;
    background: #f5f5f5;
    color: #666;
    padding: 8px 12px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
}

.mode-btn.active {
    background: #d32f2f;
    color: #fff;
}

.hidden-file-input {
    display: none;
}

.upload-inline-actions {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.avatar-action-row {
    margin-bottom: 10px;
}

.btn-clear-avatar {
    width: fit-content;
}

.upload-inline-selected {
    font-size: 0.82rem;
    color: #555;
}

.upload-progress-wrap {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.upload-progress-bar {
    width: 100%;
    height: 8px;
    border-radius: 999px;
    overflow: hidden;
    background: #f0f0f0;
}

.upload-progress-fill {
    display: block;
    height: 100%;
    background: linear-gradient(90deg, #d32f2f 0%, #ef5350 100%);
    width: 0;
    transition: width 0.18s ease;
}

.upload-progress-text {
    font-size: 0.8rem;
    color: #666;
}

.upload-inline-hint {
    font-size: 0.8rem;
    color: #888;
}

.image-preview-card {
    border: 1px solid #ececec;
    border-radius: 10px;
    padding: 12px;
    background: #fafafa;
}

.image-preview-title {
    font-size: 0.85rem;
    color: #666;
    margin: 0 0 8px;
    font-weight: 600;
}

.image-preview-surface {
    min-height: 110px;
    border: 1px dashed #d9d9d9;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #fff;
    overflow: hidden;
}

.avatar-preview-surface {
    min-height: 120px;
}

.image-preview {
    max-width: 100%;
    max-height: 120px;
    object-fit: contain;
}

.avatar-image-preview {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    object-fit: cover;
}

.image-preview-empty {
    margin: 0;
    color: #999;
    font-size: 0.85rem;
    text-align: center;
    padding: 0 12px;
}

.full-width-preview {
    margin-top: -2px;
}

.form-control {
    height: 40px;
    border: 1px solid #ddd;
    border-radius: 8px;
    padding: 0 10px;
}

textarea.form-control {
    height: auto;
    padding: 10px;
}

.required {
    color: #d32f2f;
}

.field-error {
    color: #d32f2f;
    font-size: 0.82rem;
    margin: 0;
}

.is-invalid {
    border-color: #d32f2f;
}

.delete-confirmation {
    text-align: center;
}

.warning-icon {
    color: #d32f2f;
    font-size: 2rem;
    margin-bottom: 8px;
}

.warning-text {
    color: #a33;
}

@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
    }

    .header-actions {
        width: 100%;
    }

    .header-actions .btn {
        flex: 1;
    }

    .search-box {
        min-width: 100%;
    }

    .form-grid {
        grid-template-columns: 1fr;
    }

    .pagination {
        flex-direction: column;
        align-items: flex-start;
    }
}
</style>
