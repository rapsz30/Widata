"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

// ─── Laporan Warga (Baru / Pindah / Meninggal) ───────────────────────────────

export async function buatLaporanWarga(formData: FormData) {
  const session = await auth();
  if (!session || (session.user as any).role !== "RT") throw new Error("Unauthorized");

  const user = session.user as any;
  const jenis = formData.get("jenis") as string;
  const catatan = formData.get("catatan") as string;
  const dokumenUrl = formData.get("dokumenUrl") as string;

  if (jenis === "BARU") {
    const dataBaru = {
      nama: formData.get("nama"),
      nik: formData.get("nik"),
      tempatLahir: formData.get("tempatLahir"),
      tanggalLahir: formData.get("tanggalLahir"),
      jenisKelamin: formData.get("jenisKelamin"),
      agama: formData.get("agama"),
      pekerjaan: formData.get("pekerjaan"),
      noKK: formData.get("noKK"),
      alamatAsal: formData.get("alamatAsal"),
      dokumenUrl,
    };

    await prisma.laporanWarga.create({
      data: {
        jenis: "BARU",
        pelaporId: user.id,
        wilayahId: user.wilayahId,
        catatan,
        dataBaru: JSON.stringify(dataBaru),
      },
    });
  } else if (jenis === "PINDAH") {
    const dataBaru = {
      namaPindah: formData.get("namaPindah"),
      nikPindah: formData.get("nikPindah"),
      alamatTujuan: formData.get("alamatTujuan"),
      alasanPindah: formData.get("alasanPindah"),
      dokumenUrl,
    };

    await prisma.laporanWarga.create({
      data: {
        jenis: "PINDAH",
        pelaporId: user.id,
        wilayahId: user.wilayahId,
        catatan,
        dataBaru: JSON.stringify(dataBaru),
      },
    });
  } else if (jenis === "MENINGGAL") {
    const dataBaru = {
      namaMeninggal: formData.get("namaMeninggal"),
      nikMeninggal: formData.get("nikMeninggal"),
      tanggalMeninggal: formData.get("tanggalMeninggal"),
      penyebab: formData.get("penyebab"),
      dokumenUrl,
    };

    await prisma.laporanWarga.create({
      data: {
        jenis: "MENINGGAL",
        pelaporId: user.id,
        wilayahId: user.wilayahId,
        catatan,
        dataBaru: JSON.stringify(dataBaru),
      },
    });
  } else if (jenis === "LAHIR") {
    const dataBaru = {
      namaBayi: formData.get("namaBayi"),
      tanggalLahir: formData.get("tanggalLahir"),
      jenisKelamin: formData.get("jenisKelamin"),
      tempatLahir: formData.get("tempatLahir"),
      agama: formData.get("agama"),
      namaIbu: formData.get("namaIbu"),
      namaAyah: formData.get("namaAyah"),
      noKK: formData.get("noKK"),
      nikIbu: formData.get("nikIbu"),
      dokumenUrl,
    };

    await prisma.laporanWarga.create({
      data: {
        jenis: "LAHIR",
        pelaporId: user.id,
        wilayahId: user.wilayahId,
        catatan,
        dataBaru: JSON.stringify(dataBaru),
      },
    });
  } else {
    const pendudukId = formData.get("pendudukId") as string;
    await prisma.laporanWarga.create({
      data: {
        jenis,
        pelaporId: user.id,
        wilayahId: user.wilayahId,
        pendudukId: pendudukId || null,
        catatan,
      },
    });
  }

  revalidatePath("/rt");
  revalidatePath("/rt/laporan");
  redirect("/rt");
}

// ─── Usulan Perubahan Data (bebas teks) ───────────────────────────────────────

export async function buatUsulan(
  _: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session || (session.user as any).role !== "RT") {
    return { success: false, error: "Tidak diizinkan." };
  }

  const user = session.user as any;
  const nama = formData.get("nama")?.toString().trim() ?? "";
  const nik = formData.get("nik")?.toString().trim() ?? "";
  const perihal = formData.get("perihal")?.toString().trim() ?? "";
  const keterangan = formData.get("keterangan")?.toString().trim() ?? "";

  if (!perihal) return { success: false, error: "Perihal perubahan wajib diisi." };

  // Simpan sebagai usulan bebas — field = "UMUM", nilaiLama = NIK+nama, nilaiBaru = perihal
  await prisma.usulanPerubahan.create({
    data: {
      pengusulId: user.id,
      pendudukId: null,
      field: "UMUM",
      nilaiLama: [nama, nik].filter(Boolean).join(" | "),
      nilaiBaru: perihal,
      alasan: keterangan,
    },
  });

  revalidatePath("/rt/usulan");
  return { success: true };
}

// ─── Catat Bantuan Sosial (dipakai di modal) ──────────────────────────────────

export async function catatBantuan(
  _: { success: boolean; error?: string } | null,
  formData: FormData
): Promise<{ success: boolean; error?: string }> {
  const session = await auth();
  if (!session || (session.user as any).role !== "RT") {
    return { success: false, error: "Tidak diizinkan." };
  }

  const pendudukId = formData.get("pendudukId")?.toString() ?? "";
  if (!pendudukId) return { success: false, error: "Pilih penerima bantuan." };

  await prisma.dataBansos.create({
    data: {
      pendudukId,
      jenisBansos: formData.get("jenisBansos") as string,
      tahun: parseInt(formData.get("tahun") as string),
      semester: parseInt(formData.get("semester") as string),
      nilaiManfaat: parseInt(formData.get("nilaiManfaat") as string),
      keterangan: (formData.get("keterangan") as string) || undefined,
    },
  });

  revalidatePath("/rt/bansos");
  return { success: true };
}
