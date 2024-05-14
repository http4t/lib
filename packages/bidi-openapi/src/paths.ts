import {PathMatcher} from "@http4t/bidi/paths/PathMatcher";
import {BooleanPath} from "@http4t/bidi/paths/parsers/BooleanPath";
import {ConsumeUntil} from "@http4t/bidi/paths/ConsumeUntil";
import {FloatPath} from "@http4t/bidi/paths/parsers/FloatPath";
import {IntPath} from "@http4t/bidi/paths/parsers/IntParser";
import {Joined} from "@http4t/bidi/paths/Joined";
import {Literal} from "@http4t/bidi/paths/Literal";
import {NoopPath} from "@http4t/bidi/paths/NoopPath";
import {SplitStringPath} from "@http4t/bidi/paths/parsers/SplitStringPath";
import {VariablePath} from "@http4t/bidi/paths/variables";
import {BaseParameterObject} from "openapi3-ts/src/model/openapi31";

export type IContext<T extends string> = {
    type: T;
}
export type ParameterValueContext =
    IContext<"parameter-value"> &
    BaseParameterObject;
export type ParameterContext =
    IContext<"parameter"> &
    BaseParameterObject &
    {
        name: string;
    };
export type PathContext =
    IContext<"path"> &
    {
        path: string;
        parameters: ParameterContext[]
    };

export type Context = PathContext | ParameterContext | ParameterValueContext;

export type Generator<T extends PathMatcher> = (matcher: T, generateChild: Generator<any>) => Context;

export type Generators = {
    boolean: Generator<BooleanPath>
    consumeUntil: Generator<ConsumeUntil>
    float: Generator<FloatPath>
    int: Generator<IntPath>
    joined: Generator<Joined>
    literal: Generator<Literal>
    noop: Generator<NoopPath>
    splitString: Generator<SplitStringPath>
    variable: Generator<VariablePath>
}

export const defaults: Generators = {
    boolean: matcher => ({
            type: "parameter-value",
            required: true,
            allowEmptyValue: false,
            schema: {
                type: "boolean",
                examples: ["true", "false"]
            }
        }
    ),
    consumeUntil: (matcher, generateChild) => {

    }
}

export function selectGenerator(matcher: PathMatcher, generators: Generators): Generator<any> {
    if (matcher instanceof BooleanPath) {
        return generators.boolean;
    }
    if (matcher instanceof ConsumeUntil) {
        return generators.consumeUntil;
    }
    if (matcher instanceof FloatPath) {
        return generators.float;
    }
    if (matcher instanceof IntPath) {
        return generators.int;
    }
    if (matcher instanceof Joined) {
        return generators.joined;
    }
    if (matcher instanceof Literal) {
        return generators.literal;
    }
    if (matcher instanceof NoopPath) {
        return generators.noop;
    }
    if (matcher instanceof SplitStringPath) {
        return generators.splitString;
    }
    if (matcher instanceof VariablePath) {
        return generators.variable;
    }
    throw new Error(`No generator for ${Object.getPrototypeOf(matcher).name}`)
}

export function generator(generators: Generators): Generator<any> {
    return (m, childGenerator) => {
        const generator = selectGenerator(m, generators);
        return generator(m, childGenerator);
    };
}

export function generate(matcher: PathMatcher, generators: Generators): Context {
    const g = generator(generators);
    return g(matcher, g);
}
