export type ITYPES = { [x: string]: symbol };

export type DicCtor = new () => IDic;

export type IDic = {
    /**
     * @description
     * Maps abstractions to their corresponding registrations.
     */
    registry: Map<
        symbol,
        {
            abstraction: symbol;
            dependencies: symbol[];
            factory: Function;
            lifeCycle: "singleton" | "transient";
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            intercept: ((parameters: { dic: IDic; concretion: any }) => any)[];
        }
    >;
    /**
     * @description
     * All abstractions that have been `get`ed and have singleton lifecycle are
     * memoized in this memoization table.
     */
    memoizationTable: Map<symbol, unknown>;
    /**
     * @description
     * Deletes all the memoized values from the memoization table.
     */
    clearMemoizationTable: () => void;

    /**
     * @description
     * Adds a registration to the dic.
     */
    register: <P extends unknown[], R>(
        arg0: {
            abstraction: symbol;
            dependencies: symbol[];
            factory: (...args: P) => R;
            lifeCycle: "singleton" | "transient";
        },
        arg1?: {
            intercept?: ((parameters: { dic: IDic; concretion: R }) => R)[];
        }
    ) => void;

    /**
     * @description
     * Deletes the registration of the provided abstraction from the registry.
     * It returns `true` if the abstraction registration was found and got
     * deleted, and `false` if it was not found.
     */
    unregister: (parameters: {
        /**
         * @description
         * Abstraction to unregister from the registry.
         */
        abstraction: symbol;
    }) => boolean;

    /**
     * @description
     * Returns the concretion of the provided abstraction.
     */
    get: <T>(parameters: {
        /**
         * @description
         * The abstraction for which you want to get the concretion. Make sure
         * that the symbol is defined with a name (e.g `Symbol("my-name")`) so
         * that more helpful error messages are given.
         */
        abstraction: symbol;
        /**
         * @description
         * Provide manual concretions to be injected when the abstraction
         * dependency graph is composed.
         *
         * The already memoized values override the provided injection values.
         */
        inject?: Map<symbol, unknown>;
    }) => T;
};
