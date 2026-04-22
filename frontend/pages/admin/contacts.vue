<template>
    <div class="contacts-page">
        <!-- Permission Check & Loading -->
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Quản lý Người dùng</h3>
                <p>Chỉ Superadmin, Admin và Manager mới có thể quản lý người dùng.</p>
                <NuxtLink to="/admin" class="btn btn-primary">
                    <i class="fas fa-arrow-left"></i>
                    Quay lại Dashboard
                </NuxtLink>
            </div>
        </div>

        <!-- Main Content -->
        <div v-else>
            <!-- Page Header -->
            <div class="page-header">
                <div class="header-content">
                    <h1>
                        <i class="fas fa-address-book"></i>
                        Quản lý Liên hệ
                    </h1>
                    <p>Quản lý và xử lý các yêu cầu liên hệ từ khách hàng</p>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-section">
                <div class="stats-grid">
                    <div class="stat-card total">
                        <i class="fas fa-address-book"></i>
                        <div class="stat-info">
                            <h3>Tổng số</h3>
                            <span>{{ stats.total || 0 }} liên hệ</span>
                        </div>
                    </div>
                    <div class="stat-card new">
                        <i class="fas fa-envelope"></i>
                        <div class="stat-info">
                            <h3>Mới</h3>
                            <span>{{ stats.new || 0 }} liên hệ</span>
                        </div>
                    </div>
                    <div class="stat-card pending">
                        <i class="fas fa-clock"></i>
                        <div class="stat-info">
                            <h3>Chờ phản hồi</h3>
                            <span>{{ stats.pending || 0 }} liên hệ</span>
                        </div>
                    </div>
                    <div class="stat-card responded">
                        <i class="fas fa-check-circle"></i>
                        <div class="stat-info">
                            <h3>Đã phản hồi</h3>
                            <span>{{ stats.responded || 0 }} liên hệ</span>
                        </div>
                    </div>
                    <div class="stat-card closed">
                        <i class="fas fa-times-circle"></i>
                        <div class="stat-info">
                            <h3>Đã đóng</h3>
                            <span>{{ stats.closed || 0 }} liên hệ</span>
                        </div>
                    </div>
                    <div class="stat-card assigned">
                        <i class="fas fa-user-check"></i>
                        <div class="stat-info">
                            <h3>Đã phân công</h3>
                            <span>{{ stats.assigned || 0 }} liên hệ</span>
                        </div>
                    </div>
                    <div class="stat-card unassigned">
                        <i class="fas fa-user-times"></i>
                        <div class="stat-info">
                            <h3>Chưa phân công</h3>
                            <span>{{ stats.unassigned || 0 }} liên hệ</span>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Contacts Table -->
            <div class="table-section">
                <div class="table-header">
                    <h2>Danh sách liên hệ ({{ filteredContacts.length }})</h2>
                    <div class="table-actions">
                        <button @click="exportToExcel" class="btn btn-success"
                            :disabled="loading || filteredContacts.length === 0">
                            <i class="fas fa-file-excel" :class="{ 'fa-spin': exportingExcel }"></i>
                            Xuất Excel
                        </button>
                        <button @click="fetchContacts" class="btn btn-secondary" :disabled="loading">
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
                                placeholder="Tìm kiếm theo tên, email, số điện thoại hoặc tin nhắn..."
                                class="search-input" />
                            <button v-if="searchQuery" @click="setSearchQuery('')" class="clear-search">
                                <i class="fas fa-times"></i>
                            </button>
                        </div>

                        <!-- Status Filter -->
                        <div class="filter-group">
                            <label>Lọc theo trạng thái:</label>
                            <select :value="selectedStatusFilter" @change="setStatusFilter($event.target.value)"
                                class="filter-select">
                                <option value="">Tất cả trạng thái</option>
                                <option value="new">Mới</option>
                                <option value="pending">Chờ phản hồi</option>
                                <option value="responded">Đã phản hồi</option>
                                <option value="closed">Đã đóng</option>
                            </select>
                        </div>

                        <!-- Contact Method Filter -->
                        <div class="filter-group">
                            <label>Phương thức liên hệ:</label>
                            <select :value="selectedMethodFilter" @change="setMethodFilter($event.target.value)"
                                class="filter-select">
                                <option value="">Tất cả</option>
                                <option value="email">Email</option>
                                <option value="phone">Điện thoại</option>
                                <option value="social">Mạng xã hội</option>
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
                    <p>Đang tải danh sách liên hệ...</p>
                </div>

                <!-- Error State -->
                <div v-else-if="error" class="error-state">
                    <i class="fas fa-exclamation-triangle"></i>
                    <p>Lỗi: {{ error }}</p>
                    <button @click="fetchContacts" class="btn btn-primary">Thử lại</button>
                </div>

                <!-- Contacts Table -->
                <div v-else class="table-container">
                    <table class="contacts-table">
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
                                    Thông tin khách hàng
                                    <i class="fas fa-sort"></i>
                                </th>
                                <th class="sortable"
                                    :class="{ 'sort-asc': sortColumn === 'contact_method' && sortDirection === 'asc', 'sort-desc': sortColumn === 'contact_method' && sortDirection === 'desc' }"
                                    @click="handleSort('contact_method')">
                                    Phương thức
                                    <i class="fas fa-sort"></i>
                                </th>
                                <th class="sortable"
                                    :class="{ 'sort-asc': sortColumn === 'status' && sortDirection === 'asc', 'sort-desc': sortColumn === 'status' && sortDirection === 'desc' }"
                                    @click="handleSort('status')">
                                    Trạng thái
                                    <i class="fas fa-sort"></i>
                                </th>
                                <th class="sortable"
                                    :class="{ 'sort-asc': sortColumn === 'assigned_to_name' && sortDirection === 'asc', 'sort-desc': sortColumn === 'assigned_to_name' && sortDirection === 'desc' }"
                                    @click="handleSort('assigned_to_name')">
                                    Phân công
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
                            <tr v-for="contact in paginatedContacts" :key="contact.id" class="contact-row">
                                <td class="contact-id">#{{ contact.id }}</td>
                                <td class="contact-info">
                                    <div class="contact-details">
                                        <div class="contact-name">{{ contact.name }}</div>
                                        <div class="contact-email">{{ contact.email }}</div>
                                        <div class="contact-phone">{{ contact.phone || '-' }}</div>
                                        <div v-if="contact.message" class="contact-message" :title="contact.message">
                                            {{ truncateMessage(contact.message) }}
                                        </div>
                                    </div>
                                </td>
                                <td class="contact-method">
                                    <span class="method-badge" :class="getMethodBadgeColor(contact.contact_method)">
                                        <i :class="getMethodIcon(contact.contact_method)"></i>
                                        {{ getMethodDisplayName(contact.contact_method) }}
                                    </span>
                                </td>
                                <td class="contact-status">
                                    <button @click="handleStatusChange(contact)" class="status-badge"
                                        :class="getStatusBadgeColor(contact.status)" :disabled="loading"
                                        :title="`Click để chuyển sang '${getStatusDisplayName(getNextStatus(contact.status))}'`">
                                        <i :class="getStatusIcon(contact.status)"></i>
                                        <span>{{ getStatusDisplayName(contact.status) }}</span>
                                    </button>
                                </td>
                                <td class="contact-assigned">
                                    <div v-if="contact.assigned_to_name" class="assigned-info">
                                        <i class="fas fa-user-check"></i>
                                        {{ contact.assigned_to_name }}
                                        <button @click="handleUnassign(contact)" class="btn-unassign"
                                            :disabled="loading" title="Bỏ phân công">
                                            <i class="fas fa-times"></i>
                                        </button>
                                    </div>
                                    <select v-else @change="handleAssignment(contact, $event.target.value)"
                                        class="assign-select" :disabled="loading">
                                        <option value="">Chọn người xử lý...</option>
                                        <option v-for="user in assignableUsers" :key="user.id" :value="user.id">
                                            {{ user.name }} ({{ user.role_name }})
                                        </option>
                                    </select>
                                </td>
                                <td class="contact-date">{{ formatDate(contact.created_at) }}</td>
                                <td>
                                    <div class="contact-actions">
                                        <button @click="handleOpenViewDetail(contact)" class="btn-action btn-view"
                                            title="Xem chi tiết">
                                            <i class="fas fa-eye"></i>
                                        </button>
                                        <button @click="handleOpenEditForm(contact)" class="btn-action btn-edit"
                                            title="Chỉnh sửa">
                                            <i class="fas fa-edit"></i>
                                        </button>
                                        <button @click="handleOpenNotes(contact)" class="btn-action btn-notes"
                                            title="Ghi chú">
                                            <i class="fas fa-comment"></i>
                                        </button>
                                        <button v-if="canDeleteContact(contact)" @click="openDeleteConfirm(contact)"
                                            class="btn-action btn-delete" title="Xóa">
                                            <i class="fas fa-trash"></i>
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>

                    <!-- Empty State -->
                    <div v-if="filteredContacts.length === 0" class="empty-state">
                        <i class="fas fa-search"></i>
                        <h3>Không tìm thấy kết quả</h3>
                        <p v-if="searchQuery || selectedStatusFilter || selectedMethodFilter">
                            Không có liên hệ nào phù hợp với bộ lọc hiện tại.
                        </p>
                        <p v-else>
                            Chưa có liên hệ nào trong hệ thống.
                        </p>
                    </div>

                    <!-- Pagination -->
                    <div v-if="totalPages > 1" class="pagination">
                        <div class="pagination-info">
                            Hiển thị {{ ((currentPage - 1) * itemsPerPage) + 1 }} -
                            {{ Math.min(currentPage * itemsPerPage, filteredContacts.length) }}
                            trong tổng số {{ filteredContacts.length }} liên hệ
                        </div>
                        <div class="pagination-controls">
                            <button @click="goToPage(1)" :disabled="currentPage === 1" class="btn-page btn-page-first">
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

            <!-- Contact Detail Modal -->
            <div v-if="showDetailModal && detailContact" class="modal-overlay">
                <div class="modal modal-large" @click.stop>
                    <div class="modal-header">
                        <h3>Chi tiết liên hệ #{{ detailContact?.id }}</h3>
                        <button @click="handleCloseAllModals" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div v-if="detailContact" class="contact-detail">
                            <div class="detail-grid">
                                <div class="detail-section">
                                    <h4><i class="fas fa-user"></i> Thông tin khách hàng</h4>
                                    <div class="detail-item">
                                        <label>Họ và tên:</label>
                                        <span>{{ detailContact.name }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Email:</label>
                                        <span>{{ detailContact.email }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Số điện thoại:</label>
                                        <span>{{ detailContact.phone || '-' }}</span>
                                    </div>
                                    <div v-if="detailContact.social_contact" class="detail-item">
                                        <label>Liên hệ khác:</label>
                                        <span>{{ detailContact.social_contact }}</span>
                                    </div>
                                </div>

                                <div class="detail-section">
                                    <h4><i class="fas fa-info-circle"></i> Trạng thái & Xử lý</h4>
                                    <div class="detail-item">
                                        <label>Trạng thái:</label>
                                        <span class="status-badge" :class="getStatusBadgeColor(detailContact.status)">
                                            <i :class="getStatusIcon(detailContact.status)"></i>
                                            {{ getStatusDisplayName(detailContact.status) }}
                                        </span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Phương thức liên hệ:</label>
                                        <span class="method-badge"
                                            :class="getMethodBadgeColor(detailContact.contact_method)">
                                            <i :class="getMethodIcon(detailContact.contact_method)"></i>
                                            {{ getMethodDisplayName(detailContact.contact_method) }}
                                        </span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Được phân công cho:</label>
                                        <span>{{ detailContact.assigned_to_name || 'Chưa phân công' }}</span>
                                    </div>
                                    <div class="detail-item">
                                        <label>Ngày tạo:</label>
                                        <span>{{ formatDate(detailContact.created_at) }}</span>
                                    </div>
                                    <div v-if="detailContact.first_contacted_at" class="detail-item">
                                        <label>Lần liên hệ đầu:</label>
                                        <span>{{ formatDate(detailContact.first_contacted_at) }}</span>
                                    </div>
                                    <div v-if="detailContact.closed_at" class="detail-item">
                                        <label>Ngày đóng:</label>
                                        <span>{{ formatDate(detailContact.closed_at) }}</span>
                                    </div>
                                </div>
                            </div>

                            <div v-if="detailContact.message" class="detail-section message-section">
                                <h4><i class="fas fa-comment"></i> Tin nhắn</h4>
                                <div class="message-content">
                                    {{ detailContact.message }}
                                </div>
                            </div>

                            <!-- Contact Notes -->
                            <div class="detail-section notes-section">
                                <div class="notes-header">
                                    <h4><i class="fas fa-sticky-note"></i> Ghi chú ({{ contactNotes.length }})</h4>
                                    <button @click="openAddNoteForm" class="btn btn-sm btn-primary">
                                        <i class="fas fa-plus"></i>
                                        Thêm ghi chú
                                    </button>
                                </div>

                                <div v-if="loadingNotes" class="loading-notes">
                                    <i class="fas fa-spinner fa-spin"></i>
                                    Đang tải ghi chú...
                                </div>

                                <div v-else-if="contactNotes.length === 0" class="no-notes">
                                    <i class="fas fa-comment-slash"></i>
                                    <p>Chưa có ghi chú nào cho liên hệ này</p>
                                </div>

                                <div v-else class="notes-list">
                                    <div v-for="note in contactNotes" :key="note.id" class="note-item">
                                        <div class="note-header">
                                            <div class="note-author">
                                                <i class="fas fa-user-circle"></i>
                                                {{ note.user_name || 'Người dùng' }}
                                            </div>
                                            <div class="note-date">
                                                {{ formatDate(note.created_at) }}
                                            </div>
                                        </div>
                                        <div class="note-content">
                                            {{ note.note }}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button @click="handleCloseAllModals" class="btn btn-secondary">Đóng</button>
                        <button @click="handleOpenEditForm(detailContact)" class="btn btn-primary">
                            <i class="fas fa-edit"></i>
                            Chỉnh sửa
                        </button>
                    </div>
                </div>
            </div>

            <!-- Add Note Modal -->
            <div v-if="showAddNoteForm" class="modal-overlay">
                <div class="modal modal-note" @click.stop>
                    <div class="modal-header">
                        <h3>Thêm ghi chú cho liên hệ #{{ detailContact?.id }}</h3>
                        <button @click="handleCloseAllModals" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form @submit.prevent="handleAddNote" class="modal-body">
                        <div class="form-group">
                            <label for="note-content">Nội dung ghi chú <span class="required">*</span></label>
                            <textarea id="note-content" v-model="newNote" required
                                placeholder="Nhập nội dung ghi chú..." rows="5" />
                        </div>
                    </form>
                    <div class="modal-footer">
                        <button type="button" @click="handleCloseAllModals" class="btn btn-secondary">Hủy</button>
                        <button type="submit" @click="handleAddNote" :disabled="isAddingNote || !newNote.trim()"
                            class="btn btn-primary">
                            <i v-if="isAddingNote" class="fas fa-spinner fa-spin"></i>
                            <i v-else class="fas fa-save"></i>
                            {{ isAddingNote ? 'Đang lưu...' : 'Thêm ghi chú' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Edit Contact Modal -->
            <div v-if="showEditForm" class="modal-overlay">
                <div class="modal" @click.stop>
                    <div class="modal-header">
                        <h3>Chỉnh sửa liên hệ #{{ editForm.id }}</h3>
                        <button @click="handleCloseAllModals" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <form @submit.prevent="handleUpdateContact" class="modal-body">
                        <div class="form-group">
                            <label for="edit-name">Họ và tên <span class="required">*</span></label>
                            <input id="edit-name" v-model="editForm.name" type="text" required
                                placeholder="Nhập họ và tên" :class="{ 'input-error': validationErrors.name }"
                                @blur="validateField('name')" />
                            <div v-if="validationErrors.name" class="field-error">
                                {{ validationErrors.name }}
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="edit-email">Email <span class="required">*</span></label>
                            <input id="edit-email" v-model="editForm.email" type="email" required
                                placeholder="Nhập email" :class="{ 'input-error': validationErrors.email }"
                                @blur="validateField('email')" />
                            <div v-if="validationErrors.email" class="field-error">
                                {{ validationErrors.email }}
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="edit-phone">Số điện thoại</label>
                            <input id="edit-phone" v-model="editForm.phone" type="tel" placeholder="Nhập số điện thoại"
                                :class="{ 'input-error': validationErrors.phone }" @blur="validateField('phone')" />
                            <div v-if="validationErrors.phone" class="field-error">
                                {{ validationErrors.phone }}
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="edit-message">Tin nhắn</label>
                            <textarea id="edit-message" v-model="editForm.message"
                                placeholder="Nội dung tin nhắn của khách hàng..." rows="4" />
                        </div>

                        <div class="form-group">
                            <label for="edit-contact-method">Phương thức liên hệ</label>
                            <select id="edit-contact-method" v-model="editForm.contact_method">
                                <option value="email">Email</option>
                                <option value="phone">Điện thoại</option>
                                <option value="social">Mạng xã hội</option>
                            </select>
                        </div>

                        <div v-if="editForm.contact_method === 'social'" class="form-group">
                            <label for="edit-social-contact">Liên hệ mạng xã hội</label>
                            <input id="edit-social-contact" v-model="editForm.social_contact" type="text"
                                placeholder="VD: Facebook: @username, Zalo: 0123456789" />
                        </div>

                        <div class="form-group">
                            <label for="edit-status">Trạng thái</label>
                            <select id="edit-status" v-model="editForm.status">
                                <option value="new">Mới</option>
                                <option value="pending">Chờ phản hồi</option>
                                <option value="responded">Đã phản hồi</option>
                                <option value="closed">Đã đóng</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label for="edit-assigned-to">Phân công cho</label>
                            <select id="edit-assigned-to" v-model="editForm.assigned_to">
                                <option value="">Chưa phân công</option>
                                <option v-for="user in assignableUsers" :key="user.id" :value="user.id">
                                    {{ user.name }} ({{ user.role_name }})
                                </option>
                            </select>
                        </div>
                    </form>
                    <div class="modal-footer">
                        <button type="button" @click="handleCloseAllModals" class="btn btn-secondary">Hủy</button>
                        <button type="submit" @click="handleUpdateContact" :disabled="isUpdating"
                            class="btn btn-primary">
                            <i v-if="isUpdating" class="fas fa-spinner fa-spin"></i>
                            <i v-else class="fas fa-save"></i>
                            {{ isUpdating ? 'Đang cập nhật...' : 'Cập nhật liên hệ' }}
                        </button>
                    </div>
                </div>
            </div>

            <!-- Delete Confirmation Modal -->
            <div v-if="showDeleteConfirm" class="modal-overlay">
                <div class="modal modal-confirm" @click.stop>
                    <div class="modal-header">
                        <h3>Xác nhận xóa liên hệ</h3>
                        <button @click="handleCloseAllModals" class="btn-close">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                    <div class="modal-body">
                        <div class="confirm-content">
                            <i class="fas fa-exclamation-triangle"></i>
                            <h4>Bạn có chắc chắn muốn xóa liên hệ này?</h4>
                            <p>Liên hệ từ <strong>{{ contactToDelete?.name }}</strong> sẽ bị xóa vĩnh viễn.</p>
                            <p class="warning-text">Thao tác này không thể hoàn tác!</p>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button @click="handleCloseAllModals" class="btn btn-secondary">Hủy</button>
                        <button @click="handleDeleteContact" :disabled="isDeleting" class="btn btn-danger">
                            <i v-if="isDeleting" class="fas fa-spinner fa-spin"></i>
                            <i v-else class="fas fa-trash"></i>
                            {{ isDeleting ? 'Đang xóa...' : 'Xóa liên hệ' }}
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Toast Component -->
        <Toast />
    </div>
</template>

<script setup>
// Import composables and components
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useContactsAPI } from '~/composables/useContactsAPI'
import { useNotifications } from '~/composables/useNotifications'
import { useValidation } from '~/composables/useValidation'
import Toast from '~/components/Toast.vue'
import { ref, reactive, computed, onMounted, nextTick } from 'vue'
import * as XLSX from 'xlsx'

// ===========================================
// AUTHENTICATION & PERMISSIONS
// ===========================================

// Get current user with permissions
const {
    currentUser,
    loadingUser,
    hasRole,
    hasAnyRole,
    isSuperadmin,
    isAdmin,
    isManager,
    isConsultant,
    fetchCurrentUser
} = useCurrentUser()

// Check if user has permission for contacts management
const hasPermission = computed(() => {
    return !loadingUser.value && hasAnyRole([1, 2, 3, 5]) // Superadmin, Admin, Manager, Consultant
})

// Initialize user data on component mount
onMounted(async () => {
    await fetchCurrentUser()
    // Debug log user info và quyền
    console.log('[contacts.vue] Debug currentUser:', currentUser.value)
    console.log('[contacts.vue] Debug loadingUser:', loadingUser.value)
    console.log('[contacts.vue] Debug hasAnyRole([1,2,3,5]):', hasAnyRole([1, 2, 3, 5]))
    console.log('[contacts.vue] Debug hasPermission:', hasPermission.value)
    if (hasPermission.value) {
        await fetchContacts()
        await fetchContactStats()
        await fetchAssignableUsers()
    }
})

// ===========================================
// CONTACTS API & DATA MANAGEMENT
// ===========================================
// Use the contacts API composable
const {
    contacts,
    assignableUsers,
    contactNotes,
    loading,
    loadingNotes,
    error,
    stats,
    editingContact,
    detailContact,
    showDetailModal,
    showEditForm,
    showDeleteConfirm,
    contactToDelete,
    editForm,
    // Search and Filter
    searchQuery,
    selectedMethodFilter,
    selectedStatusFilter,

    // Sort
    sortColumn,
    sortDirection,

    // Pagination
    currentPage,
    itemsPerPage,
    itemsPerPageOptions,
    filteredContacts,
    paginatedContacts,
    totalPages,
    // Methods
    fetchContacts,
    fetchAssignableUsers,
    fetchContactStats,
    fetchContactNotes,
    updateContact,
    deleteContact,
    addContactNote,
    resetEditForm,
    openDetailModal,
    openEditForm,
    openDeleteConfirm,
    closeAllModals,
    // Search and Filter Methods
    setSearchQuery,
    setMethodFilter,
    setStatusFilter,
    handleSort,
    setItemsPerPage,
    goToPage,
    // Helpers
    getStatusDisplayName,
    getStatusBadgeColor,
    getMethodDisplayName,
    getMethodBadgeColor,
    getMethodIcon
} = useContactsAPI()

// ===========================================
// NOTIFICATION SYSTEM
// ===========================================

// Use notification composable
const {
    notification,
    showSuccess,
    showError,
    showWarning,
    hideNotification
} = useNotifications()

// ===========================================
// FORM VALIDATION & STATES
// ===========================================

// Export to Excel state
const exportingExcel = ref(false)

// Use validation composable
const {
    validateEmail,
    validatePhone,
    validateRequired,
    normalizePhoneNumber,
    parseBackendValidationError
} = useValidation()

// Email validation
const isEditEmailValid = ref(false)

// Phone validation
const isEditPhoneValid = ref(false)

// Validation errors
const validationErrors = reactive({
    name: '',
    email: '',
    phone: '',
    message: '',
    contact_method: '',
    social_contact: '',
    assigned_to: ''
})

// Edit form validation errors
const editValidationErrors = reactive({
    name: '',
    email: '',
    phone: '',
})

// Edit email validation function
const checkEditEmailValidation = () => {
    const emailValidation = validateEmail(editForm.email)
    isEditEmailValid.value = emailValidation.isValid

    // Clear email error if valid
    if (isEditEmailValid.value) {
        editValidationErrors.email = ''
    }
}

// Edit phone validation function
const checkEditPhoneValidation = async () => {
    editPhoneCheckingDuplicate.value = true

    try {
        const phoneValidation = await validatePhone(editForm.phone, users.value, editingUser.value?.id)
        isEditPhoneValid.value = phoneValidation.isValid

        if (!phoneValidation.isValid) {
            editValidationErrors.phone = phoneValidation.message
        } else {
            editValidationErrors.phone = ''
        }
    } catch (error) {
        console.error('Error during edit phone validation:', error)
        isEditPhoneValid.value = false
        editValidationErrors.phone = 'Lỗi khi kiểm tra số điện thoại'
    } finally {
        editPhoneCheckingDuplicate.value = false
    }
}

// Set backend validation errors to form fields
const setBackendValidationErrors = (errors, isEditForm = false) => {
    const errorObj = isEditForm ? editValidationErrors : validationErrors

    // Clear existing errors first
    Object.keys(errorObj).forEach(key => {
        errorObj[key] = ''
    })

    // Set new errors (already translated by parseBackendValidationError)
    Object.keys(errors).forEach(field => {
        if (field === '_general') {
            // Show general error as notification
            showError(errors[field])
        } else if (errorObj.hasOwnProperty(field)) {
            errorObj[field] = errors[field] // No translation needed, already done by composable

            // Reset validation states when backend returns field errors

            if (field === 'email') {
                isEditEmailValid.value = false
            }
            if (field === 'phone') {
                isEditPhoneValid.value = false
            }
        }
    })
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
            email: 'Email',
            phone: 'Số điện thoại',
            message: 'Tin nhắn',
            contact_method: 'Phương thức liên hệ',
            social_contact: 'Liên hệ xã hội',
            assigned_to: 'Người được giao'
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

    return true
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

// Check if edit form is valid
const isEditFormValid = computed(() => {
    // Check if all required fields are filled (phone is optional)
    const hasAllFields = editForm.name &&
        editForm.email &&
        (editForm.phone || !editForm.phone)

    // Check if no validation errors
    const hasNoErrors = !editValidationErrors.name &&
        !editValidationErrors.email &&
        !editValidationErrors.phone

    // Check email validation and phone validation (if provided)
    const emailValid = isEditEmailValid.value
    const phoneValid = editForm.phone ? isEditPhoneValid.value : true // Phone is optional

    return hasAllFields && hasNoErrors && emailValid && phoneValid
})

// ===========================================
// EVENT HANDLERS
// ===========================================

const handleUpdateUser = async () => {
    // Validate form first
    const isValid = await validateEditForm()
    if (!isValid) {
        showError('Vui lòng sửa các lỗi trong form')
        return
    }

    const result = await updateContact()

    if (result.success) {
        showSuccess(result.message || 'Cập nhật liên hệ thành công!')
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
                showError('Cập nhật liên hệ thất bại, xin hãy kiểm tra lại thông tin')
            } else {
                // Show general error
                showError(backendErrors._general || result.message || 'Có lỗi xảy ra khi cập nhật liên hệ')
            }
        } catch (error) {
            console.error('Error parsing backend validation:', error)
            showError(result.message || 'Có lỗi xảy ra khi cập nhật liên hệ')
        }
    }
}

const handleDeleteContact = async () => {
    if (!contactToDelete.value) return

    const result = await deleteContact(contactToDelete.value.id)

    if (result.success) {
        showSuccess(result.message || 'Xóa liên hệ thành công!')
    } else {
        showError(result.message || 'Có lỗi xảy ra khi xóa liên hệ')
    }
}

// Override closeAllModals to reset password strength
const handleCloseAllModals = () => {
    closeAllModals()
    // Reset email validation
    isEditEmailValid.value = false

    // Reset phone validation
    isEditPhoneValid.value = false

    // Clear validation errors
    Object.keys(validationErrors).forEach(key => {
        validationErrors[key] = ''
    })
    Object.keys(editValidationErrors).forEach(key => {
        editValidationErrors[key] = ''
    })
}

// Override openEditForm to set email validation
const handleOpenEditForm = (contact) => {
    openEditForm(contact)

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

// ===========================================
// EXCEL EXPORT FUNCTIONALITY
// ===========================================

const exportToExcel = async () => {
    if (filteredContacts.value.length === 0) {
        showWarning('Không có dữ liệu để xuất')
        return
    }

    exportingExcel.value = true

    try {
        // Prepare data for export
        const exportData = filteredContacts.value.map((contact, index) => ({
            'STT': index + 1,
            'ID': contact.id,
            'Họ và tên': contact.name,
            'Email': contact.email,
            'Số điện thoại': contact.phone || '',
            'Tin nhắn': contact.message || '',
            'Trạng thái': getStatusDisplayName(contact.status),
            'Phương thức liên hệ': getMethodDisplayName(contact.contact_method),
            'Liên hệ khác': contact.social_contact || '',
            'Được phân công': contact.assigned_to_name || 'Chưa phân công',
            'Ngày tạo': formatDate(contact.created_at),
            'Lần liên hệ đầu': formatDate(contact.first_contacted_at),
            'Ngày đóng': formatDate(contact.closed_at)
        }))

        // Create workbook
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(exportData)

        // Set column widths
        const colWidths = [
            { wch: 5 },   // STT
            { wch: 8 },   // ID
            { wch: 25 },  // Họ và tên
            { wch: 30 },  // Email
            { wch: 15 },  // Số điện thoại
            { wch: 100 },  // Tin nhắn
            { wch: 12 },  // Trạng thái
            { wch: 20 },  // Phương thức liên hệ
            { wch: 20 },  // Liên hệ khác
            { wch: 20 },  // Được phân công
            { wch: 12 },  // Ngày tạo
            { wch: 12 },  // Lần liên hệ đầu
            { wch: 12 }   // Ngày đóng
        ]
        ws['!cols'] = colWidths

        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(wb, ws, 'Danh sách liên hệ')

        // Generate filename with current date
        const now = new Date()
        const dateStr = now.toISOString().split('T')[0] // YYYY-MM-DD format
        const timeStr = now.toTimeString().split(' ')[0].replace(/:/g, '') // HHMMSS format
        const filename = `danh-sach-lien-he_${dateStr}_${timeStr}.xlsx`

        // Export file
        XLSX.writeFile(wb, filename)

        showSuccess(`Đã xuất ${filteredContacts.value.length} liên hệ ra file Excel thành công!`)
    } catch (error) {
        console.error('Export error:', error)
        showError('Có lỗi xảy ra khi xuất file Excel')
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

// ===========================================
// PAGE CONFIGURATION
// ===========================================

definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
})
// ===========================================
// end of page configuration
// ===========================================

// Modal states
// const showDetailModal = ref(false)
// const selectedContact = ref(null)
// const showEditForm = ref(false)
const showAddNoteForm = ref(false)
// const showDeleteConfirm = ref(false)
// const contactToDelete = ref(null)

// Form states
// const isUpdating = ref(false)
// const isAddingNote = ref(false)
// const isDeleting = ref(false)
// const newNote = ref('')

// Edit form
// const editForm = reactive({
//     id: null,
//     name: '',
//     email: '',
//     phone: '',
//     message: '',
//     contact_method: '',
//     social_contact: '',
//     assigned_to: '',
//     status: 'new'
// })

// Search and Filter

// Sort


// Export state
// const exportingExcel = ref(false)

// ===========================================
// NOTIFICATION SYSTEM
// ===========================================

// Use notification composable
// const {
//     notification,
//     showSuccess,
//     showError,
//     showWarning,
//     hideNotification
// } = useNotifications()

// ===========================================
// FORM VALIDATION
// ===========================================

// Use validation composable
// const {
//     validateEmail,
//     validatePhone,
//     validateRequired
// } = useValidation()

// Validation errors
// const validationErrors = reactive({
//     name: '',
//     email: '',
//     phone: '',
//     message: '',
//     contact_method: '',
//     social_contact: '',
//     assigned_to: ''
// })


// Import composable
// import { useContactsAPI } from '~/composables/useContactsAPI'

// Contacts API state & methods
// const {
//     contacts,
//     stats,
//     assignableUsers,
//     contactNotes,
//     loading,
//     loadingNotes,
//     error,
//     fetchContacts,
//     fetchContactStats,
//     fetchAssignableUsers,
//     fetchContactNotes,
//     updateContact,
//     deleteContact,
//     addContactNote
// } = useContactsAPI()

// ===========================================
// COMPUTED PROPERTIES
// ===========================================

// Filtered contacts
// const filteredContacts = computed(() => {
//     let filtered = [...contacts.value]

//     // Search filter
//     if (searchQuery.value) {
//         const query = searchQuery.value.toLowerCase()
//         filtered = filtered.filter(contact =>
//             contact.name?.toLowerCase().includes(query) ||
//             contact.email?.toLowerCase().includes(query) ||
//             contact.phone?.toLowerCase().includes(query) ||
//             contact.message?.toLowerCase().includes(query)
//         )
//     }

//     // Status filter
//     if (selectedStatusFilter.value) {
//         filtered = filtered.filter(contact => contact.status === selectedStatusFilter.value)
//     }

//     // Contact method filter
//     if (selectedMethodFilter.value) {
//         filtered = filtered.filter(contact => contact.contact_method === selectedMethodFilter.value)
//     }

//     // Sort
//     if (sortColumn.value) {
//         filtered.sort((a, b) => {
//             let aVal = a[sortColumn.value]
//             let bVal = b[sortColumn.value]

//             // Handle null values
//             if (aVal === null || aVal === undefined) aVal = ''
//             if (bVal === null || bVal === undefined) bVal = ''

//             // String comparison
//             if (typeof aVal === 'string') {
//                 aVal = aVal.toLowerCase()
//                 bVal = bVal.toLowerCase()
//             }

//             if (sortDirection.value === 'asc') {
//                 return aVal > bVal ? 1 : -1
//             } else {
//                 return aVal < bVal ? 1 : -1
//             }
//         })
//     }

//     return filtered
// })

// Paginated contacts
// const paginatedContacts = computed(() => {
//     const start = (currentPage.value - 1) * itemsPerPage.value
//     const end = start + itemsPerPage.value
//     return filteredContacts.value.slice(start, end)
// })

// Total pages
// const totalPages = computed(() => {
//     return Math.ceil(filteredContacts.value.length / itemsPerPage.value)
// })

// ===========================================
// EVENT HANDLERS
// ===========================================



// const handleCloseAllModals = () => {
//     showEditForm.value = false
//     showDetailModal.value = false
//     showAddNoteForm.value = false
//     closeEditForm()
// }

// Handle contact details
const handleOpenViewDetail = async (contact) => {
    openDetailModal(contact)
    // selectedContact.value = contact
    // showDetailModal.value = true
    // await fetchContactNotes(contact.id)
}

const closeDetailModal = () => {
    showDetailModal.value = false
    detailContact.value = null
    contactNotes.value = []
}

// Handle notes
const handleOpenNotes = async (contact) => {
    detailContact.value = contact
    await fetchContactNotes(contact.id)
    showDetailModal.value = true
}

const openAddNoteForm = () => {
    newNote.value = ''
    showAddNoteForm.value = true
}

const closeAddNoteForm = () => {
    showAddNoteForm.value = false
    newNote.value = ''
}

const handleAddNote = async () => {
    await addContactNote()
}

// Handle delete
// const openDeleteConfirm = (contact) => {
//     contactToDelete.value = contact
//     showDeleteConfirm.value = true
// }

const closeDeleteConfirm = () => {
    showDeleteConfirm.value = false
    contactToDelete.value = null
}

// const handleDeleteContact = async () => {
//     await deleteContact()
// }

// Handle edit contact
// const handleOpenEditForm = (contact) => {
//     Object.assign(editForm, {
//         id: contact.id,
//         name: contact.name || '',
//         email: contact.email || '',
//         phone: contact.phone || '',
//         message: contact.message || '',
//         contact_method: contact.contact_method || 'email',
//         social_contact: contact.social_contact || '',
//         assigned_to: contact.assigned_to || '',
//         status: contact.status || 'new'
//     })
//     showEditForm.value = true
// }

const handleUpdateContact = async () => {
    try {
        isUpdating.value = true

        const response = await $fetch(`/api/contacts/${editForm.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${useCookie('token').value}`
            },
            body: {
                name: editForm.name,
                email: editForm.email,
                phone: editForm.phone,
                message: editForm.message,
                contact_method: editForm.contact_method,
                social_contact: editForm.social_contact,
                assigned_to: editForm.assigned_to,
                status: editForm.status
            }
        })

        if (response.success) {
            showSuccess('Cập nhật liên hệ thành công')
            await fetchContacts()
            await fetchContactStats()
            showEditForm.value = false
        } else {
            showError(response.message || 'Cập nhật liên hệ thất bại')
        }
    } catch (err) {
        console.error('Update contact error:', err)
        showError(err.data?.message || 'Cập nhật liên hệ thất bại')
    } finally {
        isUpdating.value = false
    }
}

const closeEditForm = () => {
    showEditForm.value = false
    Object.keys(editForm).forEach(key => {
        editForm[key] = key === 'contact_method' ? 'email' : ''
    })
}

// Handle status change
const handleStatusChange = async (contact) => {
    const nextStatus = getNextStatus(contact.status)

    try {
        const response = await $fetch(`/api/contacts/${contact.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${useCookie('token').value}`
            },
            body: {
                status: nextStatus
            }
        })

        if (response.success) {
            showSuccess(`Cập nhật trạng thái thành "${getStatusDisplayName(nextStatus)}" thành công`)
            await fetchContacts()
            await fetchContactStats()
        } else {
            showError(response.message || 'Cập nhật trạng thái thất bại')
        }
    } catch (err) {
        console.error('Update status error:', err)
        showError(err.data?.message || 'Cập nhật trạng thái thất bại')
    }
}

