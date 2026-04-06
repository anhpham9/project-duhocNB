# Hướng Dẫn CSS Admin-Editable Content System

## Tổng quan
Hệ thống CSS này được thiết kế để hỗ trợ việc chỉnh sửa nội dung thông qua trang quản trị (CMS). Các class CSS đã được chuẩn bị sẵn để có thể tái sử dụng và điều khiển từ giao diện admin.

## 1. Cấu trúc HTML cho Admin-Editable Content

### Basic Text Elements
```html
<!-- Đoạn văn có thể chỉnh sửa -->
<div class="editable-section" data-type="paragraph">
    <p class="editable-paragraph">Nội dung đoạn văn có thể được chỉnh sửa từ admin</p>
</div>

<!-- Tiêu đề có thể chỉnh sửa -->
<div class="editable-section" data-type="heading">
    <h2 class="editable-h2">Tiêu đề có thể chỉnh sửa</h2>
</div>

<!-- Danh sách có thể chỉnh sửa -->
<div class="editable-section" data-type="list">
    <ul class="editable-list">
        <li class="editable-list-item">Mục 1</li>
        <li class="editable-list-item">Mục 2</li>
    </ul>
</div>
```

### Quote Box với các style khác nhau
```html
<!-- Quote box cơ bản -->
<div class="quote-box editable-quote" data-style="default">
    <blockquote>
        "Nội dung trích dẫn có thể được chỉnh sửa từ admin"
    </blockquote>
</div>

<!-- Quote box đơn giản -->
<div class="quote-box editable-quote" data-style="simple">
    <blockquote>
        "Quote với style đơn giản"
    </blockquote>
</div>

<!-- Quote box nổi bật -->
<div class="quote-box editable-quote" data-style="highlighted">
    <blockquote>
        "Quote với style nổi bật"
    </blockquote>
</div>
```

### Tips Box với nhiều style
```html
<!-- Tips box cơ bản -->
<div class="tips-box editable-tips" data-style="default">
    <div class="tip-item editable-tip">
        <i class="fas fa-lightbulb tip-icon"></i>
        <div class="tip-content">
            <p><strong>Mẹo 1:</strong> Nội dung mẹo có thể chỉnh sửa</p>
        </div>
    </div>
</div>

<!-- Tips box có màu -->
<div class="tips-box editable-tips" data-style="colored">
    <!-- Nội dung tips -->
</div>

<!-- Tips box có viền -->
<div class="tips-box editable-tips" data-style="bordered">
    <!-- Nội dung tips -->
</div>
```

### Info Box cho thông báo
```html
<div class="info-box success">
    <p>Thông báo thành công</p>
</div>

<div class="info-box warning">
    <p>Thông báo cảnh báo</p>
</div>

<div class="info-box error">
    <p>Thông báo lỗi</p>
</div>

<div class="info-box info">
    <p>Thông báo thông tin</p>
</div>
```

## 2. Layout System cho Admin

### Content Sections với layout linh hoạt
```html
<!-- Layout 2 cột -->
<div class="content-section" data-layout="two-column">
    <div class="content-card">
        <h3>Nội dung cột 1</h3>
        <p>Văn bản cột 1</p>
    </div>
    <div class="content-card">
        <h3>Nội dung cột 2</h3>
        <p>Văn bản cột 2</p>
    </div>
</div>

<!-- Layout 3 cột -->
<div class="content-section" data-layout="three-column">
    <div class="content-card">Nội dung 1</div>
    <div class="content-card">Nội dung 2</div>
    <div class="content-card">Nội dung 3</div>
</div>
```

### Cards với các style khác nhau
```html
<!-- Card cơ bản -->
<div class="content-card editable-card">
    <h4>Tiêu đề card</h4>
    <p>Nội dung card</p>
</div>

<!-- Card có viền -->
<div class="content-card editable-card bordered">
    <h4>Card có viền</h4>
</div>

<!-- Card có màu -->
<div class="content-card editable-card colored">
    <h4>Card có màu</h4>
</div>
```

## 3. Utility Classes cho Admin Control

### Spacing Classes
```html
<div class="spacing-small">Khoảng cách nhỏ</div>
<div class="spacing-medium">Khoảng cách vừa</div>
<div class="spacing-large">Khoảng cách lớn</div>

<div class="padding-small">Padding nhỏ</div>
<div class="padding-medium">Padding vừa</div>
<div class="padding-large">Padding lớn</div>
```

### Text Alignment
```html
<div class="text-left">Canh trái</div>
<div class="text-center">Canh giữa</div>
<div class="text-right">Canh phải</div>
```

