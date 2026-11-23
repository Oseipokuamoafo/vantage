import { useRef, useState, type KeyboardEvent } from 'react';
import { PageHeader } from '../../components/ui';
import { useCurrentUser } from '../../data/auth';
import { GoalTypesTab } from './GoalTypesTab';
import { HistoryTab } from './HistoryTab';
import { OpportunitiesTab } from './OpportunitiesTab';
import { OutcomesTab } from './OutcomesTab';
import { SettingsTab } from './SettingsTab';

const TABS = [
  { id: 'opportunities', label: 'Opportunities' },
  { id: 'goals', label: 'Goal types & weightings' },
  { id: 'outcomes', label: 'Outcome data' },
  { id: 'settings', label: 'Settings' },
  { id: 'history', label: 'Edit history' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export default function AdminPage() {
  const user = useCurrentUser();
  const [tab, setTab] = useState<TabId>('opportunities');
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});
  if (!user) return null;

  function onKeyDown(e: KeyboardEvent, i: number) {
    let next = i;
    if (e.key === 'ArrowRight') next = (i + 1) % TABS.length;
    else if (e.key === 'ArrowLeft') next = (i - 1 + TABS.length) % TABS.length;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = TABS.length - 1;
    else return;
    e.preventDefault();
    const id = TABS[next]!.id;
    setTab(id);
    refs.current[id]?.focus();
  }

  return (
    <div>
      <PageHeader
        title="Content manager"
        description="Edit the catalog, goal types and weightings, and outcome data. Every change is logged and takes effect immediately for students in this browser."
      />
      <div
        role="tablist"
        aria-label="Content sections"
        className="mb-6 flex gap-1 overflow-x-auto border-b border-line"
      >
        {TABS.map((t, i) => (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[t.id] = el;
            }}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)}
            onKeyDown={(e) => onKeyDown(e, i)}
            className={`min-h-[44px] whitespace-nowrap border-b-2 px-3 text-sm font-medium ${
              tab === t.id
                ? 'border-accent text-accent-strong'
                : 'border-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} tabIndex={0}>
        {tab === 'opportunities' && <OpportunitiesTab actor={user.email} />}
        {tab === 'goals' && <GoalTypesTab actor={user.email} />}
        {tab === 'outcomes' && <OutcomesTab actor={user.email} />}
        {tab === 'settings' && <SettingsTab actor={user.email} />}
        {tab === 'history' && <HistoryTab />}
      </div>
    </div>
  );
}
