# 🎓 StudentHub - Platform Produktivitas & Keuangan Mahasiswa

Platform berbasis website all-in-one untuk mahasiswa yang dibangun dengan MERN Stack (MongoDB, Express.js Serverless, React + Vite, Node.js). Dirancang khusus agar **100% gratis** di-hosting menggunakan **Vercel** dan **MongoDB Atlas Free Tier (M0)**.

---

## ✨ Fitur Utama

1. **Jadwal Kuliah (Timetable) & Agenda Acara (Kalender):**
   - Grid jadwal mingguan (Senin - Minggu) dengan kode warna, SKS, nama dosen, dan ruang kelas/link kuliah daring.
   - Kalender pencatatan acara penting kampus (UTS, UAS, webinar, rapat organisasi/himpunan).
2. **Pelacak Tugas (Task Tracker) & Materi Kuliah:**
   - Kanban Board interaktif (*To Do*, *Sedang Dikerjakan*, *Selesai*) & List View.
   - Peringatan deadline tugas (Hari ini, Besok, sisa hari) dengan perayaan konfeti saat tugas diselesaikan.
   - Dokumentasi materi perkuliahan, resume bab, dan tautan slide presentasi/Google Drive.
3. **Pencatatan Finansial Mahasiswa (Income & Expense Tracker):**
   - Catat pemasukan (kiriman orang tua, beasiswa, freelance) & pengeluaran (makan, kos, fotokopi/print tugas, transportasi).
   - Analisis saldo sisa dan grafik diagram alokasi pengeluaran per kategori.
4. **Autentikasi Fleksibel & Profil Mahasiswa:**
   - Login dengan Email & Password (JWT) atau Akun Google (Google OAuth).
   - Kartu Tanda Mahasiswa (KTM) virtual dengan informasi kampus, jurusan, dan semester aktif.

---

## 🛠️ Tech Stack & Arsitektur

- **Frontend:** React 19, Vite, Tailwind CSS, Lucide React Icons, React Router DOM, Axios, Canvas Confetti.
- **Backend:** Express.js yang dikonfigurasi sebagai **Serverless Functions** untuk Vercel.
- **Database:** MongoDB Atlas (M0 Free Tier).
- **Deployment:** Vercel (Hobby Tier 100% Gratis).

---

## 🚀 Menjalankan Secara Lokal di Komputer

### 1. Salin Environment Variable
Buka terminal di root direktori project, lalu buat file `.env` (atau gunakan template dari `.env.example`):

```bash
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/student_hub?retryWrites=true&w=majority
JWT_SECRET=kunci_rahasia_jwt_anda_disini
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com # Opsional
```

### 2. Jalankan Backend & Frontend Sekaligus
Cukup jalankan perintah berikut dari root direktori:

```bash
npm run dev
```

- **Frontend:** `http://localhost:5173`
- **Backend API:** `http://localhost:5000`

---

## 🌐 Panduan Deployment ke Vercel & MongoDB Atlas (100% Gratis)

### Langkah 1: Setup MongoDB Atlas (Gratis Selamanya)
1. Buka [cloud.mongodb.com](https://cloud.mongodb.com) dan buat akun gratis.
2. Buat Cluster baru dan pilih opsi **M0 Free (Shared)**.
3. Pada menu **Security > Database Access**, buat user database baru (ingat username dan password-nya).
4. Pada menu **Network Access**, tambahkan IP Address `0.0.0.0/0` (Allow Access from Anywhere) agar Vercel dapat terhubung.
5. Klik **Connect > Drivers > Node.js**, lalu salin string koneksinya (misal: `mongodb+srv://user:pass@cluster0...mongodb.net/student_hub?retryWrites=true&w=majority`).

### Langkah 2: Deploy ke Vercel
1. Push kode repository ini ke GitHub.
2. Masuk ke [vercel.com](https://vercel.com) dan hubungkan akun GitHub Anda.
3. Klik **Add New Project**, lalu pilih repository `student`.
4. Konfigurasi `vercel.json` sudah tersedia secara otomatis di project ini.
5. Pada menu **Environment Variables**, tambahkan:
   - `MONGODB_URI`: String koneksi MongoDB Atlas dari Langkah 1.
   - `JWT_SECRET`: String acak apa saja untuk enkripsi token login.
   - `GOOGLE_CLIENT_ID` (opsional): Client ID dari Google Cloud Console jika ingin menggunakan tombol Google Login.
6. Klik **Deploy**! Project Anda akan langsung live dengan domain gratis `.vercel.app`.
