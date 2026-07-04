type Size = 'sm' | 'md' | 'lg';

const sizes: Record<Size, { box: string; text: string; sub: string }> = {
  sm: { box: 'h-8 w-8', text: 'text-base', sub: 'text-[10px]' },
  md: { box: 'h-10 w-10', text: 'text-lg', sub: 'text-xs' },
  lg: { box: 'h-14 w-14', text: 'text-2xl', sub: 'text-sm' },
};

export function BrandMark({ size = 'md', className = '' }: { size?: Size; className?: string }) {
  const s = sizes[size];
  return (
    <div className={`inline-flex items-center gap-3 ${className}`}>
      <div
        className={`${s.box} rounded-xl bg-gradient-to-br from-sky-500 via-indigo-500 to-fuchsia-500 grid place-items-center text-white shadow-lg shadow-indigo-500/30 ring-1 ring-white/20`}
      >
        <svg viewBox="0 0 64 64" className="h-2/3 w-2/3" aria-hidden="true">
          <path d="M27 14h10v10h10v10H37v10H27V34H17V24h10z" fill="currentColor" />
          <path
            d="M6 46 L22 46 L26 38 L32 54 L38 30 L44 46 L58 46"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className={`${s.text} font-semibold tracking-tight`}>
          <span className="bg-gradient-to-r from-sky-600 via-indigo-600 to-fuchsia-600 bg-clip-text text-transparent">
            MedCare
          </span>
          <span className="text-slate-800"> Connect</span>
        </div>
        <div className={`${s.sub} text-slate-500`}>MedCare Hospital · Operations Portal</div>
      </div>
    </div>
  );
}

export function BrandMarkOnDark({ size = 'md' }: { size?: Size }) {
  const s = sizes[size];
  return (
    <div className="inline-flex items-center gap-3">
      <div
        className={`${s.box} rounded-xl bg-gradient-to-br from-sky-400 via-indigo-500 to-fuchsia-500 grid place-items-center text-white shadow-lg shadow-fuchsia-500/30 ring-1 ring-white/20`}
      >
        <svg viewBox="0 0 64 64" className="h-2/3 w-2/3" aria-hidden="true">
          <path d="M27 14h10v10h10v10H37v10H27V34H17V24h10z" fill="currentColor" />
          <path
            d="M6 46 L22 46 L26 38 L32 54 L38 30 L44 46 L58 46"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            opacity="0.6"
          />
        </svg>
      </div>
      <div className="leading-tight">
        <div className={`${s.text} font-semibold tracking-tight text-white`}>
          MedCare <span className="text-sky-300">Connect</span>
        </div>
        <div className={`${s.sub} text-slate-300`}>MedCare Hospital</div>
      </div>
    </div>
  );
}
