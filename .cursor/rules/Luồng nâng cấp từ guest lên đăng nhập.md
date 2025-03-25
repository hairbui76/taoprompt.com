---
title: Luồng nâng cấp từ guest lên đăng nhập

---

Dưới đây là **thiết kế chi tiết luồng nâng cấp lên đăng nhập**, kết hợp cả UX, kỹ thuật backend và dữ liệu database.

---

## 🎯 Mục tiêu của luồng nâng cấp

1. Cho phép người dùng bắt đầu **không cần đăng nhập** (vẫn tạo và lưu prompt theo `clientID`).
2. Khi họ **chọn đăng ký / đăng nhập**, hệ thống sẽ:
   - Tạo user mới (nếu đăng ký)
   - Liên kết các dữ liệu gắn với `clientID` vào tài khoản vừa đăng nhập
3. Sau đó, tất cả dữ liệu sẽ được đồng bộ và tiếp tục lưu theo `user_id`.

---

## 🧭 Sơ đồ luồng tổng quát

```mermaid
graph TD
A[Người dùng truy cập lần đầu] --> B[Tạo clientID ở frontend]
B --> C[Tạo prompt, lưu bằng clientID]
C --> D[User nhấn "Đăng ký / Đăng nhập"]
D --> E[Thực hiện đăng nhập qua Supabase Auth]
E --> F{Đã từng tạo prompt?}
F -- Có --> G[Liên kết các prompt có cùng clientID với user_id]
F -- Không --> H[Tạo user mới, không cần liên kết]
G --> I[Sử dụng tài khoản như bình thường]
H --> I
```

---

## 📦 Chi tiết triển khai

### 🛠 1. Cơ sở dữ liệu cần mở rộng

**Bảng `Prompts` thêm 2 trường:**
```sql
user_id UUID NULL,
linked BOOLEAN DEFAULT false
```

**Bảng `Users` (Supabase tự quản lý):**
```sql
id UUID PRIMARY KEY,
email TEXT,
created_at TIMESTAMP
```

---

### 🖥 2. Frontend – xử lý clientID và liên kết

#### a. Khi chưa đăng nhập:
- Tạo `clientID` (UUID) lưu vào `localStorage`
```js
const clientId = localStorage.getItem('client_id') || uuidv4();
localStorage.setItem('client_id', clientId);
```

#### b. Sau khi đăng nhập:
- Gửi `clientID` hiện tại lên server:
```ts
await fetch('/api/link-client-id', {
  method: 'POST',
  body: JSON.stringify({ clientId }),
});
```

---

### 🔧 3. Backend – API `/api/link-client-id`

Giả sử user đã đăng nhập → có `req.user.id` (qua Supabase JWT session)

```ts
// /api/link-client-id
export default async function handler(req, res) {
  const { clientId } = JSON.parse(req.body);
  const userId = req.user.id;

  // Lấy tất cả prompt chưa liên kết
  const prompts = await db.prompts.findMany({
    where: { client_id: clientId, user_id: null }
  });

  // Cập nhật prompt: thêm user_id, đánh dấu đã liên kết
  for (let prompt of prompts) {
    await db.prompts.update({
      where: { id: prompt.id },
      data: {
        user_id: userId,
        linked: true
      }
    });
  }

  res.status(200).json({ message: 'Linked successfully!' });
}
```

---

## 🧩 Gợi ý UI/UX

### ✅ Khi user đã tạo vài prompt nhưng chưa đăng nhập:
- Hiển thị banner hoặc popup:
```txt
🎉 Bạn đang dùng công cụ ở chế độ Khách!
👉 Đăng ký tài khoản để lưu trữ và đồng bộ các Prompt của bạn.
(Không mất dữ liệu hiện có)
```

### ✅ Sau khi đăng nhập xong:
- Thông báo nhỏ:
```txt
✅ Đã liên kết thành công 6 Prompt bạn tạo trước đó!
Bạn có thể xem tất cả trong mục "Lịch sử của tôi".
```

---

## 🔒 Bảo mật & kiểm tra
- Chỉ cho phép **user hiện tại** liên kết prompt có `clientID` khớp với browser hiện tại.
- Không public các prompt private của người khác dù có trùng clientID.

---

## ✨ Kết quả đạt được sau nâng cấp

| Tính năng | Trạng thái |
|----------|------------|
| Giữ dữ liệu cũ | ✅ Không mất prompt |
| Đồng bộ & cá nhân hóa | ✅ Tài khoản quản lý toàn bộ lịch sử |
| Trải nghiệm mượt mà | ✅ Không buộc đăng nhập từ đầu |
| Dễ mở rộng | ✅ Có thể triển khai tính năng nâng cao theo user (folder, like, tag...)

---

## 🚀 Kế hoạch nâng cấp Auth theo giai đoạn

| Giai đoạn | Nội dung |
|-----------|----------|
| Giai đoạn 1 | Public access, clientID |
| Giai đoạn 2 | Thêm login Google / email (Supabase Auth) |
| Giai đoạn 3 | Liên kết dữ liệu từ clientID sau login |
| Giai đoạn 4 | Tài khoản có tính năng mở rộng: lưu trữ cloud, export history, tag prompt... |

---