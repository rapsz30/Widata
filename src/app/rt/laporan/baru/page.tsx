import { Header } from "@/components/layout/Header";
import { buatLaporanWarga } from "@/app/rt/actions";
import { UploadDokumen } from "@/components/features/UploadDokumen";

export default function LaporWargaBaru() {
  return (
    <>
      <Header title="Lapor Warga Baru" subtitle="Laporkan warga yang pindah masuk ke wilayah RT" />
      <div className="p-4 sm:p-6">
        <div className="card">
          <h3 className="font-semibold text-gray-800 mb-1">Form Laporan Warga Baru</h3>
          <p className="text-sm text-gray-500 mb-6">
            Isi data warga yang baru pindah masuk. Laporan akan diverifikasi oleh Dukuh.
          </p>

          <form action={buatLaporanWarga} className="space-y-5">
            <input type="hidden" name="jenis" value="BARU" />

            {/* Identitas warga */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Identitas Warga</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label">NIK</label>
                  <input name="nik" className="input-field font-mono" placeholder="16 digit NIK" maxLength={16} />
                </div>
                <div>
                  <label className="label">Nama Lengkap *</label>
                  <input name="nama" className="input-field" placeholder="Sesuai KTP" required />
                </div>
                <div>
                  <label className="label">Tempat Lahir</label>
                  <input name="tempatLahir" className="input-field" placeholder="Kota/Kabupaten" />
                </div>
                <div>
                  <label className="label">Tanggal Lahir</label>
                  <input name="tanggalLahir" type="date" className="input-field" />
                </div>
                <div>
                  <label className="label">Jenis Kelamin</label>
                  <select name="jenisKelamin" className="input-field">
                    <option value="">Pilih</option>
                    <option value="L">Laki-laki</option>
                    <option value="P">Perempuan</option>
                  </select>
                </div>
                <div>
                  <label className="label">Agama</label>
                  <select name="agama" className="input-field">
                    <option value="">Pilih</option>
                    <option value="Islam">Islam</option>
                    <option value="Kristen Protestan">Kristen Protestan</option>
                    <option value="Kristen Katolik">Kristen Katolik</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Buddha">Buddha</option>
                    <option value="Konghucu">Konghucu</option>
                  </select>
                </div>
                <div>
                  <label className="label">Pekerjaan</label>
                  <input name="pekerjaan" className="input-field" placeholder="Pekerjaan saat ini" />
                </div>
                <div>
                  <label className="label">No. KK</label>
                  <input name="noKK" className="input-field font-mono" placeholder="No. Kartu Keluarga" maxLength={16} />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Asal */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Asal & Keterangan</h4>
              <div className="space-y-4">
                <div>
                  <label className="label">Alamat Asal</label>
                  <input name="alamatAsal" className="input-field" placeholder="Alamat sebelumnya" />
                </div>
                <div>
                  <label className="label">Catatan Tambahan</label>
                  <textarea name="catatan" className="input-field" rows={3} placeholder="Informasi tambahan..." />
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100" />

            {/* Upload dokumen */}
            <div>
              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Dokumen Pendukung</h4>
              <UploadDokumen
                name="dokumenUrl"
                label="Surat Keterangan Pindah / KTP / KK"
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
