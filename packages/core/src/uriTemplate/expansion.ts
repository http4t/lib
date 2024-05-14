import {Operator, operators} from "./operators";
import {typeDescription} from "@http4t/core/bodies";
import {
    Expression,
    isExplode,
    isPrefix,
    Modifier,
    VarSpec,
    ParsedTemplate,
    TemplateVars,
    VariableValue,
    VariableValues
} from "../UriTemplate";

export const isMap = (d: VariableValue): d is Record<string, string> =>
    typeof d === "object" && !Array.isArray(d);

export const isCompositeValue = (d: VariableValue): d is  string[] | Record<string, string> =>
    Array.isArray(d) || typeof d === "object";

type NameValues = [string | undefined, string | number][];

function nameValues(value: Exclude<VariableValue, null>): NameValues {
    if (typeof value === "string" || typeof value === "number")
        return [[undefined, value]];
    if (Array.isArray(value))
        return value.map(v => [undefined, v]);
    if (typeof value === "object")
        return Object.entries(value);
    throw new Error(`Unexpected variable value ${value} (${typeDescription(value)})`);
}

function nameValueSeparator(value: string,
                            modifier: Modifier | undefined,
                            includeSeparatorForEmptyValues: boolean): string {
    return isExplode(modifier)
        ? (includeSeparatorForEmptyValues || value.length > 0 ? '=' : '')
        : ",";
}

function applyModifier(value: number | string, modifier: undefined | Modifier): string {
    return isPrefix(modifier) ? value.toString().substring(0, modifier.count) : value.toString();
}

/**
 * Unnamed operators are + # . / (and then default)
 */
function expandUnnamed(variableValue: Exclude<VariableValue, null>, parameter: VarSpec, operator: Operator): string {
    const separator = isExplode(parameter.modifier) ? operator.separator : ",";
    let acc = "";

    for (const [name, value] of nameValues(variableValue)) {
        if (acc.length > 0) {
            acc += separator;
        }

        const valueString = operator.encode(applyModifier(value, parameter.modifier));

        if (isMap(variableValue)) {
            acc += operator.encode(applyModifier(name!, parameter.modifier));
            acc += nameValueSeparator(valueString,
                parameter.modifier,
                operator.includeSeparatorForEmptyValues);
        }

        acc += valueString;
    }
    return acc;
}

/**
 * Named operators are ? & ;
 */

function expandNamed(variableValue: Exclude<VariableValue, null>, parameter: VarSpec, operator: Operator): string {
    const encodedParameterName = operator.encode(parameter.name);
    const separator = isCompositeValue(variableValue) && !isExplode(parameter.modifier)
        ? ","
        : operator.separator /* either ; or & */;

    let acc = "";

    for (const [name, value] of nameValues(variableValue)) {
        if (acc.length > 0) {
            acc += separator;
        }

        const encodedValue = operator.encode(applyModifier(value, parameter.modifier));
        const encodedName = typeof name === "string"
            ? operator.encode(applyModifier(name, parameter.modifier))
            : encodedParameterName;

        const optionalEquals = operator.includeSeparatorForEmptyValues || encodedValue
            ? '='
            : '';

        if (isExplode(parameter.modifier)) {
            acc += encodedName;
            acc += optionalEquals
            acc += encodedValue;
        } else {
            if (acc.length === 0) {
                acc += parameter.name;
                acc += optionalEquals;
            }

            if (isMap(variableValue)) {
                acc += encodedName;
                acc += ',';
            }

            acc += encodedValue;
        }
    }
    return acc;
}


export function expandExpression(expression: Expression, data: VariableValues): string {
    const operator = operators[expression.operator || ""];
    const buffer: string[] = [];

    for (const parameter of expression.vars) {
        // if (!(variable.name in data)) {
        //     throw new Error('Missing expansion value for variable "' + variable.name + '"');
        // }
        const value = data[parameter.name];
        if (typeof value === "undefined" || value === null) {
            continue;
        }

        if (typeof value !== "string" && isPrefix(parameter.modifier)) {
            // composite variable cannot specify maxlength
            throw new Error(`Invalid expression: Prefix modifier : not applicable to parameter '${parameter.name}'=${value} (${typeDescription(value)})`);
        }

        // expand the given variable
        buffer.push(
            operator.named
                ? expandNamed(value, parameter, operator)
                : expandUnnamed(value, parameter, operator));
    }

    const joined = buffer.join(operator.separator);
    if (joined.length > 0) {
        return operator.prefix + joined;
    } else {
        // prefix is not prepended for empty expressions
        return '';
    }
}

export function expand<Template extends string>(parts: ParsedTemplate<Template>, vars: TemplateVars<Template>) {
    let result = "";
    for (const part of parts) {
        if (typeof part === "string")
            result += part;
        else
            result += expandExpression(part, vars);
    }
    return result;
}