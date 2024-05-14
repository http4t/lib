import {join} from "./Joined";
import {PathMatcher} from "./PathMatcher";
import {PathConsumer} from "./consumers";


export function path<Path extends string>(path: Path): PathMatcher<PathArgs<Path>> ;

export function path<Path extends string>(path: Path, params: ParamConsumers<PathArgs<Path>>): PathMatcher<PathArgs<Path>>;

export function path<A, B>(a: PathMatcher<A>, b: PathMatcher<B>): PathMatcher<A & B>;

export function path<A, B, C>(a: PathMatcher<A>, b: PathMatcher<B>, c: PathMatcher<C>): PathMatcher<A & B & C>;

export function path<A, B, C, D>(a: PathMatcher<A>, b: PathMatcher<B>, c: PathMatcher<C>, d: PathMatcher<D>): PathMatcher<A & B & C & D>;

export function path<A, B, C, D, E>(a: PathMatcher<A>, b: PathMatcher<B>, c: PathMatcher<C>, d: PathMatcher<D>, e: PathMatcher<E>): PathMatcher<A & B & C & D & E>;

export function path<T extends object>(...segments: PathMatcher<T>[]): PathMatcher<T>;

export function path(
    first: string | PathMatcher,
    second?: ParamConsumers | PathMatcher,
    ...rest: PathMatcher[])
    : PathMatcher {

    if (typeof first === "string") return literal(first);
    if (typeof second === "function") return variablesPath(first as VariablePaths<T>, second);
    return join<T>(first as PathMatcher<T>, second as PathMatcher<T>, ...rest as PathMatcher<T>[]);
}


