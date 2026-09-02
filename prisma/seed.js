const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding WIDATA database with 6 Padukuhan & rich dummy data...");

  // Clear existing data in correct order
  await prisma.dataBPJS.deleteMany({});
  await prisma.dataBansos.deleteMany({});
  await prisma.usulanPerubahan.deleteMany({});
  await prisma.laporanWarga.deleteMany({});
  await prisma.rekap.deleteMany({});
  await prisma.penduduk.deleteMany({});
  await prisma.kartuKeluarga.deleteMany({});
  await prisma.user.deleteMany({});

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

  // 2. 6 Dukuh (Ngalian, Kalijeruk 2, Kemasan, Klancingan, Kwadungan, Pondok 1)
  const dukuhData = [
    { id: "dukuh-ngalian", nama: "Ngalian", kode: "001", user: "ngalian" },
    { id: "dukuh-kalijeruk2", nama: "Kalijeruk 2", kode: "002", user: "kalijeruk2" },
    { id: "dukuh-kemasan", nama: "Kemasan", kode: "003", user: "kemasan" },
    { id: "dukuh-klancingan", nama: "Klancingan", kode: "004", user: "klancingan" },
    { id: "dukuh-kwadungan", nama: "Kwadungan", kode: "005", user: "kwadungan" },
    { id: "dukuh-pondok1", nama: "Pondok 1", kode: "006", user: "pondok1" },
  ];

  const dukuhList = [];
  for (const d of dukuhData) {
    const dukuh = await prisma.wilayah.upsert({
      where: { id: d.id },
      update: { nama: d.nama, kode: d.kode },
      create: { id: d.id, nama: d.nama, kode: d.kode, jenis: "DUKUH", parentId: kalurahan.id },
    });
    dukuhList.push({ ...dukuh, userKey: d.user });
  }

  // 3. RT (1 RT per Dukuh)
  const rtList = [];
  for (const dukuh of dukuhList) {
    const rtId = `rt-${dukuh.kode}-01`;
    const rt = await prisma.wilayah.upsert({
      where: { id: rtId },
      update: {},
      create: {
        id: rtId,
        nama: "RT 01",
        jenis: "RT",
        kode: `${dukuh.kode}01`,
        parentId: dukuh.id,
      },
    });
    rtList.push({ ...rt, dukuhNama: dukuh.nama, dukuhUserKey: dukuh.userKey });
  }

  // 4. Operator Desa User
  const opPassword = await bcrypt.hash("operator123", 10);
  const operatorUser = await prisma.user.create({
    data: {
      nama: "Operator Desa Widodomartani",
      username: "operator",
      password: opPassword,
      role: "OPERATOR",
      wilayahId: kalurahan.id,
    },
  });

  // 5. Akun 6 Dukuh
  const dukuhUsers = [];
  for (const dukuh of dukuhList) {
    const pass = await bcrypt.hash(`${dukuh.userKey}123`, 10);
    const u = await prisma.user.create({
      data: {
        nama: `Dukuh ${dukuh.nama}`,
        username: dukuh.userKey,
        password: pass,
        role: "DUKUH",
        wilayahId: dukuh.id,
      },
    });
    dukuhUsers.push(u);
  }

  // 6. Akun 6 RT (1 per Dukuh)
  const rtUsers = [];
  for (const rt of rtList) {
    const username = `rt_${rt.dukuhUserKey}`;
    const pass = await bcrypt.hash(`rt_${rt.dukuhUserKey}123`, 10);
    const u = await prisma.user.create({
      data: {
        nama: `RT 01 ${rt.dukuhNama}`,
        username: username,
        password: pass,
        role: "RT",
        wilayahId: rt.id,
      },
    });
    rtUsers.push(u);
  }

  // 7. Kartu Keluarga & Penduduk (12 KK, 2 KK per RT)
  const kkMasterData = [
    { noKK: "3404010101800001", kepala: "Slamet Raharjo", alamat: "Ngalian RT 01", rtIdx: 0 },
    { noKK: "3404010101800002", kepala: "Wahyu Santoso", alamat: "Ngalian RT 01", rtIdx: 0 },
    { noKK: "3404010201800003", kepala: "Bambang Kurniawan", alamat: "Kalijeruk 2 RT 01", rtIdx: 1 },
    { noKK: "3404010201800004", kepala: "Suryono Saputra", alamat: "Kalijeruk 2 RT 01", rtIdx: 1 },
    { noKK: "3404010301800005", kepala: "Agus Harimurti", alamat: "Kemasan RT 01", rtIdx: 2 },
    { noKK: "3404010301800006", kepala: "Dwi Prasetyo", alamat: "Kemasan RT 01", rtIdx: 2 },
    { noKK: "3404010401800007", kepala: "Eko Yulianto", alamat: "Klancingan RT 01", rtIdx: 3 },
    { noKK: "3404010401800008", kepala: "Hendra Wijaya", alamat: "Klancingan RT 01", rtIdx: 3 },
    { noKK: "3404010501800009", kepala: "Joko Susilo", alamat: "Kwadungan RT 01", rtIdx: 4 },
    { noKK: "3404010501800010", kepala: "Kurniadi Pratama", alamat: "Kwadungan RT 01", rtIdx: 4 },
    { noKK: "3404010601800011", kepala: "Suparno Hadiningrat", alamat: "Pondok 1 RT 01", rtIdx: 5 },
    { noKK: "3404010601800012", kepala: "Tukiman Subagyo", alamat: "Pondok 1 RT 01", rtIdx: 5 },
  ];

  const createdKK = [];
  for (const kkData of kkMasterData) {
    const rtTarget = rtList[kkData.rtIdx];
    const kk = await prisma.kartuKeluarga.create({
      data: {
        noKK: kkData.noKK,
        kepalaKeluarga: kkData.kepala,
        alamat: kkData.alamat,
        wilayahId: rtTarget.id,
      },
    });
    createdKK.push(kk);
  }

  // Penduduk List
  const pendudukSeedData = [
    // Ngalian (RT 0)
    { nik: "3404011501800001", nama: "Slamet Raharjo", tgl: "1980-01-15", jk: "L", ag: "Islam", pend: "SMA/SMK", pekj: "Petani", kawin: "KAWIN", kkIdx: 0, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404014502850002", nama: "Sri Lestari", tgl: "1985-02-05", jk: "P", ag: "Islam", pend: "SMP", pekj: "Ibu Rumah Tangga", kawin: "KAWIN", kkIdx: 0, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404011003100003", nama: "Budi Raharjo", tgl: "2010-03-10", jk: "L", ag: "Islam", pend: "SD", pekj: "Pelajar", kawin: "BELUM_KAWIN", kkIdx: 0, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404012005750004", nama: "Wahyu Santoso", tgl: "1975-05-20", jk: "L", ag: "Islam", pend: "S1", pekj: "PNS", kawin: "KAWIN", kkIdx: 1, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404016008780005", nama: "Endang Suwarni", tgl: "1978-08-20", jk: "P", ag: "Islam", pend: "SMA/SMK", pekj: "Wiraswasta", kawin: "KAWIN", kkIdx: 1, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404011211500006", nama: "Mbok Suparni", tgl: "1950-11-12", jk: "P", ag: "Islam", pend: "Tidak/Belum Sekolah", pekj: "Pensiunan", kawin: "CERAI_MATI", kkIdx: 1, statusH: "MENINGGAL", statusT: "TETAP" },

    // Kalijeruk 2 (RT 1)
    { nik: "3404011004820007", nama: "Bambang Kurniawan", tgl: "1982-04-10", jk: "L", ag: "Islam", pend: "S1", pekj: "Karyawan Swasta", kawin: "KAWIN", kkIdx: 2, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404015009860008", nama: "Siti Rahmawati", tgl: "1986-09-10", jk: "P", ag: "Islam", pend: "SMA/SMK", pekj: "Pedagang", kawin: "KAWIN", kkIdx: 2, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404011507790009", nama: "Suryono Saputra", tgl: "1979-07-15", jk: "L", ag: "Kristen Protestan", pend: "D3", pekj: "Wiraswasta", kawin: "KAWIN", kkIdx: 3, statusH: "HIDUP", statusT: "PINDAH" },
    { nik: "3404015508810010", nama: "Maria Ulfa", tgl: "1981-08-15", jk: "P", ag: "Kristen Katolik", pend: "SMA/SMK", pekj: "Ibu Rumah Tangga", kawin: "KAWIN", kkIdx: 3, statusH: "HIDUP", statusT: "TETAP" },

    // Kemasan (RT 2)
    { nik: "3404011802830011", nama: "Agus Harimurti", tgl: "1983-02-18", jk: "L", ag: "Islam", pend: "SMA/SMK", pekj: "TNI/POLRI", kawin: "KAWIN", kkIdx: 4, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404015806870012", nama: "Dewi Persik", tgl: "1987-06-18", jk: "P", ag: "Islam", pend: "S1", pekj: "Wiraswasta", kawin: "KAWIN", kkIdx: 4, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404012209770013", nama: "Dwi Prasetyo", tgl: "1977-09-22", jk: "L", ag: "Islam", pend: "SMP", pekj: "Buruh", kawin: "KAWIN", kkIdx: 5, statusH: "HIDUP", statusT: "TETAP" },

    // Klancingan (RT 3)
    { nik: "3404011111840014", nama: "Eko Yulianto", tgl: "1984-11-11", jk: "L", ag: "Hindu", pend: "SMA/SMK", pekj: "Petani", kawin: "KAWIN", kkIdx: 6, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404015112880015", nama: "Rina Astuti", tgl: "1988-12-11", jk: "P", ag: "Hindu", pend: "SMP", pekj: "Ibu Rumah Tangga", kawin: "KAWIN", kkIdx: 6, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404011403760016", nama: "Hendra Wijaya", tgl: "1976-03-14", jk: "L", ag: "Buddha", pend: "S1", pekj: "Pedagang", kawin: "KAWIN", kkIdx: 7, statusH: "HIDUP", statusT: "TETAP" },

    // Kwadungan (RT 4)
    { nik: "3404010909810017", nama: "Joko Susilo", tgl: "1981-09-09", jk: "L", ag: "Islam", pend: "SMA/SMK", pekj: "Wiraswasta", kawin: "KAWIN", kkIdx: 8, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404014901860018", nama: "Nur Hidayah", tgl: "1986-01-09", jk: "P", ag: "Islam", pend: "D3", pekj: "Karyawan Swasta", kawin: "KAWIN", kkIdx: 8, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404010304780019", nama: "Kurniadi Pratama", tgl: "1978-04-03", jk: "L", ag: "Islam", pend: "S1", pekj: "PNS", kawin: "KAWIN", kkIdx: 9, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404014305830020", nama: "Lilis Karlina", tgl: "1983-05-03", jk: "P", ag: "Islam", pend: "SMA/SMK", pekj: "Ibu Rumah Tangga", kawin: "KAWIN", kkIdx: 9, statusH: "HIDUP", statusT: "TETAP" },

    // Pondok 1 (RT 5)
    { nik: "3404010101700021", nama: "Suparno Hadiningrat", tgl: "1970-01-01", jk: "L", ag: "Islam", pend: "S1", pekj: "PNS", kawin: "KAWIN", kkIdx: 10, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404014101750022", nama: "Sunarti", tgl: "1975-01-01", jk: "P", ag: "Islam", pend: "SMA/SMK", pekj: "Ibu Rumah Tangga", kawin: "KAWIN", kkIdx: 10, statusH: "HIDUP", statusT: "TETAP" },
    { nik: "3404010505720023", nama: "Tukiman Subagyo", tgl: "1972-05-05", jk: "L", ag: "Islam", pend: "SMA/SMK", pekj: "Petani", kawin: "KAWIN", kkIdx: 11, statusH: "HIDUP", statusT: "TETAP" },
  ];

  const createdPenduduk = [];
  for (const p of pendudukSeedData) {
    const kkTarget = createdKK[p.kkIdx];
    const item = await prisma.penduduk.create({
      data: {
        nik: p.nik,
        nama: p.nama,
        tempatLahir: "Sleman",
        tanggalLahir: new Date(p.tgl),
        jenisKelamin: p.jk,
        agama: p.ag,
        pendidikan: p.pend,
        pekerjaan: p.pekj,
        statusKawin: p.kawin,
        statusHidup: p.statusH,
        statusTinggal: p.statusT,
        kkId: kkTarget.id,
      },
    });
    createdPenduduk.push(item);
  }

  // 8. 10+ LaporanWarga
  const laporanSeedData = [
    {
      jenis: "BARU",
      status: "DIVERIFIKASI",
      rtIdx: 0,
      catatan: "Warga baru pindah dari Magelang",
      dataBaru: JSON.stringify({ nama: "Ahmad Dahlan", nik: "3404010101900021", tempatLahir: "Magelang", tanggalLahir: "1990-01-01", jenisKelamin: "L", agama: "Islam", pekerjaan: "Wiraswasta", noKK: "3404010101900000", alamatAsal: "Jl. Pemuda No 12 Magelang" }),
    },
    {
      jenis: "LAHIR",
      status: "PENDING",
      rtIdx: 0,
      catatan: "Kelahiran anak kedua di RS PKU Muhammadiyah",
      dataBaru: JSON.stringify({ namaBayi: "Anindya Raharjo", tanggalLahir: "2026-08-15", jenisKelamin: "P", tempatLahir: "Sleman", agama: "Islam", namaIbu: "Sri Lestari", namaAyah: "Slamet Raharjo", noKK: "3404010101800001", nikIbu: "3404014502850002" }),
    },
    {
      jenis: "PINDAH",
      status: "PENDING",
      rtIdx: 1,
      catatan: "Pindah domisili ke Jakarta karena tugas kerja",
      dataBaru: JSON.stringify({ namaPindah: "Suryono Saputra", nikPindah: "3404011507790009", alamatTujuan: "Kebayoran Baru, Jakarta Selatan", alasanPindah: "Pekerjaan" }),
    },
    {
      jenis: "MENINGGAL",
      status: "DIVERIFIKASI",
      rtIdx: 0,
      catatan: "Meninggal dunia usia lanjut",
      dataBaru: JSON.stringify({ namaMeninggal: "Mbok Suparni", nikMeninggal: "3404011211500006", tanggalMeninggal: "2026-07-20", penyebab: "Usia Lanjut" }),
    },
    {
      jenis: "BARU",
      status: "PENDING",
      rtIdx: 2,
      catatan: "Pindah masuk dari Bantul",
      dataBaru: JSON.stringify({ nama: "Bagas Pratama", nik: "3404010202950022", tempatLahir: "Bantul", tanggalLahir: "1995-02-02", jenisKelamin: "L", agama: "Islam", pekerjaan: "Karyawan Swasta", noKK: "3404010202950000" }),
    },
    {
      jenis: "LAHIR",
      status: "DIVERIFIKASI",
      rtIdx: 3,
      catatan: "Kelahiran bayi laki-laki",
      dataBaru: JSON.stringify({ namaBayi: "Gading Yulianto", tanggalLahir: "2026-05-10", jenisKelamin: "L", tempatLahir: "Sleman", agama: "Hindu", namaIbu: "Rina Astuti", namaAyah: "Eko Yulianto" }),
    },
    {
      jenis: "PINDAH",
      status: "DITOLAK",
      rtIdx: 4,
      catatan: "Berkas pengantar belum lengkap",
      dataBaru: JSON.stringify({ namaPindah: "Joko Susilo", nikPindah: "3404010909810017", alamatTujuan: "Sleman Kota", alasanPindah: "Lainnya" }),
    },
    {
      jenis: "BARU",
      status: "DIVERIFIKASI",
      rtIdx: 5,
      catatan: "Warga kontrak baru di Pondok 1",
      dataBaru: JSON.stringify({ nama: "Tri Utami", nik: "3404014404920023", tempatLahir: "Klaten", tanggalLahir: "1992-04-04", jenisKelamin: "P", agama: "Islam", pekerjaan: "Guru" }),
    },
    {
      jenis: "MENINGGAL",
      status: "PENDING",
      rtIdx: 2,
      catatan: "Laporan kematian warga Kemasan RT 01",
      dataBaru: JSON.stringify({ namaMeninggal: "Mbah Wiro", nikMeninggal: "3404010101400024", tanggalMeninggal: "2026-08-28", penyebab: "Sakit" }),
    },
    {
      jenis: "LAHIR",
      status: "PENDING",
      rtIdx: 5,
      catatan: "Kelahiran anak di Pondok 1",
      dataBaru: JSON.stringify({ namaBayi: "Rizky Hadiningrat", tanggalLahir: "2026-08-25", jenisKelamin: "L", tempatLahir: "Sleman", agama: "Islam", namaIbu: "Sunarti", namaAyah: "Suparno Hadiningrat" }),
    },
  ];

  for (const l of laporanSeedData) {
    const rtUser = rtUsers[l.rtIdx];
    await prisma.laporanWarga.create({
      data: {
        jenis: l.jenis,
        status: l.status,
        pelaporId: rtUser.id,
        wilayahId: rtUser.wilayahId,
        catatan: l.catatan,
        dataBaru: l.dataBaru,
        verifiedBy: l.status !== "PENDING" ? operatorUser.id : null,
        verifiedAt: l.status !== "PENDING" ? new Date() : null,
      },
    });
  }

  // 9. 10 UsulanPerubahan
  const usulanSeedData = [
    { rtIdx: 0, field: "UMUM", lama: "Slamet Raharjo | 3404011501800001", baru: "Perubahan Pekerjaan dari Petani ke Wiraswasta", alasan: "Yang bersangkutan sudah buka toko kelontong" },
    { rtIdx: 1, field: "UMUM", lama: "Bambang Kurniawan | 3404011004820007", baru: "Koreksi Pendidikan dari S1 ke S2", alasan: "Ijazah Magister sudah terbit" },
    { rtIdx: 2, field: "UMUM", lama: "Agus Harimurti | 3404011802830011", baru: "Perubahan Status Perkawinan", alasan: "Pembaruan Akta Nikah" },
    { rtIdx: 3, field: "UMUM", lama: "Eko Yulianto | 3404011111840014", baru: "Koreksi Ejaan Nama di KTP", alasan: "Sesuai Akta Kelahiran" },
    { rtIdx: 4, field: "UMUM", lama: "Joko Susilo | 3404010909810017", baru: "Pembaruan Alamat Rumah", alasan: "Penyesuaian nomor rumah baru" },
    { rtIdx: 5, field: "UMUM", lama: "Suparno Hadiningrat | 3404010101700021", baru: "Perubahan Golongan Darah", alasan: "Penyesuaian data BPJS" },
    { rtIdx: 0, field: "UMUM", lama: "Sri Lestari | 3404014502850002", baru: "Perubahan Pekerjaan", alasan: "Buka usaha katering mandiri" },
    { rtIdx: 1, field: "UMUM", lama: "Siti Rahmawati | 3404015009860008", baru: "Perubahan Agama", alasan: "Permohonan penyesuaian dokumen" },
    { rtIdx: 2, field: "UMUM", lama: "Dewi Persik | 3404015806870012", baru: "Koreksi Tanggal Lahir", alasan: "Ada selisih tanggal di ijazah" },
    { rtIdx: 5, field: "UMUM", lama: "Tukiman Subagyo | 3404010505720023", baru: "Penambahan Gelar", alasan: "Sertifikasi profesi tani" },
  ];

  for (const u of usulanSeedData) {
    const rtUser = rtUsers[u.rtIdx];
    await prisma.usulanPerubahan.create({
      data: {
        pengusulId: rtUser.id,
        field: u.field,
        nilaiLama: u.lama,
        nilaiBaru: u.baru,
        alasan: u.alasan,
        status: "PENDING",
      },
    });
  }

  // 10. DataBansos
  const bansosSeedData = [
    { pIdx: 0, jenis: "PKH", thn: 2024, sem: 1, nilai: 750000, ket: "Bantuan Program Keluarga Harapan Tahap 1" },
    { pIdx: 1, jenis: "BPNT", thn: 2024, sem: 1, nilai: 600000, ket: "Bantuan Pangan Non Tunai Sembako" },
    { pIdx: 3, jenis: "BLT", thn: 2024, sem: 1, nilai: 300000, ket: "BLT Dana Desa" },
    { pIdx: 6, jenis: "PKH", thn: 2024, sem: 1, nilai: 900000, ket: "PKH Kategori Lansia & Anak Sekolah" },
    { pIdx: 7, jenis: "BST", thn: 2024, sem: 2, nilai: 500000, ket: "Bantuan Sosial Tunai Kalurahan" },
    { pIdx: 10, jenis: "BPNT", thn: 2024, sem: 1, nilai: 600000, ket: "Bantuan Pangan" },
    { pIdx: 12, jenis: "BLT", thn: 2024, sem: 2, nilai: 300000, ket: "BLT Penanganan Kemiskinan Ekstrem" },
    { pIdx: 13, jenis: "PKH", thn: 2024, sem: 2, nilai: 750000, ket: "PKH Tahap 2" },
    { pIdx: 16, jenis: "BST", thn: 2024, sem: 1, nilai: 500000, ket: "Bantuan Tunai Mandiri" },
    { pIdx: 20, jenis: "BPNT", thn: 2024, sem: 2, nilai: 600000, ket: "BPNT Sembako Pondok 1" },
  ];

  for (const b of bansosSeedData) {
    const pend = createdPenduduk[b.pIdx];
    await prisma.dataBansos.create({
      data: {
        pendudukId: pend.id,
        jenisBansos: b.jenis,
        tahun: b.thn,
        semester: b.sem,
        nilaiManfaat: b.nilai,
        status: "AKTIF",
        keterangan: b.ket,
      },
    });
  }

  // 11. DataBPJS
  const bpjsSeedData = [
    { pIdx: 0, no: "0001234567891", kls: 3, jns: "PBI" },
    { pIdx: 1, no: "0001234567892", kls: 3, jns: "PBI" },
    { pIdx: 2, no: "0001234567893", kls: 3, jns: "PBI" },
    { pIdx: 3, no: "0001234567894", kls: 1, jns: "PPU" },
    { pIdx: 4, no: "0001234567895", kls: 2, jns: "MANDIRI" },
    { pIdx: 6, no: "0001234567896", kls: 1, jns: "PPU" },
    { pIdx: 7, no: "0001234567897", kls: 2, jns: "MANDIRI" },
    { pIdx: 10, no: "0001234567898", kls: 3, jns: "PBI" },
    { pIdx: 13, no: "0001234567899", kls: 3, jns: "PBI" },
    { pIdx: 20, no: "0001234567901", kls: 1, jns: "PPU" },
  ];

  for (const bp of bpjsSeedData) {
    const pend = createdPenduduk[bp.pIdx];
    await prisma.dataBPJS.create({
      data: {
        pendudukId: pend.id,
        noKartu: bp.no,
        kelas: bp.kls,
        jenis: bp.jns,
        status: "AKTIF",
      },
    });
  }

  // 12. Rekap (6 Dukuh)
  for (let i = 0; i < dukuhUsers.length; i++) {
    const dukuhUser = dukuhUsers[i];
    await prisma.rekap.create({
      data: {
        wilayahId: dukuhUser.wilayahId,
        bulan: 1,
        tahun: 2024,
        jenis: "PENDUDUK",
        data: JSON.stringify({ totalJiwa: 300 + i * 20, totalKK: 85 + i * 5, lahir: 2, meninggal: 1 }),
        dibuatOleh: dukuhUser.id,
      },
    });
    await prisma.rekap.create({
      data: {
        wilayahId: dukuhUser.wilayahId,
        bulan: 2,
        tahun: 2024,
        jenis: "BANSOS",
        data: JSON.stringify({ penerimaPKH: 20 + i * 2, penerimaBPNT: 35 + i * 3, totalManfaat: 40000000 + i * 2000000 }),
        dibuatOleh: dukuhUser.id,
      },
    });
  }

  console.log("✅ Seeding selesai! Total 13 Akun Dibuat (1 Operator, 6 Dukuh, 6 RT):");
  console.log("  1. Operator  → username: operator       | password: operator123");
  console.log("  2. Dukuh     → username: ngalian        | password: ngalian123");
  console.log("  3. Dukuh     → username: kalijeruk2     | password: kalijeruk2123");
  console.log("  4. Dukuh     → username: kemasan        | password: kemasan123");
  console.log("  5. Dukuh     → username: klancingan     | password: klancingan123");
  console.log("  6. Dukuh     → username: kwadungan      | password: kwadungan123");
  console.log("  7. Dukuh     → username: pondok1        | password: pondok1123");
  console.log("  8. RT        → username: rt_ngalian     | password: rt_ngalian123");
  console.log("  9. RT        → username: rt_kalijeruk2  | password: rt_kalijeruk2123");
  console.log(" 10. RT        → username: rt_kemasan     | password: rt_kemasan123");
  console.log(" 11. RT        → username: rt_klancingan  | password: rt_klancingan123");
  console.log(" 12. RT        → username: rt_kwadungan   | password: rt_kwadungan123");
  console.log(" 13. RT        → username: rt_pondok1     | password: rt_pondok1123");
}

main()
  .then(async () => { await prisma.$disconnect(); })
  .catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); });
