import Parser from "rss-parser";
import { InvalidFeedUrlError } from "../errors.js";
import { assertPublicURL } from "./feedUrl.js";
import type { FeedItem, ParsedFeed } from "../types/feed.js";

const MAX_REDIRECTS = Number(process.env.FEED_MAX_REDIRECTS) || 3;
const TIMEOUT_MS = Number(process.env.FEED_FETCH_TIMEOUT_MS) || 10_000;
const MAX_BYTES = Number(process.env.FEED_MAX_BYTES) || 2_000_000;
const DESCRIPTION_MAX_CHARS = Number(process.env.FEED_DESCRIPTION_MAX_CHARS || 500);

type MediaAttrs = { $?: { url?: string; medium?: string; type?: string } };
type CustomItem = {
    mediaContent?: MediaAttrs[];
    mediaThumbnail?: MediaAttrs[];
    itunesImage?: { $?: { href?: string } };
    "content:encoded"?: string;
};
type RawFeed = Parser.Output<CustomItem>;
type RawItem = RawFeed["items"][number];

const parser = new Parser<Record<string, unknown>, CustomItem>({
    customFields: {
        item: [
            ["media:content", "mediaContent", { keepArray: true }],
            ["media:thumbnail", "mediaThumbnail", { keepArray: true }],
            ["itunes:image", "itunesImage"],
            "content:encoded",
        ],
    },
});

async function fetchGuarded(startUrl: string): Promise<Response> {
    let url = startUrl;

    for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
        await assertPublicURL(url);

        let res: Response
        try {
            res = await fetch(url, {
                redirect: 'manual',
                signal: AbortSignal.timeout(TIMEOUT_MS),
                headers: { Accept: "application/rss+xml, application/atom+xml, application/xml, text/xml" }
            });
        } catch {
            throw new InvalidFeedUrlError("Could not reach the feed");
        }

        if (res.status >= 300 && res.status < 400) {
            const location = res.headers.get('location');
            await res.body?.cancel();
            if (!location) {
                throw new InvalidFeedUrlError('Redirect without a location.')
            }
            url = new URL(location, url).toString();
            continue;
        }

        if (!res.ok) throw new InvalidFeedUrlError(`Feed returned ${res.status}`);
        return res;
    }

    throw new InvalidFeedUrlError('Too many redirects.');
}

async function readTextCapped(res: Response, maxBytes: number): Promise<string> {
    const contentLength = Number(res.headers.get('content-length'));
    if (contentLength && contentLength > maxBytes) {
        await res.body?.cancel();
        throw new InvalidFeedUrlError('Feed is too large.');
    }
    if (!res.body) return '';

    const decoder = new TextDecoder();
    let received = 0;
    let text = '';

    for await (const chunk of res.body) {
        received += chunk.byteLength;
        if (received > maxBytes) throw new InvalidFeedUrlError('Feed is too large.');
        text += decoder.decode(chunk, { stream: true });
    }

    return text + decoder.decode();
}

function toHttpUrl(value: unknown, base?: string): string | null {
    if (typeof value !== "string" || !value.trim()) return null;
    try {
        const url = new URL(value.trim(), base);
        return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
    } catch {
        return null;
    }
}

function parseDate(value: string | undefined): Date | null {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

function toPlainText(html: string): string {
    return html
        .replace(/<(script|style)[\s\S]*?<\/\1>/gi, " ")
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&")
        .replace(/\s+/g, " ")
        .trim();
}

const IMAGE_EXT = /\.(jpe?g|png|gif|webp|avif)(\?|$)/i;

function extractImage(item: RawItem, base: string): string | null {
    // 1. enclosure with an image type
    if (item.enclosure?.type?.startsWith("image/")) {
        const url = toHttpUrl(item.enclosure.url, base);
        if (url) return url;
    }

    // 2. media:content that looks like an image
    for (const m of item.mediaContent ?? []) {
        const attrs = m.$;
        const looksLikeImage =
            attrs?.medium === "image" ||
            attrs?.type?.startsWith("image/") ||
            IMAGE_EXT.test(attrs?.url ?? "");
        const url = looksLikeImage ? toHttpUrl(attrs?.url, base) : null;
        if (url) return url;
    }

    // 3. media:thumbnail, then itunes:image
    for (const m of item.mediaThumbnail ?? []) {
        const url = toHttpUrl(m.$?.url, base);
        if (url) return url;
    }
    const itunes = toHttpUrl(item.itunesImage?.$?.href, base);
    if (itunes) return itunes;

    // 4. first <img> in the item's HTML
    const html = item["content:encoded"] ?? item.content ?? item.summary ?? "";
    const match = html.match(/<img[^>]+src=["']([^"']+)["']/i);
    return toHttpUrl(match?.[1], base);
}

function normalizeFeed(raw: RawFeed, feedUrl: string): ParsedFeed {
    const base = toHttpUrl(raw.link) ?? feedUrl;
    const items: FeedItem[] = [];

    for (const item of raw.items) {
        const link = toHttpUrl(item.link, base);
        if (!link) continue; // link is notNull in the schema

        const html = item["content:encoded"] ?? item.content ?? item.summary ?? "";

        items.push({
            guid: item.guid?.trim() || link,
            title: item.title?.trim() || "Untitled",
            description: toPlainText(html).slice(0, DESCRIPTION_MAX_CHARS),
            link,
            imageUrl: extractImage(item, base),
            publishedAt: parseDate(item.isoDate ?? item.pubDate),
        });
    }

    return {
        title: raw.title?.trim() || new URL(feedUrl).hostname,
        items,
    };
}

export async function fetchAndParseFeed(url: string): Promise<ParsedFeed> {
    const res = await fetchGuarded(url);
    const xml = await readTextCapped(res, MAX_BYTES);

    let raw: RawFeed;
    try {
        raw = await parser.parseString(xml)
    } catch {
        throw new InvalidFeedUrlError("URL did not return a valid RSS or Atom feed");
    }
    return normalizeFeed(raw, url);
}
