import { useRef, useState } from 'react'
import { MARKERS, markerById, statusOf } from '../catalog.js'
import { mergeReport, parseCSV } from '../store.js'

const todayISO = () => new Date().toISOString().slice(0, 10)

export default function AddData({ reports, setReports, done }) {
  const [mode, setMode] = useState('form')
  const [date, setDate] = useState('')
  const [lab, setLab] = useState('')
  const [rows, setRows] = useState([{ markerId: '', value: '' }])
  const [csvText, setCsvText] = useState('')
  const [feedback, setFeedback] = useState(null)
  const [busy, setBusy] = useState(false)
  const [preview, setPreview] = useState(null) // { date, values, fileName }
  const [ocrProgress, setOcrProgress] = useState(null) // 0..1 while reading a photo
  const csvRef = useRef(null)
  const pdfRef = useRef(null)
  const photoRef = useRef(null)

  function setRow(i, patch) {
    setRows(rows.map((r, j) => (j === i ? { ...r, ...patch } : r)))
  }

  function saveForm() {
    if (!date) return setFeedback({ tone: 'warn', text: 'Pick the test date first.' })
    const values = {}
    for (const r of rows) {
      const v = parseFloat(String(r.value).replace(',', '.'))
      if (r.markerId && isFinite(v)) values[r.markerId] = v
    }
    if (Object.keys(values).length === 0)
      return setFeedback({ tone: 'warn', text: 'Add at least one marker value.' })
    setReports(mergeReport(reports, { date, lab, notes: '', values }))
    setFeedback({ tone: 'good', text: `Saved report for ${date}.` })
    setRows([{ markerId: '', value: '' }])
    setTimeout(done, 600)
  }

  function importText(text) {
    const { reports: parsed, imported, errors } = parseCSV(text)
    if (imported === 0) {
      return setFeedback({ tone: 'warn', text: `Nothing imported. ${errors[0] || 'Expected rows like: 2024-06-10,tsh,1.71'}` })
    }
    let next = reports
    for (const r of parsed) next = mergeReport(next, r)
    setReports(next)
    setFeedback({
      tone: 'good',
      text: `Imported ${imported} values across ${parsed.length} dates.${errors.length ? ` Skipped ${errors.length} rows.` : ''}`,
    })
    setCsvText('')
    setTimeout(done, 900)
  }

  function onCsvFile(e) {
    const f = e.target.files?.[0]
    if (!f) return
    const reader = new FileReader()
    reader.onload = () => importText(String(reader.result))
    reader.readAsText(f)
    e.target.value = ''
  }

  async function onPdfFile(e) {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setBusy(true)
    setFeedback(null)
    try {
      const { extractPdfLines, parseLabLines } = await import('../pdfimport.js')
      const lines = await extractPdfLines(f)
      const { date: d, values, lab, sample } = parseLabLines(lines)
      if (Object.keys(values).length > 0) {
        setPreview({ date: d || todayISO(), dateGuess: !d, values, fileName: f.name, lab, sample })
      } else if (lines.length === 0) {
        setFeedback({
          tone: 'warn',
          text: 'This PDF has no selectable text — it is probably a scan or photo. Try CSV or manual entry — or send the PDF to your assistant to convert.',
        })
      } else {
        setFeedback({
          tone: 'warn',
          text: 'Read the PDF but did not recognize any marker values in it. Try CSV or manual entry — or send the PDF to your assistant to convert.',
        })
      }
    } catch (err) {
      const name = err?.name || ''
      let text
      if (name === 'PasswordException') {
        text = 'This PDF is password-protected. Save an unlocked copy (e.g. open it and print/share as PDF) and try again.'
      } else if (name === 'InvalidPDFException') {
        text = 'That file does not look like a valid PDF. Re-download it and try again.'
      } else {
        text = `Failed to read that PDF${err?.message ? ` (${err.message})` : ''}. Try CSV or manual entry instead.`
      }
      setFeedback({ tone: 'warn', text })
    } finally {
      setBusy(false)
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

  function confirmPreview() {
    if (!preview.date) return setFeedback({ tone: 'warn', text: 'Pick the test date first.' })
    setReports(mergeReport(reports, { date: preview.date, lab: preview.lab || '', sample: preview.sample || '', notes: `Imported from ${preview.fileName}`, values: preview.values }))
    setFeedback({ tone: 'good', text: `Saved ${Object.keys(preview.values).length} values for ${preview.date}.` })
    setPreview(null)
    setTimeout(done, 800)
  }

  if (preview) {
    const entries = Object.entries(preview.values)
    return (
      <div className="add-data pad">
        <h3>📄 Review before saving</h3>
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
          <button className="btn primary" onClick={confirmPreview} disabled={entries.length === 0 || !preview.date}>
            Save {entries.length} values
          </button>
          <button className="btn ghost" onClick={() => setPreview(null)}>
            Discard
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
          <button className="btn primary" onClick={saveForm}>
            Save report
          </button>
        </div>
      ) : (
        <div className="form">
          <button className="btn primary" disabled={busy} onClick={() => pdfRef.current?.click()}>
            {busy && ocrProgress == null ? 'Reading PDF…' : '📄 Upload lab PDF'}
          </button>
          <input ref={pdfRef} type="file" accept=".pdf,application/pdf" hidden onChange={onPdfFile} />
          <button className="btn primary" disabled={busy} onClick={() => photoRef.current?.click()}>
            {ocrProgress != null
              ? `Reading photo… ${Math.round(ocrProgress * 100)}%`
              : '📷 Scan a photo'}
          </button>
          <input ref={photoRef} type="file" accept="image/*" hidden onChange={onPhotoFile} />
          <p className="muted">
            PDFs with selectable text (like MEDLAB reports) read instantly. For paper reports, take
            a photo — sharp, straight-on, good light — and it's read on your device (needs internet
            the first time to fetch the reader). You'll review every value before it's saved.
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
            <button className="btn ghost" onClick={() => importText(csvText)}>
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
