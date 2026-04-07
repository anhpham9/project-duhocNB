// ========================================
// NEWS MANAGEMENT SYSTEM
// ========================================

class NewsManager {
    constructor() {
        this.newsData = [];
        this.filteredData = [];
        this.currentPage = 1;
        this.itemsPerPage = 10;
        this.currentSort = { field: 'id', direction: 'asc' };
        this.currentView = 'table';
        this.selectedItems = new Set();
        
        this.init();
    }

    init() {
        this.generateSampleData();
        this.initEventListeners();
        this.renderTable();
        this.updateStats();
    }

    generateSampleData() {
        const categories = ['news', 'rule', 'event', 'blog', 'other'];
        const categoryLabels = {
            'news': 'Tin tức',
            'rule': 'Luật lệ', 
            'event': 'Sự kiện',
            'blog': 'Blog',
            'other': 'Khác'
        };

        const sampleTitles = [
            'Hướng dẫn xin visa du học Nhật Bản 2024',
            'Top 10 trường đại học hàng đầu tại Tokyo', 
            'Học bổng toàn phần MEXT - Cơ hội vàng cho sinh viên Việt Nam',
            'Cuộc sống sinh viên tại Nhật Bản - Những điều cần biết',
            'Quy trình đăng ký học tại trường Nhật ngữ',
            'Kinh nghiệm tìm việc làm thêm khi du học Nhật',
            'Chi phí sinh hoạt tại các thành phố lớn của Nhật Bản',
            'Cách thích nghi với văn hóa Nhật Bản',
            'Những ngành học hot tại Nhật Bản hiện nay',
            'Bí quyết học tốt tiếng Nhật',
            'Thủ tục gia hạn visa du học',
            'Kinh nghiệm thuê nhà tại Nhật Bản',
            'Lễ hội và văn hóa truyền thống Nhật Bản',
            'Hướng dẫn mở tài khoản ngân hàng tại Nhật',
            'Du học Nhật Bản - Lựa chọn thông minh cho tương lai'
        ];

        const authors = ['Nguyễn Văn A', 'Trần Thị B', 'Lê Minh C', 'Phạm Thu D', 'Hoàng Anh E'];

        for (let i = 1; i <= 25; i++) {
            const category = categories[Math.floor(Math.random() * categories.length)];
            const author = authors[Math.floor(Math.random() * authors.length)];
            const title = sampleTitles[Math.floor(Math.random() * sampleTitles.length)];
            const publishDate = new Date(Date.now() - Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000));
            const views = Math.floor(Math.random() * 5000) + 100;
            const rating = (Math.random() * 2 + 3).toFixed(1);
            
            this.newsData.push({
                id: i,
                title: title,
                category: category,
                categoryLabel: categoryLabels[category],
                author: author,
                summary: `Tóm tắt nội dung bài viết ${title.substring(0, 50)}...`,
                content: `Nội dung chi tiết của bài viết "${title}". Đây là nội dung mô tả chi tiết về chủ đề được đề cập trong tiêu đề. Bài viết cung cấp thông tin hữu ích và cập nhật nhất cho người đọc.`,
                publishDate: publishDate,
                views: views,
                rating: parseFloat(rating),
                status: Math.random() > 0.7 ? 'inactive' : 'active',
                tags: ['du học', 'nhật bản', 'sinh viên', 'học bổng'].slice(0, Math.floor(Math.random() * 4) + 1),
                image: `assets/images/news/news-${(i % 10) + 1}.jpg`
            });
        }