// Get next status in cycle
const getNextStatus = (currentStatus) => {
    const statusCycle = ['new', 'pending', 'responded', 'closed']
    const currentIndex = statusCycle.indexOf(currentStatus)
    const nextIndex = (currentIndex + 1) % statusCycle.length
    return statusCycle[nextIndex]
}

// Handle assignment
const handleAssignment = async (contact, userId) => {
    if (!userId) return

    try {
        const response = await $fetch(`/api/contacts/${contact.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${useCookie('token').value}`
            },
            body: {
                assigned_to: userId
            }
        })

        if (response.success) {
            const assignedUser = assignableUsers.value.find(u => u.id === parseInt(userId))
            showSuccess(`Phân công liên hệ cho ${assignedUser?.name} thành công`)
            await fetchContacts()
            await fetchContactStats()
        } else {
            showError(response.message || 'Phân công liên hệ thất bại')
        }
    } catch (err) {
        console.error('Assign contact error:', err)
        showError(err.data?.message || 'Phân công liên hệ thất bại')
    }
}

// Handle unassignment
const handleUnassign = async (contact) => {
    try {
        const response = await $fetch(`/api/contacts/${contact.id}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${useCookie('token').value}`
            },
            body: {
                assigned_to: null
            }
        })

        if (response.success) {
            showSuccess('Bỏ phân công liên hệ thành công')
            await fetchContacts()
            await fetchContactStats()
        } else {
            showError(response.message || 'Bỏ phân công thất bại')
        }
    } catch (err) {
        console.error('Unassign contact error:', err)
        showError(err.data?.message || 'Bỏ phân công thất bại')
    }
}

