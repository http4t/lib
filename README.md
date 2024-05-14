# http4t

![teapot](https://user-images.githubusercontent.com/123496/53679728-5e9d3e80-3cc8-11e9-81ff-af48da63d422.png)

![Build](https://github.com/http4t/http4t/workflows/Build/badge.svg?branch=master)

A modular web framework for Typescript

Supports [RFC 2324](https://tools.ietf.org/html/rfc2324)

## Design goals

### Symmetrical interface between client and server

An http client can be defined as: 

```typescript
type HttpHandler = (request: HttpRequest) => Promise<HttpResponse>
```

Notice that an http server is the same thing- it takes an `HttpRequest` and returns a response.

By sharing an interface on both client and server we can:

* Share code between server and client
* Replace any code that uses an http client directly with the server-side `HttpHandler`, 
  removing the need for network traffic in tests

Although we can hack

### Nothing outside HTTP spec

By keeping `HttpRequest`, `HttpResponse` and `HttpHandler` extremely simple we make it very
easy 

### Json objects are valid requests/responses

Although we support `Promise` and `AsyncIterator` bodies in order to support streaming use
cases, you can just use a `string`.

This is a perfectly fine `HttpResponse`:

```json
{
   "status": 200,
   "body": "Hello world"
}
```

### Zero dependencies (except in packages specific to those dependencies)



## Contributing

### Development loop

To run all tests from the root project:

```
yarn install
yarn run test
```

`yarn run test` in the root project runs both `test` and `test:browser` scripts
in all subprojects. 

See https://github.com/http4t/muppeteer for more on browser testing.

### Gotchas

In normal local development, you should never need to compile the typescript.

You'll get `ERR_UNKNOWN_FILE_EXTENSION` when you run the tests if there are compiled
`.js` files in any of the source directories.

To fix that, from the root run:

```
yarn run clean
```

### Creating a new module

Add new directory to root:

```
http4t-my-module
   src
      package.json
      tsconfig.json
   test
      package.json
      tsconfig.json
```

`http4t-my-module/src/package.json`:

Note dependency on `@http4t/core`.

```json
{
  "name": "@http4t/my-module",
  "version": "1.0.0",
  "license": "Apache-2.0",
  "type": "module",
  "scripts": {
    "build": "tsc --build"
  },
  "dependencies": {
    "@http4t/core": "1.0.0"
  }
}
```

`http4t-my-module/src/tsconfig.json`:

Note reference to `@http4t/core` source.

```json
{
  "extends": "../../tsconfig-base.json",
  "references": [
    {
      "path": "../../http4t-core/src"
    }
  ]
}
```

`http4t-my-module/test/package.json`:

Note `name: "@http4t/my-module-test"`

```json
{
  "name": "@http4t/my-module-test",
  "version": "1.0.0",
  "license": "Apache-2.0",
  "type": "module",
  "scripts": {
    "build": "tsc --build",
    "test": "NODE_ENV=development mocha --experimental-specifier-resolution=node --loader=ts-node/esm --extensions ts,tsx --colors --exit  '**/*.test.ts'",
    "test:browser": "muppeteer"
  },
  "dependencies": {
    "@http4t/core": "1.0.0",
    "@http4t/muppeteer": "0.0.30",
    "@http4t/my-module": "1.0.0"
  },
  "devDependencies": {
    "@types/chai": "^4.1.7",
    "@types/mocha": "^10.0.1",
    "chai": "^4.1.7",
    "mocha": "^7.0.1"
  }
}
```

`http4t-my-module/test/tsconfig.json`:

Note reference to `@http4t/core` source.

```json
{
  "extends": "../../tsconfig-base.json",
  "references": [
    {
      "path": "../src"
    },
    {
      "path": "../../http4t-core/src"
    }
  ]
}
```
