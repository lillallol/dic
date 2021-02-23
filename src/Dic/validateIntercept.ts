import { logAndError } from "../es-utils/logAndError";

/**
 * @description
 * Throws error if the provided value is not of type function.
 */
export function validateIntercept(intercept: unknown): void {
    if (!Array.isArray(intercept)) logAndError(_errorMessages.interceptHasToBeAnArray(intercept));
    intercept.forEach((interceptChild) => {
        if (typeof interceptChild !== "function")
            logAndError(_errorMessages.interceptBadChild(intercept, interceptChild));
    });
}

export const _errorMessages = {
    interceptHasToBeAnArray: (intercept: unknown): unknown[] => [
        "Provided intercept",
        intercept,
        "has to be an array.",
    ],
    interceptBadChild: (intercept: unknown, nonFunctionChild: unknown): unknown[] => [
        "Provided intercept",
        intercept,
        "has to have all elements as functions but the following element",
        nonFunctionChild,
        "is not.",
    ],
};
