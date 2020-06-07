import {HttpHandler, HttpMessage} from "@http4t/core/contract";
import {get} from "@http4t/core/requests";
import {isFailure} from "@http4t/result";
import {HandlerFn, MessageLens, RouteFor, Routes, ValidApi} from "./routes";

/**
 * Creates a function that returns `lens.extract(message)`,
 * or throws `ResultError` if the result is a failure.
 */
function validator<TMessage extends HttpMessage, T>(
  lens: MessageLens<TMessage, T>):
  (message: TMessage) => Promise<T> {

  return async (message: TMessage): Promise<T> => {
    const result = await lens.get(message);
    if (isFailure(result))
      throw result.error;
    return result.value;
  }
}

export function routeClient<T extends HandlerFn>(
  route: RouteFor<T>,
  http: HttpHandler)
  : T {

  const f = async (value: any): Promise<any> => {
    return await route.request.set(get("/"), value)
      .then(http.handle)
      .then(validator(route.response));
  };

  return f as any;
}

export function buildClient<T extends ValidApi>(
  routes: Routes<T>,
  http: HttpHandler): T {
  return Object.entries(routes)
    .reduce((acc, [key, route]) => {
        acc[key as keyof T] = routeClient(route, http) as any;
        return acc;
      },
      {} as T);
}
