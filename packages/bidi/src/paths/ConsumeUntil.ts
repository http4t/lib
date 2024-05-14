import {failure, success} from "@http4t/result";
import {consume, PathConsumer} from "./consumers";
import {PathMatcher, PathResult} from "./PathMatcher";
import {UpToChars} from "./consumers/UpToChars";
import {ExactlyChars} from "./consumers/ExactlyChars";
import {NextSlashOrEnd} from "./consumers/NextSlashOrEnd";
import {EndOfPath} from "./consumers/EndOfPath";

export class ConsumeUntil implements PathMatcher<string> {
    static nextSlashOrEnd = new ConsumeUntil(new NextSlashOrEnd());
    static endOfPath = new ConsumeUntil(new EndOfPath());

    constructor(readonly consumer: PathConsumer) {
    }

    static exactlyChars(count: number): PathMatcher<string> {
        return new ConsumeUntil(new ExactlyChars(count));
    }

    static upToChars(count: number): PathMatcher<string> {
        return new ConsumeUntil(new UpToChars(count));
    }

    consume(path: string): PathResult<string> {
        const consumed = consume(path, this.consumer);
        if (!consumed) return failure({message: "path did not match", remaining: path});

        return success({
            value: consumed.captured,
            remaining: consumed.remaining
        });
    }

    expand(value: string): string {
        return value;
    }
}
