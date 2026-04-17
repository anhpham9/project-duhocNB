<template>
  <div class="permission-guard">
    <!-- Loading state while checking permissions -->
    <div v-if="isCheckingPermission" class="loading-container">
      <div class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>{{ loadingMessage }}</p>
      </div>
    </div>

    <!-- Access denied -->
    <div v-else-if="!hasPermission" class="access-denied">
      <div class="denied-content">
        <i class="fas fa-ban"></i>
        <h2>{{ deniedTitle }}</h2>
        <p>{{ deniedMessage }}</p>
        
        <!-- Error details in development -->
        <div v-if="showErrorDetails && permissionError" class="error-details">
          <details>
            <summary>Chi tiết lỗi</summary>
            <pre>{{ JSON.stringify(permissionError, null, 2) }}</pre>
          </details>
        </div>

        <div class="denied-actions">
          <button @click="handleBackClick" class="btn-back">
            <i class="fas fa-arrow-left"></i>
            {{ backButtonText }}
          </button>
          
          <button v-if="showRetry" @click="retryPermissionCheck" class="btn-retry">
            <i class="fas fa-redo"></i>
            Thử lại
          </button>
        </div>
      </div>
    </div>

    <!-- Main content - only shown when permission granted -->
    <div v-else class="permission-granted">
      <!-- User info banner (optional) -->
      <div v-if="showUserInfo" class="user-info-banner">
        <small>
          <i class="fas fa-user"></i>
          Đăng nhập với quyền: <strong>{{ getUserRoleName() }}</strong>
          <span v-if="currentUser"> - {{ currentUser.username }}</span>
        </small>
      </div>

      <!-- Slot for main content -->
      <slot :user="getUserInfo()" :userRole="getUserRoleName()"></slot>
    </div>
  </div>
</template>

<script setup>
// Import the composable and navigateTo
import { usePermissionGuard } from '~/composables/usePermissionGuard'

const props = defineProps({
  allowedRoles: {
    type: Array,
    required: true
  },
  redirectTo: {
    type: String,
    default: '/admin'
  },
  redirectDelay: {
    type: Number,
    default: 2000
  },
  autoRedirect: {
    type: Boolean,
    default: true
  },
  loadingMessage: {
    type: String,
    default: 'Kiểm tra quyền truy cập...'
  },
  deniedTitle: {
    type: String,
    default: 'Truy cập bị từ chối'
  },
  deniedMessage: {
    type: String,
    default: 'Bạn không có quyền truy cập trang này.'
  },
  backButtonText: {
    type: String,
    default: 'Quay lại Dashboard'
  },
  showUserInfo: {
    type: Boolean,
    default: false
  },
  showRetry: {
    type: Boolean,
    default: true
  },
  showErrorDetails: {
    type: Boolean,
    default: false // Set to true in development
  }
})

// Use the permission guard composable
const {
  isCheckingPermission,
  hasPermission,
  currentUser,
  permissionError,
  getUserRoleName,
  getUserInfo,
  retryPermissionCheck
} = usePermissionGuard(props.allowedRoles, {
  redirectTo: props.redirectTo,
  redirectDelay: props.redirectDelay,
  autoRedirect: props.autoRedirect
})

const handleBackClick = () => {
  navigateTo(props.redirectTo)
}

// Expose methods for parent components if needed
defineExpose({
  hasPermission,
  currentUser,
  getUserInfo,
  retryPermissionCheck
})
</script>

<style scoped>
.permission-guard {
  min-height: 200px;
}

.loading-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
}

.loading {
  text-align: center;
  color: #666;
}

.loading i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #d32f2f;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.access-denied {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 400px;
  padding: 2rem;
}

.denied-content {
  text-align: center;
  padding: 3rem;
  background: #f8f9fa;
  border-radius: 15px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  max-width: 500px;
  width: 100%;
}

.denied-content i {
  font-size: 4rem;
  color: #d32f2f;
  margin-bottom: 1.5rem;
}

.denied-content h2 {
  color: #333;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.denied-content p {
  color: #666;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.error-details {
  margin: 1rem 0;
  text-align: left;
  background: #f0f0f0;
  border-radius: 8px;
  padding: 1rem;
}

.error-details summary {
  cursor: pointer;
  font-weight: 600;
  color: #d32f2f;
}

.error-details pre {
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: #666;
  overflow-x: auto;
}

.denied-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  flex-wrap: wrap;
}

.btn-back, .btn-retry {
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-back {
  background: #d32f2f;
  color: white;
}

.btn-back:hover {
  background: #b71c1c;
  transform: translateY(-2px);
}

.btn-retry {
  background: #f0f0f0;
  color: #666;
}

.btn-retry:hover {
  background: #e0e0e0;
  color: #333;
}

.user-info-banner {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border: 1px solid #dee2e6;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 2rem;
  color: #495057;
  font-size: 0.9rem;
}

.user-info-banner i {
  color: #d32f2f;
  margin-right: 8px;
}

.user-info-banner strong {
  color: #d32f2f;
}

@media (max-width: 768px) {
  .denied-content {
    padding: 2rem;
    margin: 1rem;
  }
  
  .denied-actions {
    flex-direction: column;
  }
  
  .btn-back, .btn-retry {
    width: 100%;
    justify-content: center;
  }
}
</style>