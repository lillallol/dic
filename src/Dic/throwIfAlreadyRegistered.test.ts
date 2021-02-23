import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import type { registration } from "../types";
import { throwIfAlreadyRegistered, _errorMessages } from "./throwIfAlreadyRegistered";


describe(throwIfAlreadyRegistered.name, () => {
    it("throws when the provided registration is already registered", () => {
        const registry: Map<symbol, registration> = new Map();
        const abstraction = Symbol();
        const factoryRegistration: registration = {
            abstraction: abstraction,
            dependencies: [],
            factory: () => undefined,
            hasBeenMemoized: false,
            intercept: [],
            lifeCycle: "singleton",
        };
        registry.set(abstraction, factoryRegistration);
        expect(() => throwIfAlreadyRegistered(abstraction, registry)).toThrowError(
            arrayToErrorMessage(_errorMessages.abstractionAlreadyRegistered(abstraction))
        );
    });
    it("does not throw when the provided registration is not registered", () => {
        const registry: Map<symbol, registration> = new Map();
        const abstraction = Symbol();
        expect(() => throwIfAlreadyRegistered(abstraction, registry)).not.toThrow();
    });
});
