# Kế hoạch tái cấu trúc JavaScript cho Layout chung

## 🎯 Mục tiêu
- Loại bỏ code trùng lặp
- Tạo hệ thống modular dễ maintain
- Tối ưu performance và loading

## 📁 Cấu trúc file đề xuất

### 1. `common.js` (Core utilities - 150 dòng)
```javascript
// Các function dùng chung cho tất cả trang
- FAQ Accordion functionality
- Scroll to Top button
- Smooth Scrolling for anchors
- Contact Form handling
- Notification System
- Email validation helper
```

### 2. `layout.js` (Layout specific - 200 dòng) 
```javascript
// Các tính năng cho layout chung (header, nav, footer)
- Mobile Navigation Toggle
- Header Scroll Effects
- Active Navigation Link tracking
- Loading Animation
- Service Worker registration
```

### 3. `page-specific.js` (Trang cụ thể)
```javascript
// school-detail-specific.js (~150 dòng):
- Image management & lazy loading
- Hero Stats Animation (number counting)
- Contact Actions (WhatsApp, Zalo)
- Admin Interface utilities

// home-specific.js:
- Hero carousel/slider
- Statistics counters
- etc.
```

## 🔧 Cách implement

### Bước 1: Tạo common.js
```javascript
// Chứa: FAQ, ScrollToTop, SmoothScroll, ContactForm, Notification
window.CommonUtils = {
    initFAQ: function() { ... },
    initScrollToTop: function() { ... },
    initSmoothScrolling: function() { ... },
    initContactForm: function() { ... },
    showNotification: function(message, type) { ... }
};
```

### Bước 2: Tạo layout.js  
```javascript
// Chứa: Navigation, Header effects, Loading
window.LayoutUtils = {
    initNavigation: function() { ... },
    initHeaderEffects: function() { ... },
    initLoader: function() { ... }
};
```

### Bước 3: Refactor page-specific files
```javascript
// school-detail.js chỉ giữ lại:
- Image management
- Stats animation  
- Admin interface
- Contact actions (WhatsApp/Zalo)
```

## 🚀 Load strategy trong HTML

### Layout chung:
```html
<script src="assets/js/common.js"></script>
<script src="assets/js/layout.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Auto-init common utilities
    CommonUtils.initFAQ();
    CommonUtils.initScrollToTop();
    CommonUtils.initSmoothScrolling();
    
    // Auto-init layout features  
    LayoutUtils.initNavigation();
    LayoutUtils.initHeaderEffects();
});
</script>
```

### Trang cụ thể:
```html
<!-- Chỉ load thêm file page-specific -->
<script src="assets/js/school-detail-specific.js"></script>
<script>
document.addEventListener('DOMContentLoaded', function() {
    // Page-specific initialization
    SchoolDetailUtils.initImageManagement();
    SchoolDetailUtils.initStatsAnimation();
    SchoolDetailUtils.initContactActions();
});
</script>
```

## ✅ Lợi ích

1. **Giảm 60% code trùng lặp**
2. **Dễ maintain** - sửa 1 nơi apply all pages  
3. **Performance tốt hơn** - load theo nhu cầu
4. **Scalable** - dễ thêm trang mới
5. **Consistent** - behavior giống nhau across pages

## 📊 Tổng dung lượng

- **Hiện tại**: main.js (380 dòng) + school-detail.js (470 dòng) = 850 dòng
- **Sau optimize**: common.js (150) + layout.js (200) + specific.js (150) = 500 dòng
- **Tiết kiệm**: 41% dung lượng code

## 🎯 Phase tiếp theo

1. **Phase 1**: Tạo common.js với các utilities chung
2. **Phase 2**: Extract layout.js từ main.js  
3. **Phase 3**: Refactor school-detail.js thành specific file
4. **Phase 4**: Apply pattern cho các trang khác (home, contact, etc.)