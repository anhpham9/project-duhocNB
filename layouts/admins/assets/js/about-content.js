// About Content Management System
class AboutContentManager {
    constructor() {
        this.originalData = {};
        this.hasUnsavedChanges = false;
        this.reasonCount = 2; // Start with 2 default reasons
        this.memberCount = 1; // Start with 1 default member
        this.coreValueCount = 4; // Start with 4 default core values
        this.historyCount = 3; // Start with 3 default history items
        
        this.init();
    }

    init() {
        this.loadCurrentData();
        this.setupEventListeners();
        this.setupImageHandlers();
        this.setupCharacterCounters();
        this.setupIconPickers();
        this.checkForChanges();
    }

    loadCurrentData() {
        // Load current content data (in real app, this would be from API)
        this.originalData = {
            pageTitle: 'Giới Thiệu Du Học NB',
            pageSubtitle: 'Đồng hành cùng ước mơ du học Nhật Bản của bạn',
            pageSeoDescription: 'Tìm hiểu về Du Học NB - công ty tư vấn du học Nhật Bản uy tín với 6+ năm kinh nghiệm...',
            aboutTitle: 'VỀ CHÚNG TÔI',
            aboutSubtitle: 'Chuyên gia tư vấn du học Nhật Bản hàng đầu Việt Nam',
            aboutDescription: 'Du Học NB được thành lập từ năm 2020...',
            experienceYears: 6,
            visionContent: 'Trở thành công ty tư vấn du học Nhật Bản uy tín hàng đầu...',
            missionContent: 'Cung cấp dịch vụ tư vấn du học chuyên nghiệp...',
            coreValues: [
                'Uy tín: Minh bạch trong mọi giao dịch',
                'Chất lượng: Dịch vụ chuyên nghiệp hàng đầu',
                'Tận tâm: Đặt lợi ích học sinh lên hàng đầu',
                'Đổi mới: Không ngừng cải tiến dịch vụ'
            ],
            stats: {
                studentsCount: 2500,
                schoolsCount: 150,
                visaSuccessRate: 98,
                experienceYearsCount: 6
            },
            reasons: [
                {
                    icon: 'fas fa-certificate',
                    title: 'Được Chứng Nhận',
                    description: 'Được cấp phép hoạt động hợp pháp bởi các cơ quan chức năng...'
                },
                {
                    icon: 'fas fa-user-tie',
                    title: 'Đội Ngũ Chuyên Nghiệp',
                    description: 'Tư vấn viên có trình độ cao, từng du học tại Nhật Bản...'
                }
            ],
            team: [
                {
                    name: 'Nguyễn Văn A',
                    position: 'CEO & Founder',
                    description: '10+ năm kinh nghiệm trong lĩnh vực tư vấn du học...',
                    image: '../users/assets/images/news-2.jpg'
                }
            ],
            history: [
                {
                    year: '2020',
                    title: 'Thành lập Du Học NB',
                    description: 'Công ty Du Học NB được thành lập với sứ mệnh hỗ trợ các bạn trẻ Việt Nam thực hiện ước mơ du học tại Nhật Bản. Bắt đầu với đội ngũ 5 thành viên đầy nhiệt huyết.'
                },
                {
                    year: '2021',
                    title: 'Đạt 1000+ học sinh',
                    description: 'Chỉ sau 1 năm hoạt động, Du Học NB đã thành công hỗ trợ hơn 1000 học sinh thực hiện ước mơ du học. Mở rộng mạng lưới đối tác với 50+ trường học tại Nhật Bản.'
                },
                {
                    year: '2023',
                    title: 'Nhận giải thưởng',
                    description: 'Nhận giải thưởng "Doanh nghiệp xuất sắc trong lĩnh vực tư vấn du học" do Hiệp hội Du học Việt Nam trao tặng. Mở thêm 3 chi nhánh tại TP.HCM, Đà Nẵng và Cần Thơ.'
                }
            ]
        };

        this.populateForm();
    }

