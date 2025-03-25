---
title: Luồng phân tích và tạo prompt

---

**Luồng xử lý rõ ràng và chuyên nghiệp**, giúp AI phân tích – xây prompt – quản lý phiên bản, và phản hồi cho người dùng.

---

## 📌 Mục tiêu

Thiết lập một luồng rõ ràng để:

1. Phân tích yêu cầu người dùng bằng `prompt_1.md`
2. Tạo prompt chuyên nghiệp dựa trên phân tích bằng `prompt_2.md`
3. Quản lý dữ liệu, phiên bản, và lưu trữ kết quả hiệu quả.

---

## 🧭 Luồng tổng thể (Logical Flow)

```mermaid
graph TD;
A[Người dùng nhập yêu cầu] --> B[Phân tích yêu cầu (prompt_1.md)]
B --> C{Kết quả phân tích}
C --> D[Tạo prompt chuyên nghiệp (prompt_2.md)]
D --> E[Lưu final prompt + analysis]
E --> F{Chế độ auto version?}
F -- Có --> G[Tạo thêm 2-5 phiên bản]
F -- Không --> H[Lưu 1 phiên bản]
H --> I[Hiển thị cho người dùng]
```

---

## 🔍 Chi tiết từng bước triển khai

### ✅ Bước 1: Người dùng nhập yêu cầu

- Input: Chuỗi văn bản (ví dụ: "Tạo một bài post Facebook cho sáng chủ nhật")
- Lưu tạm thời: `user_request`

---

### ✅ Bước 2: Gửi `user_request` vào **prompt_1.md** để phân tích

#### prompt_1.md nhận:
```md
<yêu_cầu_người_dùng>
{{user_request}}
</yêu_cầu_người_dùng>
```

#### Output:
- `<quá_trình_phân_tích>`: phản ánh cách AI suy nghĩ
- `<kết_quả_phân_tích>`: tóm tắt structured theo 8 mục
- Có thể lưu thành `analysis_result`

📦 **Lưu vào DB (bảng Prompts)**:
- `user_request`
- `analysis_result` (markdown hoặc JSON)

---

### ✅ Bước 3: Dùng kết quả phân tích đưa vào **prompt_2.md**

#### prompt_2.md nhận:
```md
<yêu_cầu_gốc>
{{user_request}}
</yêu_cầu_gốc>

<quá_trình_phân_tích>
{{quá_trình_phân_tích}}
</quá_trình_phân_tích>

<kết_quả_phân_tích>
{{analysis_result}}
</kết_quả_phân_tích>
```

#### Output:
- `<phân_tích_và_lập_kế_hoạch>`: lý do chọn cách viết prompt
- `<prompt_xây_dựng>`: prompt hoàn chỉnh theo cấu trúc chuẩn

📦 Lưu lại `final_prompt` vào DB

---

### ✅ Bước 4: Tạo bản chính và các bản auto (nếu bật)

- Nếu chế độ `autoVersion === true`:
  - Tạo thêm 2-4 phiên bản khác nhau bằng cách:
    - Thay đổi công thức được áp dụng (AIDA vs STAR)
    - Thay đổi cách tiếp cận (step-by-step, general, by-example)
  - Ghi vào bảng `PromptVersions`

---

### ✅ Bước 5: Trả kết quả cho người dùng

- Giao diện hiển thị:
  - Prompt phân tích (`<kết_quả_phân_tích>`)
  - Prompt đã xây dựng (`<prompt_xây_dựng>`)
  - Các phiên bản khác nếu có
  - Nút “Đặt public” hoặc “Export Markdown”

---

## 🗂 Cấu trúc file & biến

| Tên file | Vai trò |
|----------|---------|
| `prompt_1.md` | Phân tích yêu cầu người dùng thành dữ liệu structured |
| `prompt_2.md` | Dùng kết quả phân tích để xây prompt hoàn chỉnh |

| Biến | Nội dung |
|------|----------|
| `user_request` | Yêu cầu ban đầu người dùng nhập |
| `analysis_result` | Kết quả được phân tích từ `prompt_1.md` |
| `final_prompt` | Prompt chuyên nghiệp được tạo từ `prompt_2.md` |
| `client_id` | ID lưu tại frontend |
| `version_number` | Số thứ tự phiên bản trong bảng `PromptVersions` |

---

## 📦 Cách lưu vào database

### Bảng `Prompts`
| Field | Loại | Mô tả |
|-------|------|------|
| id | UUID | Primary key |
| client_id | string | Gắn với browser |
| user_request | text | Yêu cầu gốc |
| analysis_result | text / jsonb | Kết quả phân tích |
| final_prompt | text | Prompt chính |
| model_used | string | GPT-4o, Claude, v.v. |
| auto_version | boolean | Có tạo hàng loạt không |
| status | enum | private / public |
| created_at | timestamp |  |

### Bảng `PromptVersions`
| Field | Loại |
|-------|------|
| id | UUID |
| prompt_id | FK |
| version_number | int |
| final_prompt | text |
| notes | text |
| model_used | string |

---

## 📦 Bonus: Quy trình API

| API Route | Mô tả |
|-----------|------|
| `POST /api/analyze` | Chạy `prompt_1.md` với `user_request` |
| `POST /api/generate` | Chạy `prompt_2.md` với `analysis_result` |
| `POST /api/version` | Tạo thêm phiên bản |
| `GET /api/prompts?client_id=X` | Trả về danh sách lịch sử |
| `POST /api/publish` | Đánh dấu prompt là công khai |
| `GET /api/public-prompts` | Trả về thư viện prompt công khai |

---

## ✅ Tóm tắt luồng triển khai

1. User nhập yêu cầu → chạy `prompt_1.md` → phân tích
2. Phân tích xong → truyền vào `prompt_2.md` → tạo prompt hoàn chỉnh
3. Lưu toàn bộ vào DB (gắn clientID)
4. Giao diện hiển thị kết quả, version, và export
5. Cho phép public → xuất hiện ở thư viện công khai

---