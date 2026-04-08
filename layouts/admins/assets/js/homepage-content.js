// Homepage Content Management System
class HomepageContentManager {
    constructor() {
        this.originalData = {};
        this.hasUnsavedChanges = false;
        this.serviceCount = 4; // Start with 4 default services
        this.conditionCount = 1; // Start with 1 default condition
        this.advantageCount = 6; // Start with 6 default advantages
        this.faqCount = 1; // Start with 1 default FAQ
        this.costCount = 2; // Start with 2 default costs
        this.roadmapCount = 3; // Start with 3 default roadmap steps
        
        this.init();
    }

    init() {
        this.loadCurrentData();
        this.setupEventListeners();
        this.setupImageHandlers();
        this.setupIconPickers();
        this.checkForChanges();
    }

    loadCurrentData() {
        // Load current homepage content data (in real app, this would be from API)
        this.originalData = {
            seo: {
                seoTitle: 'Du Học NB - Dịch Vụ Tư Vấn Du Học Uy Tín',
                seoDescription: 'Du Học NB - Công ty tư vấn du học Nhật Bản uy tín hàng đầu. Tỷ lệ visa thành công 98%, hỗ trợ toàn diện từ A-Z. Liên hệ ngay để được tư vấn miễn phí!',
                seoKeywords: 'du học Nhật Bản, tư vấn du học, visa Nhật Bản'
            },
            contact: {
                contactEmail: 'info@duhocnb.com',
                hotlineNumber: '+84 123 456 789',
                facebookUrl: '#',
                youtubeUrl: '#',
                instagramUrl: '#',
                linkedinUrl: '#'
            },
            hero: {
                heroBannerAlt: 'Du học Nhật Bản - Vững bước tương lai'
            },
            services: {
                servicesTitle: 'Bạn đang muốn...',
                servicesSubtitle: 'Chúng tôi cung cấp đầy đủ các dịch vụ để bạn thực hiện ước mơ du học',
                items: [
                    {
                        icon: 'fas fa-graduation-cap',
                        title: 'TƯ VẤN CHỌN TRƯỜNG',
                        description: 'Tư vấn chọn trường phù hợp với năng lực, sở thích và ngân sách của từng học sinh.'
                    },
                    {
                        icon: 'fas fa-file-signature',
                        title: 'HỖ TRỢ HỒ SƠ',
                        description: 'Hướng dẫn chuẩn bị hồ sơ admission và hỗ trợ xin học bổng du học Nhật Bản.'
                    },
                    {
                        icon: 'fas fa-language',
                        title: 'HỌC TIẾNG NHẬT',
                        description: 'Khóa học tiếng Nhật từ cơ bản đến nâng cao, luyện thi JLPT N5-N1.'
                    },
                    {
                        icon: 'fas fa-passport',
                        title: 'VISA & THỦ TỤC',
                        description: 'Hỗ trợ làm visa du học và các thủ tục pháp lý cần thiết tại Nhật Bản.'
                    }
                ]
            },
            whyChoose: {
                whyChooseTitle: 'Tại sao lựa chọn',
                whyChooseSubtitle: 'DU HỌC NHẬT BẢN CÙNG CHÚNG TÔI?',
                whyChooseCTA: 'ĐĂNG KÝ TƯ VẤN',
                advantages: [
                    'Đội ngũ tư vấn viên giàu kinh nghiệm, từng du học tại Nhật Bản',
                    'Tỷ lệ visa thành công 98% trong 5 năm qua',
                    'Hỗ trợ học bổng lên đến 100% học phí tại các trường uy tín',
                    'Theo dõi và hỗ trợ sinh viên suốt quá trình học tập tại Nhật',
                    'Chi phí tư vấn minh bạch, không phát sinh thêm chi phí',
                    'Đối tác chính thức với hơn 50 trường đại học và học viện tại Nhật'
                ]
            },
            conditions: {
                conditionsTitle: 'Điều Kiện Du Học Nhật Bản',
                conditionsSubtitle: 'Những yêu cầu cần thiết để bạn có thể du học tại Nhật Bản',
                items: [
                    {
                        icon: 'fas fa-birthday-cake',
                        title: 'Độ Tuổi',
                        description: 'Từ 18-30 tuổi'
                    }
                ]
            },
            costs: {
                costsTitle: 'Chi Phí Du Học Nhật Bản',
                costsSubtitle: 'Tổng quan chi phí cần thiết cho chuyến du học Nhật Bản',
                items: [
                    {
                        icon: 'fas fa-university',
                        title: 'Học phí trung bình',
                        amount: '800,000 - 1,500,000 JPY/năm',
                        description: 'Tùy thuộc vào loại trường và chương trình học, học phí có thể dao động từ 800,000 đến 1,500,000 JPY mỗi năm. Trường công lập thường có mức phí thấp hơn trường tư thục.'
                    },
                    {
                        icon: 'fas fa-home',
                        title: 'Chi phí sinh hoạt',
                        amount: '100,000 - 150,000 JPY/tháng',
                        description: 'Bao gồm tiền nhà, ăn uống, di chuyển, và các chi phí sinh hoạt khác. Mức chi phí có thể thay đổi tùy vào khu vực sinh sống và lối sống cá nhân.'
                    }
                ]
            },
            roadmap: {
                roadmapTitle: 'Lộ Trình Du Học Nhật Bản',
                roadmapSubtitle: 'Hành trình từ chuẩn bị đến thành công trong việc du học tại Nhật Bản',
                items: [
                    {
                        step: 1,
                        icon: 'fas fa-search',
                        title: 'Tìm hiểu thông tin',
                        duration: '1-2 tháng',
                        description: 'Tìm hiểu về hệ thống giáo dục, các trường đại học, điều kiện tuyển sinh, chi phí du học và cuộc sống tại Nhật Bản. Thu thập thông tin về các chương trình học phù hợp.'
                    },
                    {
                        step: 2,
                        icon: 'fas fa-language',
                        title: 'Học tiếng Nhật',
                        duration: '6-12 tháng',
                        description: 'Tham gia khóa học tiếng Nhật để đạt ít nhất trình độ N5. Nhiều trường yêu cầu N3 hoặc N2 để vào đại học. Có thể học tại trung tâm hoặc tự học online.'
                    },
                    {
                        step: 3,
                        icon: 'fas fa-file-alt',
                        title: 'Chuẩn bị hồ sơ',
                        duration: '2-3 tháng',
                        description: 'Chuẩn bị đầy đủ hồ sơ bao gồm bằng tốt nghiệp, chứng chỉ tiếng Nhật, chứng minh tài chính, CV, thư động lực và các giấy tờ khác theo yêu cầu của từng trường.'
                    }
                ]
            },
            faq: {
                faqTitle: 'CÁC CÂU HỎI THƯỜNG GẶP VỀ DU HỌC NHẬT BẢN',
                faqSubtitle: 'Giải đáp những thắc mắc phổ biến về du học Nhật Bản',
                items: [
                    {
                        question: 'Điều kiện để du học Nhật Bản là gì?',
                        answer: 'Để du học Nhật Bản, bạn cần có bằng tốt nghiệp THPT, chứng chỉ tiếng Nhật (tối thiểu N5), chứng minh tài chính và hồ sơ sức khỏe. Tùy vào từng trường và chương trình học, yêu cầu có thể khác nhau.'
                    }
                ]
            }
        };

        this.populateForm();
    }

