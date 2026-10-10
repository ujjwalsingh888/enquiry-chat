interface PlateProps {
  number: string
  tone?: 'dark' | 'light'
}

/** A small house-number plate. It is decorative: the address is always shown beside it. */
export function Plate({ number, tone = 'light' }: PlateProps) {
  const colors =
    tone === 'dark'
      ? 'border-brass-light/70 bg-brass-light/10 text-brass-light'
      : 'border-brass bg-brass-light/25 text-brass-dark'
  return (
    <span
      aria-hidden="true"
      className={`grid h-10 w-10 shrink-0 place-items-center rounded-md border text-sm font-bold ${colors}`}
    >
      {number}
    </span>
  )
}
