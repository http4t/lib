import {allCases} from "./examples";
import {generateTestFile} from "../testGeneration";
import {isExpression, UriTemplate, VariableValues} from "@http4t/core/UriTemplate";


export function relevantVariables(template: string, variables: Record<string, any>) : Record<string, any>{
    return UriTemplate.of(template).parts
        .flatMap(part => isExpression(part) ? part.vars : [])
        .reduce((vars, part) => {
            vars[part.name] = (variables as any)[part.name] || null;
            return vars;
        }, {} as VariableValues)

}

generateTestFile(
    "uriTemplate/expansion.test.ts",

    `import {TemplateVars, UriTemplate} from "@http4t/core/UriTemplate";
import chai from 'chai';

const {expect} = chai;

function test<Template extends string>(template: Template, args: TemplateVars<Template>, expected: string | string[]) {
    const ut = UriTemplate.of(template);

    console.log(JSON.stringify(ut.parts));
    console.log(expected);
    console.log(args);

    const actual = ut.expand(args);
    console.log(actual);
    
    expect(actual).oneOf(typeof expected === "string" ? [expected] : expected);
}

describe('UriTemplate.expand()', function() {
${
        allCases.flatMap(([title, tests]) =>
            `   describe('${title}', function() {
${tests.testcases.map(([template, expected]) =>
                `      it("${template}", () => test("${template}", ${JSON.stringify(relevantVariables(template as string, tests.variables))}, ${JSON.stringify(expected)}));\n`)
                .join("\n")}
   })`
        )
            .join("\n")

    }
});`);