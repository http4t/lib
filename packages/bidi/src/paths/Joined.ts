import {isFailure, success} from "@http4t/result";
import {NOOP} from "./NoopPath";
import {PathMatcher, PathResult} from "./PathMatcher";
import {joinPaths} from "@http4t/core/uri";

export class Joined<A = unknown, B = unknown> implements PathMatcher<A & B> {
    constructor(private readonly a: PathMatcher<A>,
                private readonly b: PathMatcher<B>) {
    }

    consume(path: string): PathResult<A & B> {
        const a = this.a.consume(path);
        if (isFailure(a)) return a;

        const b = this.b.consume(a.value.remaining);
        if (isFailure(b)) return b;

        const value = {...a.value.value, ...b.value.value};

        return success(
            {
                value,
                remaining: b.value.remaining
            }
        );

    }

    expand(value: A & B): string {
        return joinPaths(
            this.a.expand(value),
            this.b.expand(value));
    }
}

/**
 * Note- not typesafe. Prefer path()
 */
export function join<T>(...segments: (PathMatcher<any> | undefined)[]): PathMatcher<T> {
    return segments.reduce(
        (acc, segment) =>
            typeof acc === "undefined"
                ? segment
                : typeof segment === "undefined"
                ? acc
                : new Joined(acc, segment),
        undefined) || NOOP as PathMatcher<T>;
}