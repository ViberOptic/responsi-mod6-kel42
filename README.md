# Smart Library API

Aplikasi RESTful API untuk Sistem Manajemen Perpustakaan Pintar (Smart Library). API ini melayani pendataan buku, penulis, kategori, anggota perpustakaan, hingga transaksi peminjaman buku.

## Teknologi yang Digunakan
- **Node.js** & **Express.js** (Web Framework)
- **PostgreSQL** (Database Relasional)
- **node-postgres (pg)** (PostgreSQL client untuk Node.js)

## Base URL
Secara default, API berjalan di:
```text
http://localhost:3000
```

---

## Daftar API Endpoints

### 1. Root Endpoint
- **Kegunaan:** Mengecek status server (Health Check).
- **Method:** `GET`
- **URL:** `/`
- **Body Request:** *None*
- **Response:** `Smart Library API is Running...`

---

### 2. Authors (Penulis)

#### Ambil Semua Penulis
- **Kegunaan:** Mendapatkan daftar semua penulis yang diurutkan berdasarkan nama (Ascending).
- **Method:** `GET`
- **URL:** `/api/authors`
- **Body Request:** *None*

#### Tambah Penulis Baru
- **Kegunaan:** Menambahkan data penulis baru ke dalam database.
- **Method:** `POST`
- **URL:** `/api/authors`
- **Body Request:** (JSON)
  ```json
  {
    "name": "Nama Penulis",
    "nationality": "Kewarganegaraan"
  }
  ```

---

### 3. Categories (Kategori)

#### Ambil Semua Kategori
- **Kegunaan:** Mendapatkan daftar semua kategori buku.
- **Method:** `GET`
- **URL:** `/api/categories`
- **Body Request:** *None*

#### Tambah Kategori Baru
- **Kegunaan:** Menambahkan data kategori buku baru.
- **Method:** `POST`
- **URL:** `/api/categories`
- **Body Request:** (JSON)
  ```json
  {
    "name": "Nama Kategori (misal: Fiksi, Sains)"
  }
  ```

---

### 4. Books (Buku)

#### Ambil Semua Buku
- **Kegunaan:** Mendapatkan daftar semua buku beserta detail nama penulis dan nama kategorinya (hasil JOIN).
- **Method:** `GET`
- **URL:** `/api/books`
- **Body Request:** *None*

#### Tambah Buku Baru
- **Kegunaan:** Menambahkan data buku baru. Nilai `available_copies` akan otomatis disamakan dengan `total_copies` pada saat pembuatan.
*(Catatan: `author_id` dan `category_id` wajib menggunakan ID yang sudah ada / dibuat sebelumnya pada entitas Penulis dan Kategori)*
- **Method:** `POST`
- **URL:** `/api/books`
- **Body Request:** (JSON)
  ```json
  {
    "isbn": "Nomor ISBN Buku",
    "title": "Judul Buku",
    "author_id": 1,
    "category_id": 2,
    "total_copies": 10
  }
  ```
*(Catatan: `author_id` dan `category_id` wajib menggunakan ID yang sudah ada / dibuat sebelumnya pada entitas Penulis dan Kategori)*

---

### 5. Members (Anggota)

#### Ambil Semua Anggota
- **Kegunaan:** Mendapatkan daftar semua anggota perpustakaan yang diurutkan dari yang terbaru bergabung.
- **Method:** `GET`
- **URL:** `/api/members`
- **Body Request:** *None*

#### Mendaftarkan Anggota Baru
- **Kegunaan:** Menambahkan / meregistrasi anggota perpustakaan baru.
- **Method:** `POST`
- **URL:** `/api/members`
- **Body Request:** (JSON)
  ```json
  {
    "full_name": "Nama Lengkap Anggota",
    "email": "email.anggota@example.com",
    "member_type": "STUDENT"
  }
  ```

---

### 6. Loans (Peminjaman)

#### Ambil Semua Data Peminjaman
- **Kegunaan:** Mendapatkan semua histori/data peminjaman beserta judul buku dan nama anggota yang meminjam.
- **Method:** `GET`
- **URL:** `/api/loans`
- **Body Request:** *None*

#### Buat Peminjaman Baru
- **Kegunaan:** Mencatat transaksi peminjaman buku. Sistem akan menggunakan *Database Transaction* untuk mengecek stok buku, mengurangi ketersediaan buku (`available_copies`), dan mencatat data peminjaman. Jika buku habis, proses akan dibatalkan (*Rollback*).
- **Method:** `POST`
- **URL:** `/api/loans`
- **Body Request:** (JSON)
  ```json
  {
    "book_id": 1,
    "member_id": 1,
    "due_date": "2026-04-10"
  }
  ```
*(Catatan: `book_id` dan `member_id` wajib menggunakan ID yang sudah ada / dibuat sebelumnya pada entitas Buku dan Anggota)*

---