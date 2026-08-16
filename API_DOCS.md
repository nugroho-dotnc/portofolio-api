# Dokumentasi Admin API - Web Porto

Dokumen ini berisi spesifikasi endpoint untuk modul Admin API beserta bentuk data respons dan permintaan (request) yang disesuaikan secara spesifik berdasarkan *source code* (termasuk validasi Zod dan mekanisme relasi/include Prisma). 

Seluruh endpoint di bawah ini membutuhkan autentikasi berupa JWT Token (Bearer).

**Base URL**: `/api/admin`

**Headers yang Dibutuhkan:**
```json
{
  "Authorization": "Bearer <YOUR_JWT_TOKEN>"
}
```

---

## 1. Categories (`/categories`)

Mengelola data kategori proyek/keahlian. Perhatikan bahwa di dalam *Request Body* menggunakan *snake_case* (`is_expertise`, `is_active`), namun respon dari database mengembalikan *camelCase* (`isExpertise`, `isActive`) sesuai model Prisma.

### `GET /categories`
Mendapatkan semua kategori yang aktif (`isActive: true`).
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": 1,
        "icon": "string",
        "title": "string",
        "description": "string",
        "isExpertise": true,
        "isActive": true
      }
    ]
  }
  ```

### `POST /categories`
Membuat kategori baru.
- **Request Body:**
  ```json
  {
    "icon": "string",
    "title": "string",
    "description": "string",
    "is_expertise": true,
    "is_active": true
  }
  ```
- **Response Success (201)**:
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "icon": "string",
      "title": "string",
      "description": "string",
      "isExpertise": true,
      "isActive": true
    }
  }
  ```

### `PUT /categories/:id`
Mengubah data kategori.
- **Request Body:** Sama seperti `POST` namun semua field opsional.
- **Response Success (200)**: Sama seperti objek data pada `POST`.

### `DELETE /categories/:id`
Melakukan *soft delete* pada kategori (mengubah `isActive` menjadi `false`).
- **Response Success (200)**: Sama seperti objek data pada `POST` dengan `isActive: false`.

---

## 2. Projects (`/project`)

Mengelola entitas proyek portofolio. Request body di sini menggunakan `is_active` dan `category_id`. Harap perhatikan perbedaan *response* `GET` (tidak menampilkan detail tag) dan `PUT` (menampilkan detail tag).

### `GET /project`
Mendapatkan semua proyek aktif beserta data relasi `category`, `media`, dan tabel pivot `tags` (hanya ID tag-nya saja, tanpa detail tag).
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": 1,
        "title": "string",
        "description": "string",
        "imagePath": "https://...",
        "isActive": true,
        "categoryId": 1,
        "category": {
          "id": 1,
          "icon": "string",
          "title": "string",
          "description": "string",
          "isExpertise": true,
          "isActive": true
        },
        "media": [
          {
            "id": 1,
            "imageUrl": "https://...",
            "projectId": 1
          }
        ],
        "tags": [
          {
            "id": 1,
            "tagId": 2,
            "projectId": 1
          }
        ]
      }
    ]
  }
  ```

### `GET /project/:id`
Mendapatkan detail suatu proyek beserta data relasi `category`, `media`, dan tabel pivot `tags` beserta detail tag-nya.
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "title": "string",
      "shortDescription": "string",
      "description": "string",
      "imagePath": "https://...",
      "isActive": true,
      "categoryId": 1,
      "category": {
        "id": 1,
        "icon": "string",
        "title": "string",
        "description": "string",
        "isExpertise": true,
        "isActive": true
      },
      "media": [
        {
          "id": 1,
          "imageUrl": "https://...",
          "projectId": 1
        }
      ],
      "tags": [
        {
          "id": 1,
          "tagId": 2,
          "projectId": 1,
          "tag": {
            "id": 2,
            "title": "React"
          }
        }
      ]
    }
  }
  ```

### `POST /project`
Membuat proyek baru (termasuk menyimpan relasi tabel pivot tag jika dikirim).
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "imagePath": "string (URL gambar)",
    "is_active": true,
    "category_id": 1,
    "tags": [1, 2] 
  }
  ```
- **Response Success (201)**: *(Catatan: Response pada route POST project tidak menyertakan relasi/include Prisma)*
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "title": "string",
      "description": "string",
      "imagePath": "https://...",
      "isActive": true,
      "categoryId": 1
    }
  }
  ```

