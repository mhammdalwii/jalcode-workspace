# Jalcode API - Team & Project Management

REST API terpusat untuk sistem manajemen Tim internal dan Proyek Klien di Jalcode Digital Agency. Dibangun menggunakan arsitektur modern yang mengedepankan kecepatan, keamanan, dan struktur data yang rapi.

## 🚀 Tech Stack

- **Language:** Golang (Go)
- **Web Framework:** Gin-Gonic
- **Database:** PostgreSQL
- **ORM:** GORM
- **Authentication:** JSON Web Token (JWT) & bcrypt
- **Documentation:** Swaggo (Swagger UI)

## 📁 Arsitektur Direktori

Proyek ini memisahkan logika aplikasi ke dalam beberapa folder agar mudah dikelola (Standard Go Layout):

- `config/` - Pengaturan koneksi database.
- `models/` - Skema tabel database (GORM structs).
- `dto/` - Data Transfer Object untuk memformat input/output JSON.
- `controllers/` - Logika bisnis dan pemrosesan fungsi CRUD.
- `routes/` - Pengaturan endpoint URL.
- `middleware/` - Penjaga rute (seperti pengecekan token JWT).
- `utils/` - Fungsi bantuan (seperti generator token).

## 🔐 Alur Kerja Autentikasi (JWT)

1. User melakukan `POST /api/auth/register` (Password akan otomatis dienkripsi dengan bcrypt).
2. User melakukan `POST /api/auth/login`. Jika email dan password valid, server akan mengembalikan **Token JWT**.
3. Frontend harus menyimpan token ini.
4. Untuk mengakses rute yang dilindungi (`/api/teams` dan `/api/projects`), token JWT wajib disisipkan di **Headers** request dengan format: `Authorization: Bearer <token_jwt>`.

## 🌐 Daftar Endpoint (API Routes)

**1. Authentication (Public)**

- `POST /api/auth/register` - Mendaftarkan anggota tim baru
- `POST /api/auth/login` - Login dan mendapatkan Token JWT

**2. Teams (Protected by JWT)**

- `GET /api/teams/` - Melihat semua anggota tim
- `POST /api/teams/` - Menambah anggota tim
- `PUT /api/teams/:id` - Memperbarui data tim
- `DELETE /api/teams/:id` - Menghapus anggota tim

**3. Projects (Protected by JWT)**

- `GET /api/projects/` - Melihat semua proyek beserta data PIC (Preload GORM)
- `POST /api/projects/` - Menambah proyek klien
- `PUT /api/projects/:id` - Memperbarui status/data proyek
- `DELETE /api/projects/:id` - Menghapus proyek

## 🛠 Cara Menjalankan Server Lokal

1. Pastikan PostgreSQL sudah berjalan.
2. Buat database baru (misal: `jalcode_api`).
3. Buat file `.env` di root folder dan isi dengan konfigurasi berikut:
   ```env
   DB_HOST=localhost
   DB_USER=postgres
   DB_PASSWORD=password_database_kamu
   DB_NAME=jalcode_api
   DB_PORT=5432
   JWT_SECRET=rahasia_jwt_kamu_di_sini
   ```
