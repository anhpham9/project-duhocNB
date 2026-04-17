<template>
    <PermissionGuard :allowed-roles="ADMIN_PERMISSIONS.ADMIN_MANAGER" :show-user-info="false"
        denied-title="Không thể truy cập Quản lý Người dùng"
        denied-message="Chỉ Superadmin và Admin/Manager mới có thể quản lý người dùng.">
        <template #default="{ user }">
            <div class="users-page">
                <div class="page-header">
                    <h1>
                        <i class="fas fa-users"></i>
                        Quản lý Người dùng
                    </h1>
                    <p>Quản lý tài khoản và phân quyền người dùng trong hệ thống</p>
                </div>

                <div class="page-content">
                    <div class="stats-grid">
                        <div class="stat-card">
                            <i class="fas fa-user-shield"></i>
                            <div>
                                <h3>Superadmin</h3>
                                <span>1 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-tie"></i>
                            <div>
                                <h3>Admin/Manager</h3>
                                <span>3 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-edit"></i>
                            <div>
                                <h3>Editor</h3>
                                <span>5 người dùng</span>
                            </div>
                        </div>
                        <div class="stat-card">
                            <i class="fas fa-user-friends"></i>
                            <div>
                                <h3>Consultant</h3>
                                <span>2 người dùng</span>
                            </div>
                        </div>
                    </div>

                    <div class="placeholder-content">
                        <i class="fas fa-user-cog"></i>
                        <h3>Tính năng đang phát triển</h3>
                        <p>Giao diện quản lý người dùng sẽ có: Danh sách, Thêm/Sửa/Xóa, Phân quyền, v.v.</p>
                    </div>
                </div>
            </div>
        </template>
    </PermissionGuard>
</template>

<script setup>
// Import permission constants and PermissionGuard component
import { ADMIN_PERMISSIONS } from '~/composables/usePermissionGuard'
import PermissionGuard from '~/components/admin/PermissionGuard.vue'

definePageMeta({
    layout: "admin",
    middleware: ["auth", "permission"],
    ssr: false
});
</script>

<style scoped>
.users-page {
    padding: 0;
}

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

.stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
}

.stat-card {
    background: white;
    padding: 1.5rem;
    border-radius: 10px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
    color: #d32f2f;
}

.stat-card h3 {
    margin: 0 0 0.25rem 0;
    color: #333;
    font-size: 1rem;
}

.stat-card span {
    color: #666;
    font-size: 0.9rem;
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
}
</style>