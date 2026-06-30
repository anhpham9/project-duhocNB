<template>
    <div class="content-container">
        <!-- Page Header -->
        <div class="page-header">
            <div class="header-info">
                <h1 class="page-title">
                    <i class="fas fa-tachometer-alt"></i>
                    Dashboard
                </h1>
                <p class="page-description">Tổng quan hệ thống quản lý Du Học Nhật Bản</p>
                <p class="page-description role-line">
                    Vai trò hiện tại: <strong>{{ roleName }}</strong>
                </p>
            </div>
        </div>

        <!-- Content Sections -->
        <div class="content-sections">
            <div v-if="loading" class="dashboard-card" style="margin-bottom: 20px;">
                <div class="card-content">
                    <p>
                        <i class="fas fa-spinner fa-spin"></i>
                        Đang tải dữ liệu dashboard...
                    </p>
                </div>
            </div>

            <div v-else-if="error" class="dashboard-card" style="margin-bottom: 20px; border-color: #f5c2c7;">
                <div class="card-content">
                    <p style="color: #842029; margin-bottom: 12px;">
                        <i class="fas fa-exclamation-triangle"></i>
                        {{ error }}
                    </p>
                    <button class="view-all-btn" @click="fetchDashboardData">Thử lại</button>
                </div>
            </div>

            <!-- Stats Cards -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon primary">
                        <i class="fas fa-phone"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-number">{{ formatNumber(kpiValue('contactsToday', overview.contactsToday)) }}</h3>
                        <p class="stat-label">Liên hệ hôm nay</p>
                        <span class="stat-change positive">
                            <i class="fas fa-arrow-up"></i>
                            {{ kpiTrendText('contactsToday', hasPermission('contacts') ? 'Dữ liệu realtime' : 'Không có quyền xem') }}
                        </span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon success">
                        <i class="fas fa-university"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-number">{{ formatNumber(kpiValue('schoolsTotal', overview.schoolsTotal)) }}</h3>
                        <p class="stat-label">Trường đối tác</p>
                        <span class="stat-change neutral">
                            <i class="fas fa-check"></i>
                            {{ kpiTrendText('schoolsTotal', hasPermission('schools') ? 'Theo hệ thống' : 'Không có quyền xem') }}
                        </span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon warning">
                        <i class="fas fa-clock"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-number">{{ formatNumber(kpiValue('contactsPending', overview.contactsPending)) }}</h3>
                        <p class="stat-label">Chưa liên hệ</p>
                        <span class="stat-change neutral">
                            <i class="fas fa-exclamation-triangle"></i>
                            {{ kpiTrendText('contactsPending', hasPermission('contacts') ? 'Cần xử lý' : 'Không có quyền xem') }}
                        </span>
                    </div>
                </div>

                <div class="stat-card">
                    <div class="stat-icon info">
                        <i class="fas fa-newspaper"></i>
                    </div>
                    <div class="stat-content">
                        <h3 class="stat-number">{{ formatNumber(kpiValue('newsThisWeek', overview.newsThisWeek)) }}</h3>
                        <p class="stat-label">Bài viết tuần này</p>
                        <span class="stat-change positive">
                            <i class="fas fa-arrow-up"></i>
                            {{ kpiTrendText('newsThisWeek', hasPermission('news') ? 'Theo tuần hiện tại' : 'Không có quyền xem') }}
                        </span>
                    </div>
                </div>
            </div>

            <div class="v2-row">
                <div class="dashboard-card v2-card">
                    <div class="card-header">
                        <h3 class="card-title">Cảnh báo hệ thống</h3>
                    </div>
                    <div class="card-content">
                        <div v-if="alerts.length === 0" class="v2-empty">Không có cảnh báo quan trọng.</div>
                        <div v-else class="v2-list">
                            <NuxtLink
                                v-for="alert in alerts"
                                :key="alert.id"
                                :to="alert.actionUrl || '/admin'"
                                class="v2-item"
                                :class="`severity-${alert.severity}`"
                            >
                                <div class="v2-item-head">
                                    <span class="v2-badge">{{ alert.severity }}</span>
                                    <span class="v2-time">{{ timeAgo(alert.createdAt) }}</span>
                                </div>
                                <p class="v2-title">{{ alert.title }}</p>
                                <p class="v2-description">{{ alert.description }}</p>
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <div class="dashboard-card v2-card">
                    <div class="card-header">
                        <h3 class="card-title">Việc cần làm hôm nay</h3>
                    </div>
                    <div class="card-content">
                        <div v-if="todoToday.length === 0" class="v2-empty">Không có việc tồn đọng.</div>
                        <div v-else class="v2-list">
                            <NuxtLink
                                v-for="todo in todoToday"
                                :key="todo.id"
                                :to="todo.actionUrl || '/admin'"
                                class="v2-item"
                            >
                                <div class="v2-item-head">
                                    <span class="v2-badge" :class="`priority-${todo.priority}`">{{ todo.priority }}</span>
                                    <span class="v2-time">Hạn {{ timeAgo(todo.dueAt) }}</span>
                                </div>
                                <p class="v2-title">{{ todo.title }}</p>
                            </NuxtLink>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Main Dashboard Grid -->
            <div class="dashboard-grid">
                <!-- Chart Section -->
                <div class="dashboard-card chart-card">
                    <div class="card-header">
                        <h3 class="card-title">Thống kê liên hệ tư vấn theo tuần</h3>
                        <div class="card-actions">
                            <label for="periodSelect" hidden></label>
                            <select id="periodSelect" v-model="period" class="period-select" @change="fetchDashboardData">
                                <option value="week">7 ngày qua</option>
                                <option value="month">30 ngày qua</option>
                                <option value="quarter">3 tháng qua</option>
                            </select>
                        </div>
                    </div>
                    <div class="card-content">
                        <div v-if="!hasPermission('contacts')" class="chart-placeholder">
                            <p>Không có quyền xem biểu đồ liên hệ.</p>
                        </div>
                        <div v-else class="chart-placeholder">
                            <div class="chart-bars">
                                <div
                                    v-for="item in contactsChart"
                                    :key="item.date"
                                    class="chart-bar"
                                    :style="{ height: `${item.height}%` }"
                                    :data-value="item.count"
                                >
                                    <span class="bar-label">{{ item.count }}</span>
                                </div>
                            </div>
                            <div class="chart-labels">
                                <span v-for="item in contactsChart" :key="`${item.date}-label`">{{ item.label }}</span>
                            </div>
                        </div>
                        <div class="chart-legend">
                            <div class="legend-item">
                                <span class="legend-color primary"></span>
                                <span>Liên hệ mới</span>
                            </div>
                            <div class="legend-item">
                                <span class="legend-color success"></span>
                                <span>Đã xử lý</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Recent Activity -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Liên hệ tư vấn gần đây</h3>
                        <NuxtLink to="/admin/contacts" class="view-all-btn">Xem tất cả</NuxtLink>
                    </div>
                    <div class="card-content">
                        <div v-if="!hasPermission('contacts')" class="activity-list">
                            <p>Không có quyền xem danh sách liên hệ.</p>
                        </div>
                        <div v-else-if="recentContacts.length === 0" class="activity-list">
                            <p>Chưa có liên hệ nào.</p>
                        </div>
                        <div v-else class="activity-list">
                            <div v-for="item in recentContacts" :key="item.id" class="activity-item">
                                <div class="activity-content">
                                    <p><strong>{{ item.name || 'Ẩn danh' }}</strong> - {{ item.phone || 'Chưa có SĐT' }}</p>
                                    <p>{{ item.email || 'Không có email' }}</p>
                                    <p class="activity-details">{{ shortMessage(item.message) }}</p>
                                    <span class="activity-time">{{ timeAgo(item.created_at) }}</span>
                                </div>
                                <div class="activity-status" :class="contactStatusClass(item.status)">
                                    <i class="fas" :class="contactStatusIcon(item.status)"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Actions -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Thao tác nhanh</h3>
                    </div>
                    <div class="card-content">
                        <div class="quick-actions">
                            <NuxtLink to="/admin/contacts" class="quick-action-btn priority">
                                <i class="fas fa-phone"></i>
                                <span>Liên hệ mới</span>
                                <span class="badge">{{ formatNumber(overview.contactsPending) }}</span>
                            </NuxtLink>
                            <NuxtLink to="/admin/schools" class="quick-action-btn">
                                <i class="fas fa-university"></i>
                                <span>Quản lý trường</span>
                            </NuxtLink>
                            <NuxtLink to="/admin/news" class="quick-action-btn">
                                <i class="fas fa-newspaper"></i>
                                <span>Đăng tin tức</span>
                            </NuxtLink>
                            <NuxtLink to="/admin/settings/seo" class="quick-action-btn">
                                <i class="fas fa-search"></i>
                                <span>Cài đặt SEO</span>
                            </NuxtLink>
                            <NuxtLink to="/admin/content/homepage" class="quick-action-btn">
                                <i class="fas fa-edit"></i>
                                <span>Sửa nội dung</span>
                            </NuxtLink>
                            <NuxtLink to="/admin/settings/backup" class="quick-action-btn">
                                <i class="fas fa-download"></i>
                                <span>Sao lưu</span>
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <!-- Top Schools -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">5 Trường đối tác</h3>
                        <NuxtLink to="/admin/schools" class="view-all-btn">Quản lý</NuxtLink>
                    </div>
                    <div class="card-content">
                        <div v-if="!hasPermission('schools')" class="school-list">
                            <p>Không có quyền xem trường học.</p>
                        </div>
                        <div v-else-if="topSchools.length === 0" class="school-list">
                            <p>Chưa có dữ liệu trường học.</p>
                        </div>
                        <div v-else class="school-list">
                            <div v-for="(school, index) in topSchools" :key="school.id" class="school-item">
                                <div class="school-rank" :class="{ top: index === 0 }">{{ index + 1 }}</div>
                                <div class="school-info">
                                    <h4>{{ school.name }}</h4>
                                    <p>{{ school.location || 'Chưa có địa điểm' }}</p>
                                    <span class="school-type">{{ school.status || 'N/A' }}</span>
                                </div>
                                <div class="school-stats">
                                    <span class="interest-count">⭐ {{ Number(school.rating || 0).toFixed(1) }} ({{ school.review_count || 0 }} đánh giá)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Website Stats -->
                <div class="dashboard-card">
                    <div class="card-header">
                        <h3 class="card-title">Thống kê website</h3>
                        <button class="view-all-btn" @click="fetchDashboardData">Làm mới</button>
                    </div>
                    <div class="card-content">
                        <div class="website-stats">
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-eye"></i>
                                    <span>Tổng liên hệ</span>
                                </div>
                                <div class="stat-value">{{ formatNumber(overview.contactsTotal) }}</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-users"></i>
                                    <span>Tổng trường học</span>
                                </div>
                                <div class="stat-value">{{ formatNumber(overview.schoolsTotal) }}</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-clock"></i>
                                    <span>Tổng bài viết</span>
                                </div>
                                <div class="stat-value">{{ formatNumber(overview.newsTotal) }}</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-mobile-alt"></i>
                                    <span>Liên hệ chờ xử lý</span>
                                </div>
                                <div class="stat-value">{{ formatNumber(overview.contactsPending) }}</div>
                            </div>
                            <div class="stat-row">
                                <div class="stat-label">
                                    <i class="fas fa-star"></i>
                                    <span>Cập nhật lần cuối</span>
                                </div>
                                <div class="stat-value">{{ generatedAtLabel }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from "vue";
import "~/assets/css/admin/dashboard.css";

definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});