### Color Classes
```html
<span class="text-primary">Màu chính</span>
<span class="text-secondary">Màu phụ</span>
<span class="text-success">Màu thành công</span>
<span class="text-warning">Màu cảnh báo</span>
<span class="text-error">Màu lỗi</span>

<div class="bg-light">Nền sáng</div>
<div class="bg-white">Nền trắng</div>
<div class="bg-primary">Nền màu chính</div>
<div class="bg-gradient">Nền gradient</div>
```

## 4. Interactive Elements

### Buttons có thể tùy chỉnh
```html
<!-- Button chính -->
<a href="#" class="editable-button">Nút chính</a>

<!-- Button phụ -->
<a href="#" class="editable-button secondary">Nút phụ</a>

<!-- Button động -->
<button class="dynamic-button">Nút động</button>
```

### Links có thể chỉnh sửa
```html
<a href="#" class="editable-link">Link có thể chỉnh sửa</a>
```

### Highlight text
```html
<span class="highlight-text">Text được highlight</span>
```

## 5. Images và Media

### Images có thể chỉnh sửa
```html
<div class="editable-image">
    <img src="path/to/image.jpg" alt="Alt text">
    <div class="image-caption">Caption có thể chỉnh sửa</div>
</div>
```

## 6. Tags System

### Tags với nhiều style
```html
<div class="editable-tags">
    <h3>Từ khóa:</h3>
    <div class="editable-tag-list">
        <a href="#" class="editable-tag">Tag cơ bản</a>
        <a href="#" class="editable-tag" data-style="outline">Tag viền</a>
        <a href="#" class="editable-tag" data-style="gradient">Tag gradient</a>
    </div>
</div>
```

## 7. Admin Interface Elements

### WYSIWYG Editor Container
```html
<div class="editor-content" contenteditable="true">
    <div class="placeholder">Nhập nội dung tại đây...</div>
    <!-- Nội dung sẽ được add động -->
</div>
```

### Admin Toolbar
```html
<div class="admin-toolbar">
    <button class="admin-btn" data-action="bold">Bold</button>
    <button class="admin-btn" data-action="italic">Italic</button>
    <button class="admin-btn" data-action="add-quote">Add Quote</button>
    <button class="admin-btn" data-action="add-tips">Add Tips</button>
</div>
```

### Content Blocks cho editing
```html
<div class="content-block dynamic-component" data-component-type="paragraph">
    <p class="editable-paragraph">Nội dung paragraph</p>
    <div class="block-controls">
        <button class="block-control-btn" title="Edit">✎</button>
        <button class="block-control-btn" title="Delete">✕</button>
        <button class="block-control-btn" title="Move">⇕</button>
    </div>
</div>
```

## 8. JavaScript Integration

### Data Attributes cho Admin Control
Tất cả các element editable nên có các data attribute sau:
- `data-editable="true"` - Đánh dấu có thể chỉnh sửa
- `data-type="paragraph|heading|list|quote|tips|image"` - Loại component
- `data-id="unique-id"` - ID unique cho database
- `data-style="default|simple|highlighted|colored|bordered"` - Style variant

### Example:
```html
<div class="editable-section" 
     data-editable="true" 
     data-type="quote" 
     data-id="quote-123" 
     data-style="highlighted">
    <div class="quote-box editable-quote" data-style="highlighted">
        <blockquote>Nội dung trích dẫn</blockquote>
    </div>
</div>
```

## 9. Responsive Behavior

Tất cả các component trên đã được tích hợp responsive design. Trên mobile:
- Layout 2-3 cột sẽ chuyển thành 1 cột
- Font size sẽ được điều chỉnh tự động  
- Padding và margin sẽ được tối ưu cho mobile

## 10. Best Practices

### Khi triển khai Admin Panel:
1. **Database Structure**: Lưu content dưới dạng JSON với type, content, và style
2. **Security**: Sanitize tất cả input từ admin
3. **SEO**: Đảm bảo content có proper heading structure
4. **Performance**: Cache rendered HTML sau khi save từ admin
5. **Backup**: Luôn backup content trước khi update

### Example Database Schema:
```json
{
  "id": "content-123",
  "type": "paragraph", 
  "content": "Nội dung paragraph",
  "style": "default",
  "order": 1,
  "page_id": "news-detail-123"
}
```

Hệ thống này cho phép admin panel có thể:
- Thêm/xóa/sửa content blocks
- Thay đổi style của từng component
- Sắp xếp lại thứ tự các block
- Preview trước khi publish
- Tạo template có thể tái sử dụng