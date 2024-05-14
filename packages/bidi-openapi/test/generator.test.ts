import {header, json, path, request} from "@http4t/bidi/requests";
import {v} from "@http4t/bidi/paths/variables";
import {route} from "@http4t/bidi/routes";
import {orNotFound, response} from "@http4t/bidi/responses";
import {generate, Generator} from "@http4t/bidi-openapi/generator";
import {OpenAPIObject, OperationObject, ResponseObject} from "openapi3-ts/src/model/openapi31";
import chai from 'chai';
import {HeaderLens} from "@http4t/bidi/lenses/HeaderLens";
import {MethodLens} from "@http4t/bidi/lenses/MethodLens";
import {PathLens} from "@http4t/bidi/lenses/PathLens";

const {expect} = chai;
type Widget = {
    id: string,
    name: string
}
const headerGenerator: Generator<HeaderLens> = (lens) => {
    return {
        type: "header",
        required: true,
        name: lens.name
    }
}
const methodGenerator: Generator<MethodLens> = () => {
    return {
        type: "request",
        methods: [],
        paths: [],
        responses: {}
    }
}
const pathGenerator: Generator<PathLens> = (lens, generator) => {
    return {
        type: "request",
        methods: [],
        paths: [],
        responses: {}
    }
}


describe("generate", function () {
    it('should handle headers', function () {
        const r = route(
            request(
                "GET",
                path({widgetId: v.segment}, vars => ["widgets", vars.widgetId]),
                header("MyHeader")),
            orNotFound(response(200, json<Widget>()))
        );

        const api: OpenAPIObject = generate(r,
            {
                method: methodGenerator,
                path: pathGenerator,
                header: headerGenerator
            },
            {
                openapi: "3.1",
                info: {
                    title: "My API",
                    version: "1.0"
                }
            });

        expect(api).deep.eq(
            {
                openapi: "3.1",
                info: {
                    title: "My API",
                    version: "1.0"
                },
                paths: {
                    "/widgets/:widgetId": {
                        get: {
                            parameters: [
                                {
                                    name: "widgetId",
                                    in: "path"
                                },
                                {
                                    name: "MyHeader",
                                    in: "header",
                                    required: true
                                }
                            ],
                            responses: {
                                200: {
                                    description: "Success",
                                    content: {
                                        "application/json": {}
                                    }
                                } as ResponseObject,
                                404: {
                                    description: "Not found"
                                } as ResponseObject
                            }
                        } as OperationObject
                    }
                }
            } as OpenAPIObject
        )
    });
})