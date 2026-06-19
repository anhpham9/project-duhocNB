<template>
    <div class="settings-general-page">
        <div v-if="loadingUser || !hasPermission" class="permission-check">
            <div v-if="loadingUser" class="loading-permission">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang kiểm tra quyền truy cập...</p>
            </div>
            <div v-else class="permission-denied">
                <i class="fas fa-shield-alt"></i>
                <h3>Không thể truy cập Cài đặt</h3>
                <p>Chỉ Superadmin và Admin mới có thể cập nhật cài đặt hệ thống.</p>
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
                        <i class="fas fa-cogs"></i>
                        Cài đặt chung
                    </h1>
                    <p>Quản lý thông tin website và liên hệ theo từng nhóm.</p>
                </div>
                <div class="header-actions">
                    <button class="btn btn-secondary" :disabled="isLoading || saving" @click="fetchSettings">
                        <i class="fas fa-sync-alt" :class="{ 'fa-spin': isLoading }"></i>
                        Làm mới
                    </button>
                    <button class="btn btn-primary" :disabled="saving || isLoading" @click="saveCurrentTab">
                        <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                        {{ saving ? 'Đang lưu...' : 'Lưu cài đặt' }}
                    </button>
                </div>
            </div>

            <div class="tabs">
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'general' }"
                    @click="activeTab = 'general'"
                >
                    Thông tin website
                </button>
                <button
                    class="tab-btn"
                    :class="{ active: activeTab === 'contact' }"
                    @click="activeTab = 'contact'"
                >
                    Thông tin liên hệ
                </button>
            </div>

            <div v-if="isLoading" class="loading-state">
                <i class="fas fa-spinner fa-spin"></i>
                <p>Đang tải cài đặt...</p>
            </div>

            <div v-else-if="error" class="error-state">
                <i class="fas fa-exclamation-triangle"></i>
                <p>Lỗi: {{ error }}</p>
                <button @click="fetchSettings" class="btn btn-primary">Thử lại</button>
            </div>

            <div v-else class="settings-form">
                <template v-if="activeTab === 'general'">
                    <div class="form-group">
                        <label>Tên website <span class="required">*</span></label>
                        <input
                            v-model.trim="generalSettings.siteName"
                            @input="clearGeneralError('siteName')"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!generalErrors.siteName }"
                            placeholder="Nhập tên website"
                        >
                        <p v-if="generalErrors.siteName" class="field-error">{{ generalErrors.siteName }}</p>
                    </div>

                    <div class="form-group">
                        <label>Website link</label>
                        <input
                            v-model.trim="generalSettings.siteUrl"
                            @input="clearGeneralError('siteUrl')"
                            type="url"
                            class="form-control"
                            :class="{ 'is-invalid': !!generalErrors.siteUrl }"
                            placeholder="https://example.com"
                        >
                        <p v-if="generalErrors.siteUrl" class="field-error">{{ generalErrors.siteUrl }}</p>
                    </div>

                    <div class="form-group">
                        <label>Logo URL</label>
                        <input
                            v-model.trim="generalSettings.siteLogoUrl"
                            @input="clearGeneralError('siteLogoUrl')"
                            type="url"
                            class="form-control"
                            :class="{ 'is-invalid': !!generalErrors.siteLogoUrl }"
                            placeholder="https://example.com/logo.png"
                        >
                        <p v-if="generalErrors.siteLogoUrl" class="field-error">{{ generalErrors.siteLogoUrl }}</p>
                    </div>

                    <div class="form-group">
                        <label>Favicon URL</label>
                        <input
                            v-model.trim="generalSettings.siteFaviconUrl"
                            @input="clearGeneralError('siteFaviconUrl')"
                            type="url"
                            class="form-control"
                            :class="{ 'is-invalid': !!generalErrors.siteFaviconUrl }"
                            placeholder="https://example.com/favicon.png"
                        >
                        <p v-if="generalErrors.siteFaviconUrl" class="field-error">{{ generalErrors.siteFaviconUrl }}</p>
                    </div>

                    <div class="form-group">
                        <label>Mô tả website</label>
                        <textarea
                            v-model="generalSettings.siteDescription"
                            @input="clearGeneralError('siteDescription')"
                            class="form-control"
                            :class="{ 'is-invalid': !!generalErrors.siteDescription }"
                            rows="3"
                            placeholder="Mô tả ngắn về website"
                        ></textarea>
                        <p v-if="generalErrors.siteDescription" class="field-error">{{ generalErrors.siteDescription }}</p>
                    </div>
                </template>

                <template v-else>
                    <div class="form-group">
                        <label>Tên công ty đầy đủ</label>
                        <input
                            v-model.trim="contactSettings.companyFullName"
                            @input="clearContactError('companyFullName')"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!contactErrors.companyFullName }"
                            placeholder="Ông ty Cổ phần ..."
                        >
                        <p v-if="contactErrors.companyFullName" class="field-error">{{ contactErrors.companyFullName }}</p>
                    </div>

                    <div class="form-group">
                        <label>Tên công ty dạng ngắn</label>
                        <input
                            v-model.trim="contactSettings.companyShortName"
                            @input="clearContactError('companyShortName')"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!contactErrors.companyShortName }"
                            placeholder="DuhocNB"
                        >
                        <p v-if="contactErrors.companyShortName" class="field-error">{{ contactErrors.companyShortName }}</p>
                    </div>

                    <div class="form-group">
                        <label>Email liên hệ</label>
                        <input
                            v-model.trim="contactSettings.contactEmail"
                            @input="clearContactError('contactEmail')"
                            type="email"
                            class="form-control"
                            :class="{ 'is-invalid': !!contactErrors.contactEmail }"
                            placeholder="email@example.com"
                        >
                        <p v-if="contactErrors.contactEmail" class="field-error">{{ contactErrors.contactEmail }}</p>
                    </div>

                    <div class="form-group">
                        <label>Số điện thoại</label>
                        <input
                            v-model.trim="contactSettings.phone"
                            @input="clearContactError('phone')"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!contactErrors.phone }"
                            placeholder="0123456789"
                        >
                        <p v-if="contactErrors.phone" class="field-error">{{ contactErrors.phone }}</p>
                    </div>

                    <div class="form-group">
                        <label>Hotline</label>
                        <input
                            v-model.trim="contactSettings.hotline"
                            @input="clearContactError('hotline')"
                            type="text"
                            class="form-control"
                            :class="{ 'is-invalid': !!contactErrors.hotline }"
                            placeholder="1900xxxx"
                        >
                        <p v-if="contactErrors.hotline" class="field-error">{{ contactErrors.hotline }}</p>
                    </div>

                    <div class="form-group">
                        <label>Địa chỉ</label>
                        <textarea
                            v-model="contactSettings.address"
                            @input="clearContactError('address')"
                            class="form-control"
                            :class="{ 'is-invalid': !!contactErrors.address }"
                            rows="2"
                            placeholder="Nhập địa chỉ"
                        ></textarea>
                        <p v-if="contactErrors.address" class="field-error">{{ contactErrors.address }}</p>
                    </div>

                    <div class="form-group">
                        <label>Google Maps embed URL</label>
                        <textarea
                            v-model.trim="contactSettings.googleMapEmbedUrl"
                            @input="clearContactError('googleMapEmbedUrl')"
                            class="form-control"
                            :class="{ 'is-invalid': !!contactErrors.googleMapEmbedUrl }"
                            rows="4"
                            placeholder="https://www.google.com/maps/embed?..."
                        ></textarea>
                        <p v-if="contactErrors.googleMapEmbedUrl" class="field-error">{{ contactErrors.googleMapEmbedUrl }}</p>
                    </div>

                    <div class="form-group">
                        <label>Giờ làm việc</label>
                        <textarea
                            v-model="contactSettings.workingHours"
                            @input="clearContactError('workingHours')"
                            class="form-control"
                            :class="{ 'is-invalid': !!contactErrors.workingHours }"
                            rows="2"
                            placeholder="Thứ 2 - Thứ 6: 8:00 - 18:00&#10;Thứ 7 - Chủ nhật: 9:00 - 17:00"
                        ></textarea>
                        <p v-if="contactErrors.workingHours" class="field-error">{{ contactErrors.workingHours }}</p>
                    </div>

                    <div v-if="mapPreviewUrl" class="map-preview-card">
                        <p class="map-preview-title">Xem trước Google Maps</p>
                        <iframe
                            :src="mapPreviewUrl"
                            class="map-preview-iframe"
                            allowfullscreen
                            loading="lazy"
                            referrerpolicy="no-referrer-when-downgrade"
                            title="Google Maps preview"
                        ></iframe>
                    </div>
                </template>

                <div class="form-actions">
                    <button class="btn btn-secondary" :disabled="saving || isLoading" @click="resetCurrentTab">
                        <i class="fas fa-undo"></i>
                        Khôi phục
                    </button>
                    <button class="btn btn-primary" :disabled="saving || isLoading" @click="saveCurrentTab">
                        <i class="fas" :class="saving ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                        {{ saving ? 'Đang lưu...' : 'Lưu cài đặt' }}
                    </button>
                </div>
            </div>
        </div>

        <Toast />
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, computed } from 'vue'
import Toast from '~/components/Toast.vue'
import { useCurrentUser } from '~/composables/useCurrentUser'
import { useNotifications } from '~/composables/useNotifications'