        this.filteredData = [...this.newsData];
    }

    initEventListeners() {
        // Search
        document.getElementById('searchInput').addEventListener('input', 
            this.debounce(() => this.handleSearch(), 300));

        // Filters
        document.getElementById('categoryFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('statusFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateFromFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('dateToFilter').addEventListener('change', () => this.applyFilters());
        document.getElementById('clearFilters').addEventListener('click', () => this.clearFilters());

        // Table controls
        document.getElementById('rowsPerPage').addEventListener('change', (e) => {
            this.itemsPerPage = e.target.value === 'all' ? this.filteredData.length : parseInt(e.target.value);
            this.currentPage = 1;
            this.renderTable();
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.view-btn');
                this.toggleView(button.dataset.view);
            });
        });

        // Select all checkbox
        document.getElementById('selectAll').addEventListener('change', (e) => this.selectAll(e.target.checked));

        // Bulk actions
        document.getElementById('bulkAction').addEventListener('change', () => this.updateBulkActionButton());
        document.getElementById('applyBulkAction').addEventListener('click', () => this.applyBulkAction());

        // Add news button
        document.getElementById('addNewsBtn').addEventListener('click', () => this.showAddEditModal());

        // Export button
        document.getElementById('exportBtn').addEventListener('click', () => this.exportToExcel());

        // Pagination
        document.getElementById('firstPage').addEventListener('click', () => this.goToPage(1));
        document.getElementById('prevPage').addEventListener('click', () => this.goToPage(this.currentPage - 1));
        document.getElementById('nextPage').addEventListener('click', () => this.goToPage(this.currentPage + 1));
        document.getElementById('lastPage').addEventListener('click', () => 
            this.goToPage(Math.ceil(this.filteredData.length / this.itemsPerPage)));

        // Form submission
        document.getElementById('newsForm').addEventListener('submit', (e) => this.handleFormSubmit(e));
    }

    debounce(func, wait) {
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

    handleSearch() {
        this.applyFilters();
    }

    applyFilters() {
        const searchTerm = document.getElementById('searchInput').value.toLowerCase();
        const categoryFilter = document.getElementById('categoryFilter').value;
        const statusFilter = document.getElementById('statusFilter').value;
        const dateFrom = document.getElementById('dateFromFilter').value;
        const dateTo = document.getElementById('dateToFilter').value;

        this.filteredData = this.newsData.filter(item => {
            const matchesSearch = !searchTerm || 
                item.title.toLowerCase().includes(searchTerm) ||
                item.content.toLowerCase().includes(searchTerm) ||
                item.author.toLowerCase().includes(searchTerm);
            
            const matchesCategory = !categoryFilter || item.category === categoryFilter;
            const matchesStatus = !statusFilter || item.status === statusFilter;
            
            let matchesDate = true;
            if (dateFrom) {
                matchesDate &= new Date(item.publishDate) >= new Date(dateFrom);
            }
            if (dateTo) {
                matchesDate &= new Date(item.publishDate) <= new Date(dateTo);
            }

            return matchesSearch && matchesCategory && matchesStatus && matchesDate;
        });

        this.currentPage = 1;
        this.selectedItems.clear();
        this.renderTable();
        this.updateStats();
    }

    clearFilters() {
        document.getElementById('searchInput').value = '';
        document.getElementById('categoryFilter').value = '';
        document.getElementById('statusFilter').value = '';
        document.getElementById('dateFromFilter').value = '';
        document.getElementById('dateToFilter').value = '';
        
        this.filteredData = [...this.newsData];
        this.currentPage = 1;
        this.selectedItems.clear();
        this.renderTable();
        this.updateStats();
    }

    toggleView(view) {
        console.log('Toggle view to:', view);
        this.currentView = view;
        document.querySelectorAll('.view-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${view}"]`).classList.add('active');

        if (view === 'table') {
            document.getElementById('tableView').style.display = 'block';
            document.getElementById('gridView').style.display = 'none';
            this.renderTable();
        } else {
            document.getElementById('tableView').style.display = 'none';
            document.getElementById('gridView').style.display = 'block';
            this.renderGrid();
        }
        
        // Update select all checkbox state
        this.updateSelectAllCheckbox();
    }

    selectAll(checked) {
        const checkboxes = document.querySelectorAll('.item-checkbox');
        checkboxes.forEach(checkbox => {
            checkbox.checked = checked;
            const itemId = parseInt(checkbox.dataset.id);
            if (checked) {
                this.selectedItems.add(itemId);
            } else {
                this.selectedItems.delete(itemId);
            }
        });
        this.updateBulkActionButton();
    }

    toggleItemSelection(id, checked) {
        if (checked) {
            this.selectedItems.add(id);
        } else {
            this.selectedItems.delete(id);
        }
        this.updateBulkActionButton();
        
        const selectAllCheckbox = document.getElementById('selectAll');
        const allCheckboxes = document.querySelectorAll('.item-checkbox');
        selectAllCheckbox.checked = allCheckboxes.length > 0 && 
            Array.from(allCheckboxes).every(cb => cb.checked);
    }

    updateSelectAllCheckbox() {
        const selectAllCheckbox = document.getElementById('selectAll');
        const allCheckboxes = document.querySelectorAll('.item-checkbox');
        selectAllCheckbox.checked = allCheckboxes.length > 0 && 
            Array.from(allCheckboxes).every(cb => cb.checked);
    }

    updateBulkActionButton() {
        const bulkActionSelect = document.getElementById('bulkAction');
        const applyButton = document.getElementById('applyBulkAction');
        const hasSelection = this.selectedItems.size > 0;
        
        bulkActionSelect.disabled = !hasSelection;
        applyButton.disabled = !hasSelection || !bulkActionSelect.value;
    }

    applyBulkAction() {
        const action = document.getElementById('bulkAction').value;
        const selectedIds = Array.from(this.selectedItems);
        
        if (!action || selectedIds.length === 0) return;

        let message = '';
        switch (action) {
            case 'activate':
                message = `Hiển thị ${selectedIds.length} tin tức đã chọn?`;
                break;
            case 'deactivate':
                message = `Ẩn ${selectedIds.length} tin tức đã chọn?`;
                break;
            case 'delete':
                message = `Xóa vĩnh viễn ${selectedIds.length} tin tức đã chọn?`;
                break;
        }

        this.showConfirmModal(message, () => {
            selectedIds.forEach(id => {
                const item = this.newsData.find(item => item.id === id);
                if (item) {
                    switch (action) {
                        case 'activate':
                            item.status = 'active';
                            break;
                        case 'deactivate':
                            item.status = 'inactive';
                            break;
                        case 'delete':
                            this.newsData = this.newsData.filter(item => item.id !== id);
                            break;
                    }
                }
            });
            
            this.selectedItems.clear();
            this.applyFilters();
            this.showToast(`Đã thực hiện thành công với ${selectedIds.length} tin tức`, 'success');
        });
    }

    sortBy(field) {
        if (this.currentSort.field === field) {
            this.currentSort.direction = this.currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            this.currentSort = { field, direction: 'asc' };
        }

        this.filteredData.sort((a, b) => {
            let valueA = a[field];
            let valueB = b[field];

            if (field === 'publishDate') {
                valueA = new Date(valueA);
                valueB = new Date(valueB);
            }

            if (typeof valueA === 'string') {
                valueA = valueA.toLowerCase();
                valueB = valueB.toLowerCase();
            }

            if (this.currentSort.direction === 'asc') {
                return valueA > valueB ? 1 : -1;
            } else {
                return valueA < valueB ? 1 : -1;
            }
        });

        this.renderTable();
    }

    goToPage(page) {
        const totalPages = Math.ceil(this.filteredData.length / this.itemsPerPage);
        if (page < 1 || page > totalPages) return;
        
        this.currentPage = page;
        this.renderTable();
    }

    renderTable() {
        if (this.filteredData.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        const tbody = document.getElementById('newsTableBody');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        tbody.innerHTML = pageData.map(item => `
            <tr>
                <td>
                    <input type="checkbox" class="item-checkbox" data-id="${item.id}" 
                           ${this.selectedItems.has(item.id) ? 'checked' : ''}
                           onchange="newsManager.toggleItemSelection(${item.id}, this.checked)">
                </td>
                <td>${item.id}</td>
                <td>
                    <div class="news-title">
                        <strong>${this.truncateText(item.title, 50)}</strong>
                    </div>
                </td>
                <td>
                    <span class="category-badge ${item.category}">${item.categoryLabel}</span>
                </td>
                <td>${this.truncateText(item.summary, 80)}</td>
                <td>${this.formatDate(item.publishDate)}</td>
                <td>
                    <div class="rating-stars">
                        ${this.generateStars(item.rating)} (${item.rating})
                    </div>
                </td>
                <td>
                    <span class="status-badge ${item.status}">
                        ${item.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn view" onclick="newsManager.viewNews(${item.id})" title="Xem chi tiết">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn edit" onclick="newsManager.editNews(${item.id})" title="Sửa">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="action-btn delete" onclick="newsManager.deleteNews(${item.id})" title="Xóa">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');

        this.updatePagination();
        this.updateSortIcons();
    }

    renderGrid() {
        if (this.filteredData.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        const grid = document.getElementById('newsGrid');
        const startIndex = (this.currentPage - 1) * this.itemsPerPage;
        const endIndex = startIndex + this.itemsPerPage;
        const pageData = this.filteredData.slice(startIndex, endIndex);

        grid.innerHTML = pageData.map(item => `
            <div class="news-card">
                <div class="news-card-header">
                    <input type="checkbox" class="item-checkbox" data-id="${item.id}"
                           ${this.selectedItems.has(item.id) ? 'checked' : ''}
                           onchange="newsManager.toggleItemSelection(${item.id}, this.checked)">
                    <span class="category-badge ${item.category}">${item.categoryLabel}</span>
                </div>
                <div class="news-card-image">
                    <img src="${item.image}" alt="${item.title}" onerror="this.src='assets/images/placeholder.jpg'">
                </div>
                <div class="news-card-content">
                    <h4>${this.truncateText(item.title, 60)}</h4>
                    <p class="meta-info">
                        <i class="fas fa-user"></i> ${item.author} • 
                        <i class="fas fa-calendar"></i> ${this.formatDate(item.publishDate)}
                    </p>
                    <p class="summary">${this.truncateText(item.summary, 100)}</p>
                    <div class="card-footer">
                        <div class="rating">
                            ${this.generateStars(item.rating)} (${item.rating})
                        </div>
                        <span class="status-badge ${item.status}">
                            ${item.status === 'active' ? 'Hiển thị' : 'Ẩn'}
                        </span>
                    </div>
                </div>
                <div class="news-card-actions">
                    <button class="btn btn-sm btn-primary" onclick="newsManager.viewNews(${item.id})">
                        <i class="fas fa-eye"></i> Xem
                    </button>
                    <button class="btn btn-sm btn-success" onclick="newsManager.editNews(${item.id})">
                        <i class="fas fa-edit"></i> Sửa
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="newsManager.deleteNews(${item.id})">
                        <i class="fas fa-trash"></i> Xóa
                    </button>
                </div>
            </div>
        `).join('');

        this.updatePagination();
    }

    updatePagination() {
        const totalItems = this.filteredData.length;
        const totalPages = Math.ceil(totalItems / this.itemsPerPage);
        const startItem = (this.currentPage - 1) * this.itemsPerPage + 1;
        const endItem = Math.min(this.currentPage * this.itemsPerPage, totalItems);

        // Update pagination info
        document.getElementById('paginationInfoBottom').textContent = 
            `Hiển thị ${startItem}-${endItem} của ${totalItems} bản ghi`;

        // Update pagination buttons
        document.getElementById('firstPage').disabled = this.currentPage === 1;
        document.getElementById('prevPage').disabled = this.currentPage === 1;
        document.getElementById('nextPage').disabled = this.currentPage === totalPages;
        document.getElementById('lastPage').disabled = this.currentPage === totalPages;

        // Update pagination numbers
        const numbersContainer = document.getElementById('paginationNumbers');
        const pageNumbers = [];
        
        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) {
                pageNumbers.push(i);
            }
        } else {
            pageNumbers.push(1);
            if (this.currentPage > 4) pageNumbers.push('...');
            
            const start = Math.max(2, this.currentPage - 1);
            const end = Math.min(totalPages - 1, this.currentPage + 1);
            
            for (let i = start; i <= end; i++) {
                pageNumbers.push(i);
            }
            
            if (this.currentPage < totalPages - 3) pageNumbers.push('...');
            if (totalPages > 1) pageNumbers.push(totalPages);
        }

        numbersContainer.innerHTML = pageNumbers.map(num => {
            if (num === '...') {
                return '<span class="pagination-ellipsis">...</span>';
            }
            return `
                <button class="pagination-btn ${this.currentPage === num ? 'active' : ''}" 
                        onclick="newsManager.goToPage(${num})">${num}</button>
            `;
        }).join('');
    }

    updateSortIcons() {
        document.querySelectorAll('.sortable i').forEach(icon => {
            icon.className = 'fas fa-sort';
        });
        
        const currentSortHeader = document.querySelector(`[data-sort="${this.currentSort.field}"] i`);
        if (currentSortHeader) {
            currentSortHeader.className = this.currentSort.direction === 'asc' 
                ? 'fas fa-sort-up' : 'fas fa-sort-down';
        }
    }

    showEmptyState() {
        document.getElementById('tableView').style.display = 'none';
        document.getElementById('gridView').style.display = 'none';
        document.getElementById('tableEmpty').style.display = 'block';
    }

    hideEmptyState() {
        document.getElementById('tableEmpty').style.display = 'none';
        if (this.currentView === 'table') {
            document.getElementById('tableView').style.display = 'block';
        } else {
            document.getElementById('gridView').style.display = 'block';
        }
    }

    updateStats() {
        const totalNews = this.newsData.length;
        const activeNews = this.newsData.filter(item => item.status === 'active').length;
        const inactiveNews = this.newsData.filter(item => item.status === 'inactive').length;

        document.querySelector('.stat-item:nth-child(1) .stat-number').textContent = totalNews;
        document.querySelector('.stat-item:nth-child(2) .stat-number').textContent = activeNews;
        document.querySelector('.stat-item:nth-child(3) .stat-number').textContent = inactiveNews;
    }

    // News CRUD Operations
    viewNews(id) {
        const news = this.newsData.find(item => item.id === id);
        if (!news) return;

        // Set modal content
        document.getElementById('modalTitle').textContent = 'Chi tiết Tin tức';
        document.getElementById('modalImage').src = news.image;
        document.getElementById('modalNewsTitle').textContent = news.title;
        document.getElementById('modalAuthor').textContent = news.author;
        document.getElementById('modalPublishDate').textContent = this.formatDate(news.publishDate);
        document.getElementById('modalCategory').textContent = news.categoryLabel;
        document.getElementById('modalCategory').className = `category-badge ${news.category}`;
        document.getElementById('modalStatus').textContent = news.status === 'active' ? 'Hiển thị' : 'Ẩn';
        document.getElementById('modalStatus').className = `status-badge ${news.status}`;
        
        document.getElementById('modalCategoryText').textContent = news.categoryLabel;
        document.getElementById('modalAuthorText').textContent = news.author;
        document.getElementById('modalDateText').textContent = this.formatDate(news.publishDate);
        document.getElementById('modalViews').textContent = news.views.toLocaleString();
        document.getElementById('modalSummary').textContent = news.summary;
        document.getElementById('modalContent').innerHTML = news.content;
        
        const tagsContainer = document.getElementById('modalTags');
        tagsContainer.innerHTML = news.tags.map(tag => 
            `<span class="tag">#${tag}</span>`
        ).join('');

        // Update action buttons
        document.getElementById('editNewsBtn').onclick = () => this.editNews(id);
        document.getElementById('toggleStatusBtn').onclick = () => this.toggleNewsStatus(id);
        document.getElementById('deleteNewsBtn').onclick = () => this.deleteNews(id);

        // Show modal
        const modal = document.getElementById('newsModal');
        modal.style.display = 'flex';
        modal.classList.add('show');
    }

    editNews(id) {
        const news = this.newsData.find(item => item.id === id);
        if (!news) return;

        document.getElementById('addEditModalTitle').textContent = 'Sửa Tin Tức';
        document.getElementById('newsTitle').value = news.title;
        document.getElementById('newsCategory').value = news.category;
        document.getElementById('newsAuthor').value = news.author;
        document.getElementById('newsStatus').value = news.status;
        document.getElementById('newsSummary').value = news.summary;
        document.getElementById('newsContent').value = news.content;
        document.getElementById('newsTags').value = news.tags.join(', ');

        // Store the ID for update
        document.getElementById('newsForm').dataset.editId = id;

        this.closeNewsModal();
        const modal = document.getElementById('addEditNewsModal');
        modal.style.display = 'flex';
        modal.classList.add('show');
    }

    deleteNews(id) {
        const news = this.newsData.find(item => item.id === id);
        if (!news) return;

        this.showConfirmModal(
            `Bạn có chắc chắn muốn xóa tin tức "${news.title}"?`,
            () => {
                this.newsData = this.newsData.filter(item => item.id !== id);
                this.selectedItems.delete(id);
                this.applyFilters();
                this.showToast('Đã xóa tin tức thành công', 'success');
                this.closeNewsModal();
            }
        );
    }

    toggleNewsStatus(id) {
        const news = this.newsData.find(item => item.id === id);
        if (!news) return;

        news.status = news.status === 'active' ? 'inactive' : 'active';
        this.applyFilters();
        this.showToast(
            `Đã ${news.status === 'active' ? 'hiển thị' : 'ẩn'} tin tức thành công`, 
            'success'
        );
        this.closeNewsModal();
    }

    showAddEditModal(id = null) {
        if (id) {
            this.editNews(id);
        } else {
            document.getElementById('addEditModalTitle').textContent = 'Thêm Tin Tức Mới';
            document.getElementById('newsForm').reset();
            document.getElementById('newsForm').removeAttribute('data-edit-id');
            const modal = document.getElementById('addEditNewsModal');
            modal.style.display = 'flex';
            modal.classList.add('show');
        }
    }

    handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const editId = e.target.dataset.editId;
        
        const newsData = {
            title: formData.get('title'),
            category: formData.get('category'),
            author: formData.get('author') || 'Admin',
            status: formData.get('status'),
            summary: formData.get('summary'),
            content: formData.get('content'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag)
        };

        if (editId) {
            // Update existing news
            const news = this.newsData.find(item => item.id === parseInt(editId));
            if (news) {
                Object.assign(news, newsData);
                this.showToast('Đã cập nhật tin tức thành công', 'success');
            }
        } else {
            // Add new news
            const newNews = {
                ...newsData,
                id: Math.max(...this.newsData.map(item => item.id)) + 1,
                publishDate: new Date(),
                views: 0,
                rating: 0,
                categoryLabel: this.getCategoryLabel(newsData.category),
                image: `assets/images/news/news-${Math.floor(Math.random() * 10) + 1}.jpg`
            };
            this.newsData.push(newNews);
            this.showToast('Đã thêm tin tức thành công', 'success');
        }

        this.closeAddEditModal();
        this.applyFilters();
    }

    getCategoryLabel(category) {
        const labels = {
            'news': 'Tin tức',
            'rule': 'Luật lệ',
            'event': 'Sự kiện', 
            'blog': 'Blog',
            'other': 'Khác'
        };
        return labels[category] || category;
    }

    exportToExcel() {
        const data = this.filteredData.map(item => ({
            'ID': item.id,
            'Tiêu đề': item.title,
            'Thể loại': item.categoryLabel,
            'Tác giả': item.author,
            'Ngày đăng': this.formatDate(item.publishDate),
            'Lượt xem': item.views,
            'Đánh giá': item.rating,
            'Trạng thái': item.status === 'active' ? 'Hiển thị' : 'Ẩn'
        }));

        const csv = this.convertToCSV(data);
        this.downloadCSV(csv, 'danh-sach-tin-tuc.csv');
        this.showToast('Đã xuất dữ liệu thành công', 'success');
    }

    convertToCSV(data) {
        if (data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        const csvContent = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => `"${row[header] || ''}"`).join(',')
            )
        ].join('\n');
        
        return '\uFEFF' + csvContent; // UTF-8 BOM for Excel
    }

    downloadCSV(csv, filename) {
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    // Utility Methods
    formatDate(date) {
        return new Date(date).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    }

    truncateText(text, length) {
        return text.length > length ? text.substring(0, length) + '...' : text;
    }

    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        return '★'.repeat(fullStars) + 
               (hasHalfStar ? '☆' : '') + 
               '☆'.repeat(emptyStars);
    }

    // Modal Methods
    closeNewsModal() {
        const modal = document.getElementById('newsModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
    }

    closeAddEditModal() {
        const modal = document.getElementById('addEditNewsModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
    }

    closeConfirmModal() {
        const modal = document.getElementById('confirmModal');
        modal.classList.remove('show');
        modal.style.display = 'none';
    }

    showConfirmModal(message, onConfirm) {
        document.getElementById('confirmMessage').textContent = message;
        document.getElementById('confirmBtn').onclick = () => {
            onConfirm();
            this.closeConfirmModal();
        };
        const modal = document.getElementById('confirmModal');
        modal.style.display = 'flex';
        modal.classList.add('show');
    }

    showToast(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `toast show ${type}`;

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
}

// Global functions for inline event handlers
window.closeNewsModal = function() {
    if (window.newsManager) {
        window.newsManager.closeNewsModal();
    }
};

window.closeAddEditModal = function() {
    if (window.newsManager) {
        window.newsManager.closeAddEditModal();
    }
};

window.closeConfirmModal = function() {
    if (window.newsManager) {
        window.newsManager.closeConfirmModal();
    }
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    window.newsManager = new NewsManager();
    
    // Add sortable click handlers
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const field = header.dataset.sort;
            window.newsManager.sortBy(field);
        });
    });
});

// Handle modal clicks outside content
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        e.target.style.display = 'none';
    }
});

// Export for global access
window.NewsManager = NewsManager;