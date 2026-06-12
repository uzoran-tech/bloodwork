// Photo lab-report import. Runs Tesseract.js OCR in the browser (lazy-loaded;
// the OCR engine and language data come from its CDN on first use), then the
// recognized lines go through the same parser as PDF imports. Serbian Latin +
// English models so marker names like "Gvožđe" keep their diacritics, which
// the parser's normalization relies on. Photos are downscaled before OCR to
// keep memory and time sane on phones.

// Tesseract reads best with glyphs ~30-40px tall, so small images are scaled
// UP (to a cap) and huge phone photos scaled down — both toward TARGET_DIM.
const TARGET_DIM = 2400
const MAX_UPSCALE = 3

async function toCanvas(file) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error('could not decode the image'))
      i.src = url
    })
    const scale = Math.min(TARGET_DIM / Math.max(img.naturalWidth, img.naturalHeight), MAX_UPSCALE)
    const canvas = document.createElement('canvas')
    canvas.width = Math.round(img.naturalWidth * scale)
    canvas.height = Math.round(img.naturalHeight * scale)
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
    return canvas
  } finally {
    URL.revokeObjectURL(url)
  }
}

export async function extractPhotoLines(file, onProgress) {
  const { createWorker } = await import('tesseract.js')
  const options = {
    logger: (m) => {
      if (m.status === 'recognizing text' && onProgress) onProgress(m.progress)
    },
  }
  let worker
  try {
    worker = await createWorker('srp_latn+eng', 1, options)
  } catch {
    // Serbian model unavailable (offline CDN mirror, etc.) — English still
    // reads the numbers and most marker names.
    worker = await createWorker('eng', 1, options)
  }
  try {
    const canvas = await toCanvas(file)
    const { data } = await worker.recognize(canvas)
    return (data.text || '')
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter(Boolean)
  } finally {
    await worker.terminate()
  }
}
