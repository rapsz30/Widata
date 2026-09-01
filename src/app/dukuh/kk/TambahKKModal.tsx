"use client";

import { useState, useRef, useCallback, useTransition } from "react";
import { X, Upload, Loader2, CheckCircle, AlertCircle, FileText, Plus, Trash2, ChevronRight } from "lucide-react";
import { parseKKText, type HasilParseKK, type AnggotaKK } from "./kkOcrParser";
import { simpanKKDenganAnggota } from "../actions";

// ─── Types ────────────────────────────────────────────────────────────────────

type Langkah = 1 | 2 | 3 | 4;

interface TambahKKModalProps {
  wilayahId: string;
}

// ─── Konstanta ────────────────────────────────────────────────────────────────

const HUBUNGAN_OPTIONS = [
  "KEPALA KELUARGA", "ISTRI", "SUAMI", "ANAK",
  "MENANTU", "CUCU", "ORANG TUA", "MERTUA",
  "FAMILI LAIN", "LAINNYA",
];

const AGAMA_OPTIONS = ["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Konghucu"];

const PENDIDIKAN_OPTIONS = [
  "Tidak/Belum Sekolah", "SD", "SMP", "SMA/SMK",
  "Diploma", "S1", "S2", "S3",
];

const PEKERJAAN_OPTIONS = [
  "Petani", "Pedagang", "PNS", "TNI/POLRI", "Wiraswasta",
  "Buruh", "Karyawan Swasta", "Ibu Rumah Tangga", "Pelajar",
  "Pensiunan", "Belum/Tidak Bekerja",
];

// ─── Komponen Baris Anggota ───────────────────────────────────────────────────

