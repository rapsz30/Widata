-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "wilayahId" TEXT,
    "aktif" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Wilayah" (
    "id" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "kode" TEXT,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Wilayah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KartuKeluarga" (
    "id" TEXT NOT NULL,
    "noKK" TEXT NOT NULL,
    "kepalaKeluarga" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KartuKeluarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Penduduk" (
    "id" TEXT NOT NULL,
    "nik" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "tempatLahir" TEXT NOT NULL,
    "tanggalLahir" TIMESTAMP(3) NOT NULL,
    "jenisKelamin" TEXT NOT NULL,
    "agama" TEXT NOT NULL,
    "pendidikan" TEXT NOT NULL,
    "pekerjaan" TEXT NOT NULL,
    "statusKawin" TEXT NOT NULL,
    "statusHidup" TEXT NOT NULL DEFAULT 'HIDUP',
    "statusTinggal" TEXT NOT NULL DEFAULT 'TETAP',
    "kkId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Penduduk_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LaporanWarga" (
    "id" TEXT NOT NULL,
    "jenis" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "pendudukId" TEXT,
    "pelaporId" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "catatan" TEXT,
    "dataBaru" TEXT,
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LaporanWarga_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UsulanPerubahan" (
    "id" TEXT NOT NULL,
    "pendudukId" TEXT,
    "pengusulId" TEXT NOT NULL,
    "field" TEXT NOT NULL,
    "nilaiLama" TEXT NOT NULL,
    "nilaiBaru" TEXT NOT NULL,
    "alasan" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "verifiedBy" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsulanPerubahan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataBansos" (
    "id" TEXT NOT NULL,
    "pendudukId" TEXT NOT NULL,
    "jenisBansos" TEXT NOT NULL,
    "tahun" INTEGER NOT NULL,
    "semester" INTEGER NOT NULL,
    "nilaiManfaat" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "keterangan" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataBansos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DataBPJS" (
    "id" TEXT NOT NULL,
    "pendudukId" TEXT NOT NULL,
    "noKartu" TEXT NOT NULL,
    "kelas" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'AKTIF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DataBPJS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Rekap" (
    "id" TEXT NOT NULL,
    "wilayahId" TEXT NOT NULL,
    "bulan" INTEGER NOT NULL,
    "tahun" INTEGER NOT NULL,
    "jenis" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "dibuatOleh" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Rekap_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE UNIQUE INDEX "KartuKeluarga_noKK_key" ON "KartuKeluarga"("noKK");

-- CreateIndex
CREATE UNIQUE INDEX "Penduduk_nik_key" ON "Penduduk"("nik");

-- CreateIndex
CREATE UNIQUE INDEX "DataBPJS_noKartu_key" ON "DataBPJS"("noKartu");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Wilayah" ADD CONSTRAINT "Wilayah_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Wilayah"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KartuKeluarga" ADD CONSTRAINT "KartuKeluarga_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Penduduk" ADD CONSTRAINT "Penduduk_kkId_fkey" FOREIGN KEY ("kkId") REFERENCES "KartuKeluarga"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanWarga" ADD CONSTRAINT "LaporanWarga_pelaporId_fkey" FOREIGN KEY ("pelaporId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanWarga" ADD CONSTRAINT "LaporanWarga_pendudukId_fkey" FOREIGN KEY ("pendudukId") REFERENCES "Penduduk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LaporanWarga" ADD CONSTRAINT "LaporanWarga_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsulanPerubahan" ADD CONSTRAINT "UsulanPerubahan_pendudukId_fkey" FOREIGN KEY ("pendudukId") REFERENCES "Penduduk"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UsulanPerubahan" ADD CONSTRAINT "UsulanPerubahan_pengusulId_fkey" FOREIGN KEY ("pengusulId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataBansos" ADD CONSTRAINT "DataBansos_pendudukId_fkey" FOREIGN KEY ("pendudukId") REFERENCES "Penduduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DataBPJS" ADD CONSTRAINT "DataBPJS_pendudukId_fkey" FOREIGN KEY ("pendudukId") REFERENCES "Penduduk"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rekap" ADD CONSTRAINT "Rekap_dibuatOleh_fkey" FOREIGN KEY ("dibuatOleh") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Rekap" ADD CONSTRAINT "Rekap_wilayahId_fkey" FOREIGN KEY ("wilayahId") REFERENCES "Wilayah"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

