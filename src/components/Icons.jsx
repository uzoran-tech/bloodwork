// Lightweight inline SVG icon set (stroke follows currentColor).
const I = ({ size = 20, children, filled }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? 'currentColor' : 'none'}
    stroke={filled ? 'none' : 'currentColor'}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
  >
    {children}
  </svg>
)

export const IconPulse = (p) => (
  <I {...p}>
    <path d="M3 12h4l2.5-7 4.5 14 2.5-7H21" />
  </I>
)

export const IconTrend = (p) => (
  <I {...p}>
    <path d="M3 17l6-6 4 4 7-7" />
    <path d="M14 8h6v6" />
  </I>
)

export const IconReports = (p) => (
  <I {...p}>
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <path d="M14 2v6h6" />
    <path d="M8 13h8M8 17h5" />
  </I>
)

export const IconPlus = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v8M8 12h8" />
  </I>
)

export const IconSun = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
  </I>
)

export const IconMoon = (p) => (
  <I {...p}>
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
  </I>
)

export const IconClose = (p) => (
  <I {...p}>
    <path d="M18 6L6 18M6 6l12 12" />
  </I>
)

export const IconExport = (p) => (
  <I {...p}>
    <path d="M12 3v12" />
    <path d="M7 10l5 5 5-5" />
    <path d="M4 21h16" />
  </I>
)

export const IconTrash = (p) => (
  <I {...p}>
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </I>
)

export const IconDrop = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden>
    <path d="M16 3C16 3 7 14.5 7 20.5a9 9 0 0 0 18 0C25 14.5 16 3 16 3Z" fill="var(--red)" />
    <path
      d="M11.5 21h2.6l1.4-3.4 2 5.8 1.5-2.4h1.5"
      stroke="#fff"
      strokeWidth="1.6"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
