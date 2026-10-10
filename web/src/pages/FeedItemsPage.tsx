import { Link, useParams } from 'react-router-dom';
import { ItemList } from '../components/ItemList';
import "../styles/pages/feeds.css";

export default function FeedItemsPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <main className="feeds">
      <Link to="/feeds">← Back to feeds</Link>
      <h1>Items</h1>
      <ItemList key={id} feedId={id} />
    </main>
  );
}