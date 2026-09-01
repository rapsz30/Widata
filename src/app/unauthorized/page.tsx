import Link from "next/link";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">🚫</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Akses Ditolak</h1>
        <p className="text-gray-500 mb-6">
          Anda tidak memiliki hak akses ke halaman ini. Silakan login dengan
          akun yang sesuai.
        </p>
        <Link href="/login" className="btn-primary">
          Kembali ke Login
        </Link>
      </div>
    </div>
  );
}

