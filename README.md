# WIDATA — Sistem Pencatatan Data Digital Widodomartani

![WIDATA Logo](public/logo.png)

**WIDATA** adalah sistem informasi pencatatan data kependudukan digital untuk **Kalurahan Widodomartani**, Kecamatan Ngemplak, Kabupaten Sleman, DIY. Sistem ini dirancang untuk memudahkan pengelolaan data warga secara berjenjang mulai dari tingkat RT, Dukuh, hingga Operator Desa.

---

## Fitur Utama

### 👤 RT (Rukun Tetangga)
- Melihat data warga di wilayahnya
- Lapor warga baru pindah masuk
- **Lapor kelahiran** bayi baru
- Lapor warga pindah keluar
- Lapor warga meninggal
- Usulkan perubahan data (bebas teks)
- Kelola data bantuan sosial (Bansos)

### 🏘️ Dukuh
- Kelola Kartu Keluarga (KK) — dengan upload PDF + **OCR otomatis**
- Kelola data penduduk
- Lihat data wilayah RT
- Verifikasi laporan dari RT
- Lihat data Bansos & BPJS
- Buat rekap dukuh

### 🏢 Operator Desa
- Melihat seluruh data kalurahan
- Dashboard statistik kependudukan
- Monitoring dukuh & RT/RW
- Validasi data tertentu
- Buat laporan
- Kelola master wilayah
- Kelola akun pengguna (tambah/nonaktifkan)

---

## Teknologi

| Teknologi | Versi | Fungsi |
|---|---|---|
| **Next.js** | 16.x | Framework fullstack (App Router) |
| **TypeScript** | 7.x | Bahasa pemrograman |
| **Tailwind CSS** | 4.x | Styling |
| **Prisma** | 5.x | ORM database |
| **SQLite** | — | Database (prototipe) |
| **NextAuth.js** | v5 beta | Autentikasi |
| **Tesseract.js** | — | OCR lokal (baca teks PDF KK) |
| **pdf.js** | 4.x | Render PDF ke gambar |

---

## Prasyarat

Pastikan perangkat Anda sudah terinstall:

