import { registerArgument, registry, memoizationTable, abstraction, registration } from "../types";
import { getRegistrationOf } from "./getRegistrationOf";
import { throwIfAlreadyRegistered } from "./throwIfAlreadyRegistered";
import { throwIfNotAppropriateFactory } from "./throwIfNotAppropriateFactory";
import { validateAbstraction } from "./validateAbstraction";
import { validateDependencies } from "./validateDependencies";
import { validateIntercept } from "./validateIntercept";
import { validateLifeCycle } from "./validateLifeCycle";
import { validateNumberOfDependencies } from "./validateNumberOfDependencies";

/**
 * @description
 * Dependency injection container constructor.
 */
export class Dic {
    /**
     * @description
     * A map that maps each registered to dic, symbol, to its registration.
     * Use that only if you really know what you are doing.
     * @private
     */
    _registry: registry;
    /**
     * @description
     * All abstractions that have been `get`ed and have singleton lifecycle are memoized. The
     * memoization table, maps the abstraction to its value. You should manually add or remove abstractions
     * and memoized values in tests for mocking and spying in tests.
     * @private
     */
    _memoizationTable: memoizationTable;

    constructor() {
        this._registry = new Map();
        this._memoizationTable = new Map();
    }

    /**
     * @description
     * Run this function to delete all the memoized values for registrations with singleton lifecycle.
     */
    clearMemoizationTable(): void {
        this._memoizationTable.forEach((_v, k) => {
            const registration = getRegistrationOf(this._registry, k);
            const { hasBeenMemoized } = registration;
            if (hasBeenMemoized !== undefined) {
                registration.hasBeenMemoized = false;
            }
        });
        this._memoizationTable = new Map();
    }

    /**
     * @description
     * Registers a factory to the dic.
     */
    register<P extends unknown[], R extends unknown>(_: registerArgument<P, R>): void {
        const { abstraction, dependencies, lifeCycle, factory, intercept } = _;

        validateAbstraction(abstraction);
        validateDependencies(dependencies);
        throwIfNotAppropriateFactory(factory);
        validateLifeCycle(lifeCycle);
        if (intercept !== undefined) validateIntercept(intercept);
        throwIfAlreadyRegistered(abstraction, this._registry);
        validateNumberOfDependencies(dependencies, factory);

        this._registry.set(abstraction, {
            hasBeenMemoized: false,
            abstraction: abstraction,
            factory: factory,
            dependencies: dependencies,
            lifeCycle: lifeCycle,
            intercept: intercept ?? [],
        });
    }

    /**
     * @description
     * Deletes the registration of the provided abstraction from the registry.
     * It returns `true` if the abstraction registration was found and got deleted,
     * and false if it was not found.
     */
    unregister(_: {
        /**
         * @description
         * Abstraction to unregister from the registry.
         */
        abstraction: abstraction;
    }): boolean {
        const { abstraction } = _;
        return this._registry.delete(abstraction);
    }

    /**
     * @description
     * Returns the concretion of the provided abstraction.
     */
    get<T>(_: {
        /**
         * @description
         * The abstraction for which you want to get the concretion. Make sure that the symbol
         * is defined with a name (e.g `Symbol("my-name")`) so that more helpful error messages
         * are given.
         */
        abstraction: abstraction;
        /**
         * @description
         * Provide manual concretions to be injected when the abstraction
         * dependency graph is composed.
         *
         * The already memoized values override the provided injection values.
         */
        inject?: Map<symbol, unknown>;
    }): T {
        const { abstraction, inject } = _;
        const registration: registration = getRegistrationOf(this._registry, abstraction);

        const { hasBeenMemoized, dependencies, lifeCycle } = registration;

        if (hasBeenMemoized) {
            return this._memoizationTable.get(abstraction) as T;
        }
        const { factory, intercept } = registration;

        let valueToReturn = factory(
            ...dependencies.map((dependency) => {
                if (inject !== undefined && inject.has(dependency)) {
                    return inject.get(dependency);
                }
                return this.get({ abstraction: dependency, inject });
            })
        );

        if (intercept !== undefined) {
            valueToReturn = intercept.reduceRight((a, c) => c({ concretion: a, dic: this }), valueToReturn);
        }

        if (lifeCycle === "singleton") {
            registration.hasBeenMemoized = true;
            this._memoizationTable.set(abstraction, valueToReturn);
        }

        return valueToReturn;
    }
}