// Search and filter handlers
// const setSearchQuery = (query) => {
//     searchQuery.value = query
//     currentPage.value = 1
// }

// const setStatusFilter = (status) => {
//     selectedStatusFilter.value = status
//     currentPage.value = 1
// }

// const setMethodFilter = (method) => {
//     selectedMethodFilter.value = method
//     currentPage.value = 1
// }

// Sort handler
// const handleSort = (column) => {
//     if (sortColumn.value === column) {
//         sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
//     } else {
//         sortColumn.value = column
//         sortDirection.value = 'asc'
//     }
// }

// Pagination handlers
// const setItemsPerPage = (items) => {
//     itemsPerPage.value = items
//     currentPage.value = 1
// }

// const goToPage = (page) => {
//     currentPage.value = page
// }

// const getVisiblePages = () => {
//     const total = totalPages.value
//     const current = currentPage.value
//     const delta = 2
//     const range = []
//     const rangeWithDots = []

//     for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
//         range.push(i)
//     }

//     if (current - delta > 2) {
//         rangeWithDots.push(1, '...')
//     } else {
//         rangeWithDots.push(1)
//     }

//     rangeWithDots.push(...range)

//     if (current + delta < total - 1) {
//         rangeWithDots.push('...', total)
//     } else {
//         if (total > 1) rangeWithDots.push(total)
//     }

