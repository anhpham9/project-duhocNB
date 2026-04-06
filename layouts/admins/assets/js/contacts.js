/**
 * Contacts Management JavaScript
 * Handles contact requests, filtering, pagination, sorting, and actions
 */

// Sample contacts data
const SAMPLE_CONTACTS = [
    { 
        id: 1, 
        name: 'Nguyễn Thị Mai', 
        email: 'mai.nguyen@email.com', 
        phone: '0901234567', 
        category: 'general', 
        status: 'new', 
        priority: 'high',
        message: 'Xin chào, tôi muốn tìm hiểu về các chương trình du học Nhật Bản. Gia đình tôi đang quan tâm đến việc cho con du học sau khi tốt nghiệp cấp 3. Mong được tư vấn chi tiết.',
        created: '2024-04-06', 
        assignedTo: 'Trần Văn Hùng'
    },
    { 
        id: 2, 
        name: 'Lê Văn Đức', 
        email: 'duc.le@email.com', 
        phone: '0912345678', 
        category: 'programs', 
        status: 'in-progress', 
        priority: 'medium',
        message: 'Tôi muốn biết thêm thông tin về học phí và chi phí sinh hoạt khi du học Nhật Bản. Hiện tại tôi đang học năm cuối đại học.',
        created: '2024-04-05', 
        assignedTo: 'Phạm Thị Lan'
    },
    { 
        id: 3, 
        name: 'Trần Thị Hồng', 
        email: 'hong.tran@email.com', 
        phone: '0923456789', 
        category: 'application', 
        status: 'replied', 
        priority: 'high',
        message: 'Em đang chuẩn bị hồ sơ du học và cần hỗ trợ về thủ tục visa. Em có thể liên hệ trực tiếp không ạ?',
        created: '2024-04-04', 
        assignedTo: 'Nguyễn Văn Minh'
    },
    { 
        id: 4, 
        name: 'Phạm Văn Tuấn', 
        email: 'tuan.pham@email.com', 
        phone: '0934567890', 
        category: 'visa', 
        status: 'completed', 
        priority: 'medium',
        message: 'Xin hỏi quy trình xin visa du học có phức tạp không? Thời gian xử lý bao lâu và cần chuẩn bị những giấy tờ gì?',
        created: '2024-04-03', 
        assignedTo: 'Lê Thị Hoa'
    },
    { 
        id: 5, 
        name: 'Hoàng Thị Linh', 
        email: 'linh.hoang@email.com', 
        phone: '0945678901', 
        category: 'accommodation', 
        status: 'new', 
        priority: 'low',
        message: 'Tôi quan tâm đến việc thuê nhà ở bên Nhật. Có dịch vụ hỗ trợ tìm nhà cho du học sinh không?',
        created: '2024-04-02', 
        assignedTo: null
    },
    { 
        id: 6, 
        name: 'Đỗ Văn Quang', 
        email: 'quang.do@email.com', 
        phone: '0956789012', 
        category: 'general', 
        status: 'in-progress', 
        priority: 'medium',
        message: 'Con tôi đang học lớp 11, muốn tìm hiểu sớm về du học để chuẩn bị kỹ càng. Bên công ty có tổ chức seminar không?',
        created: '2024-04-01', 
        assignedTo: 'Trần Văn Hùng'
    },
    { 
        id: 7, 
        name: 'Vũ Thị Nga', 
        email: 'nga.vu@email.com', 
        phone: '0967890123', 
        category: 'programs', 
        status: 'replied', 
        priority: 'high',
        message: 'Em muốn du học ngành công nghệ thông tin. Xin tư vấn các trường tốt và điều kiện đầu vào.',
        created: '2024-03-31', 
        assignedTo: 'Phạm Thị Lan'
    },
    { 
        id: 8, 
        name: 'Bùi Văn Nam', 
        email: 'nam.bui@email.com', 
        phone: '0978901234', 
        category: 'application', 
        status: 'completed', 
        priority: 'medium',
        message: 'Tôi cần hỗ trợ dịch thuật hồ sơ và công chứng các giấy tờ cần thiết cho việc du học.',
        created: '2024-03-30', 
        assignedTo: 'Nguyễn Văn Minh'
    },
    { 
        id: 9, 
        name: 'Lý Thị Thúy', 
        email: 'thuy.ly@email.com', 
        phone: '0989012345', 
        category: 'visa', 
        status: 'archived', 
        priority: 'low',
        message: 'Xin hỏi về thủ tục gia hạn visa du học khi đã ở Nhật Bản.',
        created: '2024-03-29', 
        assignedTo: 'Lê Thị Hoa'
    },
    { 
        id: 10, 
        name: 'Cao Văn Hải', 
        email: 'hai.cao@email.com', 
        phone: '0990123456', 
        category: 'other', 
        status: 'new', 
        priority: 'medium',
        message: 'Tôi muốn biết về cơ hội việc làm part-time cho du học sinh tại Nhật Bản.',
        created: '2024-03-28', 
        assignedTo: null
    },
    { 
        id: 11, 
        name: 'Đinh Thị Hương', 
        email: 'huong.dinh@email.com', 
        phone: '0901234568', 
        category: 'general', 
        status: 'in-progress', 
        priority: 'high',
        message: 'Gia đình tôi muốn đặt lịch tư vấn trực tiếp tại văn phòng. Xin cho biết thời gian làm việc.',
        created: '2024-03-27', 
        assignedTo: 'Trần Văn Hùng'
    },
    { 
        id: 12, 
        name: 'Tạ Văn Dũng', 
        email: 'dung.ta@email.com', 
        phone: '0912345679', 
        category: 'programs', 
        status: 'completed', 
        priority: 'medium',
        message: 'Em muốn tìm hiểu về chương trình học tiếng Nhật trước khi du học chính thức.',
        created: '2024-03-26', 
        assignedTo: 'Phạm Thị Lan'
    },
    { 
        id: 13, 
        name: 'Nghiêm Thị Lan', 
        email: 'lan.nghiem@email.com', 
        phone: '0923456780', 
        category: 'accommodation', 
        status: 'replied', 
        priority: 'low',
        message: 'Tôi muốn biết về các loại hình ở như ký túc xá, homestay hay thuê nhà riêng.',
        created: '2024-03-25', 
        assignedTo: 'Lê Thị Hoa'
    },
    { 
        id: 14, 
        name: 'Phan Văn Long', 
        email: 'long.phan@email.com', 
        phone: '0934567891', 
        category: 'application', 
        status: 'new', 
        priority: 'high',
        message: 'Em cần hỗ trợ chuẩn bị hồ sơ xin học bổng du học Nhật Bản. Xin tư vấn chi tiết.',
        created: '2024-03-24', 
        assignedTo: null
    },
    { 
        id: 15, 
        name: 'Vương Thị Mai', 
        email: 'mai.vuong@email.com', 
        phone: '0945678902', 
        category: 'other', 
        status: 'archived', 
        priority: 'low',
        message: 'Tôi muốn biết về quyền lợi bảo hiểm y tế cho du học sinh tại Nhật Bản.',
        created: '2024-03-23', 
        assignedTo: 'Nguyễn Văn Minh'
    }
];

