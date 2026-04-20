import { ref, watch } from 'vue'

/**
 * Composable để quản lý pagination settings với localStorage persistence
 * Tất cả các trang danh sách sẽ chia sẻ cùng setting này để consistency
 */
export const usePaginationSettings = () => {
    // Default items per page options
    const itemsPerPageOptions = [
        { value: 5, label: '5 / trang' },
        { value: 10, label: '10 / trang' },
        { value: 20, label: '20 / trang' },
        { value: 50, label: '50 / trang' },
        { value: 100, label: '100 / trang' },
        { value: -1, label: 'Tất cả' }
    ]

    // Get saved setting from localStorage or default to 20
    const getSavedItemsPerPage = () => {
        if (process.client) {
            try {
                const saved = localStorage.getItem('admin_items_per_page')
                if (saved) {
                    const parsed = parseInt(saved)
                    // Validate that the saved value is in our options
                    const validOptions = itemsPerPageOptions.map(opt => opt.value)
                    if (validOptions.includes(parsed)) {
                        return parsed
                    }
                }
            } catch (error) {
                console.warn('Error reading pagination settings from localStorage:', error)
            }
        }
        return 20 // Default fallback
    }

    // Reactive items per page setting
    const itemsPerPage = ref(getSavedItemsPerPage())

    // Save to localStorage when changed
    const saveItemsPerPage = (newValue) => {
        if (process.client) {
            try {
                localStorage.setItem('admin_items_per_page', newValue.toString())
            } catch (error) {
                console.warn('Error saving pagination settings to localStorage:', error)
            }
        }
    }

    // Watch for changes and save to localStorage
    watch(itemsPerPage, (newValue) => {
        saveItemsPerPage(newValue)
    })

    // Method to set items per page (for form inputs)
    const setItemsPerPage = (value) => {
        const numValue = typeof value === 'string' ? parseInt(value) : value
        itemsPerPage.value = numValue
    }

    // Helper to get display label for current setting
    const getCurrentLabel = () => {
        const option = itemsPerPageOptions.find(opt => opt.value === itemsPerPage.value)
        return option ? option.label : `${itemsPerPage.value} / trang`
    }

    return {
        itemsPerPage,
        itemsPerPageOptions,
        setItemsPerPage,
        getCurrentLabel
    }
}