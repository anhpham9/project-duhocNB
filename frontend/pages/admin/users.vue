<template>
    <PermissionGuard :allowed-roles="ADMIN_PERMISSIONS.MANAGEMENT_LEVEL" :show-user-info="false"
        denied-title="Không thể truy cập Quản lý Người dùng"
        denied-message="Chỉ Superadmin, Admin và Manager mới có thể quản lý người dùng.">
        <template #default="{ user: currentUser }">
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
                        <button @click="handleOpenCreateForm" class="btn btn-primary">
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
                        <div v-if="currentUser.role_id === 1" class="stat-card superadmin">
                            <i class="fas fa-user-shield"></i>
                            <div class="stat-info">
                                <h3>Superadmin</h3>
                                <span>{{ stats.superadmin || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div v-if="currentUser.role_id <= 2" class="stat-card admin">
                            <i class="fas fa-user-tie"></i>
                            <div class="stat-info">
                                <h3>Admin</h3>
                                <span>{{ stats.admin || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div v-if="currentUser.role_id <= 2" class="stat-card manager">
                            <i class="fas fa-user-cog"></i>
                            <div class="stat-info">
                                <h3>Manager</h3>
                                <span>{{ stats.manager || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div v-if="currentUser.role_id === 3" class="stat-card editor">
                            <i class="fas fa-user-edit"></i>
                            <div class="stat-info">
                                <h3>Editor</h3>
                                <span>{{ stats.editor || 0 }} người dùng</span>
                            </div>
                        </div>
                        <div v-if="currentUser.role_id === 4" class="stat-card consultant">
                            <i class="fas fa-user-headset"></i>
                            <div class="stat-info">
                                <h3>Consultant</h3>
                                <span>{{ stats.consultant || 0 }} người dùng</span>
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
                            <button @click="exportToExcel" class="btn btn-success" :disabled="loading || filteredUsers.length === 0">
                                <i class="fas fa-file-excel" :class="{ 'fa-spin': exportingExcel }"></i>
                                Xuất Excel
                            </button>
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
                                    placeholder="Tìm kiếm theo tên, username, email hoặc số điện thoại..." class="search-input" />
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

                            <!-- Status Filter -->
                            <div class="filter-group">
                                <label>Lọc theo trạng thái:</label>
                                <select :value="selectedStatusFilter" @change="setStatusFilter($event.target.value)"
                                    class="filter-select">
                                    <option value="">Tất cả trạng thái</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="inactive">Tạm khóa</option>
                                </select>
                            </div>

                            <!-- Items per page -->
                            <div class="filter-group">
                                <label>Hiển thị:</label>
                                <select :value="itemsPerPage" @change="setItemsPerPage(parseInt($event.target.value))"
                                    class="filter-select">
                                    <option v-for="option in itemsPerPageOptions" :key="option.value" :value="option.value">
                                        {{ option.label }}
                                    </option>
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
                                    <th class="sortable" 
                                        :class="{ 'sort-asc': sortColumn === 'id' && sortDirection === 'asc', 'sort-desc': sortColumn === 'id' && sortDirection === 'desc' }"
                                        @click="handleSort('id')">
                                        ID
                                        <i class="fas fa-sort"></i>
                                    </th>
                                    <th class="sortable" 
                                        :class="{ 'sort-asc': sortColumn === 'name' && sortDirection === 'asc', 'sort-desc': sortColumn === 'name' && sortDirection === 'desc' }"
                                        @click="handleSort('name')">
                                        Người dùng
                                        <i class="fas fa-sort"></i>
                                    </th>
                                    <th class="sortable" 
                                        :class="{ 'sort-asc': sortColumn === 'email' && sortDirection === 'asc', 'sort-desc': sortColumn === 'email' && sortDirection === 'desc' }"
                                        @click="handleSort('email')">
                                        Email
                                        <i class="fas fa-sort"></i>
                                    </th>
                                    <th class="sortable" 
                                        :class="{ 'sort-asc': sortColumn === 'phone' && sortDirection === 'asc', 'sort-desc': sortColumn === 'phone' && sortDirection === 'desc' }"
                                        @click="handleSort('phone')">
                                        Số điện thoại
                                        <i class="fas fa-sort"></i>
                                    </th>
                                    <th class="sortable" 
                                        :class="{ 'sort-asc': sortColumn === 'role_name' && sortDirection === 'asc', 'sort-desc': sortColumn === 'role_name' && sortDirection === 'desc' }"
                                        @click="handleSort('role_name')">
                                        Quyền
                                        <i class="fas fa-sort"></i>
                                    </th>
                                    <th class="sortable" 
                                        :class="{ 'sort-asc': sortColumn === 'is_active' && sortDirection === 'asc', 'sort-desc': sortColumn === 'is_active' && sortDirection === 'desc' }"
                                        @click="handleSort('is_active')">
                                        Trạng thái
                                        <i class="fas fa-sort"></i>
                                    </th>
                                    <th class="sortable" 
                                        :class="{ 'sort-asc': sortColumn === 'created_at' && sortDirection === 'asc', 'sort-desc': sortColumn === 'created_at' && sortDirection === 'desc' }"
                                        @click="handleSort('created_at')">
                                        Ngày tạo
                                        <i class="fas fa-sort"></i>
                                    </th>
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
                                    <td class="user-phone">{{ user.phone || '-' }}</td>
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
                                            <button @click="handleOpenEditForm(user)" class="btn-action btn-edit"
                                                title="Chỉnh sửa">
                                                <i class="fas fa-edit"></i>
                                            </button>
                                            <button v-if="canResetPassword(currentUser, user)" 
                                                @click="openResetPasswordConfirm(user)" 
                                                class="btn-action btn-reset"
                                                title="Reset mật khẩu">
                                                <i class="fas fa-key"></i>
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
                            <button @click="handleCloseAllModals" class="btn-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form @submit.prevent="handleCreateUser" class="modal-body">
                            <div class="form-group">
                                <label for="create-name">Họ và tên <span class="required">*</span></label>
                                <input id="create-name" v-model="createForm.name" type="text" required
                                    placeholder="Nhập họ và tên" 
                                    :class="{ 'input-error': validationErrors.name }"
                                    @blur="validateField('name')" />
                                <div v-if="validationErrors.name" class="field-error">
                                    {{ validationErrors.name }}
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="create-username">Tên đăng nhập <span class="required">*</span></label>
                                <input id="create-username" v-model="createForm.username" type="text" required
                                    placeholder="Nhập tên đăng nhập" 
                                    :class="{ 'input-error': validationErrors.username }"
                                    @blur="validateField('username')" />
                                <div v-if="validationErrors.username" class="field-error">
                                    {{ validationErrors.username }}
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="create-email">Email <span class="required">*</span></label>
                                <input id="create-email" v-model="createForm.email" type="email" required
                                    placeholder="Nhập địa chỉ email" 
                                    :class="{ 'input-error': validationErrors.email }"
                                    @input="checkEmailValidation" 
                                    @blur="validateField('email')" />
                                <div v-if="validationErrors.email" class="field-error">
                                    {{ validationErrors.email }}
                                </div>
                                <div v-if="createForm.email && isEmailValid && !validationErrors.email" class="success-message">
                                    <i class="fas fa-check-circle"></i>
                                    Địa chỉ email hợp lệ
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="create-phone">Số điện thoại</label>
                                <input id="create-phone" v-model="createForm.phone" type="tel" 
                                    placeholder="Nhập số điện thoại (tùy chọn)" 
                                    :class="{ 'input-error': validationErrors.phone }"
                                    @input="checkPhoneValidation" 
                                    @blur="validateField('phone')" />
                                <div v-if="validationErrors.phone" class="field-error">
                                    {{ validationErrors.phone }}
                                </div>
                                <div v-if="createForm.phone && isPhoneValid && !validationErrors.phone" class="success-message">
                                    <i class="fas fa-check-circle"></i>
                                    Số điện thoại hợp lệ
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="create-password">Mật khẩu <span class="required">*</span></label>
                                <input id="create-password" v-model="createForm.password" type="password" required
                                    placeholder="Nhập mật khẩu" 
                                    :class="{ 'input-error': validationErrors.password }"
                                    @input="checkPasswordStrength" 
                                    @blur="validateField('password')" />
                                <div v-if="validationErrors.password" class="field-error">
                                    {{ validationErrors.password }}
                                </div>
                                
                                <!-- Password Strength Checker -->
                                <div v-if="createForm.password" class="password-strength">
                                    <h4>Kiểm tra độ bảo mật mật khẩu:</h4>
                                    <div class="strength-checks">
                                        <div class="strength-check" :class="{ 'check-valid': passwordStrength.hasMinLength }">
                                            <i :class="passwordStrength.hasMinLength ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                                            <span>Trên 8 ký tự</span>
                                        </div>
                                        <div class="strength-check" :class="{ 'check-valid': passwordStrength.hasLettersAndNumbers }">
                                            <i :class="passwordStrength.hasLettersAndNumbers ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                                            <span>Gồm chữ và số</span>
                                        </div>
                                        <div class="strength-check" :class="{ 'check-valid': passwordStrength.hasMixedCase }">
                                            <i :class="passwordStrength.hasMixedCase ? 'fas fa-check-circle' : 'fas fa-times-circle'"></i>
                                            <span>Gồm chữ in hoa và in thường</span>
                                        </div>
                                    </div>
                                    <div class="strength-indicator">
                                        <div class="strength-bar">
                                            <div class="strength-progress" :class="getPasswordStrengthClass()"
                                                :style="{ width: getPasswordStrengthPercentage() + '%' }"></div>
                                        </div>
                                        <span class="strength-text">{{ getPasswordStrengthText() }}</span>
                                    </div>
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="create-confirm-password">Nhập lại mật khẩu <span class="required">*</span></label>
                                <input id="create-confirm-password" v-model="createForm.confirmPassword" type="password" required
                                    placeholder="Nhập lại mật khẩu" 
                                    :class="{ 'input-error': validationErrors.confirmPassword }"
                                    @blur="validateField('confirmPassword')" />
                                <div v-if="validationErrors.confirmPassword" class="field-error">
                                    {{ validationErrors.confirmPassword }}
                                </div>
                                <div v-if="createForm.confirmPassword && passwordsMatch && !validationErrors.confirmPassword" class="success-message">
                                    <i class="fas fa-check-circle"></i>
                                    Mật khẩu trùng khớp
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="create-role">Quyền <span class="required">*</span></label>
                                <select id="create-role" v-model="createForm.role_id" required
                                    :class="{ 'input-error': validationErrors.role_id }"
                                    @blur="validateField('role_id')">
                                    <option value="">Chọn quyền</option>
                                    <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                                        {{ getRoleDisplayName(role.name) }}
                                    </option>
                                </select>
                                <div v-if="validationErrors.role_id" class="field-error">
                                    {{ validationErrors.role_id }}
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="create-status">Trạng thái <span class="required">*</span></label>
                                <select id="create-status" v-model="createForm.is_active" required>
                                    <option :value="true">Hoạt động</option>
                                    <option :value="false">Tạm khóa</option>
                                </select>
                            </div>
                        </form>
                        <div class="modal-footer">
                            <button @click="handleCloseAllModals" type="button" class="btn btn-secondary">Hủy</button>
                            <button @click="handleCreateUser" type="button" class="btn btn-primary" 
                                :disabled="loading || !isCreateFormValid || phoneCheckingDuplicate">
                                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                                {{ loading ? 'Đang tạo...' : 'Tạo người dùng' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Edit User Modal -->
                <div v-if="showEditForm" class="modal-overlay" @click="handleCloseAllModals">
                    <div class="modal" @click.stop>
                        <div class="modal-header">
                            <h3>Chỉnh sửa người dùng</h3>
                            <button @click="handleCloseAllModals" class="btn-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <form @submit.prevent="handleUpdateUser" class="modal-body">
                            <div class="form-group">
                                <label for="edit-name">Họ và tên *</label>
                                <input id="edit-name" v-model="editForm.name" type="text" required
                                    placeholder="Nhập họ và tên" 
                                    :class="{ 'input-error': editValidationErrors.name }"
                                    @blur="validateEditField('name')" />
                                <div v-if="editValidationErrors.name" class="field-error">
                                    {{ editValidationErrors.name }}
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="edit-username">Tên đăng nhập *</label>
                                <input id="edit-username" v-model="editForm.username" type="text" required
                                    placeholder="Nhập tên đăng nhập" 
                                    :class="{ 'input-error': editValidationErrors.username }"
                                    @blur="validateEditField('username')" />
                                <div v-if="editValidationErrors.username" class="field-error">
                                    {{ editValidationErrors.username }}
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="edit-email">Email *</label>
                                <input id="edit-email" v-model="editForm.email" type="email" required
                                    placeholder="Nhập địa chỉ email" 
                                    :class="{ 'input-error': editValidationErrors.email }"
                                    @input="checkEditEmailValidation" 
                                    @blur="validateEditField('email')" />
                                <div v-if="editValidationErrors.email" class="field-error">
                                    {{ editValidationErrors.email }}
                                </div>
                                <div v-if="editForm.email && isEditEmailValid && !editValidationErrors.email" class="success-message">
                                    <i class="fas fa-check-circle"></i>
                                    Địa chỉ email hợp lệ
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="edit-phone">Số điện thoại</label>
                                <input id="edit-phone" v-model="editForm.phone" type="tel" 
                                    placeholder="Nhập số điện thoại (tùy chọn)" 
                                    :class="{ 'input-error': editValidationErrors.phone }"
                                    @input="checkEditPhoneValidation" 
                                    @blur="validateEditField('phone')" />
                                <div v-if="editValidationErrors.phone" class="field-error">
                                    {{ editValidationErrors.phone }}
                                </div>
                                <div v-if="editForm.phone && isEditPhoneValid && !editValidationErrors.phone" class="success-message">
                                    <i class="fas fa-check-circle"></i>
                                    Số điện thoại hợp lệ
                                </div>
                            </div>
                            <div class="form-group">
                                <label for="edit-role">Quyền *</label>
                                <select id="edit-role" v-model="editForm.role_id" required
                                    :class="{ 'input-error': editValidationErrors.role_id }"
                                    @blur="validateEditField('role_id')">
                                    <option value="">Chọn quyền</option>
                                    <option v-for="role in availableRoles" :key="role.id" :value="role.id">
                                        {{ getRoleDisplayName(role.name) }}
                                    </option>
                                </select>
                                <div v-if="editValidationErrors.role_id" class="field-error">
                                    {{ editValidationErrors.role_id }}
                                </div>
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
                            <button @click="handleCloseAllModals" type="button" class="btn btn-secondary">Hủy</button>
                            <button @click="handleUpdateUser" type="button" class="btn btn-primary" 
                                :disabled="loading || !isEditFormValid || editPhoneCheckingDuplicate">
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
                            <button @click="handleCloseAllModals" class="btn-close">
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
                            <button @click="handleCloseAllModals" type="button" class="btn btn-secondary">Hủy</button>
                            <button @click="handleDeleteUser" type="button" class="btn btn-danger" :disabled="loading">
                                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                                {{ loading ? 'Đang xóa...' : 'Xóa người dùng' }}
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Reset Password Modal -->
                <div v-if="showResetPasswordForm && userToResetPassword" class="modal-overlay">
                    <div class="modal modal-medium" @click.stop>
                        <div class="modal-header">
                            <h3>Reset mật khẩu</h3>
                            <button @click="handleCloseAllModals" class="btn-close">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                        <div class="modal-body">
                            <!-- Confirmation Step -->
                            <div v-if="!resetPasswordResult" class="reset-confirmation">
                                <i class="fas fa-key warning-icon"></i>
                                <p>Bạn có chắc chắn muốn reset mật khẩu cho người dùng <strong>{{ userToResetPassword.name }}</strong>?</p>
                                <div class="user-info">
                                    <div class="info-item">
                                        <span class="label">Tên đăng nhập:</span>
                                        <span class="value">{{ userToResetPassword.username }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Email:</span>
                                        <span class="value">{{ userToResetPassword.email }}</span>
                                    </div>
                                    <div class="info-item">
                                        <span class="label">Quyền:</span>
                                        <span class="value">{{ getRoleDisplayName(userToResetPassword.role_name) }}</span>
                                    </div>
                                </div>
                                <p class="warning-text">Hệ thống sẽ tự động tạo mật khẩu mới và hiển thị cho bạn!</p>
                            </div>
                            
                            <!-- Result Step -->
                            <div v-else class="reset-result">
                                <i class="fas fa-check-circle success-icon"></i>
                                <p class="success-text">Reset mật khẩu thành công!</p>
                                <div class="password-result">
                                    <h4>Thông tin đăng nhập mới:</h4>
                                    <div class="credential-item">
                                        <span class="credential-label">Tên đăng nhập:</span>
                                        <div class="credential-value">
                                            <input type="text" :value="resetPasswordResult.user.username" readonly class="credential-input">
                                            <button @click="copyToClipboard(resetPasswordResult.user.username)" class="btn-copy" title="Copy">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div class="credential-item">
                                        <span class="credential-label">Mật khẩu mới:</span>
                                        <div class="credential-value">
                                            <input type="text" :value="resetPasswordResult.newPassword" readonly class="credential-input password-field">
                                            <button @click="copyToClipboard(resetPasswordResult.newPassword)" class="btn-copy" title="Copy">
                                                <i class="fas fa-copy"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <div class="important-note">
                                    <i class="fas fa-exclamation-triangle"></i>
                                    <p><strong>Quan trọng:</strong> Hãy copy và gửi thông tin này cho người dùng ngay. Sau khi đóng modal này, bạn sẽ không thể xem lại mật khẩu!</p>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button v-if="!resetPasswordResult" @click="handleCloseAllModals" type="button" class="btn btn-secondary">Hủy</button>
                            <button v-if="!resetPasswordResult" @click="handleResetPassword" type="button" class="btn btn-warning" :disabled="loading">
                                <i v-if="loading" class="fas fa-spinner fa-spin"></i>
                                {{ loading ? 'Đang reset...' : 'Reset mật khẩu' }}
                            </button>
                            <button v-else @click="handleCloseAllModals" type="button" class="btn btn-primary">Đóng</button>
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
import { ref, reactive, computed, nextTick } from 'vue'
import * as XLSX from 'xlsx'

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
    showResetPasswordForm,
    userToDelete,
    userToResetPassword,
    resetPasswordResult,
    createForm,
    editForm,
    // Search and Filter
    searchQuery,
    selectedRoleFilter,
    selectedStatusFilter,
    
    // Sort
    sortColumn,
    sortDirection,
    
    // Pagination
    currentPage,
    itemsPerPage,
    itemsPerPageOptions,
    filteredUsers,
    paginatedUsers,
    totalPages,
    // Methods
    fetchUsers,
    fetchAvailableRoles,
    createUser,
    updateUser,
    deleteUser,
    resetPassword,
    resetCreateForm,
    resetEditForm,
    openCreateForm,
    openEditForm,
    openDeleteConfirm,
    openResetPasswordConfirm,
    closeAllModals,
    // Search and Filter Methods
    setSearchQuery,
    setRoleFilter,
    setStatusFilter,
    handleSort,
    setItemsPerPage,
    goToPage,
    toggleUserStatus,
    // Helpers
    getRoleDisplayName,
    getRoleIcon,
    getRoleBadgeColor,
    canResetPassword
} = useUsersAPI()

// Export state
const exportingExcel = ref(false)

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

// Password strength checking
const passwordStrength = reactive({
    hasMinLength: false,
    hasLettersAndNumbers: false,
    hasMixedCase: false
})

// Email validation
const isEmailValid = ref(false)
const isEditEmailValid = ref(false)

// Phone validation
const isPhoneValid = ref(false)
const isEditPhoneValid = ref(false)
const phoneCheckingDuplicate = ref(false)
const editPhoneCheckingDuplicate = ref(false)

// Validation errors
const validationErrors = reactive({
    name: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    role_id: ''
})

// Edit form validation errors
const editValidationErrors = reactive({
    name: '',
    username: '',
    email: '',
    phone: '',
    role_id: ''
})

// Email validation function
const checkEmailValidation = () => {
    const email = createForm.email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    isEmailValid.value = emailRegex.test(email)
    
    // Clear email error if valid
    if (isEmailValid.value) {
        validationErrors.email = ''
    }
}

// Edit email validation function
const checkEditEmailValidation = () => {
    const email = editForm.email
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
    isEditEmailValid.value = emailRegex.test(email)
    
    // Clear email error if valid
    if (isEditEmailValid.value) {
        editValidationErrors.email = ''
    }
}

// Phone validation function
const checkPhoneValidation = async () => {
    const phone = createForm.phone?.trim()
    
    // If empty, it's valid (optional field)
    if (!phone) {
        isPhoneValid.value = true
        validationErrors.phone = ''
        return
    }
    
    // Check Vietnam phone number format
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/
    isPhoneValid.value = phoneRegex.test(phone)
    
    if (isPhoneValid.value) {
        // Check for duplicate phone number
        phoneCheckingDuplicate.value = true
        try {
            const normalizedPhone = normalizePhoneNumber(phone)
            const isDuplicate = users.value.some(user => 
                normalizePhoneNumber(user.phone) === normalizedPhone
            )
            
            if (isDuplicate) {
                validationErrors.phone = 'Số điện thoại này đã được đăng ký'
                isPhoneValid.value = false
            } else {
                validationErrors.phone = ''
            }
        } catch (error) {
            console.error('Error checking phone duplicate:', error)
        } finally {
            phoneCheckingDuplicate.value = false
        }
    } else if (phone) {
        validationErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam'
    }
}

// Edit phone validation function
const checkEditPhoneValidation = async () => {
    const phone = editForm.phone?.trim()
    
    // If empty, it's valid (optional field)
    if (!phone) {
        isEditPhoneValid.value = true
        editValidationErrors.phone = ''
        return
    }
    
    // Check Vietnam phone number format
    const phoneRegex = /^(\+84|84|0)[3|5|7|8|9][0-9]{8}$/
    isEditPhoneValid.value = phoneRegex.test(phone)
    
    if (isEditPhoneValid.value) {
        // Check for duplicate phone number (excluding current user)
        editPhoneCheckingDuplicate.value = true
        try {
            const normalizedPhone = normalizePhoneNumber(phone)
            const isDuplicate = users.value.some(user => 
                user.id !== editingUser.value?.id &&
                normalizePhoneNumber(user.phone) === normalizedPhone
            )
            
            if (isDuplicate) {
                editValidationErrors.phone = 'Số điện thoại này đã được đăng ký'
                isEditPhoneValid.value = false
            } else {
                editValidationErrors.phone = ''
            }
        } catch (error) {
            console.error('Error checking phone duplicate:', error)
        } finally {
            editPhoneCheckingDuplicate.value = false
        }
    } else if (phone) {
        editValidationErrors.phone = 'Số điện thoại không đúng định dạng Việt Nam'
    }
}

// Normalize phone number for comparison
const normalizePhoneNumber = (phone) => {
    if (!phone) return ''
    
    // Remove all spaces and special characters
    let normalized = phone.replace(/[\s\-\(\)]/g, '')
    
    // Convert to standard format (0xxxxxxxxx)
    if (normalized.startsWith('+84')) {
        normalized = '0' + normalized.substring(3)
    } else if (normalized.startsWith('84') && normalized.length === 11) {
        normalized = '0' + normalized.substring(2)
    }
    
    return normalized
}

// Parse backend validation errors
const parseBackendValidationError = (errorResponse) => {
    // Try to parse JSON if it's a string
    let parsedError = errorResponse
    if (typeof errorResponse === 'string') {
        try {
            parsedError = JSON.parse(errorResponse)
        } catch (e) {
            // If not JSON, treat as plain error message
            parsedError = { message: errorResponse }
        }
    }
    
    // Handle different error response formats from backend
    if (parsedError.errors) {
        // Format: { errors: { field: "message" } } - nếu backend có structured errors
        return parsedError.errors
    } else if (parsedError.details && Array.isArray(parsedError.details)) {
        // Format: { details: [{ field, message }] } - nếu backend có detailed errors
        const fieldErrors = {}
        parsedError.details.forEach(detail => {
            if (detail.field && detail.message) {
                fieldErrors[detail.field] = detail.message
            }
        })
        return fieldErrors
    } else if (parsedError.message) {
        // Dựa trên backend thực tế, các messages chính:
        const message = parsedError.message
        
        // Backend trả về chính xác messages này:
        if (message === 'Username already exists') {
            return { username: 'Tên đăng nhập đã tồn tại' }
        }
        if (message === 'Email already exists') {
            return { email: 'Địa chỉ email đã được đăng ký' }
        }
        if (message === 'Phone already exists') {
            return { phone: 'Số điện thoại đã được đăng ký' }
        }
        if (message === 'Invalid role_id') {
            return { role_id: 'Quyền không hợp lệ' }
        }
        if (message === 'User not found') {
            return { _general: 'Không tìm thấy người dùng' }
        }
        
        // Handle compound validation message
        if (message === 'All fields are required (name, username, email, password, role_id)') {
            // Không thể determine trường nào thiếu, show general error
            return { _general: 'Tất cả các trường là bắt buộc (họ tên, tên đăng nhập, email, mật khẩu, quyền)' }
        }
        
        // Handle permission errors
        if (message.includes('Access denied') || message.includes('cannot create') || message.includes('cannot update') || message.includes('cannot modify')) {
            return { _general: translateErrorMessage(message) }
        }
        
        // Generic message với translation
        return { _general: translateErrorMessage(message) }
    }
    
    return { _general: 'Có lỗi xảy ra, vui lòng thử lại' }
}

// Translate backend error messages to Vietnamese
const translateErrorMessage = (message) => {
    // Backend thực tế trả về các messages sau (dựa trên users.controller.js):
    const translations = {
        // Duplicate/exists errors (409 status)
        'Username already exists': 'Tên đăng nhập đã tồn tại',
        'Email already exists': 'Địa chỉ email đã được đăng ký',
        'Phone already exists': 'Số điện thoại đã được đăng ký',
        
        // Validation errors (400 status)
        'All fields are required (name, username, email, password, role_id)': 'Tất cả các trường là bắt buộc (họ tên, tên đăng nhập, email, mật khẩu, quyền)',
        'is_active must be true or false': 'Trạng thái phải là đúng hoặc sai',
        'Invalid role_id': 'Quyền không hợp lệ',
        'No fields to update': 'Không có trường nào để cập nhật',
        
        // Not found errors (404 status)
        'User not found': 'Không tìm thấy người dùng',
        
        // Permission errors (403 status)
        'Access denied. You cannot create users.': 'Truy cập bị từ chối. Bạn không thể tạo người dùng.',
        'Access denied. You cannot update users.': 'Truy cập bị từ chối. Bạn không thể cập nhật người dùng.',
        'Access denied. You cannot modify this user.': 'Truy cập bị từ chối. Bạn không thể chỉnh sửa người dùng này.',
        'Access denied. Insufficient permissions.': 'Truy cập bị từ chối. Không đủ quyền hạn.',
        
        // Server errors (500 status)
        'Internal server error': 'Lỗi hệ thống, vui lòng thử lại sau',
        
        // Generic fallback translations
        'access denied': 'Truy cập bị từ chối',
        'forbidden': 'Truy cập bị từ chối',
        'unauthorized': 'Không có quyền thực hiện thao tác này',
        'bad request': 'Yêu cầu không hợp lệ',
        'network error': 'Lỗi kết nối mạng',
        'timeout': 'Hết thời gian chờ',
        'connection failed': 'Kết nối thất bại'
    }
    
    if (!message) return 'Có lỗi xảy ra'
    
    // Try exact match first (case-sensitive để match chính xác backend messages)
    if (translations[message]) {
        return translations[message]
    }
    
    // Try case-insensitive partial match cho các trường hợp đặc biệt
    const lowerMessage = message.toLowerCase()
    
    // Handle dynamic messages từ backend
    if (lowerMessage.includes('you cannot create users with role id')) {
        return 'Truy cập bị từ chối. Bạn không thể tạo người dùng với quyền này.'
    }
    
    if (lowerMessage.includes('you cannot assign role id')) {
        return 'Truy cập bị từ chối. Bạn không thể gán quyền này.'
    }
    
    // Fallback cho generic terms
    for (const [key, value] of Object.entries(translations)) {
        if (lowerMessage.includes(key.toLowerCase())) {
            return value
        }
    }
    
    return message // Return original if no translation found
}

// Set backend validation errors to form fields
const setBackendValidationErrors = (errors, isEditForm = false) => {
    const errorObj = isEditForm ? editValidationErrors : validationErrors
    
    // Clear existing errors first
    Object.keys(errorObj).forEach(key => {
        errorObj[key] = ''
    })
    
    // Set new errors
    Object.keys(errors).forEach(field => {
        if (field === '_general') {
            // Show general error as notification
            showNotification('error', errors[field])
        } else if (errorObj.hasOwnProperty(field)) {
            errorObj[field] = translateErrorMessage(errors[field])
        }
    })
}

// Validate individual field
const validateField = async (fieldName) => {
    const value = createForm[fieldName]
    
    // Clear previous error (including backend errors)
    validationErrors[fieldName] = ''
    
    // Required field check (phone is optional)
    if (fieldName !== 'phone' && (!value || (typeof value === 'string' && !value.trim()))) {
        const fieldLabels = {
            name: 'Họ và tên',
            username: 'Tên đăng nhập', 
            email: 'Email',
            password: 'Mật khẩu',
            confirmPassword: 'Xác nhận mật khẩu',
            role_id: 'Quyền'
        }
        validationErrors[fieldName] = `${fieldLabels[fieldName]} là bắt buộc`
        return false
    }
    
    // Specific validations
    switch (fieldName) {
        case 'email':
            if (!isEmailValid.value) {
                validationErrors.email = 'Địa chỉ email không hợp lệ'
                return false
            }
            break
            
        case 'phone':
            if (value && value.trim()) {
                await checkPhoneValidation()
                return isPhoneValid.value
            }
            break
            
        case 'password':
            if (!passwordStrength.hasMinLength) {
                validationErrors.password = 'Mật khẩu phải trên 8 ký tự'
                return false
            }
            if (!passwordStrength.hasLettersAndNumbers) {
                validationErrors.password = 'Mật khẩu phải có chữ và số'
                return false
            }
            if (!passwordStrength.hasMixedCase) {
                validationErrors.password = 'Mật khẩu phải có chữ hoa và thường'
                return false
            }
            break
            
        case 'confirmPassword':
            if (!passwordsMatch.value) {
                validationErrors.confirmPassword = 'Mật khẩu xác nhận không trùng khớp'
                return false
            }
            break
            
        case 'username':
            if (value.length < 3) {
                validationErrors.username = 'Tên đăng nhập phải ít nhất 3 ký tự'
                return false
            }
            break
    }
    
    return true
}

// Validate edit form field
const validateEditField = async (fieldName) => {
    const value = editForm[fieldName]
    
    // Clear previous error (including backend errors)
    editValidationErrors[fieldName] = ''
    
    // Required field check (phone is optional)
    if (fieldName !== 'phone' && (!value || (typeof value === 'string' && !value.trim()))) {
        const fieldLabels = {
            name: 'Họ và tên',
            username: 'Tên đăng nhập',
            email: 'Email', 
            role_id: 'Quyền'
        }
        editValidationErrors[fieldName] = `${fieldLabels[fieldName]} là bắt buộc`
        return false
    }
    
    // Specific validations
    if (fieldName === 'email' && !isEditEmailValid.value) {
        editValidationErrors.email = 'Địa chỉ email không hợp lệ'
        return false
    }
    
    if (fieldName === 'phone' && value && value.trim()) {
        await checkEditPhoneValidation()
        return isEditPhoneValid.value
    }
    
    if (fieldName === 'username' && value.length < 3) {
        editValidationErrors.username = 'Tên đăng nhập phải ít nhất 3 ký tự'
        return false
    }
    
    return true
}

// Validate entire form
const validateCreateForm = async () => {
    const fields = ['name', 'username', 'email', 'phone', 'password', 'confirmPassword', 'role_id']
    let isValid = true
    
    for (const field of fields) {
        const fieldValid = await validateField(field)
        if (!fieldValid) {
            isValid = false
        }
    }
    
    return isValid
}

// Validate entire edit form
const validateEditForm = async () => {
    const fields = ['name', 'username', 'email', 'phone', 'role_id']
    let isValid = true
    
    for (const field of fields) {
        const fieldValid = await validateEditField(field)
        if (!fieldValid) {
            isValid = false
        }
    }
    
    return isValid
}

// Check if passwords match
const passwordsMatch = computed(() => {
    return createForm.password === createForm.confirmPassword
})

// Check if create form is valid
const isCreateFormValid = computed(() => {
    // Check if all required fields are filled (phone is optional)
    const hasAllFields = createForm.name && 
                        createForm.username && 
                        createForm.email && 
                        createForm.password && 
                        createForm.confirmPassword &&
                        createForm.role_id
    
    // Check if no validation errors
    const hasNoErrors = !validationErrors.name &&
                       !validationErrors.username &&
                       !validationErrors.email &&
                       !validationErrors.phone &&
                       !validationErrors.password &&
                       !validationErrors.confirmPassword &&
                       !validationErrors.role_id
    
    // Check specific validations
    const validationsPassed = isEmailValid.value &&
                             passwordsMatch.value &&
                             passwordStrength.hasMinLength &&
                             passwordStrength.hasLettersAndNumbers &&
                             passwordStrength.hasMixedCase &&
                             (createForm.phone ? isPhoneValid.value : true) // Phone is optional
    
    return hasAllFields && hasNoErrors && validationsPassed
})

// Check if edit form is valid
const isEditFormValid = computed(() => {
    // Check if all required fields are filled (phone is optional)
    const hasAllFields = editForm.name && 
                        editForm.username && 
                        editForm.email && 
                        editForm.role_id
    
    // Check if no validation errors
    const hasNoErrors = !editValidationErrors.name &&
                       !editValidationErrors.username &&
                       !editValidationErrors.email &&
                       !editValidationErrors.phone &&
                       !editValidationErrors.role_id
    
    // Check email validation and phone validation (if provided)
    const emailValid = isEditEmailValid.value
    const phoneValid = editForm.phone ? isEditPhoneValid.value : true // Phone is optional
    
    return hasAllFields && hasNoErrors && emailValid && phoneValid
})

// Password strength checker function
const checkPasswordStrength = () => {
    const password = createForm.password
    
    // Check minimum length (over 8 characters)
    passwordStrength.hasMinLength = password.length > 8
    
    // Check letters and numbers
    const hasLetter = /[a-zA-Z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    passwordStrength.hasLettersAndNumbers = hasLetter && hasNumber
    
    // Check mixed case (uppercase and lowercase)
    const hasUppercase = /[A-Z]/.test(password)
    const hasLowercase = /[a-z]/.test(password)
    passwordStrength.hasMixedCase = hasUppercase && hasLowercase
    
    // Clear password error if strength requirements are met
    if (password && passwordStrength.hasMinLength && passwordStrength.hasLettersAndNumbers && passwordStrength.hasMixedCase) {
        validationErrors.password = ''
    }
    
    // Also validate confirm password if it exists
    if (createForm.confirmPassword) {
        validateField('confirmPassword')
    }
}

// Get password strength class for styling
const getPasswordStrengthClass = () => {
    const validChecks = [
        passwordStrength.hasMinLength,
        passwordStrength.hasLettersAndNumbers,
        passwordStrength.hasMixedCase
    ].filter(Boolean).length
    
    if (validChecks === 0) return 'strength-weak'
    if (validChecks === 1) return 'strength-weak'
    if (validChecks === 2) return 'strength-medium'
    return 'strength-strong'
}

// Get password strength percentage
const getPasswordStrengthPercentage = () => {
    const validChecks = [
        passwordStrength.hasMinLength,
        passwordStrength.hasLettersAndNumbers,
        passwordStrength.hasMixedCase
    ].filter(Boolean).length
    
    return (validChecks / 3) * 100
}

// Get password strength text
const getPasswordStrengthText = () => {
    const validChecks = [
        passwordStrength.hasMinLength,
        passwordStrength.hasLettersAndNumbers,
        passwordStrength.hasMixedCase
    ].filter(Boolean).length
    
    if (validChecks === 0 || validChecks === 1) return 'Yếu'
    if (validChecks === 2) return 'Trung bình'
    return 'Mạnh'
}

// Event handlers
const handleCreateUser = async () => {
    // Validate form first
    const isValid = await validateCreateForm()
    if (!isValid) {
        showNotification('error', 'Vui lòng sửa các lỗi trong form')
        return
    }
    
    const result = await createUser()

    if (result.success) {
        showNotification('success', result.message || 'Tạo người dùng thành công!')
        // Clear any previous backend errors
        Object.keys(validationErrors).forEach(key => {
            validationErrors[key] = ''
        })
    } else {
        // Parse and set backend validation errors
        try {
            const backendErrors = parseBackendValidationError(result.error || result.message)
            
            // If there are field-specific errors, set them
            const hasFieldErrors = Object.keys(backendErrors).some(key => key !== '_general')
            
            if (hasFieldErrors) {
                setBackendValidationErrors(backendErrors, false)
                showNotification('error', 'Vui lòng kiểm tra các lỗi trong form')
            } else {
                // Show general error
                showNotification('error', backendErrors._general || result.message || 'Có lỗi xảy ra khi tạo người dùng')
            }
        } catch (error) {
            console.error('Error parsing backend validation:', error)
            showNotification('error', result.message || 'Có lỗi xảy ra khi tạo người dùng')
        }
    }
}

const handleUpdateUser = async () => {
    // Validate form first
    const isValid = await validateEditForm()
    if (!isValid) {
        showNotification('error', 'Vui lòng sửa các lỗi trong form')
        return
    }
    
    const result = await updateUser()

    if (result.success) {
        showNotification('success', result.message || 'Cập nhật người dùng thành công!')
        // Clear any previous backend errors
        Object.keys(editValidationErrors).forEach(key => {
            editValidationErrors[key] = ''
        })
    } else {
        // Parse and set backend validation errors
        try {
            const backendErrors = parseBackendValidationError(result.error || result.message)
            
            // If there are field-specific errors, set them
            const hasFieldErrors = Object.keys(backendErrors).some(key => key !== '_general')
            
            if (hasFieldErrors) {
                setBackendValidationErrors(backendErrors, true)
                showNotification('error', 'Vui lòng kiểm tra các lỗi trong form')
            } else {
                // Show general error
                showNotification('error', backendErrors._general || result.message || 'Có lỗi xảy ra khi cập nhật người dùng')
            }
        } catch (error) {
            console.error('Error parsing backend validation:', error)
            showNotification('error', result.message || 'Có lỗi xảy ra khi cập nhật người dùng')
        }
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

const handleResetPassword = async () => {
    if (!userToResetPassword.value) return

    const result = await resetPassword(userToResetPassword.value.id)

    if (result.success) {
        showNotification('success', 'Reset mật khẩu thành công!')
        // Result is automatically stored in resetPasswordResult by the API function
    } else {
        showNotification('error', result.message || 'Có lỗi xảy ra khi reset mật khẩu')
    }
}

const copyToClipboard = async (text) => {
    try {
        await navigator.clipboard.writeText(text)
        showNotification('success', 'Đã copy vào clipboard!')
    } catch (error) {
        console.error('Copy failed:', error)
        showNotification('error', 'Không thể copy vào clipboard')
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

// Override closeAllModals to reset password strength
const handleCloseAllModals = () => {
    closeAllModals()
    
    // Reset password strength
    passwordStrength.hasMinLength = false
    passwordStrength.hasLettersAndNumbers = false
    passwordStrength.hasMixedCase = false
    
    // Reset email validation
    isEmailValid.value = false
    isEditEmailValid.value = false
    
    // Reset phone validation
    isPhoneValid.value = false
    isEditPhoneValid.value = false
    phoneCheckingDuplicate.value = false
    editPhoneCheckingDuplicate.value = false
    
    // Clear validation errors
    Object.keys(validationErrors).forEach(key => {
        validationErrors[key] = ''
    })
    Object.keys(editValidationErrors).forEach(key => {
        editValidationErrors[key] = ''
    })
}

// Override openCreateForm to clear validation errors  
const handleOpenCreateForm = () => {
    openCreateForm()
    
    // Clear validation errors
    Object.keys(validationErrors).forEach(key => {
        validationErrors[key] = ''
    })
    
    // Reset validation states
    isEmailValid.value = false
    isPhoneValid.value = false
    passwordStrength.hasMinLength = false
    passwordStrength.hasLettersAndNumbers = false
    passwordStrength.hasMixedCase = false
}

// Override openEditForm to set email validation
const handleOpenEditForm = (user) => {
    openEditForm(user)
    
    // Clear validation errors
    Object.keys(editValidationErrors).forEach(key => {
        editValidationErrors[key] = ''
    })
    
    // Set email and phone validation for existing data
    nextTick(() => {
        checkEditEmailValidation()
        if (editForm.phone) {
            checkEditPhoneValidation()
        } else {
            isEditPhoneValid.value = true
        }
    })
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

// Excel Export function
const exportToExcel = async () => {
    if (filteredUsers.value.length === 0) {
        showNotification('warning', 'Không có dữ liệu để xuất')
        return
    }

    exportingExcel.value = true
    
    try {
        // Prepare data for export
        const exportData = filteredUsers.value.map((user, index) => ({
            'STT': index + 1,
            'ID': user.id,
            'Họ và tên': user.name,
            'Tên đăng nhập': user.username,
            'Email': user.email,
            'Số điện thoại': user.phone || '',
            'Quyền': getRoleDisplayName(user.role_name),
            'Trạng thái': user.is_active ? 'Hoạt động' : 'Tạm khóa',
            'Ngày tạo': formatDate(user.created_at),
            'Ngày cập nhật': formatDate(user.updated_at)
        }))

        // Create workbook
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(exportData)

        // Set column widths
        const colWidths = [
            { wch: 5 },   // STT
            { wch: 8 },   // ID
            { wch: 25 },  // Họ và tên
            { wch: 20 },  // Tên đăng nhập
            { wch: 30 },  // Email
            { wch: 15 },  // Số điện thoại
            { wch: 15 },  // Quyền
            { wch: 12 },  // Trạng thái
            { wch: 12 },  // Ngày tạo
            { wch: 12 }   // Ngày cập nhật
        ]
        ws['!cols'] = colWidths

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách người dùng')

        // Generate filename with current date
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD format
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '') // HHMMSS format
        const filename = `danh-sach-nguoi-dung_${dateStr}_${timeStr}.xlsx`

        // Export file
        XLSX.writeFile(wb, filename)
        
        showNotification('success', `Đã xuất ${filteredUsers.value.length} người dùng ra file Excel thành công!`)
    } catch (error) {
        console.error('Export error:', error)
        showNotification('error', 'Có lỗi xảy ra khi xuất file Excel')
    } finally {
        exportingExcel.value = false
    }
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

.user-phone {
    color: #666;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
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

.btn-reset {
    background: #fff3e0;
    color: #f57400;
}

.btn-reset:hover {
    background: #f57400;
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

.btn-success {
    background: #2e7d32;
    color: white;
}

.btn-success:hover:not(:disabled) {
    background: #1b5e20;
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

.form-group input.input-error,
.form-group select.input-error {
    border-color: #dc3545;
    background-color: #fff5f5;
}

.form-group input.input-error:focus,
.form-group select.input-error:focus {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.1);
}

.field-error {
    color: #dc3545;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: flex-start;
    gap: 0.25rem;
}

span.required {
    color: #dc3545;
    font-size: 0.8rem;
}

.success-message {
    color: #28a745;
    font-size: 0.8rem;
    margin-top: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.25rem;
}

.success-message i {
    color: #28a745;
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

/* =========================
   PASSWORD STRENGTH CHECKER
   ========================= */
.password-strength {
    margin-top: 0.75rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 8px;
    border: 1px solid #e9ecef;
}

.password-strength h4 {
    margin: 0 0 0.75rem 0;
    font-size: 0.9rem;
    color: #495057;
    font-weight: 600;
}

.strength-checks {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    margin-bottom: 1rem;
}

.strength-check {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-size: 0.85rem;
    color: #6c757d;
    transition: all 0.2s ease;
}

.strength-check.check-valid {
    color: #28a745;
}

.strength-check i {
    width: 16px;
    font-size: 0.9rem;
}

.strength-check.check-valid i {
    color: #28a745;
}

.strength-check:not(.check-valid) i {
    color: #dc3545;
}

.strength-indicator {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.strength-bar {
    width: 100%;
    height: 8px;
    background: #e9ecef;
    border-radius: 4px;
    overflow: hidden;
}

.strength-progress {
    height: 100%;
    transition: all 0.3s ease;
    border-radius: 4px;
}

.strength-progress.strength-weak {
    background: #dc3545;
}

.strength-progress.strength-medium {
    background: #ffc107;
}

.strength-progress.strength-strong {
    background: #28a745;
}

.strength-text {
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
}

.strength-weak .strength-text {
    color: #dc3545;
}

.strength-medium .strength-text {
    color: #ffc107;
}

.strength-strong .strength-text {
    color: #28a745;
}

.success-message {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
    padding: 0.5rem;
    background: #d4edda;
    color: #155724;
    border-radius: 4px;
    font-size: 0.85rem;
}

.success-message i {
    font-size: 0.9rem;
}

/* =========================
   RESET PASSWORD MODAL
   ========================= */
.modal-medium {
    width: 90%;
    max-width: 600px;
}

.reset-confirmation,
.reset-result {
    text-align: center;
}

.reset-confirmation .warning-icon,
.reset-result .success-icon {
    font-size: 3rem;
    margin-bottom: 1rem;
}

.reset-confirmation .warning-icon {
    color: #f57400;
}

.reset-result .success-icon {
    color: #28a745;
}

.reset-confirmation .user-info {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
    margin: 1rem 0;
    text-align: left;
}

.info-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid #e9ecef;
    gap: 0.5rem;
}

.info-item:last-child {
    border-bottom: none;
}

.info-item .label {
    font-weight: 600;
    color: #495057;
}

.info-item .value {
    color: #212529;
}

.warning-text {
    color: #f57400 !important;
    font-weight: 600;
    margin-top: 1rem;
}

.success-text {
    color: #28a745 !important;
    font-weight: 600;
    font-size: 1.1rem;
    margin-bottom: 1.5rem;
}

.password-result {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1.5rem;
    margin: 1rem 0;
}

.password-result h4 {
    color: #495057;
    margin-bottom: 1rem;
    font-size: 1rem;
}

.credential-item {
    margin-bottom: 1rem;
}

.credential-item:last-child {
    margin-bottom: 0;
}

.credential-label {
    display: block;
    font-weight: 600;
    color: #495057;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
}

.credential-value {
    display: flex;
    gap: 0.5rem;
}

.credential-input {
    flex: 1;
    padding: 0.75rem;
    border: 1px solid #ced4da;
    border-radius: 6px;
    background: white;
    font-family: 'Courier New', monospace;
    font-size: 0.9rem;
    color: #495057;
}

.credential-input.password-field {
    background: #fff3cd;
    border-color: #ffeaa7;
    font-weight: 600;
    color: #856404;
}

.btn-copy {
    padding: 0.75rem;
    background: #007bff;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 45px;
}

.btn-copy:hover {
    background: #0056b3;
    transform: translateY(-1px);
}

.important-note {
    background: #fff3cd;
    border: 1px solid #ffeaa7;
    border-radius: 6px;
    padding: 1rem;
    margin-top: 1.5rem;
    display: flex;
    align-items: flex-start;
    gap: 0.75rem;
}

.important-note i {
    color: #856404;
    margin-top: 0.1rem;
    flex-shrink: 0;
}

.important-note p {
    color: #856404;
    margin: 0;
    font-size: 0.9rem;
    line-height: 1.5;
}

/* =========================
   SORTABLE HEADERS
   ========================= */
.sortable {
    cursor: pointer;
    user-select: none;
    position: relative;
    transition: background-color 0.2s ease;
}

.sortable:hover {
    background-color: #f5f5f5;
}

.sortable i {
    margin-left: 0.5rem;
    opacity: 0.5;
    transition: opacity 0.2s ease;
}

.sortable:hover i {
    opacity: 0.8;
}

.sortable.sort-asc i::before {
    content: '\f0de'; /* fa-sort-up */
    opacity: 1;
    color: #1976d2;
}

.sortable.sort-desc i::before {
    content: '\f0dd'; /* fa-sort-down */
    opacity: 1;
    color: #1976d2;
}

.sortable.sort-asc,
.sortable.sort-desc {
    background-color: #f8f9fa;
    color: #1976d2;
}
</style>