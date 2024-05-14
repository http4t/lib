import {BaseParameterObject} from "openapi3-ts/src/model/openapi31";
import {PathConsumer} from "@http4t/bidi/paths/consumers";
import {EndOfPath} from "@http4t/bidi/paths/consumers/EndOfPath";
import {ExactlyChars} from "@http4t/bidi/paths/consumers/ExactlyChars";
import {ExactlySegments} from "@http4t/bidi/paths/consumers/ExactlySegments";
import {NextSlashOrEnd} from "@http4t/bidi/paths/consumers/NextSlashOrEnd";
import {UpToChars} from "@http4t/bidi/paths/consumers/UpToChars";
import {UpToSegments} from "@http4t/bidi/paths/consumers/UpToSegments";
import {ParameterValueContext, PathContext} from "./paths";

export type Generator<T extends PathConsumer> = (consumer: T) => PathContext | ParameterValueContext;

export type Generators = {
    endOfPath: Generator<EndOfPath>
    exactlyChars: Generator<ExactlyChars>
    exactlySegments: Generator<ExactlySegments>
    nextSlashOrEnd: Generator<NextSlashOrEnd>
    upToChars: Generator<UpToChars>
    upToSegments: Generator<UpToSegments>
}

export const defaults: Generators = {
    endOfPath: _consumer => ({
        schema: {
            type: "string",
            examples: ["path", "some/more/path"],
            pattern: ".+" // TODO: limit to url-safe chars
        }
    }),
    exactlyChars: consumer => ({
            type:"parameter-value",
            schema: {
                type: "string",
                examples: ["x".repeat(consumer.count)],
                pattern: `.[${consumer.count}]` // TODO: limit to url-safe chars
            }
        }
    ),
    exactlySegments: consumer => ({
        type:"path",
        path: "{}"
    })
}