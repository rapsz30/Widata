const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const counts = {
    Wilayah: await prisma.wilayah.count(),
    User: await prisma.user.count(),
    KartuKeluarga: await prisma.kartuKeluarga.count(),
    Penduduk: await prisma.penduduk.count(),
    LaporanWarga: await prisma.laporanWarga.count(),
    UsulanPerubahan: await prisma.usulanPerubahan.count(),
    DataBansos: await prisma.dataBansos.count(),
    DataBPJS: await prisma.dataBPJS.count(),
    Rekap: await prisma.rekap.count(),
  };

  console.log("\n========================================");
  console.log(" CEK DATA NEON");
  console.log("========================================\n");

  let total = 0;

  for (const [table, count] of Object.entries(counts)) {
    console.log(`${table}: ${count}`);
    total += count;
  }

  console.log(`\nTOTAL: ${total}`);
  console.log("\n========================================\n");
}

main()
  .catch((error) => {
    console.error("\nGAGAL:", error.message);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());