- [Node.js](https://nodejs.org/) **v18 atau lebih baru**
- [Git](https://git-scm.com/)
- [Visual Studio Code](https://code.visualstudio.com/) *(direkomendasikan)*

---

## Cara Instalasi

### 1. Clone Repository

```bash
git clone https://github.com/username/widata.git
cd widata
```

> Atau download ZIP dan ekstrak, lalu buka folder di VSCode.

### 2. Buka di VSCode

```bash
code .
```

Atau buka VSCode → **File → Open Folder** → pilih folder `widata`.

### 3. Install Dependensi

Buka terminal di VSCode (**Ctrl + `**), lalu jalankan:

```bash
npm install
```

### 4. Konfigurasi Environment

Buat file `.env` di root project (atau salin dari `.env.example`):

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_SECRET="ganti-dengan-string-acak-yang-panjang"
NEXTAUTH_URL="http://localhost:3000"
```

> ⚠️ **Penting:** Ganti `NEXTAUTH_SECRET` dengan string acak yang aman. Bisa generate dengan perintah:
> ```bash
> node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
> ```

### 5. Setup Database

```bash
# Buat tabel database dari schema
npm run db:push

# Isi data awal (dukuh, RT, akun demo)
npm run db:seed
```

### 6. Jalankan Aplikasi

```bash
npm run dev
```

Buka browser → **http://localhost:3000**

---

## Akun Demo Default (Total 13 Akun)

| No | Role | Username | Password | Wilayah |
|---|---|---|---|---|
| 1 | Operator Desa | `operator` | `operator123` | Kalurahan Widodomartani |
| 2 | Dukuh | `ngalian` | `ngalian123` | Padukuhan Ngalian |
| 3 | Dukuh | `kalijeruk2` | `kalijeruk2123` | Padukuhan Kalijeruk 2 |
| 4 | Dukuh | `kemasan` | `kemasan123` | Padukuhan Kemasan |
| 5 | Dukuh | `klancingan` | `klancingan123` | Padukuhan Klancingan |
| 6 | Dukuh | `kwadungan` | `kwadungan123` | Padukuhan Kwadungan |
| 7 | Dukuh | `pondok1` | `pondok1123` | Padukuhan Pondok 1 |
| 8 | RT | `rt_ngalian` | `rt_ngalian123` | RT 01 Ngalian |
| 9 | RT | `rt_kalijeruk2` | `rt_kalijeruk2123` | RT 01 Kalijeruk 2 |
| 10 | RT | `rt_kemasan` | `rt_kemasan123` | RT 01 Kemasan |
| 11 | RT | `rt_klancingan` | `rt_klancingan123` | RT 01 Klancingan |
| 12 | RT | `rt_kwadungan` | `rt_kwadungan123` | RT 01 Kwadungan |
| 13 | RT | `rt_pondok1` | `rt_pondok1123` | RT 01 Pondok 1 |

---

## Struktur Dukuh & RT

| No | Dukuh | Jumlah RT |
|---|---|---|
| 1 | Ngalian | 5 RT |
| 2 | Kalijeruk 2 | 5 RT |
| 3 | Kemasan | 5 RT |
| 4 | Klancingan | 5 RT |
| 5 | Kwadungan | 5 RT |
| 6 | Pondok 1 | 5 RT |

---

## Struktur Folder

```
widata/
├── prisma/
│   ├── schema.prisma      # Definisi database
│   ├── seed.js            # Data awal (dukuh, RT, akun)
│   └── dev.db             # File database SQLite (dibuat otomatis)
├── public/
│   ├── logo.png           # Logo WIDATA
│   └── pdf.worker.min.mjs # PDF.js worker (untuk OCR)
├── src/
│   ├── app/               # Halaman Next.js (App Router)
│   │   ├── rt/            # Halaman role RT
│   │   ├── dukuh/         # Halaman role Dukuh
│   │   ├── operator/      # Halaman role Operator Desa
│   │   └── login/         # Halaman login
│   ├── components/        # Komponen React reusable
│   │   ├── layout/        # Sidebar, Header
│   │   └── features/      # StatCard, StatusBadge, dll
│   └── lib/               # Utility (prisma, auth, utils)
├── .env                   # Konfigurasi environment (JANGAN di-commit!)
├── next.config.js
└── package.json
```

---

## Ekstensi VSCode yang Direkomendasikan

Install ekstensi berikut untuk pengalaman development terbaik:

- **ESLint** — linting kode
- **Prettier** — format kode otomatis
- **Prisma** — syntax highlight schema.prisma
- **Tailwind CSS IntelliSense** — autocomplete class Tailwind
- **TypeScript Error Translator** — pesan error TypeScript yang lebih mudah dibaca

---

## Script yang Tersedia

```bash
npm run dev        # Jalankan development server (localhost:3000)
npm run build      # Build untuk produksi
npm run start      # Jalankan production server
npm run db:push    # Sinkronisasi schema ke database
npm run db:seed    # Isi data awal ke database
```

---

## Catatan Prototipe

> ⚠️ Sistem ini masih dalam tahap **prototipe**. Beberapa hal yang perlu diperhatikan:
> - Database menggunakan **SQLite** (cocok untuk development, belum untuk produksi skala besar)
> - Upload dokumen hanya menyimpan **nama file**, belum diupload ke server/storage
> - Fitur OCR berjalan di browser dan akurasinya bergantung pada kualitas scan KK
> - Untuk produksi, disarankan migrasi ke PostgreSQL/MySQL dan tambahkan file storage (S3/Supabase)

---

## Lisensi

Sistem ini dikembangkan untuk **Kalurahan Widodomartani**. Hak cipta dilindungi.
