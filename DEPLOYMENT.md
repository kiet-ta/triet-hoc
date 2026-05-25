# HƯỚNG DẪN TRIỂN KHAI DỰ ÁN (DEPLOYMENT GUIDE)

Dự án này đã được cấu hình hoàn chỉnh theo tiêu chuẩn production-ready, sẵn sàng để triển khai trực tiếp lên các nền tảng đám mây (Render, Railway, Fly.io, AWS, Google Cloud, Heroku...) hoặc chạy qua Docker.

---

## 1. Cơ Chế Kết Nối Cơ Sở Dữ Liệu (PostgreSQL & SQLite)

Mã nguồn Backend sử dụng **SQLAlchemy 2.0** và **Alembic** để quản lý cơ sở dữ liệu. Hệ thống tự động chuyển đổi linh hoạt:
- **Local Development**: Nếu không cấu hình `DATABASE_URL`, ứng dụng tự động chạy trên cơ sở dữ liệu **SQLite** cục bộ (`sqlite:///./trietlylagi.db`).
- **Production / Deployment**: Khi cấu hình biến môi trường `DATABASE_URL` trỏ tới PostgreSQL, backend sẽ tự động tải driver `psycopg` (đã khai báo trong `requirements.txt`) và kết nối trực tiếp đến PostgreSQL database của bạn.

> [!IMPORTANT]
> **Chuẩn hóa Chuỗi Kết Nối**: 
> Backend có sẵn bộ lọc chuẩn hóa tự động các chuỗi kết nối dạng `postgres://` (của Heroku/Render) thành `postgresql+psycopg://` để tương thích hoàn toàn với SQLAlchemy 2.0 mà không gây lỗi crash ứng dụng.

---

## 2. Các Biến Môi Trường Cần Thiết (Environment Variables)

Khi cấu hình trên dashboard của nền tảng deploy (ví dụ: Render Env Variables), hãy khai báo đầy đủ các biến môi trường sau:

| Biến Môi Trường | Ý nghĩa / Giá trị mẫu | Trạng thái |
| :--- | :--- | :--- |
| `DATABASE_URL` | Chuỗi kết nối Postgres của bạn (ví dụ từ Neon, Supabase, RDS) | **Bắt buộc** |
| `SECRET_KEY` | Chuỗi ký tự ngẫu nhiên dài để mã hóa JWT token bảo mật | **Bắt buộc** |
| `FRONTEND_ORIGIN` | URL của frontend sau khi deploy (ví dụ: `https://trietlylagi.vercel.app`) | Khuyên dùng |
| `ADMIN_EMAIL` | Email đăng nhập trang Admin (mặc định: `admin@example.com`) | Tùy chọn |
| `ADMIN_PASSWORD` | Mật khẩu đăng nhập trang Admin (mặc định: `admin123`) | Tùy chọn |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Thời gian hết hạn của phiên đăng nhập Admin (phút, mặc định: `120`) | Tùy chọn |

---

## 3. Các Câu Lệnh Khởi Chạy Môi Trường Triển Khai

### Bước A: Chạy Migrations Dựng Cơ Sở Dữ Liệu
Trước khi khởi động ứng dụng lần đầu tiên hoặc mỗi khi có thay đổi cấu trúc bảng, chạy lệnh sau từ thư mục `backend/` để Alembic tự động khởi tạo/nâng cấp cấu trúc các bảng trên database PostgreSQL:
```bash
alembic upgrade head
```

### Bước B: Nạp Dữ Liệu Mẫu Ban Đầu (Seed Data)
Để khởi tạo 11 hồ sơ triết gia, 20 câu hỏi và tài khoản quản trị viên mặc định, chạy lệnh sau:
```bash
python -m app.seed.seed_data
```

> [!TIP]
> **Khuyên dùng**: Trên các nền tảng như Render, bạn có thể gộp 2 câu lệnh trên vào **Release Command** (lệnh chạy trước khi build thành công):
> `cd backend && alembic upgrade head && python -m app.seed.seed_data`

### Bước C: Lệnh Chạy Ứng Dụng (Start Command)
Để khởi động server chính chạy FastAPI:
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 4. Triển Khai Bằng Docker (Sử dụng Dockerfile có sẵn)

Dự án đã có sẵn [Dockerfile](file:///E:/FPTU/Semester-7/MLN122/code/triet-hoc/backend/Dockerfile) chuẩn hóa ở thư mục `backend/`. 

Để xây dựng (build) và chạy container trên server riêng:

1. **Build Docker Image**:
   ```bash
   docker build -t trietly-backend:latest ./backend
   ```
2. **Khởi chạy Docker Container** (Gắn các biến môi trường tương ứng):
   ```bash
   docker run -d -p 8000:8000 \
     -e DATABASE_URL="postgresql://user:password@host:5432/dbname" \
     -e SECRET_KEY="your-random-secret" \
     -e FRONTEND_ORIGIN="https://your-frontend.com" \
     trietly-backend:latest
   ```
