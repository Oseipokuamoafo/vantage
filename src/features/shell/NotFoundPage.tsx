import { Link } from 'react-router-dom';
import { EmptyState, buttonClass } from '../../components/ui';

export default function NotFoundPage() {
  return (
    <EmptyState
      title="Page not found"
      action={
        <Link to="/" className={buttonClass('primary')}>
          Go home
        </Link>
      }
    >
      This address does not match any screen in Vantage.
    </EmptyState>
  );
}
