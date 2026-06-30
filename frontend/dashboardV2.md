Những gì đã hoàn thành

Nâng cấp API dashboard lên chuẩn V2:
dashboard.controller.js
Đã bổ sung:

role: id, name
permissions: contacts, schools, news, system
visibleWidgets theo role
kpis có trend (delta, deltaPercent, direction)
alerts
sla
lists.todoToday
vẫn giữ các khối cũ để tương thích: overview, charts, lists, breakdowns
Mở route dashboard:
dashboard.routes.js
Gắn route vào app:
app.js
Nâng UI Dashboard để hiển thị dữ liệu V2:
index.vue
Đã bổ sung hiển thị:

Vai trò hiện tại
KPI đọc từ kpis + trend text
Cảnh báo hệ thống
Việc cần làm hôm nay
Giữ lại phần biểu đồ, liên hệ gần đây, top trường, thống kê tổng quan
Thêm CSS cho các block V2:
dashboard.css
Đã thêm style cho:

role line
alerts/todo cards
severity badge
priority badge
responsive cho khối V2
Các logic mới quan trọng đã có trong backend

Cảnh báo SLA liên hệ quá 24h/48h
Cảnh báo backup gần nhất thất bại (nếu có dữ liệu backup_records)
Cảnh báo tài khoản bị khóa
Todo tự sinh theo vai trò:
liên hệ cần xử lý
tin nháp cần rà soát
trường pending cần duyệt
KPI biến động theo kỳ trước
Kiểm tra chất lượng

Đã chạy kiểm tra lỗi cho:
dashboard.controller.js
index.vue
dashboard.css
Kết quả: không có lỗi.
Lưu ý

Workspace hiện có sẵn thay đổi ngoài phạm vi dashboard ở follow.md và tuts_git.md, mình không chỉnh các thay đổi đó.