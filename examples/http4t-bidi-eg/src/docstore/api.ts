import {HttpHandler} from "@http4t/core/contract";
import {JwtPayload, jwtSecuredRoutes, JwtStrategy, JwtString} from "@http4t/bidi-jwt";
import {tokenProvidedRoutes} from "@http4t/bidi/auth/client";
import {buildClient} from "@http4t/bidi/client";
import {DocStoreClaims} from "../auth/api";
import {Doc} from "./impl/DocRepository";
import {Result, success} from "@http4t/result";
import {AuthError, authErrorOr} from "@http4t/bidi/auth/authError";
import {route, RoutesFor} from "@http4t/bidi/routes";
import {empty, json, path, request} from "@http4t/bidi/requests";
import {orNotFound, response} from "@http4t/bidi/responses";
import {v} from "@http4t/bidi/paths/variables";
import {SecuredRoutesFor} from "@http4t/bidi/auth/server";
import {routeFailed, RoutingResult} from "@http4t/bidi/lenses";
import {clientJwt} from "@http4t/bidi-jwt/jose";

export interface DocStore {
    post(request: Doc): Promise<Result<AuthError, { id: string }>>;

    get(request: { id: string }): Promise<Result<AuthError, Doc | undefined>>;

    storeDocThenFail(request: Doc): Promise<Result<AuthError, undefined>>;
}

export const unsecuredDocStoreRoutes: RoutesFor<DocStore> = {
    post: route(
        request('POST', '/store', json<Doc>()),
        authErrorOr(
            response(201, json<{ id: string }>()))
    ),
    get: route(
        request('GET', path({id: v.segment}, p => ["store", p.id])),
        authErrorOr(
            orNotFound(json<Doc>()))
    ),
    storeDocThenFail: route(
        request("POST", '/test/store-then-throw', json<Doc>()),
        authErrorOr(
            response(200, empty())))
}

export async function jwtToOurClaims(jwt: JwtPayload): Promise<RoutingResult<DocStoreClaims>> {
    const userName = jwt["userName"] as string;
    if (!userName) return routeFailed("JWT did not contain 'userName'", ["headers", "Authorization"]);
    return success({
        principal: {
            type: "user",
            userName: userName
        }
    })
}

export function docStoreRoutes(opts: { jwt: JwtStrategy }): SecuredRoutesFor<typeof unsecuredDocStoreRoutes, JwtString, DocStoreClaims> {
    return jwtSecuredRoutes(
        unsecuredDocStoreRoutes,
        opts.jwt,
        jwtToOurClaims);
}

export function docStoreClient(httpClient: HttpHandler, jwt: JwtString): DocStore {
    const routesWithJwtProvided = tokenProvidedRoutes(
        docStoreRoutes({jwt: clientJwt()}),
        jwt);

    return buildClient(
        routesWithJwtProvided,
        httpClient,
        {leakActualValuesInError: true});
}