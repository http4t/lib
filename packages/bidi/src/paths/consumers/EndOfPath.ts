import {PathConsumer} from "./";

/**
 * Consumes everything left in the path
 */
export class EndOfPath implements PathConsumer {
    consume(path: string): number {
        return path === "" ? -1 : path.length;
    }
}