// scripts/migrate-sqlite-to-neon.js

const path = require("path");
const { createClient } = require("@libsql/client");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

const sqlite = createClient({
  url: `file:${path.resolve("prisma/dev.db")}`,
});

const TABLES = [
  "Wilayah",
  "User",
  "KartuKeluarga",
  "Penduduk",
  "LaporanWarga",
  "UsulanPerubahan",
  "DataBansos",
  "DataBPJS",
  "Rekap",
];

function asDate(value, fieldName) {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`Tanggal tidak valid pada field ${fieldName}`);
  }

  return date;
}

function asBool(value) {
  return (
    value === true ||
    value === 1 ||
    value === "1" ||
    value === "true"
  );
}

async function sqliteRows(table) {
  const result = await sqlite.execute(`SELECT * FROM "${table}"`);
  return result.rows;
}

async function sourceCounts() {
  const counts = {};

  for (const table of TABLES) {
    const result = await sqlite.execute(
      `SELECT COUNT(*) AS count FROM "${table}"`
    );

    counts[table] = Number(result.rows[0].count);
  }

  return counts;
}

async function targetCounts(tx) {
  const counts = {};

  for (const table of TABLES) {
    counts[table] = await tx[table].count();
  }

  return counts;
}

async function migrateWilayah(tx, rows) {
  // Wilayah mempunyai kemungkinan relasi parent-child.
  // Root dimasukkan terlebih dahulu, kemudian child.

  const pending = [...rows];
  const inserted = new Set();

  while (pending.length > 0) {
    const before = pending.length;

    for (let i = pending.length - 1; i >= 0; i--) {
      const r = pending[i];

      const parentId = r.parentId ?? null;

      if (
        parentId !== null &&
        !inserted.has(String(parentId))
      ) {
        continue;
      }

      await tx.wilayah.create({
        data: {
          id: String(r.id),
          nama: String(r.nama),
          jenis: String(r.jenis),
          kode: r.kode ?? null,
          parentId: parentId,
          createdAt: asDate(
            r.createdAt,
            "Wilayah.createdAt"
          ),
        },
      });

      inserted.add(String(r.id));

      pending.splice(i, 1);
    }

    if (pending.length === before) {
      throw new Error(
        "Gagal mengurutkan data Wilayah. Ada parentId yang tidak ditemukan."
      );
    }
  }
}

