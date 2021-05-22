import { DicCtor, IDic } from "../publicApi";
import { registry, memoizationTable, registration } from "../types";
import { getRegistrationStrictOf } from "./getRegistrationStrictOf";
import { throwIfAbstractionHasNoName } from "./throwIfAbstractionHasNoName";
import { throwIfAlreadyRegistered } from "./throwIfAlreadyRegistered";
import { throwIfFactoryHasNoName } from "./throwIfNotAppropriateFactory";
import { validateNumberOfDependencies } from "./validateNumberOfDependencies";

export const Dic: DicCtor = class Dic {
    registry: registry;
    memoizationTable: memoizationTable;

    constructor() {
        this.registry = new Map();
        this.memoizationTable = new Map();
    }

    clearMemoizationTable(): void {
        this.memoizationTable.forEach((_v, k) => {
            const registration = getRegistrationStrictOf(this.registry, k);
            this.memoizationTable.delete(registration.abstraction);
        });
    }

    register<P extends unknown[], R>(
        arg0: {
            abstraction: symbol;
            dependencies: symbol[];
            factory: (...args: P) => R;
            lifeCycle: "singleton" | "transient";
        },
        arg1?: {
            intercept?: ((parameters: { dic: IDic; concretion: R }) => R)[];
        }
    ): void {
        const { abstraction, factory, dependencies, lifeCycle } = arg0;
        if (arg1 === undefined) arg1 = {};
        const { intercept } = arg1;

        throwIfAbstractionHasNoName(abstraction);
        throwIfFactoryHasNoName(factory);
        throwIfAlreadyRegistered(abstraction, this.registry);
        validateNumberOfDependencies(dependencies, factory);

        this.registry.set(abstraction, {
            abstraction: abstraction,
            factory: factory,
            dependencies: dependencies,
            lifeCycle: lifeCycle,
            intercept: intercept ?? [],
        });
    }

    unregister(parameters: { abstraction: symbol }): boolean {
        const { abstraction } = parameters;
        return this.registry.delete(abstraction);
    }

    get<T>(parameters: { abstraction: symbol; inject?: Map<symbol, unknown> }): T {
        const { abstraction, inject } = parameters;
        const registration: registration = getRegistrationStrictOf(this.registry, abstraction);
        const { dependencies, lifeCycle } = registration;

        if (this.memoizationTable.has(abstraction)) {
            return this.memoizationTable.get(abstraction) as T;
        }
        const { factory, intercept } = registration;

        let valueToReturn: T = factory(
            ...dependencies.map((dependency: symbol) => {
                if (inject !== undefined && inject.has(dependency)) {
                    return inject.get(dependency);
                }
                return this.get({ abstraction: dependency, inject });
            })
        );

        valueToReturn = intercept.reduceRight((a, c) => c({ concretion: a, dic: this }), valueToReturn);

        if (lifeCycle === "singleton") {
            this.memoizationTable.set(abstraction, valueToReturn);
        }

        return valueToReturn;
    }
};
