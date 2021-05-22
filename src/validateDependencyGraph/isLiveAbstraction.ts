import { getRegistrationStrictOf } from "../Dic/getRegistrationStrictOf";
import { validateNumberOfDependencies } from "../Dic/validateNumberOfDependencies";
import { IDic } from "../publicApi";

/**
 * @description
 * Returns a map.
 * If you provide the map with an abstraction that is not used by the entry points
 * you will get back `false`, else you will get `true`.
 */
export function isLiveAbstraction(_: {
    dic: IDic;
    entryPointAbstractions: symbol[];
    /**
     * @description
     * Abstraction to mark as non dead in the returned map.
     */
    ignoreAbstractions: symbol[];
}): Map<symbol, boolean> {
    const { dic, entryPointAbstractions, ignoreAbstractions } = _;

    const hasBeenIterated: Map<symbol, boolean> = new Map(
        [...dic.registry.entries()].map(([abstraction]) => [abstraction, false])
    );

    // just to check that the ignored abstractions are registered
    ignoreAbstractions.forEach((abstraction) => {
        getRegistrationStrictOf(dic.registry, abstraction);
        hasBeenIterated.set(abstraction, true);
    });

    entryPointAbstractions.forEach((entry) => {
        hasBeenIterated.set(entry, true);
        (function recurse(abstraction: symbol) {
            const { factory, dependencies } = getRegistrationStrictOf(dic.registry, abstraction);
            validateNumberOfDependencies(dependencies, factory);
            dependencies.forEach((abstraction) => {
                if (hasBeenIterated.get(abstraction)) return;
                else hasBeenIterated.set(abstraction, true);
                recurse(abstraction);
            });
        })(entry);
    });

    return hasBeenIterated;
}
