import { logAndError } from "../es-utils/logAndError";
import type { factory } from "../types";

/**
 * @description
 * Throws error if the provided value is not of type function of has undefined name.
 */
export function throwIfNotAppropriateFactory(factory: unknown): factory is factory {
    if (typeof factory !== "function") logAndError(_errorMessages.factoryHasToBeAFunction(factory));
    // this is because when I have the name of the factory I can give more helpful error messages
    if (factory.name === "") throw Error(_errorMessages.factoryCanNotBeFunctionWithNoName);
    return true;
}

export const _errorMessages = {
    factoryHasToBeAFunction: (factory: unknown): unknown[] => [
        "Provided factory",
        factory,
        "has to be of type function.",
    ],
    factoryCanNotBeFunctionWithNoName: "Factory can not be arrow function.",
};