//     return rangeWithDots
// }

// ===========================================
// UTILITY FUNCTIONS
// ===========================================

// Format date
// const formatDate = (dateString) => {
//     if (!dateString) return '-'
//     const date = new Date(dateString)
//     return date.toLocaleDateString('vi-VN', {
//         year: 'numeric',
//         month: '2-digit',
//         day: '2-digit',
//         hour: '2-digit',
//         minute: '2-digit'
//     })
// }

// Truncate message
const truncateMessage = (message, maxLength = 100) => {
    if (!message) return '-'
    if (message.length <= maxLength) return message
    return message.substring(0, maxLength) + '...'
}

// Status helpers
// const getStatusDisplayName = (status) => {
//     const statusMap = {
//         'new': 'Mới',
//         'pending': 'Chờ phản hồi',
//         'responded': 'Đã phản hồi',
//         'closed': 'Đã đóng'
//     }
//     return statusMap[status] || status
// }

const getStatusIcon = (status) => {
    const iconMap = {
        'new': 'fas fa-envelope',
        'pending': 'fas fa-clock',
        'responded': 'fas fa-check-circle',
        'closed': 'fas fa-times-circle'
    }
    return iconMap[status] || 'fas fa-question-circle'
}

// const getStatusBadgeColor = (status) => {
//     const colorMap = {
//         'new': 'status-new',
//         'pending': 'status-pending',
//         'responded': 'status-responded',
//         'closed': 'status-closed'
//     }
//     return colorMap[status] || 'status-default'
// }

