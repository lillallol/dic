import { getRegistrationStrictOf } from "../Dic/getRegistrationStrictOf";
import type { IDic } from "../publicApi";
import { errorMessages } from "../errorMessages";

export function detectCycles(_: {
    dic: IDic;
    /**
     * @description
     * The abstractions that have their concretions exposed in the entry point of your program.
     */
    entryPointAbstractions: symbol[];
}): void {
    const { dic, entryPointAbstractions } = _;

    const hasNoCycles: Set<symbol> = new Set();
    const path: Set<symbol> = new Set();

    const hasNoChildren = (abstraction: symbol) => {
        return getDependencies(abstraction).length === 0;
    };
    const getDependencies = (abstraction: symbol) => getRegistrationStrictOf(dic.registry, abstraction).dependencies;

    entryPointAbstractions.forEach((abstraction) => {
        if (hasNoCycles.has(abstraction)) {
            return;
        }
        if (hasNoChildren(abstraction)) {
            hasNoCycles.add(abstraction);
            return;
        }
        path.add(abstraction);
        (function recurse(abstraction: symbol) {
            getDependencies(abstraction).forEach((abstraction) => {
                if (path.has(abstraction)) {
                    throw Error(errorMessages.dependencyGraphHasCycle(path, abstraction));
                }
                if (hasNoCycles.has(abstraction)) return;
                if (hasNoChildren(abstraction)) {
                    hasNoCycles.add(abstraction);
                    return;
                }
                path.add(abstraction);
                recurse(abstraction);
                path.delete(abstraction);
            });
        })(abstraction);
        path.delete(abstraction);
    });
}
