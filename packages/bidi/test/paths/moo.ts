import {OperatorChar, Part, VariableValues} from "@http4t/core/UriTemplate";
import {operators} from "@http4t/core/UriTemplateOperators";

export function extractVariables(
    uriString: string,
    template: string,
    parts: readonly Part[]
): VariableValues {
    let currentUriIndex = 0;
    const variableValues: VariableValues = {};

    for (const part of parts) {
        if (typeof part === "string") {
            // Literal
            if (uriString.startsWith(part, currentUriIndex)) {
                currentUriIndex += part.length;
            } else {
                // The URI does not match the template
                throw new Error(`URI "${uriString}" does not match template "${template}"`);
            }
        } else {
            // ParsedExpression
            const operatorChar = part.operator as OperatorChar || "";
            const operator = operators[operatorChar];

            // If the operator has a prefix, skip it
            if (operatorChar && uriString.startsWith(operatorChar, currentUriIndex)) {
                currentUriIndex += operatorChar.length;
            }

            for (const parameter of part.vars) {
                const separatorIndex = uriString.indexOf(operator.separator, currentUriIndex);
                const endIndex = separatorIndex === -1 ? uriString.length : separatorIndex;

                const value = uriString.slice(currentUriIndex, endIndex);
                variableValues[parameter.name] = operator.decode(value);

                currentUriIndex = endIndex + (separatorIndex === -1 ? 0 : operator.separator.length);
            }
        }
    }

    if (currentUriIndex !== uriString.length) {
        // The URI does not match the template
        throw new Error(`URI "${uriString}" does not match template "${template}"`);
    }

    return variableValues;
}