const config = useRuntimeConfig();
const API_BASE = config.public.apiBase;

const period = ref("week");
const loading = ref(false);
const error = ref("");
const dashboardData = ref(null);

const overview = computed(() => dashboardData.value?.overview || {});
const role = computed(() => dashboardData.value?.role || {});
const roleName = computed(() => role.value?.name || "Unknown");
const permissions = computed(() => dashboardData.value?.permissions || {});
const visibleWidgets = computed(() => dashboardData.value?.visibleWidgets || []);
const kpis = computed(() => dashboardData.value?.kpis || []);
const alerts = computed(() => dashboardData.value?.alerts || []);
const todoToday = computed(() => dashboardData.value?.lists?.todoToday || []);
const recentContacts = computed(() => dashboardData.value?.lists?.recentContacts || []);
const topSchools = computed(() => dashboardData.value?.lists?.topSchools || []);
const contactsByDay = computed(() => dashboardData.value?.charts?.contactsByDay || []);
const kpiMap = computed(() => {
    return kpis.value.reduce((acc, item) => {
        acc[item.key] = item;
        return acc;
    }, {});
});
const maxChartValue = computed(() => {
    const max = Math.max(...contactsByDay.value.map((item) => Number(item.count || 0)), 0);
    return max > 0 ? max : 1;
});

