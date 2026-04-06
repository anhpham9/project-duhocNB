# Website Du Học Nhật Bản

Dự án website tư vấn du học Nhật Bản được xây dựng bằng HTML, CSS và JavaScript thuần.

## Tính năng chính

- **Trang chủ giới thiệu**: Hero section với slogan và call-to-action
- **Dịch vụ**: 4 dịch vụ chính của công ty tư vấn du học
- **Lý do chọn**: Điểm mạnh và ưu thế của công ty
- **Thông tin chi phí**: Chi tiết về chi phí du học Nhật Bản
- **FAQ**: Các câu hỏi thường gặp về du học
- **Form liên hệ**: Đăng ký tư vấn miễn phí
- **Responsive**: Tương thích với tất cả thiết bị

## Cấu trúc thư mục

```
duhocNB/
├── index.html              # Trang chính
├── assets/
│   ├── css/
│   │   ├── style.css       # CSS chính
│   │   └── responsive.css  # CSS responsive
│   ├── js/
│   │   └── main.js         # JavaScript
│   └── images/            # Hình ảnh
└── README.md
```

## Cách sử dụng

1. **Mở website**: Mở file `index.html` trong trình duyệt
2. **Thêm hình ảnh**: Thay thế các placeholder image trong thư mục `assets/images/`
3. **Tùy chỉnh nội dung**: Chỉnh sửa nội dung trong file `index.html`
4. **Thay đổi màu sắc**: Chỉnh sửa CSS trong file `assets/css/style.css`

## Hình ảnh cần thêm

Để website hoạt động tốt nhất, bạn cần thêm các hình ảnh sau vào thư mục `assets/images/`:

- `logo.png` - Logo công ty (đã có file SVG mẫu)
- `hero-bg.jpg` - Ảnh nền hero section
- `students-group.jpg` - Ảnh nhóm sinh viên
- `student-girl.jpg` - Ảnh nữ sinh viên
- `about-us.jpg` - Ảnh về công ty

## Tùy chỉnh

### Thay đổi màu chủ đạo
Trong file `style.css`, tìm và thay đổi các giá trị màu:
```css
#d32f2f /* Màu đỏ chính */
#ffeb3b /* Màu vàng accent */
```

### Thêm/sửa nội dung
- **Thông tin liên hệ**: Sửa trong section `#contact`
- **Dịch vụ**: Thêm/sửa trong section `.services`
- **FAQ**: Thêm câu hỏi mới trong section `.faq`

### Responsive
Website đã được tối ưu cho:
- Desktop (1200px+)
- Tablet (768px - 1024px)
- Mobile (< 768px)

## Tính năng JavaScript

- Navigation menu responsive
- Smooth scrolling
- FAQ accordion
- Form validation
- Back to top button
- Loading animation
- Scroll animations

## Trình duyệt hỗ trợ

- Chrome 60+
- Firefox 60+
- Safari 12+
- Edge 79+

## Deployment

Website có thể được deploy trên:
- GitHub Pages
- Netlify
- Vercel
- Hosting thông thường

Chỉ cần upload toàn bộ thư mục lên server và website sẽ hoạt động ngay lập tức.

## Liên hệ

Nếu có thắc mắc về code hoặc cần hỗ trợ tùy chỉnh, vui lòng liên hệ qua website.