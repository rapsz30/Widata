/**
 * Parser teks hasil OCR dari Kartu Keluarga Indonesia.
 * Mengekstrak data terstruktur dari teks bebas hasil Tesseract.
 */

export interface AnggotaKK {
  nik: string;
  nama: string;
  tempatLahir: string;
  tanggalLahir: string; // "DD-MM-YYYY" atau "DD/MM/YYYY"
  jenisKelamin: "L" | "P";
  agama: string;
  pendidikan: string;
  pekerjaan: string;
  statusKawin: string;
  hubungan: string; // "KEPALA KELUARGA", "ISTRI", "ANAK", dll
  kewarganegaraan: string;
}

export interface HasilParseKK {
  noKK: string;
  namaKepala: string;
  alamat: string;
  rt: string;
  rw: string;
  kelurahan: string;
  kecamatan: string;
  kabupaten: string;
  provinsi: string;
  anggota: AnggotaKK[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function bersihkanTeks(t: string): string {
  return t.replace(/\s+/g, " ").trim();
}

function ambilSetelahLabel(text: string, ...labels: string[]): string {
  for (const label of labels) {
    const re = new RegExp(label + "[:\\s]+([^\\n]+)", "i");
    const m = text.match(re);
    if (m) return bersihkanTeks(m[1]);
  }
  return "";
}

function normalisiJK(s: string): "L" | "P" {
  const u = s.toUpperCase();
  if (u.includes("PEREMPUAN") || u === "P" || u.includes("WANITA")) return "P";
  return "L";
}

function normalisiStatusKawin(s: string): string {
  const u = s.toUpperCase();
  if (u.includes("BELUM") || u === "BK") return "BELUM_KAWIN";
  if (u.includes("CERAI MATI")) return "CERAI_MATI";
  if (u.includes("CERAI HIDUP")) return "CERAI_HIDUP";
  if (u.includes("KAWIN") || u === "K") return "KAWIN";
  return "BELUM_KAWIN";
}

function normalisiAgama(s: string): string {
  const u = s.toUpperCase().trim();
  if (u.includes("ISLAM")) return "Islam";
  if (u.includes("KRISTEN PROT") || u.includes("PROTESTAN")) return "Kristen Protestan";
  if (u.includes("KRISTEN KAT") || u.includes("KATOLIK")) return "Kristen Katolik";
  if (u.includes("HINDU")) return "Hindu";
  if (u.includes("BUDHA") || u.includes("BUDDHA")) return "Buddha";
  if (u.includes("KONGHUCU")) return "Konghucu";
  return s || "Islam";
}

function normalisiPendidikan(s: string): string {
  const u = s.toUpperCase().trim();
  if (u.includes("TIDAK") || u.includes("BELUM")) return "Tidak/Belum Sekolah";
  if (u.includes("SD") || u.includes("SEKOLAH DASAR")) return "SD";
  if (u.includes("SMP") || u.includes("TSANAWIYAH")) return "SMP";
  if (u.includes("SMA") || u.includes("SMK") || u.includes("ALIYAH")) return "SMA/SMK";
  if (u.includes("D1") || u.includes("D2") || u.includes("D3") || u.includes("DIPLOMA")) return "Diploma";
  if (u.includes("S1") || u.includes("SARJANA")) return "S1";
  if (u.includes("S2") || u.includes("MAGISTER")) return "S2";
  if (u.includes("S3") || u.includes("DOKTOR")) return "S3";
  return s || "Tidak/Belum Sekolah";
}

// ─── Parser NIK (16 digit) ───────────────────────────────────────────────────

function ekstrakNIK(baris: string): string {
  const m = baris.match(/\b\d{16}\b/);
  return m ? m[0] : "";
}

// ─── Parser tanggal lahir ─────────────────────────────────────────────────────

function ekstrakTanggalLahir(baris: string): { tempat: string; tanggal: string } {
  // Format: "KOTA, DD-MM-YYYY" atau "KOTA, DD/MM/YYYY"
  const m = baris.match(/([A-Za-z\s]+)[,\s]+(\d{1,2}[-/]\d{1,2}[-/]\d{4})/);
  if (m) {
    return {
      tempat: bersihkanTeks(m[1]),
      tanggal: m[2].replace(/\//g, "-"),
    };
  }
  // Coba hanya tanggal
  const m2 = baris.match(/(\d{1,2}[-/]\d{1,2}[-/]\d{4})/);
  return { tempat: "", tanggal: m2 ? m2[1].replace(/\//g, "-") : "" };
}

// ─── Parser tabel anggota ─────────────────────────────────────────────────────

/**
 * KK standar Indonesia mempunyai tabel dengan baris per anggota.
 * Kolom: No | NIK | Nama | TTL | JK | Agama | Pendidikan | Pekerjaan | Status Kawin | Hubungan | Kewarganegaraan | Nama Ayah | Nama Ibu
 *
 * Tesseract menghasilkan teks baris per baris; kita parse berdasarkan pola NIK 16 digit.
 */
function parseAnggota(text: string): AnggotaKK[] {
  const anggota: AnggotaKK[] = [];
  const baris = text.split("\n").map((l) => l.trim()).filter(Boolean);

  // Kumpulkan token setiap blok yang diawali NIK
  let i = 0;
  while (i < baris.length) {
    const nik = ekstrakNIK(baris[i]);
    if (nik.length === 16) {
      // Kumpulkan beberapa baris berikutnya sebagai konteks anggota ini
      const blok = baris.slice(i, i + 12).join(" ");

      const ttl = ekstrakTanggalLahir(blok);

      // Coba parse JK
      const jkMatch = blok.match(/\b(LAKI-LAKI|PEREMPUAN|L|P)\b/i);
      const jk = normalisiJK(jkMatch ? jkMatch[1] : "L");

      // Agama
      const agamaMatch = blok.match(/\b(ISLAM|KRISTEN|KATOLIK|HINDU|BUDHA|BUDDHA|KONGHUCU)\b/i);

      // Pendidikan
      const pendidikanMatch = blok.match(
        /\b(SD|SMP|SMA|SMK|DIPLOMA|S1|S2|S3|SARJANA|TIDAK\s+SEKOLAH|BELUM\s+SEKOLAH|SLTA|SLTP)\b/i
      );

      // Status kawin
      const statusMatch = blok.match(/\b(BELUM KAWIN|KAWIN|CERAI HIDUP|CERAI MATI)\b/i);

      // Hubungan
      const hubunganMatch = blok.match(
        /\b(KEPALA KELUARGA|ISTRI|SUAMI|ANAK|MENANTU|CUCU|ORANG TUA|MERTUA|FAMILI LAIN|PEMBANTU|LAINNYA)\b/i
      );

      // Nama: ambil dari baris setelah NIK, sebelum TTL
      let nama = "";
      if (i + 1 < baris.length) {
        const namaCandidate = baris[i + 1];
        // Nama tidak mengandung angka dan cukup panjang
        if (!/\d/.test(namaCandidate) && namaCandidate.length > 2) {
          nama = bersihkanTeks(namaCandidate);
        }
      }

      anggota.push({
        nik,
        nama,
        tempatLahir: ttl.tempat,
        tanggalLahir: ttl.tanggal,
        jenisKelamin: jk,
        agama: normalisiAgama(agamaMatch ? agamaMatch[1] : "Islam"),
        pendidikan: normalisiPendidikan(pendidikanMatch ? pendidikanMatch[0] : ""),
        pekerjaan: "",
        statusKawin: normalisiStatusKawin(statusMatch ? statusMatch[1] : ""),
        hubungan: hubunganMatch ? hubunganMatch[1].toUpperCase() : "ANAK",
        kewarganegaraan: "WNI",
      });
      i += 8; // Lewati blok anggota ini
    } else {
      i++;
    }
  }

  return anggota;
}

// ─── Main parser ──────────────────────────────────────────────────────────────

export function parseKKText(text: string): HasilParseKK {
  const lines = text.split("\n").map((l) => l.trim());
  const full = text;

  // No KK (16 digit setelah label "Nomor KK" atau di awal dokumen)
  const noKKMatch = full.match(/(?:Nomor KK|No\.?\s*KK)[:\s]*(\d{16})/i) ||
    full.match(/^(\d{16})/m);
  const noKK = noKKMatch ? noKKMatch[1] : "";

  // Nama KK / Kepala Keluarga
  const namaKepala =
    ambilSetelahLabel(full, "Nama Kepala Keluarga", "Kepala Keluarga", "Nama KK") ||
    ambilSetelahLabel(full, "Nama");

  // Alamat
  const alamat = ambilSetelahLabel(full, "Alamat", "Jalan");
  const rt = ambilSetelahLabel(full, "RT");
  const rw = ambilSetelahLabel(full, "RW");
  const kelurahan = ambilSetelahLabel(full, "Kelurahan", "Desa");
  const kecamatan = ambilSetelahLabel(full, "Kecamatan");
  const kabupaten = ambilSetelahLabel(full, "Kabupaten", "Kota");
  const provinsi = ambilSetelahLabel(full, "Provinsi");

  // Anggota
  const anggota = parseAnggota(text);

  return {
    noKK,
    namaKepala,
    alamat,
    rt,
    rw,
    kelurahan,
    kecamatan,
    kabupaten,
    provinsi,
    anggota,
  };
}

