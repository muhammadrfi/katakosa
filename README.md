# Aplikasi Pembelajaran Kosakata Multibahasa

## Tentang Proyek
Aplikasi ini adalah platform pembelajaran kosakata interaktif yang dirancang untuk membantu pengguna menguasai kata-kata dari berbagai bahasa melalui fitur dan latihan yang menarik. Proyek ini dibangun dengan fokus pada modularitas dan ekstensibilitas, memungkinkan penambahan bahasa dan jenis latihan baru dengan mudah.

## Fitur Utama
- **Latihan Mendengarkan:** Meningkatkan pelafalan dan pemahaman mendengarkan.
- **Kuis Kosakata:** Menguji pengetahuan dengan kuis interaktif.
- **Permainan Mencocokkan:** Belajar melalui latihan mencocokkan yang menyenangkan.
- **Latihan Memori:** Meningkatkan retensi kosakata dengan latihan memori.
- **Latihan Menulis:** Melatih kemampuan menulis kosakata dan frasa.
- **Manajemen Kosakata Kustom:** Memungkinkan pengguna untuk membuat, mengimpor, dan mengelola daftar kosakata mereka sendiri.

## Tumpukan Teknologi (Tech Stack)
Proyek ini dibangun menggunakan teknologi web modern:
- **React:** Kerangka kerja frontend.
- **TypeScript:** JavaScript dengan tipe yang aman.
- **Vite:** Alat build dan server pengembangan.
- **Tailwind CSS:** Kerangka kerja CSS utility-first.
- **shadcn-ui:** Pustaka komponen UI.

## Struktur Proyek
```
C:/Users/PC/Downloads/katakosa/
├───public/                 # Aset statis (gambar, favicon)
├───src/                    # Kode sumber aplikasi
│   ├───App.tsx             # Komponen utama aplikasi dan konfigurasi routing
│   ├───index.css           # Gaya CSS global
│   ├───main.tsx            # Titik masuk aplikasi React
│   ├───vite-env.d.ts       # Definisi tipe Vite
│   ├───components/         # Komponen UI yang dapat digunakan kembali (shadcn-ui)
│   │   └───ui/             # Komponen UI dasar
│   ├───error/              # Penanganan error (ErrorBoundary)
│   ├───features/           # Modul fitur spesifik aplikasi
│   │   ├───audio-player/   # Fitur pemutar audio
│   │   ├───dashboard/      # Halaman dashboard
│   │   ├───excel-importer/ # Fitur impor Excel
│   │   ├───flipbook/       # Fitur flipbook
│   │   ├───home/           # Halaman beranda
│   │   ├───listening-practice/ # Latihan mendengarkan
│   │   ├───matching-game/  # Permainan mencocokkan
│   │   ├───memorization-practice/ # Latihan memorisasi
│   │   ├───practice-projects/ # Manajemen proyek latihan
│   │   ├───quiz/           # Fitur kuis
│   │   ├───review-practice/ # Latihan ulasan
│   │   ├───vocabulary/     # Manajemen kosakata (termasuk kosakata kustom)
│   │   └───writing-practice/ # Latihan menulis (fitur baru)
│   ├───hooks/              # Custom React Hooks
│   ├───layout/             # Komponen tata letak (misalnya Navbar)
│   ├───lib/                # Utilitas umum (misalnya `utils.ts`)
│   ├───pages/              # Komponen halaman tingkat atas
│   └───utils/              # Utilitas aplikasi spesifik
├───.gitignore              # File yang diabaikan oleh Git
├───package.json            # Metadata proyek dan dependensi
├───package-lock.json       # Kunci dependensi yang tepat
├───tailwind.config.js      # Konfigurasi Tailwind CSS
├───postcss.config.js       # Konfigurasi PostCSS
├───eslint.config.js        # Konfigurasi ESLint
├───tsconfig.json           # Konfigurasi TypeScript
├───vite.config.ts          # Konfigurasi Vite
└───...
```

## Memulai Proyek

### Prasyarat
- Node.js dan npm (Instal melalui [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Git

### Instalasi
1. Kloning repositori:
   ```bash
   git clone <URL_REPOSITORI_ANDA>
   cd katakosa
   ```
2. Instal dependensi:
   ```bash
   npm install
   ```

### Menjalankan Aplikasi
Untuk menjalankan aplikasi dalam mode pengembangan:
```bash
npm run dev
```

### Membangun Aplikasi
Untuk membangun aplikasi untuk produksi:
```bash
npm run build
```

### Menjalankan Tes
Untuk menjalankan tes unit:
```bash
npm run test
```