definePageMeta({
    layout: 'admin',
    middleware: ['auth', 'permission'],
    ssr: false
})

useHead({
    title: 'Cài đặt chung - Admin'
})

const config = useRuntimeConfig()
const API_BASE = config.public.apiBase

const { loadingUser, hasAnyRole, fetchCurrentUser } = useCurrentUser()
const { showSuccess, showError, showInfo } = useNotifications()

const hasPermission = computed(() => !loadingUser.value && hasAnyRole([1, 2]))

const activeTab = ref('general')
const loadingGeneral = ref(false)
const loadingContact = ref(false)
const saving = ref(false)
const error = ref('')

const generalSettings = reactive({
    siteName: '',
    siteUrl: '',
    siteLogoUrl: '',
    siteFaviconUrl: '',
    siteDescription: ''
})

const contactSettings = reactive({
    companyFullName: '',
    companyShortName: '',
    contactEmail: '',
    phone: '',
    hotline: '',
    address: '',
    googleMapEmbedUrl: '',
    workingHours: ''
})

const generalErrors = reactive({
    siteName: '',
    siteUrl: '',
    siteLogoUrl: '',
    siteFaviconUrl: '',
    siteDescription: ''
})

const contactErrors = reactive({
    companyFullName: '',
    companyShortName: '',
    contactEmail: '',
    phone: '',
    hotline: '',
    address: '',
    googleMapEmbedUrl: '',
    workingHours: ''
})

