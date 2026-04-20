<template>
    <PermissionGuard :allowed-roles="ADMIN_PERMISSIONS.MANAGEMENT_LEVEL" :show-user-info="false"
        denied-title="Không thể truy cập Quản lý Người dùng"
        denied-message="Chỉ Superadmin, Admin và Manager mới có thể quản lý người dùng.">
        <template #default="{ user }">
            <div class="users-page">
                <!-- Page Header -->
                <div class="page-header">
                    <div class="header-content">
                        <h1>
                            <i class="fas fa-users"></i>
                            Quản lý Người dùng
                        </h1>
                        <p>Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
                    </div>
                    <div class="header-actions">
                        <button @click="openCreateForm" class="btn btn-primary">
                            <i class="fas fa-plus"></i>
                            Thêm người dùng
                        </button>
                    </div>
                </div>

                <!-- Stats Cards -->
                <div class="stats-section">
                    <div class="stats-grid">
                        <div class="stat-card total">
                            <i class="fas fa-users"></i>
                            <div class="stat-info">
                                <h3>Tổng số</h3>
                                <span>{{ stats.total || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card superadmin">
                            <i class="fas fa-user-shield"></i>
                            <div class="stat-info">
                                <h3>Superadmin</h3>
                                <span>{{ stats.superadmin || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card admin">
                            <i class="fas fa-user-tie"></i>
                            <div class="stat-info">
                                <h3>Admin</h3>
                                <span>{{ stats.admin || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card manager">
                            <i class="fas fa-user-cog"></i>
                            <div class="stat-info">
                                <h3>Manager</h3>
                                <span>{{ stats.manager || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card active">
                            <i class="fas fa-check-circle"></i>
                            <div class="stat-info">
                                <h3>Đang hoạt động</h3>
                                <span>{{ stats.active || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card inactive">
                            <i class="fas fa-times-circle"></i>
                            <div class="stat-info">
                                <h3>Tạm khóa</h3>
                                <span>{{ stats.inactive || 0 }} người dùng</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Users Table -->
                <div class="table-section">
                    <div class="table-header">
                        <h2>Danh sách người dùng ({{ filteredUsers.length }})</h2>
                        <div class="table-actions">
                            <button @click="fetchUsers" class="btn btn-secondary" :disabled="loading">
                                <i class="fas fa-sync-alt" :class="{ 'fa-spin': loading }"></i>
                                Làm mới
                            </button>
                        </div>
                    </div>

                    <!-- Search and Filter Controls -->
                    <div class="table-controls">
                        <div class="controls-row">
                            <!-- Search Box -->
                            <div class="search-box">
                                <i class="fas fa-search"></i>
                                <input type="text" :value="searchQuery" @input="setSearchQuery($event.target.value)"
                                    placeholder="Tìm kiếm theo tên, username hoặc email..." class="search-input" />
                                <button v-if="searchQuery" @click="setSearchQuery('')" class="clear-search">
                                    <i class="fas fa-times"></i>
                                </button>
                            </div>

                            <!-- Role Filter -->
                            <div class="filter-group">
                                <label>Lọc theo quyền:</label>
                                <select :value="selectedRoleFilter" @change="setRoleFilter($event.target.value)"
                                    class="filter-select">
                                    <option value="">Tất cả quyền</option>
                                    <option value="superadmin">Superadmin</option>
                                    <option value="admin">Admin</option>
                                    <option value="manager">Manager</option>
                                    <option value="editor">Editor</option>
                                    <option value="consultant">Consultant</option>
                                </select>
                            </div>

                            <!-- Items per page -->
                            <div class="filter-group">
                                <label>Hiển thị:</label>
                                <select :value="itemsPerPage" @change="setItemsPerPage(parseInt($event.target.value))"
                                    class="filter-select">
                                    <option :value="5">5 / trang</option>
                                    <option :value="20">20 / trang</option>
                                    <option :value="50">50 / trang</option>
                                    <option :value="-1">Tất cả</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <!-- Loading State -->
                    <div v-if="loading" class="loading-state">
                        <i class="fas fa-spinner fa-spin"></i>
                        <p>Đang tải danh sách người dùng...</p>
                    </div>

                    <!-- Error State -->
                    <div v-else-if="error" class="error-state">
                        <i class="fas fa-exclamation-triangle"></i>
                        <p>Lỗi: {{ error }}</p>
                        <button @click="fetchUsers" class="btn btn-primary">Thử lại</button>
                    </div>

                    <!-- Users Table -->
                    <div v-else class="table-container">
                        <table class="users-table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Người dùng</th>
                                    <th>Email</th>
                                    <th>Quyền</th>
                                    <th>Trạng thái</th>
                                    <th>Ngày tạo</th>
                                    <th>Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="user in paginatedUsers" :key="user.id" class="user-row">
                                    <td class="user-id">#{{ user.id }}</td>
                                    <td class="user-info">
                                        <div class="user-avatar">
                                            <i :class="getRoleIcon(user.role_name)"></i>
                                        </div>
                                        <div class="user-details">
                                            <div class="user-name">{{ user.name }}</div>
                                            <div class="username">@{{ user.username }}</div>
                                        </div>
                                    </td>
                                    <td class="user-email">{{ user.email }}</td>
                                    <td class="user-role">
                                        <span class="role-badge" :class="getRoleBadgeColor(user.role_name)">
                                            {{ getRoleDisplayName(user.role_name) }}
                                        </span>
                                    </td>
                                    <td class="user-status">
                                        <button @click="handleToggleStatus(user)" class="status-toggle"
                                            :class="user.is_active ? 'status-active' : 'status-inactive'"
                                            :disabled="loading"
                                            :title="user.is_active ? 'Click để tạm khóa' : 'Click để kích hoạt'">
                                            <i
                                                :class="user.is_active ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                                            <span>{{ user.is_active ? 'Hoạt động' : 'Tạm khóa' }}</span>
                                        </button>
                                    </td>
                                    <td class="user-date">{{ formatDate(user.created_at) }}</td>
                                    <td>
                                        <div class="user-actions">
                                            <button @click="openEditForm(user)" class="btn-action btn-edit"
                                                title="Chỉnh sửa">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button @click="openDeleteConfirm(user)" class="btn-action btn-delete"
                                                title="Xóa">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            </tbody>
                        </table>

                        <!-- Empty State -->
                        <div v-if="filteredUsers.length === 0" class="empty-state">
                            <i class="fas fa-search"></i>
                            <h3>Không tìm thấy kết quả</h3>
                            <p v-if="searchQuery || selectedRoleFilter">
                                Không có người dùng nào phù hợp với bộ lọc hiện tại.
                            </p>
                            <p v-else>
                                Chưa có người dùng nào trong hệ thống.
                            </p>
                        </div>

                        <!-- Pagination -->
                        <div v-if="totalPages > 1" class="pagination">
                            <div class="pagination-info">
                                Hiển thị {{ ((currentPage - 1) * itemsPerPage) + 1 }} -
                                {{ Math.min(currentPage * itemsPerPage, filteredUsers.length) }}
                                trong tổng số {{ filteredUsers.length }} người dùng
                            </div>
                            <div class="pagination-controls">
                                <button @click="goToPage(1)" :disabled="currentPage === 1"
                                    class="btn-page btn-page-first">
                                    <i class="fas fa-angle-double-left"></i>
                                </button>
                                <button @click="goToPage(currentPage - 1)" :disabled="currentPage === 1"
                                    class="btn-page btn-page-prev">
                                    <i class="fas fa-angle-left"></i>
                                </button>

                                <template v-for="page in getVisiblePages()" :key="page">
                                    <button v-if="page === '...'" class="btn-page btn-page-dots" disabled>
                                        ...
                                    </button>
                                    <button v-else @click="goToPage(page)"
                                        :class="['btn-page', { 'btn-page-active': page === currentPage }]">
                                        {{ page }}
                                    </button>
                                </template>

                                <button @click="goToPage(currentPage + 1)" :disabled="currentPage === totalPages"
                                    class="btn-page btn-page-next">
                                    <i class="fas fa-angle-right"></i>
                                </button>
                                <button @click="goToPage(totalPages)" :disabled="currentPage === totalPages"
                                    class="btn-page btn-page-last">
                                    <i class="fas fa-angle-double-right"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Create User Modal -->
                <div v-if="showCreateForm" class="modal-overlay">
                    <div class="modal" @click.stop>
                        <div class="modal-header">
                            <h3>Thêm người dùng mới</h3>
                            <button @click="closeAllModals" class="btn-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form @submit.prevent="handleCreateUser" class="modal-body">
                            <div class="form-group">
                                <label for="create-name">Họ và tên *</label>
                                <input id="create-name" v-model="createForm.name" type="text" required
                                    placeholder="Nhập họ và tên" />
                            </div>
                            <div class="form-group">
                                <label for="create-username">Tên đăng nhập *</label>
                                <input id="create-username" v-model="createForm.username" type="text" required
                                    placeholder="Nhập tên đăng nhập" />
                            </div>
                            <div class="form-group">
                                <label for="create-email">Email *</label>
                                <input id="create-email" v-model="createForm.email" type="email" required
                                    placeholder="Nhập địa chỉ email" />
                            </div>
                            <div class="form-group">
                                <label for="create-password">Mật khẩu *</label>
                                <input id="create-password" v-model="createForm.password" type="password" required
                                    placeholder="Nhập mật khẩu" />
                            </div>
                            <div class="form-group">
                                <label for="create-role">Quyền *</label>
                                <select id="create-role" v-model="createForm.role_id" required>
                                    <option value="">Chọn quyền</option>
                                    <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                                        {{ getRoleDisplayName(role.name) }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="create-status">Trạng thái *</label>
                                <select id="create-status" v-model="createForm.is_active" required>
                                    <option :value="true">Hoạt động</option>
                                    <option :value="false">Tạm khóa</option>
                                </select>
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button @click="closeAllModals" type="button" class="btn btn-secondary">Hủy</button>
                            <button @click="handleCreateUser" type="button" class="btn btn-primary" :disabled="loading">
                                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                                {{ loading ? 'Đang tạo...' : 'Tạo người dùng' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Edit User Modal -->
                <div v-if="showEditForm" class="modal-overlay" @click="closeAllModals">
                    <div class="modal" @click.stop>
                        <div class="modal-header">
                            <h3>Chỉnh sửa người dùng</h3>
                            <button @click="closeAllModals" class="btn-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form @submit.prevent="handleUpdateUser" class="modal-body">
                            <div class="form-group">
                                <label for="edit-name">Họ và tên *</label>
                                <input id="edit-name" v-model="editForm.name" type="text" required
                                    placeholder="Nhập họ và tên" />
                            </div>
                            <div class="form-group">
                                <label for="edit-username">Tên đăng nhập *</label>
                                <input id="edit-username" v-model="editForm.username" type="text" required
                                    placeholder="Nhập tên đăng nhập" />
                            </div>
                            <div class="form-group">
                                <label for="edit-email">Email *</label>
                                <input id="edit-email" v-model="editForm.email" type="email" required
                                    placeholder="Nhập địa chỉ email" />
                            </div>
                            <div class="form-group">
                                <label for="edit-role">Quyền *</label>
                                <select id="edit-role" v-model="editForm.role_id" required>
                                    <option value="">Chọn quyền</option>
                                    <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                                        {{ getRoleDisplayName(role.name) }}
                                    </option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label for="edit-status">Trạng thái *</label>
                                <select id="edit-status" v-model="editForm.is_active" required>
                                    <option :value="true">Hoạt động</option>
                                    <option :value="false">Tạm khóa</option>
                                </select>
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button @click="closeAllModals" type="button" class="btn btn-secondary">Hủy</button>
                            <button @click="handleUpdateUser" type="button" class="btn btn-primary" :disabled="loading">
                                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                                {{ loading ? 'Đang cập nhật...' : 'Cập nhật' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Delete Confirmation Modal -->
                <div v-if="showDeleteConfirm && userToDelete" class="modal-overlay">
                    <div class="modal modal-small" @click.stop>
                        <div class="modal-header">
                            <h3>Xác nhận xóa</h3>
                            <button @click="closeAllModals" class="btn-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <div class="delete-confirmation">
                                <i class="fas fa-exclamation-triangle warning-icon"></i>
                                <p>Bạn có chắc chắn muốn xóa người dùng <strong>{{ userToDelete.name }}</strong>?</p>
                                <p class="warning-text">Thao tác này không thể hoàn tác!</p>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button @click="closeAllModals" type="button" class="btn btn-secondary">Hủy</button>
                            <button @click="handleDeleteUser" type="button" class="btn btn-danger" :disabled="loading">
                                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                                {{ loading ? 'Đang xóa...' : 'Xóa người dùng' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Toast Notification -->
                <div v-if="notification.show" class="toast" :class="notification.type">
                    <i :class="notification.icon"></i>
                    <span>{{ notification.message }}</span>
                    <button @click="hideNotification" class="toast-close">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        </template>
    </PermissionGuard>
</template>

<script setup>
// Import permission constants and PermissionGuard component
import { ADMIN_PERMISSIONS } from '~/composables/usePermissionGuard'
import PermissionGuard from '~/components/admin/PermissionGuard.vue'
import { useUsersAPI } from '~/composables/useUsersAPI'
import { ref, reactive } from 'vue'

// Use the users API composable
const {
    users,
    availableRoles,
    loading,
    error,
    stats,
    editingUser,
    showCreateForm,
    showEditForm,
    showDeleteConfirm,
    userToDelete,
    createForm,
    editForm,
    // Search and Filter
    searchQuery,
    selectedRoleFilter,
    currentPage,
    itemsPerPage,
    filteredUsers,
    paginatedUsers,
    totalPages,
    // Methods
    fetchUsers,
    fetchAvailableRoles,
    createUser,
    updateUser,
    deleteUser,
    resetCreateForm,
    resetEditForm,
    openCreateForm,
    openEditForm,
    openDeleteConfirm,
    closeAllModals,
    // Search and Filter Methods
    setSearchQuery,
    setRoleFilter,
    setItemsPerPage,
    goToPage,
    toggleUserStatus,
    // Helpers
    getRoleDisplayName,
    getRoleIcon,
    getRoleBadgeColor
} = useUsersAPI()

// Notification system
const notification = reactive({
    show: false,
    type: 'success', // success, error, warning
    message: '',
    icon: 'fas fa-check-circle'
})

const showNotification = (type, message) => {
    notification.type = type
    notification.message = message
    notification.icon = type === 'success' ? 'fas fa-check-circle' :
        type === 'error' ? 'fas fa-exclamation-circle' :
            'fas fa-exclamation-triangle'
    notification.show = true

    // Auto hide after 5 seconds
    setTimeout(() => {
        notification.show = false
    }, 5000)
}

const hideNotification = () => {
    notification.show = false
}

// Event handlers
const handleCreateUser = async () => {
    const result = await createUser()

    if (result.success) {
        showNotification('success', result.message || 'Tạo người dùng thành công!')
    } else {
        showNotification('error', result.message || 'Có lỗi xảy ra khi tạo người dùng')
    }
}

const handleUpdateUser = async () => {
    const result = await updateUser()

    if (result.success) {
        showNotification('success', result.message || 'Cập nhật người dùng thành công!')
    } else {
        showNotification('error', result.message || 'Có lỗi xảy ra khi cập nhật người dùng')
    }
}

const handleDeleteUser = async () => {
    if (!userToDelete.value) return

    const result = await deleteUser(userToDelete.value.id)

    if (result.success) {
        showNotification('success', result.message || 'Xóa người dùng thành công!')
    } else {
        showNotification('error', result.message || 'Có lỗi xảy ra khi xóa người dùng')
    }
}

// Status toggle handler
const handleToggleStatus = async (user) => {
    const result = await toggleUserStatus(user.id)

    if (result.success) {
        const statusText = user.is_active ? 'kích hoạt' : 'tạm khóa'
        showNotification('success', `Đã ${statusText} người dùng ${user.name}`)
    } else {
        showNotification('error', result.message || 'Có lỗi xảy ra khi thay đổi trạng thái')
    }
}

// Pagination helper
const getVisiblePages = () => {
    const pages = []
    const total = totalPages.value
    const current = currentPage.value

    if (total <= 7) {
        // Show all pages if total is small
        for (let i = 1; i <= total; i++) {
            pages.push(i)
        }
    } else {
        // Always show first page
        pages.push(1)

        if (current > 4) {
            pages.push('...')
        }

        // Show pages around current
        const start = Math.max(2, current - 1)
        const end = Math.min(total - 1, current + 1)

        for (let i = start; i <= end; i++) {
            pages.push(i)
        }

        if (current < total - 3) {
            pages.push('...')
        }

        // Always show last page
        if (total > 1) {
            pages.push(total)
        }
    }

    return pages
}

// Utility functions
const formatDate = (dateString) => {
    if (!dateString) return '-'

    try {
        const date = new Date(dateString)
        return date.toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        })
    } catch (error) {
        return '-'
    }
}

definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>

<style scoped>
/* =========================
   MAIN LAYOUT
   ========================= */
.users-page {
    padding: 0;
    min-height: 100vh;
}

/* =========================
   PAGE HEADER
   ========================= */
.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 2rem;
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
    color: #d32f2f;
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

/* =========================
   STATS SECTION
   ========================= */
.stats-section {
    margin-bottom: 2rem;
}

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s ease, box-shadow 0.2s ease;
    border-left: 4px solid #ddd;
}

.stat-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
}

.stat-card.superadmin {
    border-left-color: #f44336;
}

.stat-card.admin {
    border-left-color: #2196F3;
}

.stat-card.manager {
    border-left-color: #FF9800;
}

.stat-card.editor {
    border-left-color: #4CAF50;
}

.stat-card.consultant {
    border-left-color: #9C27B0;
}

.stat-card.total {
    border-left-color: #607D8B;
}

.stat-card.active {
    border-left-color: #4CAF50;
}

.stat-card.inactive {
    border-left-color: #f44336;
}

.stat-card i {
    font-size: 2rem;
    opacity: 0.8;
}

.stat-card.superadmin i {
    color: #f44336;
}

.stat-card.admin i {
    color: #2196F3;
}

.stat-card.manager i {
    color: #FF9800;
}

.stat-card.editor i {
    color: #4CAF50;
}

.stat-card.consultant i {
    color: #9C27B0;
}

.stat-card.total i {
    color: #607D8B;
}

.stat-card.active i {
    color: #4CAF50;
}

.stat-card.inactive i {
    color: #f44336;
}

.stat-info h3 {
    margin: 0 0 0.25rem 0;
    color: #333;
    font-size: 1.1rem;
    font-weight: 600;
}

.stat-info span {
    color: #666;
    font-size: 0.9rem;
}

/* =========================
   TABLE SECTION
   ========================= */
.table-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.table-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
}

.table-header h2 {
    margin: 0;
    color: #333;
    font-size: 1.3rem;
}

.table-actions {
    display: flex;
    gap: 1rem;
}

.table-container {
    overflow-x: auto;
}

.users-table {
    width: 100%;
    border-collapse: collapse;
}

.users-table th {
    background: #f8f9fa;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: #333;
    border-bottom: 2px solid #eee;
    white-space: nowrap;
}

.users-table td {
    padding: 1rem;
    border-bottom: 1px solid #f0f0f0;
    vertical-align: middle;
}

.user-row:hover {
    background: #f9f9f9;
}

.user-id {
    font-family: 'Courier New', monospace;
    color: #666;
    font-size: 0.9rem;
}

.user-info {
    display: flex;
    align-items: center;
    gap: 1rem;
}

.user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: #e3f2fd;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #1976d2;
    font-size: 1.2rem;
}

.user-details .user-name {
    font-weight: 600;
    color: #333;
    margin-bottom: 0.25rem;
}

.user-details .username {
    color: #666;
    font-size: 0.9rem;
}

.user-email {
    color: #666;
}

.role-badge {
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
    text-transform: capitalize;
}

.badge-superadmin {
    background: #ffebee;
    color: #c62828;
}

.badge-admin {
    background: #e3f2fd;
    color: #1565c0;
}

.badge-manager {
    background: #fff3e0;
    color: #ef6c00;
}

.badge-editor {
    background: #e8f5e8;
    color: #2e7d32;
}

.badge-consultant {
    background: #f3e5f5;
    color: #7b1fa2;
}

.badge-default {
    background: #f5f5f5;
    color: #666;
}

.user-date {
    color: #666;
    font-size: 0.9rem;
}

.user-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.btn-edit {
    background: #e3f2fd;
    color: #1976d2;
}

.btn-edit:hover {
    background: #1976d2;
    color: white;
}

.btn-delete {
    background: #ffebee;
    color: #d32f2f;
}

.btn-delete:hover {
    background: #d32f2f;
    color: white;
}

/* =========================
   STATES
   ========================= */
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
    color: #2196F3;
}

.error-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #f44336;
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    color: #ccc;
}

.empty-state h3 {
    margin-bottom: 0.5rem;
    color: #666;
}

.empty-state p {
    margin: 0;
    color: #999;
}

/* =========================
   BUTTONS
   ========================= */
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

.btn-danger {
    background: #d32f2f;
    color: white;
}

.btn-danger:hover:not(:disabled) {
    background: #c62828;
}

/* =========================
   MODALS
   ========================= */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 2rem;
}

.modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.3);
    max-width: 500px;
    width: 100%;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-small {
    max-width: 400px;
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
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
    padding: 2rem;
}

.modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    padding: 1.5rem 2rem;
    border-top: 1px solid #eee;
}

/* =========================
   FORMS
   ========================= */
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-group input,
.form-group select {
    width: 100%;
    padding: 0.75rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
}

.form-group input:focus,
.form-group select:focus {
    outline: none;
    border-color: #1976d2;
}

.form-group input::placeholder {
    color: #999;
}

/* =========================
   DELETE CONFIRMATION
   ========================= */
.delete-confirmation {
    text-align: center;
}

.warning-icon {
    font-size: 3rem;
    color: #ff9800;
    margin-bottom: 1rem;
}

.warning-text {
    color: #f44336;
    font-weight: 500;
    margin-top: 1rem;
}

/* =========================
   TOAST NOTIFICATIONS
   ========================= */
.toast {
    position: fixed;
    top: 2rem;
    right: 2rem;
    background: white;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
    padding: 1rem 1.5rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    z-index: 1100;
    max-width: 400px;
    border-left: 4px solid;
}

.toast.success {
    border-left-color: #4CAF50;
}

.toast.error {
    border-left-color: #f44336;
}

.toast.warning {
    border-left-color: #ff9800;
}

.toast i {
    font-size: 1.2rem;
}

.toast.success i {
    color: #4CAF50;
}

.toast.error i {
    color: #f44336;
}

.toast.warning i {
    color: #ff9800;
}

.toast-close {
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 0.25rem;
    margin-left: auto;
}

/* =========================
   TABLE CONTROLS
   ========================= */
.table-controls {
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-bottom: 1px solid #eee;
}

.controls-row {
    display: flex;
    gap: 1.5rem;
    align-items: center;
    flex-wrap: wrap;
}

/* Search Box */
.search-box {
    position: relative;
    flex: 1;
    min-width: 300px;
}

.search-box i {
    position: absolute;
    left: 12px;
    top: 50%;
    transform: translateY(-50%);
    color: #666;
    z-index: 1;
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 2.5rem;
    border: 2px solid #ddd;
    border-radius: 8px;
    font-size: 1rem;
    transition: border-color 0.2s ease;
}

.search-input:focus {
    outline: none;
    border-color: #1976d2;
}

.clear-search {
    position: absolute;
    right: 24px;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: #666;
    cursor: pointer;
    padding: 4px;
    border-radius: 50%;
    transition: background-color 0.2s ease;
}

.clear-search:hover {
    background: #f0f0f0;
}

/* Filter Groups */
.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 140px;
}

.filter-group label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #666;
}

.filter-select {
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    background: white;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.filter-select:focus {
    outline: none;
    border-color: #1976d2;
}

/* =========================
   STATUS COLUMN
   ========================= */
.user-status {
    text-align: center;
}

.status-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 110px;
    justify-content: center;
}

.status-active {
    background: #e8f5e8;
    color: #2e7d32;
}

.status-active:hover {
    background: #c8e6c9;
}

.status-inactive {
    background: #ffebee;
    color: #c62828;
}

.status-inactive:hover {
    background: #ffcdd2;
}

.status-toggle:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* =========================
   PAGINATION
   ========================= */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-top: 1px solid #eee;
}

.pagination-info {
    color: #666;
    font-size: 0.9rem;
}

.pagination-controls {
    display: flex;
    gap: 0.25rem;
}

.btn-page {
    min-width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.btn-page:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #ccc;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-page-active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
}

.btn-page-active:hover {
    background: #1565c0;
    border-color: #1565c0;
}

.btn-page-dots {
    cursor: default;
    border: none;
    background: transparent;
}

.btn-page-first,
.btn-page-last,
.btn-page-prev,
.btn-page-next {
    font-size: 0.8rem;
}

/* =========================
   RESPONSIVE
   ========================= */
@media (max-width: 1024px) {
    .stats-grid {
        grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
    }

    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .controls-row {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .search-box {
        min-width: auto;
    }

    .pagination {
        flex-direction: column;
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .users-page {
        padding: 0;
    }

    .page-header {
        padding: 1rem 0;
    }

    .stats-grid {
        grid-template-columns: 1fr;
        gap: 0.75rem;
    }

    .stat-card {
        padding: 1rem;
    }

    .table-header {
        padding: 1rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .table-controls {
        padding: 1rem;
    }

    .filter-group {
        min-width: auto;
    }

    .users-table th,
    .users-table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
    }

    .user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 1rem;
    }

    .modal-overlay {
        padding: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }

    .toast {
        top: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
    }

    .pagination-controls {
        flex-wrap: wrap;
        justify-content: center;
    }

    .status-toggle {
        min-width: 90px;
        font-size: 0.75rem;
        padding: 0.4rem 0.6rem;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .controls-row {
        gap: 0.75rem;
    }

    .search-input {
        font-size: 0.9rem;
        padding: 0.6rem 0.8rem 0.6rem 2.2rem;
    }

    .users-table {
        font-size: 0.8rem;
    }

    .btn-action {
        width: 32px;
        height: 32px;
    }

    .role-badge {
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
    }

    .btn-page {
        min-width: 32px;
        height: 32px;
        font-size: 0.8rem;
    }

    .table-header {
        padding: 1rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .users-table th,
    .users-table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
    }

    .user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 1rem;
    }

    .modal-overlay {
        padding: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }

    .toast {
        top: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .users-table {
        font-size: 0.8rem;
    }

    .btn-action {
        width: 32px;
        height: 32px;
    }

    .role-badge {
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
    }

    .table-header {
        padding: 1rem;
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .table-controls {
        padding: 1rem;
    }

    .filter-group {
        min-width: auto;
    }

    .users-table th,
    .users-table td {
        padding: 0.75rem 0.5rem;
        font-size: 0.9rem;
    }

    .user-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 0.5rem;
    }

    .user-avatar {
        width: 32px;
        height: 32px;
        font-size: 1rem;
    }

    .modal-overlay {
        padding: 1rem;
    }

    .modal-header,
    .modal-body,
    .modal-footer {
        padding: 1rem;
    }

    .toast {
        top: 1rem;
        right: 1rem;
        left: 1rem;
        max-width: none;
    }

    .pagination-controls {
        flex-wrap: wrap;
        justify-content: center;
    }

    .status-toggle {
        min-width: 90px;
        font-size: 0.75rem;
        padding: 0.4rem 0.6rem;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .controls-row {
        gap: 0.75rem;
    }

    .search-input {
        font-size: 0.9rem;
        padding: 0.6rem 0.8rem 0.6rem 2.2rem;
    }

    .users-table {
        font-size: 0.8rem;
    }

    .btn-action {
        width: 32px;
        height: 32px;
    }

    .role-badge {
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
    }

    .btn-page {
        min-width: 32px;
        height: 32px;
        font-size: 0.8rem;
    }
}

/* Filter Groups */
.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    min-width: 140px;
}

.filter-group label {
    font-size: 0.85rem;
    font-weight: 500;
    color: #666;
}

.filter-select {
    padding: 0.5rem;
    border: 2px solid #ddd;
    border-radius: 6px;
    font-size: 0.9rem;
    background: white;
    cursor: pointer;
    transition: border-color 0.2s ease;
}

.filter-select:focus {
    outline: none;
    border-color: #1976d2;
}

/* =========================
   STATUS COLUMN
   ========================= */
.user-status {
    text-align: center;
}

.status-toggle {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border: none;
    border-radius: 20px;
    cursor: pointer;
    font-size: 0.85rem;
    font-weight: 500;
    transition: all 0.2s ease;
    min-width: 110px;
    justify-content: center;
}

.status-active {
    background: #e8f5e8;
    color: #2e7d32;
}

.status-active:hover {
    background: #c8e6c9;
}

.status-inactive {
    background: #ffebee;
    color: #c62828;
}

.status-inactive:hover {
    background: #ffcdd2;
}

.status-toggle:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* =========================
   PAGINATION
   ========================= */
.pagination {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem 2rem;
    background: #f8f9fa;
    border-top: 1px solid #eee;
}

.pagination-info {
    color: #666;
    font-size: 0.9rem;
}

.pagination-controls {
    display: flex;
    gap: 0.25rem;
}

.btn-page {
    min-width: 36px;
    height: 36px;
    border: 1px solid #ddd;
    background: white;
    color: #666;
    cursor: pointer;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 0.9rem;
}

.btn-page:hover:not(:disabled) {
    background: #f0f0f0;
    border-color: #ccc;
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-page-active {
    background: #1976d2;
    color: white;
    border-color: #1976d2;
}

.btn-page-active:hover {
    background: #1565c0;
    border-color: #1565c0;
}

.btn-page-dots {
    cursor: default;
    border: none;
    background: transparent;
}

.btn-page-first,
.btn-page-last,
.btn-page-prev,
.btn-page-next {
    font-size: 0.8rem;
}

/* =========================
   RESPONSIVE UPDATES
   ========================= */
@media (max-width: 1024px) {
    .controls-row {
        flex-direction: column;
        align-items: stretch;
        gap: 1rem;
    }

    .search-box {
        min-width: auto;
    }

    .pagination {
        flex-direction: column;
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .table-controls {
        padding: 1rem;
    }

    .filter-group {
        min-width: auto;
    }

    .pagination-controls {
        flex-wrap: wrap;
        justify-content: center;
    }

    .status-toggle {
        min-width: 90px;
        font-size: 0.75rem;
        padding: 0.4rem 0.6rem;
    }
}

@media (max-width: 480px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .controls-row {
        gap: 0.75rem;
    }

    .search-input {
        font-size: 0.9rem;
        padding: 0.6rem 0.8rem 0.6rem 2.2rem;
    }

    .users-table {
        font-size: 0.8rem;
    }

    .btn-action {
        width: 32px;
        height: 32px;
    }

    .role-badge {
        font-size: 0.75rem;
        padding: 0.2rem 0.6rem;
    }

    .btn-page {
        min-width: 32px;
        height: 32px;
        font-size: 0.8rem;
    }
}
</style>