const contactsChart = computed(() => {
    return contactsByDay.value.map((item) => {
        const count = Number(item.count || 0);
        const ratio = (count / maxChartValue.value) * 100;
        return {
            ...item,
            count,
            height: Math.max(10, Math.round(ratio))
        };
    });
});

const generatedAtLabel = computed(() => {
    const value = dashboardData.value?.generatedAt;
    if (!value) return "-";
    return new Date(value).toLocaleString("vi-VN");
});

const hasPermission = (key) => Boolean(permissions.value?.[key]);
const isWidgetVisible = (key) => visibleWidgets.value.includes(key);

const kpiValue = (key, fallback = null) => {
    if (!isWidgetVisible(`kpi.${key}`) && fallback !== null) {
        return fallback;
    }
    return kpiMap.value[key]?.value ?? fallback;
};

const kpiTrendText = (key, fallback = "") => {
    if (!isWidgetVisible(`kpi.${key}`)) return fallback;
    const trend = kpiMap.value[key]?.trend;
    if (!trend) return fallback;
    if (trend.direction === "flat") return "Không thay đổi so với kỳ trước";
    const sign = trend.direction === "up" ? "+" : "";
    return `${sign}${trend.delta} (${sign}${trend.deltaPercent}%)`;
};

const formatNumber = (value) => {
    const num = Number(value);
    if (!Number.isFinite(num)) return "-";
    return num.toLocaleString("vi-VN");
};

