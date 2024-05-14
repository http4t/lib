import {PathConsumer} from "./";

export class UpToChars implements PathConsumer {
    constructor(readonly count: number) {
    }

    consume(path: string): number {
        return Math.min(this.count, path.length);
    }
}