// Table state management
let currentContacts = [...SAMPLE_CONTACTS];
let filteredContacts = [...SAMPLE_CONTACTS];
let currentPage = 1;
let rowsPerPage = 10;
let sortColumn = '';
let sortDirection = 'asc';

// DOM elements
let searchInput, statusFilter, priorityFilter, categoryFilter, dateFromFilter, dateToFilter;
let contactsTableBody, paginationInfo, paginationNumbers;
let tableLoading, tableEmpty;
let firstPageBtn, prevPageBtn, nextPageBtn, lastPageBtn;
let bulkActionSelect, applyBulkActionBtn;

document.addEventListener('DOMContentLoaded', function() {
    initializeElements();
    initializeEventListeners();
    renderTable();
    updateStats();
});

function initializeElements() {
    // Filter elements
    searchInput = document.getElementById('searchInput');
    statusFilter = document.getElementById('statusFilter');
    priorityFilter = document.getElementById('priorityFilter');
    categoryFilter = document.getElementById('categoryFilter');
    dateFromFilter = document.getElementById('dateFromFilter');
    dateToFilter = document.getElementById('dateToFilter');
    
    // Table elements
    contactsTableBody = document.getElementById('contactsTableBody');
    paginationInfo = document.getElementById('paginationInfo');
    paginationNumbers = document.getElementById('paginationNumbers');
    
    // State elements
    tableLoading = document.getElementById('tableLoading');
    tableEmpty = document.getElementById('tableEmpty');
    
    // Pagination buttons
    firstPageBtn = document.getElementById('firstPage');
    prevPageBtn = document.getElementById('prevPage');
    nextPageBtn = document.getElementById('nextPage');
    lastPageBtn = document.getElementById('lastPage');
    
    // Bulk actions
    bulkActionSelect = document.getElementById('bulkAction');
    applyBulkActionBtn = document.getElementById('applyBulkAction');
}

