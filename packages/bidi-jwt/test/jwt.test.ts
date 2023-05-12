import {jwtRoutes, serverSideJwtRoutes} from "@http4t/bidi-jwt";
import {route, RoutesFor} from "@http4t/bidi/routes";
import {json, path, request} from "@http4t/bidi/requests";
import {UnsecuredApi, WithSecurity} from "@http4t/bidi/auth/withSecurity";
import {v} from "@http4t/bidi/paths/variables";
import {totallyInsecureServerJwtStrategy} from "@http4t/bidi-jwt/testing";
import {success} from "@http4t/result";
import {buildRouter} from "@http4t/bidi/router";
import {buildClient} from "@http4t/bidi/client";
import {tokenProvidedRoutes} from "@http4t/bidi/auth/client";
import chai from 'chai';
import {orNotFound} from "@http4t/bidi/responses";

const {expect} = chai;
type Animal = {
    name: string;
    description: string;
}

type OurClaims = {
    canSeeAnimalNames: string[];
}

interface AnimalsApi {
    get(req: WithSecurity<{ name: string }, OurClaims>): Promise<Animal | undefined>
}

const unsecuredRoutes: RoutesFor<UnsecuredApi<AnimalsApi>> = {
    get: route(
        request('GET', path({name: v.segment}, ({name}) => ["/animals", name])),
        orNotFound(json<Animal>())
    )
}
describe('JwtLens', function () {
    it('Should be usable on client and server', async function () {
        const jwtStrategy = totallyInsecureServerJwtStrategy("valid-signature");

        const clientSideRoutes = jwtRoutes(unsecuredRoutes);

        const api = {
            async get(req: WithSecurity<{ name: string }, OurClaims>): Promise<Animal | undefined> {
                const animalName = req.value.name;
                const hasPermission = req.security.canSeeAnimalNames.find(allowedName => allowedName === animalName);
                return hasPermission
                    ? {name: animalName, description: `It's a ${animalName}`}
                    : undefined
            }
        };

        const serverSideRoutes = serverSideJwtRoutes(
            clientSideRoutes,
            jwtStrategy,
            token => success({canSeeAnimalNames: token.canSeeAnimalNames as string[] || []})
        );

        const router = buildRouter(
            serverSideRoutes,
            async () => {
                return api
            });

        const jwt = await jwtStrategy.sign({payload: {canSeeAnimalNames: ["giraffe"]}});

        const client: UnsecuredApi<AnimalsApi> = buildClient(
            tokenProvidedRoutes(
                clientSideRoutes,
                () => jwt),
            router
        );


        expect(await client.get({name: "giraffe"})).deep.eq({name: "giraffe", description: "It's a giraffe"})
        expect(await client.get({name: "animal I'm not allowed to see"})).eq(undefined)
    });
});