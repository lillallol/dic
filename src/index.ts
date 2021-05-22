import { Dic as _Dic } from "./Dic/Dic";
import { printDependencyGraph as _printDependencyGraph } from "./printDependencyTree/printDependencyGraph";
import { namesFactory as _namesFactory } from "./NAMES/NAMES";
import { validateDependencyGraph as _validateDependencyGraph } from "./validateDependencyGraph/validateDependencyGraph";

/**
 * @description
 * Dependency injection container constructor.
 */
export const Dic = _Dic;
/**
 * @description
 * It returns a string representation of the dependency graph starting from the
 * provided abstraction.
 */
export const printDependencyGraph = _printDependencyGraph;
/**
 * @description
 * Provide `TYPES` to get back an identity function that provides intellisense
 * for the keys of `TYPES`. This function can be used to have refactor-able
 * names in the specification of unit tests.
 */
export const namesFactory = _namesFactory;
/**
 * @description
 * It throws error when:
 *
 * * the dependency graph of the provided entry abstractions
 *   does not use all the registered abstractions
 * * `TYPES` has extra or missing abstractions
 * * there are cycles in the dependency graph
 *
 */
export const validateDependencyGraph = _validateDependencyGraph;