function initializeEventListeners() {
    // Search and filters
    if (searchInput) searchInput.addEventListener('input', debounceSearch);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (priorityFilter) priorityFilter.addEventListener('change', applyFilters);
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);
    if (dateFromFilter) dateFromFilter.addEventListener('change', applyFilters);
    if (dateToFilter) dateToFilter.addEventListener('change', applyFilters);
    
    // Rows per page
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    if (rowsPerPageSelect) {
        rowsPerPageSelect.addEventListener('change', handleRowsPerPageChange);
    }
    
    // Clear filters
    const clearFiltersBtn = document.getElementById('clearFilters');
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener('click', clearAllFilters);
    }
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById('selectAll');
    if (selectAllCheckbox) {
        selectAllCheckbox.addEventListener('change', handleSelectAll);
    }
    
    // Sortable headers
    const sortableHeaders = document.querySelectorAll('th.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => handleSort(header));
    });
    
    // Pagination buttons
    if (firstPageBtn) firstPageBtn.addEventListener('click', () => goToPage(1));
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => goToPage(currentPage - 1));
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => goToPage(currentPage + 1));
    if (lastPageBtn) lastPageBtn.addEventListener('click', () => goToPage(getTotalPages()));
    
    // Bulk actions
    if (applyBulkActionBtn) {
        applyBulkActionBtn.addEventListener('click', handleBulkAction);
    }
    
    // Export button
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', handleExport);
    }
}

// Search with debounce
const debounceSearch = debounce(() => {
    applyFilters();
}, 300);

function applyFilters() {
    const searchTerm = searchInput?.value.toLowerCase() || '';
    const statusValue = statusFilter?.value || '';
    const priorityValue = priorityFilter?.value || '';
    const categoryValue = categoryFilter?.value || '';
    const dateFromValue = dateFromFilter?.value || '';
    const dateToValue = dateToFilter?.value || '';
    
    filteredContacts = currentContacts.filter(contact => {
        const matchesSearch = !searchTerm || 
            contact.name.toLowerCase().includes(searchTerm) ||
            contact.email.toLowerCase().includes(searchTerm) ||
            contact.phone.toLowerCase().includes(searchTerm) ||
            contact.message.toLowerCase().includes(searchTerm);
            
        const matchesStatus = !statusValue || contact.status === statusValue;
        const matchesPriority = !priorityValue || contact.priority === priorityValue;
        const matchesCategory = !categoryValue || contact.category === categoryValue;
        
        const matchesDateFrom = !dateFromValue || contact.created >= dateFromValue;
        const matchesDateTo = !dateToValue || contact.created <= dateToValue;
        
        return matchesSearch && matchesStatus && matchesPriority && 
               matchesCategory && matchesDateFrom && matchesDateTo;
    });
    
    currentPage = 1; // Reset to first page
    renderTable();
    updateStats();
}

function handleRowsPerPageChange() {
    const rowsPerPageSelect = document.getElementById('rowsPerPage');
    const value = rowsPerPageSelect.value;
    rowsPerPage = value === 'all' ? filteredContacts.length : parseInt(value);
    currentPage = 1;
    renderTable();
}

function clearAllFilters() {
    if (searchInput) searchInput.value = '';
    if (statusFilter) statusFilter.value = '';
    if (priorityFilter) priorityFilter.value = '';
    if (categoryFilter) categoryFilter.value = '';
    if (dateFromFilter) dateFromFilter.value = '';
    if (dateToFilter) dateToFilter.value = '';
    
    filteredContacts = [...currentContacts];
    currentPage = 1;
    renderTable();
    updateStats();
    
    showNotification('Đã xóa tất cả bộ lọc', 'success');
}

