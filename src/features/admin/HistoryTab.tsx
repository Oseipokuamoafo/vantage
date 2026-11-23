import { EmptyState } from '../../components/ui';
import { useHistory } from '../../data/history';

export function HistoryTab() {
  const history = useHistory();
  if (!history.length)
    return (
      <EmptyState title="No edits yet">
        Changes made in the content manager are listed here.
      </EmptyState>
    );
  return (
    <div
      className="relative overflow-x-auto rounded-card border border-border bg-surface shadow-soft"
      role="region"
      aria-label="Edit history"
      tabIndex={0}
    >
      <table className="w-full min-w-[36rem] text-left text-sm">
        <caption className="sr-only">Edit history, newest first</caption>
        <thead className="bg-paper-sunk">
          <tr>
            <th scope="col" className="p-3">
              When
            </th>
            <th scope="col" className="p-3">
              Who
            </th>
            <th scope="col" className="p-3">
              What
            </th>
            <th scope="col" className="p-3">
              Change
            </th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-t border-line align-top">
              <td className="whitespace-nowrap p-3 text-ink-muted">
                <time dateTime={h.at}>{new Date(h.at).toLocaleString()}</time>
              </td>
              <td className="p-3">{h.actorEmail}</td>
              <td className="p-3">
                {h.action} {h.entity}
              </td>
              <td className="p-3">{h.summary}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
