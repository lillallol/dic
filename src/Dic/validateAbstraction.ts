import { logAndError } from "../es-utils/logAndError";

/**
 * @description
 * Throws error if the provided value is not of type symbol.
 */
export function validateAbstraction(abstraction: unknown): void {
    if (typeof abstraction !== "symbol") logAndError(_errorMessages.abstractionHasToBeASymbol(abstraction));
}

export const _errorMessages = {
    abstractionHasToBeASymbol: (abstraction: unknown): unknown[] => [
        "Provided abstraction",
        abstraction,
        "has to be a symbol",
    ],
};
