import { useEffect, useId, useRef, useState } from 'react';
import { OPEN_HELP_EVENT } from './helpEvents';

const FAQ = [
  {
    q: 'How Vantage works',
    a: [
      'Set up a profile, pick a goal and enter your weekly hours, budget and semesters left.',
      'Every opportunity is rated 0–10 on time commitment, skill development and signaling value, using weightings for your goal.',
      'Your constraints appear as a separate fit check, so you can see the rating and the fit side by side.',
      'Compare 2–4 options, lay them out by semester and save the plan.',
    ],
  },
  {
    q: 'About the data',
    a: [
      'Everything in this prototype is sample data, labelled “Team estimate” or “Limited data”. Nothing is presented as a real statistic.',
      'Outcome figures only appear when at least 10 students reported them; below that you see “No data yet”.',
      'Accounts and plans are stored in your browser only.',
    ],
  },
];

export function HelpBubble() {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const button = useRef<HTMLButtonElement>(null);
  const heading = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_HELP_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_HELP_EVENT, onOpen);
  }, []);

  useEffect(() => {
    if (!open) return;
    heading.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const close = () => {
    setOpen(false);
    button.current?.focus();
  };

  return (
    <div className="fixed bottom-4 right-4 z-30 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-modal="false"
          aria-labelledby={`${panelId}-title`}
          className="max-h-[min(70vh,32rem)] w-[min(22rem,calc(100vw-2rem))] overflow-y-auto rounded-card border border-border bg-surface p-5 shadow-hover"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <h2
              id={`${panelId}-title`}
              ref={heading}
              tabIndex={-1}
              className="text-lg font-extrabold outline-none"
            >
              Quick help
            </h2>
            <button
              type="button"
              onClick={close}
              aria-label="Close help"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-navy hover:bg-tint"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
                <path
                  d="M4 4l8 8M12 4l-8 8"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <details
                key={item.q}
                open={i === 0}
                className="disclosure rounded-2xl bg-page px-4 py-3"
              >
                <summary className="font-semibold text-navy">{item.q}</summary>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 text-sm text-body">
                  {item.a.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </details>
            ))}
          </div>
        </div>
      )}
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? 'Close help' : 'Open help: how Vantage works and about the data'}
        onClick={() => setOpen((o) => !o)}
        className="hidden items-center justify-center rounded-full bg-primary text-white shadow-hover sm:flex transition duration-brand ease-brand hover:-translate-y-px hover:bg-primary-hover"
        style={{ width: 52, height: 52 }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
          <path
            d="M5 5.5h14a1.5 1.5 0 0 1 1.5 1.5v8.5a1.5 1.5 0 0 1-1.5 1.5h-7l-4.5 3.5V17H5A1.5 1.5 0 0 1 3.5 15.5V7A1.5 1.5 0 0 1 5 5.5Z"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M10.2 9.3a1.8 1.8 0 1 1 2.4 1.7c-.4.2-.6.5-.6.9v.3M12 13.9v.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
          />
        </svg>
      </button>
    </div>
  );
}