const shortMessage = (text) => {
    if (!text) return "Không có nội dung";
    if (text.length <= 64) return text;
    return `${text.slice(0, 64)}...`;
};

const contactStatusClass = (status) => {
    const map = {
        new: "new",
        pending: "pending",
        responded: "completed",
        closed: "completed"
    };
    return map[status] || "pending";
};

const contactStatusIcon = (status) => {
    const map = {
        new: "fa-circle",
        pending: "fa-clock",
        responded: "fa-check-circle",
        closed: "fa-check-circle"
    };
    return map[status] || "fa-circle";
};

const timeAgo = (dateValue) => {
    if (!dateValue) return "Không rõ";
    const date = new Date(dateValue);
    const diffMs = Date.now() - date.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diffMs < minute) return "Vừa xong";
    if (diffMs < hour) return `${Math.floor(diffMs / minute)} phút trước`;
    if (diffMs < day) return `${Math.floor(diffMs / hour)} giờ trước`;
    return `${Math.floor(diffMs / day)} ngày trước`;
};

const fetchDashboardData = async () => {
    loading.value = true;
    error.value = "";

    try {
        const response = await fetch(`${API_BASE}/dashboard/overview?period=${period.value}`, {
            method: "GET",
            credentials: "include",
            headers: {
                "Content-Type": "application/json"
            }
        });

        const data = await response.json();

        if (!response.ok || !data.success) {
            throw new Error(data.message || `Không thể tải dashboard (HTTP ${response.status})`);
        }

        dashboardData.value = data.data;
    } catch (err) {
        error.value = err?.message || "Đã xảy ra lỗi khi tải dashboard";
    } finally {
        loading.value = false;
    }
};

onMounted(fetchDashboardData);
</script>