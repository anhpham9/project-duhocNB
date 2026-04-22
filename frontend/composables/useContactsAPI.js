import { ref, reactive, onMounted, computed, watch } from 'vue'
import { usePaginationSettings } from './usePaginationSettings'

export const useContactsAPI = () => {
    // State
    const contacts = ref([])
    const assignableUsers = ref([])
    const contactNotes = ref([])
    const loading = ref(false)
    const loadingNotes = ref(false)
    const error = ref(null)

    // Pagination settings (persistent across sessions)
    const { itemsPerPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()

    // Watch itemsPerPage changes to reset current page
    watch(itemsPerPage, () => {
        currentPage.value = 1
    })

    // Search and Filter State
    const searchQuery = ref('')
    const selectedStatusFilter = ref('')
    const selectedMethodFilter = ref('')
    const currentPage = ref(1)

    // Sort State
    const sortColumn = ref('')
    const sortDirection = ref('asc')

    // Filtered and paginated contacts
    const filteredContacts = computed(() => {
        let filtered = contacts.value

        // Search filter
        if (searchQuery.value) {
            const query = searchQuery.value.toLowerCase()
            filtered = filtered.filter(contact =>
                contact.name.toLowerCase().includes(query) ||
                contact.message.toLowerCase().includes(query) ||
                contact.email.toLowerCase().includes(query) ||
                (contact.phone && contact.phone.toLowerCase().includes(query))
            )
        }

        // Status filter
        // status IN ('new', 'pending', 'responded', 'closed')
        if (selectedStatusFilter.value) {
            filtered = filtered.filter(contact => contact.status === selectedStatusFilter.value)
        }

        // Method filter
        // contact_method IN ('email', 'phone', 'social')
        if (selectedMethodFilter.value) {
            filtered = filtered.filter(contact => contact.contact_method === selectedMethodFilter.value)
        }

        // Apply sorting if column is selected
        if (sortColumn.value) {
            filtered.sort((a, b) => {
                let aVal = a[sortColumn.value]
                let bVal = b[sortColumn.value]

                // Handle different data types
                if (sortColumn.value === 'id') {
                    aVal = parseInt(aVal)
                    bVal = parseInt(bVal)
                } else if (sortColumn.value === 'created_at') {
                    aVal = new Date(aVal)
                    bVal = new Date(bVal)
                } else {
                    aVal = aVal ? aVal.toString().toLowerCase() : ''
                    bVal = bVal ? bVal.toString().toLowerCase() : ''
                }

                if (aVal < bVal) return sortDirection.value === 'asc' ? -1 : 1
                if (aVal > bVal) return sortDirection.value === 'asc' ? 1 : -1
                return 0
            })
        }

        return filtered
    })

    const totalPages = computed(() => {
        if (itemsPerPage.value === -1) return 1 // Show all
        return Math.ceil(filteredContacts.value.length / itemsPerPage.value)
    })

    const paginatedContacts = computed(() => {
        if (itemsPerPage.value === -1) return filteredContacts.value // Show all

        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filteredContacts.value.slice(start, end)
    })

    // Stats
    const stats = computed(() => {
        const methodStats = { email: 0, phone: 0, social: 0 }
        const statusStats = { new: 0, pending: 0, responded: 0, closed: 0 }

        contacts.value.forEach(contact => {
            const method = contact.contact_method || 'unknown'
            methodStats[method] = (methodStats[method] || 0) + 1

            const status = contact.status || 'unknown'
            statusStats[status] = (statusStats[status] || 0) + 1
        })

        return { ...methodStats, ...statusStats, total: contacts.value.length }
    })

    // Form state
    const detailContact = ref(null)
    const editingContact = ref(null)
    const showDetailModal = ref(false)
    const showEditForm = ref(false)
    const showDeleteConfirm = ref(false)
    const contactToDelete = ref(null)

    // Form data
    const editForm = reactive({
        id: null,
        name: '',
        email: '',
        phone: '',
        message: '',
        contact_method: '',
        social_contact: '',
        assigned_to: '',
        status: 'new'
    })

    // API Base URL
    const config = useRuntimeConfig()
    const API_BASE = config.public.apiBase

    // Helper to get auth headers (cookies sent automatically)
    const getAuthHeaders = () => {
        return {
            'Content-Type': 'application/json'
            // Cookie will be sent automatically by browser
        }
    }

    // API Methods
    // Fetch all contacts
    const fetchContacts = async () => {
        loading.value = true
        error.value = null
        try {
            const response = await fetch(`${API_BASE}/contacts`, {
                headers: getAuthHeaders(),
                credentials: 'include' // Include cookies
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            contacts.value = data.data || []
        } catch (err) {
            error.value = err.message
            console.error('Fetch contacts error:', err)
        } finally {
            loading.value = false
        }
    }

    // Fetch contact statistics
    const fetchContactStats = async () => {
        try {
            const response = await fetch(`${API_BASE}/contacts/stats`, {
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' }
            })
            if (!response.ok) throw new Error(`HTTP ${response.status}`)
            const data = await response.json()
            stats.value = data.data || {}
        } catch (err) {
            console.error('Fetch contact stats error:', err)
        }
    }

    // Fetch assignable users
    const fetchAssignableUsers = async () => {
        try {
            const response = await fetch(`${API_BASE}/contacts/assignable-users`, {
                headers: getAuthHeaders(),
                credentials: 'include' // Include cookies
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            assignableUsers.value = data.data || []
        } catch (err) {
            console.error('Fetch assignable users error:', err)
        }
    }

    // Fetch notes for a contact
    const fetchContactNotes = async (contactId) => {
        loadingNotes.value = true
        console.log("Fetching notes for contact ID:", contactId)
        try {
            const response = await fetch(`${API_BASE}/contacts/${contactId}/notes`, {
                headers: getAuthHeaders(),
                credentials: 'include' // Include cookies
            })

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            const data = await response.json()
            contactNotes.value = data.data || []
        } catch (err) {
            contactNotes.value = []
        } finally {
            loadingNotes.value = false
        }
    }

    // Create contact
    const createContact = async (form) => {
        loading.value = true
        try {
            const response = await fetch(`${API_BASE}/contacts`, {
                method: 'POST',
                credentials: 'include',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })
            const data = await response.json()
            return data
        } catch (err) {
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
    }

    // Update contact
    const updateContact = async () => {
        loading.value = true
        error.value = null

        try {
            const { id, ...updateData } = editForm
            const response = await fetch(`${API_BASE}/contacts/${id}`, {
                method: 'PUT',
                headers: getAuthHeaders(),
                credentials: 'include', // Include cookies
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
            await fetchContacts() // Refresh list
            resetEditForm()
            showEditForm.value = false
            editingContact.value = null
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

    // Delete contact
    const deleteContact = async (contactId) => {
        loading.value = true
        error.value = null

        try {
            const response = await fetch(`${API_BASE}/contacts/${contactId}`, {
                method: 'DELETE',
                headers: getAuthHeaders(),
                credentials: 'include' // Include cookies
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`)
            }

            // Success
            await fetchContacts() // Refresh list
            showDeleteConfirm.value = false
            contactToDelete.value = null
            return { success: true, message: data.message }

        } catch (err) {
            error.value = err.message
            return { success: false, message: err.message }
        } finally {
            loading.value = false
        }
    }

    // Add note to contact
    const addContactNote = async (contactId, note) => {
        loadingNotes.value = true
        error.value = null
        try {
            const response = await fetch(`${API_BASE}/contacts/${contactId}/notes`, {
                method: 'POST',
                headers: getAuthHeaders(),
                credentials: 'include', // Include cookies
                body: JSON.stringify({ note })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}`)
            }

            // Success
            await fetchContactNotes(contactId) // Refresh list

            return { success: true, message: data.message }
        } catch (err) {
            error.value = err.message
            return { success: false, message: err.message }
        } finally {
            loadingNotes.value = false
        }
    }

    const resetEditForm = () => {
        Object.assign(editForm, {
            id: null,
            name: '',
            email: '',
            phone: '',
        })
    }

    // Search and filter methods
    const setSearchQuery = (query) => {
        searchQuery.value = query
        currentPage.value = 1 // Reset to first page
    }

    const setMethodFilter = (method) => {
        selectedMethodFilter.value = method
        currentPage.value = 1 // Reset to first page
    }

    const setStatusFilter = (status) => {
        selectedStatusFilter.value = status
        currentPage.value = 1 // Reset to first page
    }

    // Sort method
    const handleSort = (column) => {
        if (sortColumn.value === column) {
            sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
        } else {
            sortColumn.value = column
            sortDirection.value = 'asc'
        }
        // Reset to first page when sorting
        currentPage.value = 1
    }

    const goToPage = (page) => {
        if (page >= 1 && page <= totalPages.value) {
            currentPage.value = page
        }
    }

    const openDetailModal = async (contact) => {
        detailContact.value = contact
        await fetchContactNotes(contact.id)
        showDetailModal.value = true
    }

    const openEditForm = (contact) => {
        editingContact.value = contact
        Object.assign(editForm, {
            id: contact.id,
            name: contact.name,
            email: contact.email,
            phone: contact.phone || ''
        })
        showEditForm.value = true
    }

    const openDeleteConfirm = (contact) => {
        contactToDelete.value = contact
        showDeleteConfirm.value = true
    }

    const closeAllModals = () => {
        showEditForm.value = false
        showDetailModal.value = false
        showDeleteConfirm.value = false
        detailContact.value = null
        editingContact.value = null
        contactToDelete.value = null
        error.value = null
    }

    // Status helpers
    const getStatusDisplayName = (statusName) => {
        const statusMap = {
            'new': 'Mới',
            'pending': 'Chờ phản hồi',
            'responded': 'Đã phản hồi',
            'closed': 'Đã đóng'
        }
        return statusMap[statusName] || statusName
    }

    const getStatusBadgeColor = (status) => {
        const colorMap = {
            'new': 'status-new',
            'pending': 'status-pending',
            'responded': 'status-responded',
            'closed': 'status-closed'
        }
        return colorMap[status] || 'status-default'
    }

    // Contact method helpers
    const getMethodDisplayName = (methodName) => {
        const methodMap = {
            'email': 'Email',
            'phone': 'Điện thoại',
            'social': 'Fb/Zalo'
        }
        return methodMap[methodName] || methodName
    }

    const getMethodIcon = (methodName) => {
        const iconMap = {
            'email': 'fas fa-envelope',
            'phone': 'fas fa-phone',
            'social': 'fas fa-share-alt'
        }
        return iconMap[methodName] || 'fas fa-question'
    }

    const getMethodBadgeColor = (method) => {
        const colorMap = {
            'email': 'method-email',
            'phone': 'method-phone',
            'social': 'method-social'
        }
        return colorMap[method] || 'method-default'
    }

    // Initialize
    onMounted(async () => {
        await Promise.all([
            fetchContacts(),
            fetchContactStats(),
            fetchAssignableUsers(),
        ])
    })


    return {
        contacts,
        stats,
        assignableUsers,
        contactNotes,
        loading,
        loadingNotes,
        error,

        // Search and Filter
        searchQuery,
        selectedStatusFilter,
        selectedMethodFilter,

        // Sort
        sortColumn,
        sortDirection,

        // Pagination
        currentPage,
        itemsPerPage,
        itemsPerPageOptions,
        filteredContacts,
        paginatedContacts,
        totalPages,

        // Form state
        detailContact,
        editingContact,
        showDetailModal,
        showEditForm,
        showDeleteConfirm,
        contactToDelete,
        editForm,

        // Methods
        fetchContacts,
        fetchContactStats,
        fetchAssignableUsers,
        fetchContactNotes,
        createContact,
        updateContact,
        deleteContact,
        addContactNote,

        // Form methods
        resetEditForm,
        openDetailModal,
        openEditForm,
        openDeleteConfirm,
        closeAllModals,

        // Search and Filter Methods
        setSearchQuery,
        setMethodFilter,
        setStatusFilter,
        handleSort,
        setItemsPerPage,
        goToPage,

        // Helpers
        getStatusDisplayName,
        getStatusBadgeColor,
        getMethodDisplayName,
        getMethodIcon,
        getMethodBadgeColor

    }
}
