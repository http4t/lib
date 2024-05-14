import {OperatorChar, VarSpec, ParsedTemplate, Part} from "../UriTemplate";

function validateLiteral(template: string, matchStart: number, matchIndex: number | undefined): string {
    const literal = template.substring(matchStart, matchIndex);

    let badIndex = literal.indexOf("{");
    if (badIndex >= 0)
        throw new Error(`Unmatched { in template${template.substring(0, matchStart + badIndex)}`);

    badIndex = literal.indexOf("}");
    if (badIndex >= 0)
        throw new Error(`Unmatched } in template${template.substring(0, matchStart + badIndex)}`);

    return literal;
}

const varName = /^[0-9A-Za-z_%]+(\.[0-9A-Za-z_%]+)*$/;

function validateName(s: string): string {
    if (!s.match(varName))
        throw new Error(`Invalid variable name at ${s}`)
    return s;
}

const illegalInDefaultValue = /[/.;?&#|*:{}=]/

function validateDefaultValue(s: string): string {
    if (s.match(illegalInDefaultValue))
        throw new Error(`Invalid default value at ${s}`)
    return s;
}

function toVarSpec(value: string): VarSpec {
    const prefix = value.match(/:(.*)$/)
    if (prefix) {
        const lengthStr = prefix[1];
        if (lengthStr.match(/[^0-9]/))
            throw new Error(`Prefix was not a number at '${value}'`)
        const length = parseInt(lengthStr);
        return {
            name: validateName(value.substring(0, value.length - prefix[0].length)),
            modifier: {type: ":", count: length},
        }
    }

    const explode = value.endsWith("*");
    if (explode) {
        return {
            name: validateName(value.substring(0, value.length - 1)),
            modifier: {type: "*"}
        }
    }
    const defaultValue = value.match(/\|(.+)$/)
    if (defaultValue) {
        return {
            name: validateName(value.substring(0, value.length - defaultValue[0].length)),
            modifier: {type: "|", value: validateDefaultValue(defaultValue[1])},
        }
    }
    return {
        name: validateName(value)
    };
}

const params = /{([^}]+)}/g;
const expansion = /^[+/.;?&#]/;

export function parse<Template extends string>(template: Template): ParsedTemplate<Template> {
    const regExpMatchArrays = template.matchAll(params);
    const matches = [...regExpMatchArrays];

    const result: Part[] = [];
    let i = 0;
    matches.forEach(match => {
        let [wholeMatch, expression] = match;
        try {
            if (match.index! > i) {
                result.push(validateLiteral(template, i, match.index))
            }

            const operator = expression.match(expansion)?.[0] as OperatorChar | undefined;
            let varSpecs: string[];
            if (operator) {
                varSpecs = expression.substring(1).split(",");
            } else {
                varSpecs = expression.split(",");
            }

            result.push({
                vars: varSpecs.map(toVarSpec),
                ...(operator ? {operator: operator as OperatorChar} : {})
            });
            i = match.index! + wholeMatch.length;
        } catch (e) {
            throw new Error(`Error parsing ${template.substring(0, (match.index || 0) + wholeMatch.length)}\n : ${(e as any)['message'] || e}`);
        }
    })
    if (i < template.length)
        result.push(validateLiteral(template, i, undefined))

    return result as Readonly<Part[]> as ParsedTemplate<Template>;
}