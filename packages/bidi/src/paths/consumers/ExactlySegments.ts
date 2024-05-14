import {PathConsumer} from "./index";

export class ExactlySegments implements PathConsumer {
    constructor(readonly count: number) {
    }

    consume(path: string): number {
        const segments = path.split('/', this.count);
        return segments.length !== this.count
            ? -1
            : segments.reduce(
                (acc, s) =>
                    acc + 1 + s.length, -1);
    }
}