import { ref, onMounted, computed, readonly, nextTick } from "vue"
import { jwtDecode } from "jwt-decode"

/**
 * Composable for handling permission checks in admin pages
 * @param {Array} allowedRoles - Array of role IDs that can access this page
 * @param {Object} options - Additional options
 * @returns {Object} - Permission state and methods
 */
export const usePermissionGuard = (allowedRoles = [], options = {}) => {
    const {
        redirectTo = '/admin',
        redirectDelay = 2000,
        autoRedirect = true
    } = options

    const isCheckingPermission = ref(true)
    const hasPermission = ref(false)
    const currentUser = ref(null)
    const permissionError = ref(null)

    // Role mapping for display
    const roleMap = {
        1: 'Superadmin',
        2: 'Admin/Manager', 
        3: 'Editor',
        4: 'Consultant',
        5: 'User'
    }

    const checkPermissions = async () => {
        if (!process.client) {
            isCheckingPermission.value = false
            return
        }
        
        try {
            const token = localStorage.getItem('token')
            
            if (!token) {
                console.warn('🚫 No token found, redirecting to login')
                await navigateTo('/login')
                return
            }

            // Decode JWT token
            const user = jwtDecode(token)
            currentUser.value = user
            
            // Check permissions
            hasPermission.value = allowedRoles.includes(user.role_id)
            
            if (!hasPermission.value) {
                console.warn(`🚫 User role ${user.role_id} not allowed. Required roles: [${allowedRoles.join(', ')}]`)
                permissionError.value = {
                    code: 'INSUFFICIENT_PERMISSIONS',
                    message: 'Bạn không có quyền truy cập trang này.',
                    userRole: user.role_id,
                    requiredRoles: allowedRoles
                }

                if (autoRedirect) {
                    setTimeout(async () => {
                        await navigateTo(redirectTo)
                    }, redirectDelay)
                }
            } else {
                console.log(`✅ Permission granted for role ${user.role_id}`)
            }
            
        } catch (error) {
            console.error('❌ Permission check error:', error)
            permissionError.value = {
                code: 'TOKEN_ERROR',
                message: 'Lỗi xác thực. Vui lòng đăng nhập lại.',
                error: error.message
            }
            
            if (autoRedirect) {
                setTimeout(async () => {
                    await navigateTo('/login')
                }, redirectDelay)
            }
        } finally {
            isCheckingPermission.value = false
        }
    }

    const getUserRoleName = () => {
        if (!currentUser.value) return 'Unknown'
        return roleMap[currentUser.value.role_id] || `Role ${currentUser.value.role_id}`
    }

    const getUserInfo = () => {
        if (!currentUser.value) return null
        return {
            id: currentUser.value.id,
            username: currentUser.value.username,
            role_id: currentUser.value.role_id,
            role_name: getUserRoleName()
        }
    }

    const retryPermissionCheck = () => {
        isCheckingPermission.value = true
        hasPermission.value = false
        permissionError.value = null
        checkPermissions()
    }

    // Auto-check permissions on mount
    onMounted(() => {
        checkPermissions()
    })

    return {
        // States
        isCheckingPermission: readonly(isCheckingPermission),
        hasPermission: readonly(hasPermission),
        currentUser: readonly(currentUser),
        permissionError: readonly(permissionError),
        
        // Methods
        checkPermissions,
        getUserRoleName,
        getUserInfo,
        retryPermissionCheck
    }
}

// Predefined permission sets for common admin pages
export const ADMIN_PERMISSIONS = {
    SUPERADMIN_ONLY: [1],
    ADMIN_MANAGER: [1, 2],
    CONTENT_EDITORS: [1, 2, 3],
    CONTACT_HANDLERS: [1, 2, 4],
    ALL_ROLES: [1, 2, 3, 4, 5]
}