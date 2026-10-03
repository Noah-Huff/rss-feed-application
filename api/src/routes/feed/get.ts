import type { FastifyInstance } from "fastify";
import Parser from 'rss-parser';
import type { GetFeed } from "../../types/feed.js";

export default async function(fastify: FastifyInstance) {
    fastify.get('/', { preHandler: [fastify.authenticate] }, async (): Promise<any> => {

         const parser = new Parser({
            customFields: {
                item: ['media:thumbnail']
            }
        });
        const feed = await parser.parseURL('https://www.reddit.com/.rss');
        
        const result: Array<GetFeed> = feed.items
            .map(item => ({ 
                imageUrl: item["media:thumbnail"]?.$?.url || '',
                title: item.title || '',
                pubDate: item.pubDate || '',
                description: item.summary || ''
            }));

        return result;
    });
}