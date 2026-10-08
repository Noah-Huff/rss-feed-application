import type { FeedItem } from '../models/feedModel'; // match your types path

interface ItemCardProps {
  item: FeedItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString()
    : 'Date unknown';

  return (
    <article>
      {item.imageUrl && <img src={item.imageUrl} alt="" loading="lazy" />}
      <h2>
        <a href={item.link} target="_blank" rel="noopener noreferrer">
          {item.title}
        </a>
      </h2>
      {item.description && <p>{item.description}</p>}
      <time dateTime={item.publishedAt ?? undefined}>{date}</time>
    </article>
  );
}