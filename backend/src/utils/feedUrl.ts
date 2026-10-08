import { BlockList, isIP } from 'node:net';
import { InvalidFeedUrlError } from '../errors.js';
import { lookup } from 'node:dns/promises';

const blocked = new BlockList();
blocked.addSubnet('0.0.0.0', 8, 'ipv4');
blocked.addSubnet('10.0.0.0', 8, 'ipv4');
blocked.addSubnet('127.0.0.0', 8, 'ipv4');
blocked.addSubnet('169.254.0.0', 16, 'ipv4');
blocked.addSubnet('172.16.0.0', 12, 'ipv4');
blocked.addSubnet('192.168.0.0', 16, 'ipv4');
blocked.addAddress('::1', 'ipv6');
blocked.addSubnet('fc00::', 7, 'ipv6');
blocked.addSubnet('fe80::', 10, 'ipv6');

export function normalizeUrl(rawUrl: string): string {
    let url: URL;

    try {
        url = new URL(rawUrl.trim());
    } catch {
        throw new InvalidFeedUrlError();
    }
    url.hash = '';
    if (url.pathname.length > 1 && url.pathname.endsWith('/')) {
        url.pathname = url.pathname.slice(0, -1);
    }

    return url.toString();
}

export async function assertPublicURL(rawUrl: string): Promise<void> {
    const url = new URL(rawUrl);

    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
        throw new InvalidFeedUrlError('Must be an http or https url.');
    }

        // IPv6 literals arrive wrapped in brackets, so strip them
    const host = url.hostname.replace(/^\[|\]$/g, "");
    const literal = isIP(host);

    let addresses: { address: string; family: number }[];
    try {
        addresses = literal
            ? [{ address: host, family: literal }]
            : await lookup(host, { all: true});
    } catch {
        throw new InvalidFeedUrlError('Could not resolve host.');
    }

    for (const { address, family } of addresses) {
        if (blocked.check(address, family === 6 ? "ipv6" : "ipv4")) {
            throw new InvalidFeedUrlError("URL points to a private address");
        }
    }
}