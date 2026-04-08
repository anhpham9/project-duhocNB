// Profile Management System
class ProfileManager {
    constructor() {
        this.hasUnsavedChanges = false;
        this.originalData = {};
        
        this.init();
    }

    init() {
        this.loadCurrentData();
        this.setupTabNavigation();
        this.setupFormHandlers();
        this.setupPasswordValidation();
        this.setupAvatarUpload();
        this.setupToggleHandlers();
        this.setupThemeSelector();
        this.setupEventListeners();
        this.checkForChanges();
    }

    loadCurrentData() {
        // Load current profile data (in real app, this would be from API)
        this.originalData = {
            personalInfo: {
                // Editable fields
                fullName: 'Nguyễn Văn Admin',
                email: 'admin@duhocnb.com',
                phone: '+84 123 456 789',
                address: '123 Nguyễn Huệ, Q.1, TP.HCM',
                bio: 'Quản trị viên hệ thống với 5+ năm kinh nghiệm trong lĩnh vực tư vấn du học. Chuyên trách quản lý và vận hành hệ thống admin.'
            },
            companyInfo: {
                // Read-only fields managed by company
                position: 'Quản trị viên',
                department: 'Hành chính',
                joinDate: '15/01/2020'
            },
            accountSettings: {
                username: 'admin',
                language: 'vi',
                timezone: 'Asia/Ho_Chi_Minh',
                dateFormat: 'dd/mm/yyyy',
                showOnlineStatus: true,
                autoLogout: true
            },
            preferences: {
                newApplications: true,
                statusUpdates: true,
                studentMessages: true,
                dailyReports: false,
                securityAlerts: true,
                theme: 'light',
                sidebarCompact: false
            }
        };

        this.populateForm();
    }

