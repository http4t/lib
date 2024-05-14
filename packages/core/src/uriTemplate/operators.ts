import {OperatorChar} from "../UriTemplate";

function escapeForDumbFirefox36(value: string): string {
    // https://github.com/medialize/URI.js/issues/91
    return escape(value);
}

// encoding according to RFC3986
function strictEncodeURIComponent(value: string): string {
    // see https://developer.mozilla.org/en-US/docs/JavaScript/Reference/Global_Objects/encodeURIComponent
    return encodeURIComponent(value)
        .replace(/[!'()*]/g, escapeForDumbFirefox36)
        .replace(/\*/g, '%2A');
}

function encodeReserved(value: string): string {
    return value
        .replace(/%(?!(21|23|24|25|26|27|28|29|2A|2B|2C|2F|3A|3B|3D|3F|40|5B|5D))/g, "%25")
        .replace(" ", "%20");
}

export type Operator = {
    prefix: OperatorChar | "";
    separator: string;
    /**
     * ? & ;
     */
    named: boolean;
    includeSeparatorForEmptyValues: boolean;
    encode: (value: string) => string;
    decode: (value: string) => string;
}

/**
 * Reserved expansion: Variables are prefixed with a plus +, allowing reserved characters to be used in the
 * variable value without being percent-encoded.
 *
 * Template: /search{+query}
 * Expansion: /search?q=test%20search (with query = ?q=test search)
 */
export const reserved: Operator = {
    prefix: '',
    separator: ',',
    named: false,
    includeSeparatorForEmptyValues: false,
    encode: encodeReserved,
    decode: decodeURIComponent
};

export const simpleString: Operator = {
    prefix: '',
    separator: ',',
    named: false,
    includeSeparatorForEmptyValues: false,
    encode: strictEncodeURIComponent,
    decode: decodeURIComponent
};

/**
 * Fragment expansion: Variables are prefixed with a hash #, generating a URI fragment.
 *
 * Template: /resource{#section}
 * Expansion: /resource#section2 (with section = section2)
 */
export const fragment: Operator = {
    prefix: '#',
    separator: ',',
    named: false,
    includeSeparatorForEmptyValues: false,
    encode: encodeReserved,
    decode: decodeURIComponent
};

/**
 * Label expansion: Variables are prefixed with a period ., generating a path segment with the variable value.
 *
 * Template: /files{.extension}
 * Expansion: /files.json (with extension = json)
 */
export const label: Operator = {
    prefix: '.',
    separator: '.',
    named: false,
    includeSeparatorForEmptyValues: false,
    encode: strictEncodeURIComponent,
    decode: decodeURIComponent
};

/**
 * Path segment expansion: Variables are prefixed with a slash /, generating a path segment for each variable value.
 *
 * Template: /users{/userId}
 * Expansion: /users/42 (with userId = 42)
 */
export const pathSegment: Operator = {
    prefix: '/',
    separator: '/',
    named: false,
    includeSeparatorForEmptyValues: false,
    encode: strictEncodeURIComponent,
    decode: decodeURIComponent
};

/**
 * Path-style parameter expansion: Variables are prefixed with a semicolon ;, generating path-style parameters.
 *
 * Template: /users{;userId}
 * Expansion: /users;userId=42 (with userId = 42)
 * */
export const pathStyle: Operator = {
    prefix: ';',
    separator: ';',
    named: true,
    includeSeparatorForEmptyValues: false,
    encode: strictEncodeURIComponent,
    decode: decodeURIComponent
};

/**
 * Form-style query expansion: Variables are prefixed with a question mark ?, generating form-style query parameters.
 *
 * Template: /search{?q}
 * Expansion: /search?q=test (with q = test)
 */
export const query: Operator = {
    prefix: '?',
    separator: '&',
    named: true,
    includeSeparatorForEmptyValues: true,
    encode: strictEncodeURIComponent,
    decode: decodeURIComponent
};

/**
 * Form-style query continuation: Variables are prefixed with an ampersand &, continuing a form-style query.
 *
 * Template: /search?category=books{&q}
 * Expansion: /search?category=books&q=test (with q = test)
 * */
export const continuation: Operator = {
    prefix: '&',
    separator: '&',
    named: true,
    includeSeparatorForEmptyValues: true,
    encode: strictEncodeURIComponent,
    decode: decodeURIComponent
};

export const operators: { readonly [K in (OperatorChar | "")]: Operator } = {
    '': simpleString,
    '+': reserved,
    '#': fragment,
    '.': label,
    '/': pathSegment,
    ';': pathStyle,
    '?': query,
    '&': continuation
};