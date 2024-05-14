import {PathConsumer} from "./";

export class NextSlashOrEnd implements PathConsumer {
    consume(path: string): number {
        const i = path.indexOf('/');
        return i > 0
            ? i
            : path !== ""
                ? path.length
                : -1;
    }
}