    populateForm() {
        // Populate SEO data
        Object.keys(this.originalData.seo).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = this.originalData.seo[key];
            }
        });

        // Populate contact data
        Object.keys(this.originalData.contact).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = this.originalData.contact[key];
            }
        });

        // Populate hero data
        Object.keys(this.originalData.hero).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = this.originalData.hero[key];
            }
        });

        // Populate services data
        const servicesTitle = document.getElementById('servicesTitle');
        const servicesSubtitle = document.getElementById('servicesSubtitle');
        if (servicesTitle) servicesTitle.value = this.originalData.services.servicesTitle;
        if (servicesSubtitle) servicesSubtitle.value = this.originalData.services.servicesSubtitle;

        // Populate why choose data
        Object.keys(this.originalData.whyChoose).forEach(key => {
            if (key === 'advantages') return; // Handle separately
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = this.originalData.whyChoose[key];
            }
        });

        // Populate advantages
        this.originalData.whyChoose.advantages.forEach((advantage, index) => {
            const element = document.querySelector(`[name="advantage${index}"]`);
            if (element) {
                element.value = advantage;
            }
        });

        // Populate conditions data
        const conditionsTitle = document.getElementById('conditionsTitle');
        const conditionsSubtitle = document.getElementById('conditionsSubtitle');
        if (conditionsTitle) conditionsTitle.value = this.originalData.conditions.conditionsTitle;
        if (conditionsSubtitle) conditionsSubtitle.value = this.originalData.conditions.conditionsSubtitle;

        // Populate costs data
        const costsTitle = document.getElementById('costsTitle');
        const costsSubtitle = document.getElementById('costsSubtitle');
        if (costsTitle) costsTitle.value = this.originalData.costs.costsTitle;
        if (costsSubtitle) costsSubtitle.value = this.originalData.costs.costsSubtitle;

        // Populate roadmap data
        const roadmapTitle = document.getElementById('roadmapTitle');
        const roadmapSubtitle = document.getElementById('roadmapSubtitle');
        if (roadmapTitle) roadmapTitle.value = this.originalData.roadmap.roadmapTitle;
        if (roadmapSubtitle) roadmapSubtitle.value = this.originalData.roadmap.roadmapSubtitle;

        // Populate FAQ data
        const faqTitle = document.getElementById('faqTitle');
        const faqSubtitle = document.getElementById('faqSubtitle');
        if (faqTitle) faqTitle.value = this.originalData.faq.faqTitle;
        if (faqSubtitle) faqSubtitle.value = this.originalData.faq.faqSubtitle;
    }

    setupEventListeners() {
        // Form change detection
        const form = document.getElementById('homepageContentForm');
        if (form) {
            form.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
                this.updateUI();
            });
        }

        // Save button
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
                this.resetForm();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetForm();
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

        // Add service button
        const addServiceBtn = document.getElementById('addServiceBtn');
        if (addServiceBtn) {
            addServiceBtn.addEventListener('click', () => {
                this.addService();
            });
        }

        // Add condition button
        const addConditionBtn = document.getElementById('addConditionBtn');
        if (addConditionBtn) {
            addConditionBtn.addEventListener('click', () => {
                this.addCondition();
            });
        }

        // Add advantage button
        const addAdvantageBtn = document.getElementById('addAdvantageBtn');
        if (addAdvantageBtn) {
            addAdvantageBtn.addEventListener('click', () => {
                this.addAdvantage();
            });
        }

        // Add FAQ button
        const addFaqBtn = document.getElementById('addFaqBtn');
        if (addFaqBtn) {
            addFaqBtn.addEventListener('click', () => {
                this.addFaq();
            });
        }

        // Add cost button
        const addCostBtn = document.getElementById('addCostBtn');
        if (addCostBtn) {
            addCostBtn.addEventListener('click', () => {
                this.addCost();
            });
        }

        // Add roadmap button
        const addRoadmapBtn = document.getElementById('addRoadmapBtn');
        if (addRoadmapBtn) {
            addRoadmapBtn.addEventListener('click', () => {
                this.addRoadmap();
            });
        }

        // Remove buttons
        document.addEventListener('click', (e) => {
            // Remove service buttons
            if (e.target.closest('.remove-service-btn')) {
                const serviceItem = e.target.closest('.service-item');
                if (serviceItem) {
                    this.removeService(serviceItem);
                }
            }
            
            // Remove condition buttons
            if (e.target.closest('.remove-condition-btn')) {
                const conditionItem = e.target.closest('.condition-item');
                if (conditionItem) {
                    this.removeCondition(conditionItem);
                }
            }
            
            // Remove advantage buttons
            if (e.target.closest('.remove-advantage-btn')) {
                const advantageItem = e.target.closest('.advantage-item');
                if (advantageItem) {
                    this.removeAdvantage(advantageItem);
                }
            }
            
            // Remove FAQ buttons
            if (e.target.closest('.remove-faq-btn')) {
                const faqItem = e.target.closest('.faq-item');
                if (faqItem) {
                    this.removeFaq(faqItem);
                }
            }
            
            // Remove cost buttons
            if (e.target.closest('.remove-cost-btn')) {
                const costItem = e.target.closest('.cost-item');
                if (costItem) {
                    this.removeCost(costItem);
                }
            }
            
            // Remove roadmap buttons
            if (e.target.closest('.remove-roadmap-btn')) {
                const roadmapItem = e.target.closest('.roadmap-item');
                if (roadmapItem) {
                    this.removeRoadmap(roadmapItem);
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
        // Handle image uploads
        document.addEventListener('change', (e) => {
            if (e.target.type === 'file' && e.target.accept.includes('image')) {
                const preview = e.target.nextElementSibling;
                if (preview && preview.classList.contains('image-preview')) {
                    this.handleImageUpload(e, preview);
                }
            }
        });

        // Handle image preview clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.image-preview')) {
                const preview = e.target.closest('.image-preview');
                const fileInput = preview.previousElementSibling;
                if (fileInput && fileInput.type === 'file') {
                    fileInput.click();
                }
            }
        });
    }

    handleImageUpload(event, previewElement) {
        const file = event.target.files[0];
        if (file) {
            if (file.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = previewElement.querySelector('img');
                    if (img) {
                        img.src = e.target.result;
                    }
                    this.hasUnsavedChanges = true;
                    this.updateUI();
                };
                reader.readAsDataURL(file);
            } else {
                this.showNotification('Vui lòng chọn file hình ảnh', 'error');
            }
        }
    }

    setupIconPickers() {
        // Initialize existing icon pickers
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
            document.querySelectorAll('.icon-dropdown.show').forEach(d => {
                if (d !== dropdown) d.classList.remove('show');
            });
            
            // Toggle this dropdown
            dropdown.classList.toggle('show', !wasOpen);
        });

        // Handle icon selection
        dropdown.querySelectorAll('.icon-option').forEach(option => {
            option.addEventListener('click', () => {
                const iconClass = option.getAttribute('data-icon');
                
                // Update hidden input
                hiddenInput.value = iconClass;
                
                // Update preview
                const previewIcon = preview.querySelector('i');
                previewIcon.className = iconClass;
                
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
        const form = document.getElementById('homepageContentForm');
        if (!form) return {};

        const formData = new FormData(form);
        const data = {
            seo: {},
            contact: {},
            hero: {},
            services: { items: [] },
            whyChoose: { advantages: [] },
            conditions: { items: [] },
            costs: { items: [] },
            roadmap: { items: [] },
            faq: { items: [] }
        };

        // Get basic form data
        for (let [key, value] of formData.entries()) {
            if (key.includes('seo')) {
                data.seo[key] = value;
            } else if (key.includes('contact') || ['hotlineNumber', 'facebookUrl', 'youtubeUrl', 'instagramUrl', 'linkedinUrl'].includes(key)) {
                data.contact[key] = value;
            } else if (key.includes('hero') || key === 'heroBannerAlt') {
                data.hero[key] = value;
            } else if (key.includes('services')) {
                data.services[key] = value;
            } else if (key.includes('whyChoose')) {
                data.whyChoose[key] = value;
            } else if (key.includes('conditions')) {
                data.conditions[key] = value;
            } else if (key.includes('costs')) {
                data.costs[key] = value;
            } else if (key.includes('roadmap')) {
                data.roadmap[key] = value;
            } else if (key.includes('faq')) {
                data.faq[key] = value;
            }
        }

        // Get services data
        const serviceItems = document.querySelectorAll('.service-item');
        serviceItems.forEach((item, index) => {
            const iconInput = item.querySelector(`[name="serviceIcon${index}"]`);
            const titleInput = item.querySelector(`[name="serviceTitle${index}"]`);
            const descTextarea = item.querySelector(`[name="serviceDescription${index}"]`);
            
            if (iconInput && titleInput && descTextarea) {
                data.services.items.push({
                    icon: iconInput.value,
                    title: titleInput.value,
                    description: descTextarea.value
                });
            }
        });

        // Get advantages data
        const advantageItems = document.querySelectorAll('.advantage-item');
        advantageItems.forEach((item, index) => {
            const advantageInput = item.querySelector(`[name="advantage${index}"]`);
            if (advantageInput && advantageInput.value.trim()) {
                data.whyChoose.advantages.push(advantageInput.value.trim());
            }
        });

        // Get conditions data
        const conditionItems = document.querySelectorAll('.condition-item');
        conditionItems.forEach((item, index) => {
            const iconInput = item.querySelector(`[name="conditionIcon${index}"]`);
            const titleInput = item.querySelector(`[name="conditionTitle${index}"]`);
            const descInput = item.querySelector(`[name="conditionDescription${index}"]`);
            
            if (iconInput && titleInput && descInput) {
                data.conditions.items.push({
                    icon: iconInput.value,
                    title: titleInput.value,
                    description: descInput.value
                });
            }
        });

        // Get costs data
        const costItems = document.querySelectorAll('.cost-item');
        costItems.forEach((item, index) => {
            const iconInput = item.querySelector(`[name="costIcon${index}"]`);
            const titleInput = item.querySelector(`[name="costTitle${index}"]`);
            const amountInput = item.querySelector(`[name="costAmount${index}"]`);
            const descTextarea = item.querySelector(`[name="costDescription${index}"]`);
            
            if (iconInput && titleInput && amountInput && descTextarea) {
                data.costs.items.push({
                    icon: iconInput.value,
                    title: titleInput.value,
                    amount: amountInput.value,
                    description: descTextarea.value
                });
            }
        });

        // Get roadmap data
        const roadmapItems = document.querySelectorAll('.roadmap-item');
        roadmapItems.forEach((item, index) => {
            const stepInput = item.querySelector(`[name="roadmapStep${index}"]`);
            const iconInput = item.querySelector(`[name="roadmapIcon${index}"]`);
            const titleInput = item.querySelector(`[name="roadmapTitle${index}"]`);
            const durationInput = item.querySelector(`[name="roadmapDuration${index}"]`);
            const descTextarea = item.querySelector(`[name="roadmapDescription${index}"]`);
            
            if (stepInput && iconInput && titleInput && durationInput && descTextarea) {
                data.roadmap.items.push({
                    step: parseInt(stepInput.value),
                    icon: iconInput.value,
                    title: titleInput.value,
                    duration: durationInput.value,
                    description: descTextarea.value
                });
            }
        });

        // Get FAQ data
        const faqItems = document.querySelectorAll('.faq-item');
        faqItems.forEach((item, index) => {
            const questionInput = item.querySelector(`[name="faqQuestion${index}"]`);
            const answerTextarea = item.querySelector(`[name="faqAnswer${index}"]`);
            
            if (questionInput && answerTextarea) {
                data.faq.items.push({
                    question: questionInput.value,
                    answer: answerTextarea.value
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
            resetBtn.style.display = this.hasUnsavedChanges ? 'flex' : 'none';
        }
    }

    addService() {
        const servicesList = document.querySelector('.services-list');
        const addButton = document.getElementById('addServiceBtn');
        
        if (!servicesList || !addButton) return;

        const newServiceHTML = `
            <div class="service-item" data-index="${this.serviceCount}">
                <div class="service-form">
                    <div class="service-icon-select">
                        <label>Icon dịch vụ</label>
                        <div class="icon-picker">
                            <input type="hidden" name="serviceIcon${this.serviceCount}" value="fas fa-star">
                            <div class="icon-preview">
                                <i class="fas fa-star"></i>
                            </div>
                            <div class="icon-dropdown">
                                <button type="button" class="icon-option active" data-icon="fas fa-star" title="Sao">
                                    <i class="fas fa-star"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-graduation-cap" title="Tốt nghiệp">
                                    <i class="fas fa-graduation-cap"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-file-signature" title="Hồ sơ">
                                    <i class="fas fa-file-signature"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-language" title="Ngôn ngữ">
                                    <i class="fas fa-language"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-passport" title="Visa">
                                    <i class="fas fa-passport"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-university" title="Trường học">
                                    <i class="fas fa-university"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="service-details">
                        <div class="form-group">
                            <label>Tiêu đề dịch vụ</label>
                            <input type="text" name="serviceTitle${this.serviceCount}" placeholder="Nhập tiêu đề dịch vụ">
                        </div>
                        
                        <div class="form-group">
                            <label>Mô tả dịch vụ</label>
                            <textarea name="serviceDescription${this.serviceCount}" rows="3" placeholder="Mô tả chi tiết dịch vụ"></textarea>
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-danger remove-service-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newServiceHTML);
        
        // Initialize icon picker for new service
        const newServiceItem = servicesList.querySelector(`[data-index="${this.serviceCount}"]`);
        const newIconPicker = newServiceItem.querySelector('.icon-picker');
        this.setupSingleIconPicker(newIconPicker);
        
        this.serviceCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm dịch vụ mới', 'success');
    }

    removeService(serviceItem) {
        this.showConfirmDialog(
            'Xóa dịch vụ',
            'Bạn có chắc chắn muốn xóa dịch vụ này?',
            () => {
                serviceItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa dịch vụ', 'success');
            }
        );
    }

    addCondition() {
        const conditionsList = document.querySelector('.conditions-list');
        const addButton = document.getElementById('addConditionBtn');
        
        if (!conditionsList || !addButton) return;

        const newConditionHTML = `
            <div class="condition-item" data-index="${this.conditionCount}">
                <div class="condition-form">
                    <div class="condition-icon-select">
                        <label>Icon điều kiện</label>
                        <div class="icon-picker">
                            <input type="hidden" name="conditionIcon${this.conditionCount}" value="fas fa-check">
                            <div class="icon-preview">
                                <i class="fas fa-check"></i>
                            </div>
                            <div class="icon-dropdown">
                                <button type="button" class="icon-option active" data-icon="fas fa-check" title="Kiểm tra">
                                    <i class="fas fa-check"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-birthday-cake" title="Tuổi tác">
                                    <i class="fas fa-birthday-cake"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-graduation-cap" title="Học vấn">
                                    <i class="fas fa-graduation-cap"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-chart-line" title="Điểm số">
                                    <i class="fas fa-chart-line"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-language" title="Ngôn ngữ">
                                    <i class="fas fa-language"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-money-bill-wave" title="Tài chính">
                                    <i class="fas fa-money-bill-wave"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="condition-details">
                        <div class="form-group">
                            <label>Tiêu đề điều kiện</label>
                            <input type="text" name="conditionTitle${this.conditionCount}" placeholder="Nhập tiêu đề điều kiện">
                        </div>
                        
                        <div class="form-group">
                            <label>Mô tả điều kiện</label>
                            <input type="text" name="conditionDescription${this.conditionCount}" placeholder="Mô tả chi tiết điều kiện">
                        </div>
                    </div>
                    
                    <button type="button" class="btn btn-danger remove-condition-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newConditionHTML);
        
        // Initialize icon picker for new condition
        const newConditionItem = conditionsList.querySelector(`[data-index="${this.conditionCount}"]`);
        const newIconPicker = newConditionItem.querySelector('.icon-picker');
        this.setupSingleIconPicker(newIconPicker);
        
        this.conditionCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm điều kiện mới', 'success');
    }

    removeCondition(conditionItem) {
        this.showConfirmDialog(
            'Xóa điều kiện',
            'Bạn có chắc chắn muốn xóa điều kiện này?',
            () => {
                conditionItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa điều kiện', 'success');
            }
        );
    }

    addAdvantage() {
        const advantagesList = document.getElementById('advantagesList');
        const addButton = document.getElementById('addAdvantageBtn');
        
        if (!advantagesList || !addButton) return;

        const newAdvantageHTML = `
            <div class="advantage-item" data-index="${this.advantageCount}">
                <input type="text" name="advantage${this.advantageCount}" placeholder="Nhập ưu điểm...">
                <button type="button" class="btn btn-danger remove-advantage-btn">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newAdvantageHTML);
        this.advantageCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm ưu điểm mới', 'success');
    }

    removeAdvantage(advantageItem) {
        advantageItem.remove();
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã xóa ưu điểm', 'success');
    }

    addFaq() {
        const faqList = document.querySelector('.faq-list');
        const addButton = document.getElementById('addFaqBtn');
        
        if (!faqList || !addButton) return;

        const newFaqHTML = `
            <div class="faq-item" data-index="${this.faqCount}">
                <div class="faq-form">
                    <div class="form-group">
                        <label>Câu hỏi</label>
                        <input type="text" name="faqQuestion${this.faqCount}" placeholder="Nhập câu hỏi">
                    </div>
                    
                    <div class="form-group">
                        <label>Câu trả lời</label>
                        <textarea name="faqAnswer${this.faqCount}" rows="4" placeholder="Nhập câu trả lời"></textarea>
                    </div>
                    
                    <button type="button" class="btn btn-danger remove-faq-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newFaqHTML);
        this.faqCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm câu hỏi mới', 'success');
    }

    removeFaq(faqItem) {
        this.showConfirmDialog(
            'Xóa câu hỏi',
            'Bạn có chắc chắn muốn xóa câu hỏi này?',
            () => {
                faqItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa câu hỏi', 'success');
            }
        );
    }

    addCost() {
        const costsList = document.querySelector('.costs-list');
        const addButton = document.getElementById('addCostBtn');
        
        if (!costsList || !addButton) return;

        const newCostHTML = `
            <div class="cost-item" data-index="${this.costCount}">
                <div class="cost-form">
                    <div class="cost-icon-select">
                        <label>Icon chi phí</label>
                        <div class="icon-picker">
                            <input type="hidden" name="costIcon${this.costCount}" value="fas fa-coins">
                            <div class="icon-preview">
                                <i class="fas fa-coins"></i>
                            </div>
                            <div class="icon-dropdown">
                                <button type="button" class="icon-option" data-icon="fas fa-university" title="Học phí">
                                    <i class="fas fa-university"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-home" title="Chí phí sinh hoạt">
                                    <i class="fas fa-home"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-plane" title="Vé máy bay">
                                    <i class="fas fa-plane"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-passport" title="Visa">
                                    <i class="fas fa-passport"></i>
                                </button>
                                <button type="button" class="icon-option active" data-icon="fas fa-coins" title="Khác">
                                    <i class="fas fa-coins"></i>
                                </button>
                                <button type="button" class="icon-option" data-icon="fas fa-credit-card" title="Thẻ tín dụng">
                                    <i class="fas fa-credit-card"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div class="cost-details">
                        <div class="form-group">
                            <label>Loại chi phí</label>
                            <input type="text" name="costTitle${this.costCount}" placeholder="Nhập loại chi phí">
                        </div>

                        <div class="form-group">
                            <label>Chi tiết</label>
                            <input type="text" name="costAmount${this.costCount}" placeholder="Nhập mức chi phí hoặc thông tin chi tiết">
                        </div>

                        <div class="form-group">
                            <label>Mô tả</label>
                            <textarea name="costDescription${this.costCount}" rows="3" placeholder="Mô tả chi tiết về khoản chi phí này"></textarea>
                        </div>
                    </div>

                    <button type="button" class="btn btn-danger remove-cost-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newCostHTML);
        
        // Initialize icon picker for new cost
        const newCostItem = costsList.querySelector(`[data-index="${this.costCount}"]`);
        const newIconPicker = newCostItem.querySelector('.icon-picker');
        this.setupSingleIconPicker(newIconPicker);
        
        this.costCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm chi phí mới', 'success');
    }

    removeCost(costItem) {
        this.showConfirmDialog(
            'Xóa chi phí',
            'Bạn có chắc chắn muốn xóa chi phí này?',
            () => {
                costItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa chi phí', 'success');
            }
        );
    }

    addRoadmap() {
        const roadmapList = document.querySelector('.roadmap-list');
        const addButton = document.getElementById('addRoadmapBtn');
        
        if (!roadmapList || !addButton) return;

        const newRoadmapHTML = `
            <div class="roadmap-item" data-index="${this.roadmapCount}">
                <div class="roadmap-form">
                    <div class="roadmap-step-info">
                        <div class="form-group">
                            <label>Số bước</label>
                            <input type="number" name="roadmapStep${this.roadmapCount}" value="${this.roadmapCount + 1}" min="1" max="10" placeholder="Nhập số thứ tự">
                        </div>
                    </div>

                    <div class="roadmap-content">
                        <div class="form-group">
                            <label>Tiêu đề bước</label>
                            <input type="text" name="roadmapTitle${this.roadmapCount}" placeholder="Nhập tiêu đề bước">
                        </div>

                        <div class="form-group">
                            <label>Mô tả chi tiết</label>
                            <textarea name="roadmapDescription${this.roadmapCount}" rows="3" placeholder="Mô tả chi tiết nội dung của bước này"></textarea>
                        </div>
                    </div>

                    <button type="button" class="btn btn-danger remove-roadmap-btn">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;

        addButton.insertAdjacentHTML('beforebegin', newRoadmapHTML);
        
        // Initialize icon picker for new roadmap
        const newRoadmapItem = roadmapList.querySelector(`[data-index="${this.roadmapCount}"]`);
        
        this.roadmapCount++;
        this.hasUnsavedChanges = true;
        this.updateUI();
        this.showNotification('Đã thêm bước mới', 'success');
    }

    removeRoadmap(roadmapItem) {
        this.showConfirmDialog(
            'Xóa bước',
            'Bạn có chắc chắn muốn xóa bước này?',
            () => {
                roadmapItem.remove();
                this.hasUnsavedChanges = true;
                this.updateUI();
                this.showNotification('Đã xóa bước', 'success');
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

            this.showNotification('Đã lưu nội dung trang chủ thành công!', 'success');

        } catch (error) {
            console.error('Error saving content:', error);
            this.showNotification('Có lỗi xảy ra khi lưu nội dung!', 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    validateData(data) {
        const errors = [];

        // Validate SEO
        if (!data.seo.seoTitle || data.seo.seoTitle.trim().length < 10) {
            errors.push('Tiêu đề SEO phải có ít nhất 10 ký tự');
        }

        if (!data.seo.seoDescription || data.seo.seoDescription.trim().length < 50) {
            errors.push('Mô tả SEO phải có ít nhất 50 ký tự');
        }

        // Validate contact
        if (!data.contact.contactEmail || !this.isValidEmail(data.contact.contactEmail)) {
            errors.push('Email liên hệ không hợp lệ');
        }

        if (!data.contact.hotlineNumber || data.contact.hotlineNumber.trim().length < 10) {
            errors.push('Số hotline không hợp lệ');
        }

        // Validate services
        if (!data.services.items || data.services.items.length === 0) {
            errors.push('Phải có ít nhất một dịch vụ');
        }

        // Validate costs
        if (!data.costs.items || data.costs.items.length === 0) {
            errors.push('Phải có ít nhất một mục chi phí');
        }

        // Validate roadmap
        if (!data.roadmap.items || data.roadmap.items.length === 0) {
            errors.push('Phải có ít nhất một bước trong lộ trình');
        }

        if (errors.length > 0) {
            this.showNotification(errors.join('. '), 'error');
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    resetForm() {
        this.showConfirmDialog(
            'Khôi phục dữ liệu',
            'Bạn có chắc chắn muốn khôi phục về dữ liệu ban đầu?',
            () => {
                this.populateForm();
                this.hasUnsavedChanges = false;
                this.updateUI();
                this.showNotification('Đã khôi phục nội dung ban đầu', 'success');
            }
        );
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
        const form = document.getElementById('homepageContentForm');

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
        // Use existing notification system
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback
            console.log(`${type.toUpperCase()}: ${message}`);
        }
    }

    simulateApiCall(delay = 1500) {
        return new Promise(resolve => {
            setTimeout(resolve, delay);
        });
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.homepageContentManager = new HomepageContentManager();
});