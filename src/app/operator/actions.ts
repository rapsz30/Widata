"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export type TambahAkunResult =
  | { success: true }
  | { success: false; error: string };

export async function tambahAkun(
  _: TambahAkunResult | null,
  formData: FormData
): Promise<TambahAkunResult> {
  const nama = formData.get("nama")?.toString().trim() ?? "";
  const username = formData.get("username")?.toString().trim() ?? "";
  const password = formData.get("password")?.toString() ?? "";
  const role = formData.get("role")?.toString() ?? "";
  const wilayahId = formData.get("wilayahId")?.toString() || null;

  // Validasi
  if (!nama || !username || !password || !role) {
    return { success: false, error: "Semua field wajib diisi." };
  }
  if (password.length < 6) {
    return { success: false, error: "Password minimal 6 karakter." };
  }
  if (!/^[a-z0-9_]+$/.test(username)) {
    return {
      success: false,
      error: "Username hanya boleh huruf kecil, angka, dan underscore.",
    };
  }
  if ((role === "RT" || role === "DUKUH") && !wilayahId) {
    return { success: false, error: "Wilayah wajib dipilih untuk role RT/Dukuh." };
  }

  // Cek username duplikat
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    return { success: false, error: `Username "${username}" sudah digunakan.` };
  }

  const hashed = await bcrypt.hash(password, 10);

  await prisma.user.create({
    data: {
      nama,
      username,
      password: hashed,
      role: role as "RT" | "DUKUH" | "OPERATOR",
      wilayahId: wilayahId || undefined,
    },
  });

  revalidatePath("/operator/akun");
  return { success: true };
}

export async function toggleAktifAkun(userId: string, aktif: boolean) {
  await prisma.user.update({
    where: { id: userId },
    data: { aktif },
  });
  revalidatePath("/operator/akun");
}

