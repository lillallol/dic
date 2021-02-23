import { logAndError } from "../es-utils/logAndError";

/**
 * @description
 * Throws error if the provided value is not an array with symbols.
 */
export function validateDependencies(dependencies: unknown): void {
    if (!Array.isArray(dependencies)) logAndError(_errorMessages.dependenciesHasToBeAnArray(dependencies));
    dependencies.forEach((l) => {
        if (typeof l !== "symbol") logAndError(_errorMessages.dependencyHasToBeASymbol(l));
    });
}

export const _errorMessages = {
    dependenciesHasToBeAnArray: (dependencies: unknown): unknown[] => [
        "Provided dependencies",
        dependencies,
        "has to be an array.",
    ],
    dependencyHasToBeASymbol: (dependency: unknown): unknown[] => [
        "Provided dependency",
        dependency,
        "has to be of type symbol.",
    ],
};
