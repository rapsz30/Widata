"use client";

import { useActionState } from "react";
import { buatUsulan } from "../actions";
import { CheckCircle, Loader2, FileEdit } from "lucide-react";

export function FormUsulan() {
  const [state, action, pending] = useActionState<
    { success: boolean; error?: string } | null,
    FormData
  >(buatUsulan, null);

  if (state?.success) {
    return (
      <div className="text-center py-10">
        <CheckCircle size={44} className="text-secondary-500 mx-auto mb-3" />
        <p className="font-semibold text-gray-800">Usulan Berhasil Dikirim!</p>
        <p className="text-sm text-gray-500 mt-1">Menunggu verifikasi Dukuh.</p>
        <a href="/rt" className="btn-outline mt-4 inline-flex text-sm">
          ← Kembali ke Beranda
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-5">
      {state && !state.success && (
        <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
          ⚠ {state.error}
        </div>
      )}

      {/* Siapa yang diusulkan */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Identitas Warga (jika diketahui)</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">
              Nama Warga <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              name="nama"
              className="input-field"
              placeholder="Nama warga yang datanya diusulkan"
            />
          </div>
          <div>
            <label className="label">
              NIK <span className="text-gray-400 font-normal">(opsional)</span>
            </label>
            <input
              name="nik"
              className="input-field font-mono"
              placeholder="16 digit NIK"
              maxLength={16}
            />
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          💡 Nama dan NIK bersifat opsional. Cukup jelaskan pada keterangan di bawah.
        </p>
      </div>

      <div className="border-t border-gray-100" />

      {/* Isi usulan */}
      <div>
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Detail Perubahan</h4>
        <div className="space-y-4">
          <div>
            <label className="label">
              Perihal Perubahan *
              <span className="text-gray-400 font-normal ml-1">
                (apa yang ingin diubah)
              </span>
            </label>
            <input
              name="perihal"
              className="input-field"
              placeholder="Contoh: Perubahan pekerjaan, koreksi ejaan nama, dll."
              required
            />
          </div>
          <div>
            <label className="label">
              Keterangan Lengkap
            </label>
            <textarea
              name="keterangan"
              className="input-field"
              rows={4}
              placeholder={`Jelaskan secara bebas perubahan yang diusulkan.\n\nContoh:\n- Data lama: pekerjaan = Petani\n- Data baru: pekerjaan = Wiraswasta\n- Alasan: yang bersangkutan sudah tidak bertani sejak 2023`}
            />
          </div>
        </div>
      </div>

      <div className="border-t border-gray-100" />

      <div className="flex gap-3">
        <button
          type="submit"
          disabled={pending}
          className="btn-primary flex items-center gap-2"
        >
          {pending
            ? <><Loader2 size={16} className="animate-spin" />Mengirim...</>
            : <><FileEdit size={16} />Kirim Usulan</>
          }
        </button>
        <a href="/rt" className="btn-outline">Batal</a>
      </div>
    </form>
  );
}

