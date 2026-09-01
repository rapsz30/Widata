/**
 * Utility untuk render halaman PDF ke data URL gambar (PNG).
 * Menggunakan pdfjs-dist v4 dengan worker lokal dari /public.
 *
 * Strategi fallback:
 * 1. Coba `workerPort` dengan `new Worker(url, { type: "module" })`
 * 2. Jika gagal (browser blokir), coba `workerSrc` string
 * 3. Jika masih gagal, lempar error agar user bisa input manual
 */

let pdfjsModule: any = null;

export async function renderPDFToImage(file: File, scale = 2.0): Promise<string> {
  // Lazy load agar tidak dieksekusi di server
  if (!pdfjsModule) {
    pdfjsModule = await import("pdfjs-dist");
  }
  const pdfjsLib = pdfjsModule;

  const workerUrl = new URL("/pdf.worker.min.mjs", window.location.origin).href;

  // Coba strategi 1: workerPort (paling reliable untuk ESM)
  try {
    const w = new Worker(workerUrl, { type: "module" });
    pdfjsLib.GlobalWorkerOptions.workerPort = w;
    const result = await renderWithLib(pdfjsLib, file, scale);
    w.terminate();
    return result;
  } catch {
    // Worker port gagal, coba workerSrc
  }

  // Strategi 2: workerSrc string biasa
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;
    return await renderWithLib(pdfjsLib, file, scale);
  } catch {
    // workerSrc gagal, coba disable worker (in-thread, lambat tapi berhasil)
  }

  // Strategi 3: jalankan in-thread tanpa worker (fallback terakhir)
  pdfjsLib.GlobalWorkerOptions.workerSrc = "";
  return renderWithLib(pdfjsLib, file, scale);
}

async function renderWithLib(pdfjsLib: any, file: File, scale: number): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale });

  const canvas = document.createElement("canvas");
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext("2d")!;

  await page.render({ canvasContext: ctx, viewport }).promise;
  return canvas.toDataURL("image/png");
}
