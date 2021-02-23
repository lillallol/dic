import type { dependencies, factory } from "../types";
import { tagUnindent } from "../es-utils/tagUnindent";

/**
 * @description
 * Throws error if the provided dependencies array has different length than the provided factory.
 */
export function validateNumberOfDependencies(dependencies: dependencies, factory: factory): void {
    if (factory.length !== dependencies.length) throw Error(_errorMessages.inconsistentNumberOfDependencies(factory));

}

export const _errorMessages = {
    inconsistentNumberOfDependencies: (factory: factory): string => tagUnindent`
        Factory with name: ${factory.name} does not have the same number of
        dependencies as its registration.
    `
};
