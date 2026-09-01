import { prisma } from "@/lib/prisma";
import { Header } from "@/components/layout/Header";
import { StatusBadge } from "@/components/features/StatusBadge";
import { TambahAkunModal } from "./TambahAkunModal";
import { toggleAktifAkun } from "../actions";

export default async function OperatorAkunPage() {
  const [users, wilayahList] = await Promise.all([
    prisma.user.findMany({
      include: { wilayah: { include: { parent: true } } },
      orderBy: [{ role: "asc" }, { nama: "asc" }],
    }),
    prisma.wilayah.findMany({
      where: { jenis: { in: ["RT", "DUKUH"] } },
      include: { parent: true },
      orderBy: [{ jenis: "asc" }, { kode: "asc" }],
    }),
  ]);

  const roleLabel: Record<string, string> = {
    OPERATOR: "Operator Desa",
    DUKUH: "Dukuh",
    RT: "RT",
  };

  const roleColor: Record<string, string> = {
    OPERATOR: "bg-primary-100 text-primary-700",
    DUKUH: "bg-secondary-100 text-secondary-700",
    RT: "bg-accent-100 text-accent-600",
  };

  const totalAktif = users.filter((u) => u.aktif).length;

  return (
    <>
      <Header
        title="Kelola Akun Pengguna"
        subtitle={`${users.length} akun · ${totalAktif} aktif`}
      />
      <div className="p-4 sm:p-6">
        <div className="card">
          {/* Toolbar */}
          <div className="flex items-center justify-between mb-4 gap-3">
            <div className="flex gap-3 text-sm text-gray-500">
              <span className="badge bg-primary-100 text-primary-700">
                {users.filter((u) => u.role === "OPERATOR").length} Operator
              </span>
              <span className="badge bg-secondary-100 text-secondary-700">
                {users.filter((u) => u.role === "DUKUH").length} Dukuh
              </span>
              <span className="badge bg-accent-100 text-accent-600">
                {users.filter((u) => u.role === "RT").length} RT
              </span>
            </div>
            <TambahAkunModal wilayahList={wilayahList} />
          </div>

          {/* Table */}
          <div className="overflow-x-auto -mx-6 px-6">
            <table className="w-full text-sm min-w-[600px]">
              <thead>
                <tr className="table-header">
                  <th className="text-left px-3 py-2 rounded-l-lg">Nama</th>
                  <th className="text-left px-3 py-2">Username</th>
                  <th className="text-left px-3 py-2">Role</th>
                  <th className="text-left px-3 py-2">Wilayah</th>
                  <th className="text-left px-3 py-2">Dukuh</th>
                  <th className="text-center px-3 py-2">Status</th>
                  <th className="text-center px-3 py-2 rounded-r-lg">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50">
                    <td className="px-3 py-3 font-medium text-gray-800">{u.nama}</td>
                    <td className="px-3 py-3 font-mono text-xs text-gray-500">{u.username}</td>
                    <td className="px-3 py-3">
                      <span className={`badge ${roleColor[u.role]}`}>
                        {roleLabel[u.role]}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-gray-600">{u.wilayah?.nama ?? "—"}</td>
                    <td className="px-3 py-3 text-gray-500">
                      {u.wilayah?.parent?.nama ?? "—"}
                    </td>
                    <td className="px-3 py-3 text-center">
                      <StatusBadge status={u.aktif ? "AKTIF" : "NONAKTIF"} />
                    </td>
                    <td className="px-3 py-3 text-center">
                      {/* Toggle aktif/nonaktif */}
                      <form
                        action={async () => {
                          "use server";
                          await toggleAktifAkun(u.id, !u.aktif);
                        }}
                      >
                        <button
                          type="submit"
                          className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${
                            u.aktif
                              ? "bg-red-50 text-red-600 hover:bg-red-100"
                              : "bg-secondary-50 text-secondary-600 hover:bg-secondary-100"
                          }`}
                        >
                          {u.aktif ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
