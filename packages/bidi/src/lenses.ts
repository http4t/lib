import {HttpMessage, HttpRequest, HttpResponse} from "@http4t/core/contract";
import * as responses from "@http4t/core/responses";
import {failure, Failure, Result} from "@http4t/result";
import {JsonPath, problem, Problem} from "@http4t/result/JsonPathResult";

export const WRONG_ROUTE = "wrong-route";
export const ROUTE_FAILED = "route-failed";

/**
 * This was the wrong route- usually because either the url or method did not matched.
 *
 * The Router should continue looking for a matching route
 */
export type WrongRoute = {
    readonly type: typeof WRONG_ROUTE,
    readonly problems: Problem[]
};

/**
 * This was the right route to handle the request, but the request is not valid for this route (e.g. the url and method
 * matched but the body is not valid json)
 *
 * The Router should not consider any more routes, and should return the provided response to the user
 */
export type RouteFailed = {
    readonly type: typeof ROUTE_FAILED,
    readonly problems: Problem[],
    readonly response: HttpResponse
};

export type RoutingError = WrongRoute | RouteFailed;
export type RoutingResult<T> = Result<RoutingError, T>;

export function wrongRouteError(message: string, path: (string | number)[]): WrongRoute {
    return {type: WRONG_ROUTE, problems: [problem(message, path)]};
}

export function wrongRoute(message: string, path: JsonPath): Failure<RoutingError> {
    return failure(wrongRouteError(message, path));
}

export function routeFailedError(message: string, path: JsonPath, response: HttpResponse): RouteFailed {
    return {
        type: ROUTE_FAILED,
        problems: [problem(message, path)],
        response
    };
}

export function routeFailed(message: string, path: JsonPath, response: HttpResponse = responses.responseOf(400, message)): Failure<RoutingError> {
    return failure(routeFailedError(message, path, response));
}

/**
 * A lens is something that, for example, knows how to both extract a named
 * header from an http request, and how to add it to a request.
 *
 * Or how to deserialize a request body into an object, and how to serialize
 * the same type of object, and put it into a request body.
 *
 * It's useful because the same lens can be used on the client side to
 * inject the header or body into the request, and on the server side to
 * read out the header, or deserialise the body.
 */
export interface MessageLens<TMessage extends HttpMessage = HttpMessage, T = unknown> {
    get(from: TMessage): Promise<RoutingResult<T>>;

    set(into: TMessage, value: T): Promise<TMessage>;
}

export interface RequestLens<T> extends MessageLens<HttpRequest, T> {
}

export interface ResponseLens<T> extends MessageLens<HttpResponse, T> {
}