function handleSort(header) {
    const column = header.dataset.sort;
    
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }
    
    // Update header classes
    document.querySelectorAll('th.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    header.classList.add(`sort-${sortDirection}`);
    
    // Sort the filtered data
    filteredContacts.sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        // Handle different data types
        if (column === 'id') {
            aVal = parseInt(aVal);
            bVal = parseInt(bVal);
        } else if (column === 'created') {
            aVal = new Date(aVal);
            bVal = new Date(bVal);
        } else {
            aVal = aVal.toString().toLowerCase();
            bVal = bVal.toString().toLowerCase();
        }
        
        if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
        return 0;
    });
    
    renderTable();
}

function getTotalPages() {
    if (rowsPerPage === filteredContacts.length) return 1;
    return Math.ceil(filteredContacts.length / rowsPerPage);
}

function renderTable() {
    showLoading(true);
    
    setTimeout(() => {
        if (filteredContacts.length === 0) {
            showEmptyState();
            return;
        }
        
        populateTable();
        updatePagination();
        showLoading(false);
    }, 300); // Simulate loading delay
}

function populateTable() {
    if (!contactsTableBody) return;
    
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = rowsPerPage === filteredContacts.length ? 
        filteredContacts.length : 
        Math.min(startIndex + rowsPerPage, filteredContacts.length);
    
    const pageContacts = filteredContacts.slice(startIndex, endIndex);
    
    contactsTableBody.innerHTML = pageContacts.map(contact => `
        <tr data-contact-id="${contact.id}">
            <td>
                <input type="checkbox" class="contact-checkbox" value="${contact.id}">
            </td>
            <td>${contact.id}</td>
            <td>
                <span class="priority-badge ${contact.priority}">${getPriorityText(contact.priority)}</span>
            </td>
            <td>
                <div class="contact-info-cell">
                    <div class="contact-name">${contact.name}</div>
                    <div class="contact-preview">${truncateText(contact.message, 40)}</div>
                </div>
            </td>
            <td>${contact.email}</td>
            <td>${formatPhone(contact.phone)}</td>
            <td>
                <span class="category-badge ${contact.category}">${getCategoryText(contact.category)}</span>
            </td>
            <td>
                <span class="status-badge ${contact.status}">${getStatusText(contact.status)}</span>
            </td>
            <td class="date-cell">${formatDate(contact.created)}</td>
            <td>
                <div class="action-buttons">
                    <button class="action-btn view" onclick="viewContact(${contact.id})" title="Xem chi tiết">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="action-btn reply" onclick="replyContact(${contact.id})" title="Phản hồi">
                        <i class="fas fa-reply"></i>
                    </button>
                    <button class="action-btn call" onclick="callContact('${contact.phone}')" title="Gọi điện">
                        <i class="fas fa-phone"></i>
                    </button>
                    <button class="action-btn complete" onclick="markAsCompleted(${contact.id})" title="Hoàn thành">
                        <i class="fas fa-check"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // Add event listeners for checkboxes
    const checkboxes = document.querySelectorAll('.contact-checkbox');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateSelectAllState);
    });
}

function updatePagination() {
    const totalPages = getTotalPages();
    const startIndex = (currentPage - 1) * rowsPerPage + 1;
    const endIndex = Math.min(currentPage * rowsPerPage, filteredContacts.length);
    
    // Update pagination info
    if (paginationInfo) {
        paginationInfo.textContent = `Hiển thị ${startIndex}-${endIndex} của ${filteredContacts.length} bản ghi`;
    }
    
    const paginationInfoBottom = document.getElementById('paginationInfoBottom');
    if (paginationInfoBottom) {
        paginationInfoBottom.textContent = `Hiển thị ${startIndex}-${endIndex} của ${filteredContacts.length} bản ghi`;
    }
    
    // Update pagination buttons state
    if (firstPageBtn) firstPageBtn.disabled = currentPage === 1;
    if (prevPageBtn) prevPageBtn.disabled = currentPage === 1;
    if (nextPageBtn) nextPageBtn.disabled = currentPage === totalPages;
    if (lastPageBtn) lastPageBtn.disabled = currentPage === totalPages;
    
    // Render page numbers
    renderPaginationNumbers(totalPages);
}

function renderPaginationNumbers(totalPages) {
    if (!paginationNumbers) return;
    
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }
    
    let paginationHTML = '';
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button class="page-number ${i === currentPage ? 'active' : ''}" 
                    onclick="goToPage(${i})">${i}</button>
        `;
    }
    
    paginationNumbers.innerHTML = paginationHTML;
}

