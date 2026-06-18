import { useRef, useState } from 'react'
import { MARKERS, markerById, statusOf } from '../catalog.js'
import { parseCSV } from '../store.js'
import { saveReport } from '../dataStore.js'

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function AddData({ refresh, done }) {
  const [mode, setMode] = useState('form')
  const [date, setDate] = useState('')
  const [lab, setLab] = useState('')
  const [rows, setRows] = useState([{ markerId: '', value: '' }])
  const [csvText, setCsvText] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null) // { date, values, fileName }
  const [queue, setQueue] = useState([]) // remaining previews when several PDFs are picked at once
  const [batchTotal, setBatchTotal] = useState(0) // size of the current batch (0/1 = single file)
  const [ocrProgress, setOcrProgress] = useState(null) // 0..1 while reading a photo
  const csvRef = useRef(null)
  const pdfRef = useRef(null)
  const photoRef = useRef(null)

  function setRow(i, patch) {
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  }

  async function saveForm() {
    if (!date) return setFeedback({ tone: 'warn', text: 'Pick the test date first.' })
    const values = {}
    for (const r of rows) {
      const v = parseFloat(String(r.value).replace(',', '.'))
      if (r.markerId && isFinite(v)) values[r.markerId] = v
    }
    if (Object.keys(values).length === 0)
      return setFeedback({ tone: 'warn', text: 'Add at least one marker value.' })
    setBusy(true)
    try {
      await saveReport({ date, lab, sample: '', notes: '', values })
      await refresh()
      setFeedback({ tone: 'good', text: `Saved report for ${date}.` })
      setRows([{ markerId: '', value: '' }])
      setTimeout(done, 600)
    } catch (err) {
      setFeedback({ tone: 'warn', text: `Couldn't save: ${err?.message || 'please try again.'}` })
    } finally {
      setBusy(false)
    }
  }

  async function importText(text) {
    const { reports: parsed, imported, errors } = parseCSV(text)
    if (imported === 0) {
      return setFeedback({ tone: 'warn', text: `Nothing imported. ${errors[0] || 'Expected rows like: 2024-06-10,tsh,1.71'}` })
    }
    setBusy(true)
    try {
      for (const r of parsed) await saveReport(r)
      await refresh()
      setFeedback({
        tone: 'good',
        text: `Imported ${imported} values across ${parsed.length} dates.${errors.length ? ` Skipped ${errors.length} rows.` : ''}`,
      })
      setCsvText('')
      setTimeout(done, 900)
    } catch (err) {
      setFeedback({ tone: 'warn', text: `Couldn't save: ${err?.message || 'please try again.'}` })
    } finally {
      setBusy(false)
    }
  }

  function onCsvFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => importText(String(reader.result))
    reader.readAsText(f)
    e.target.value = ''
  }

  async function onPdfFiles(e) {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return
    setBusy(true)
    setFeedback(null)
    const previews = []
    const skipped = [] // "<name> (<reason>)" for files we couldn't read values from
    try {
      const { extractPdfLines, parseLabLines } = await import('../pdfimport.js')
      for (const f of files) {
        try {
          const lines = await extractPdfLines(f)
          const { date: d, values, lab, sample } = parseLabLines(lines)
          if (Object.keys(values).length > 0) {
            previews.push({ date: d || todayISO(), dateGuess: !d, values, fileName: f.name, lab, sample })
          } else {
            skipped.push(`${f.name} (${lines.length === 0 ? 'no selectable text — a scan or photo' : 'no marker values recognized'})`)
          }
        } catch (err) {
          const name = err?.name || ''
          const reason =
            name === 'PasswordException'
              ? 'password-protected'
              : name === 'InvalidPDFException'
                ? 'not a valid PDF'
                : err?.message || 'failed to read'
          skipped.push(`${f.name} (${reason})`)
        }
      }
    } finally {
      setBusy(false)
    }

    if (previews.length === 0) {
      setFeedback({
        tone: 'warn',
        text: `Couldn't read values from ${files.length === 1 ? 'that PDF' : 'any of those PDFs'}${skipped.length ? `: ${skipped.join('; ')}` : ''}. Try CSV or manual entry — or, for scans/photos, the photo scanner.`,
      })
      return
    }
    if (skipped.length) {
      setFeedback({ tone: 'warn', text: `Skipped ${skipped.length} file(s): ${skipped.join('; ')}` })
    }
    // Review the first now; the rest queue up and appear one at a time.
    setBatchTotal(previews.length)
    setQueue(previews.slice(1))
    setPreview(previews[0])
  }

  // Move to the next queued PDF preview, or finish the batch.
  function advancePreview() {
    if (queue.length > 0) {
      setPreview(queue[0])
      setQueue(queue.slice(1))
    } else {
      setPreview(null)
      setBatchTotal(0)
      setTimeout(done, 800)
    }
  }

  function skipPreview() {
    if (queue.length > 0) {
      setPreview(queue[0])
      setQueue(queue.slice(1))
    } else {
      setPreview(null)
      setBatchTotal(0)
    }
  }

  async function onPhotoFile(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    setFeedback(null)
    setOcrProgress(0)
    try {
      const [{ extractPhotoLines }, { parseLabLines }] = await Promise.all([
        import('../photoimport.js'),
        import('../pdfimport.js'),
      ])
      const lines = await extractPhotoLines(f, setOcrProgress)
      const { date: d, values, lab, sample } = parseLabLines(lines)
      if (Object.keys(values).length > 0) {
        setPreview({ date: d || todayISO(), dateGuess: !d, values, fileName: f.name || 'photo', source: 'photo', lab, sample })
      } else {
        setFeedback({
          tone: 'warn',
          text: 'Could not recognize any marker values in that photo. Try a sharper, well-lit photo taken straight-on, with the values filling the frame.',
        })
      }
    } catch (err) {
      setFeedback({
        tone: 'warn',
        text: `Failed to read that photo${err?.message ? ` (${err.message})` : ''}. Try again with a sharper photo, or use CSV / manual entry.`,
      })
    } finally {
      setBusy(false)
      setOcrProgress(null)
    }
  }

  async function confirmPreview() {
    if (!preview.date) return setFeedback({ tone: 'warn', text: 'Pick the test date first.' })
    setBusy(true)
    try {
      await saveReport({ date: preview.date, lab: preview.lab || '', sample: preview.sample || '', notes: `Imported from ${preview.fileName}`, values: preview.values })
      await refresh()
      setFeedback({ tone: 'good', text: `Saved ${Object.keys(preview.values).length} values for ${preview.date}.` })
      advancePreview()
    } catch (err) {
      setFeedback({ tone: 'warn', text: `Couldn't save: ${err?.message || 'please try again.'}` })
    } finally {
      setBusy(false)
    }
  }

  if (preview) {
    const entries = Object.entries(preview.values)
    return (
      <div className="add-data pad">
        <h3>📄 Review before saving</h3>
        {batchTotal > 1 && (
          <p className="feedback good">
            Report {batchTotal - queue.length} of {batchTotal}
            {queue.length ? ` — ${queue.length} more to review after this` : ' — last one'}
          </p>
        )}
        <p className="muted">
          {preview.source === 'photo'
            ? 'Read from your photo with on-device text recognition — OCR can misread decimals, so check each value against the paper. ⚠️ marks values that look implausible.'
            : <>Read from <strong>{preview.fileName}</strong> — uncheck anything that looks wrong.</>}
        </p>
        <label className="form-inline">
          Test date
          <input type="date" value={preview.date} onChange={(e) => setPreview({ ...preview, date: e.target.value })} />
        </label>
        {preview.dateGuess && (
          <p className="feedback warn">
            Couldn't read the test date from the file — set to today. Change it above if that's not right.
          </p>
        )}
        <table className="history preview-table">
          <tbody>
            {entries.map(([id, v]) => {
              const m = markerById(id)
              // Far outside any plausible range — usually OCR losing a decimal
              // separator (2.58 read as 258). Flag it for a second look.
              const suspect = (m.hi != null && v > m.hi * 5) || (m.lo != null && v < m.lo / 5)
              return (
                <tr key={id}>
                  <td>
                    <input
                      type="checkbox"
                      checked
                      onChange={() => {
                        const next = { ...preview.values }
                        delete next[id]
                        setPreview({ ...preview, values: next })
                      }}
                    />
                  </td>
                  <td>{m.name}</td>
                  <td>
                    {v} {m.unit}
                  </td>
                  <td>
                    <span className={`badge ${statusOf(m, v)}`}>{statusOf(m, v)}</span>
                    {suspect && <span title="Far outside the usual range — double-check against the report"> ⚠️</span>}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        <div className="report-actions">
          <button className="btn primary" onClick={confirmPreview} disabled={busy || entries.length === 0 || !preview.date}>
            {busy ? 'Saving…' : `Save ${entries.length} values`}
            {queue.length > 0 ? ' & next' : ''}
          </button>
          <button className="btn ghost" onClick={skipPreview} disabled={busy}>
            {queue.length > 0 ? 'Skip this one' : 'Discard'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="add-data pad">
      <div className="seg">
        <button className={mode === 'form' ? 'active' : ''} onClick={() => setMode('form')}>
          ✏️ Manually
        </button>
        <button className={mode === 'import' ? 'active' : ''} onClick={() => setMode('import')}>
          📄 PDF / CSV
        </button>
      </div>

      {feedback && <p className={`feedback ${feedback.tone}`}>{feedback.text}</p>}

      {mode === 'form' ? (
        <div className="form">
          <label>
            Test date
            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </label>
          <label>
            Lab (optional)
            <input type="text" placeholder="e.g. Medlab Novi Sad" value={lab} onChange={(e) => setLab(e.target.value)} />
          </label>
          {rows.map((r, i) => (
            <div className="value-row" key={i}>
              <select value={r.markerId} onChange={(e) => setRow(i, { markerId: e.target.value })}>
                <option value="">Choose marker…</option>
                {MARKERS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} ({m.unit})
                  </option>
                ))}
              </select>
              <input
                type="text"
                inputMode="decimal"
                placeholder="Value"
                value={r.value}
                onChange={(e) => setRow(i, { value: e.target.value })}
              />
            </div>
          ))}
          <button className="btn ghost small" onClick={() => setRows([...rows, { markerId: '', value: '' }])}>
            + Add another marker
          </button>
          <button className="btn primary" onClick={saveForm} disabled={busy}>
            {busy ? 'Saving…' : 'Save report'}
          </button>
        </div>
      ) : (
        <div className="form">
          <button className="btn primary" disabled={busy} onClick={() => pdfRef.current?.click()}>
            {busy && ocrProgress == null ? 'Reading PDFs…' : '📄 Upload lab PDFs'}
          </button>
          <input ref={pdfRef} type="file" accept=".pdf,application/pdf" multiple hidden onChange={onPdfFiles} />
          <button className="btn primary" disabled={busy} onClick={() => photoRef.current?.click()}>
            {ocrProgress != null
              ? `Reading photo… ${Math.round(ocrProgress * 100)}%`
              : '📷 Scan a photo'}
          </button>
          <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhotoFile} />
          <p className="muted">
            PDFs with selectable text (like MEDLAB reports) read instantly — pick several at once and
            you'll review them one at a time. For paper reports, take a photo — sharp, straight-on,
            good light — and it's read on your device (needs internet the first time to fetch the
            reader). You'll review every value before it's saved.
          </p>
          <hr className="rule" />
          <p className="muted">
            CSV: one row per value, <code>date,marker,value</code> — e.g.{' '}
            <code>2024-06-10,tsh,1.71</code>. Serbian marker names and <code>10.06.2024</code> dates
            work too.
          </p>
          <textarea
            rows={6}
            placeholder={'date,marker,value\n2021-03-15,vitd,32\n2021-03-15,tsh,2.8'}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
          />
          <div className="report-actions">
            <button className="btn ghost" onClick={() => importText(csvText)} disabled={busy}>
              Import pasted text
            </button>
            <button className="btn ghost" onClick={() => csvRef.current?.click()}>
              Choose .csv file
            </button>
            <input ref={csvRef} type="file" accept=".csv,.txt" hidden onChange={onCsvFile} />
          </div>
        </div>
      )}
    </div>
  )
}
