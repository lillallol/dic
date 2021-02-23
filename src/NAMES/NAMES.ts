import { types } from "../types";

/**
 * @description
 * Provide a singleton that maps names to abstractions to get back an identity function 
 * that provides intellisense and proper refactoring for the names of the singleton. 
 * 
 * The identity function is intended to be used for defining the names of the unit tests 
 * of the concretions.
 * 
 * In the following example, if you try to refactor the key of `TYPES` it will also change 
 * the name of the unit test:
 * 
 * @example
 * const TYPES = {
 *     myConcretion : Symbol()
 * }
 * const NAMES = namesFactory<typeof TYPES>();
 * // no need to manually write `myConcretion` due to intellisense
 * expect(NAMES("myConcretion")).toBe("myConcretion");
 */
export function namesFactory<T extends types>() {
    return <N extends keyof T>(name: N): N => name;
}
