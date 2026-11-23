/** Original Vantage wordmark: a rounded blue tile with a "V" path and a viewpoint dot. */
export function Logo() {
  return (
    <span className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
        <rect width="32" height="32" rx="9" fill="#2563eb" />
        <path
          d="M9 10.5 16 22l7-11.5"
          fill="none"
          stroke="#fff"
          strokeWidth="3.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="16" cy="8" r="2.4" fill="#fff" />
      </svg>
      <span className="text-xl font-extrabold tracking-[-0.03em] text-navy">Vantage</span>
    </span>
  );
}
