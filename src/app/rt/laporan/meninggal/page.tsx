import { Header } from "@/components/layout/Header";
import { buatLaporanWarga } from "@/app/rt/actions";
import { UploadDokumen } from "@/components/features/UploadDokumen";

export default function LaporWargaMeninggal() {
  return (
    <>
      <Header title="Lapor Warga Meninggal" subtitle="Laporkan warga yang meninggal dunia di wilayah RT" />
      <div className="p-4 sm:p-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-1">Form Laporan Warga Meninggal</h3>
          <p className="text-sm text-gray-500 mb-6">
            Isi data warga yang meninggal. Laporan akan diverifikasi oleh Dukuh.
          </p>

          <form action={buatLaporanWarga} className="space-y-5">
            <input type="hidden" name="jenis" value="MENINGGAL" />

            {/* Identitas */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Identitas Warga</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">NIK</label>
                  <input name="nikMeninggal" className="input-field font-mono" placeholder="16 digit NIK" maxLength={16} />
                </div>
                <div>
                  <label className="label">Nama Lengkap *</label>
                  <input name="namaMeninggal" className="input-field" placeholder="Nama sesuai KTP" required />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Kejadian */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Informasi Kejadian</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Tanggal Meninggal *</label>
                  <input name="tanggalMeninggal" type="date" className="input-field" required />
                </div>
                <div>
                  <label className="label">Penyebab Meninggal</label>
                  <select name="penyebab" className="input-field">
                    <option value="">— Pilih —</option>
                    <option value="Sakit">Sakit</option>
                    <option value="Kecelakaan">Kecelakaan</option>
                    <option value="Usia Lanjut">Usia Lanjut</option>
                    <option value="Lainnya">Lainnya</option>
                  </select>
                </div>
              </div>
              <div className="mt-4">
                <label className="label">Catatan Tambahan</label>
                <textarea name="catatan" className="input-field" rows={3} placeholder="Keterangan tambahan..." />
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Upload dokumen */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dokumen Pendukung</h4>
              <UploadDokumen
                name="dokumenUrl"
                label="Surat Keterangan Meninggal / Akta Kematian"
                hint="PDF, JPG, PNG — maks 10MB (opsional)"
              />
            </div>

            <div className="border-t border-gray-100" />

            <div className="flex gap-3">
              <button type="submit" className="btn-primary">Kirim Laporan</button>
              <a href="/rt" className="btn-outline">Batal</a>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
