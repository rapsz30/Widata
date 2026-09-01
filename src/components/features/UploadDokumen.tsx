"use client";

import { useRef, useState } from "react";
import { Upload, X, CheckCircle, FileText } from "lucide-react";

interface UploadDokumenProps {
  name: string;
  label: string;
  hint?: string;
}

/**
 * Komponen upload dokumen sederhana.
 * Dalam prototipe ini file hanya disimpan sebagai nama file (tidak benar-benar diupload ke server).
 * Di produksi bisa diganti dengan upload ke storage (S3, Supabase Storage, dll).
 */
export function UploadDokumen({ name, label, hint }: UploadDokumenProps) {
  const [file, setFile] = useState<File | null>(null);
  const [drag, setDrag] = useState(false);
  const ref = useRef<HTMLInputElement>(null);

  const handleFile = (f: File) => setFile(f);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  };

  return (
    <div>
      <label className="label">{label}</label>
      {/* Hidden input menyimpan nama file sebagai nilai */}
      <input type="hidden" name={name} value={file?.name ?? ""} />
      {file ? (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-secondary-200 bg-secondary-50">
          <FileText size={20} className="text-secondary-500 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-800 truncate">{file.name}</p>
            <p className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB</p>
          </div>
          <button
            type="button"
            onClick={() => setFile(null)}
            className="p-1 rounded-lg hover:bg-secondary-100 text-gray-400"
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={handleDrop}
          onClick={() => ref.current?.click()}
          className={`border-2 border-dashed rounded-xl p-4 flex items-center gap-3 cursor-pointer transition-colors ${
            drag ? "border-primary-300 bg-primary-50" : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
          }`}
        >
          <input
            ref={ref}
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
          <Upload size={20} className="text-gray-300 flex-shrink-0" />
          <div>
            <p className="text-sm text-gray-500">Drag & drop atau <span className="text-primary-600">klik untuk pilih</span></p>
            <p className="text-xs text-gray-400 mt-0.5">{hint ?? "PDF, JPG, PNG — maks 10MB"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

