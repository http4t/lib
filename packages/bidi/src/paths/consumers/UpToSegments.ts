import {PathConsumer} from "./";

export class UpToSegments implements PathConsumer {
    constructor(readonly count: number) {
    }

    consume(path: string): number {
        const segments = path.split('/', this.count);
        return segments.reduce((acc, s) => acc + 1 + s.length, -1);
    }
}