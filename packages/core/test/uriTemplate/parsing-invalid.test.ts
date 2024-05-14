import {UriTemplate} from "@http4t/core/UriTemplate";
import {invalid} from "./examples";

describe("UriTemplate", function () {
    Object.entries(invalid).forEach(([title, tests]) => {
        describe(title, function () {
            tests.testcases.forEach(([template, expected]) => {
                it(template as string, function () {
                    let ut: UriTemplate | undefined = undefined;
                    let uri: string | undefined = undefined;
                    try {
                        ut = UriTemplate.of(template as string);
                        uri = ut.expand(tests.variables);
                    } catch (e) {
                        console.log(e);
                    }
                    if (ut && uri) {
                        console.log(JSON.stringify(ut!.parts));
                        console.log(uri);
                        console.log(expected);
                        console.log(tests.variables);
                        throw new Error(`Template should not have parsed and expanded ${template}`)
                    }
                });
            })

        })
    })
})

