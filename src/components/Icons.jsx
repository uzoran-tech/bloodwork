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

export const IconBell = (p) => (
  <I {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </I>
)

export const IconFlask = (p) => (
  <I {...p}>
    <path d="M9 3h6M10 3v5.5L4.7 18A2 2 0 0 0 6.5 21h11A2 2 0 0 0 19.3 18L14 8.5V3" />
    <path d="M8 14h8" />
  </I>
)

export const IconCheckCircle = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M8.4 12.4l2.4 2.4 4.8-5.2" />
  </I>
)

export const IconArrowUp = (p) => (
  <I {...p}>
    <path d="M12 19V6M6 12l6-6 6 6" />
  </I>
)

export const IconArrowDown = (p) => (
  <I {...p}>
    <path d="M12 5v13M6 12l6 6 6-6" />
  </I>
)

export const IconInfo = (p) => (
  <I {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16.5v-5M12 8h.01" />
  </I>
)

export const IconVial = (p) => (
  <I {...p}>
    <path d="M7 3h10M9 3v13a3 3 0 0 0 6 0V3" />
    <path d="M9 9h6" />
  </I>
)

export const IconSearch = (p) => (
  <I {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="M21 21l-4.3-4.3" />
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
