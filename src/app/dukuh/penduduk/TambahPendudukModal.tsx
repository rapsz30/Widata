"use client";

import { useState, useTransition } from "react";
import { X, UserPlus, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { tambahPendudukKeKK } from "../actions";

interface KKOption {
  id: string;
  noKK: string;
  kepalaKeluarga: string;
}

interface TambahPendudukModalProps {
  kkList: KKOption[];
}

const AGAMA_OPTIONS = ["Islam", "Kristen Protestan", "Kristen Katolik", "Hindu", "Buddha", "Konghucu"];
const PENDIDIKAN_OPTIONS = [
  "Tidak/Belum Sekolah", "SD", "SMP", "SMA/SMK", "Diploma", "S1", "S2", "S3",
];
const PEKERJAAN_OPTIONS = [
  "Petani", "Pedagang", "PNS", "TNI/POLRI", "Wiraswasta", "Buruh",
  "Karyawan Swasta", "Ibu Rumah Tangga", "Pelajar", "Pensiunan", "Belum/Tidak Bekerja",
];

export function TambahPendudukModal({ kkList }: TambahPendudukModalProps) {
  const [open, setOpen] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [saving, startSave] = useTransition();

  const [form, setForm] = useState({
    kkId: "",
    nik: "",
    nama: "",
    tempatLahir: "",
    tanggalLahir: "",
    jenisKelamin: "L",
    agama: "Islam",
    pendidikan: "Tidak/Belum Sekolah",
    pekerjaan: "",
    statusKawin: "BELUM_KAWIN",
  });

  const set = (field: string, val: string) =>
    setForm((p) => ({ ...p, [field]: val }));

  const tutup = () => {
    setOpen(false);
    setSaved(false);
    setError("");
    setForm({
      kkId: "", nik: "", nama: "", tempatLahir: "",
      tanggalLahir: "", jenisKelamin: "L", agama: "Islam",
      pendidikan: "Tidak/Belum Sekolah", pekerjaan: "", statusKawin: "BELUM_KAWIN",
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!form.kkId) { setError("Pilih Kartu Keluarga terlebih dahulu."); return; }
    if (!form.nama.trim()) { setError("Nama wajib diisi."); return; }

    startSave(async () => {
      const result = await tambahPendudukKeKK(form.kkId, {
        nik: form.nik,
        nama: form.nama,
        tempatLahir: form.tempatLahir,
        tanggalLahir: form.tanggalLahir,
        jenisKelamin: form.jenisKelamin as "L" | "P",
        agama: form.agama,
        pendidikan: form.pendidikan,
        pekerjaan: form.pekerjaan,
        statusKawin: form.statusKawin,
      });

      if (result.success) {
        setSaved(true);
        setTimeout(() => tutup(), 1500);
      } else {
        setError(result.error ?? "Gagal menyimpan.");
      }
    });
  };

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-secondary text-sm flex items-center gap-2"
      >
        <UserPlus size={16} />
        Tambah Penduduk
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={tutup} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto z-10 animate-slide-in-up">

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-secondary-500 flex items-center justify-center">
                  <UserPlus size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Tambah Penduduk</h2>
                  <p className="text-xs text-gray-500">Input manual data anggota keluarga</p>
                </div>
              </div>
              <button onClick={tutup} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {saved ? (
              <div className="text-center py-12 px-6">
                <CheckCircle size={48} className="text-secondary-500 mx-auto mb-3" />
                <p className="text-lg font-bold text-gray-800">Penduduk Berhasil Ditambahkan!</p>
                <p className="text-sm text-gray-500 mt-1">{form.nama}</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    ⚠ {error}
                  </div>
                )}

                {/* Pilih KK */}
                <div>
                  <label className="label">Kartu Keluarga</label>
                  <select
                    value={form.kkId}
                    onChange={(e) => set("kkId", e.target.value)}
                    className="input-field"
                    required
                  >
                    <option value="">— Pilih KK —</option>
                    {kkList.map((kk) => (
                      <option key={kk.id} value={kk.id}>
                        {kk.kepalaKeluarga} ({kk.noKK})
                      </option>
                    ))}
                  </select>
                </div>

                {/* NIK */}
                <div>
                  <label className="label">NIK <span className="text-gray-400 font-normal">(opsional)</span></label>
                  <input
                    type="text"
                    value={form.nik}
                    onChange={(e) => set("nik", e.target.value)}
                    placeholder="16 digit NIK"
                    maxLength={16}
                    className="input-field font-mono"
                  />
                </div>

                {/* Nama */}
                <div>
                  <label className="label">Nama Lengkap</label>
                  <input
                    type="text"
                    value={form.nama}
                    onChange={(e) => set("nama", e.target.value)}
                    placeholder="Sesuai KK"
                    className="input-field"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Tempat lahir */}
                  <div>
                    <label className="label">Tempat Lahir</label>
                    <input
                      type="text"
                      value={form.tempatLahir}
                      onChange={(e) => set("tempatLahir", e.target.value)}
                      placeholder="Kota"
                      className="input-field"
                    />
                  </div>
                  {/* Tanggal lahir */}
                  <div>
                    <label className="label">Tanggal Lahir</label>
                    <input
                      type="text"
                      value={form.tanggalLahir}
                      onChange={(e) => set("tanggalLahir", e.target.value)}
                      placeholder="DD-MM-YYYY"
                      className="input-field"
                    />
                  </div>
                  {/* JK */}
                  <div>
                    <label className="label">Jenis Kelamin</label>
                    <select value={form.jenisKelamin} onChange={(e) => set("jenisKelamin", e.target.value)} className="input-field">
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                  {/* Status Kawin */}
                  <div>
                    <label className="label">Status Kawin</label>
                    <select value={form.statusKawin} onChange={(e) => set("statusKawin", e.target.value)} className="input-field">
                      <option value="BELUM_KAWIN">Belum Kawin</option>
                      <option value="KAWIN">Kawin</option>
                      <option value="CERAI_HIDUP">Cerai Hidup</option>
                      <option value="CERAI_MATI">Cerai Mati</option>
                    </select>
                  </div>
                  {/* Agama */}
                  <div>
                    <label className="label">Agama</label>
                    <select value={form.agama} onChange={(e) => set("agama", e.target.value)} className="input-field">
                      {AGAMA_OPTIONS.map((a) => <option key={a}>{a}</option>)}
                    </select>
                  </div>
                  {/* Pendidikan */}
                  <div>
                    <label className="label">Pendidikan</label>
                    <select value={form.pendidikan} onChange={(e) => set("pendidikan", e.target.value)} className="input-field">
                      {PENDIDIKAN_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                    </select>
                  </div>
                </div>

                {/* Pekerjaan */}
                <div>
                  <label className="label">Pekerjaan</label>
                  <select value={form.pekerjaan} onChange={(e) => set("pekerjaan", e.target.value)} className="input-field">
                    <option value="">— Pilih Pekerjaan —</option>
                    {PEKERJAAN_OPTIONS.map((p) => <option key={p}>{p}</option>)}
                  </select>
                </div>

                <div className="border-t border-gray-100 pt-2" />

                <div className="flex gap-3 justify-end">
                  <button type="button" onClick={tutup} className="btn-outline text-sm" disabled={saving}>
                    Batal
                  </button>
                  <button type="submit" className="btn-secondary text-sm flex items-center gap-2" disabled={saving}>
                    {saving ? <><Loader2 size={15} className="animate-spin" /> Menyimpan...</> : <><UserPlus size={15} /> Simpan</>}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}