### `PUT /project/:id`
Mengubah data proyek beserta memperbarui relasi tag.
- **Request Body:** Sama seperti `POST` namun opsional.
- **Response Success (200)**: *(Catatan: Response PUT melakukan include `category` dan `tags` beserta detail objek `tag`)*
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "title": "string",
      "description": "string",
      "imagePath": "https://...",
      "isActive": true,
      "categoryId": 1,
      "category": {
        "id": 1,
        "icon": "...",
        "title": "...",
        "description": "...",
        "isExpertise": true,
        "isActive": true
      },
      "tags": [
        {
          "id": 1,
          "tagId": 2,
          "projectId": 1,
          "tag": {
            "id": 2,
            "title": "React"
          }
        }
      ]
    }
  }
  ```

### `DELETE /project/:id`
Menghapus data proyek (hard delete).
- **Response Success (200)**: Mengembalikan data dasar proyek yang dihapus (tanpa relasi).

---

## 3. Badges (`/badge`)

Mengelola data pencapaian / sertifikat. Untuk modul ini, field *Request Body* menggunakan *camelCase* (`categoryId`, `imagePath`).

### `GET /badge`
Mendapatkan semua badge berserta kategori dan issuer yang terkait.
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": 1,
        "title": "string",
        "description": "string",
        "imagePath": "https://...",
        "credentialUrl": "https://...",
        "isActive": true,
        "categoryId": 1,
        "issuerId": 1,
        "category": {
          "id": 1,
          "icon": "...",
          "title": "...",
          "description": "...",
          "isExpertise": true,
          "isActive": true
        },
        "issuer": {
          "id": 1,
          "name": "string",
          "imagePath": "https://..."
        }
      }
    ]
  }
  ```

### `POST /badge`
Membuat badge baru.
- **Request Body:**
  ```json
  {
    "title": "string",
    "description": "string",
    "imagePath": "https://...",
    "credentialUrl": "https://...",
    "categoryId": 1
  }
  ```
- **Response Success (201)**: *(Tanpa data kategori/issuer yang ter-include)*
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "title": "string",
      "description": "string",
      "imagePath": "https://...",
      "credentialUrl": "https://...",
      "isActive": true,
      "categoryId": 1,
      "issuerId": null
    }
  }
  ```

### `PUT /badge/:id`
Mengubah data badge.
- **Request Body:** Sama seperti `POST` namun opsional.
- **Response Success (200)**: Mengembalikan data dasar badge seperti `POST`.

### `DELETE /badge/:id`
Menghapus data badge.
- **Response Success (200)**: `{ "status": true, "message": "Data berhasil dihapus" }`

---

## 4. Tags (`/tag`)

Mengelola label (tag) untuk proyek.

### `GET /tag`
Mendapatkan semua tag.
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": 1,
        "title": "React"
      }
    ]
  }
  ```

### `POST /tag`
Membuat tag baru.
- **Request Body:**
  ```json
  {
    "title": "string"
  }
  ```
- **Response Success (201)**: 
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "title": "string"
    }
  }
  ```

### `PUT /tag/:id`
Mengubah nama tag.
- **Request Body:** Sama seperti `POST`.
- **Response Success (200)**: Sama seperti objek data pada `POST`.

### `DELETE /tag/:id`
Menghapus tag.
- **Response Success (200)**: Sama seperti objek data pada `POST`.

---

## 5. Issuers (`/issuer`)

Mengelola data lembaga penerbit (seperti Google, AWS, Dicoding).

### `GET /issuer`
Mendapatkan semua issuer.
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": 1,
        "name": "Google",
        "imagePath": "https://..."
      }
    ]
  }
  ```

### `POST /issuer`
Membuat issuer baru.
- **Request Body:**
  ```json
  {
    "name": "string",
    "imagePath": "string (URL gambar logo)"
  }
  ```
- **Response Success (201)**:
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "name": "string",
      "imagePath": "https://..."
    }
  }
  ```

### `PUT /issuer/:id`
Mengubah data issuer.
- **Request Body:** Sama seperti `POST` namun opsional.
- **Response Success (200)**: Sama seperti objek data pada `POST`.

### `DELETE /issuer/:id`
Menghapus data issuer.
- **Response Success (200)**: `{ "status": true, "message": "Data berhasil dihapus" }`

---

## 6. Stats (`/stats`)

Mengelola data metrik keahlian / performa.

### `GET /stats`
Mendapatkan semua stats beserta data kategori yang terkait.
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": 1,
        "categoryId": 1,
        "percentage": "85.5",
        "isActive": true,
        "category": {
          "id": 1,
          "icon": "...",
          "title": "...",
          "description": "...",
          "isExpertise": true,
          "isActive": true
        }
      }
    ]
  }
  ```
