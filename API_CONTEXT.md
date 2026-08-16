# Web Porto API - Context & Architecture

Dokumen ini berisi rangkuman arsitektur, struktur folder, skema database, dan aturan penulisan kode untuk project API Web Porto ini. Dokumen ini bertujuan untuk membantu AI assistant memahami konteks project secara keseluruhan.

## 1. Tech Stack
- **Framework:** Express.js (Node.js)
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL dengan Prisma ORM
- **Validation:** Zod
- **Authentication:** JWT (JSON Web Tokens)
- **Storage/File Upload:** Supabase Storage (dikombinasikan dengan Multer untuk *memory storage*)

## 2. Struktur Direktori Utama
- `src/app.ts`: Entry point aplikasi. Mendaftarkan seluruh middleware dan route.
- `src/lib/`: Berisi helper/konfigurasi eksternal.
  - `prisma.ts`: Instance Prisma Client.
  - `supabase.ts`: Instance Supabase Client (untuk upload).
  - `jwt.ts`: Helper untuk *sign* dan *verify* token JWT.
- `src/middleware/`:
  - `requireAdmin.ts`: Middleware untuk memvalidasi token JWT dan memastikan pengguna memiliki role `admin`.
- `src/routes/`:
  - `auth.ts`: Endpoint untuk login/autentikasi (public).
  - `admin/`: Berisi endpoint-endpoint CRUD yang **dilindungi** oleh middleware `requireAdmin`. Endpoint yang tersedia:
    - `categories.ts`
    - `project.ts`
    - `badge.ts`
    - `tag.ts`
    - `issuer.ts`
    - `stats.ts`
    - `upload.ts` (Endpoint khusus untuk mengupload gambar ke Supabase)

## 3. Skema Database (Prisma)
Aplikasi ini memiliki beberapa model utama yang saling berelasi:
- **User**: Untuk autentikasi admin (`email`, `passwordHash`, `role`).
- **Category**: Kategori utama yang bisa menampung Project, Badge, dan Stats.
- **Project**: Entitas proyek portofolio.
  - Berelasi dengan `Category` (1-to-N).
  - Memiliki `ProjectMedia` (galeri gambar proyek).
  - Memiliki relasi *many-to-many* ke `Tag` melalui tabel pivot `ProjectTag`.
- **Badge**: Sertifikasi atau pencapaian.
  - Berelasi dengan `Category`.
  - Memiliki relasi opsional dengan `Issuer` (Penerbit sertifikat).
- **Issuer**: Entitas penerbit Badge (misal: Google, Microsoft, Dicoding).
- **Tag**: Label/kategori tambahan untuk Project.
- **Stats**: Data statistik atau persentase keahlian yang berelasi dengan `Category`.
- **Contact**: Data pesan dari form kontak (public).

## 4. Konvensi & Aturan Penulisan Kode (Coding Style)
Untuk menjaga konsistensi, setiap kali AI menambahkan atau mengubah rute admin, wajib mengikuti konvensi berikut:

1. **Routing System:**
   - Gunakan `Router()` dari `express`.
   - Wajib memasang middleware `router.use(requireAdmin);` di awal untuk rute admin.
2. **Validasi (Zod):**
   - Buat skema Zod (misal: `const entitySchema = z.object({...})`) untuk memvalidasi `req.body`.
   - Gunakan `.safeParse()` untuk validasi, kembalikan status `400` dengan `.flatten()` jika terjadi error validasi.
3. **Response Format:**
   - Selalu kembalikan JSON dengan format konsisten:
     - Sukses: `{ status: true, data: ... }` atau `{ status: true, message: "..." }`
     - Error: `{ status: false, error: "Pesan error" }`
4. **Error Handling & Prisma:**
   - Gunakan blok `try...catch` pada setiap *controller*.
   - Saat menghapus data (DELETE) atau update (PUT), tangani error bawaan Prisma (seperti kode `P2025` jika data tidak ditemukan) dan berikan response `404`.
   - Lakukan pengecekan duplikasi manual menggunakan `findFirst` saat *CREATE* jika diperlukan (contoh: mengecek duplikasi nama), dan kembalikan `409 Conflict` jika duplikat.
5. **Upload Gambar:**
   - Endpoint CRUD (seperti `badge` atau `project`) **hanya menerima URL string** untuk gambar (`imagePath` / `imageUrl`).
   - Proses upload *actual image file* dilakukan secara terpisah melalui endpoint `/api/admin/upload`, yang akan mengembalikan URL gambar (dari Supabase) untuk dikirimkan lagi oleh klien saat memanggil endpoint CRUD.

## 5. Environment Variables
- `PORT`: Port server (default: 3000)
- `DATABASE_URL`: Connection string PostgreSQL
- `JWT_SECRET`: Secret key untuk signing token
- `SUPABASE_URL` & `SUPABASE_SERVICE_ROLE_KEY`: Kredensial Supabase untuk upload file.
