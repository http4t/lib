import {isExpression, OperatorChar, ParsedTemplate, Part, TemplateVars, VariableValues, VarSpec} from "../UriTemplate";
import {operators} from "./operators";
import {Uri} from "../uri";
import {decode, decodeToObj} from "../urlEncoding";
import {assertExhaustive} from "../util/assertExhaustive";

class ExtractProgress {
    values: VariableValues = {};
    index: number = 0;
    query: Record<string, string | string[]>;

    constructor(readonly uri: string) {
        this.query = decodeToObj(Uri.of(uri).query?.replace(/^\?/, ""));
    }

    addValues(values: VariableValues): this {
        Object.assign(this.values, values);
        return this;
    }

    consume(length: number): string {
        const result = this.uri.substring(this.index, this.index + length);
        this.index += length;
        return result;
    }

    consumeUntil(index: number): string {
        if (this.uri.length <= index)
            throw new Error(`Index ${index} is outside string ${this.uri}`);
        if (index <= this.index)
            throw new Error(`Index ${index} is backwards from current index ${this.index}`);
        const result = this.uri.substring(this.index, index);
        this.index = index;
        return result;
    }

    indexesOf(str: string): number[] {
        const result: number[] = [];
        let i = this.index;
        while ((i = this.uri.indexOf(str, i)) >= 0) {
            result.push(i);
        }
        return result;
    }

    indexOf(str: string) {
        return this.uri.indexOf(str, this.index);
    }

    consumeAll(): string {
        const result = this.uri.substring(this.index);
        this.index = this.uri.length;
        return result;
    }
}

function addValue(progress: ExtractProgress, name: string, value: string | string[]): void {
    const existing = progress.values[name];

    if (typeof existing === "undefined") {
        progress.values[name] = value;
    } else if (typeof existing === "string") {
        progress.values[name] = typeof value === "string" ? [existing, value] : [existing, ...value];
    } else if (Array.isArray(existing)) {
        progress.values[name] = typeof value === "string" ? [...existing, value] : [...existing, ...value];
    } else {
        throw new Error(`I don't know how to add to existing value for ${name}: ${JSON.stringify(existing)}`)
    }
}

export function asArray(value: string | string[]): string[] {
    return typeof value === "string" ? [value] : value;
}

function extractParameter(template: string,
                          progress: ExtractProgress,
                          operatorChar: OperatorChar | undefined,
                          parameter: VarSpec,
                          restParams: VarSpec[],
                          rest: Part[]): boolean {
    const operator = operators[operatorChar || ""];
    switch (operatorChar) {
        case undefined:
            const slashIdx = progress.indexOf("/");
            const nextPart = rest[0];

            if (rest.length === 0) {
                addValue(progress, parameter.name, operator.decode(progress.consumeAll()));
            } else {
                if (typeof nextPart === "string") {
                    const nextPartIndex = progress.indexOf(nextPart);
                    const end = slashIdx === -1 ? nextPartIndex : nextPartIndex < slashIdx ? nextPartIndex : slashIdx;
                    if (end === -1)
                        return false;
                    addValue(progress, parameter.name, operator.decode(progress.consumeUntil(end)));
                    progress.index = end;
                }
            }
            return true;
        case "+":
            throw new Error();
        case "#":
        case ".":
        case ";":
        case "/":
            throw new Error();
        case "?":
        case "&":
            const value = operator.decode(progress.query[parameter.name] as string);
            if (typeof value === "undefined")
                throw new Error(`${decode(parameter.name)} not present in query string`);
            const explodedValue = parameter.modifier?.type === "*"
                ? asArray(value).flatMap(x => x.split(","))
                : value;
            addValue(progress, parameter.name, explodedValue);
            return true;
        default:
            assertExhaustive(operatorChar, "Unrecognised operator")
    }
}

function extractPart(template: string, progress: ExtractProgress, part: Part, rest: Part[]): boolean {
    if (typeof part === "string") {
        if (progress.indexOf(part) >= 0) {
            progress.consume(part.length)
            return true;
        } else {
            return false;
        }
    }

    for (let i = 0; i < part.vars.length; i++) {
        const varSpec = part.vars[i];
        if (!extractParameter(template, progress, part.operator, varSpec, part.vars.slice(i + 1), rest))
            return false;

    }
    return true;
}

export function extract<Template extends string>(uri: string, template: Template, parts: ParsedTemplate<Template>): TemplateVars<Template> {
    const progress = new ExtractProgress(uri)
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (!extractPart(template, progress, part, parts.slice(i + 1)))
            throw new Error(`Could not extract ${JSON.stringify(part)} from ${uri}. Got as far as: ${uri.substring(0, progress.index)}`);
    }
    if ((progress.index < uri.length) || (progress.index < uri.indexOf("?") && parts.find(part => isExpression(part) && (part.operator === "?" || part.operator === "&"))))
        throw new Error(`Could not match template ${template} to ${uri}. Got as far as: ${uri.substring(0, progress.index)}`);
    return progress.values as TemplateVars<Template>;
}