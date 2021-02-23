import { Dic } from "./Dic/Dic";

export type abstraction = symbol;
export type dependencies = abstraction[];
export type lifeCycle = "singleton" | "transient";

// eslint-disable-next-line @typescript-eslint/ban-types
export type factory = Function;
export type intercept<R> = (_: { dic: Dic; concretion: R }) => R;
export type registerArgument<P extends unknown[], R> = {
    abstraction: abstraction;
    dependencies: dependencies;
    factory: (...args: P) => R;
    lifeCycle: lifeCycle;
    intercept?: intercept<R>[];
};
export type registration = {
    abstraction: abstraction;
    dependencies: dependencies;
    factory: factory;
    lifeCycle: lifeCycle;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    intercept: intercept<any>[];
    hasBeenMemoized: boolean;
};

export type registry = Map<abstraction, registration>;
export type memoizationTable = Map<abstraction, unknown>;

export type types = { [x: string]: symbol };
