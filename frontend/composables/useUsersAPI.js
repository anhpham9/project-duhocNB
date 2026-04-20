import { ref, reactive, onMounted, computed, watch } from 'vue'
import { usePaginationSettings } from './usePaginationSettings'

export const useUsersAPI = () => {
    // State
    const users = ref([])
    const availableRoles = ref([])
    const loading = ref(false)
    const error = ref(null)
    
    // Pagination settings (persistent across sessions)
    const { itemsPerPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()
    
    // Watch itemsPerPage changes to reset current page
    watch(itemsPerPage, () => {
        currentPage.value = 1
    })
    
    // Search and Filter State
    const searchQuery = ref('')
    const selectedRoleFilter = ref('')
    const currentPage = ref(1)
    
    // Filtered and paginated users
    const filteredUsers = computed(() => {
        let filtered = users.value
        
        // Search filter
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            filtered = filtered.filter(user => 
                user.name.toLowerCase().includes(query) ||
                user.username.toLowerCase().includes(query) ||
                user.email.toLowerCase().includes(query) ||
                (user.phone && user.phone.toLowerCase().includes(query))
            )
        }
        
        // Role filter
        if (selectedRoleFilter.value) {
            filtered = filtered.filter(user => user.role_name === selectedRoleFilter.value)
        }
        
        return filtered
    })
    
    const totalPages = computed(() => {
        if (itemsPerPage.value === -1) return 1 // Show all
        return Math.ceil(filteredUsers.value.length / itemsPerPage.value)
    })
    
    const paginatedUsers = computed(() => {
        if (itemsPerPage.value === -1) return filteredUsers.value // Show all
        
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filteredUsers.value.slice(start, end)
    })
    
    // Stats
    const stats = computed(() => {
        const roleStats = {}
        const statusStats = { active: 0, inactive: 0 }
        
        users.value.forEach(user => {
            const roleName = user.role_name || 'unknown'
            roleStats[roleName] = (roleStats[roleName] || 0) + 1
            
            // Count by is_active boolean
            if (user.is_active === true || user.is_active === undefined) {
                statusStats.active++
            } else {
                statusStats.inactive++
            }
        })
        
        return { ...roleStats, ...statusStats, total: users.value.length }
    })

    // Form state
    const editingUser = ref(null)
    const showCreateForm = ref(false)
    const showEditForm = ref(false)
    const showDeleteConfirm = ref(false)
    const showResetPasswordForm = ref(false)
    const userToDelete = ref(null)
    const userToResetPassword = ref(null)
    const resetPasswordResult = ref(null)

    // Form data
    const createForm = reactive({
        name: '',
        username: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        role_id: null,
        is_active: true
    })

    const editForm = reactive({
        id: null,
        name: '',
        username: '',
        email: '',
        phone: '',
        role_id: null,
        is_active: true
    })

    // API Base URL
    const API_BASE = 'http://localhost:5000/api'

    // Helper to get auth headers
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token')
        return {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        }
    }

    // API Methods
    const fetchUsers = async () => {
        loading.value = true
        error.value = null
        
        try {
            const response = await fetch(`${API_BASE}/users`, {
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }
            
            const data = await response.json()
            users.value = data.data || []
        } catch (err) {
            error.value = err.message
            console.error('Fetch users error:', err)
        } finally {
            loading.value = false
        }
    }

    const fetchAvailableRoles = async () => {
        try {
            const response = await fetch(`${API_BASE}/users/roles`, {
                headers: getAuthHeaders()
            })
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`)
            }
            
            const data = await response.json()
            availableRoles.value = data.data || []
        } catch (err) {
            console.error('Fetch roles error:', err)
        }
    }

    const createUser = async () => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                headers: getAuthHeaders(),
                body: JSON.stringify(createForm)
            })

            const data = await response.json()

            if (!response.ok) {
                // Return detailed error information
                return {
                    success: false,
                    message: data.message || `HTTP ${response.status}`,
                    error: data, // Include full error response
                    status: response.status
                }
            }

            // Success
            await fetchUsers() // Refresh list
            resetCreateForm()
            showCreateForm.value = false
            return { success: true, message: data.message }

        } catch (err) {
            error.value = err.message
            return {
                success: false,
                message: err.message,
                error: err.message
            }
        } finally {
            loading.value = false
        }
    }

    const updateUser = async () => {
        loading.value = true
        error.value = null

        try {
            const { id, ...updateData } = editForm
            const response = await fetch(`${API_BASE}/users/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify(updateData)
            })

            const data = await response.json()

            if (!response.ok) {
                // Return detailed error information
                return {
                    success: false,
                    message: data.message || `HTTP ${response.status}`,
                    error: data, // Include full error response
                    status: response.status
                }
            }

            // Success
            await fetchUsers() // Refresh list
            resetEditForm()
            showEditForm.value = false
            editingUser.value = null
            return { success: true, message: data.message }

        } catch (err) {
            error.value = err.message
            return {
                success: false,
                message: err.message,
                error: err.message
            }
        } finally {
            loading.value = false
        }
    }

    const deleteUser = async (userId) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'DELETE',
                headers: getAuthHeaders()
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`)
            }

            // Success
            await fetchUsers() // Refresh list
            showDeleteConfirm.value = false
            userToDelete.value = null
            return { success: true, message: data.message }

        } catch (err) {
            error.value = err.message
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
    }

    const resetPassword = async (userId) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE}/users/${userId}/reset-password`, {
                method: 'POST',
                headers: getAuthHeaders()
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`)
            }

            // Success - store result to show in modal
            resetPasswordResult.value = {
                user: data.data.user,
                newPassword: data.data.newPassword
            }
            
            return { success: true, message: data.message, data: data.data }

        } catch (err) {
            error.value = err.message
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
    }

    // Form helpers
    const resetCreateForm = () => {
        Object.assign(createForm, {
            name: '',
            username: '',
            email: '',
            phone: '',
            password: '',
            confirmPassword: '',
            role_id: null,
            is_active: true
        })
    }

    const resetEditForm = () => {
        Object.assign(editForm, {
            id: null,
            name: '',
            username: '',
            email: '',
            phone: '',
            role_id: null,
            is_active: true
        })
    }
    
    // Search and filter methods
    const setSearchQuery = (query) => {
        searchQuery.value = query
        currentPage.value = 1 // Reset to first page
    }
    
    const setRoleFilter = (role) => {
        selectedRoleFilter.value = role
        currentPage.value = 1 // Reset to first page
    }

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
        }
    }
    
    const toggleUserStatus = async (userId) => {
        loading.value = true
        error.value = null
        
        try {
            const user = users.value.find(u => u.id === userId)
            if (!user) throw new Error('User not found')
            
            const newIsActive = !user.is_active
            
            const response = await fetch(`${API_BASE}/users/${userId}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                body: JSON.stringify({ is_active: newIsActive })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`)
            }

            // Update local state
            user.is_active = newIsActive
            return { success: true, message: data.message }

        } catch (err) {
            error.value = err.message
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
    }

    const openCreateForm = () => {
        resetCreateForm()
        showCreateForm.value = true
    }

    const openEditForm = (user) => {
        editingUser.value = user
        Object.assign(editForm, {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email,
            phone: user.phone || '',
            role_id: user.role_id,
            is_active: user.is_active !== undefined ? user.is_active : true
        })
        showEditForm.value = true
    }

    const openDeleteConfirm = (user) => {
        userToDelete.value = user
        showDeleteConfirm.value = true
    }

    const openResetPasswordConfirm = (user) => {
        userToResetPassword.value = user
        resetPasswordResult.value = null
        showResetPasswordForm.value = true
    }

    const closeAllModals = () => {
        showCreateForm.value = false
        showEditForm.value = false
        showDeleteConfirm.value = false
        showResetPasswordForm.value = false
        editingUser.value = null
        userToDelete.value = null
        userToResetPassword.value = null
        resetPasswordResult.value = null
        error.value = null
    }

    // Role helpers
    const getRoleDisplayName = (roleName) => {
        const roleMap = {
            'superadmin': 'Superadmin',
            'admin': 'Admin',
            'manager': 'Manager',
            'editor': 'Editor',
            'consultant': 'Consultant'
        }
        return roleMap[roleName] || roleName
    }

    const getRoleIcon = (roleName) => {
        const iconMap = {
            'superadmin': 'fas fa-user-shield',
            'admin': 'fas fa-user-tie',
            'manager': 'fas fa-user-cog',
            'editor': 'fas fa-user-edit',
            'consultant': 'fas fa-user-friends'
        }
        return iconMap[roleName] || 'fas fa-user'
    }

    const getRoleBadgeColor = (roleName) => {
        const colorMap = {
            'superadmin': 'badge-superadmin',
            'admin': 'badge-admin',
            'manager': 'badge-manager', 
            'editor': 'badge-editor',
            'consultant': 'badge-consultant'
        }
        return colorMap[roleName] || 'badge-default'
    }

    // Permission helper for reset password
    const canResetPassword = (currentUser, targetUser) => {
        if (!currentUser || !targetUser) return false

        const currentRole = currentUser.role_id
        const targetRole = targetUser.role_id

        // Role hierarchy: 1=superadmin, 2=admin, 3=manager, 4=editor, 5=consultant
        // Superadmin can reset all passwords (including other superadmins)  
        if (currentRole === 1) return true
        
        // Admin can reset for manager, editor, consultant (role_id >= 3)
        if (currentRole === 2) return targetRole >= 3
        
        // Manager can reset for editor, consultant (role_id >= 4)  
        if (currentRole === 3) return targetRole >= 4
        
        // Editor and consultant cannot reset any passwords
        return false
    }

    // Initialize
    onMounted(async () => {
        await Promise.all([
            fetchUsers(),
            fetchAvailableRoles()
        ])
    })

    return {
        // State
        users,
        availableRoles,
        loading,
        error,
        stats,
        
        // Search and Filter
        searchQuery,
        selectedRoleFilter,
        currentPage,
        itemsPerPage,
        itemsPerPageOptions,
        filteredUsers,
        paginatedUsers,
        totalPages,
        
        // Form state
        editingUser,
        showCreateForm,
        showEditForm,
        showDeleteConfirm,
        showResetPasswordForm,
        userToDelete,
        userToResetPassword,
        resetPasswordResult,
        createForm,
        editForm,
        
        // Methods
        fetchUsers,
        fetchAvailableRoles,
        createUser,
        updateUser,
        deleteUser,
        resetPassword,
        
        // Form methods
        resetCreateForm,
        resetEditForm,
        openCreateForm,
        openEditForm,
        openDeleteConfirm,
        openResetPasswordConfirm,
        closeAllModals,
        
        // Search and Filter Methods
        setSearchQuery,
        setRoleFilter,
        setItemsPerPage,
        goToPage,
        toggleUserStatus,
        
        // Helpers
        getRoleDisplayName,
        getRoleIcon,
        getRoleBadgeColor,
        canResetPassword
    }
}