const lastSavedGeneral = ref(null)
const lastSavedContact = ref(null)

const isLoading = computed(() => loadingGeneral.value || loadingContact.value)
const mapPreviewUrl = computed(() => {
    const rawValue = String(contactSettings.googleMapEmbedUrl || '').trim()
    if (!rawValue) return ''

    if (/^https?:\/\//i.test(rawValue)) {
        return rawValue
    }

    const srcMatch = rawValue.match(/src=["']([^"']+)["']/i)
    return srcMatch?.[1] || ''
})

const isValidUrl = (value) => {
    if (!value) return true
    try {
        const url = new URL(value)
        return url.protocol === 'http:' || url.protocol === 'https:'
    } catch {
        return false
    }
}

const clearGeneralError = (field) => {
    if (generalErrors[field]) generalErrors[field] = ''
}

const clearContactError = (field) => {
    if (contactErrors[field]) contactErrors[field] = ''
}

const setGeneralSettings = (data = {}) => {
    generalSettings.siteName = data.siteName || ''
    generalSettings.siteUrl = data.siteUrl || ''
    generalSettings.siteLogoUrl = data.siteLogoUrl || ''
    generalSettings.siteFaviconUrl = data.siteFaviconUrl || ''
    generalSettings.siteDescription = data.siteDescription || ''
}

