# 🚀 Jalcode Workspace

Sistem pengurusan dalaman dan papan pemuka (dashboard) operasi untuk agensi digital **Jalcode**. Projek ini dibangunkan untuk menguruskan data direktori pasukan (Web, Mobile, UI/UX, IoT, Mentor) dan menjejak status projek klien secara _real-time_.

## 🛠️ Tech Stack (Teknologi yang Digunakan)

### Backend

- **Bahasa:** Golang
- **Framework:** Gin Web Framework
- **ORM:** GORM
- **Pangkalan Data:** PostgreSQL
- **Keselamatan:** JWT (JSON Web Tokens) & bcrypt (Password Hashing)

### Frontend

- **Bahasa:** TypeScript
- **Framework:** Next.js (App Router)
- **Penggayaan (Styling):** Tailwind CSS
- **Ikon & Notifikasi:** `lucide-react` & `react-hot-toast`
- **Pengurusan Sesi:** `js-cookie`

---

## 📚 Pelajaran & Konsep Penting (Lessons Learned)

Dalam proses membina aplikasi _Full-Stack_ ini, terdapat beberapa pemahaman seni bina (_architecture_) dan penyelesaian pepijat (_debugging_) yang penting untuk diingati:

### 1. Keselamatan Aplikasi (Authentication & Middleware)

- **Backend (Golang):** Kata laluan tidak pernah disimpan dalam bentuk teks biasa. Ia disulitkan menggunakan `bcrypt`. Sesi log masuk diuruskan dengan menghasilkan token JWT.
- **Frontend (Next.js):** Menggunakan `middleware.ts` sebagai "Pengawal Keselamatan". Ia memeriksa _Cookies_ penyemak imbas (browser). Jika tiada token JWT, pengguna yang cuba mengakses `/` (Dashboard) akan ditendang terus ke halaman `/login`.

### 2. Pengurusan Pangkalan Data Relasional (GORM)

- Membina hubungan (relasi) antara `Project` dan `TeamMember` (PIC).
- **Penting:** Semasa menyimpan (POST) projek baharu, kita mesti menambah tag `binding:"-"` pada model relasi di Golang agar Gin tidak memaksa pengesahan data pasukan secara keseluruhan, memadai dengan menghantar `team_member_id` sahaja.
- Menggunakan fungsi `.Preload("TeamMember")` dalam GORM untuk menarik data relasi secara automatik supaya nama PIC boleh dipaparkan di bahagian _frontend_.

### 3. Data Transfer Object (DTO)

- Untuk mengelakkan masalah teknikal dan mengekalkan struktur kod yang bersih, data dari pangkalan data dipetakan (_mapped_) terlebih dahulu ke dalam fail DTO sebelum dihantar sebagai tindak balas JSON. Ini memastikan hanya data yang relevan (seperti Nama, Peranan, Emel PIC) dihantar kepada klien.

### 4. Menangani "Error Dempet JSON" di Golang

- **Isu:** _Error_ `Unexpected non-whitespace character after JSON` di _frontend_.
- **Punca:** Berlaku pemanggilan `c.JSON()` lebih daripada satu kali dalam satu fungsi kawalan (_controller_) di Golang tanpa arahan `return`.
- **Penyelesaian:** Pastikan setiap pengecekan _error_ yang memanggil `c.JSON()` diakhiri dengan `return` supaya pelaksanaan fungsi terhenti, dan hanya satu piring JSON yang dihantar ke _frontend_.

### 5. Konsep UI/UX Peringkat Industri (Frontend)

- **Komponen Boleh Guna Semula (Reusable Components):** Borang untuk "Tambah" dan "Edit" projek digabungkan menjadi satu komponen pintar (`ProjectModal.tsx`) untuk mengelakkan kod berulang.
- **Tab Navigasi:** Menggunakan _state_ React (`activeTab`) untuk menukar paparan antara jadual "Data Projek" dan "Direktori Tim" tanpa memuatkan semula halaman (SPA - _Single Page Application_).
- **Pengendalian Ralat Lanjutan:** Daripada menggunakan `res.json()` secara langsung, biasakan membaca tindak balas API menggunakan `res.text()` terlebih dahulu. Ini menghalang _browser_ daripada terhempas (_crash_) jika pelayan (_server_) Golang secara tidak sengaja menghantar ralat dalam bentuk teks biasa (bukan JSON).

---

## 💻 Cara Menjalankan Projek Secara Tempatan (Local Development)

### Langkah 1: Jalankan Backend (Golang)

Buka terminal baharu, masuk ke direktori `backend`, dan jalankan pelayan:

```bash
cd backend
go run main.go
```

### Langkah 2: Jalankan Frontend (Next.js)

Buka terminal kedua, masuk ke direktori frontend, dan jalankan persekitaran pembangunan:

```bash
cd frontend
npm run dev
```
