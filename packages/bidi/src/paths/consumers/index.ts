import {leading} from "@http4t/core/uri";

/**
 * Function which, given a path with leading slashes removed, tells me which index to consume until.
 *
 * Returning -1 if nothing can be consumed (e.g. path is empty, not long enough, etc.)
 */
export interface PathConsumer {
    consume(pathNoLeadingSlashes: string): number
}

export type Consumed = {
    captured: string,
    consumed: string
    remaining: string
};

/**
 * 1. consume leading slashes from path
 * 2. use consumer to capture some substring of what's left, e.g. everything until the index of the first '/'
 */
export function consume(path: string, consumer: PathConsumer): Consumed | undefined {
    const prefix = path.match(leading)?.[0] || "";

    const leadingStripped = path.substring(prefix.length);

    const index = consumer.consume(leadingStripped);
    if (index < 0) return undefined;
    if (index >= leadingStripped.length) throw new Error(`cannot consume ${index} characters from ${leadingStripped.length} character path '${leadingStripped}'`);

    const captured = leadingStripped.substring(0, index);

    const consumed = prefix + captured;
    return {
        captured,
        consumed,
        remaining: path.substring(consumed.length)
    }
}

