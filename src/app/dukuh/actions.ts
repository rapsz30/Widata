"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import type { AnggotaKK } from "./kk/kkOcrParser";

// ─── Helpers tanggal ──────────────────────────────────────────────────────────

function parseTanggal(str: string): Date | null {
  if (!str) return null;
  // Format DD-MM-YYYY atau DD/MM/YYYY
  const m = str.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const dt = new Date(Number(y), Number(mo) - 1, Number(d));
  return isNaN(dt.getTime()) ? null : dt;
}

// ─── Tambah KK + Anggota (dari OCR atau manual) ───────────────────────────────

export async function simpanKKDenganAnggota(
  kkInput: {
    noKK: string;
    kepalaKeluarga: string;
    alamat: string;
    wilayahId: string;
  },
  anggotaList: AnggotaKK[]
): Promise<{ success: boolean; error?: string }> {
  if (!kkInput.kepalaKeluarga.trim()) {
    return { success: false, error: "Nama Kepala Keluarga wajib diisi." };
  }
  if (anggotaList.length === 0) {
    return { success: false, error: "Minimal 1 anggota keluarga." };
  }

  // Cek No KK duplikat jika ada
  if (kkInput.noKK) {
    const existing = await prisma.kartuKeluarga.findUnique({ where: { noKK: kkInput.noKK } });
    if (existing) {
      return { success: false, error: `No. KK "${kkInput.noKK}" sudah terdaftar.` };
    }
  }

  // Cek NIK duplikat
  const niks = anggotaList.map((a) => a.nik).filter((n) => n.length === 16);
  for (const nik of niks) {
    const existing = await prisma.penduduk.findUnique({ where: { nik } });
    if (existing) {
      return { success: false, error: `NIK ${nik} sudah terdaftar atas nama "${existing.nama}".` };
    }
  }

  // Buat KK
  const kk = await prisma.kartuKeluarga.create({
    data: {
      noKK: kkInput.noKK || `TEMP-${Date.now()}`, // sementara jika kosong
      kepalaKeluarga: kkInput.kepalaKeluarga.trim(),
      alamat: kkInput.alamat.trim(),
      wilayahId: kkInput.wilayahId,
    },
  });

  // Buat semua anggota
  const statusKawinMap: Record<string, string> = {
    BELUM_KAWIN: "BELUM_KAWIN",
    KAWIN: "KAWIN",
    CERAI_HIDUP: "CERAI_HIDUP",
    CERAI_MATI: "CERAI_MATI",
  };

  for (const a of anggotaList) {
    if (!a.nama.trim()) continue; // skip anggota tanpa nama

    const tgl = parseTanggal(a.tanggalLahir);
    await prisma.penduduk.create({
      data: {
        nik: a.nik && a.nik.length === 16 ? a.nik : `TEMP-${Date.now()}-${Math.random()}`,
        nama: a.nama.trim(),
        tempatLahir: a.tempatLahir || "",
        tanggalLahir: tgl ?? new Date("2000-01-01"),
        jenisKelamin: a.jenisKelamin === "P" ? "P" : "L",
        agama: a.agama || "Islam",
        pendidikan: a.pendidikan || "Tidak/Belum Sekolah",
        pekerjaan: a.pekerjaan || "Belum/Tidak Bekerja",
        statusKawin: (statusKawinMap[a.statusKawin] ?? "BELUM_KAWIN") as any,
        kkId: kk.id,
      },
    });
  }

  revalidatePath("/dukuh/kk");
  revalidatePath("/dukuh/penduduk");
  return { success: true };
}

// ─── Tambah Penduduk ke KK yang sudah ada ────────────────────────────────────