// Method helpers
// const getMethodDisplayName = (method) => {
//     const methodMap = {
//         'email': 'Email',
//         'phone': 'Điện thoại',
//         'social': 'Mạng xã hội'
//     }
//     return methodMap[method] || method
// }

// const getMethodIcon = (method) => {
//     const iconMap = {
//         'email': 'fas fa-envelope',
//         'phone': 'fas fa-phone',
//         'social': 'fas fa-share-alt'
//     }
//     return iconMap[method] || 'fas fa-question-circle'
// }

// const getMethodBadgeColor = (method) => {
//     const colorMap = {
//         'email': 'method-email',
//         'phone': 'method-phone',
//         'social': 'method-social'
//     }
//     return colorMap[method] || 'method-default'
// }

// Permission checks
const canDeleteContact = (contact) => {
    // Only Superadmin, Admin, Manager can delete
    return hasAnyRole([1, 2, 3])
}

// Form validation
const validateField = (fieldName) => {
    validationErrors[fieldName] = ''

    switch (fieldName) {
        case 'name':
            validationErrors.name = 'Họ và tên là bắt buộc'
            break
        case 'email':
            validationErrors.email = 'Email không hợp lệ'
            break
        case 'phone':
            validationErrors.phone = 'Số điện thoại không hợp lệ'
            break
    }
}

