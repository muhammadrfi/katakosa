# Katakosa - Aplikasi Pembelajaran Bahasa

Selamat datang di Katakosa, sebuah aplikasi pembelajaran bahasa yang dirancang untuk membantu Anda menguasai bahasa baru melalui berbagai modul interaktif.

## Fitur Utama

- **Modul Pembelajaran Interaktif**: Berbagai latihan untuk meningkatkan kosakata, tata bahasa, dan pemahaman.
- **Pelacakan Kemajuan**: Pantau progres belajar Anda dan identifikasi area yang perlu ditingkatkan.
- **Antarmuka Pengguna Intuitif**: Desain yang bersih dan mudah digunakan untuk pengalaman belajar yang menyenangkan.
- **Dukungan Multi-bahasa**: Belajar berbagai bahasa dengan mudah.

## Persyaratan Sistem

Pastikan Anda memiliki perangkat lunak berikut terinstal di sistem Anda:

- Node.js (versi 18 atau lebih tinggi)
- npm (biasanya terinstal bersama Node.js)
- Git

## Setup Proyek

Ikuti langkah-langkah di bawah ini untuk mengatur dan menjalankan proyek di lingkungan lokal Anda:

1.  **Clone Repositori**
    Buka terminal atau command prompt Anda dan jalankan perintah berikut untuk mengkloning repositori proyek:
    ```bash
    git clone https://github.com/muhammadrfi/katakosa.git
    cd katakosa
    ```

2.  **Instal Dependensi**
    Setelah masuk ke direktori proyek, instal semua dependensi yang diperlukan dengan perintah:
    ```bash
    npm install
    ```

3.  **Variabel Lingkungan**
    Buat file `.env` di root direktori proyek Anda berdasarkan contoh `.env.example` (jika ada) dan isi dengan variabel lingkungan yang sesuai. Contoh:
    ```
    VITE_API_BASE_URL=http://localhost:8000/api
    ```
    *Catatan: Sesuaikan nilai variabel lingkungan dengan konfigurasi backend atau API yang Anda gunakan.*

## Menjalankan Aplikasi

Setelah semua dependensi terinstal dan variabel lingkungan diatur, Anda dapat menjalankan aplikasi dalam mode pengembangan:

```bash
npm run dev
```

Aplikasi akan berjalan di `http://localhost:5173` (atau port lain yang tersedia). Buka browser Anda dan navigasikan ke alamat tersebut untuk melihat aplikasi.

## Membangun Aplikasi untuk Produksi

Untuk membangun aplikasi dalam mode produksi, jalankan perintah:

```bash
npm run build
```

Hasil build akan ditempatkan di direktori `dist/`.

## Menjalankan Pengujian

Untuk menjalankan semua pengujian yang ada dalam proyek, gunakan perintah:

```bash
npm test
```

## Struktur Proyek

Berikut adalah gambaran umum struktur direktori utama proyek:

```
katakosa/
├── public/                 # File statis
├── src/                    # Kode sumber aplikasi
│   ├── App.tsx             # Komponen utama aplikasi
│   ├── components/         # Komponen UI yang dapat digunakan kembali
│   │   ├── ui/             # Komponen UI dari shadcn/ui atau kustom
│   ├── features/           # Modul fitur spesifik (misal: auth, dashboard)
│   │   ├── error/          # Penanganan error dan halaman 404
│   ├── hooks/              # Hooks React kustom
│   ├── layout/             # Komponen layout (misal: Navbar, Footer)
│   ├── lib/                # Utilitas dan fungsi pembantu
│   ├── pages/              # Halaman-halaman utama aplikasi
│   ├── utils/              # Fungsi utilitas umum
│   └── main.tsx            # Entry point aplikasi
├── tailwind.config.js      # Konfigurasi Tailwind CSS
├── tsconfig.json           # Konfigurasi TypeScript
├── vite.config.ts          # Konfigurasi Vite
└── package.json            # Daftar dependensi dan skrip proyek
```

## Kontribusi

Kami menyambut kontribusi dari komunitas! Jika Anda ingin berkontribusi, silakan ikuti langkah-langkah berikut:

1.  Fork repositori ini.
2.  Buat branch baru untuk fitur atau perbaikan bug Anda (`git checkout -b feature/nama-fitur-baru`).
3.  Lakukan perubahan Anda dan pastikan kode Anda mengikuti standar proyek.
4.  Tulis pengujian untuk perubahan Anda (jika relevan).
5.  Commit perubahan Anda (`git commit -m 'feat: tambahkan fitur baru'`).
6.  Push ke branch Anda (`git push origin feature/nama-fitur-baru`).
7.  Buat Pull Request (PR) ke branch `main` repositori ini.

Mohon pastikan PR Anda memiliki deskripsi yang jelas tentang perubahan yang Anda buat dan mengapa perubahan tersebut diperlukan.

## Lisensi

Proyek ini dilisensikan di bawah [MIT License](LICENSE).