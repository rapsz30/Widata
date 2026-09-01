import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding WIDATA database...");

  // 1. Kalurahan
  const kalurahan = await prisma.wilayah.upsert({
    where: { id: "kalurahan-widodomartani" },
    update: {},
    create: {
      id: "kalurahan-widodomartani",
      nama: "Widodomartani",
      jenis: "KALURAHAN",
      kode: "0001",
    },
  });

  // 2. Dukuh
  const dukuhData = [
    { id: "dukuh-ngalian", nama: "Ngalian", kode: "001" },
    { id: "dukuh-kalijeruk2", nama: "Kalijeruk 2", kode: "002" },
    { id: "dukuh-kemasan", nama: "Kemasan", kode: "003" },
    { id: "dukuh-klancingan", nama: "Klancingan", kode: "004" },
    { id: "dukuh-kwadungan", nama: "Kwadungan", kode: "005" },
    { id: "dukuh-pondok1", nama: "Pondok 1", kode: "006" },
  ];

  const dukuhList = [];
  for (const d of dukuhData) {
    const dukuh = await prisma.wilayah.upsert({
      where: { id: d.id },
      update: {},
      create: {
        ...d,
        jenis: "DUKUH",
        parentId: kalurahan.id,
      },
    });
    dukuhList.push(dukuh);
  }

  // 3. RT (5 per Dukuh)
  const rtList = [];
  for (const dukuh of dukuhList) {
    for (let i = 1; i <= 5; i++) {
      const noRT = String(i).padStart(2, "0");
      const rtId = `rt-${dukuh.kode}-${noRT}`;
      const rt = await prisma.wilayah.upsert({
        where: { id: rtId },
        update: {},
        create: {
          id: rtId,
          nama: `RT ${noRT}`,
          jenis: "RT",
          kode: `${dukuh.kode}${noRT}`,
          parentId: dukuh.id,
        },
      });
      rtList.push({ ...rt, dukuhNama: dukuh.nama });
    }
  }

  // 4. Operator Desa
  const opPassword = await bcrypt.hash("operator123", 10);
  await prisma.user.upsert({
    where: { username: "operator" },
    update: {},
    create: {
      nama: "Operator Desa Widodomartani",
      username: "operator",
      password: opPassword,
      role: "OPERATOR",
      wilayahId: kalurahan.id,
    },
  });

  // 5. Akun Dukuh (1 per Dukuh)
  const dukuhUserMap: Record<string, string> = {
    "dukuh-ngalian": "dukuh_ngalian",
    "dukuh-kalijeruk2": "dukuh_kalijeruk2",
    "dukuh-kemasan": "dukuh_kemasan",
    "dukuh-klancingan": "dukuh_klancingan",
    "dukuh-kwadungan": "dukuh_kwadungan",
    "dukuh-pondok1": "dukuh_pondok1",
  };
  const dukuhPass = await bcrypt.hash("dukuh123", 10);
  for (const dukuh of dukuhList) {
    const username = dukuhUserMap[dukuh.id];
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        nama: `Dukuh ${dukuh.nama}`,
        username,
        password: dukuhPass,
        role: "DUKUH",
        wilayahId: dukuh.id,
      },
    });
  }

  // 6. Akun RT (1 per RT)
  const rtPass = await bcrypt.hash("rt123", 10);
  for (const rt of rtList) {
    const username = `rt_${rt.kode}`;
    await prisma.user.upsert({
      where: { username },
      update: {},
      create: {
        nama: `RT ${rt.nama} ${rt.dukuhNama}`,
        username,
        password: rtPass,
        role: "RT",
        wilayahId: rt.id,
      },
    });
  }

  // 7. Seed contoh KK & Penduduk di RT 01 Ngalian
  const rtNgalian01 = rtList.find((r) => r.id === "rt-001-01")!;
  const kk1 = await prisma.kartuKeluarga.upsert({
    where: { noKK: "3404012345670001" },
    update: {},
    create: {
      noKK: "3404012345670001",
      kepalaKeluarga: "Slamet Raharjo",
      alamat: "Ngalian RT 01",
      wilayahId: rtNgalian01.id,
    },
  });

  const pendudukContoh = [
    {
      nik: "3404011501800001",
      nama: "Slamet Raharjo",
      tempatLahir: "Sleman",
      tanggalLahir: new Date("1980-01-15"),
      jenisKelamin: "L",
      agama: "Islam",
      pendidikan: "SMA",
      pekerjaan: "Petani",
      statusKawin: "KAWIN",
    },
    {
      nik: "3404014502850002",
      nama: "Sri Lestari",
      tempatLahir: "Sleman",
      tanggalLahir: new Date("1985-02-05"),
      jenisKelamin: "P",
      agama: "Islam",
      pendidikan: "SMP",
      pekerjaan: "Ibu Rumah Tangga",
      statusKawin: "KAWIN",
    },
    {
      nik: "3404011003100003",
      nama: "Budi Raharjo",
      tempatLahir: "Sleman",
      tanggalLahir: new Date("2010-03-10"),
      jenisKelamin: "L",
      agama: "Islam",
      pendidikan: "SD",
      pekerjaan: "Pelajar",
      statusKawin: "BELUM_KAWIN",
    },
  ];

  for (const p of pendudukContoh) {
    await prisma.penduduk.upsert({
      where: { nik: p.nik },
      update: {},
      create: { ...p, kkId: kk1.id },
    });
  }

  // KK & Penduduk di RT 01 Ngalian (keluarga ke-2)
  const kk2 = await prisma.kartuKeluarga.upsert({
    where: { noKK: "3404012345670002" },
    update: {},
    create: {
      noKK: "3404012345670002",
      kepalaKeluarga: "Wahyu Santoso",
      alamat: "Ngalian RT 01",
      wilayahId: rtNgalian01.id,
    },
  });

  await prisma.penduduk.upsert({
    where: { nik: "3404012005750004" },
    update: {},
    create: {
      nik: "3404012005750004",
      nama: "Wahyu Santoso",
      tempatLahir: "Yogyakarta",
      tanggalLahir: new Date("1975-05-20"),
      jenisKelamin: "L",
      agama: "Islam",
      pendidikan: "S1",
      pekerjaan: "PNS",
      statusKawin: "KAWIN",
      kkId: kk2.id,
    },
  });

  // Seed contoh Bansos
  const penduduk1 = await prisma.penduduk.findUnique({
    where: { nik: "3404011501800001" },
  });
  if (penduduk1) {
    await prisma.dataBansos.upsert({
      where: { id: "bansos-001" },
      update: {},
      create: {
        id: "bansos-001",
        pendudukId: penduduk1.id,
        jenisBansos: "PKH",
        tahun: 2024,
        semester: 1,
        nilaiManfaat: 750000,
        status: "AKTIF",
        keterangan: "Program Keluarga Harapan",
      },
    });

    await prisma.dataBPJS.upsert({
      where: { noKartu: "0001234567890" },
      update: {},
      create: {
        pendudukId: penduduk1.id,
        noKartu: "0001234567890",
        kelas: 3,
        jenis: "PBI",
        status: "AKTIF",
      },
    });
  }

  console.log("✅ Seeding selesai!");
  console.log("\n📋 Akun demo:");
  console.log("  Operator  → username: operator   | password: operator123");
  console.log("  Dukuh     → username: dukuh_ngalian | password: dukuh123");
  console.log("  RT        → username: rt_00101   | password: rt123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
