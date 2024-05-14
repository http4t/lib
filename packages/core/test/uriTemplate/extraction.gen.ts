import {allCases} from "./examples";
import {generateTestFile} from "../testGeneration";
import {relevantVariables} from "./expansion.gen";
import {asArray} from "@http4t/core/uriTemplate/extraction";


function numbersAsText(original: Record<string, any>): Record<string, any> {
    for (const [k, v] of Object.entries(original)) {
        if (typeof v === "number")
            original[k] = v.toString();
        else if (Array.isArray(v))
            original[k] = v.map(x => x.toString())
        else if (typeof v === "object" && v !=null)
            original[k] = numbersAsText(v)
    }
    return original;
}

generateTestFile(
    "uriTemplate/extraction.test.ts",

    `import {TemplateVars, UriTemplate} from "@http4t/core/UriTemplate";
import chai from 'chai';

const {expect} = chai;

function test<Template extends string>(template: Template, uri: string, expected: TemplateVars<Template>) {
    const ut = UriTemplate.of(template);

    console.log("Parts");
    console.log(JSON.stringify(ut.parts));
    console.log("\\nUri");
    console.log(uri);
    console.log("\\nExpected");
    console.log(expected);

    const actual = ut.extract(uri);
    console.log("\\nActual");
    console.log(actual);
    
    expect(actual).deep.eq(expected)
}

describe('UriTemplate.extract()', function() {
${
        allCases.flatMap(([title, tests]) =>
            `   describe('${title}', function() {
${tests.testcases.flatMap(([template, expected, expectedExtraction]) => {
                    const vars = numbersAsText(relevantVariables(template as string, tests.variables));
                    return asArray(expected)
                        .map(exp =>
                            `      it("${template}", () => test("${template}", ${JSON.stringify(exp)}, ${JSON.stringify(expectedExtraction || vars)}));\n`);
                }
            )
                .join("\n")}
   })`
        )
            .join("\n")

    }
});`);