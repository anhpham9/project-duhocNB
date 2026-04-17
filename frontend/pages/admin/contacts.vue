<template>
  <PermissionGuard 
    :allowed-roles="[1, 2, 4]" 
    :show-user-info="true"
    denied-title="Không thể truy cập Quản lý Liên hệ"
    denied-message="Chỉ Superadmin, Admin/Manager và Consultant mới có thể truy cập trang này."
  >
    <template #default="{ user, userRole }">
      <div class="contacts-page">
        <div class="page-header">
          <h1>
            <i class="fas fa-address-book"></i>
            Quản lý Liên hệ
          </h1>
          <p>Quản lý và xử lý các yêu cầu liên hệ từ khách hàng</p>
        </div>

        <div class="page-content">
          <!-- Contact management content will go here -->
          <div class="info-card">
            <h3>Thông tin truy cập</h3>
            <p><strong>Người dùng:</strong> {{ user.username }}</p>
            <p><strong>Quyền:</strong> {{ userRole }}</p>
            <p><strong>ID:</strong> {{ user.id }}</p>
          </div>

          <!-- Placeholder for actual contact management functionality -->
          <div class="placeholder-content">
            <i class="fas fa-tools"></i>
            <h3>Đang phát triển</h3>
            <p>Chức năng quản lý liên hệ sẽ được triển khai sớm...</p>
          </div>
        </div>
      </div>
    </template>
  </PermissionGuard>
</template>

<script setup>
// Import PermissionGuard component
import PermissionGuard from '~/components/admin/PermissionGuard.vue'

definePageMeta({
  layout: "admin",
  middleware: ["auth", "permission"],
  ssr: false
});
</script>

<style scoped>
.contacts-page {
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

.info-card {
  background: white;
  padding: 1.5rem;
  border-radius: 10px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
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
}
</style>