// const validateEditForm = () => {
//     // Validate edit form using the same validation logic
    
//     return !Object.values(validationErrors).some(error => error !== '')
// }

// Export to Excel
// const exportToExcel = async () => {
//     try {
//         exportingExcel.value = true

//         // Prepare data for export
//         const exportData = filteredContacts.value.map(contact => ({
//             'ID': contact.id,
//             'Họ và tên': contact.name,
//             'Email': contact.email,
//             'Số điện thoại': contact.phone || '',
//             'Tin nhắn': contact.message || '',
//             'Trạng thái': getStatusDisplayName(contact.status),
//             'Phương thức liên hệ': getMethodDisplayName(contact.contact_method),
//             'Liên hệ khác': contact.social_contact || '',
//             'Được phân công': contact.assigned_to_name || 'Chưa phân công',
//             'Ngày tạo': formatDate(contact.created_at),
//             'Lần liên hệ đầu': formatDate(contact.first_contacted_at),
//             'Ngày đóng': formatDate(contact.closed_at)
//         }))

//         // Create workbook and worksheet
//         const wb = XLSX.utils.book_new()
//         const ws = XLSX.utils.json_to_sheet(exportData)

//         // Auto-size columns
//         const colWidths = []
//         Object.keys(exportData[0] || {}).forEach((key, i) => {
//             const maxWidth = Math.max(
//                 key.length,
//                 ...exportData.map(row => String(row[key] || '').length)
//             )
//             colWidths[i] = { wch: Math.min(maxWidth + 2, 50) }
//         })
//         ws['!cols'] = colWidths

