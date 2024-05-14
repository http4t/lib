import {parse} from "./uriTemplate/parsing";
import {expand} from "./uriTemplate/expansion";
import {extract} from "./uriTemplate/extraction";

/*
Template domain model
-----------------------------------------------------------------------------
 */


/**
 * Prefix: A colon : followed by a number (e.g., :n) limits the expansion to the first n characters of the variable value.
 */
export type Prefix = Readonly<{
    type: ":";
    count: number;
}>;
/**
 * Explode: An asterisk * after the variable name allows for expanding array or object values
 */
export type Explode = Readonly<{
    type: "*";
}>;
/**
 * Default value: A pipe | followed by a default value is used if the variable is undefined.
 */
export type DefaultValue = Readonly<{
    type: "|";
    value: string;
}>;
export type Modifier = Prefix | Explode | DefaultValue;

export function isExplode(modifier: Modifier | undefined): modifier is Explode {
    return modifier?.type === "*";
}

export function isPrefix(modifier: Modifier | undefined): modifier is Prefix {
    return modifier?.type === ":";
}

export type Literal = string;
export type OperatorChar = "+" | "#" | "." | "/" | ";" | "?" | "&";
export type VarSpec = Readonly<{
    name: string;
    modifier?: Modifier
}>;
export type Expression = Readonly<{
    vars: readonly VarSpec[];
    operator?: OperatorChar;
}>;
export type Part = Literal | Expression;

export function isExpression(part: Part): part is  Expression {
    return !isLiteral(part);
}

export function isLiteral(part: Part): part is  string {
    return typeof part === "string";
}

/*
Type-safe parsed template strings (compatible with Part)
-----------------------------------------------------------------------------
 */

export type Mapped<N extends number,
    Result extends Array<unknown> = [],
    > =
    (Result['length'] extends N
        ? Result
        : Mapped<N, [...Result, Result['length']]>
        )

/**
 * Recursive types are slow so we need a limit.
 *
 * 999 is the maximum Typescript allows, but 36 was chosen as the length of a uuid including dashes.
 */
export type UpTo36 = Mapped<36>; // <- tuple [0, 1, 2, 3, ...]

/**
 * See https://stackoverflow.com/a/70317058/1892116
 */
export type ConvertToNumber<T extends string, Range extends number[]> =
    T extends keyof Range ? Range[T] : never;

export type StripOperator<Parameter extends string> =
// ?name
    Parameter extends `${OperatorChar}${infer Rest}`
        ? Rest

        // name
        : Parameter

export type ParsedVarSpec<Parameter extends string> =
// name:2
    Parameter extends `${infer Name}:${infer Length}`
        ? { name: StripOperator<Name>, modifier: Readonly<{ type: ":", count: ConvertToNumber<Length, UpTo36> }> }

        // name*
        : Parameter extends `${infer Name}*`
        ? { name: StripOperator<Name>, modifier: Readonly<{ type: "*" }> }

        // name|default
        : Parameter extends `${infer Name}|${infer DefaultValue}`
            ? { name: StripOperator<Name>, modifier: Readonly<{ type: "|", value: DefaultValue }> }

            // name
            : { name: StripOperator<Parameter> }

export type ParsedVarSpecs<Expression extends string> =
// name1,name2
// ;name1,name2
// ?name1,name2*
    Expression extends `${infer Parameter},${infer Rest}`
        ? readonly [Readonly<ParsedVarSpec<Parameter>>, ...ParsedVarSpecs<Rest>]

        // <empty>
        : Expression extends ""
        ? readonly []

        // name
        // /name
        // name*
        // ?name*
        : readonly [Readonly<ParsedVarSpec<Expression>>]

export type ParsedOperator<Expression extends String> =
// ?name
// ;name,name
    Expression extends `${OperatorChar}${infer Rest}`
        ? { operator: Expression[0] }

        // name
        : {};

export type ParsedExpression<Expression extends string> =
    ParsedOperator<Expression> & { vars: ParsedVarSpecs<Expression> }

export type ParsedTemplate<Template extends string> =
// {name}/rest
// {name}/whatever{.other}
    Template extends `{${infer Expression}}${infer Rest}`
        ? readonly [Readonly<ParsedExpression<Expression>>, ...ParsedTemplate<Rest>]

        // path/{name}
        // path/{name}/rest
        : Template extends `${infer Literal}{${infer Expression}}${infer Rest}`
        ? readonly [Literal, Readonly<ParsedExpression<Expression>>, ...ParsedTemplate<Rest>]

        // empty string
        : Template extends ""
            ? readonly []

            // literal (no variables)
            : readonly [Template];

/*
Values to expand into template
-----------------------------------------------------------------------------
 */

export type ParameterVar<Parameter extends string> =
// name:2
    Parameter extends `${infer Name}:${infer Length}`
        ? { [K in StripOperator<Name>]: VariableValue }

        // name*
        : Parameter extends `${infer Name}*`
        ? { [K in StripOperator<Name>]: VariableValue }

        // name|default
        : Parameter extends `${infer Name}|${infer DefaultValue}`
            ? { [K in StripOperator<Name>]: VariableValue }

            // name
            : { [K in StripOperator<Parameter>]: VariableValue }


export type ExpressionVars<Expression extends string> =
// name1,name2
// ;name1,name2
// ?name1,name2*
    Expression extends `${infer Parameter},${infer Rest}`
        ? ParameterVar<Parameter> & ExpressionVars<Rest>
        // name
        // /name
        // name*
        // ?name*
        : ParameterVar<Expression>

export type TemplateVars<Template extends string> =
// {name}/rest
// {name}/whatever{.other}
    Template extends `{${infer Expression}}${infer Rest}`
        ? ExpressionVars<Expression> & TemplateVars<Rest>

        // path/{name}
        // path/{name}/rest
        : Template extends `${infer Literal}{${infer Expression}}${infer Rest}`
        ? ExpressionVars<Expression> & TemplateVars<Rest>

        // literal
        : {};

export type VariableValue = null | number | string | readonly string[] | Readonly<Record<string, string>>;
export type VariableValues = Record<string, VariableValue>;

/*
UriTemplate
-----------------------------------------------------------------------------
 */

export class UriTemplate<Template extends string = any> {
    constructor(readonly template: Template, readonly parts: ParsedTemplate<Template>) {
    }

    static of<Template extends string>(template: Template): UriTemplate<Template> {
        const parsed = parse(template);
        return new UriTemplate<Template>(template, parsed);
    }

    expand(variables: TemplateVars<Template>): string {
        return expand(this.parts, variables);
    }

    extract(uri: string): VariableValues {
        return extract(uri, this.template, this.parts);
    }
}
