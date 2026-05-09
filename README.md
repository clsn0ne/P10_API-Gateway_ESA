Praktikum implementasi arsitektur **microservices event-driven** dengan **Kafka** dan pola **Saga Orchestrator**.  
Sistem ini menyimulasikan platform pengajuan pinjaman yang terdiri dari beberapa layanan independen.

---

## 🧱 Arsitektur

| Layanan      | Port Internal | Role                                      |
|--------------|---------------|-------------------------------------------|
| api-gateway  | 3000          | Entry point tunggal, load balancing       |
| loan-core    | 3001, 3002    | Orchestrator saga pengajuan pinjaman      |
| kyc          | 4000          | Verifikasi Know Your Customer             |
| credit       | 4001          | Pengecekan skor kredit                    |
| risk         | 4002          | Evaluasi risiko pinjaman                  |
| blacklist    | 4003          | Pemeriksaan daftar hitam                  |
| audit        | 5000          | Pencatatan seluruh transaksi              |
| Kafka        | 9092          | Message broker (event bus)                |
| PostgreSQL   | 5432          | Database (jika digunakan oleh layanan)    |

Komunikasi antar‑layanan dilakukan **secara asinkron** melalui topik Kafka (`loan.requested`, `kyc.completed`, `credit.checked`, dll).  
Pola **Saga** diimplementasikan oleh `loan-core` untuk mengoordinasikan langkah‑langkah verifikasi dan menangani kegagalan dengan kompensasi (`loan.cancelled`).

---

## ▶️ Menjalankan Proyek

### Prasyarat
- Docker & Docker Compose v2
- Node.js ≥18 (opsional, untuk pengembangan lokal)

### Langkah 1 – Clone dan konfigurasi
```bash
git clone https://github.com/clsn0ne/P10_API-Gateway_ESA.git
cp .env.example .env
```

### Langkah 2 – Build dan jalankan
```bash
docker-compose up --build -d
```
Tunggu hingga seluruh container berstatus `healthy` (cek dengan `docker-compose ps`).

---

## 🧪 Pengujian dengan Postman

### 1. Pengajuan pinjaman (approve)
```http
POST http://localhost:3000/api/loans/apply
Content-Type: application/json

{
  "userId": "good-user",
  "amount": 1000,
  "product": "STD",
  "type": "UNSECURED"
}
```
**Respon sukses:** `{ "applicationId": "APP001", "status": "APPROVED" }`

### 2. Melihat log audit
```http
GET http://localhost:3000/api/audit/APP001
```
Mengembalikan array event yang terekam untuk ID tersebut.

### 3. Melihat detail pengajuan
```http
GET http://localhost:3000/api/loans/APP001
```
Mengembalikan objek lengkap pengajuan (status `APPROVED`/`REJECTED`/`ERROR`).

### 4. Menghapus data pengajuan
```http
DELETE http://localhost:3000/api/loans/APP001
```

---

## 🆕 Fitur Tambahan

- **`DELETE /api/loans/:id`** – Memberikan kemampuan untuk membersihkan data pengajuan dari memori, menjaga kebersihan data dan privasi pengujian.

---

## 📚 Pembelajaran Utama

1. **Arsitektur Microservices** – Setiap layanan memiliki tanggung jawab tunggal, berkomunikasi via event, mengurangi ketergantungan langsung.
2. **Pola Saga & Kompensasi** – Transaksi terdistribusi ditangani dengan koordinasi event; kegagalan direspons dengan kompensasi (cancellation).
3. **API Gateway** – Menjadi façade bagi client, menerapkan load balancing round‑robin, dan menyederhanakan akses ke sistem.
4. **Event‑Driven dengan Kafka** – Mengajarkan konsep eventual consistency dan decoupling penuh antar layanan.
5. **Pengembangan Bertahap** – Penambahan fitur baru (GET, DELETE) dapat dilakukan tanpa mengganggu proses bisnis utama, selama kontrak event tetap dipatuhi.
6. **Praktik DevOps Dasar** – Penggunaan Docker Compose untuk menjalankan seluruh arsitektur secara lokal, serta pentingnya manajemen resource (memori) saat menjalankan banyak kontainer.