const setContactSettings = (data = {}) => {
    contactSettings.companyFullName = data.companyFullName || ''
    contactSettings.companyShortName = data.companyShortName || ''
    contactSettings.contactEmail = data.contactEmail || ''
    contactSettings.phone = data.phone || ''
    contactSettings.hotline = data.hotline || ''
    contactSettings.address = data.address || ''
    contactSettings.googleMapEmbedUrl = data.googleMapEmbedUrl || ''
    contactSettings.workingHours = data.workingHours || ''
}

const clearGeneralErrors = () => {
    generalErrors.siteName = ''
    generalErrors.siteUrl = ''
    generalErrors.siteLogoUrl = ''
    generalErrors.siteFaviconUrl = ''
    generalErrors.siteDescription = ''
}

const clearContactErrors = () => {
    contactErrors.companyFullName = ''
    contactErrors.companyShortName = ''
    contactErrors.contactEmail = ''
    contactErrors.phone = ''
    contactErrors.hotline = ''
    contactErrors.address = ''
    contactErrors.googleMapEmbedUrl = ''
    contactErrors.workingHours = ''
}

const validateGeneral = () => {
    clearGeneralErrors()

    if (!generalSettings.siteName.trim()) {
        generalErrors.siteName = 'Tên website là bắt buộc'
    }

    if (generalSettings.siteDescription.length > 2000) {
        generalErrors.siteDescription = 'Mô tả website tối đa 2000 ký tự'
    }

    if (generalSettings.siteUrl && !isValidUrl(generalSettings.siteUrl)) {
        generalErrors.siteUrl = 'Website link không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (generalSettings.siteLogoUrl && !isValidUrl(generalSettings.siteLogoUrl)) {
        generalErrors.siteLogoUrl = 'Logo URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (generalSettings.siteFaviconUrl && !isValidUrl(generalSettings.siteFaviconUrl)) {
        generalErrors.siteFaviconUrl = 'Favicon URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    return !Object.values(generalErrors).some(Boolean)
}

const validateContact = () => {
    clearContactErrors()

    if (contactSettings.contactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactSettings.contactEmail)) {
        contactErrors.contactEmail = 'Email không hợp lệ'
    }

    if (contactSettings.phone && !/^[0-9+()\-\s]{8,20}$/.test(contactSettings.phone)) {
        contactErrors.phone = 'Số điện thoại không hợp lệ'
    }

    if (contactSettings.hotline && !/^[0-9+()\-\s]{8,20}$/.test(contactSettings.hotline)) {
        contactErrors.hotline = 'Hotline không hợp lệ'
    }

    if (contactSettings.address.length > 1000) {
        contactErrors.address = 'Địa chỉ tối đa 1000 ký tự'
    }

    if (contactSettings.googleMapEmbedUrl && !isValidUrl(contactSettings.googleMapEmbedUrl)) {
        contactErrors.googleMapEmbedUrl = 'Google Maps URL không hợp lệ (cần bắt đầu bằng http/https)'
    }

    if (contactSettings.workingHours.length > 2000) {
        contactErrors.workingHours = 'Giờ làm việc tối đa 2000 ký tự'
    }

    return !Object.values(contactErrors).some(Boolean)
}