export async function tambahPendudukKeKK(
  kkId: string,
  data: {
    nik: string;
    nama: string;
    tempatLahir: string;
    tanggalLahir: string;
    jenisKelamin: "L" | "P";
    agama: string;
    pendidikan: string;
    pekerjaan: string;
    statusKawin: string;
  }
): Promise<{ success: boolean; error?: string }> {
  if (!data.nama.trim()) return { success: false, error: "Nama wajib diisi." };

  if (data.nik && data.nik.length === 16) {
    const existing = await prisma.penduduk.findUnique({ where: { nik: data.nik } });
    if (existing) {
      return { success: false, error: `NIK ${data.nik} sudah terdaftar.` };
    }
  }

  const tgl = parseTanggal(data.tanggalLahir);
  await prisma.penduduk.create({
    data: {
      nik: data.nik && data.nik.length === 16 ? data.nik : `TEMP-${Date.now()}`,
      nama: data.nama.trim(),
      tempatLahir: data.tempatLahir || "",
      tanggalLahir: tgl ?? new Date("2000-01-01"),
      jenisKelamin: data.jenisKelamin,
      agama: data.agama || "Islam",
      pendidikan: data.pendidikan || "Tidak/Belum Sekolah",
      pekerjaan: data.pekerjaan || "Belum/Tidak Bekerja",
      statusKawin: (data.statusKawin ?? "BELUM_KAWIN") as any,
      kkId,
    },
  });

  revalidatePath("/dukuh/penduduk");
  revalidatePath("/dukuh/kk");
  return { success: true };
}

// ─── Verifikasi laporan dari RT ───────────────────────────────────────────────

export async function verifikasiLaporan(
  laporanId: string,
  status: "DIVERIFIKASI" | "DITOLAK"
) {
  const laporan = await prisma.laporanWarga.findUnique({
    where: { id: laporanId },
    include: { penduduk: true },
  });
  if (!laporan) return;

  await prisma.laporanWarga.update({
    where: { id: laporanId },
    data: { status, verifiedAt: new Date() },
  });

  if (status === "DIVERIFIKASI" && laporan.penduduk) {
    if (laporan.jenis === "PINDAH") {
      await prisma.penduduk.update({
        where: { id: laporan.penduduk.id },
        data: { statusTinggal: "PINDAH" },
      });
    } else if (laporan.jenis === "MENINGGAL") {
      await prisma.penduduk.update({
        where: { id: laporan.penduduk.id },
        data: { statusHidup: "MENINGGAL" },
      });
    }
  }

  revalidatePath("/dukuh/verifikasi");
  revalidatePath("/dukuh");
}

// ─── Tambah penduduk manual (dari form Dukuh) ─────────────────────────────────

export async function tambahPenduduk(_: any, formData: FormData) {
  const session = await auth();
  const user = session?.user as any;

  const nama = formData.get("nama")?.toString().trim() ?? "";
  const nik = formData.get("nik")?.toString().trim() ?? "";
  const kkId = formData.get("kkId")?.toString() ?? "";

  if (!nama) return { success: false, error: "Nama wajib diisi." };
  if (!kkId) return { success: false, error: "KK wajib dipilih." };

  const tgl = parseTanggal(formData.get("tanggalLahir")?.toString() ?? "");

  await prisma.penduduk.create({
    data: {
      nik: nik.length === 16 ? nik : `TEMP-${Date.now()}`,
      nama,
      tempatLahir: formData.get("tempatLahir")?.toString() ?? "",
      tanggalLahir: tgl ?? new Date("2000-01-01"),
      jenisKelamin: (formData.get("jenisKelamin")?.toString() ?? "L") as "L" | "P",
      agama: formData.get("agama")?.toString() ?? "Islam",
      pendidikan: formData.get("pendidikan")?.toString() ?? "Tidak/Belum Sekolah",
      pekerjaan: formData.get("pekerjaan")?.toString() ?? "Belum/Tidak Bekerja",
      statusKawin: (formData.get("statusKawin")?.toString() ?? "BELUM_KAWIN") as any,
      kkId,
    },
  });

  revalidatePath("/dukuh/penduduk");
  revalidatePath("/dukuh/kk");
  return { success: true };
}
