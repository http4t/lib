import {Route} from "@http4t/bidi/routes";
import {BaseParameterObject, OpenAPIObject, ResponseObject} from "openapi3-ts/src/model/openapi31";
import {HeaderLens} from "@http4t/bidi/lenses/HeaderLens";
import {MessageLens} from "@http4t/bidi/lenses";
import {MethodLens} from "@http4t/bidi/lenses/MethodLens";
import {Method} from "@http4t/core/contract";
import {OperationObject} from "openapi3-ts/dist/mjs/model/openapi31";
import {PathLens} from "@http4t/bidi/lenses/PathLens";

export type IContext<T extends string> = {
    type: T;
}
export type HeaderContext =
    IContext<"header"> &
    BaseParameterObject &
    {
        name: string;
    };
export type RequestContext =
    IContext<"request"> &
    OperationObject &
    {
        paths: string[],
        methods: Method[],
    };
export type ResponseContext =
    IContext<"response"> &
    ResponseObject &
    {
        status: number;
    };

export type Context = HeaderContext | RequestContext | ResponseContext;

export type ChildGenerator = (lens: MessageLens<any, any>) => Context;
export type Generator<T extends MessageLens<any, any>> = (lens: T, generator: ChildGenerator) => Context;

export type Generators = {
    header: Generator<HeaderLens>
    method: Generator<MethodLens>
    path: Generator<PathLens>
}

export function selectGenerator(lens: MessageLens<any, any>, generators: Generators): Generator<any> {
    if (lens instanceof MethodLens) {
        return generators.method;
    }
    if (lens instanceof PathLens) {
        return generators.path;
    }
    if (lens instanceof HeaderLens) {
        return generators.header;
    }
    throw new Error(`No generator for ${Object.getPrototypeOf(lens).name}`)

}

export function generator(generators: Generators): Generator<any> {
    return (m, childGenerator) => {
        const generator = selectGenerator(m, generators);
        return generator(m, childGenerator);
    };
}

export function generate(route: Route, generators: Generators, addTo: OpenAPIObject): OpenAPIObject {
    const req = route.request;
    const res = route.response;

    const g = generator(generators);
    const output = g(req, g);

}
