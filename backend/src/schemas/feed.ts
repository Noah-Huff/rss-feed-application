export interface AddFeedBody {
  url: string;
}

export interface FeedIdParams {
  id: string;
}

export type ItemSortBy = 'publishedAt' | 'title' | 'description';
export type SortOrder = 'asc' | 'desc';
export interface ItemsQuery {
  query?: string;
  from?: string;
  to?: string;
  limit: number;
  offset: number;
  sortBy: ItemSortBy;
  order: SortOrder;
}

export interface DiscoverFilters {
    query?: string | undefined,
    limit: number,
    offset: number
}

export const addFeedBodySchema = {
  type: 'object',
  required: ['url'],
  properties: { url: { type: 'string', minLength: 1, maxLength: 2048 } },
} as const;

export const feedIdParamsSchema = {
  type: 'object',
  required: ['id'],
  properties: { id: { type: 'string', format: 'uuid' } },
} as const;

export const itemsQuerySchema = {
  type: 'object',
  properties: {
    query: { type: 'string', maxLength: 200 },
    from: { type: 'string', format: 'date-time' },
    to: { type: 'string', format: 'date-time' },
    limit: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
    offset: { type: 'integer', minimum: 0, default: 0 },
    sortBy: {
      type: 'string',
      enum: ['publishedAt', 'title', 'description'],
      default: 'publishedAt',
    },
    order: { type: 'string', enum: ['asc', 'desc'], default: 'desc' },
  },
} as const;

export const feedSchema = {
  type: 'object',
  required: ['id', 'url', 'title', 'lastFetchedAt', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    url: { type: 'string' },
    title: { type: 'string' },
    lastFetchedAt: { type: ['string', 'null'], format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;

export const feedItemSchema = {
  type: 'object',
  required: ['id', 'feedId', 'guid', 'title', 'description', 'link', 'imageUrl', 'publishedAt', 'createdAt'],
  properties: {
    id: { type: 'string', format: 'uuid' },
    feedId: { type: 'string', format: 'uuid' },
    guid: { type: 'string' },
    title: { type: 'string' },
    description: { type: 'string' },
    link: { type: 'string' },
    imageUrl: { type: ['string', 'null'] },
    publishedAt: { type: ['string', 'null'], format: 'date-time' },
    createdAt: { type: 'string', format: 'date-time' },
  },
} as const;