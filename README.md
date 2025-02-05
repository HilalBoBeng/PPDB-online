# PPDB Online

Sistem Pendaftaran Peserta Didik Baru (PPDB) Online
tutorial : https://www.youtube.com/@mohmbilly
["screenshot"](/src/Snapshot_ppdb-online.png)

## Informasi Lisensi

by Mohamad Marstias Billy (Koncoweb)

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.

## Tentang Aplikasi

Aplikasi PPDB Online ini dikembangkan oleh Mohamad Marstias Billy (Koncoweb) untuk memudahkan proses pendaftaran siswa baru secara online.

### Fitur Utama

1. **Sistem Antrian**
   - Pengambilan nomor antrian online
   - Manajemen antrian untuk pendaftaran PPDB

2. **Pendaftaran Online**
   - Form pendaftaran siswa lengkap
   - Upload dan verifikasi dokumen
   - Status pendaftaran real-time
   - Notifikasi status pendaftaran

3. **Panel Admin**
   - Dashboard admin untuk monitoring
   - Manajemen data pendaftar
   - Verifikasi dan approval pendaftaran
   - Pengaturan periode pendaftaran
   - Reset antrian

4. **Papan Peringkat**
   - Tampilan peringkat pendaftar
   - Filter berdasarkan status
   - Pencarian pendaftar

5. **Manajemen Akun**
   - Registrasi akun orang tua
   - Login sistem
   - Profil pengguna
   - Riwayat pendaftaran

6. **Fitur Keamanan**
   - Autentikasi pengguna
   - Verifikasi PIN admin
   - Pembatasan akses berdasarkan role

### Teknologi yang Digunakan

- React + Vite
- TypeScript
- Tailwind CSS
- Firebase (Authentication, Realtime Database, Firestore)

### Cara Instalasi
```Warning :
sebelum 
npm install
ganti src/firebase.ts
pada 
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};
dengan punya anda sendiri
```


1. Clone repository

```bash
git clone [url-repository]
```

2. Install dependensi
```bash
npm install
```

3. Konfigurasi Firebase
   - Buat project di Firebase Console
   - Copy konfigurasi Firebase ke file `src/firebase.ts`

4. Jalankan aplikasi
```bash
npm run dev
```
```bash
default admin
email : admin@email.com
pass : admin123
```
### Kontak

Untuk informasi lebih lanjut, silakan hubungi:
- Mohamad Marstias Billy (Koncoweb)
- Email: koncoweb@gmail.com
- Tutorial: https://www.youtube.com/@mohmbilly

---
Dikembangkan dengan ❤️ oleh Mohamad Marstias Billy (Koncoweb)
