import { arrayToErrorMessage } from "../es-utils/arrayToErrorMessage";
import type { registration } from "../types";
import {  getRegistrationOf, _errorMessages } from "./getRegistrationOf";

describe(getRegistrationOf.name, () => {
    it("returns the registration of the provided abstraction", () => {
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
        expect(getRegistrationOf(registry, abstraction)).toBe(factoryRegistration);
    });
    it("throws when the provided abstraction is not registered", () => {
        const registry: Map<symbol, registration> = new Map();
        
        const abstraction = Symbol("my abstraction");
        expect(() => getRegistrationOf(registry, abstraction)).toThrow(
            arrayToErrorMessage(_errorMessages.abstractionNotRegisteredToDic(abstraction))
        );
    });
});
