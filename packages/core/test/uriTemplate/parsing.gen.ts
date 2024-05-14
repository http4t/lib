import {allCases} from "./examples";
import {UriTemplate} from "@http4t/core/UriTemplate";
import {generateTestFile} from "../testGeneration";

generateTestFile(
    "uriTemplate/parsing.test.ts",

    `import chai from 'chai';
import {ParsedTemplate, UriTemplate} from "@http4t/core/UriTemplate"

const {expect} = chai;

function test<Template extends string>(template: Template, expected: ParsedTemplate<Template>) {
    expect(UriTemplate.of(template).parts).deep.eq(expected);
}
describe('Parsing output', function() {
${
        allCases.flatMap(([_, tests]) =>
            tests.testcases.map(([template]) =>
                `   it("${template}", () => test("${template}", ${JSON.stringify(UriTemplate.of(template as string).parts)}));\n`))
            .join("\n")

    }
});`)