//         // Add worksheet to workbook
//         XLSX.utils.book_append_sheet(wb, ws, 'Liên hệ')

//         // Generate filename with current date
//         const now = new Date()
//         const dateStr = now.toISOString().split('T')[0]
//         const filename = `lien-he-${dateStr}.xlsx`

//         // Save file
//         XLSX.writeFile(wb, filename)

//         showSuccess(`Đã xuất ${filteredContacts.value.length} liên hệ ra file Excel`)

//     } catch (error) {
//         console.error('Export error:', error)
//         showError('Lỗi khi xuất file Excel')
//     } finally {
//         exportingExcel.value = false
//     }
// }

// Meta tags
// definePageMeta({
//     layout: "admin",
//     // middleware: ["auth", "permission"], // Tạm thời bỏ để test redirect
//     ssr: false
// })
</script>

<style scoped>
/* Contact Management Styles */
.contacts-page {
    padding: 0;
}

/* Permission Check Styles */
.permission-check {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 60vh;
}

.loading-permission,
.permission-denied {
    text-align: center;
    padding: 2rem;
}

.loading-permission i {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.permission-denied {
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 500px;
}

.permission-denied i {
    font-size: 3rem;
    color: var(--warning-color);
    margin-bottom: 1rem;
}

.permission-denied h3 {
    color: var(--text-dark);
    margin-bottom: 0.5rem;
}

.permission-denied p {
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

/* Page Header */
.page-header {
    background: white;
    padding: 2rem;
    border-radius: 12px;
    margin-bottom: 1.5rem;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.header-content h1 {
    color: var(--text-dark);
    margin: 0 0 0.5rem 0;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.header-content h1 i {
    color: var(--primary-color);
}

.header-content p {
    color: var(--text-muted);
    margin: 0;
}

.header-actions .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Stats Section */
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
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
    transition: transform 0.2s ease;
}

.stat-card:hover {
    transform: translateY(-2px);
}

.stat-card i {
    font-size: 2rem;
    padding: 1rem;
    border-radius: 50%;
    color: white;
}

.stat-card.total i {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.stat-card.new i {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
}

.stat-card.pending i {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
}

.stat-card.responded i {
    background: linear-gradient(135deg, #4ecdc4 0%, #44a08d 100%);
}

.stat-card.closed i {
    background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
    color: var(--text-dark) !important;
}

.stat-card.assigned i {
    background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
    color: var(--text-dark) !important;
}

.stat-card.unassigned i {
    background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
    color: var(--text-dark) !important;
}

.stat-info h3 {
    font-size: 0.875rem;
    color: var(--text-muted);
    margin: 0 0 0.25rem 0;
    font-weight: 500;
}

.stat-info span {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--text-dark);
}

/* Table Section */
.table-section {
    background: white;
    border-radius: 12px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.table-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.table-header h2 {
    margin: 0;
    color: var(--text-dark);
    font-size: 1.25rem;
}

.table-actions {
    display: flex;
    gap: 0.75rem;
}

.table-actions .btn {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

/* Table Controls */
.table-controls {
    padding: 1rem 1.5rem;
    border-bottom: 1px solid var(--border-color);
    background: #f8f9fa;
}

.controls-row {
    display: flex;
    gap: 1rem;
    align-items: center;
    flex-wrap: wrap;
}

.search-box {
    position: relative;
    flex: 1;
    min-width: 250px;
}

.search-box i {
    position: absolute;
    left: 1rem;
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
}

.search-input {
    width: 100%;
    padding: 0.75rem 1rem 0.75rem 3rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    background: white;
}

.clear-search {
    position: absolute;
    right: 0.5rem;
    top: 50%;
    transform: translateY(-50%);
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: 0.25rem;
}

.filter-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.filter-group label {
    font-size: 0.875rem;
    color: var(--text-muted);
    font-weight: 500;
}

.filter-select {
    padding: 0.5rem;
    border: 1px solid var(--border-color);
    border-radius: 6px;
    background: white;
    min-width: 120px;
}

/* Loading & Error States */
.loading-state,
.error-state {
    padding: 3rem;
    text-align: center;
}

.loading-state i {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
}

.error-state i {
    font-size: 2rem;
    color: var(--danger-color);
    margin-bottom: 1rem;
}

/* Contacts Table */
.table-container {
    overflow-x: auto;
}

.contacts-table {
    width: 100%;
    border-collapse: collapse;
}

.contacts-table th {
    background: #f8f9fa;
    padding: 1rem;
    text-align: left;
    font-weight: 600;
    color: var(--text-dark);
    border-bottom: 2px solid var(--border-color);
    position: relative;
}

.contacts-table th.sortable {
    cursor: pointer;
    user-select: none;
    transition: background-color 0.2s ease;
}

.contacts-table th.sortable:hover {
    background: #e9ecef;
}

.contacts-table th.sortable i {
    margin-left: 0.5rem;
    opacity: 0.5;
}

.contacts-table th.sort-asc i::before {
    content: "\f0de";
    opacity: 1;
}

.contacts-table th.sort-desc i::before {
    content: "\f0dd";
    opacity: 1;
}

.contacts-table td {
    padding: 1rem;
    border-bottom: 1px solid var(--border-color);
    vertical-align: top;
}

.contact-row:hover {
    background: #f8f9fa;
}

.contact-id {
    font-weight: 600;
    color: var(--primary-color);
}

.contact-info {
    min-width: 250px;
}

.contact-details {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
}

.contact-name {
    font-weight: 600;
    color: var(--text-dark);
}

.contact-email {
    color: var(--text-muted);
    font-size: 0.875rem;
}

.contact-phone {
    color: var(--text-muted);
    font-size: 0.875rem;
}

.contact-message {
    color: var(--text-muted);
    font-size: 0.875rem;
    font-style: italic;
    margin-top: 0.25rem;
}

/* Status & Method Badges */
.status-badge,
.method-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    border-radius: 20px;
    font-size: 0.875rem;
    font-weight: 500;
    border: none;
    cursor: pointer;
    transition: transform 0.1s ease;
}

.status-badge:hover {
    transform: scale(1.02);
}

.status-new {
    background: #e3f2fd;
    color: #1565c0;
}

.status-pending {
    background: #fff3e0;
    color: #e65100;
}

.status-responded {
    background: #e8f5e8;
    color: #2e7d32;
}

.status-closed {
    background: #fce4ec;
    color: #ad1457;
}

.method-email {
    background: #e8eaf6;
    color: #3f51b5;
}

.method-phone {
    background: #e0f2f1;
    color: #00695c;
}

.method-social {
    background: #f3e5f5;
    color: #7b1fa2;
}

/* Assignment */
.assigned-info {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--text-dark);
    font-size: 0.875rem;
}

.assigned-info i {
    color: var(--success-color);
}

.btn-assign,
.assign-select {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.5rem 0.75rem;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: 6px;
    font-size: 0.875rem;
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.btn-assign:hover,
.assign-select:hover {
    background: var(--primary-dark);
}

.assign-select {
    background: white;
    color: var(--text-dark);
    border: 1px solid var(--border-color);
    min-width: 160px;
}

.assign-select:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.btn-unassign {
    margin-left: 0.5rem;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: none;
    background: var(--danger-color);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    transition: background-color 0.2s ease;
}

.btn-unassign:hover {
    background: #c82333;
}

/* Actions */
.contact-actions {
    display: flex;
    gap: 0.5rem;
}

.btn-action {
    width: 36px;
    height: 36px;
    border-radius: 6px;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.1s ease, background-color 0.2s ease;
}

.btn-action:hover {
    transform: scale(1.1);
}

.btn-view {
    background: #e3f2fd;
    color: #1976d2;
}

.btn-view:hover {
    background: #bbdefb;
}

.btn-edit {
    background: #fff3e0;
    color: #f57c00;
}

.btn-edit:hover {
    background: #ffe0b2;
}

.btn-notes {
    background: #f3e5f5;
    color: #7b1fa2;
}

.btn-notes:hover {
    background: #e1bee7;
}

.btn-delete {
    background: #ffebee;
    color: #d32f2f;
}

.btn-delete:hover {
    background: #ffcdd2;
}

/* Empty State */
.empty-state {
    padding: 3rem;
    text-align: center;
    color: var(--text-muted);
}

.empty-state i {
    font-size: 3rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.empty-state h3 {
    margin-bottom: 0.5rem;
    color: var(--text-dark);
}

/* Pagination */
.pagination {
    padding: 1rem 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid var(--border-color);
}

.pagination-info {
    color: var(--text-muted);
    font-size: 0.875rem;
}

.pagination-controls {
    display: flex;
    gap: 0.25rem;
}

.btn-page {
    width: 36px;
    height: 36px;
    border: 1px solid var(--border-color);
    background: white;
    color: var(--text-muted);
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
    font-size: 0.875rem;
}

.btn-page:hover:not(:disabled) {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.btn-page:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-page-active {
    background: var(--primary-color);
    color: white;
    border-color: var(--primary-color);
}

.btn-page-dots {
    border: none !important;
    cursor: default !important;
}

/* Modal Styles */
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
    padding: 1rem;
}

.modal {
    background: white;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
    width: 100%;
    max-width: 600px;
    max-height: 90vh;
    overflow-y: auto;
}

.modal-large {
    max-width: 900px;
}

.modal-note {
    max-width: 500px;
}

.modal-confirm {
    max-width: 450px;
}

.modal-header {
    padding: 1.5rem;
    border-bottom: 1px solid var(--border-color);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.modal-header h3 {
    margin: 0;
    color: var(--text-dark);
}

.btn-close {
    width: 36px;
    height: 36px;
    border: none;
    background: #f5f5f5;
    border-radius: 6px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
}

.btn-close:hover {
    background: #e0e0e0;
}

.modal-body {
    padding: 1.5rem;
}

.modal-footer {
    padding: 1.5rem;
    border-top: 1px solid var(--border-color);
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
}

/* Form Styles */
.form-group {
    margin-bottom: 1.5rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: var(--text-dark);
}

.required {
    color: var(--danger-color);
}

.form-group input,
.form-group select,
.form-group textarea {
    width: 100%;
    padding: 0.75rem;
    border: 1px solid var(--border-color);
    border-radius: 8px;
    font-size: 0.875rem;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
}

.input-error {
    border-color: var(--danger-color) !important;
}

.field-error {
    color: var(--danger-color);
    font-size: 0.875rem;
    margin-top: 0.25rem;
}

/* Contact Detail Styles */
.contact-detail {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
}

.detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
}

.detail-section {
    border: 1px solid var(--border-color);
    border-radius: 8px;
    padding: 1rem;
}

.detail-section h4 {
    margin: 0 0 1rem 0;
    color: var(--text-dark);
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.detail-item {
    display: flex;
    margin-bottom: 0.75rem;
}

.detail-item:last-child {
    margin-bottom: 0;
}

.detail-item label {
    font-weight: 500;
    color: var(--text-muted);
    min-width: 120px;
    margin: 0;
}

.detail-item span {
    color: var(--text-dark);
}

.message-section {
    grid-column: 1 / -1;
}

.message-content {
    background: #f8f9fa;
    padding: 1rem;
    border-radius: 8px;
    color: var(--text-dark);
    line-height: 1.5;
}

/* Notes Section */
.notes-section {
    grid-column: 1 / -1;
}

.notes-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
}

.notes-header h4 {
    margin: 0;
}

.loading-notes {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
}

.no-notes {
    text-align: center;
    padding: 2rem;
    color: var(--text-muted);
}

.no-notes i {
    font-size: 2rem;
    margin-bottom: 0.5rem;
    opacity: 0.5;
}

.notes-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.note-item {
    background: #f8f9fa;
    border-radius: 8px;
    padding: 1rem;
}

.note-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 0.5rem;
}

.note-author {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    font-weight: 500;
    color: var(--text-dark);
}

.note-date {
    font-size: 0.875rem;
    color: var(--text-muted);
}

.note-content {
    color: var(--text-dark);
    line-height: 1.5;
}

/* Confirm Modal */
.confirm-content {
    text-align: center;
    padding: 1rem;
}

.confirm-content i {
    font-size: 3rem;
    color: var(--warning-color);
    margin-bottom: 1rem;
}

.confirm-content h4 {
    color: var(--text-dark);
    margin-bottom: 1rem;
}

.confirm-content p {
    color: var(--text-muted);
    margin-bottom: 0.5rem;
}

.warning-text {
    color: var(--danger-color) !important;
    font-weight: 500;
}

/* Buttons */
.btn {
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 8px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    text-decoration: none;
}

.btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
}

.btn-primary {
    background: var(--primary-color);
    color: white;
}

.btn-primary:hover {
    background: var(--primary-dark);
}

.btn-secondary {
    background: #6c757d;
    color: white;
}

.btn-secondary:hover {
    background: #545b62;
}

.btn-success {
    background: var(--success-color);
    color: white;
}

.btn-success:hover {
    background: #218838;
}

.btn-danger {
    background: var(--danger-color);
    color: white;
}

.btn-danger:hover {
    background: #c82333;
}

.btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
}

/* Responsive Design */
@media (max-width: 768px) {
    .page-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .stats-grid {
        grid-template-columns: 1fr;
    }

    .controls-row {
        flex-direction: column;
        align-items: stretch;
    }

    .search-box {
        min-width: auto;
    }

    .detail-grid {
        grid-template-columns: 1fr;
    }

    .table-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 1rem;
    }

    .table-actions {
        width: 100%;
        justify-content: space-between;
    }

    .pagination {
        flex-direction: column;
        gap: 1rem;
        text-align: center;
    }

    .modal {
        margin: 1rem;
        max-width: none;
    }
}

@media (max-width: 480px) {
    .contacts-table {
        font-size: 0.875rem;
    }

    .contacts-table th,
    .contacts-table td {
        padding: 0.75rem 0.5rem;
    }

    .contact-actions {
        flex-direction: column;
    }

    .btn-action {
        width: 32px;
        height: 32px;
    }
}

/* 
.page-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 2px solid #eee;
}

.page-header h1 {
    color: #333;
    margin-bottom: 0.5rem;
    display: flex;
    align-items: center;
    gap: 12px;
}

.page-header h1 i {
    color: #d32f2f;
}

.page-header p {
    color: #666;
    margin: 0;
    font-size: 1.1rem;
}

.page-content {
    display: grid;
    gap: 2rem;
}

.info-card {
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-left: 4px solid #d32f2f;
}

.info-card h3 {
    color: #333;
    margin-bottom: 1rem;
}

.info-card p {
    margin: 0.5rem 0;
    color: #555;
}

.placeholder-content {
    background: #f8f9fa;
    padding: 3rem 2rem;
    text-align: center;
    border-radius: 15px;
    border: 2px dashed #ddd;
}

.placeholder-content i {
    font-size: 3rem;
    color: #ccc;
    margin-bottom: 1rem;
}

.placeholder-content h3 {
    color: #666;
    margin-bottom: 0.5rem;
}

.placeholder-content p {
    color: #999;
    margin: 0;
} */
</style>