> **Catatan**: Field `percentage` bertipe `Decimal` di Prisma, JSON akan mengirimkannya sebagai `string` (misal `"85.5"`). Anda perlu parsing menjadi tipe `number` di front-end.

### `POST /stats`
Membuat data stat baru.
- **Request Body:**
  ```json
  {
    "categoryId": 1,
    "percentage": 85.5,
    "isActive": true
  }
  ```
- **Response Success (201)**: *(Tidak meng-include category)*
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "categoryId": 1,
      "percentage": "85.5",
      "isActive": true
    }
  }
  ```

### `PUT /stats/:id`
Mengubah data stat.
- **Request Body:** Sama seperti `POST` namun opsional.
- **Response Success (200)**: Sama seperti objek data pada `POST`.

### `DELETE /stats/:id`
Menghapus data stat.
- **Response Success (200)**: `{ "status": true, "message": "Data berhasil dihapus" }`

---

## 7. Upload File (`/upload`)

Endpoint utilitas untuk mengupload gambar ke Supabase Storage.

### `POST /upload?folder=<nama_folder>`
Mengunggah satu file gambar.
- **Query Parameter:** `folder` (opsional, default `misc`). Contoh: `?folder=project`.
- **Form-Data (multipart/form-data):**
  - `image`: File gambar (Maks 2MB, format `image/*`).
- **Response Success (201)**: 
  ```json
  { 
    "status": true, 
    "data": { 
      "url": "https://[SUPABASE_URL]/storage/v1/object/public/images/project/xyz-123.jpg" 
    }
  }
  ```

---

## 8. Contact (`/contact`)

Mengelola pesan masuk dari form kontak publik.

### `GET /contact`
Mendapatkan semua pesan masuk.
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "id": 1,
        "name": "John Doe",
        "email": "john@example.com",
        "subject": "Inquiry",
        "message": "Hello there"
      }
    ]
  }
  ```

### `GET /contact/:id`
Mendapatkan detail pesan berdasarkan ID.
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Inquiry",
      "message": "Hello there"
    }
  }
  ```

### `DELETE /contact/:id`
Menghapus pesan (hard delete).
- **Response Success (200)**: `{ "status": true, "message": "Contact deleted successfully" }`

---
---

# Dokumentasi Public API - Web Porto

Public API tidak membutuhkan autentikasi dan umumnya bersifat *read-only*, kecuali untuk pengiriman form kontak.

**Base URL**: `/api/public`

## 1. Projects (`/project`)

### `GET /project`
Mendapatkan daftar proyek (digunakan untuk list atau landing page).
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": [
      {
        "title": "string",
        "description": "string",
        "imagePath": "string",
        "category": {
           "id": 1,
           "title": "Web"
        },
        "tags": [
           { "tag": { "id": 1, "title": "React" } }
        ]
      }
    ]
  }
  ```

### `GET /project/:id`
Mendapatkan detail lengkap suatu proyek beserta relasi tag, kategori, dan daftar media (gambar/video pendukung).
- **Response Success (200)**:
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "title": "string",
      "shortDescription": "string",
      "description": "string",
      "imagePath": "https://...",
      "isActive": true,
      "categoryId": 1,
      "category": {
        "id": 1,
        "title": "Web",
        "icon": "..."
      },
      "media": [
        {
          "id": 1,
          "imageUrl": "https://...",
          "projectId": 1
        }
      ],
      "tags": [
        {
          "tag": {
            "id": 1,
            "title": "React"
          }
        }
      ]
    }
  }
  ```

## 2. Contact (`/contact`)

### `POST /contact`
Mengirimkan pesan dari publik ke admin.
- **Request Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Job Inquiry",
    "message": "Hello, I want to hire you."
  }
  ```
- **Response Success (201)**:
  ```json
  {
    "status": true,
    "data": {
      "id": 1,
      "name": "John Doe",
      "email": "john@example.com",
      "subject": "Job Inquiry",
      "message": "Hello, I want to hire you."
    }
  }
  ```

## 3. Lainnya (Badge, Categories, Expertise, Landing, Stats, Tag)

Sebagian besar rute publik lainnya (`/badge`, `/categories`, `/expertise`, `/landing`, `/stats`, `/tag`) merupakan metode `GET` yang mengambil seluruh data aktif dari tabel yang bersangkutan untuk ditampilkan ke halaman utama tanpa perlunya token. Bentuk datanya menyerupai response GET pada Admin API, namun difilter hanya untuk data dengan `isActive: true`.