    populateForm() {
        // Populate basic form fields
        Object.keys(this.originalData).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element && (typeof this.originalData[key] === 'string' || typeof this.originalData[key] === 'number')) {
                element.value = this.originalData[key];
            }
        });

        // Populate core values
        this.originalData.coreValues.forEach((value, index) => {
            const element = document.querySelector(`[name="coreValue${index + 1}"]`);
            if (element) {
                element.value = value;
            }
        });

        // Populate statistics
        Object.keys(this.originalData.stats).forEach(key => {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = this.originalData.stats[key];
            }
        });
        
        // Populate history data
        this.originalData.history.forEach((history, index) => {
            const yearElement = document.querySelector(`[name="historyYear${index}"]`);
            const titleElement = document.querySelector(`[name="historyTitle${index}"]`);
            const descElement = document.querySelector(`[name="historyDescription${index}"]`);
            
            if (yearElement) yearElement.value = history.year;
            if (titleElement) titleElement.value = history.title;
            if (descElement) descElement.value = history.description;
        });
    }

    setupEventListeners() {
        // Form change detection
        const form = document.getElementById('aboutContentForm');
        if (form) {
            form.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
                this.updateUI();
            });
        }

        // Save buttons
        const saveBtn = document.getElementById('saveBtn');
        const saveContentBtn = document.getElementById('saveContentBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveContent();
            });
        }
        if (saveContentBtn) {
            saveContentBtn.addEventListener('click', () => {
                this.saveContent();
            });
        }

        // Reset button
        const resetBtn = document.getElementById('resetBtn');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => {
                this.showConfirmDialog(
                    'Khôi phục nội dung',
                    'Bạn có chắc chắn muốn khôi phục về trạng thái ban đầu? Tất cả thay đổi chưa lưu sẽ bị mất.',
                    () => {
                        this.resetForm();
                    }
                );
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (this.hasUnsavedChanges) {
                    this.showConfirmDialog(
                        'Hủy thay đổi',
                        'Bạn có thay đổi chưa được lưu. Bạn có chắc chắn muốn hủy?',
                        () => {
                            window.location.href = 'dashboard.html';
                        }
                    );
                } else {
                    window.location.href = 'dashboard.html';
                }
            });
        }

        // Preview button
        const previewBtn = document.getElementById('previewBtn');
        if (previewBtn) {
            previewBtn.addEventListener('click', () => {
                this.showPreview();
            });
        }

        // Close preview modal
        const closePreviewModal = document.getElementById('closePreviewModal');
        if (closePreviewModal) {
            closePreviewModal.addEventListener('click', () => {
                this.closePreview();
            });
        }

        // Add reason button
        const addReasonBtn = document.getElementById('addReasonBtn');
        if (addReasonBtn) {
            addReasonBtn.addEventListener('click', () => {
                this.addReason();
            });
        }

        // Add member button
        const addMemberBtn = document.getElementById('addMemberBtn');
        if (addMemberBtn) {
            addMemberBtn.addEventListener('click', () => {
                this.addTeamMember();
            });
        }

        // Add core value button
        const addCoreValueBtn = document.getElementById('addCoreValueBtn');
        if (addCoreValueBtn) {
            addCoreValueBtn.addEventListener('click', () => {
                this.addCoreValue();
            });
        }
        
        // Add history button
        const addHistoryBtn = document.getElementById('addHistoryBtn');
        if (addHistoryBtn) {
            addHistoryBtn.addEventListener('click', () => {
                this.addHistoryItem();
            });
        }

        // Remove reason buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-reason-btn')) {
                const reasonItem = e.target.closest('.reason-item');
                if (reasonItem) {
                    this.removeReason(reasonItem);
                }
            }
        });

        // Remove member buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-member-btn')) {
                const memberItem = e.target.closest('.team-member-item');
                if (memberItem) {
                    this.removeTeamMember(memberItem);
                }
            }
        });

        // Remove core value buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.remove-core-value-btn')) {
                const valueItem = e.target.closest('.value-item');
                if (valueItem) {
                    this.removeCoreValue(valueItem);
                }
            }
            
            // Remove history buttons
            if (e.target.closest('.remove-history-btn')) {
                const historyItem = e.target.closest('.history-item');
                if (historyItem) {
                    this.removeHistoryItem(historyItem);
                }
            }
        });

        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    setupImageHandlers() {
        // About image handler
        const aboutImageInput = document.getElementById('aboutImage');
        const aboutImagePreview = document.getElementById('aboutImagePreview');
        
        if (aboutImageInput && aboutImagePreview) {
            aboutImageInput.addEventListener('change', (e) => {
                this.handleImageUpload(e, aboutImagePreview);
            });
            
            aboutImagePreview.addEventListener('click', () => {
                aboutImageInput.click();
            });
        }

        // Team member images
        document.addEventListener('change', (e) => {
            if (e.target.name && e.target.name.startsWith('memberImage')) {
                const preview = e.target.nextElementSibling;
                if (preview && preview.classList.contains('image-preview')) {
                    this.handleImageUpload(e, preview);
                }
            }
        });
    }

    setupCharacterCounters() {
        const fields = [
            { element: 'pageSeoDescription', maxLength: 160 },
            { element: 'aboutDescription', maxLength: 500 }
        ];

        fields.forEach(field => {
            const element = document.getElementById(field.element);
            if (element) {
                const counter = document.createElement('div');
                counter.className = 'char-counter';
                element.parentNode.appendChild(counter);
                
                const updateCounter = () => {
                    const currentLength = element.value.length;
                    counter.textContent = `${currentLength}/${field.maxLength} ký tự`;
                    
                    counter.classList.remove('warning', 'danger');
                    if (currentLength > field.maxLength * 0.9) {
                        counter.classList.add('danger');
                    } else if (currentLength > field.maxLength * 0.7) {
                        counter.classList.add('warning');
                    }
                };
                
                element.addEventListener('input', updateCounter);
                updateCounter();
            }
        });
    }

    setupIconPickers() {
        // Setup existing icon pickers
        this.initializeIconPickers();
        
        // Close dropdowns when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.icon-picker')) {
                document.querySelectorAll('.icon-dropdown.show').forEach(dropdown => {
                    dropdown.classList.remove('show');
                });
            }
        });
    }

    initializeIconPickers() {
        document.querySelectorAll('.icon-picker').forEach(picker => {
            this.setupSingleIconPicker(picker);
        });
    }

    setupSingleIconPicker(picker) {
        const preview = picker.querySelector('.icon-preview');
        const dropdown = picker.querySelector('.icon-dropdown');
        const hiddenInput = picker.parentNode.querySelector('input[type="hidden"]');
        
        if (!preview || !dropdown || !hiddenInput) return;

        // Toggle dropdown
        preview.addEventListener('click', (e) => {
            e.stopPropagation();
            const wasOpen = dropdown.classList.contains('show');
            
            // Close all other dropdowns
            document.querySelectorAll('.icon-dropdown.show').forEach(dd => {
                dd.classList.remove('show');
            });
            
            // Toggle current dropdown
            if (!wasOpen) {
                dropdown.classList.add('show');
            }
        });

        // Handle icon selection
        dropdown.querySelectorAll('.icon-option').forEach(option => {
            option.addEventListener('click', (e) => {
                e.stopPropagation();
                
                const selectedIcon = option.dataset.icon;
                
                // Update hidden input
                hiddenInput.value = selectedIcon;
                
                // Update preview
                const previewIcon = preview.querySelector('i');
                if (previewIcon) {
                    previewIcon.className = selectedIcon;
                }
                
                // Update active state
                dropdown.querySelectorAll('.icon-option').forEach(opt => {
                    opt.classList.remove('active');
                });
                option.classList.add('active');
                
                // Close dropdown
                dropdown.classList.remove('show');
                
                // Trigger change event
                this.hasUnsavedChanges = true;
                this.updateUI();
            });
        });
    }

    checkForChanges() {
        // Set up periodic change detection
        setInterval(() => {
            const formData = this.getFormData();
            const hasChanges = JSON.stringify(formData) !== JSON.stringify(this.originalData);
            
            if (hasChanges !== this.hasUnsavedChanges) {
                this.hasUnsavedChanges = hasChanges;
                this.updateUI();
            }
        }, 1000);
    }

    getFormData() {
        const form = document.getElementById('aboutContentForm');
        if (!form) return {};

        const formData = new FormData(form);
        const data = {};

        // Get basic form data
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }

        // Get reasons data
        data.reasons = [];
        const reasonItems = document.querySelectorAll('.reason-item');
        reasonItems.forEach((item) => {
            const iconInput = item.querySelector('input[name^="reasonIcon"]');
            const titleInput = item.querySelector('input[name^="reasonTitle"]');
            const descTextarea = item.querySelector('textarea[name^="reasonDescription"]');
            
            if (iconInput && titleInput && descTextarea) {
                data.reasons.push({
                    icon: iconInput.value,
                    title: titleInput.value,
                    description: descTextarea.value
                });
            }
        });

        // Get team data
        data.team = [];
        const memberItems = document.querySelectorAll('.team-member-item');
        memberItems.forEach((item, index) => {
            const nameInput = item.querySelector(`[name="memberName${index}"]`);
            const positionInput = item.querySelector(`[name="memberPosition${index}"]`);
            const descTextarea = item.querySelector(`[name="memberDescription${index}"]`);
            
            // Get contact information
            const phoneInput = item.querySelector(`[name="memberPhone${index}"]`);
            const emailInput = item.querySelector(`[name="memberEmail${index}"]`);
            const facebookInput = item.querySelector(`[name="memberFacebook${index}"]`);
            const tiktokInput = item.querySelector(`[name="memberTiktok${index}"]`);
            const zaloInput = item.querySelector(`[name="memberZalo${index}"]`);
            
            if (nameInput && positionInput && descTextarea) {
                data.team.push({
                    name: nameInput.value,
                    position: positionInput.value,
                    description: descTextarea.value,
                    contact: {
                        phone: phoneInput ? phoneInput.value : '',
                        email: emailInput ? emailInput.value : '',
                        facebook: facebookInput ? facebookInput.value : '',
                        tiktok: tiktokInput ? tiktokInput.value : '',
                        zalo: zaloInput ? zaloInput.value : ''
                    }
                });
            }
        });

        // Get core values data
        data.coreValues = [];
        const valueItems = document.querySelectorAll('.value-item');
        valueItems.forEach((item) => {
            const valueInput = item.querySelector('input[name^="coreValue"]');
            if (valueInput && valueInput.value.trim()) {
                data.coreValues.push(valueInput.value.trim());
            }
        });
        
        // Get history data
        data.history = [];
        const historyItems = document.querySelectorAll('.history-item');
        historyItems.forEach((item, index) => {
            const yearInput = item.querySelector(`[name="historyYear${index}"]`);
            const titleInput = item.querySelector(`[name="historyTitle${index}"]`);
            const descTextarea = item.querySelector(`[name="historyDescription${index}"]`);
            
            if (yearInput && titleInput && descTextarea) {
                data.history.push({
                    year: yearInput.value,
                    title: titleInput.value,
                    description: descTextarea.value
                });
            }
        });

        return data;
    }

    updateUI() {
        const saveBtn = document.getElementById('saveBtn');
        const saveContentBtn = document.getElementById('saveContentBtn');
        const resetBtn = document.getElementById('resetBtn');
        
        if (saveBtn) {
            saveBtn.disabled = !this.hasUnsavedChanges;
            saveBtn.textContent = this.hasUnsavedChanges ? 'Lưu thay đổi' : 'Đã lưu';
        }
        
        if (saveContentBtn) {
            saveContentBtn.disabled = !this.hasUnsavedChanges;
            if (this.hasUnsavedChanges) {
                saveContentBtn.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';
            } else {
                saveContentBtn.innerHTML = '<i class="fas fa-check"></i> Đã lưu';
            }
        }
        
        if (resetBtn) {
            resetBtn.disabled = !this.hasUnsavedChanges;
        }
    }

    handleImageUpload(event, previewContainer) {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
            this.showNotification('Kích thước hình ảnh không được vượt quá 5MB', 'error');
            event.target.value = '';
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
        if (!validTypes.includes(file.type)) {
            this.showNotification('Chỉ chấp nhận các định dạng: JPG, PNG, WebP, GIF', 'error');
            event.target.value = '';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = previewContainer.querySelector('.preview-img');
            if (img) {
                img.src = e.target.result;
                img.alt = file.name;
                
                // Add fade effect
                img.style.opacity = '0';
                setTimeout(() => {
                    img.style.transition = 'opacity 0.3s ease';
                    img.style.opacity = '1';
                }, 50);
            }
            
            this.hasUnsavedChanges = true;
            this.updateUI();
            this.showNotification('Đã tải hình ảnh thành công', 'success');
        };

        reader.onerror = () => {
            this.showNotification('Có lỗi xảy ra khi đọc file', 'error');
        };

        reader.readAsDataURL(file);
    }

    addReason() {
        const reasonsContainer = document.querySelector('.reasons-manager');
        const addButton = document.getElementById('addReasonBtn');
        
        if (!reasonsContainer || !addButton) return;

        const newReasonHTML = `
            <div class="reason-item" data-index="${this.reasonCount}">
                <div class="reason-header">
                    <div class="reason-icon-select">
                        <input type="hidden" name="reasonIcon${this.reasonCount}" value="fas fa-certificate">
                        <div class="icon-picker">
                            <div class="icon-preview">
                                <i class="fas fa-certificate"></i>
                            </div>
                            <div class="icon-dropdown">
                                <button type="button" class="icon-option active" data-icon="fas fa-certificate" title="Chứng nhận">
                                    <i class="fas fa-certificate"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-user-tie" title="Chuyên nghiệp">
                                    <i class="fas fa-user-tie"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-handshake" title="Cam kết">
                                    <i class="fas fa-handshake"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-dollar-sign" title="Chi phí">
                                    <i class="fas fa-dollar-sign"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-clock" title="Nhanh chóng">
                                    <i class="fas fa-clock"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-life-ring" title="Hỗ trợ">
                                    <i class="fas fa-life-ring"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <input type="text" name="reasonTitle${this.reasonCount}" placeholder="Tiêu đề lý do">
                </div>
                <textarea name="reasonDescription${this.reasonCount}" rows="3" placeholder="Mô tả chi tiết..."></textarea>
                <button type="button" class="btn btn-danger remove-reason-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newReasonHTML);
        
        // Setup icon picker for the new reason item
        const newReasonItem = addButton.previousElementSibling;
        const newIconPicker = newReasonItem.querySelector('.icon-picker');
        if (newIconPicker) {
            this.setupSingleIconPicker(newIconPicker);
        }
        
        this.reasonCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm lý do mới', 'success');
    }

    removeReason(reasonItem) {
        this.showConfirmDialog(
            'Xóa lý do',
            'Bạn có chắc chắn muốn xóa lý do này?',
            () => {
                reasonItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa lý do', 'success');
            }
        );
    }

    addTeamMember() {
        const teamContainer = document.querySelector('.team-manager');
        const addButton = document.getElementById('addMemberBtn');
        
        if (!teamContainer || !addButton) return;

        const newMemberHTML = `
            <div class="team-member-item" data-index="${this.memberCount}">
                <div class="member-form">
                    <div class="member-image">
                        <input type="file" name="memberImage${this.memberCount}" accept="image/*" style="display: none;">
                        <div class="image-preview" onclick="this.previousElementSibling.click()">
                            <img src="assets/images/av.png" alt="Team Member">
                            <div class="preview-overlay">
                                <i class="fas fa-camera"></i>
                            </div>
                        </div>
                    </div>
                    <div class="member-details">
                        <div class="basic-info">
                            <input type="text" name="memberName${this.memberCount}" placeholder="Họ và tên">
                            <input type="text" name="memberPosition${this.memberCount}" placeholder="Chức vụ">
                            <textarea name="memberDescription${this.memberCount}" rows="3" placeholder="Mô tả về thành viên..."></textarea>
                        </div>
                        <div class="contact-info">
                            <h5><i class="fas fa-address-book"></i> Thông tin liên lạc</h5>
                            <div class="contact-grid">
                                <div class="contact-item">
                                    <label><i class="fas fa-phone"></i> Điện thoại</label>
                                    <input type="tel" name="memberPhone${this.memberCount}" placeholder="Số điện thoại">
                                </div>
                                <div class="contact-item">
                                    <label><i class="fas fa-envelope"></i> Email</label>
                                    <input type="email" name="memberEmail${this.memberCount}" placeholder="Email">
                                </div>
                                <div class="contact-item">
                                    <label><i class="fab fa-facebook"></i> Facebook</label>
                                    <input type="url" name="memberFacebook${this.memberCount}" placeholder="Link Facebook">
                                </div>
                                <div class="contact-item">
                                    <label><i class="fab fa-tiktok"></i> TikTok</label>
                                    <input type="url" name="memberTiktok${this.memberCount}" placeholder="Link TikTok">
                                </div>
                                <div class="contact-item">
                                    <label><i class="fas fa-comment"></i> Zalo</label>
                                    <input type="text" name="memberZalo${this.memberCount}" placeholder="Số Zalo">
                                </div>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-danger remove-member-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newMemberHTML);
        this.memberCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm thành viên mới', 'success');
    }

    removeTeamMember(memberItem) {
        this.showConfirmDialog(
            'Xóa thành viên',
            'Bạn có chắc chắn muốn xóa thành viên này?',
            () => {
                memberItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa thành viên', 'success');
            }
        );
    }

    addCoreValue() {
        const coreValuesContainer = document.getElementById('coreValuesContainer');
        const addButton = document.getElementById('addCoreValueBtn');
        
        if (!coreValuesContainer || !addButton) return;

        this.coreValueCount++;
        
        const newValueHTML = `
            <div class="value-item" data-index="${this.coreValueCount}">
                <input type="text" name="coreValue${this.coreValueCount}" placeholder="Nhập giá trị cốt lõi..." value="">
                <button type="button" class="btn btn-danger remove-core-value-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newValueHTML);
        
        // Focus on the new input
        const newInput = coreValuesContainer.querySelector(`[name="coreValue${this.coreValueCount}"]`);
        if (newInput) {
            newInput.focus();
        }
        
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm giá trị cốt lõi mới', 'success');
    }

    removeCoreValue(valueItem) {
        // Prevent removing if only one item remains
        const coreValuesContainer = document.getElementById('coreValuesContainer');
        const valueItems = coreValuesContainer?.querySelectorAll('.value-item');
        
        if (valueItems && valueItems.length <= 1) {
            this.showNotification('Phải có ít nhất một giá trị cốt lõi', 'warning');
            return;
        }
        
        this.showConfirmDialog(
            'Xóa giá trị cốt lõi',
            'Bạn có chắc chắn muốn xóa giá trị này?',
            () => {
                valueItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa giá trị cốt lõi', 'success');
            }
        );
    }

    addHistoryItem() {
        const historyContainer = document.querySelector('.history-manager');
        const addButton = document.getElementById('addHistoryBtn');
        
        if (!historyContainer || !addButton) return;

        const newHistoryHTML = `
            <div class="history-item" data-index="${this.historyCount}">
                <div class="history-form">
                    <div class="history-year">
                        <label><i class="fas fa-calendar"></i> Năm</label>
                        <input type="number" name="historyYear${this.historyCount}" value="${new Date().getFullYear()}" placeholder="YYYY" min="1990" max="2030">
                    </div>
                    <div class="history-details">
                        <div class="form-group">
                            <label>Tiêu đề sự kiện</label>
                            <input type="text" name="historyTitle${this.historyCount}" placeholder="Tiêu đề cột mốc">
                        </div>
                        <div class="form-group">
                            <label>Mô tả chi tiết</label>
                            <textarea name="historyDescription${this.historyCount}" rows="3" placeholder="Mô tả về cột mốc này..."></textarea>
                        </div>
                    </div>
                    <button type="button" class="btn btn-danger remove-history-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newHistoryHTML);
        this.historyCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm cột mốc mới', 'success');
    }

    removeHistoryItem(historyItem) {
        this.showConfirmDialog(
            'Xóa cột mốc',
            'Bạn có chắc chắn muốn xóa cột mốc này?',
            () => {
                historyItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa cột mốc', 'success');
            }
        );
    }

    async saveContent() {
        try {
            this.showLoadingState(true);
            
            const formData = this.getFormData();
            
            // Validate data
            if (!this.validateData(formData)) {
                return;
            }

            // In real app, send to API
            await this.simulateApiCall();

            // Update original data
            this.originalData = { ...formData };
            this.hasUnsavedChanges = false;
            this.updateUI();

            this.showNotification('Đã lưu nội dung thành công!', 'success');

        } catch (error) {
            console.error('Error saving content:', error);
            this.showNotification('Có lỗi xảy ra khi lưu nội dung!', 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    validateData(data) {
        const errors = [];

        if (!data.pageTitle || data.pageTitle.trim().length < 3) {
            errors.push('Tiêu đề trang phải có ít nhất 3 ký tự');
        }

        if (!data.aboutTitle || data.aboutTitle.trim().length < 3) {
            errors.push('Tiêu đề phần "Về chúng tôi" không được để trống');
        }

        if (!data.aboutDescription || data.aboutDescription.trim().length < 50) {
            errors.push('Mô tả về công ty phải có ít nhất 50 ký tự');
        }

        if (errors.length > 0) {
            this.showNotification(errors.join('. '), 'error');
            return false;
        }

        return true;
    }

    resetForm() {
        this.populateForm();
        this.hasUnsavedChanges = false;
        this.updateUI();
        this.showNotification('Đã khôi phục nội dung ban đầu', 'success');
    }

    showPreview() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.classList.add('show');
            
            // Refresh iframe
            const frame = document.getElementById('previewFrame');
            if (frame) {
                frame.src = frame.src; // Reload iframe
            }
        }
    }

    closePreview() {
        const modal = document.getElementById('previewModal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    showLoadingState(loading) {
        const saveBtn = document.getElementById('saveBtn');
        const saveContentBtn = document.getElementById('saveContentBtn');
        const form = document.getElementById('aboutContentForm');

        if (loading) {
            if (saveBtn) {
                saveBtn.disabled = true;
                saveBtn.classList.add('loading');
            }
            if (saveContentBtn) {
                saveContentBtn.disabled = true;
                saveContentBtn.classList.add('loading');
            }
            if (form) {
                form.classList.add('loading');
            }
        } else {
            if (saveBtn) {
                saveBtn.disabled = false;
                saveBtn.classList.remove('loading');
            }
            if (saveContentBtn) {
                saveContentBtn.disabled = false;
                saveContentBtn.classList.remove('loading');
            }
            if (form) {
                form.classList.remove('loading');
            }
        }
    }

    showConfirmDialog(title, message, onConfirm) {
        if (confirm(`${title}\n\n${message}`)) {
            onConfirm();
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-${this.getNotificationIcon(type)}"></i>
                <span>${message}</span>
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;

        // Add to container
        let container = document.querySelector('.notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'notifications-container';
            document.body.appendChild(container);
        }

        container.appendChild(notification);

        // Auto remove
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 5000);

        // Close button
        const closeBtn = notification.querySelector('.notification-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                notification.remove();
            });
        }
    }

    getNotificationIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || icons.info;
    }

    simulateApiCall(delay = 1500) {
        return new Promise(resolve => {
            setTimeout(resolve, delay);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.aboutContentManager = new AboutContentManager();
});