import { useState } from 'react';
import type { FeedItem } from '../models/feedModel';
import "../styles/components/item-card.css";

interface ItemCardProps {
  item: FeedItem;
}

export function ItemCard({ item }: ItemCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = item.imageUrl && !imageFailed;
  const date = item.publishedAt
    ? new Date(item.publishedAt).toLocaleDateString()
    : 'Date unknown';

  return (
    <article className="item-card">
      {showImage ? (
        <img
          src={item.imageUrl!}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="item-card-placeholder" aria-hidden="true" />
      )}
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