function goToPage(page) {
    const totalPages = getTotalPages();
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    renderTable();
}

function showLoading(show) {
    if (tableLoading) {
        tableLoading.style.display = show ? 'block' : 'none';
    }
    if (contactsTableBody && contactsTableBody.parentElement.parentElement.parentElement) {
        contactsTableBody.parentElement.parentElement.parentElement.style.display = show ? 'none' : 'block';
    }
    if (tableEmpty) {
        tableEmpty.style.display = 'none';
    }
}

function showEmptyState() {
    if (tableLoading) tableLoading.style.display = 'none';
    if (tableEmpty) tableEmpty.style.display = 'block';
    if (contactsTableBody && contactsTableBody.parentElement.parentElement.parentElement) {
        contactsTableBody.parentElement.parentElement.parentElement.style.display = 'none';
    }
    if (paginationInfo) {
        paginationInfo.textContent = 'Hiển thị 0-0 của 0 bản ghi';
    }
}

function handleSelectAll() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const contactCheckboxes = document.querySelectorAll('.contact-checkbox');
    
    contactCheckboxes.forEach(checkbox => {
        checkbox.checked = selectAllCheckbox.checked;
    });
    
    updateBulkActionButtons();
}

function updateSelectAllState() {
    const selectAllCheckbox = document.getElementById('selectAll');
    const contactCheckboxes = document.querySelectorAll('.contact-checkbox');
    const checkedBoxes = document.querySelectorAll('.contact-checkbox:checked');
    
    if (checkedBoxes.length === 0) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = false;
    } else if (checkedBoxes.length === contactCheckboxes.length) {
        selectAllCheckbox.indeterminate = false;
        selectAllCheckbox.checked = true;
    } else {
        selectAllCheckbox.indeterminate = true;
        selectAllCheckbox.checked = false;
    }
    
    updateBulkActionButtons();
}

function updateBulkActionButtons() {
    const checkedBoxes = document.querySelectorAll('.contact-checkbox:checked');
    const hasSelection = checkedBoxes.length > 0;
    
    if (bulkActionSelect) bulkActionSelect.disabled = !hasSelection;
    if (applyBulkActionBtn) applyBulkActionBtn.disabled = !hasSelection;
}

function updateStats() {
    // Update stats in header
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length >= 3) {
        const newCount = currentContacts.filter(c => c.status === 'new').length;
        const inProgressCount = currentContacts.filter(c => c.status === 'in-progress').length;
        const completedCount = currentContacts.filter(c => c.status === 'completed').length;
        
        statItems[0].querySelector('.stat-number').textContent = newCount;
        statItems[1].querySelector('.stat-number').textContent = inProgressCount;
        statItems[2].querySelector('.stat-number').textContent = completedCount;
    }
}

// Utility functions
function getPriorityText(priority) {
    const priorityTexts = {
        'high': 'Cao',
        'medium': 'TB',
        'low': 'Thấp'
    };
    return priorityTexts[priority] || priority;
}

function getCategoryText(category) {
    const categoryTexts = {
        'general': 'Tư vấn chung',
        'programs': 'Chương trình',
        'application': 'Hồ sơ',
        'visa': 'Visa',
        'accommodation': 'Nhà ở',
        'other': 'Khác'
    };
    return categoryTexts[category] || category;
}

