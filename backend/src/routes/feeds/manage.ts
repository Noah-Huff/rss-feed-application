import type { FastifyInstance } from 'fastify';
import { addFeed, listFeeds, unsubscribe } from '../../services/feedService.js';
import {
  addFeedBodySchema,
  feedIdParamsSchema,
  itemsQuerySchema,
  feedSchema,
  feedItemSchema,
  type AddFeedBody,
  type FeedIdParams,
  type ItemsQuery,
} from '../../schemas/feed.js';
import { listItems } from '../../services/listItemsService.js';

export default async function (fastify: FastifyInstance) {
  fastify.post<{ Body: AddFeedBody }>(
    '/',
    {
      preHandler: fastify.authenticate,
      schema: {
        body: addFeedBodySchema,
        response: { 201: feedSchema },
      },
    },
    async (request, reply) => {
      const feed = await addFeed(request.user.sub, request.body.url);
      return reply.code(201).send(feed);
    },
  );

  fastify.get(
    '/',
    {
      preHandler: fastify.authenticate,
      schema: { response: { 200: { type: 'array', items: feedSchema } } },
    },
    async (request) => listFeeds(request.user.sub),
  );

  fastify.delete<{ Params: FeedIdParams }>(
    '/:id',
    {
      preHandler: fastify.authenticate,
      schema: { params: feedIdParamsSchema },
    },
    async (request, reply) => {
      await unsubscribe(request.user.sub, request.params.id);
      return reply.code(204).send();
    },
  );

  fastify.get<{ Params: FeedIdParams; Querystring: ItemsQuery }>(
    '/:id/items',
    {
      preHandler: fastify.authenticate,
      schema: {
        params: feedIdParamsSchema,
        querystring: itemsQuerySchema,
        response: { 200: { type: 'array', items: feedItemSchema } },
      },
    },
    async (request) => {
      const { query, from, to, limit, offset } = request.query;
      return listItems(request.user.sub, request.params.id, {
        query,
        from: from ? new Date(from) : undefined,
        to: to ? new Date(to) : undefined,
        limit,
        offset,
      });
    },
  );
}