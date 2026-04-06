# Trang Danh Sách Trường Nhật Ngữ

## Tổng quan
Trang `japanese-schools.html` hiển thị danh sách 5 trường nhật ngữ uy tín tại Nhật Bản với layout card đẹp mắt và đầy đủ thông tin.

## Tính năng chính

### 1. **Filter và Search**
- **Filter theo vị trí**: Tokyo, Osaka, Kyoto, Tất cả
- **Search box**: Tìm kiếm theo tên trường hoặc mô tả
- **Real-time filtering**: Kết quả hiển thị ngay lập tức

### 2. **School Cards**
Mỗi trường có card riêng với thông tin:
- **Hình ảnh**: Với placeholder gradients đẹp mắt
- **Badges**: Featured, Popular, Cultural, International, Affordable
- **Rating**: Hệ thống sao với điểm số
- **Location**: Vị trí với icon
- **Mô tả**: Thông tin tóm tắt về trường
- **Highlights**: 3 thông số quan trọng (sĩ số, tỷ lệ thành công, thời gian học)
- **Features**: Tags đặc trưng của trường
- **Pricing**: Học phí và nút hành động

### 3. **5 Trường Được Giới Thiệu**

#### ISI Language School Tokyo
- **Vị trí**: Tokyo
- **Badge**: Nổi Bật (Featured)  
- **Rating**: 5.0/5 ⭐
- **Học phí**: 780,000 Yên/năm
- **Đặc điểm**: Tỷ lệ đỗ đại học cao (95%), sĩ số lớp nhỏ (15-20)

#### Human Academy Japanese Language School
- **Vị trí**: Osaka
- **Badge**: Phổ Biến (Popular)
- **Rating**: 4.5/5 ⭐
- **Học phí**: 720,000 Yên/năm  
- **Đặc điểm**: Mạnh về JLPT (92%), nhiều hoạt động văn hóa

#### Kyoto Institute of Culture and Language
- **Vị trí**: Kyoto
- **Badge**: Văn Hóa (Cultural)
- **Rating**: 4.2/5 ⭐
- **Học phí**: 650,000 Yên/năm
- **Đặc điểm**: Văn hóa truyền thống, tea ceremony, calligraphy

#### Intercultural Institute of Japan
- **Vị trí**: Tokyo
- **Badge**: Quốc Tế (International)
- **Rating**: 4.6/5 ⭐
- **Học phí**: 850,000 Yên/năm
- **Đặc điểm**: 40+ quốc gia, Business Japanese, Career Support

#### Osaka YMCA International School
- **Vị trí**: Osaka  
- **Badge**: Hợp Lý (Affordable)
- **Rating**: 4.0/5 ⭐
- **Học phí**: 580,000 Yên/năm
- **Đặc điểm**: Học phí thấp nhất, hỗ trợ tài chính

### 4. **Comparison Table**
Bảng so sánh nhanh các trường với:
- Tên trường
- Vị trí  
- Học phí/năm
- Sĩ số lớp
- Tỷ lệ thành công
- Đặc điểm nổi bật

### 5. **Call-to-Action**
Section cuối trang khuyến khích liên hệ tư vấn với gradient background đẹp mắt.

## Thiết kế và UX

### **Color Coding cho Badges**
- 🔴 **Featured**: Đỏ gradient (nổi bật nhất)
- 🔵 **Popular**: Xanh dương (phổ biến)  
- 🟢 **Cultural**: Xanh lá (văn hóa truyền thống)
- 🟡 **International**: Vàng/Hồng (đa quốc gia)
- 🟣 **Affordable**: Tím/Hồng nhạt (giá rẻ)

### **Responsive Design**
- **Desktop**: Grid 2 cột
- **Tablet**: Grid 1-2 cột tùy kích thước
- **Mobile**: 1 cột, highlights vertical layout

### **Interactive Elements**
- Hover effects trên cards (lift effect)
- Image zoom on hover
- Button transitions
- Filter button states
- Search input focus states

## Navigation

### **Dropdown Menu "Du học"**
Đã được thêm vào navigation với các mục:
- ✅ **Trường Nhật Ngữ** → japanese-schools.html
- 📝 **Trường Đại Học** (placeholder)
- 💰 **Học Bổng** (placeholder)

### **Breadcrumb**
Trang chủ / Du học / Trường Nhật Ngữ

## Files liên quan

### **HTML**
- `japanese-schools.html` - Trang chính

### **CSS**
- `assets/css/style.css` - Main styles (thêm Japanese Schools section)
- `assets/css/responsive.css` - Responsive styles (thêm mobile/tablet)

### **JavaScript** 
- Filter functionality  
- Search functionality
- Dropdown menu interactions

### **Navigation Updates**
- `index.html` - Added dropdown menu
- `contact.html` - Added dropdown menu  
- `news.html` - Added dropdown menu
- `news-detail.html` - Added dropdown menu

## Customization

### **Thêm trường mới**
1. Copy template school-card trong HTML
2. Cập nhật thông tin: tên, vị trí, học phí, rating, highlights, features
3. Thêm data-location attribute cho filter
4. Thêm hình ảnh hoặc gradient background

### **Thay đổi filter**
- Cập nhật filter buttons trong `.filter-tabs`
- Cập nhật JavaScript logic
- Thêm data-location attributes tương ứng

### **Style customization**
- Badge colors trong `.school-badge.{type}`
- Card hover effects trong `.school-card:hover`  
- Color scheme trong CSS variables

## Integration với CMS

Trang này đã được thiết kế với cấu trúc dễ dàng integrate với admin panel:
- Mỗi school card có data attributes
- JSON-friendly structure
- Reusable components
- Dynamic filtering/search ready

## Performance

- **Optimized images**: Placeholder gradients thay thế hình ảnh
- **CSS Grid**: Hiệu năng cao cho layout
- **Debounced search**: Tránh spam API calls  
- **Lazy loading ready**: Structure sẵn sàng cho lazy load images

## Browser Support

- ✅ All modern browsers (Chrome, Firefox, Safari, Edge)
- ✅ Mobile browsers  
- ✅ CSS Grid support required
- ✅ Flexbox support required

---

**Lưu ý**: Hiện tại đang sử dụng placeholder images. Trong production, cần thay thế bằng hình ảnh thực tế của các trường.