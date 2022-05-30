import {route, Route, Routes} from "../routes";
import {WithSecurity} from "./withSecurity";
import {Failure, isFailure, Result, Success, success} from "@http4t/result";
import {BaseRequestLens, RequestLens, RoutingResult} from "../lenses";
import {HttpRequest} from "@http4t/core/contract";
import {Mutable} from "../util/mutable";


export class ClientSecuredRequestLens<T, TToken, TClaims> extends BaseRequestLens<T> {
    constructor(private readonly serverLens: RequestLens<WithSecurity<T, TClaims>, WithSecurity<T, TToken>>,
                private readonly token: TToken) {
        super();
    }

    async get(from: HttpRequest): Promise<RoutingResult<T>> {
        const serverResult = await this.serverLens.get(from);

        if (isFailure(serverResult)) {
            return serverResult;
        }
        return success(serverResult.value.value);
    }

    async setRequest(into: HttpRequest, value: T): Promise<HttpRequest> {
        return this.serverLens.set(into, {value, security: this.token});
    }
}

export type UnsecuredRouteFor<TRoute> =
    TRoute extends Route<WithSecurity<infer InGet, infer TClaims>,
            Result<infer TAuthError, infer Out>,
            WithSecurity<infer InSet, infer TToken>>

        ? Route<InGet,
            Result<TAuthError, Out>,
            InSet>

        : never;
/**
 * Maps `TRoutes`, lifting `InGet` out of `WithSecurity<InGet, TClaims>` and `InSet` out of `WithSecurity<InSet, TClaims>`
 *
 * The inverse of {@link SecuredRoutesFor}
 */
export type UnsecuredRoutesFor<TRoutes extends Routes> = { readonly [K in keyof TRoutes]: UnsecuredRouteFor<TRoutes[K]> }

export type SecuredRoute<TToken, TClaims, TAuthError> = Route<WithSecurity<any, TClaims>, Result<TAuthError, any>, WithSecurity<any, TToken>>;
/**
 * Routes where:
 *
 * 1. All request lenses have `InGet` of `WithSecurity<T,TClaims>` and `InSet` of `WithSecurity<T,TToken>`
 *    (because the server, which `get`s from the request lens will want to deal with `TClaims` and the client, which
 *    `set`s the request lens will want to pass `TToken`)
 * 2. All response lenses have `InGet` and `InSet` returning `Result<TAuthError, T`
 */
export type SecuredRoutes<TToken, TClaims, TAuthError> =
    { readonly [k: string]: SecuredRoute<TToken, TClaims, TAuthError> }

export function tokenProvidedRoute<TRoute extends Route<WithSecurity<any, any>, Result<any, any>, WithSecurity<any, TToken>>, TToken>(
    serverRoute: TRoute,
    token: TToken)

    : UnsecuredRouteFor<TRoute> {

    return route(
        new ClientSecuredRequestLens(serverRoute.request, token),
        serverRoute.response) as UnsecuredRouteFor<TRoute>;
}

export function tokenProvidedRoutes<TRoutes extends SecuredRoutes<TToken, TClaims, TAuthError>, TToken, TClaims, TAuthError>(
    serverRoutes: TRoutes,
    token: TToken)
    : UnsecuredRoutesFor<TRoutes> {

    return Object.entries(serverRoutes)
        .reduce(
            (acc, [k, route]) => {
                const secured: Route<WithSecurity<unknown, TClaims>, Success<unknown> | Failure<TAuthError>, WithSecurity<unknown, TToken>> extends Route<WithSecurity<infer InGet, infer TClaims>, Result<infer TAuthError, infer Out>, WithSecurity<infer InSet, infer TToken>> ? Route<InGet, Result<TAuthError, Out>, InSet> : never = tokenProvidedRoute(
                    route as Route<WithSecurity<unknown, TClaims>, Result<TAuthError, unknown>, WithSecurity<unknown, TToken>>,
                    token);
                acc[k as keyof UnsecuredRoutesFor<TRoutes>] = secured as any;
                return acc;
            },
            {} as Mutable<UnsecuredRoutesFor<TRoutes>>)
}