    populateForm() {
        // Populate editable personal info
        Object.keys(this.originalData.personalInfo).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = this.originalData.personalInfo[key];
            }
        });
        
        // Populate readonly company info
        Object.keys(this.originalData.companyInfo).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                element.value = this.originalData.companyInfo[key];
            }
        });

        // Populate account settings
        Object.keys(this.originalData.accountSettings).forEach(key => {
            const element = document.getElementById(key) || document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.originalData.accountSettings[key];
                } else {
                    element.value = this.originalData.accountSettings[key];
                }
            }
        });

        // Populate preferences
        Object.keys(this.originalData.preferences).forEach(key => {
            const element = document.querySelector(`[name="${key}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = this.originalData.preferences[key];
                } else if (key === 'theme') {
                    document.querySelector(`[data-theme="${this.originalData.preferences[key]}"]`).classList.add('active');
                } else {
                    element.value = this.originalData.preferences[key];
                }
            }
        });
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.nav-tab');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');

                // Remove active class from all tabs and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));

                // Add active class to clicked tab and corresponding content
                button.classList.add('active');
                document.getElementById(targetTab).classList.add('active');
            });
        });
    }

    setupFormHandlers() {
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('input', () => {
                this.hasUnsavedChanges = true;
                this.updateUI();
            });
        });

        // Save profile button
        const saveBtn = document.getElementById('saveProfileBtn');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveProfile();
            });
        }

        // Cancel button
        const cancelBtn = document.getElementById('cancelBtn');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.resetForm();
            });
        }

        // Change password button
        const changePasswordBtn = document.getElementById('changePasswordBtn');
        if (changePasswordBtn) {
            changePasswordBtn.addEventListener('click', () => {
                this.changePassword();
            });
        }
    }

    setupPasswordValidation() {
        const newPasswordInput = document.getElementById('newPassword');
        const confirmPasswordInput = document.getElementById('confirmPassword');

        if (newPasswordInput) {
            newPasswordInput.addEventListener('input', () => {
                this.checkPasswordStrength(newPasswordInput.value);
                this.validatePasswordMatch();
            });
        }

        if (confirmPasswordInput) {
            confirmPasswordInput.addEventListener('input', () => {
                this.validatePasswordMatch();
            });
        }
    }

    checkPasswordStrength(password) {
        const strengthBar = document.querySelector('.strength-bar');
        const strengthText = document.querySelector('.strength-text');
        const requirements = {
            length: password.length >= 8,
            uppercase: /[A-Z]/.test(password),
            lowercase: /[a-z]/.test(password),
            number: /\d/.test(password),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(password)
        };

        // Update requirement indicators
        Object.keys(requirements).forEach(req => {
            const indicator = document.getElementById(`${req}-req`);
            if (indicator) {
                indicator.classList.toggle('met', requirements[req]);
            }
        });

        // Calculate strength
        const metRequirements = Object.values(requirements).filter(req => req).length;
        let strength = 'weak';
        let strengthText_value = 'Yếu';

        if (metRequirements >= 5) {
            strength = 'strong';
            strengthText_value = 'Mạnh';
        } else if (metRequirements >= 4) {
            strength = 'good';
            strengthText_value = 'Khá';
        } else if (metRequirements >= 3) {
            strength = 'fair';
            strengthText_value = 'Trung bình';
        }

        if (strengthBar) {
            strengthBar.className = `strength-bar ${strength}`;
        }
        if (strengthText) {
            strengthText.textContent = `Độ mạnh: ${strengthText_value}`;
        }

        return metRequirements >= 4; // Return true if password is strong enough
    }

    validatePasswordMatch() {
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const confirmInput = document.getElementById('confirmPassword');

        if (confirmPassword && newPassword !== confirmPassword) {
            confirmInput.setCustomValidity('Mật khẩu không khớp');
            confirmInput.classList.add('error');
        } else {
            confirmInput.setCustomValidity('');
            confirmInput.classList.remove('error');
        }
    }

    setupAvatarUpload() {
        const avatarInput = document.getElementById('avatarInput');
        const avatarPreview = document.getElementById('avatarPreview');
        const avatarOverlay = document.querySelector('.avatar-overlay');

        if (avatarInput && avatarPreview) {
            // Click on preview to open file dialog
            avatarPreview.addEventListener('click', () => {
                avatarInput.click();
            });

            // Handle file selection
            avatarInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (file) {
                    if (file.type.startsWith('image/')) {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            avatarPreview.src = e.target.result;
                            this.hasUnsavedChanges = true;
                            this.updateUI();
                        };
                        reader.readAsDataURL(file);
                    } else {
                        this.showNotification('Vui lòng chọn file hình ảnh', 'error');
                    }
                }
            });
        }
    }

    setupToggleHandlers() {
        const toggles = document.querySelectorAll('.toggle-switch input[type="checkbox"]');
        toggles.forEach(toggle => {
            toggle.addEventListener('change', () => {
                this.hasUnsavedChanges = true;
                this.updateUI();
            });
        });
    }

    setupThemeSelector() {
        const themeOptions = document.querySelectorAll('.theme-option');
        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                // Remove active class from all theme options
                themeOptions.forEach(opt => opt.classList.remove('active'));
                // Add active class to selected theme
                option.classList.add('active');
                
                const theme = option.getAttribute('data-theme');
                this.applyTheme(theme);
                this.hasUnsavedChanges = true;
                this.updateUI();
            });
        });
    }

    applyTheme(theme) {
        // In a real application, you would apply the theme here
        console.log(`Applying theme: ${theme}`);
        // You could add theme classes to document.body or save to localStorage
        document.body.setAttribute('data-theme', theme);
        localStorage.setItem('admin-theme', theme);
    }

    setupEventListeners() {
        // 2FA Enable button
        const enable2FABtn = document.getElementById('enable2FABtn');
        if (enable2FABtn) {
            enable2FABtn.addEventListener('click', () => {
                this.enable2FA();
            });
        }

        // Manage devices button
        const manageDevicesBtn = document.getElementById('manageDevicesBtn');
        if (manageDevicesBtn) {
            manageDevicesBtn.addEventListener('click', () => {
                this.manageDevices();
            });
        }

        // Before unload warning
        window.addEventListener('beforeunload', (e) => {
            if (this.hasUnsavedChanges) {
                e.preventDefault();
                e.returnValue = '';
            }
        });
    }

    checkForChanges() {
        // Set up periodic change detection
        setInterval(() => {
            const currentData = this.getFormData();
            const hasChanges = JSON.stringify(currentData) !== JSON.stringify(this.originalData);
            
            if (hasChanges !== this.hasUnsavedChanges) {
                this.hasUnsavedChanges = hasChanges;
                this.updateUI();
            }
        }, 1000);
    }

    getFormData() {
        const personalInfo = {};
        const accountSettings = {};
        const preferences = {};

        // Get editable personal info data (excluding readonly company fields)
        const editablePersonalFields = ['fullName', 'email', 'phone', 'address', 'bio'];
        editablePersonalFields.forEach(field => {
            const element = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
            if (element && !element.readOnly) {
                personalInfo[field] = element.value;
            }
        });

        // Get account settings data
        const accountFields = ['username', 'language', 'timezone', 'dateFormat'];
        accountFields.forEach(field => {
            const element = document.getElementById(field) || document.querySelector(`[name="${field}"]`);
            if (element) {
                if (element.type === 'checkbox') {
                    accountSettings[field] = element.checked;
                } else {
                    accountSettings[field] = element.value;
                }
            }
        });

        // Get checkbox values for account settings
        const checkboxFields = ['showOnlineStatus', 'autoLogout'];
        checkboxFields.forEach(field => {
            const element = document.querySelector(`[name="${field}"]`);
            if (element) {
                accountSettings[field] = element.checked;
            }
        });

        // Get preferences data
        const preferenceFields = ['newApplications', 'statusUpdates', 'studentMessages', 'dailyReports', 'securityAlerts', 'sidebarCompact'];
        preferenceFields.forEach(field => {
            const element = document.querySelector(`[name="${field}"]`);
            if (element) {
                preferences[field] = element.checked;
            }
        });

        // Get selected theme
        const activeTheme = document.querySelector('.theme-option.active');
        if (activeTheme) {
            preferences.theme = activeTheme.getAttribute('data-theme');
        }

        return { personalInfo, accountSettings, preferences };
    }

    updateUI() {
        const saveBtn = document.getElementById('saveProfileBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        
        if (saveBtn) {
            saveBtn.disabled = !this.hasUnsavedChanges;
            if (this.hasUnsavedChanges) {
                saveBtn.innerHTML = '<i class="fas fa-save"></i> Lưu thay đổi';
                saveBtn.classList.remove('btn-success', 'pulse');
                saveBtn.classList.add('btn-primary', 'pulse1');
            } else {
                saveBtn.innerHTML = '<i class="fas fa-check"></i> Đã lưu';
                saveBtn.classList.remove('btn-primary', 'pulse1');
                saveBtn.classList.add('btn-success', 'pulse');
            }
        }
        
        if (cancelBtn) {
            cancelBtn.style.display = this.hasUnsavedChanges ? 'flex' : 'none';
        }
    }

    async saveProfile() {
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

            this.showNotification('Đã lưu hồ sơ thành công!', 'success');

        } catch (error) {
            console.error('Error saving profile:', error);
            this.showNotification('Có lỗi xảy ra khi lưu hồ sơ!', 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    async changePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords
        if (!currentPassword) {
            this.showNotification('Vui lòng nhập mật khẩu hiện tại', 'error');
            return;
        }

        if (!newPassword || !confirmPassword) {
            this.showNotification('Vui lòng nhập đầy đủ mật khẩu mới', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            this.showNotification('Mật khẩu xác nhận không khớp', 'error');
            return;
        }

        if (!this.checkPasswordStrength(newPassword)) {
            this.showNotification('Mật khẩu không đủ mạnh', 'error');
            return;
        }

        try {
            this.showLoadingState(true);

            // In real app, send to API
            await this.simulateApiCall();

            // Clear password fields
            document.getElementById('currentPassword').value = '';
            document.getElementById('newPassword').value = '';
            document.getElementById('confirmPassword').value = '';

            // Reset password strength indicator
            const strengthBar = document.querySelector('.strength-bar');
            const strengthText = document.querySelector('.strength-text');
            if (strengthBar) strengthBar.className = 'strength-bar';
            if (strengthText) strengthText.textContent = 'Độ mạnh mật khẩu';

            this.showNotification('Đã đổi mật khẩu thành công!', 'success');

        } catch (error) {
            console.error('Error changing password:', error);
            this.showNotification('Có lỗi xảy ra khi đổi mật khẩu!', 'error');
        } finally {
            this.showLoadingState(false);
        }
    }

    enable2FA() {
        // Simulate 2FA setup process
        this.showNotification('Chức năng đang được phát triển...', 'info');
    }

    manageDevices() {
        // Show devices management modal
        this.showNotification('Chức năng đang được phát triển...', 'info');
    }

    validateData(data) {
        const errors = [];

        if (!data.personalInfo.fullName || data.personalInfo.fullName.trim().length < 3) {
            errors.push('Tên phải có ít nhất 3 ký tự');
        }

        if (!data.personalInfo.email || !this.isValidEmail(data.personalInfo.email)) {
            errors.push('Email không hợp lệ');
        }

        if (!data.personalInfo.phone || !this.isValidPhone(data.personalInfo.phone)) {
            errors.push('Số điện thoại không hợp lệ');
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

    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[0-9\s\-\(\)]{10,}$/;
        return phoneRegex.test(phone);
    }

    resetForm() {
        this.showConfirmDialog(
            'Khôi phục dữ liệu',
            'Bạn có chắc chắn muốn khôi phục về dữ liệu ban đầu?',
            () => {
                this.populateForm();
                this.hasUnsavedChanges = false;
                this.updateUI();
                this.showNotification('Đã khôi phục dữ liệu ban đầu', 'success');
            }
        );
    }

    showLoadingState(loading) {
        const saveBtn = document.getElementById('saveProfileBtn');
        const cancelBtn = document.getElementById('cancelBtn');
        const changePasswordBtn = document.getElementById('changePasswordBtn');

        if (loading) {
            if (saveBtn) saveBtn.disabled = true;
            if (cancelBtn) cancelBtn.disabled = true;
            if (changePasswordBtn) changePasswordBtn.disabled = true;
        } else {
            if (saveBtn) saveBtn.disabled = false;
            if (cancelBtn) cancelBtn.disabled = false;
            if (changePasswordBtn) changePasswordBtn.disabled = false;
        }
    }

    showConfirmDialog(title, message, onConfirm) {
        if (confirm(`${title}\n\n${message}`)) {
            onConfirm();
        }
    }

    showNotification(message, type = 'info') {
        // Use the existing notification system
        if (window.showNotification) {
            window.showNotification(message, type);
        } else {
            // Fallback to alert if notification system not available
            alert(message);
        }
    }

    simulateApiCall(delay = 1500) {
        return new Promise(resolve => {
            setTimeout(resolve, delay);
        });
    }
}

// Global function for password toggle
function togglePassword(inputId) {
    const input = document.getElementById(inputId);
    const button = input.nextElementSibling;
    const icon = button.querySelector('i');

    if (input.type === 'password') {
        input.type = 'text';
        icon.className = 'fas fa-eye-slash';
    } else {
        input.type = 'password';
        icon.className = 'fas fa-eye';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.profileManager = new ProfileManager();
});