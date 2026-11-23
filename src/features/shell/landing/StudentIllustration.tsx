/** Original flat illustration: a student at a laptop comparing options. Decorative. */
export function StudentIllustration({ className = '' }: { className?: string }) {
  return (
    <svg viewBox="0 0 320 260" className={className} aria-hidden="true">
      {/* floating comparison card */}
      <g>
        <rect
          x="176"
          y="16"
          width="128"
          height="86"
          rx="16"
          fill="#fff"
          stroke="#dce3f0"
          strokeWidth="1.5"
        />
        <rect x="190" y="32" width="44" height="7" rx="3.5" fill="#0f1f4b" />
        <rect x="190" y="50" width="100" height="7" rx="3.5" fill="#eef3fd" />
        <rect x="190" y="50" width="78" height="7" rx="3.5" fill="#2563eb" />
        <rect x="190" y="64" width="100" height="7" rx="3.5" fill="#eef3fd" />
        <rect x="190" y="64" width="52" height="7" rx="3.5" fill="#2563eb" />
        <rect x="190" y="78" width="100" height="7" rx="3.5" fill="#eef3fd" />
        <rect x="190" y="78" width="88" height="7" rx="3.5" fill="#2563eb" />
      </g>
      {/* desk */}
      <rect x="20" y="206" width="280" height="12" rx="6" fill="#0f1f4b" />
      <rect x="44" y="218" width="10" height="38" rx="4" fill="#0f1f4b" />
      <rect x="266" y="218" width="10" height="38" rx="4" fill="#0f1f4b" />
      {/* plant */}
      <rect x="250" y="176" width="26" height="30" rx="6" fill="#2563eb" />
      <path d="M263 176c-2-16 4-26 14-30-1 12-6 22-14 30Z" fill="#93b4f5" />
      <path d="M263 176c-4-12-14-18-24-18 3 10 12 17 24 18Z" fill="#bcd0fa" />
      {/* chair back */}
      <rect x="40" y="120" width="22" height="88" rx="11" fill="#bcd0fa" />
      {/* person: body */}
      <path d="M66 206c0-38 12-70 44-70s44 32 44 70Z" fill="#2563eb" />
      {/* arm to laptop */}
      <path
        d="M128 168c14 8 30 18 44 30"
        stroke="#1d4ed8"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      />
      {/* neck + head */}
      <rect x="102" y="120" width="16" height="20" rx="6" fill="#f2c5a0" />
      <circle cx="110" cy="104" r="24" fill="#f2c5a0" />
      <path
        d="M86 102c0-18 12-28 26-28 13 0 22 8 23 20-9-2-18-8-22-14-5 9-14 17-27 22Z"
        fill="#0f1f4b"
      />
      <circle cx="119" cy="106" r="2.2" fill="#0f1f4b" />
      <path
        d="M116 116c3 2 7 2 9-1"
        stroke="#0f1f4b"
        strokeWidth="2"
        strokeLinecap="round"
        fill="none"
      />
      {/* laptop */}
      <path d="M160 206l12-52h70l-12 52Z" fill="#0f1f4b" />
      <rect x="150" y="202" width="96" height="6" rx="3" fill="#475569" />
      <circle cx="201" cy="180" r="5" fill="#fff" fillOpacity="0.85" />
      {/* connecting dots from laptop to card */}
      <circle cx="226" cy="140" r="3" fill="#93b4f5" />
      <circle cx="236" cy="124" r="3" fill="#93b4f5" />
      <circle cx="244" cy="110" r="3" fill="#93b4f5" />
    </svg>
  );
}
