# Pagination Settings Composable

## Tóm tắt

`usePaginationSettings` là một composable dùng để quản lý việc chọn số bản ghi hiển thị trên mỗi trang cho tất cả các trang danh sách trong ứng dụng admin. Setting này sẽ được lưu trữ persistent trong localStorage và chia sẻ giữa các trang.

## Cách sử dụng

### Import composable
```javascript
import { usePaginationSettings } from '~/composables/usePaginationSettings'
```

### Sử dụng trong composable khác (như useUsersAPI)
```javascript
export const useUsersAPI = () => {
    // Pagination settings (persistent across sessions)
    const { itemsPerPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()
    
    // ... rest of your code
    
    return {
        itemsPerPage,
        itemsPerPageOptions,
        setItemsPerPage,
        // ... other exports
    }
}
```

### Sử dụng trong template Vue
```vue
<template>
    <select :value="itemsPerPage" @change="setItemsPerPage(parseInt($event.target.value))">
        <option v-for="option in itemsPerPageOptions" :key="option.value" :value="option.value">
            {{ option.label }}
        </option>
    </select>
</template>
```

## Tính năng

### ✅ Persistent Storage
- Setting được lưu trong `localStorage` với key `admin_items_per_page`
- Tự động load lại khi refresh trang hoặc login mới
- Fallback về 20 nếu không có setting hoặc setting không hợp lệ

### ✅ Validation  
- Chỉ chấp nhận các giá trị có trong `itemsPerPageOptions`
- Tự động validate và fallback nếu giá trị không hợp lệ

### ✅ Options có sẵn
- 5 bản ghi / trang
- 10 bản ghi / trang  
- 20 bản ghi / trang (default)
- 50 bản ghi / trang
- 100 bản ghi / trang
- -1 = Hiển thị tất cả

### ✅ Reactive Updates
- Tự động save vào localStorage khi có thay đổi
- Reactive với Vue composition API

## Sử dụng cho các trang khác

Để áp dụng cho các trang danh sách khác (Schools, Contacts, v.v.), chỉ cần:

1. **Tạo composable tương tự useUsersAPI** (ví dụ: `useSchoolsAPI.js`)
2. **Import và sử dụng usePaginationSettings**
3. **Export các properties cần thiết** 
4. **Update template** để sử dụng itemsPerPageOptions

### Ví dụ cho Schools API:
```javascript
// composables/useSchoolsAPI.js
import { usePaginationSettings } from './usePaginationSettings'

export const useSchoolsAPI = () => {
    const { itemsPerPage, itemsPerPageOptions, setItemsPerPage } = usePaginationSettings()
    
    // Tính toán pagination cho schools
    const paginatedSchools = computed(() => {
        if (itemsPerPage.value === -1) return filteredSchools.value
        const start = (currentPage.value - 1) * itemsPerPage.value
        const end = start + itemsPerPage.value
        return filteredSchools.value.slice(start, end)
    })
    
    return {
        itemsPerPage,
        itemsPerPageOptions,
        setItemsPerPage,
        paginatedSchools,
        // ... other exports
    }
}
```

## Lợi ích

1. **Consistency**: Tất cả các trang danh sách có cùng behavior
2. **UX tốt hơn**: User không cần chọn lại số bản ghi mỗi lần
3. **Maintainable**: Centralized logic, dễ modify options
4. **Reusable**: Có thể dùng cho mọi trang danh sách
5. **Performance**: Tránh re-render không cần thiết

## Lưu ý

- Chỉ hoạt động trên client-side (`process.client` check)
- Graceful fallback nếu localStorage bị lỗi
- Setting được chia sẻ global cho tất cả admin pages
- Default value: 20 items per page