import { Header } from "@/components/layout/Header";
import { buatLaporanWarga } from "@/app/rt/actions";
import { UploadDokumen } from "@/components/features/UploadDokumen";

export default function LaporKelahiran() {
  return (
    <>
      <Header
        title="Lapor Kelahiran"
        subtitle="Laporkan bayi yang baru lahir di wilayah RT untuk dicatat sebagai warga baru"
      />
      <div className="p-4 sm:p-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-1">Form Laporan Kelahiran</h3>
          <p className="text-sm text-gray-500 mb-6">
            Isi data bayi yang baru lahir. Laporan akan diverifikasi oleh Dukuh dan
            penduduk baru akan ditambahkan ke data KK orang tuanya.
          </p>

          <form action={buatLaporanWarga} className="space-y-5">
            <input type="hidden" name="jenis" value="LAHIR" />

            {/* Data bayi */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Data Bayi
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="label">Nama Bayi <span className="text-gray-400 font-normal">(jika sudah ada)</span></label>
                  <input
                    name="namaBayi"
                    className="input-field"
                    placeholder="Nama yang akan diberikan (opsional)"
                  />
                </div>
                <div>
                  <label className="label">Tanggal Lahir *</label>
                  <input
                    name="tanggalLahir"
                    type="date"
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="label">Jenis Kelamin *</label>
                  <select name="jenisKelamin" className="input-field" required>
                    <option value="">— Pilih —</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="label">Tempat Lahir</label>
                  <input
                    name="tempatLahir"
                    className="input-field"
                    placeholder="Contoh: RS PKU Yogyakarta"
                  />
                </div>
                <div>
                  <label className="label">Agama</label>
                  <select name="agama" className="input-field">
                    <option value="">— Pilih —</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Kristen Katolik">Kristen Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Data orang tua */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Data Orang Tua
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">Nama Ibu *</label>
                  <input
                    name="namaIbu"
                    className="input-field"
                    placeholder="Nama ibu kandung"
                    required
                  />
                </div>
                <div>
                  <label className="label">Nama Ayah</label>
                  <input
                    name="namaAyah"
                    className="input-field"
                    placeholder="Nama ayah kandung"
                  />
                </div>
                <div>
                  <label className="label">No. KK Orang Tua</label>
                  <input
                    name="noKK"
                    className="input-field font-mono"
                    placeholder="16 digit No. KK"
                    maxLength={16}
                  />
                </div>
                <div>
                  <label className="label">NIK Ibu</label>
                  <input
                    name="nikIbu"
                    className="input-field font-mono"
                    placeholder="16 digit NIK ibu"
                    maxLength={16}
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Catatan */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Keterangan Tambahan
              </h4>
              <textarea
                name="catatan"
                className="input-field"
                rows={3}
                placeholder="Informasi tambahan jika ada..."
              />
            </div>

            <div className="border-t border-gray-100" />

            {/* Upload dokumen */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                Dokumen Pendukung
              </h4>
              <UploadDokumen
                name="dokumenUrl"
                label="Surat Keterangan Lahir / Akta Kelahiran"
                hint="PDF, JPG, PNG — maks 10MB (opsional, bisa dilengkapi setelah terbit)"
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

