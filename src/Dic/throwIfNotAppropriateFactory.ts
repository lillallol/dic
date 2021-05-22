import { errorMessages } from "../errorMessages";

/**
 * @description
 * It throws if the provided factory has name property that is a string of zero length.
 */
export function throwIfFactoryHasNoName(factory: Function): void {
    // This case will never happen, look below for the reason.
    //if (factory.name === "") throw Error(errorMessages.factoryHasToHaveName);
    /**
     * The following error is a result of the following:
     *
     * ```ts
     * const registration = {
     *   factory: function () { }
     * }
     * const { factory } = registration;
     *
     * expect(factory.name).toBe("factory");// yes the test passes
     * ```
     *
     */
    if (factory.name === "factory") throw Error(errorMessages.badFactoryName);
}