function BarisTambahAnggota({
  idx,
  data,
  onChange,
  onRemove,
  isFirst,
}: {
  idx: number;
  data: AnggotaKK;
  onChange: (idx: number, field: keyof AnggotaKK, val: string) => void;
  onRemove: (idx: number) => void;
  isFirst: boolean;
}) {
  const [expanded, setExpanded] = useState(idx === 0);

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden">
      {/* Header baris */}
      <div
        className="flex items-center justify-between px-4 py-2.5 bg-gray-50 cursor-pointer"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs font-bold text-gray-400 w-5">#{idx + 1}</span>
          <span className="font-medium text-gray-800 text-sm truncate">
            {data.nama || "(Nama belum diisi)"}
          </span>
          {data.hubungan && (
            <span className="badge bg-primary-100 text-primary-700 text-xs hidden sm:inline">
              {data.hubungan}
            </span>
          )}
          {data.nik && (
            <span className="text-xs text-gray-400 font-mono hidden lg:inline">{data.nik}</span>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          {!isFirst && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); onRemove(idx); }}
              className="p-1 text-red-400 hover:text-red-600 hover:bg-red-50 rounded"
            >
              <Trash2 size={14} />
            </button>
          )}
          <ChevronRight
            size={14}
            className={`text-gray-400 transition-transform ${expanded ? "rotate-90" : ""}`}
          />
        </div>
      </div>

      {/* Form detail */}
      {expanded && (
        <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className="label text-xs">NIK (16 digit)</label>
            <input
              type="text"
              value={data.nik}
              onChange={(e) => onChange(idx, "nik", e.target.value)}
              placeholder="3404XXXXXXXXXXXX"
              maxLength={16}
              className="input-field font-mono"
            />
          </div>
          <div className="sm:col-span-2">
            <label className="label text-xs">Nama Lengkap</label>
            <input
              type="text"
              value={data.nama}
              onChange={(e) => onChange(idx, "nama", e.target.value)}
              placeholder="Nama sesuai KK"
              className="input-field"
              required
            />
          </div>
          <div>
            <label className="label text-xs">Tempat Lahir</label>
            <input
              type="text"
              value={data.tempatLahir}
              onChange={(e) => onChange(idx, "tempatLahir", e.target.value)}
              placeholder="Kota"
              className="input-field"
            />
          </div>
          <div>
            <label className="label text-xs">Tanggal Lahir</label>
            <input
              type="text"
              value={data.tanggalLahir}
              onChange={(e) => onChange(idx, "tanggalLahir", e.target.value)}
              placeholder="DD-MM-YYYY"
              className="input-field"
            />
          </div>
          <div>
            <label className="label text-xs">Jenis Kelamin</label>
            <select
              value={data.jenisKelamin}
              onChange={(e) => onChange(idx, "jenisKelamin", e.target.value)}
              className="input-field"
            >
              <option value="L">Laki-laki</option>
              <option value="P">Perempuan</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Hubungan dalam KK</label>
            <select
              value={data.hubungan}
              onChange={(e) => onChange(idx, "hubungan", e.target.value)}
              className="input-field"
            >
              {HUBUNGAN_OPTIONS.map((h) => (
                <option key={h} value={h}>{h}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Agama</label>
            <select
              value={data.agama}
              onChange={(e) => onChange(idx, "agama", e.target.value)}
              className="input-field"
            >
              {AGAMA_OPTIONS.map((a) => (
                <option key={a}>{a}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Status Perkawinan</label>
            <select
              value={data.statusKawin}
              onChange={(e) => onChange(idx, "statusKawin", e.target.value)}
              className="input-field"
            >
              <option value="BELUM_KAWIN">Belum Kawin</option>
              <option value="KAWIN">Kawin</option>
              <option value="CERAI_HIDUP">Cerai Hidup</option>
              <option value="CERAI_MATI">Cerai Mati</option>
            </select>
          </div>
          <div>
            <label className="label text-xs">Pendidikan</label>
            <select
              value={data.pendidikan}
              onChange={(e) => onChange(idx, "pendidikan", e.target.value)}
              className="input-field"
            >
              {PENDIDIKAN_OPTIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label text-xs">Pekerjaan</label>
            <select
              value={data.pekerjaan}
              onChange={(e) => onChange(idx, "pekerjaan", e.target.value)}
              className="input-field"
            >
              <option value="">— Pilih —</option>
              {PEKERJAAN_OPTIONS.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Helper: anggota kosong ───────────────────────────────────────────────────

function anggotaKosong(): AnggotaKK {
  return {
    nik: "", nama: "", tempatLahir: "", tanggalLahir: "",
    jenisKelamin: "L", agama: "Islam", pendidikan: "Tidak/Belum Sekolah",
    pekerjaan: "", statusKawin: "BELUM_KAWIN", hubungan: "ANAK",
    kewarganegaraan: "WNI",
  };
}

// ─── Modal Utama ──────────────────────────────────────────────────────────────

export function TambahKKModal({ wilayahId }: TambahKKModalProps) {
  const [open, setOpen] = useState(false);
  const [langkah, setLangkah] = useState<Langkah>(1);

  // Langkah 1 — upload
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  // Langkah 2 — OCR
  const [ocrProgress, setOcrProgress] = useState(0);
  const [ocrStatus, setOcrStatus] = useState("");
  const [ocrError, setOcrError] = useState("");

  // Langkah 3 — review
  const [kkData, setKKData] = useState<Omit<HasilParseKK, "anggota">>({
    noKK: "", namaKepala: "", alamat: "", rt: "", rw: "",
    kelurahan: "", kecamatan: "", kabupaten: "", provinsi: "",
  });
  const [anggota, setAnggota] = useState<AnggotaKK[]>([anggotaKosong()]);

  // Langkah 4 — simpan
  const [saving, startSave] = useTransition();
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  // ── Buka/tutup ──
  const tutup = () => {
    setOpen(false);
    setLangkah(1);
    setFile(null);
    setPreview("");
    setOcrProgress(0);
    setOcrError("");
    setSaveError("");
    setSaved(false);
    setAnggota([anggotaKosong()]);
    setKKData({ noKK: "", namaKepala: "", alamat: "", rt: "", rw: "", kelurahan: "", kecamatan: "", kabupaten: "", provinsi: "" });
  };

  // ── Pilih file ──
  const handleFile = useCallback((f: File) => {
    setFile(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files[0];
    if (f) handleFile(f);
  };

  // ── Langkah 2: OCR ──
  const jalankanOCR = async () => {
    if (!file) return;
    setLangkah(2);
    setOcrProgress(0);
    setOcrError("");

    try {
      let imageDataUrl = preview;

      // Jika PDF, render halaman pertama ke canvas menggunakan utility
      if (file.type === "application/pdf" || file.name.endsWith(".pdf")) {
        setOcrStatus("Membaca halaman PDF...");
        const { renderPDFToImage } = await import("@/lib/pdfRenderer");
        imageDataUrl = await renderPDFToImage(file, 2.0);
        setPreview(imageDataUrl);
      }

      // OCR dengan Tesseract
      setOcrStatus("Menginisialisasi mesin OCR...");
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("ind+eng", 1, {
        logger: (m: { status: string; progress: number }) => {
          if (m.status === "recognizing text") {
            setOcrProgress(Math.round(m.progress * 100));
            setOcrStatus(`Membaca teks... ${Math.round(m.progress * 100)}%`);
          } else {
            setOcrStatus(m.status);
          }
        },
      });

      const { data } = await worker.recognize(imageDataUrl);
      await worker.terminate();

      // Parse hasil
      setOcrStatus("Menganalisis data KK...");
      const hasil = parseKKText(data.text);

      setKKData({
        noKK: hasil.noKK,
        namaKepala: hasil.namaKepala,
        alamat: hasil.alamat,
        rt: hasil.rt,
        rw: hasil.rw,
        kelurahan: hasil.kelurahan,
        kecamatan: hasil.kecamatan,
        kabupaten: hasil.kabupaten,
        provinsi: hasil.provinsi,
      });

      if (hasil.anggota.length > 0) {
        setAnggota(hasil.anggota);
      } else {
        setAnggota([anggotaKosong()]);
      }

      setLangkah(3);
    } catch (err: any) {
      setOcrError(err?.message ?? "Terjadi kesalahan saat OCR.");
    }
  };

  // ── Ubah data anggota ──
  const ubahAnggota = (idx: number, field: keyof AnggotaKK, val: string) => {
    setAnggota((prev) => prev.map((a, i) => (i === idx ? { ...a, [field]: val } : a)));
  };

  const hapusAnggota = (idx: number) => {
    setAnggota((prev) => prev.filter((_, i) => i !== idx));
  };

  const tambahAnggota = () => {
    setAnggota((prev) => [...prev, anggotaKosong()]);
  };

  // ── Simpan ──
  const handleSimpan = () => {
    setSaveError("");
    startSave(async () => {
      const result = await simpanKKDenganAnggota(
        {
          noKK: kkData.noKK,
          kepalaKeluarga: kkData.namaKepala,
          alamat: [kkData.alamat, kkData.rt && `RT ${kkData.rt}`, kkData.rw && `RW ${kkData.rw}`]
            .filter(Boolean)
            .join(" "),
          wilayahId,
        },
        anggota
      );
      if (result.success) {
        setSaved(true);
        setTimeout(() => tutup(), 1500);
      } else {
        setSaveError(result.error ?? "Gagal menyimpan.");
        setLangkah(3);
      }
    });
  };

  // ── Render ──
  const LANGKAH_LABEL = ["Upload File", "Proses OCR", "Review Data", "Simpan"];

  return (
    <>
      <button onClick={() => setOpen(true)} className="btn-primary text-sm flex items-center gap-2">
        <FileText size={16} />
        Tambah KK
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={tutup} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col z-10 animate-slide-in-up">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 flex-shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-500 flex items-center justify-center">
                  <FileText size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Tambah Kartu Keluarga</h2>
                  <p className="text-xs text-gray-500">{LANGKAH_LABEL[langkah - 1]}</p>
                </div>
              </div>
              <button onClick={tutup} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            {/* Progress Steps */}
            <div className="flex items-center gap-0 px-6 py-3 border-b border-gray-100 flex-shrink-0">
              {LANGKAH_LABEL.map((label, i) => (
                <div key={i} className="flex items-center flex-1 last:flex-none">
                  <div className="flex items-center gap-1.5">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                      i + 1 < langkah ? "bg-secondary-500 text-white" :
                      i + 1 === langkah ? "bg-primary-500 text-white" :
                      "bg-gray-100 text-gray-400"
                    }`}>
                      {i + 1 < langkah ? "✓" : i + 1}
                    </div>
                    <span className={`text-xs hidden sm:inline ${i + 1 === langkah ? "text-gray-700 font-medium" : "text-gray-400"}`}>
                      {label}
                    </span>
                  </div>
                  {i < LANGKAH_LABEL.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i + 1 < langkah ? "bg-secondary-300" : "bg-gray-100"}`} />
                  )}
                </div>
              ))}
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6">

              {/* ── Langkah 1: Upload ── */}
              {langkah === 1 && (
                <div className="space-y-4">
                  <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={handleDrop}
                    onClick={() => fileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-colors ${
                      dragOver ? "border-primary-400 bg-primary-50" :
                      file ? "border-secondary-300 bg-secondary-50" : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                    />
                    {file ? (
                      <>
                        <CheckCircle size={36} className="text-secondary-500 mx-auto mb-3" />
                        <p className="font-semibold text-gray-800">{file.name}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {(file.size / 1024 / 1024).toFixed(2)} MB · {file.type || "file"}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">Klik untuk ganti file</p>
                      </>
                    ) : (
                      <>
                        <Upload size={36} className="text-gray-300 mx-auto mb-3" />
                        <p className="font-medium text-gray-600">Drag & drop atau klik untuk pilih</p>
                        <p className="text-sm text-gray-400 mt-1">PDF KK, foto JPG/PNG — maks 15MB</p>
                      </>
                    )}
                  </div>

                  {/* Preview thumbnail */}
                  {preview && file?.type?.startsWith("image") && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48">
                      <img src={preview} alt="Preview KK" className="w-full object-contain max-h-48" />
                    </div>
                  )}

                  <p className="text-xs text-gray-400 text-center">
                    💡 Untuk hasil terbaik, gunakan scan/foto KK yang jelas dan tidak buram
                  </p>
                </div>
              )}

              {/* ── Langkah 2: OCR Progress ── */}
              {langkah === 2 && (
                <div className="space-y-4">
                  {preview && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden max-h-56">
                      <img src={preview} alt="Halaman KK" className="w-full object-contain max-h-56" />
                    </div>
                  )}
                  {ocrError ? (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                      <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-medium text-red-700">OCR gagal</p>
                        <p className="text-sm text-red-500 mt-1">{ocrError}</p>
                        <button
                          onClick={() => setLangkah(3)}
                          className="mt-3 text-sm btn-outline"
                        >
                          Lanjut Input Manual
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4 space-y-4">
                      <Loader2 size={36} className="animate-spin text-primary-500 mx-auto" />
                      <p className="font-medium text-gray-700">{ocrStatus || "Memproses..."}</p>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div
                          className="bg-primary-500 h-2.5 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(5, ocrProgress)}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-400">
                        Proses ini membutuhkan 15–40 detik. Harap tunggu.
                      </p>
                    </div>
                  )}
                </div>
              )}

              {/* ── Langkah 3: Review ── */}
              {langkah === 3 && (
                <div className="space-y-5">
                  {/* Info KK */}
                  <div>
                    <h3 className="text-sm font-semibold text-gray-700 mb-3">Data Kartu Keluarga</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="sm:col-span-2">
                        <label className="label text-xs">Nomor KK (16 digit)</label>
                        <input
                          type="text"
                          value={kkData.noKK}
                          onChange={(e) => setKKData((p) => ({ ...p, noKK: e.target.value }))}
                          placeholder="3404XXXXXXXXXXXX"
                          maxLength={16}
                          className="input-field font-mono"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label text-xs">Nama Kepala Keluarga</label>
                        <input
                          type="text"
                          value={kkData.namaKepala}
                          onChange={(e) => setKKData((p) => ({ ...p, namaKepala: e.target.value }))}
                          className="input-field"
                          placeholder="Nama sesuai KK"
                          required
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="label text-xs">Alamat</label>
                        <input
                          type="text"
                          value={kkData.alamat}
                          onChange={(e) => setKKData((p) => ({ ...p, alamat: e.target.value }))}
                          className="input-field"
                          placeholder="Nama jalan / dusun"
                        />
                      </div>
                      <div>
                        <label className="label text-xs">RT</label>
                        <input type="text" value={kkData.rt} onChange={(e) => setKKData((p) => ({ ...p, rt: e.target.value }))} className="input-field" placeholder="001" />
                      </div>
                      <div>
                        <label className="label text-xs">RW</label>
                        <input type="text" value={kkData.rw} onChange={(e) => setKKData((p) => ({ ...p, rw: e.target.value }))} className="input-field" placeholder="001" />
                      </div>
                    </div>
                  </div>

                  {/* Daftar anggota */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-semibold text-gray-700">
                        Anggota Keluarga ({anggota.length} orang)
                      </h3>
                      {anggota.length > 0 && anggota.length < 2 && (
                        <span className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                          ⚠ Hasil OCR mungkin tidak lengkap — periksa kembali
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {anggota.map((a, i) => (
                        <BarisTambahAnggota
                          key={i}
                          idx={i}
                          data={a}
                          onChange={ubahAnggota}
                          onRemove={hapusAnggota}
                          isFirst={i === 0}
                        />
                      ))}
                    </div>
                    <button
                      type="button"
                      onClick={tambahAnggota}
                      className="mt-3 w-full border-2 border-dashed border-gray-200 rounded-xl py-2.5 text-sm text-gray-500 hover:border-secondary-300 hover:text-secondary-600 hover:bg-secondary-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Tambah Anggota Manual
                    </button>
                  </div>
                </div>
              )}

              {/* ── Langkah 4: Konfirmasi ── */}
              {langkah === 4 && (
                <div className="space-y-4">
                  {saved ? (
                    <div className="text-center py-8">
                      <CheckCircle size={48} className="text-secondary-500 mx-auto mb-3" />
                      <p className="text-lg font-bold text-gray-800">Data Berhasil Disimpan!</p>
                      <p className="text-sm text-gray-500 mt-1">
                        KK {kkData.namaKepala} + {anggota.length} anggota telah ditambahkan.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-500">No. KK</span>
                          <span className="font-mono font-medium">{kkData.noKK || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Kepala Keluarga</span>
                          <span className="font-medium">{kkData.namaKepala || "—"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-500">Jumlah Anggota</span>
                          <span className="font-medium">{anggota.length} orang</span>
                        </div>
                      </div>
                      {saveError && (
                        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                          ⚠ {saveError}
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Footer Navigasi */}
            {!saved && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 flex-shrink-0">
                <button
                  onClick={() => langkah > 1 && langkah !== 2 ? setLangkah((l) => (l - 1) as Langkah) : tutup()}
                  className="btn-outline text-sm"
                  disabled={langkah === 2}
                >
                  {langkah === 1 ? "Batal" : "← Kembali"}
                </button>

                {langkah === 1 && (
                  <button
                    onClick={jalankanOCR}
                    disabled={!file}
                    className="btn-primary text-sm disabled:opacity-40"
                  >
                    Mulai OCR →
                  </button>
                )}

                {langkah === 1 && (
                  <button
                    onClick={() => { setLangkah(3); }}
                    className="btn-outline text-sm ml-2"
                  >
                    Input Manual
                  </button>
                )}

                {langkah === 3 && (
                  <button
                    onClick={() => setLangkah(4)}
                    disabled={!kkData.namaKepala || anggota.length === 0}
                    className="btn-primary text-sm disabled:opacity-40"
                  >
                    Lanjut →
                  </button>
                )}

                {langkah === 4 && (
                  <button
                    onClick={handleSimpan}
                    disabled={saving}
                    className="btn-primary text-sm flex items-center gap-2"
                  >
                    {saving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : "✓ Simpan KK & Anggota"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
