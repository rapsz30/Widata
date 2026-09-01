"use client";

import { useState, useActionState, useEffect, useRef } from "react";
import { X, Plus, Loader2, CheckCircle } from "lucide-react";
import { catatBantuan } from "../actions";

interface Penduduk {
  id: string;
  nama: string;
  nik: string;
}

interface CatatBansosModalProps {
  pendudukList: Penduduk[];
}

const JENIS_BANSOS = ["PKH", "BPNT", "BLT", "BST", "Bansos Lainnya"];

export function CatatBansosModal({ pendudukList }: CatatBansosModalProps) {
  const [open, setOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState<
    { success: boolean; error?: string } | null,
    FormData
  >(catatBantuan, null);

  useEffect(() => {
    if (state?.success) {
      setTimeout(() => {
        setOpen(false);
        formRef.current?.reset();
      }, 1000);
    }
  }, [state]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="btn-accent flex items-center gap-2 text-sm"
      >
        <Plus size={16} />
        Catat Bantuan
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg z-10 animate-slide-in-up">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-accent-400 flex items-center justify-center">
                  <Plus size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Catat Bantuan Sosial</h2>
                  <p className="text-xs text-gray-500">Tambah data penerima bansos</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            {state?.success ? (
              <div className="text-center py-10 px-6">
                <CheckCircle size={44} className="text-secondary-500 mx-auto mb-3" />
                <p className="font-semibold text-gray-800">Bantuan Berhasil Dicatat!</p>
              </div>
            ) : (
              <form ref={formRef} action={action} className="px-6 py-5 space-y-4">
                {state && !state.success && (
                  <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600">
                    ⚠ {state.error}
                  </div>
                )}

                <div>
                  <label className="label">Penerima Bantuan</label>
                  <select name="pendudukId" className="input-field" required>
                    <option value="">— Pilih Warga —</option>
                    {pendudukList.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nama} — {p.nik?.startsWith("TEMP") ? "NIK belum tercatat" : p.nik}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label">Jenis Bansos</label>
                    <select name="jenisBansos" className="input-field" required>
                      <option value="">— Pilih —</option>
                      {JENIS_BANSOS.map((j) => (
                        <option key={j} value={j}>{j}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="label">Nilai Manfaat (Rp)</label>
                    <input
                      name="nilaiManfaat"
                      type="number"
                      min="0"
                      step="1000"
                      className="input-field"
                      placeholder="750000"
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Tahun</label>
                    <input
                      name="tahun"
                      type="number"
                      className="input-field"
                      defaultValue={new Date().getFullYear()}
                      required
                    />
                  </div>
                  <div>
                    <label className="label">Semester</label>
                    <select name="semester" className="input-field" required>
                      <option value="1">Semester 1</option>
                      <option value="2">Semester 2</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="label">Keterangan <span className="text-gray-400 font-normal">(opsional)</span></label>
                  <textarea name="keterangan" className="input-field" rows={2} placeholder="Catatan tambahan..." />
                </div>

                <div className="border-t border-gray-100 pt-2 flex gap-3 justify-end">
                  <button type="button" onClick={() => setOpen(false)} className="btn-outline text-sm" disabled={pending}>
                    Batal
                  </button>
                  <button type="submit" className="btn-accent text-sm flex items-center gap-2" disabled={pending}>
                    {pending ? <><Loader2 size={15} className="animate-spin" />Menyimpan...</> : <><Plus size={15} />Simpan</>}
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

