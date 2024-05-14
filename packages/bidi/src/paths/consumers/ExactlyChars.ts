import {PathConsumer} from "./";

export class ExactlyChars implements PathConsumer{
    constructor(readonly count: number) {
    }

    consume(pathNoLeadingSlashes: string): number {
        return pathNoLeadingSlashes.length < this.count ? -1 : this.count;
    }

}