"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="btn-primary flex items-center gap-2"
    >
      🖨️ Cetak Laporan
    </button>
  );
}