const fetchGeneralSettings = async () => {
    loadingGeneral.value = true
    try {
        const response = await fetch(`${API_BASE}/settings/general`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        const payload = data?.data || {}
        setGeneralSettings(payload)
        lastSavedGeneral.value = { ...payload }
    } finally {
        loadingGeneral.value = false
    }
}

const fetchContactSettings = async () => {
    loadingContact.value = true
    try {
        const response = await fetch(`${API_BASE}/settings/contact`, {
            method: 'GET',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' }
        })
        const data = await response.json()
        if (!response.ok) {
            throw new Error(data?.message || `HTTP ${response.status}`)
        }

        const payload = data?.data || {}
        setContactSettings(payload)
        lastSavedContact.value = { ...payload }
    } finally {
        loadingContact.value = false
    }
}

const fetchSettings = async () => {
    error.value = ''
    try {
        await Promise.all([fetchGeneralSettings(), fetchContactSettings()])
    } catch (err) {
        error.value = err.message || 'Không thể tải cài đặt'
    }
}

const saveGeneralSettings = async () => {
    if (!validateGeneral()) {
        showError('Vui lòng kiểm tra lại thông tin tab website')
        return
    }

    const payload = {
        siteName: generalSettings.siteName.trim(),
        siteUrl: generalSettings.siteUrl.trim(),
        siteLogoUrl: generalSettings.siteLogoUrl.trim(),
        siteFaviconUrl: generalSettings.siteFaviconUrl.trim(),
        siteDescription: generalSettings.siteDescription || ''
    }

    const response = await fetch(`${API_BASE}/settings/general`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    const data = await response.json()

    if (!response.ok) {
        if (data?.errors) {
            generalErrors.siteName = data.errors.siteName || ''
            generalErrors.siteUrl = data.errors.siteUrl || ''
            generalErrors.siteLogoUrl = data.errors.siteLogoUrl || ''
            generalErrors.siteFaviconUrl = data.errors.siteFaviconUrl || ''
            generalErrors.siteDescription = data.errors.siteDescription || ''
        }
        throw new Error(data?.message || 'Không thể lưu cài đặt website')
    }

    const savedData = data?.data || payload
    setGeneralSettings(savedData)
    lastSavedGeneral.value = { ...savedData }
    showSuccess(data?.message || 'Đã lưu cài đặt website thành công')
}

const saveContactSettings = async () => {
    if (!validateContact()) {
        showError('Vui lòng kiểm tra lại thông tin tab liên hệ')
        return
    }

    const payload = {
        companyFullName: contactSettings.companyFullName.trim(),
        companyShortName: contactSettings.companyShortName.trim(),
        contactEmail: contactSettings.contactEmail.trim(),
        phone: contactSettings.phone.trim(),
        hotline: contactSettings.hotline.trim(),
        address: contactSettings.address || '',
        googleMapEmbedUrl: contactSettings.googleMapEmbedUrl.trim(),
        workingHours: contactSettings.workingHours || ''
    }

    const response = await fetch(`${API_BASE}/settings/contact`, {
        method: 'PUT',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
    })
    const data = await response.json()

    if (!response.ok) {
        if (data?.errors) {
            contactErrors.companyFullName = data.errors.companyFullName || ''
            contactErrors.companyShortName = data.errors.companyShortName || ''
            contactErrors.contactEmail = data.errors.contactEmail || ''
            contactErrors.phone = data.errors.phone || ''
            contactErrors.hotline = data.errors.hotline || ''
            contactErrors.address = data.errors.address || ''
            contactErrors.googleMapEmbedUrl = data.errors.googleMapEmbedUrl || ''
            contactErrors.workingHours = data.errors.workingHours || ''
        }
        throw new Error(data?.message || 'Không thể lưu cài đặt liên hệ')
    }

    const savedData = data?.data || payload
    setContactSettings(savedData)
    lastSavedContact.value = { ...savedData }
    showSuccess(data?.message || 'Đã lưu cài đặt liên hệ thành công')
}

const saveCurrentTab = async () => {
    saving.value = true
    try {
        if (activeTab.value === 'general') {
            await saveGeneralSettings()
        } else {
            await saveContactSettings()
        }
    } catch (err) {
        showError(err.message || 'Không thể lưu cài đặt')
    } finally {
        saving.value = false
    }
}

const resetCurrentTab = () => {
    if (activeTab.value === 'general') {
        if (lastSavedGeneral.value) {
            setGeneralSettings(lastSavedGeneral.value)
            clearGeneralErrors()
            showInfo('Đã khôi phục dữ liệu tab website')
            return
        }

        setGeneralSettings({
            siteName: '',
            siteUrl: '',
            siteLogoUrl: '',
            siteFaviconUrl: '',
            siteDescription: ''
        })
        clearGeneralErrors()
        showInfo('Đã đặt lại tab website')
        return
    }

    if (lastSavedContact.value) {
        setContactSettings(lastSavedContact.value)
        clearContactErrors()
        showInfo('Đã khôi phục dữ liệu tab liên hệ')
        return
    }

    setContactSettings({
        companyFullName: '',
        companyShortName: '',
        contactEmail: '',
        phone: '',
        hotline: '',
        address: '',
        googleMapEmbedUrl: '',
        workingHours: ''
    })
    clearContactErrors()
    showInfo('Đã đặt lại tab liên hệ')
}

onMounted(async () => {
    await fetchCurrentUser()
    if (hasPermission.value) {
        await fetchSettings()
    }
})
</script>

<style scoped>
.settings-general-page {
    padding: 0;
    min-height: 100vh;
}

.permission-check {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    padding: 2rem;
}

.loading-permission,
.permission-denied {
    text-align: center;
    max-width: 500px;
    padding: 3rem 2rem;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
}

.loading-permission i {
    font-size: 3rem;
    color: #2196f3;
    margin-bottom: 1rem;
}

.permission-denied i {
    font-size: 3rem;
    color: #f44336;
    margin-bottom: 1rem;
}

.permission-denied h3 {
    color: #333;
    margin-bottom: 1rem;
    font-size: 1.5rem;
}

.permission-denied p {
    color: #666;
    margin-bottom: 2rem;
    line-height: 1.5;
}

.page-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
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
    color: #1976d2;
}

.header-content p {
    color: #666;
    margin: 0;
    font-size: 1.05rem;
}

.header-actions {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
}

.tabs {
    display: flex;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.tab-btn {
    border: 1px solid #d1d5db;
    background: #fff;
    color: #334155;
    border-radius: 8px;
    padding: 0.55rem 0.9rem;
    font-weight: 600;
    cursor: pointer;
}

.tab-btn.active {
    background: #1976d2;
    border-color: #1976d2;
    color: #fff;
}

.settings-form {
    background: white;
    padding: 1.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
    margin-bottom: 1rem;
}

.form-group label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #333;
}

.form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ddd;
    border-radius: 6px;
    font-size: 14px;
    font-family: inherit;
}