function getStatusText(status) {
    const statusTexts = {
        'new': 'Mới',
        'in-progress': 'Đang xử lý',
        'replied': 'Đã phản hồi',
        'completed': 'Hoàn thành',
        'archived': 'Lưu trữ'
    };
    return statusTexts[status] || status;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

function formatPhone(phone) {
    // Format Vietnam phone numbers
    return phone.replace(/(\d{4})(\d{3})(\d{3})/, '$1 $2 $3');
}

function truncateText(text, maxLength) {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
}

// Action handlers
function viewContact(contactId) {
    const contact = filteredContacts.find(c => c.id === contactId) || 
                   currentContacts.find(c => c.id === contactId);
    
    if (contact) {
        showContactModal(contact);
    }
}

function showContactModal(contact) {
    const modal = document.getElementById('contactModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalName = document.getElementById('modalName');
    const modalEmail = document.getElementById('modalEmail');
    const modalPhone = document.getElementById('modalPhone');
    const modalCategory = document.getElementById('modalCategory');
    const modalStatus = document.getElementById('modalStatus');
    const modalDate = document.getElementById('modalDate');
    const modalMessage = document.getElementById('modalMessage');
    
    if (modalTitle) modalTitle.textContent = `Liên hệ #${contact.id} - ${contact.name}`;
    if (modalName) modalName.textContent = contact.name;
    if (modalEmail) modalEmail.textContent = contact.email;
    if (modalPhone) modalPhone.textContent = formatPhone(contact.phone);
    if (modalCategory) modalCategory.textContent = getCategoryText(contact.category);
    if (modalStatus) modalStatus.textContent = getStatusText(contact.status);
    if (modalDate) modalDate.textContent = formatDate(contact.created);
    if (modalMessage) modalMessage.textContent = contact.message;
    
    modal.style.display = 'flex';
    setTimeout(() => modal.classList.add('show'), 10);
    
    // Store current contact ID for actions
    modal.dataset.contactId = contact.id;
}

function closeContactModal() {
    const modal = document.getElementById('contactModal');
    modal.classList.remove('show');
    setTimeout(() => {
        modal.style.display = 'none';
    }, 300);
}

function replyContactFromModal() {
    const modal = document.getElementById('contactModal');
    const contactId = parseInt(modal.dataset.contactId);
    if (contactId) {
        replyContact(contactId);
    }
}

function markAsCompletedFromModal() {
    const modal = document.getElementById('contactModal');
    const contactId = parseInt(modal.dataset.contactId);
    if (contactId) {
        markAsCompleted(contactId);
    }
}

function replyContact(contactId) {
    const contact = currentContacts.find(c => c.id === contactId);
    if (contact) {
        // In real app: open email client or internal messaging system
        showNotification(`Phản hồi cho ${contact.name} (${contact.email})`, 'info');
        
        // Update status to replied if it was new
        if (contact.status === 'new') {
            contact.status = 'replied';
            applyFilters();
            updateStats();
        }
    }
}

function callContact(phone) {
    // In real app: integrate with phone system or copy to clipboard
    navigator.clipboard.writeText(phone).then(() => {
        showNotification(`Đã sao chép số điện thoại: ${formatPhone(phone)}`, 'success');
    }).catch(() => {
        showNotification(`Số điện thoại: ${formatPhone(phone)}`, 'info');
    });
}

function markAsCompleted(contactId) {
    const contact = currentContacts.find(c => c.id === contactId);
    if (contact && confirm(`Đánh dấu liên hệ từ "${contact.name}" là hoàn thành?`)) {
        contact.status = 'completed';
        applyFilters();
        updateStats();
        showNotification(`Đã đánh dấu hoàn thành liên hệ từ ${contact.name}`, 'success');
        closeContactModal();
    }
}

function handleBulkAction() {
    const selectedIds = Array.from(document.querySelectorAll('.contact-checkbox:checked'))
                            .map(cb => parseInt(cb.value));
    const action = bulkActionSelect.value;
    
    if (!action || selectedIds.length === 0) return;
    
    if (confirm(`Áp dụng hành động "${bulkActionSelect.options[bulkActionSelect.selectedIndex].text}" cho ${selectedIds.length} liên hệ?`)) {
        selectedIds.forEach(id => {
            const contact = currentContacts.find(c => c.id === id);
            if (contact) {
                switch (action) {
                    case 'mark-replied':
                        contact.status = 'replied';
                        break;
                    case 'mark-completed':
                        contact.status = 'completed';
                        break;
                    case 'archive':
                        contact.status = 'archived';
                        break;
                    case 'delete':
                        currentContacts = currentContacts.filter(c => c.id !== id);
                        break;
                }
            }
        });
        
        // Reset filters and UI
        bulkActionSelect.value = '';
        document.getElementById('selectAll').checked = false;
        applyFilters();
        updateStats();
        updateBulkActionButtons();
        
        showNotification(`Đã áp dụng hành động cho ${selectedIds.length} liên hệ`, 'success');
    }
}

function handleExport() {
    showNotification('Đang xuất dữ liệu Excel...', 'info');
    // In real app: export filtered contacts to Excel file
    setTimeout(() => {
        showNotification('Xuất Excel thành công!', 'success');
    }, 2000);
}

// Debounce utility
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}