async function migrate() {
  console.log("");
  console.log("========================================");
  console.log(" WIDATA SQLITE -> NEON MIGRATION");
  console.log("========================================");
  console.log("");

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL tidak ditemukan. Pastikan .env menggunakan connection string Neon."
    );
  }

  console.log("Sumber : prisma/dev.db");
  console.log("Tujuan : Neon PostgreSQL");
  console.log("");

  // ========================================
  // CEK DATA SUMBER
  // ========================================

  const counts = await sourceCounts();

  console.log("Data di dev.db:");
  console.log("");

  for (const table of TABLES) {
    console.log(`  ${table}: ${counts[table]}`);
  }

  const total = Object.values(counts).reduce(
    (a, b) => a + b,
    0
  );

  console.log("");
  console.log(`TOTAL: ${total}`);
  console.log("");

  // ========================================
  // MIGRASI
  // ========================================

  await prisma.$transaction(
    async (tx) => {
      console.log("Memeriksa database Neon...");
      console.log("");

      const existing = await targetCounts(tx);

      const existingTotal = Object.values(existing).reduce(
        (a, b) => a + b,
        0
      );

      // SAFETY CHECK
      // Kalau Neon sudah memiliki data,
      // migration akan dibatalkan.

      if (existingTotal > 0) {
        throw new Error(
          "MIGRATION DIBATALKAN: database Neon sudah berisi data. " +
          "Script ini hanya boleh dijalankan ketika database Neon masih kosong."
        );
      }

      console.log(
        "Database Neon masih kosong. Aman untuk migrasi."
      );

      console.log("");

      // ========================================
      // 1. WILAYAH
      // ========================================

      const wilayah = await sqliteRows("Wilayah");

      await migrateWilayah(tx, wilayah);

      console.log(
        `✓ Wilayah: ${wilayah.length}`
      );

      // ========================================
      // 2. USER
      // ========================================

      const users = await sqliteRows("User");

      if (users.length > 0) {
        await tx.user.createMany({
          data: users.map((r) => ({
            id: String(r.id),
            nama: String(r.nama),
            username: String(r.username),
            password: String(r.password),
            role: String(r.role),
            wilayahId: r.wilayahId ?? null,
            aktif: asBool(r.aktif),
            createdAt: asDate(
              r.createdAt,
              "User.createdAt"
            ),
            updatedAt: asDate(
              r.updatedAt,
              "User.updatedAt"
            ),
          })),
        });
      }

      console.log(
        `✓ User: ${users.length}`
      );

      // ========================================
      // 3. KARTU KELUARGA
      // ========================================

      const kk = await sqliteRows(
        "KartuKeluarga"
      );

      if (kk.length > 0) {
        await tx.kartuKeluarga.createMany({
          data: kk.map((r) => ({
            id: String(r.id),
            noKK: String(r.noKK),
            kepalaKeluarga: String(
              r.kepalaKeluarga
            ),
            alamat: String(r.alamat),
            wilayahId: String(r.wilayahId),
            createdAt: asDate(
              r.createdAt,
              "KartuKeluarga.createdAt"
            ),
            updatedAt: asDate(
              r.updatedAt,
              "KartuKeluarga.updatedAt"
            ),
          })),
        });
      }

      console.log(
        `✓ KartuKeluarga: ${kk.length}`
      );

      // ========================================
      // 4. PENDUDUK
      // ========================================

      const penduduk = await sqliteRows(
        "Penduduk"
      );

      if (penduduk.length > 0) {
        await tx.penduduk.createMany({
          data: penduduk.map((r) => ({
            id: String(r.id),
            nik: String(r.nik),
            nama: String(r.nama),
            tempatLahir: String(r.tempatLahir),
            tanggalLahir: asDate(
              r.tanggalLahir,
              "Penduduk.tanggalLahir"
            ),
            jenisKelamin: String(
              r.jenisKelamin
            ),
            agama: String(r.agama),
            pendidikan: String(
              r.pendidikan
            ),
            pekerjaan: String(
              r.pekerjaan
            ),
            statusKawin: String(
              r.statusKawin
            ),
            statusHidup: String(
              r.statusHidup
            ),
            statusTinggal: String(
              r.statusTinggal
            ),
            kkId: r.kkId ?? null,
            createdAt: asDate(
              r.createdAt,
              "Penduduk.createdAt"
            ),
            updatedAt: asDate(
              r.updatedAt,
              "Penduduk.updatedAt"
            ),
          })),
        });
      }

      console.log(
        `✓ Penduduk: ${penduduk.length}`
      );

      // ========================================
      // 5. DATA BANSOS
      // ========================================

      const bansos = await sqliteRows(
        "DataBansos"
      );

      if (bansos.length > 0) {
        await tx.dataBansos.createMany({
          data: bansos.map((r) => ({
            id: String(r.id),
            pendudukId: String(
              r.pendudukId
            ),
            jenisBansos: String(
              r.jenisBansos
            ),
            tahun: Number(r.tahun),
            semester: Number(r.semester),
            nilaiManfaat: Number(
              r.nilaiManfaat
            ),
            status: String(r.status),
            keterangan:
              r.keterangan ?? null,
            createdAt: asDate(
              r.createdAt,
              "DataBansos.createdAt"
            ),
            updatedAt: asDate(
              r.updatedAt,
              "DataBansos.updatedAt"
            ),
          })),
        });
      }

      console.log(
        `✓ DataBansos: ${bansos.length}`
      );

      // ========================================
      // 6. DATA BPJS
      // ========================================

      const bpjs = await sqliteRows(
        "DataBPJS"
      );

      if (bpjs.length > 0) {
        await tx.dataBPJS.createMany({
          data: bpjs.map((r) => ({
            id: String(r.id),
            pendudukId: String(
              r.pendudukId
            ),
            noKartu: String(r.noKartu),
            kelas: Number(r.kelas),
            jenis: String(r.jenis),
            status: String(r.status),
            createdAt: asDate(
              r.createdAt,
              "DataBPJS.createdAt"
            ),
            updatedAt: asDate(
              r.updatedAt,
              "DataBPJS.updatedAt"
            ),
          })),
        });
      }

      console.log(
        `✓ DataBPJS: ${bpjs.length}`
      );

      // ========================================
      // 7. LAPORAN WARGA
      // ========================================

      const laporan = await sqliteRows(
        "LaporanWarga"
      );

      if (laporan.length > 0) {
        await tx.laporanWarga.createMany({
          data: laporan.map((r) => ({
            id: String(r.id),
            jenis: String(r.jenis),
            status: String(r.status),
            pendudukId:
              r.pendudukId ?? null,
            pelaporId: String(
              r.pelaporId
            ),
            wilayahId: String(
              r.wilayahId
            ),
            catatan:
              r.catatan ?? null,
            dataBaru:
              r.dataBaru ?? null,
            verifiedBy:
              r.verifiedBy ?? null,
            verifiedAt: asDate(
              r.verifiedAt,
              "LaporanWarga.verifiedAt"
            ),
            createdAt: asDate(
              r.createdAt,
              "LaporanWarga.createdAt"
            ),
            updatedAt: asDate(
              r.updatedAt,
              "LaporanWarga.updatedAt"
            ),
          })),
        });
      }

      console.log(
        `✓ LaporanWarga: ${laporan.length}`
      );

      // ========================================
      // 8. USULAN PERUBAHAN
      // ========================================

      const usulan = await sqliteRows(
        "UsulanPerubahan"
      );

      if (usulan.length > 0) {
        await tx.usulanPerubahan.createMany({
          data: usulan.map((r) => ({
            id: String(r.id),
            pendudukId:
              r.pendudukId ?? null,
            pengusulId: String(
              r.pengusulId
            ),
            field: String(r.field),
            nilaiLama: String(
              r.nilaiLama
            ),
            nilaiBaru: String(
              r.nilaiBaru
            ),
            alasan: String(r.alasan),
            status: String(r.status),
            verifiedBy:
              r.verifiedBy ?? null,
            verifiedAt: asDate(
              r.verifiedAt,
              "UsulanPerubahan.verifiedAt"
            ),
            createdAt: asDate(
              r.createdAt,
              "UsulanPerubahan.createdAt"
            ),
            updatedAt: asDate(
              r.updatedAt,
              "UsulanPerubahan.updatedAt"
            ),
          })),
        });
      }

      console.log(
        `✓ UsulanPerubahan: ${usulan.length}`
      );

      // ========================================
      // 9. REKAP
      // ========================================

      const rekap = await sqliteRows(
        "Rekap"
      );

      if (rekap.length > 0) {
        await tx.rekap.createMany({
          data: rekap.map((r) => ({
            id: String(r.id),
            wilayahId: String(
              r.wilayahId
            ),
            bulan: Number(r.bulan),
            tahun: Number(r.tahun),
            jenis: String(r.jenis),
            data: String(r.data),
            dibuatOleh: String(
              r.dibuatOleh
            ),
            createdAt: asDate(
              r.createdAt,
              "Rekap.createdAt"
            ),
          })),
        });
      }

      console.log(
        `✓ Rekap: ${rekap.length}`
      );

      console.log("");
      console.log(
        "Semua data berhasil dimasukkan ke transaction."
      );
    },
    {
      maxWait: 10000,
      timeout: 120000,
    }
  );

  // ========================================
  // VERIFIKASI
  // ========================================

  const finalCounts =
    await targetCounts(prisma);

  console.log("");
  console.log("========================================");
  console.log(" VERIFIKASI MIGRASI");
  console.log("========================================");
  console.log("");

  let sourceTotal = 0;
  let targetTotal = 0;

  for (const table of TABLES) {
    const source = counts[table];
    const target = finalCounts[table];

    sourceTotal += source;
    targetTotal += target;

    const status =
      source === target
        ? "OK"
        : "MISMATCH";

    console.log(
      `  ${table}: source=${source}, neon=${target} -> ${status}`
    );
  }

  console.log("");
  console.log(
    `TOTAL: source=${sourceTotal}, neon=${targetTotal}`
  );

  if (sourceTotal !== targetTotal) {
    throw new Error(
      "Jumlah data source dan Neon tidak sama. Jangan lanjut deployment."
    );
  }

  console.log("");
  console.log("========================================");
  console.log(" MIGRASI BERHASIL");
  console.log("========================================");
  console.log("");
  console.log(
    "Seluruh data berhasil dipindahkan dari SQLite ke Neon."
  );
  console.log(
    "Isi data sensitif tidak ditampilkan di terminal."
  );
  console.log("");
}

migrate()
  .catch((error) => {
    console.error("");
    console.error("========================================");
    console.error(" MIGRASI GAGAL / DIBATALKAN");
    console.error("========================================");
    console.error("");
    console.error(error.message);
    console.error("");
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
    sqlite.close();
  });