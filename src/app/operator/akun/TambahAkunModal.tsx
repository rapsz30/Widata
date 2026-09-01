"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { tambahAkun, type TambahAkunResult } from "../actions";
import { X, Loader2, UserPlus, Eye, EyeOff } from "lucide-react";

interface Wilayah {
  id: string;
  nama: string;
  jenis: string;
  parent?: { nama: string } | null;
}

interface TambahAkunModalProps {
  wilayahList: Wilayah[];
}

const ROLE_OPTIONS = [
  { value: "OPERATOR", label: "Operator Desa" },
  { value: "DUKUH", label: "Dukuh" },
  { value: "RT", label: "RT" },
];

export function TambahAkunModal({ wilayahList }: TambahAkunModalProps) {
  const [open, setOpen] = useState(false);
  const [role, setRole] = useState("RT");
  const [showPass, setShowPass] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const [state, action, pending] = useActionState<TambahAkunResult | null, FormData>(
    tambahAkun,
    null
  );

  // Filter wilayah berdasarkan role
  const filteredWilayah = wilayahList.filter((w) =>
    role === "RT" ? w.jenis === "RT" : role === "DUKUH" ? w.jenis === "DUKUH" : false
  );

  // Tutup modal jika sukses
  useEffect(() => {
    if (state?.success) {
      setOpen(false);
      formRef.current?.reset();
      setRole("RT");
    }
  }, [state]);

  // Prevent body scroll saat modal terbuka
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(true)}
        className="btn-primary text-sm flex items-center gap-2"
      >
        <UserPlus size={16} />
        Tambah Akun
      </button>

      {/* Modal Overlay */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal Panel */}
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto z-10 animate-slide-in-up">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center">
                  <UserPlus size={16} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-semibold text-gray-800">Tambah Akun Baru</h2>
                  <p className="text-xs text-gray-500">Isi data pengguna sistem</p>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <form ref={formRef} action={action} className="px-6 py-5 space-y-4">
              {/* Error */}
              {state && !state.success && (
                <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-sm text-red-600 flex items-start gap-2">
                  <span className="text-red-400 mt-0.5 flex-shrink-0">⚠</span>
                  {state.error}
                </div>
              )}

              {/* Nama */}
              <div>
                <label className="label">Nama Lengkap</label>
                <input
                  name="nama"
                  type="text"
                  placeholder="Contoh: Budi Santoso"
                  className="input-field"
                  required
                />
              </div>

              {/* Username */}
              <div>
                <label className="label">Username</label>
                <input
                  name="username"
                  type="text"
                  placeholder="Contoh: rt_00101"
                  className="input-field"
                  required
                  pattern="[a-z0-9_]+"
                  title="Hanya huruf kecil, angka, dan underscore"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Hanya huruf kecil, angka, dan underscore (_)
                </p>
              </div>

              {/* Password */}
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Minimal 6 karakter"
                    className="input-field pr-10"
                    required
                    minLength={6}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Role */}
              <div>
                <label className="label">Role</label>
                <select
                  name="role"
                  className="input-field"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                >
                  {ROLE_OPTIONS.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Wilayah (hanya untuk RT dan Dukuh) */}
              {role !== "OPERATOR" && (
                <div>
                  <label className="label">
                    Wilayah{" "}
                    <span className="text-gray-400 font-normal">
                      ({role === "RT" ? "pilih RT" : "pilih Dukuh"})
                    </span>
                  </label>
                  <select name="wilayahId" className="input-field" required>
                    <option value="">— Pilih Wilayah —</option>
                    {filteredWilayah.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.nama}
                        {w.parent ? ` — ${w.parent.nama}` : ""}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-gray-100 pt-1" />

              {/* Actions */}
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-outline text-sm"
                  disabled={pending}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary text-sm flex items-center gap-2"
                  disabled={pending}
                >
                  {pending ? (
                    <>
                      <Loader2 size={15} className="animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <UserPlus size={15} />
                      Simpan Akun
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

