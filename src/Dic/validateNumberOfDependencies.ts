import { errorMessages } from "../errorMessages";

/**
 * @description
 * Throws error if the provided dependencies array has different length than the provided factory.
 */
export function validateNumberOfDependencies(dependencies: symbol[], factory: Function): void {
    if (factory.length !== dependencies.length) throw Error(errorMessages.inconsistentNumberOfDependencies(factory));
}