.form-control:focus {
    outline: none;
    border-color: #1976d2;
    box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.14);
}

.form-control.is-invalid {
    border-color: #dc3545;
    box-shadow: 0 0 0 3px rgba(220, 53, 69, 0.15);
}

.field-error {
    margin: 0.35rem 0 0;
    color: #dc3545;
    font-size: 0.85rem;
}

.map-preview-card {
    margin-top: 0.75rem;
    border: 1px solid #dbe6f5;
    border-radius: 10px;
    background: #f8fbff;
    padding: 0.85rem;
}

.map-preview-title {
    margin: 0 0 0.6rem;
    color: #18477d;
    font-size: 0.9rem;
    font-weight: 600;
}

.map-preview-iframe {
    width: 100%;
    height: 320px;
    border: 0;
    border-radius: 8px;
}

.required {
    color: #dc3545;
}

.loading-state,
.error-state {
    padding: 3rem 2rem;
    text-align: center;
    color: #666;
    background: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.loading-state i {
    font-size: 2rem;
    margin-bottom: 1rem;
    color: #2196f3;
}

.error-state i {
    font-size: 2.5rem;
    color: #f59e0b;
    margin-bottom: 1rem;
}

.form-actions {
    margin-top: 1.5rem;
    display: flex;
    justify-content: flex-end;
    gap: 0.75rem;
}

.btn {
    padding: 0.75rem 1.2rem;
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

@media (max-width: 1024px) {
    .page-header {
        flex-direction: column;
        gap: 1rem;
    }
}

@media (max-width: 768px) {
    .header-content h1 {
        font-size: 1.5rem;
    }

    .settings-form {
        padding: 1rem;
    }

    .map-preview-iframe {
        height: 260px;
    }

    .tabs {
        flex-direction: column;
    }

    .header-actions,
    .form-actions {
        width: 100%;
        justify-content: stretch;
    }

    .header-actions .btn,
    .form-actions .btn {
        flex: 1;
        justify-content: center;
    }
}
</style>
